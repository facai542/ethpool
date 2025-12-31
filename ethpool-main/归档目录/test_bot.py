#!/usr/bin/env python3
"""
测试机器人功能
"""

import os
import sys
from pathlib import Path

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

# 设置环境变量
if Path(".env").exists():
    from dotenv import load_dotenv
    load_dotenv()

def test_database():
    """测试数据库功能"""
    print("🧪 测试数据库功能...")
    
    from telegram_usdt_monitor import USDTMonitor
    
    monitor = USDTMonitor()
    
    # 测试添加地址
    test_address = "0x1234567890123456789012345678901234567890"
    test_remark = "测试地址"
    
    print(f"添加测试地址: {test_address}")
    success = monitor.add_address(test_address, test_remark)
    print(f"添加结果: {'成功' if success else '失败'}")
    
    # 测试获取地址列表
    addresses = monitor.get_active_addresses()
    print(f"当前监听地址数量: {len(addresses)}")
    
    for addr in addresses:
        print(f"  - {addr['address']} ({addr['remark']})")
    
    # 测试删除地址
    print(f"删除测试地址: {test_address}")
    success = monitor.remove_address(test_address)
    print(f"删除结果: {'成功' if success else '失败'}")
    
    print("✅ 数据库测试完成")

def test_web3_connection():
    """测试 Web3 连接"""
    print("🧪 测试 Web3 连接...")
    
    from telegram_usdt_monitor import USDTMonitor
    
    monitor = USDTMonitor()
    
    # 测试获取最新区块
    latest_block = monitor.get_latest_block()
    print(f"最新区块号: {latest_block}")
    
    if latest_block > 0:
        print("✅ Web3 连接正常")
    else:
        print("❌ Web3 连接失败")
    
    # 测试获取 USDT 余额
    test_address = "0xdAC17F958D2ee523a2206206994597C13D831ec7"  # USDT 合约地址
    balance = monitor.get_usdt_balance(test_address)
    print(f"USDT 合约余额: {balance} USDT")
    
    print("✅ Web3 测试完成")

def test_telegram_connection():
    """测试 Telegram 连接"""
    print("🧪 测试 Telegram 连接...")
    
    import requests
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        print("❌ 缺少 Telegram 配置")
        return
    
    # 测试发送消息
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': '🧪 机器人连接测试'
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print("✅ Telegram 连接正常")
        else:
            print(f"❌ Telegram 连接失败: {response.status_code}")
    except Exception as e:
        print(f"❌ Telegram 连接错误: {e}")
    
    print("✅ Telegram 测试完成")

def main():
    """主测试函数"""
    print("🚀 开始测试 USDT 监控机器人...")
    print("=" * 50)
    
    # 测试数据库
    test_database()
    print()
    
    # 测试 Web3 连接
    test_web3_connection()
    print()
    
    # 测试 Telegram 连接
    test_telegram_connection()
    print()
    
    print("=" * 50)
    print("🎉 所有测试完成！")

if __name__ == "__main__":
    main()

