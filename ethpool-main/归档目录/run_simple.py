#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys

# 设置环境变量
if os.path.exists('.env'):
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("已加载 .env 文件")
    except ImportError:
        print("请安装 python-dotenv: pip install python-dotenv")
        sys.exit(1)

# 检查环境变量
token = os.getenv('TELEGRAM_BOT_TOKEN')
chat_id = os.getenv('TELEGRAM_CHAT_ID')

if not token:
    print("错误: 未设置 TELEGRAM_BOT_TOKEN")
    print("请在 .env 文件中设置: TELEGRAM_BOT_TOKEN=你的Token")
    sys.exit(1)

if not chat_id:
    print("错误: 未设置 TELEGRAM_CHAT_ID")
    print("请在 .env 文件中设置: TELEGRAM_CHAT_ID=你的群组ID")
    sys.exit(1)

print(f"Token: {token[:20]}...")
print(f"Chat ID: {chat_id}")

# 启动机器人
try:
    from telegram_usdt_monitor import main
    main()
except KeyboardInterrupt:
    print("\n机器人已停止")
except Exception as e:
    print(f"启动失败: {e}")

