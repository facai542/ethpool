# Moralis Stream 手动配置 - 完整步骤

## 重要：旧 Stream 已删除

旧 Stream ID `cfa94e99-d7fe-4e1d-825f-fb50648671f0` 已删除。

现在需要重新创建一个**正确配置**的 Stream。

## 立即行动：手动在 Moralis Dashboard 配置

### 步骤1：访问 Moralis Dashboard

访问：https://admin.moralis.io/streams

### 步骤2：创建新 Stream

点击 "Create New Stream" 或 "+ New Stream"

### 步骤3：基本配置

| 字段 | 值 |
|------|------|
| **Stream Name** | ETH USDT Monitor |
| **Description** | 监听指定地址的 USDT 转账 |
| **Blockchain** | Ethereum (选择 Ethereum Mainnet) |
| **Stream Type** | Contract Events |

### 步骤4：配置 Webhook

| 字段 | 值 |
|------|------|
| **Webhook URL** | `https://ethmax.vercel.app/api/moralis/webhook` |
| **Tag** | `eth-usdt-monitor` |

**关键：如果 ethmax.vercel.app 不是你的实际域名**，请使用正确的域名！

常见的 Vercel 域名格式：
- `https://项目名.verUncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
index-858a3320.js:1:7937
XHRPOST
https://1568game.com/api/webapi/GetGameIssue
[HTTP/2 200  94ms]

XHRPOST
https://1568game.com/api/webapi/GetNoaverageEmerdList
[HTTP/2 200  111ms]

Uncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
index-858a3320.js:1:7937
XHRPOST
https://1568game.com/api/webapi/GetGameIssue
[HTTP/2 200  95ms]

XHRPOST
https://1568game.com/api/webapi/GetNoaverageEmerdList
[HTTP/2 200  94ms]

Uncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
index-858a3320.js:1:7937
XHRPOST
https://1568game.com/api/webapi/GetGameIssue
[HTTP/2 200  96ms]

XHRPOST
https://1568game.com/api/webapi/GetNoaverageEmerdList
[HTTP/2 200  104ms]

Uncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
index-858a3320.js:1:7937
XHRPOST
https://1568game.com/api/webapi/GetGameIssue
[HTTP/2 200  93ms]

XHRPOST
https://1568game.com/api/webapi/GetNoaverageEmerdList
[HTTP/2 200  102ms]

Uncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
index-858a3320.js:1:7937
XHRPOST
https://1568game.com/api/webapi/GetGameIssue
[HTTP/2 200  99ms]
****
XHRPOST
https://1568game.com/api/webapi/GetNoaverageEmerdList
[HTTP/2 200  98ms]

Uncaught (in promise) TypeError: can't access property "replace", d.startTime is null
    K https://1568game.com/assets/js/index-858a3320.js:1
    O https://1568game.com/assets/js/index-858a3320.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    oF https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    onClick https://1568game.com/assets/js/audio-42953c7a.js:1
    Zr https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    jn https://1568game.com/assets/js/common.modules-adc6b33e.js:4
    n https://1568game.com/assets/js/common.modules-adc6b33e.js:14
cel.app`
- `https://项目名-用户名.vercel.app`
- 或你的自定义域名

### 步骤5：配置合约和事件

**Contract Address**:
```
0xdAC17F958D2ee523a2206206994597C13D831ec7
```

**Event Name**: Transfer

**Event ABI** (粘贴以下 JSON):
```json
{
  "anonymous": false,
  "inputs": [
    { "indexed": true, "name": "from", "type": "address" },
    { "indexed": true, "name": "to", "type": "address" },
    { "indexed": false, "name": "value", "type": "uint256" }
  ],
  "name": "Transfer",
  "type": "event"
}
```

### 步骤6：添加监听地址

选择 "Add Addresses"

