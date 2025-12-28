# Moralis Stream 手动配置指南

## 问题
地址 0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0 没有收到USDT交易通知

## 原因
Moralis Stream 未正确配置或地址未添加到监听列表

---

## 立即解决方案

### 步骤 1: 访问 Moralis Dashboard

访问: https://admin.moralis.io/streams

使用你的 Moralis 账户登录

### 步骤 2: 创建或编辑 Stream

如果 Stream 不存在，点击 "Create New Stream"

如果已存在 "eth-usdt-monitor"，点击编辑

### 步骤 3: 配置 Stream 参数

```
Stream ID: eth-usdt-monitor
Description: ETH USDT Transaction Monitor
Webhook URL: https://ethmax.vercel.app/api/moralis/webhook
Network: Ethereum Mainnet (0x1)
```

### 步骤 4: 配置智能合约监听

在 Contract Addresses 部分添加:

```
Contract Address: 0xdAC17F958D2ee523a2206206994597C13D831ec7
ABI: 选择 "ERC20 Transfer Event"
```

或使用自定义 ABI:
```json
[
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
]
```

### 步骤 5: 添加监听地址

在 "Addresses" 部分，点击 "Add Address"

输入地址:
```
0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0
```

点击保存

### 步骤 6: 激活 Stream

确保 Stream 状态为 "Active"

如果是 "Paused"，点击 "Resume" 激活

---

## 验证配置

### 检查清单

- [ ] Stream ID: eth-usdt-monitor
- [ ] Status: Active
- [ ] Webhook URL: https://ethmax.vercel.app/api/moralis/webhook
- [ ] Network: Ethereum (0x1)
- [ ] Contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7
- [ ] Address: 0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0 已添加

### 测试

发送测试交易:
```
发送 1-5 USDT 到
0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0
```

等待 1-2 分钟

检查 Telegram 群组 (-1003149735777)

应该收到交易通知消息

---

## 如果 Moralis 无法使用

### 替代方案: 使用其他区块链监听服务

1. Alchemy Notify
2. QuickNode Webhooks
3. Etherscan API
4. 自建节点监听

---

## 当前诊断结果

- 测试消息已发送到 Telegram (检查群组)
- Webhook 端点正常工作
- Moralis API 访问有问题

**建议**: 直接在 Moralis Dashboard 手动配置

---

配置完成后，所有发送到该地址的USDT交易都会自动通知到 Telegram 群组。


