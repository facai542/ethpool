#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sqlite3
from web3 import Web3
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 配置
ETH_RPC_URL = os.getenv('ETH_RPC_URL', 'https://eth.llamarpc.com')
USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
DATABASE_FILE = 'monitor_addresses.db'

def add_address_manually(address, remark=''):
    """手动添加地址到数据库"""
    try:
        # 验证地址
        w3 = Web3(Web3.HTTPProvider(ETH_RPC_URL))
        if not w3.is_address(address):
            print(f"错误: 地址格式无效 - {address}")
            return False
            
        # 添加到数据库
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        # 创建表（如果不存在）
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS monitor_addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                address TEXT UNIQUE NOT NULL,
                remark TEXT DEFAULT '',
                added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # 插入地址
        cursor.execute('''
            INSERT OR REPLACE INTO monitor_addresses (address, remark, is_active)
            VALUES (?, ?, 1)
        ''', (w3.to_checksum_address(address), remark))
        
        conn.commit()
        conn.close()
        
        print(f"成功添加地址: {address}")
        print(f"备注: {remark}")
        return True
        
    except Exception as e:
        print(f"添加失败: {e}")
        return False

def list_addresses():
    """列出所有地址"""
    try:
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
        
        if not results:
            print("当前没有监听地址")
            return
            
        print("当前监听地址:")
        for i, row in enumerate(results, 1):
            print(f"{i}. {row[0]}")
            print(f"   备注: {row[1] or '无'}")
            print(f"   添加时间: {row[2]}")
            print()
            
    except Exception as e:
        print(f"查询失败: {e}")

if __name__ == "__main__":
    print("手动添加监听地址")
    print("=" * 30)
    
    # 添加指定地址
    address = "0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0"
    remark = "测试地址"
    
    if add_address_manually(address, remark):
        print("地址添加成功！")
    
    print("\n当前监听地址列表:")
    list_addresses()

