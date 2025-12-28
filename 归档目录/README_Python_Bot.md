# Python USDT 监控机器人

## 功能特性

- 🔍 实时监控 ETH 链上 USDT 转账交易
- 📝 支持自定义地址备注
- ➕ 动态添加/删除监听地址
- 📊 实时余额查询
- 🔔 Telegram 实时通知
- 💾 SQLite 数据库存储

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```bash
# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=你的Telegram_Bot_Token
TELEGRAM_CHAT_ID=你的群组ID

# ETH RPC 配置
ETH_RPC_URL=https://eth.llamarpc.com

# 数据库配置
DATABASE_FILE=monitor_addresses.db
```

### 3. 运行机器人

```bash
python telegram_usdt_monitor.py
```

## 使用方法

### 基本命令

- `/start` - 显示主菜单
- 发送地址格式：`地址 备注`
  - 例如：`0x1234567890123456789012345678901234567890 我的钱包`

### 功能菜单

1. **📋 查看监听地址** - 显示所有监听的地址和余额
2. **➕ 添加监听地址** - 添加新的监听地址
3. **🗑️ 删除监听地址** - 删除现有监听地址
4. **✏️ 修改备注** - 修改地址备注（开发中）
5. **📊 状态信息** - 查看机器人运行状态

## 部署到服务器

### 自动部署

```bash
python deploy_python_bot.py
```

### 手动部署

1. 上传文件到服务器
2. 安装依赖：`pip install -r requirements.txt`
3. 配置环境变量
4. 创建 systemd 服务文件
5. 启动服务

### 服务管理

```bash
# 查看状态
sudo systemctl status usdt-monitor-bot

# 查看日志
sudo journalctl -u usdt-monitor-bot -f

# 重启服务
sudo systemctl restart usdt-monitor-bot

# 停止服务
sudo systemctl stop usdt-monitor-bot
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | 是 |
| `TELEGRAM_CHAT_ID` | 群组或频道 ID | 是 |
| `ETH_RPC_URL` | ETH RPC 节点地址 | 否 |
| `DATABASE_FILE` | 数据库文件路径 | 否 |

### 数据库结构

```sql
CREATE TABLE monitor_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT UNIQUE NOT NULL,
    remark TEXT DEFAULT '',
    added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

## 通知格式

### 收入通知
```
📥 收入 USDT

💰 钱包余额: 123.45 USDT
👤 用户钱包: 0x1234...5678
📝 用户备注: 我的钱包
💸 订单金额: 10.00 USDT
⏰ 交易时间: 2024-01-01 12:00:00
🔗 交易对象: 0xabcd...efgh
📊 执行操作: 客户收入
🔖 交易哈希: 0x1234567890abcdef...
📦 区块高度: 19000000
```

### 支出通知
```
📤 支出 USDT

💰 钱包余额: 113.45 USDT
👤 用户钱包: 0x1234...5678
📝 用户备注: 我的钱包
💸 订单金额: 10.00 USDT
⏰ 交易时间: 2024-01-01 12:00:00
🔗 交易对象: 0xabcd...efgh
📊 执行操作: 客户支出
🔖 交易哈希: 0x1234567890abcdef...
📦 区块高度: 19000000
```

## 技术架构

- **Web3.py** - 与以太坊区块链交互
- **python-telegram-bot** - Telegram Bot API
- **SQLite** - 本地数据库存储
- **asyncio** - 异步处理
- **systemd** - 系统服务管理

## 监控原理

1. 每30秒检查一次最新区块
2. 获取区块范围内的 USDT Transfer 事件
3. 过滤出涉及监听地址的交易
4. 发送 Telegram 通知

## 注意事项

1. 确保 RPC 节点稳定可靠
2. 定期备份数据库文件
3. 监控机器人运行状态
4. 注意 RPC 调用频率限制

## 故障排除

### 常见问题

1. **机器人无响应**
   - 检查 Token 是否正确
   - 检查网络连接
   - 查看日志文件

2. **收不到通知**
   - 检查地址格式
   - 确认地址已添加
   - 检查 RPC 连接

3. **数据库错误**
   - 检查文件权限
   - 确认磁盘空间
   - 重新初始化数据库

### 日志查看

```bash
# 实时日志
sudo journalctl -u usdt-monitor-bot -f

# 历史日志
sudo journalctl -u usdt-monitor-bot --since "1 hour ago"
```

## 开发说明

### 添加新功能

1. 在 `TelegramBot` 类中添加新方法
2. 注册新的处理器
3. 更新菜单按钮
4. 测试功能

### 自定义通知格式

修改 `send_transaction_notification` 方法中的消息模板。

### 添加新的区块链支持

1. 修改 `USDTMonitor` 类
2. 更新合约 ABI
3. 调整事件处理逻辑

