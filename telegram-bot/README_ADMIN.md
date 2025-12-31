# ETH Mining Admin Bot - Python 版本

这是一个与 `bot.js` 功能完全相同的 Python 版本的 Telegram 管理机器人。

## 功能特性

### 核心功能
1. **群组管理**
   - 上课/下课模式切换
   - 违禁内容检测和处理
   - 违禁次数统计

2. **鱼苗管理**
   - 查看鱼苗列表（分页）
   - 修改阈值
   - 杀鱼（设置阈值为0）
   - 管理员查询用户鱼苗

3. **代理管理**
   - 生成代理链接
   - 二维码生成
   - 代理信息查询
   - 收款地址设置

4. **管理员功能**
   - 设置管理员
   - 删除管理员
   - 查看管理员列表
   - 管理员权限验证

5. **区块链监控**
   - TRC (Tron) 网络监控
   - ERC (Ethereum) 网络监控
   - BSC (Binance Smart Chain) 网络监控
   - OKC (OKX Chain) 网络监控
   - GRC (Gnosis Chain) 网络监控
   - POL (Polygon) 网络监控

6. **USDT 管理**
   - 余额查询
   - 自动转账（阈值触发）
   - 手动转账
   - 分润计算

7. **授权通知**
   - 监控授权交易
   - 发送授权通知
   - 测试授权通知

8. **数据缓存系统**
   - 每3秒更新一次缓存
   - 内存缓存提高性能

## 项目结构

```
telegram-bot/
├── bot_admin.py           # 主程序入口
├── config.py              # 配置管理
├── database.py            # 数据库连接和缓存
├── handlers.py            # Telegram 命令处理
├── callbacks.py           # 按钮回调处理
├── blockchain/            # 区块链相关模块
│   ├── trc.py            # TRC 网络处理
│   ├── erc.py            # ERC 网络处理
│   ├── bsc.py            # BSC 网络处理
│   ├── okc.py            # OKC 网络处理
│   ├── grc.py            # GRC 网络处理
│   └── pol.py            # POL 网络处理
├── utils.py              # 工具函数
├── requirements_admin.txt # Python 依赖
└── README_ADMIN.md       # 本文档
```

## 安装和配置

### 1. 安装依赖

```bash
pip install -r requirements_admin.txt
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=your_database_host
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=your_database

# Telegram Bot Token（会在运行时从数据库 options 表读取）
# BOT_TOKEN=your_bot_token

# TronGrid API Key（会在运行时从数据库 options 表读取）
# TRONGRID_API_KEY=your_api_key
```

### 3. 数据库表结构

确保数据库包含以下表：
- `fish` - 鱼苗表
- `fish_browse` - 鱼苗浏览记录表
- `daili` - 代理表
- `daili_group` - 代理群组表
- `options` - 配置选项表
- `contract_permissions` - 合约权限表
- `admin_users` - 管理员表

### 4. 运行

```bash
python bot_admin.py
```

## 命令列表

### 用户命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `我的` / `我的鱼苗` / `鱼苗` / `鱼池` | 查看我的鱼苗列表 | `我的` |
| `代理` / `代理链接` / `链接` | 获取代理链接 | `代理` |
| `收款地址` | 查看收款地址 | `收款地址` |
| `规则` / `交易规则` | 查看交易规则 | `规则` |

### 管理员命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `上课` / `下课` | 切换群组模式 | `上课` |
| `修改阈值 <地址> <金额>` | 修改鱼苗阈值 | `修改阈值 Txxxxx 1000` |
| `杀鱼 <地址>` | 设置阈值为0 | `杀鱼 Txxxxx` |
| `自动阈值 <金额>` | 设置全局阈值 | `自动阈值 1000` |
| `收款地址 <地址>` | 设置收款地址 | `收款地址 Txxxxx` |
| `查看鱼苗 @username` | 查看指定用户的鱼苗 | `查看鱼苗 @testuser` |
| `设置管理员 <密码> <用户ID>` | 添加管理员 | `设置管理员 123456 123456789` |
| `删除管理员 <密码> <用户ID>` | 删除管理员 | `删除管理员 123456 123456789` |
| `管理员列表` | 查看所有管理员 | `管理员列表` |
| `测试授权通知 [链类型]` | 测试授权通知 | `测试授权通知 TRC` |

## 主要功能说明

### 1. 群组模式管理

- **上课模式**：限制群成员只能发送允许的命令和计算器表达式
- **下课模式**：允许所有消息

### 2. 鱼苗管理

- 支持分页查看（每页10条）
- 显示余额、阈值等信息
- 支持管理员查询任意用户的鱼苗

### 3. 区块链监控

- 实时监控所有配置的区块链网络
- 检测 USDT 转账和授权交易
- 自动发送通知到对应群组

### 4. 自动转账系统

- 当鱼苗余额超过阈值时自动转账
- 支持代理分润
- 支持多链转账

### 5. 数据缓存

- 所有数据库查询结果缓存在内存中
- 每3秒自动更新缓存
- 提高响应速度

## 与 bot.js 的对应关系

| bot.js 函数 | Python 模块/函数 | 说明 |
|------------|-----------------|------|
| `getTimeInfo()` | `utils.get_time_info()` | 获取时间信息 |
| `getSiteNameByDomain()` | `utils.get_site_name_by_domain()` | 域名映射 |
| `createDbPool()` | `database.DatabasePool` | 数据库连接池 |
| `startCacheUpdate()` | `database.CacheData.update()` | 缓存更新 |
| `initBot()` | `bot_admin.init_bot()` | 初始化机器人 |
| `setupBotHandlers()` | `handlers.setup_bot_handlers()` | 设置命令处理 |
| `setupCallbackHandlers()` | `callbacks.setup_callback_handlers()` | 设置回调处理 |
| `checkBalance()` | `blockchain.trc.check_balance()` | 查询余额 |
| `scanBlock()` | `blockchain.trc.scan_block()` | 扫描区块 |
| `processTRCTransfer()` | `blockchain.trc.process_transfer()` | 处理转账 |
| `monitorFishTable()` | `monitors.monitor_fish_table()` | 监控鱼池 |

## 部署到 Cloudflare Workers

由于 Cloudflare Workers 不支持长时间运行的 Python 进程，建议部署到：

1. **Railway** - 推荐，支持 Python 长时间运行
2. **Render** - 免费层有限制
3. **Heroku** - 需要付费
4. **VPS** - 自建服务器

如果需要部署到 Cloudflare Workers，需要使用 Webhook 模式，并将监控任务分离到外部服务。

## 注意事项

1. **数据库连接**：使用连接池管理数据库连接
2. **错误处理**：所有网络请求都有重试机制
3. **限流处理**：检测到限流错误时自动等待
4. **线程安全**：使用 asyncio 锁保护共享资源
5. **日志记录**：所有操作都有详细日志

## 许可证

与原 bot.js 相同



