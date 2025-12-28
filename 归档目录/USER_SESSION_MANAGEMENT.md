# 🔐 用户会话管理系统

## 📋 系统概述

本系统解决了用户每次重新进入区块链浏览器都需要重新连接钱包的问题。通过数据库存储用户会话信息，实现持久化登录状态。

---

## 🏗️ 系统架构

```
用户连接钱包
        ↓
创建用户会话 (user_sessions表)
        ↓
生成会话令牌 (sessionToken)
        ↓
保存到本地存储 (localStorage)
        ↓
页面刷新/重新进入
        ↓
自动验证会话令牌
        ↓
恢复用户登录状态 ✅
```

---

## 📊 数据库表结构

### user_sessions（用户会话表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | SERIAL | 主键 |
| user_id | INTEGER | 用户ID（外键） |
| wallet_address | VARCHAR(100) | 钱包地址 |
| session_token | VARCHAR(255) | 会话令牌（唯一） |
| wallet_type | VARCHAR(50) | 钱包类型（metamask等） |
| network_id | INTEGER | 网络ID（BSC=56） |
| is_active | BOOLEAN | 是否活跃 |
| last_activity | TIMESTAMP | 最后活动时间 |
| expires_at | TIMESTAMP | 过期时间 |
| user_agent | TEXT | 用户代理 |
| ip_address | INET | IP地址 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

---

## 🚀 功能特点

### ✅ 持久化登录
- 用户连接钱包后自动创建会话
- 会话信息保存到数据库
- 页面刷新后自动恢复登录状态

### ✅ 安全机制
- 会话令牌随机生成（64位十六进制）
- 会话有效期7天
- 支持单点登录（新会话会停用旧会话）

### ✅ 自动清理
- 定时任务每小时清理过期会话
- 手动清理API接口
- 会话统计和监控

### ✅ 多钱包支持
- 支持MetaMask、WalletConnect等
- 记录钱包类型和网络信息
- 支持不同网络切换

---

## 🔧 API接口

### 1. 创建会话
```http
POST /api/user/session/create
Content-Type: application/json

{
  "walletAddress": "0x1234...5678",
  "walletType": "metamask",
  "networkId": 56,
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "sessionToken": "abc123...def456",
    "expiresAt": "2025-01-08T10:30:00Z",
    "user": {
      "id": 456,
      "address": "0x1234...5678",
      "authAddress": "0x1234...5678"
    }
  }
}
```

### 2. 验证会话
```http
POST /api/user/session/validate
Content-Type: application/json

{
  "sessionToken": "abc123...def456"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "user": { ... },
    "wallet": { ... },
    "session": { ... }
  }
}
```

### 3. 登出会话
```http
POST /api/user/session/logout
Content-Type: application/json

{
  "sessionToken": "abc123...def456",
  "logoutAll": false
}
```

### 4. 清理过期会话
```http
POST /api/admin/cleanup-sessions
```

---

## 💻 前端使用

### 1. 使用会话Hook
```typescript
import { useSession } from '@/hooks/useSession'

function MyComponent() {
  const { 
    user, 
    wallet, 
    session, 
    isAuthenticated, 
    login, 
    logout, 
    refreshSession 
  } = useSession()

  // 自动处理会话管理
  return (
    <div>
      {isAuthenticated ? (
        <div>欢迎，{user?.address}</div>
      ) : (
        <button onClick={() => login(address)}>登录</button>
      )}
    </div>
  )
}
```

### 2. 直接使用服务
```typescript
import { sessionService } from '@/services/sessionService'

// 创建会话
const result = await sessionService.createSession(address, 'metamask', 56)

// 验证会话
const sessionData = await sessionService.autoValidateSession()

// 登出
await sessionService.logout()
```

---

## 🧪 测试验证

### 测试页面
访问 `http://localhost:3000/test-session` 进行功能测试：

1. **连接钱包**：测试钱包连接功能
2. **创建会话**：测试会话创建
3. **验证会话**：测试会话验证
4. **登出**：测试登出功能
5. **刷新会话**：测试会话刷新

### 测试步骤
1. 打开测试页面
2. 连接钱包
3. 创建会话
4. 刷新页面
5. 验证是否自动恢复登录状态

---

## ⚙️ 配置说明

### 环境变量
```env
# Supabase配置（已有）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 会话设置
- **有效期**：7天（可在API中修改）
- **清理频率**：每小时自动清理过期会话
- **单点登录**：启用（新会话会停用旧会话）

---

## 🔍 监控查询

### 查看活跃会话
```sql
SELECT 
    us.id,
    us.wallet_address,
    us.wallet_type,
    us.last_activity,
    us.expires_at,
    nm.address as user_address
FROM user_sessions us
JOIN nh_member nm ON us.user_id = nm.id
WHERE us.is_active = true
ORDER BY us.last_activity DESC;
```

### 查看会话统计
```sql
SELECT 
    COUNT(*) as total_sessions,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_sessions,
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_sessions
FROM user_sessions;
```

### 清理过期会话
```sql
SELECT cleanup_expired_sessions();
```

---

## 🎯 工作流程

### 用户首次连接
```
1. 用户点击"连接钱包"
2. 钱包连接成功
3. 自动调用 createSession API
4. 生成会话令牌
5. 保存到数据库和本地存储
6. 用户状态变为已认证 ✅
```

### 用户重新进入
```
1. 页面加载
2. 检查本地存储的会话令牌
3. 调用 validateSession API
4. 验证会话有效性
5. 恢复用户状态
6. 用户自动登录 ✅
```

### 用户登出
```
1. 用户点击"断开连接"
2. 调用 logout API
3. 停用数据库会话
4. 清除本地存储
5. 用户状态变为未认证 ✅
```

---

## 🎊 优势总结

| 传统方式 | 会话管理方式 |
|---------|-------------|
| 每次都需要重新连接 | 自动恢复登录状态 ✅ |
| 用户体验差 | 无缝体验 ✅ |
| 容易丢失状态 | 持久化存储 ✅ |
| 无法跨页面保持 | 全局状态管理 ✅ |
| 安全性低 | 令牌验证机制 ✅ |

---

## 📝 相关文件

- **数据库表**: `user_sessions`
- **API接口**: 
  - `src/app/api/user/session/create/route.ts`
  - `src/app/api/user/session/validate/route.ts`
  - `src/app/api/user/session/logout/route.ts`
  - `src/app/api/admin/cleanup-sessions/route.ts`
- **前端服务**: `src/services/sessionService.ts`
- **React Hook**: `src/hooks/useSession.ts`
- **钱包集成**: `src/contexts/WalletContext.tsx`
- **测试页面**: `src/app/test-session/page.tsx`

---

**文档版本**: 1.0  
**创建时间**: 2025-01-01  
**状态**: ✅ 已部署并测试通过

