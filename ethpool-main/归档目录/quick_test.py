#!/usr/bin/env python3
"""
快速测试机器人
"""

import os
import sys
from pathlib import Path

# 设置环境变量
if Path(".env").exists():
    from dotenv import load_dotenv
    load_dotenv()

def test_environment():
    """测试环境变量"""
    print("🧪 测试环境变量...")
    
    required_vars = {
        'TELEGRAM_BOT_TOKEN': os.getenv('TELEGRAM_BOT_TOKEN'),
        'TELEGRAM_CHAT_ID': os.getenv('TELEGRAM_CHAT_ID'),
        'ETH_RPC_URL': os.getenv('ETH_RPC_URL', 'https://eth.llamarpc.com')
    }
    
    for var, value in required_vars.items():
        if value:
            print(f"✅ {var}: {value[:20]}..." if len(str(value)) > 20 else f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: 未设置")
    
    return all(required_vars.values())

def test_web3_connection():
    """测试 Web3 连接"""
    print("\n🧪 测试 Web3 连接...")
    
    try:
        from web3 import Web3
        w3 = Web3(Web3.HTTPProvider(os.getenv('ETH_RPC_URL', 'https://eth.llamarpc.com')))
        
        if w3.is_connected():
            latest_block = w3.eth.block_number
            print(f"✅ Web3 连接成功，最新区块: {latest_block}")
            return True
        else:
            print("❌ Web3 连接失败")
            return False
    except Exception as e:
        print(f"❌ Web3 连接错误: {e}")
        return False

def test_telegram_connection():
    """测试 Telegram 连接"""
    print("\n🧪 测试 Telegram 连接...")
    
    try:
        import requests
        
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_CHAT_ID')
        
        if not bot_token or not chat_id:
            print("❌ 缺少 Telegram 配置")
            return False
        
        # 测试发送消息
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': '🧪 机器人连接测试'
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print("✅ Telegram 连接成功")
            return True
        else:
            print(f"❌ Telegram 连接失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Telegram 连接错误: {e}")
        return False

def main():
    """主测试函数"""
    print("🚀 快速测试 USDT 监控机器人...")
    print("=" * 50)
    
    # 测试环境变量
    env_ok = test_environment()
    
    # 测试 Web3 连接
    web3_ok = test_web3_connection()
    
    # 测试 Telegram 连接
    telegram_ok = test_telegram_connection()
    
    print("\n" + "=" * 50)
    
    if env_ok and web3_ok and telegram_ok:
        print("🎉 所有测试通过！可以运行机器人了")
        print("\n运行命令:")
        print("python simple_bot.py")
    else:
        print("❌ 部分测试失败，请检查配置")
        
        if not env_ok:
            print("- 检查环境变量配置")
        if not web3_ok:
            print("- 检查 ETH_RPC_URL 配置")
        if not telegram_ok:
            print("- 检查 Telegram Bot Token 和 Chat ID")

if __name__ == "__main__":
    main()

