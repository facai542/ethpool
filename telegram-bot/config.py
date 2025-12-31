"""
ETH Mining Bot Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot Token
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')

# API Configuration
API_BASE_URL = os.getenv('API_BASE_URL', 'https://your-vercel-domain.vercel.app')

# Supabase Configuration
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')

# Exchange Rate
ETH_TO_USDT_RATE = 4480.37
EXCHANGE_FEE = 0.005  # 0.5%
MIN_EXCHANGE_ETH = 0.001

# Bot Messages (Multi-language)
MESSAGES = {
    'en': {
        'welcome': 'Welcome to ETH Mining Bot!\n\nCommands:\n/balance - Check balance\n/exchange - Exchange ETH to USDT\n/withdraw - Withdraw USDT\n/earnings - View earnings\n/help - Help',
        'no_wallet': 'Please bind your wallet first. Use /bind <wallet_address>',
        'balance_title': 'Your Balance',
        'eth_balance': 'ETH Balance',
        'usdt_balance': 'USDT Balance',
        'withdrawable': 'Withdrawable',
        'total_earnings': 'Total Earnings',
        'exchange_success': 'Exchange successful!',
        'exchange_failed': 'Exchange failed',
        'insufficient_balance': 'Insufficient balance',
        'withdraw_success': 'Withdrawal request submitted!',
        'withdraw_failed': 'Withdrawal failed',
        'invalid_amount': 'Invalid amount',
        'min_amount': 'Minimum amount is',
    },
    'zh': {
        'welcome': '欢迎使用 ETH 挖矿机器人!\n\n命令:\n/balance - 查看余额\n/exchange - 兑换 ETH 到 USDT\n/withdraw - 提现 USDT\n/earnings - 查看收益\n/help - 帮助',
        'no_wallet': '请先绑定钱包地址。使用 /bind <钱包地址>',
        'balance_title': '您的余额',
        'eth_balance': 'ETH 余额',
        'usdt_balance': 'USDT 余额',
        'withdrawable': '可提现',
        'total_earnings': '总收益',
        'exchange_success': '兑换成功!',
        'exchange_failed': '兑换失败',
        'insufficient_balance': '余额不足',
        'withdraw_success': '提现请求已提交!',
        'withdraw_failed': '提现失败',
        'invalid_amount': '无效金额',
        'min_amount': '最小金额为',
    }
}

def get_message(key: str, lang: str = 'en') -> str:
    """Get message by key and language"""
    return MESSAGES.get(lang, MESSAGES['en']).get(key, MESSAGES['en'].get(key, key))



