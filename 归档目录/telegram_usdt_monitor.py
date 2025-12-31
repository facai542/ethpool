#!/usr/bin/env python3
import os
import json
import time
import logging
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional
import asyncio
import aiohttp
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
from web3 import Web3
import requests

# 加载环境变量
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ 已加载 .env 文件")
except ImportError:
    print("⚠️ 未安装 python-dotenv，请运行: pip install python-dotenv")
except Exception as e:
    print(f"⚠️ 加载 .env 文件失败: {e}")

# 配置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 配置
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ETH_RPC_URL = os.getenv('ETH_RPC_URL', 'https://eth.llamarpc.com')
USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
DATABASE_FILE = 'monitor_addresses.db'

# USDT ABI (仅包含 Transfer 事件和 balanceOf 方法)
USDT_ABI = [
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "name": "from", "type": "address"},
            {"indexed": True, "name": "to", "type": "address"},
            {"indexed": False, "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "constant": True,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    }
]

class USDTMonitor:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))
        self.usdt_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(USDT_CONTRACT),
            abi=USDT_ABI
        )
        self.init_database()
        
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS monitor_addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT UNIQUE NOT NULL,
                remark TEXT DEFAULT '',
                added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        conn.commit()
        conn.close()
        
    def add_address(self, address: str, remark: str = '') -> bool:
        """添加监听地址"""
        try:
            # 验证地址格式
            if not self.w3.is_address(address):
                return False
                
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO monitor_addresses (address, remark, is_active)
                VALUES (?, ?, 1)
            ''', (Web3.to_checksum_address(address), remark))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"添加地址失败: {e}")
            return False
            
    def remove_address(self, address: str) -> bool:
        """删除监听地址"""
        try:
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE monitor_addresses 
                SET is_active = 0 
                WHERE address = ?
            ''', (Web3.to_checksum_address(address),))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"删除地址失败: {e}")
            return False
            
    def update_remark(self, address: str, remark: str) -> bool:
        """更新地址备注"""
        try:
            conn = sqlite3.connect(DATABASE_FILE)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE monitor_addresses 
                SET remark = ? 
                WHERE address = ? AND is_active = 1
            ''', (remark, Web3.to_checksum_address(address)))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            logger.error(f"更新备注失败: {e}")
            return False
            
    def get_active_addresses(self) -> List[Dict]:
        """获取所有活跃的监听地址"""
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT address, remark, added_time 
            FROM monitor_addresses 
            WHERE is_active = 1 
            ORDER BY added_time DESC
        ''')
        results = cursor.fetchall()
        conn.close()
        
        return [
            {
                'address': row[0],
                'remark': row[1],
                'added_time': row[2]
            }
            for row in results
        ]
        
    def get_usdt_balance(self, address: str) -> float:
        """获取地址的 USDT 余额"""
        try:
            balance = self.usdt_contract.functions.balanceOf(
                Web3.to_checksum_address(address)
            ).call()
            return balance / 1e6  # USDT 有 6 位小数
        except Exception as e:
            logger.error(f"获取余额失败: {e}")
            return 0.0
            
    def get_latest_block(self) -> int:
        """获取最新区块号"""
        try:
            return self.w3.eth.block_number
        except Exception as e:
            logger.error(f"获取最新区块失败: {e}")
            return 0
            
    def get_transfer_events(self, from_block: int, to_block: int) -> List[Dict]:
        """获取指定区块范围内的 Transfer 事件"""
        try:
            events = self.usdt_contract.events.Transfer.get_logs(
                fromBlock=from_block,
                toBlock=to_block
            )
            
            results = []
            for event in events:
                results.append({
                    'from': event['args']['from'],
                    'to': event['args']['to'],
                    'value': event['args']['value'] / 1e6,
                    'tx_hash': event['transactionHash'].hex(),
                    'block_number': event['blockNumber'],
                    'log_index': event['logIndex']
                })
            return results
        except Exception as e:
            logger.error(f"获取事件失败: {e}")
            return []

