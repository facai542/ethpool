#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import time
import logging
import sqlite3
from datetime import datetime
from typing import Dict, List
import asyncio
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
from web3 import Web3

# 加载环境变量
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("已加载 .env 文件")
except ImportError:
    print("请安装 python-dotenv: pip install python-dotenv")
    exit(1)

# 配置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# 配置
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
TELEGRAM_CHAT_ID = os.getenv('TELEGRAM_CHAT_ID')
ETH_RPC_URL = os.getenv('ETH_RPC_URL', 'https://eth.llamarpc.com')
USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
DATABASE_FILE = 'monitor_addresses.db'

# USDT ABI
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
            return balance / 1e6
        except Exception as e:
            logger.error(f"获取余额失败: {e}")
            return 0.0

class TelegramBot:
    def __init__(self):
        self.monitor = USDTMonitor()
        
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """开始命令"""
        keyboard = [
            [InlineKeyboardButton("查看监听地址", callback_data="list_addresses")],
            [InlineKeyboardButton("添加监听地址", callback_data="add_address")],
            [InlineKeyboardButton("状态信息", callback_data="status")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "ETH实时动账监控\n\n"
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
        await update.message.reply_text("操作已取消")
        
    async def list_addresses(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """列出所有监听地址"""
        addresses = self.monitor.get_active_addresses()
        
        if not addresses:
            await update.callback_query.edit_message_text("当前没有监听地址")
            return
            
        text = "监听地址列表：\n\n"
        for i, addr in enumerate(addresses, 1):
            balance = self.monitor.get_usdt_balance(addr['address'])
            text += f"{i}. {addr['address']}\n"
            text += f"   备注: {addr['remark'] or '无'}\n"
            text += f"   余额: {balance:.2f} USDT\n\n"
            
        keyboard = [
            [InlineKeyboardButton("添加地址", callback_data="add_address")],
            [InlineKeyboardButton("返回主菜单", callback_data="main_menu")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
        
    async def add_address_prompt(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """添加地址提示"""
        context.user_data['waiting_for_address'] = True
        
        await update.callback_query.edit_message_text(
            "添加监听地址\n\n"
            "请发送要监听的地址，格式：\n"
            "`地址 备注`\n\n"
            "例如：\n"
            "`0x1234567890123456789012345678901234567890 我的钱包`\n\n"
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
        if not context.user_data.get('waiting_for_address'):
            return
            
        parts = text.split(' ', 1)
        address = parts[0]
        remark = parts[1] if len(parts) > 1 else ''
        
        if not self.monitor.w3.is_address(address):
            await update.message.reply_text("地址格式无效，请重新发送")
            return
            
        if self.monitor.add_address(address, remark):
            await update.message.reply_text(
                f"地址添加成功！\n\n"
                f"地址: `{address}`\n"
                f"备注: {remark or '无'}",
                parse_mode='Markdown'
            )
            context.user_data['waiting_for_address'] = False
        else:
            await update.message.reply_text("添加失败，请重试")
            
    async def status_info(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """状态信息"""
        addresses = self.monitor.get_active_addresses()
        
        text = f"机器人状态信息\n\n"
        text += f"监听地址数量: {len(addresses)}\n"
        text += f"当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        if addresses:
            text += "监听地址：\n"
            for addr in addresses[:5]:
                text += f"• {addr['address'][:10]}...\n"
            if len(addresses) > 5:
                text += f"• ... 还有 {len(addresses) - 5} 个地址\n"
                
        keyboard = [[InlineKeyboardButton("返回主菜单", callback_data="main_menu")]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)
        
    async def callback_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """处理回调查询"""
        query = update.callback_query
        data = query.data
        
        if data == "list_addresses":
            await self.list_addresses(update, context)
        elif data == "add_address":
            await self.add_address_prompt(update, context)
        elif data == "status":
            await self.status_info(update, context)
        elif data == "main_menu":
            await self.start_command(update, context)

def main():
    """主函数"""
    if not TELEGRAM_BOT_TOKEN:
        print("错误: 请设置 TELEGRAM_BOT_TOKEN 环境变量")
        return
        
    if not TELEGRAM_CHAT_ID:
        print("错误: 请设置 TELEGRAM_CHAT_ID 环境变量")
        return
        
    print(f"Token: {TELEGRAM_BOT_TOKEN[:20]}...")
    print(f"Chat ID: {TELEGRAM_CHAT_ID}")
    print("启动机器人...")
        
    # 创建应用
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # 创建机器人实例
    bot = TelegramBot()
    
    # 添加处理器
    application.add_handler(CommandHandler("start", bot.start_command))
    application.add_handler(CommandHandler("cancel", bot.cancel_command))
    application.add_handler(CallbackQueryHandler(bot.callback_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, bot.handle_address_input))
    
    # 启动机器人
    logger.info("启动 USDT 监控机器人...")
    application.run_polling()

if __name__ == "__main__":
    main()

