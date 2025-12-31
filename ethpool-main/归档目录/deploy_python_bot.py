#!/usr/bin/env python3
"""
Python USDT 监控机器人部署脚本
"""

import os
import subprocess
import sys
from pathlib import Path

def install_requirements():
    """安装依赖"""
    print("📦 安装 Python 依赖...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
        print("✅ 依赖安装完成")
    except subprocess.CalledProcessError as e:
        print(f"❌ 依赖安装失败: {e}")
        return False
    return True

def setup_environment():
    """设置环境变量"""
    print("🔧 设置环境变量...")
    
    # 检查 .env 文件
    if not Path(".env").exists():
        print("⚠️ 未找到 .env 文件，请复制 .env.example 并配置")
        print("需要配置的变量:")
        print("- TELEGRAM_BOT_TOKEN")
        print("- TELEGRAM_CHAT_ID")
        print("- ETH_RPC_URL (可选)")
        return False
    
    # 加载环境变量
    from dotenv import load_dotenv
    load_dotenv()
    
    # 检查必要的环境变量
    required_vars = ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ 缺少环境变量: {', '.join(missing_vars)}")
        return False
    
    print("✅ 环境变量配置完成")
    return True

def create_systemd_service():
    """创建 systemd 服务文件"""
    service_content = f"""[Unit]
Description=USDT Monitor Telegram Bot
After=network.target

[Service]
Type=simple
User={os.getenv('USER', 'ubuntu')}
WorkingDirectory={os.getcwd()}
ExecStart={sys.executable} telegram_usdt_monitor.py
Restart=always
RestartSec=10
Environment=PYTHONPATH={os.getcwd()}

[Install]
WantedBy=multi-user.target
"""
    
    service_file = "/etc/systemd/system/usdt-monitor-bot.service"
    
    try:
        with open(service_file, 'w') as f:
            f.write(service_content)
        print(f"✅ 服务文件已创建: {service_file}")
        return True
    except PermissionError:
        print(f"⚠️ 需要 sudo 权限创建服务文件: {service_file}")
        print("请手动创建服务文件或使用其他方式运行")
        return False

def start_service():
    """启动服务"""
    try:
        subprocess.run(["sudo", "systemctl", "daemon-reload"], check=True)
        subprocess.run(["sudo", "systemctl", "enable", "usdt-monitor-bot"], check=True)
        subprocess.run(["sudo", "systemctl", "start", "usdt-monitor-bot"], check=True)
        print("✅ 服务已启动")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 启动服务失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 开始部署 USDT 监控机器人...")
    
    # 1. 安装依赖
    if not install_requirements():
        return
    
    # 2. 设置环境变量
    if not setup_environment():
        return
    
    # 3. 创建服务文件
    create_systemd_service()
    
    # 4. 启动服务
    start_service()
    
    print("\n🎉 部署完成！")
    print("\n管理命令:")
    print("查看状态: sudo systemctl status usdt-monitor-bot")
    print("查看日志: sudo journalctl -u usdt-monitor-bot -f")
    print("重启服务: sudo systemctl restart usdt-monitor-bot")
    print("停止服务: sudo systemctl stop usdt-monitor-bot")

if __name__ == "__main__":
    main()

