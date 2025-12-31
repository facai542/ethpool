# 修复 Moralis 配置

## 问题诊断

❌ Moralis API Key 返回 401 错误
❌ Vercel 环境变量中可能缺少 MORALIS_API_KEY

---

## 解决方案

### 方案 1: 在 Vercel 中设置环境变量

**步骤**:

1. 访问 https://vercel.com
2. 选择您的项目
3. 进入 Settings → Environment Variables
4. 添加环境变量:
   ```
   Name: MORALIS_API_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjkzMjJjNGMzLTk1MzQtNDcyYy04MjE1LTYyYzZjYmU1ZTQzNCIsIm9yZ0lkIjoiNDU4NjYzIiwidXNlcklkIjoiNDcxODg1IiwidHlwZUlkIjoiODZkN2FiMzktMzhhZS00OTRhLTkzN2UtM2Q2YWE5NzkyNmQzIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTIxODE2MDAsImV4cCI6NDkwNzk0MTYwMH0.5sXa0KWUgUrc5NFx5oDxZ4LOVsiVg3vWpU5HxXymqng
   ```
5. 重新部署项目

### 方案 2: 检查 API Key 有效性

**可能问题**:
- API Key 已过期
- API Key 权限不足
- 组织 ID 不匹配

**检查方法**:
1. 访问 https://admin.moralis.io/
2. 登录账户
3. 检查 API Key 状态
4. 确认权限设置

### 方案 3: 重新生成 API Key

**步骤**:
1. 访问 https://admin.moralis.io/
2. 进入 API Keys 页面
3. 创建新的 API Key
4. 复制新的 Key
5. 在 Vercel 中更新环境变量

---

## 验证配置

### 检查 Vercel 环境变量

访问: https://ethmax.vercel.app/api/test-env

应该看到 MORALIS_API_KEY 在返回结果中

### 测试 Moralis API

```bash
curl -X GET "https://deep-index.moralis.io/api/v2/streams" \
  -H "X-API-Key: YOUR_MORALIS_API_KEY"
```

应该返回 200 状态码和 Streams 列表

---

## 重新部署

设置环境变量后:

1. 在 Vercel Dashboard 点击 "Redeploy"
2. 等待部署完成
3. 测试授权流程

---

## 预期结果

配置正确后:
- 用户授权 USDT 时自动添加到 Moralis Stream
- 向监听地址发送 USDT 时收到 Telegram 通知
- Vercel 日志显示 Moralis API 调用成功

---

## 立即操作

1. 在 Vercel 中设置 MORALIS_API_KEY 环境变量
2. 重新部署项目
3. 测试 50 USDT 交易通知

