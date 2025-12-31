#!/usr/bin/env python3
"""
简化版运行脚本
"""

import os
import sys
from pathlib import Path

# 添加当前目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent))

# 设置环境变量（如果存在 .env 文件）
if Path(".env").exists():
    from dotenv import load_dotenv
    load_dotenv()

# 检查必要的环境变量
required_vars = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print(f"❌ 缺少环境变量: {', '.join(missing_vars)}")
    print("请设置以下环境变量:")
    for var in missing_vars:
        print(f"  export {var}=你的值")
    sys.exit(1)

# 导入并运行主程序
try:
    from telegram_usdt_monitor import main
    main()
except KeyboardInterrupt:
    print("\n👋 机器人已停止")
except Exception as e:
    print(f"❌ 运行错误: {e}")
    sys.exit(1)