class TelegramBot:
    def __init__(self):
        self.monitor = USDTMonitor()
        self.last_checked_block = self.monitor.get_latest_block()
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """开始命令"""
        # 清除任何等待状态
        context.user_data['waiting_for_address'] = False
        
        keyboard = [
            [InlineKeyboardButton("查看监听地址", callback_data="list_addresses")],
            [InlineKeyboardButton("添加监听地址", callback_data="add_address")],
            [InlineKeyboardButton("状态信息", callback_data="status")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            " ETH实时动账监控\n\n"
            "功能：\n"
            "• 实时监控指定地址的 USDT 转账\n"
            "• 支持自定义备注\n"
            "• 支持添加/删除监听地址\n\n"
            "请选择操作：",
            reply_markup=reply_markup
        )
        
    async def cancel_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """取消命令"""
        context.user_data['waiting_for_address'] = False
        await update.message.reply_text(" 操作已取消")
        
    async def list_addresses(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """列出所有监听地址"""
        addresses = self.monitor.get_active_addresses()
        
        if not addresses:
            await update.callback_query.edit_message_text(" 当前没有监听地址")
            return
            
        text = " 监听地址列表：\n\n"
        for i, addr in enumerate(addresses, 1):
            balance = self.monitor.get_usdt_balance(addr['address'])
            text += f"{i}. {addr['address']}\n"
            text += f"   备注: {addr['remark'] or '无'}\n"
            text += f"   余额: {balance:.2f} USDT\n"
            text += f"   添加时间: {addr['added_time']}\n\n"
            
        keyboard = [
            [InlineKeyboardButton(" 添加地址", callback_data="add_address")],
            [InlineKeyboardButton(" 删除地址", callback_data="remove_address")],
            [InlineKeyboardButton(" 修改备注", callback_data="edit_remark")],
            [InlineKeyboardButton(" 返回主菜单", callback_data="main_menu")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
        
    async def add_address_prompt(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """添加地址提示"""
        # 设置等待地址输入状态
        context.user_data['waiting_for_address'] = True
        
        await update.callback_query.edit_message_text(
            "➕ 添加监听地址\n\n"
            "请发送要监听的地址，格式：\n"
            "`地址 备注`\n\n"
            "例如：\n"
            "`0x1234567890123456789012345678901234567890 我的钱包`\n\n"
            "或者只发送地址：\n"
            "`0x1234567890123456789012345678901234567890`\n\n"
            "发送 /cancel 取消操作",
            parse_mode='Markdown'
        )
        
    async def handle_address_input(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理地址输入"""
        text = update.message.text.strip()
        
        # 检查是否是命令
        if text.startswith('/'):
            return
            
        # 检查是否在等待地址输入状态
        if not hasattr(context, 'user_data') or not context.user_data.get('waiting_for_address'):
            return
            
        parts = text.split(' ', 1)
        address = parts[0]
        remark = parts[1] if len(parts) > 1 else ''
        
        if not self.monitor.w3.is_address(address):
            await update.message.reply_text(" 地址格式无效，请重新发送")
            return
            
        if self.monitor.add_address(address, remark):
            await update.message.reply_text(
                f" 地址添加成功！\n\n"
                f"地址: `{address}`\n"
                f"备注: {remark or '无'}",
                parse_mode='Markdown'
            )
            # 清除等待状态
            context.user_data['waiting_for_address'] = False
        else:
            await update.message.reply_text(" 添加失败，请重试")
            
    async def remove_address_prompt(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """删除地址提示"""
        addresses = self.monitor.get_active_addresses()
        
        if not addresses:
            await update.callback_query.edit_message_text(" 当前没有监听地址")
            return
            
        keyboard = []
        for addr in addresses:
            keyboard.append([
                InlineKeyboardButton(
                    f" {addr['address'][:10]}...",
                    callback_data=f"remove_{addr['address']}"
                )
            ])
        keyboard.append([InlineKeyboardButton("🔙 返回", callback_data="list_addresses")])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.callback_query.edit_message_text(
            " 选择要删除的地址：",
            reply_markup=reply_markup
        )
        
    async def confirm_remove(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """确认删除地址"""
        address = update.callback_query.data.replace('remove_', '')
        
        if self.monitor.remove_address(address):
            await update.callback_query.edit_message_text(
                f" 地址已删除：\n`{address}`",
                parse_mode='Markdown'
            )
        else:
            await update.callback_query.edit_message_text(" 删除失败")
            
    async def status_info(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """状态信息"""
        addresses = self.monitor.get_active_addresses()
        latest_block = self.monitor.get_latest_block()
        
        text = f" 机器人状态信息\n\n"
        text += f" 当前区块: {latest_block}\n"
        text += f" 监听地址数量: {len(addresses)}\n"
        text += f" 最后检查: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        if addresses:
            text += " 监听地址：\n"
            for addr in addresses[:5]:  # 只显示前5个
                text += f"• {addr['address'][:10]}...\n"
            if len(addresses) > 5:
                text += f"• ... 还有 {len(addresses) - 5} 个地址\n"
                
        keyboard = [[InlineKeyboardButton("🔙 返回主菜单", callback_data="main_menu")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
        
    async def check_transactions(self):
        """检查新交易"""
        current_block = self.monitor.get_latest_block()
        
        if current_block <= self.last_checked_block:
            return
            
        logger.info(f"检查区块 {self.last_checked_block + 1} 到 {current_block}")
        
        # 获取新的事件
        events = self.monitor.get_transfer_events(
            self.last_checked_block + 1,
            current_block
        )
        
        # 获取监听地址列表
        addresses = self.monitor.get_active_addresses()
        monitored_addresses = {addr['address'].lower() for addr in addresses}
        
        # 处理相关事件
        for event in events:
            from_addr = event['from'].lower()
            to_addr = event['to'].lower()
            
            # 检查是否涉及监听地址
            if from_addr in monitored_addresses or to_addr in monitored_addresses:
                await self.send_transaction_notification(event, addresses)
                
        self.last_checked_block = current_block
        
    async def send_transaction_notification(self, event: Dict, addresses: List[Dict], bot_instance=None):
        """发送交易通知"""
        from_addr = event['from']
        to_addr = event['to']
        value = event['value']
        tx_hash = event['tx_hash']
        block_number = event['block_number']
        
        # 找到相关地址的备注
        from_remark = ""
        to_remark = ""
        
        for addr in addresses:
            if addr['address'].lower() == from_addr.lower():
                from_remark = addr['remark']
            if addr['address'].lower() == to_addr.lower():
                to_remark = addr['remark']
                
        # 判断是转入还是转出
        is_incoming = to_addr.lower() in {addr['address'].lower() for addr in addresses}
        
        if is_incoming:
            action = "🟢 收入 USDT"
            target_addr = to_addr
            target_remark = to_remark
        else:
            action = "🔴 支出 USDT"
            target_addr = from_addr
            target_remark = from_remark
            
        # 获取余额
        balance = self.monitor.get_usdt_balance(target_addr)
        
        # 构建消息
        message = f"{action}\n\n"
        message += f"钱包余额: {balance:.2f} USDT\n"
        message += f"用户钱包: `{target_addr}`\n"
        message += f"用户备注: {target_remark or '无'}\n"
        message += f"订单金额: {value:.2f} USDT\n"
        message += f"交易时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
        message += f"交易对象: `{from_addr if is_incoming else to_addr}`\n"
        message += f"执行操作: 客户{'收入' if is_incoming else '支出'}\n"
        message += f"交易哈希: `{tx_hash}`\n"
        message += f"区块高度: {block_number}"
        
        # 发送消息到群组
        chat_id = os.getenv('TELEGRAM_CHAT_ID')
        if chat_id and bot_instance:
            try:
                await bot_instance.send_message(
                    chat_id=chat_id,
                    text=message,
                    parse_mode='Markdown'
                )
                logger.info(f"交易通知已发送到 {chat_id}")
            except Exception as e:
                logger.error(f"发送消息失败: {e}")
        else:
            logger.warning("未配置群组ID或Bot实例")
                    
    async def callback_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理回调查询"""
        query = update.callback_query
        data = query.data
        
        if data == "list_addresses":
            await self.list_addresses(update, context)
        elif data == "add_address":
            await self.add_address_prompt(update, context)
        elif data == "remove_address":
            await self.remove_address_prompt(update, context)
        elif data == "edit_remark":
            await query.edit_message_text("✏️ 修改备注功能开发中...")
        elif data == "status":
            await self.status_info(update, context)
        elif data == "main_menu":
            await self.start_command(update, context)
        elif data.startswith("remove_"):
            await self.confirm_remove(update, context)
            
    async def periodic_check(self):
        """定期检查交易"""
        while True:
            try:
                await self.check_transactions()
            except Exception as e:
                logger.error(f"检查交易失败: {e}")
            await asyncio.sleep(30)  # 每30秒检查一次

def main():
    """主函数"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("请设置 TELEGRAM_BOT_TOKEN 环境变量")
        return
        
    # 创建应用
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # 创建机器人实例
    bot = TelegramBot()
    
    # 添加处理器
    application.add_handler(CommandHandler("start", bot.start_command))
    application.add_handler(CommandHandler("cancel", bot.cancel_command))
    application.add_handler(CallbackQueryHandler(bot.callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, bot.handle_address_input))
    
    # 启动定期检查任务
    async def check_transactions_job(context):
        await bot.check_transactions()
    
    application.job_queue.run_repeating(
        check_transactions_job,
        interval=30,
        first=10
    )
    
    # 启动机器人
    logger.info("启动 USDT 监控机器人...")
    application.run_polling()

if __name__ == "__main__":
    main()
