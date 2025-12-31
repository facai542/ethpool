# 🪟 Windows 环境下设置 Telegram Webhook

## 问题说明
在 Windows PowerShell 中，Node.js 脚本无法直接读取 `.env` 文件中的环境变量。

## ✅ 三种解决方案

### 方案 1: 使用 PowerShell 脚本（推荐）

```powershell
# 直接运行 PowerShell 脚本
.\scripts\setup-telegram-webhook.ps1
```

这个脚本会自动读取 `.env` 文件并设置 webhook。

---

### 方案 2: 临时设置环境变量

```powershell
# 1. 在 PowerShell 中设置环境变量
$env:TELEGRAM_BOT_TOKEN="8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
$env:NEXT_PUBLIC_APP_URL="https://ethmax.vercel.app"

# 2. 运行 Node.js 脚本
node scripts/setup-telegram-webhook.js set
```

**注意**: 这种方式只在当前 PowerShell 会话有效，关闭窗口后失效。

---

### 方案 3: 直接传递参数（最简单）

```powershell
# 格式: node scripts/setup-telegram-webhook.js set <BOT_TOKEN> [APP_URL]
node scripts/setup-telegram-webhook.js set 8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I https://ethmax.vercel.app
```

或使用默认 APP_URL:
```powershell
node scripts/setup-telegram-webhook.js set 8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I
```

---

## 🔍 根据你的项目

根据代码中的 Token，你可以直接运行：

```powershell
node scripts/setup-telegram-webhook.js set 8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I https://ethmax.vercel.app
```

---

## 📊 验证设置

设置成功后，运行以下命令查看状态：

```powershell
# 使用临时环境变量
$env:TELEGRAM_BOT_TOKEN="8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
node scripts/setup-telegram-webhook.js info
```

或使用 PowerShell 直接查询：

```powershell
$BOT_TOKEN = "8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
Invoke-RestMethod -Uri "https://api.telegram.org/bot$BOT_TOKEN/getWebhookInfo" | ConvertTo-Json
```

---

## 🎯 快速命令（复制即用）

### 设置 Webhook
```powershell
node scripts/setup-telegram-webhook.js set 8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I https://ethmax.vercel.app
```

### 查询 Webhook 状态
```powershell
$env:TELEGRAM_BOT_TOKEN="8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
node scripts/setup-telegram-webhook.js info
```

### 重置 Webhook
```powershell
$env:TELEGRAM_BOT_TOKEN="8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I"
node scripts/setup-telegram-webhook.js reset
```

---

## ⚠️ 注意事项

### 1. Token 安全
- ⚠️ **不要**在公开场合分享你的 Bot Token
- ⚠️ **不要**将包含 Token 的命令保存到 Git 历史
- ✅ 建议使用 PowerShell 脚本或环境变量方式

### 2. .env 文件检查
确保项目根目录有 `.env` 或 `.env.local` 文件，内容包含：

```env
TELEGRAM_BOT_TOKEN=8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I
NEXT_PUBLIC_APP_URL=https://ethmax.vercel.app
```

### 3. PowerShell 执行策略
如果无法运行 `.ps1` 脚本，需要修改执行策略：

```powershell
# 查看当前策略
Get-ExecutionPolicy

# 临时允许运行脚本（推荐）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 然后运行脚本
.\scripts\setup-telegram-webhook.ps1
```

---

## ✅ 成功标志

设置成功后，你应该看到：

```
✅ Webhook 设置成功!

设置详情:
  - URL: https://ethmax.vercel.app/api/telegram/webhook
  - 允许的更新: message, callback_query
  - 清空待处理更新: 是

📊 查询 Webhook 信息...

当前 Webhook 信息:
  - URL: https://ethmax.vercel.app/api/telegram/webhook
  - 待处理更新: 0
  - 最后错误: (无)
```

---

## 🔧 故障排查

### 问题1: "无法识别的 cmdlet"
**原因**: PowerShell 版本过低  
**解决**: 使用方案 3 (Node.js 脚本 + 参数)

### 问题2: "无法加载文件，未对文件进行数字签名"
**原因**: PowerShell 执行策略限制  
**解决**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### 问题3: "找不到 .env 文件"
**原因**: 项目根目录没有 .env 文件  
**解决**: 使用方案 3 直接传递参数

---

## 📞 完成后的下一步

Webhook 设置成功后：

1. ✅ 在前端完成一次用户授权
2. ✅ 检查 Telegram 群组是否收到授权消息
3. ✅ 点击"添加到链上实时监听"按钮
4. ✅ 验证按钮功能正常

如果按钮仍然无响应，检查 Vercel 日志：
- 登录 Vercel Dashboard
- 查看项目日志
- 搜索 "Telegram Webhook" 或 "callback"

---

**推荐方式**: 方案 3 (直接传递参数) - 最简单、最快速！