**批量粘贴以下地址**（45个）：
```
0xb18b7561873de63f43fb797bf37c9edeb396b446
0x4512c6c2e2a450751979129f003bf211e1c16f55
0x8fdff041b379f335430bd8c5f8590df1d5a6330d
0x1dad6ed01eae0bb6b502dc3092a1512606888b76
0x64d43da0c3e7db5b42beeacd6839f321e6c94d11
0x909991a3818bc12d63a010e1a379ded55e886dd1
0x165fa7c840230ee43dbb3c39c5e6095b9d68b008
0xc1954f88c6ac84c505d71cece9797304e4d993f7
0xb8a14ffbf76e5ed8288c9460541a8cbae578f3eb
0x6079af2e39e8b9f841465e72d8cef0ed34ff65af
0x86e75a3db073e28cd25c0f9ca50707050a0f7e0e
0xf48a70be657c65f0d99380cc003ddecb98b70294
0xddab159d4d75d588bb331b326c5ce0ba8aa7a3a0
0xfc98860997c04704abba7197ccf6a9037c42e2b8
0xe94779d2dd8840e0c7689891eaa39bc5d255b318
0xd3618c1c61a1a436351790f6db92cb360e7b9db2
0x0411032464f2f3b8ee5ae90cba4ea179d19163ee
0x589efa52fe5acbd20e1ff9b489bc8fcdfff56369f
0x66b673c7d69fc5b27a208564fa60cb86fa0fd385
0x7996e4864b49488d7a127ca597e0965b20149db6
0xca354424cb922500c2f7a13740705c8e1f2c2c11
0xd74658b4f86a5e29de85811569d41f39e77015cd
0xe4c291dc8f62d9fe03d37421c20f452fc30f3419
0xef6297f2d74ab29f18aed2438f5c66633918b1ae
0x2f77d8b6fd22816d6016fc0ce20f3b5e086f8fc5
0x28e81e6cbe93d36c40588bd9edb3ff6e30418635
0x8adef046ba9050f55c0796dd84a0eeaa9dbfa5a
0x8917b3723f4971a6fcb315e4667fba4fb07fed7a
0x018d433724c820f480d20b8ad20f375fd88ed839
0xc6e465b72f6b8b6b68d6e1324cda180f939503a3
0xd3356119507a0950bac3e0f07429ac805cf76750
0x1efee8fa44fd98d76e27386877582db8a3881a4f
0xac86e43690f861eab99e4b4b85dfe36e1ea6c480
0x7aadd91038d8deac9b83d25a44d427a60e95c8fd
0x5dfeda4db06dc80843c96311c1d4643ee6eae771
0xd577233cfa76d97e46222988c436d107bc84cb86
0x742d35cc6634c0532925a3b8d0c0c4c7c7c7c7c7
0x722dbfcc260c3804dac7c56a310c52737bdd3479
0xfe863ae25c3d620c481a81a873ad18866e4f0bb4
0x898256bd316308666017b4d024ea10c3c6432222
0x5e51652b8ead1d26884dd0d80fc8ce183a26fa6f
0xbda6620688a7b3d574ff7c234090dc2e51fc7077
0x0a7f24d91d34cc5b9aa294583e428eab802d87d0
0xc065a1d00c3702975d62d067a59ada0deca045bc
0x1234567890123456789012345678901234567890
```

### 步骤7：高级设置

| 字段 | 值 |
|------|------|
| **Confirmations Required** | 1（降低延迟） |
| **Include Internal Txs** | 否 |
| **Include Native Txs** | 否 |
| **Include Contract Logs** | 是 |

### 步骤8：测试 Webhook

1. 点击 "Test Stream" 按钮
2. 应该立即向你的 Webhook URL 发送测试请求
3. 打开另一个窗口访问 Vercel 日志
4. 查看是否收到测试请求

### 步骤9：激活 Stream

确认配置无误后，点击 "Save" 或 "Activate"

## 验证配置成功

### 方法1：Moralis Dashboard 测试

- 在 Stream 详情页点击 "Test Stream"
- 检查 Vercel 日志 → Functions → /api/moralis/webhook
- 应该看到 POST 请求记录

### 方法2：真实交易测试

1. 向任意监听地址转账 50 USDT
2. 等待 12 个区块确认（约 2.4 分钟）
3. 检查 Telegram 群组
4. 应该收到通知

## 常见问题

### Q: Webhook URL 应该用什么？

**A**: 使用你的 Vercel 生产域名

检查方法：
1. 访问 https://vercel.com
2. 找到 newdapp-master 项目
3. 查看 "Domains" 标签
4. 使用主域名 + `/api/moralis/webhook`

### Q: 如何确认配置成功？

**A**: 必须通过 "Test Stream" 测试

- 点击测试按钮
- 立即查看 Vercel 日志
- 如果收到请求 = 配置成功
- 如果没收到 = Webhook URL 错误

### Q: 为什么需要 12 个确认？

**A**: Moralis 默认设置，防止链重组

- 12 确认 ≈ 2.4 分钟
- 可以降低到 1 确认（15秒）
- 但可能有假阳性

## 重要提醒

**测试环境 vs 真实环境**：

| 类型 | 数据来源 | 通知 |
|------|---------|------|
| 测试交易 | 直接写入数据库 | ✅ 正常 |
| 真实交易 | Moralis Webhook 推送 | ❌ 未收到 |

**问题根源**：Moralis Stream 配置或 Webhook URL 有问题

## 诊断文档

已创建详细诊断文档：`ceshi/真实交易无通知问题诊断.md`

---

**请立即执行**：

1. 访问 https://admin.moralis.io/streams
2. 按照上述步骤手动创建 Stream
3. **最关键**：确认 Webhook URL 使用你的实际域名
4. 点击 "Test Stream" 验证配置

如果你不确定实际域名，告诉我，我帮你检查！


