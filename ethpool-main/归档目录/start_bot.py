#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动机器人脚本
"""

import os
import sys
import subprocess
from pathlib import Path

# 设置控制台编码
if sys.platform == "win32":
    import codecs
    sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
    sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

def install_requirements():
    """安装依赖"""
    print("📦 安装 Python 依赖...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ 依赖安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖安装失败: {e}")
        return False

def check_env_file():
    """检查环境变量文件"""
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ 未找到 .env 文件")
        print("请创建 .env 文件并添加以下内容:")
        print("TELEGRAM_BOT_TOKEN=你的Bot_Token")
        print("TELEGRAM_CHAT_ID=你的群组ID")
        print("ETH_RPC_URL=https://eth.llamarpc.com")
        return False
    
    print("✅ 找到 .env 文件")
    return True

def load_env_vars():
    """加载环境变量"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        # 检查必要的环境变量
        token = os.getenv('TELEGRAM_BOT_TOKEN')
        chat_id = os.getenv('TELEGRAM_CHAT_ID')
        
        if not token:
            print("❌ 未设置 TELEGRAM_BOT_TOKEN")
            return False
        if not chat_id:
            print("❌ 未设置 TELEGRAM_CHAT_ID")
            return False
            
        print(f"✅ TELEGRAM_BOT_TOKEN: {token[:20]}...")
        print(f"✅ TELEGRAM_CHAT_ID: {chat_id}")
        return True
        
    except ImportError:
        print("❌ 未安装 python-dotenv")
        return False
    except Exception as e:
        print(f"❌ 加载环境变量失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 启动 USDT 监控机器人...")
    print("=" * 50)
    
    # 1. 检查 .env 文件
    if not check_env_file():
        return
    
    # 2. 安装依赖
    if not install_requirements():
        return
    
    # 3. 加载环境变量
    if not load_env_vars():
        return
    
    print("\n✅ 所有检查通过，启动机器人...")
    print("=" * 50)
    
    # 4. 启动机器人
    try:
        from telegram_usdt_monitor import main as bot_main
        bot_main()
    except KeyboardInterrupt:
        print("\n👋 机器人已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")

if __name__ == "__main__":
    main()
