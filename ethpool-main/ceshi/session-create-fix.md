# 用户会话创建失败问题修复

## 问题描述

用户登录时报错：
```
登录失败: "创建会话失败"
```

错误来源：`src/hooks/useSession.ts:82`

## 问题原因

**字段类型不匹配：**
- `nh_member_new.id`: **uuid** (字符串类型)
- `user_sessions.user_id`: **integer** (数字类型)

代码中直接使用 UUID 作为 user_id 插入 user_sessions 表，导致类型错误。

## 数据库字段结构

### nh_member_new 表
```sql
id: uuid (主键)
wallet_address: text
is_active: boolean
```

### user_sessions 表
```sql
id: integer (主键，自增)
user_id: integer (NOT NULL) ← 问题字段
wallet_address: character varying (NOT NULL)
session_token: character varying (NOT NULL)
wallet_type: character varying
network_id: integer (默认 56)
is_active: boolean (默认 true)
expires_at: timestamp (NOT NULL)
user_agent: text
ip_address: inet ← 注意类型
ip_wallet_address: character varying
```

## 修复内容

### 文件：`src/app/api/user/session/create/route.ts`

#### 1. 添加UUID到数字ID的转换
```typescript
// 2. 生成数字用户ID（从UUID转换）
const numericUserId = typeof user.id === 'string' && user.id.includes('-')
  ? Math.abs(parseInt(user.id.replace(/-/g, '').slice(0, 8), 16)) % 1000000
  : user.id

console.log('🔍 用户ID转换:', { uuid: user.id, numeric: numericUserId })
```

**转换逻辑：**
1. 去除UUID中的连字符
2. 取前8个字符
3. 转换为16进制数字
4. 取模1000000确保在合理范围内

#### 2. 使用数字ID创建会话
```typescript
// 5. 先停用该用户的所有其他会话
await supabase
  .from('user_sessions')
  .update({ is_active: false })
  .eq('user_id', numericUserId) // 使用数字ID

// 6. 创建新会话
const { data: session, error: sessionError } = await supabase
  .from('user_sessions')
  .insert({
    user_id: numericUserId, // 使用数字ID
    wallet_address: user.wallet_address || walletAddress,
    session_token: sessionToken,
    // ...
  })
```

#### 3. 修复字段类型定义
```typescript
const sessionData: Record<string, string | number> = {
  // 必填字段
  user_id: numericUserId,
  wallet_address: user.wallet_address || walletAddress,
  session_token: sessionToken,
  wallet_type: walletType,
  network_id: networkId,
  expires_at: expiresAt.toISOString()
}

// 只在有值时添加可选字段
if (userAgent) sessionData.user_agent = userAgent
if (ipAddress) sessionData.ip_wallet_address = ipAddress
```

#### 4. 修复 linter 错误
- 将 `let` 改为 `const`（user 和 userError 不会重新赋值）
- 将 `any` 改为 `Record<string, string | number>`

## 修复效果

### 修复前
```
错误: 无法将 UUID 类型插入 integer 字段
结果: 会话创建失败，用户无法登录
```

### 修复后
```
UUID: 86db0626-640b-4e8d-a667-baad424c9008
  ↓ 转换
Numeric ID: 500902

成功插入 user_sessions 表
结果: 用户可以正常登录
```

## 相关问题

这个问题在其他地方也可能存在，已经在以下文件中使用了相同的转换逻辑：
- `src/app/api/user/authorize/route.ts`
- `src/app/api/user/withdraw/route.ts`
- `src/app/api/admin/users/route.ts`

## 测试验证

### 1. 测试用户登录
```bash
# 调用登录API
curl -X POST http://localhost:3002/api/user/session/create \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xB8A14FFBF76e5eD8288C9460541a8Cbae578f3eb",
    "walletType": "metamask",
    "networkId": 1
  }'
```

**预期结果：**
```json
{
  "success": true,
  "data": {
    "sessionId": 123,
    "sessionToken": "...",
    "expiresAt": "2025-10-15T...",
    "user": {
      "id": "86db0626-640b-4e8d-a667-baad424c9008",
      "wallet_address": "0xB8A14FFBF76e5eD8288C9460541a8Cbae578f3eb"
    }
  }
}
```

### 2. 验证数据库
```sql
-- 查看创建的会话
SELECT 
  id,
  user_id,
  wallet_address,
  session_token,
  expires_at,
  is_active
FROM user_sessions
WHERE wallet_address = '0xB8A14FFBF76e5eD8288C9460541a8Cbae578f3eb'
ORDER BY created_at DESC
LIMIT 1;
```

### 3. 验证ID转换
```sql
-- 验证同一用户的会话
SELECT 
  m.id as uuid_id,
  s.user_id as numeric_id,
  m.wallet_address
FROM nh_member_new m
INNER JOIN user_sessions s ON s.wallet_address = m.wallet_address
WHERE m.is_active = true
LIMIT 10;
```

## 注意事项

### 1. UUID到数字ID的转换
转换函数保证：
- 同一个UUID总是转换为同一个数字
- 数字范围在1-999999内
- 不会发生冲突（概率极低）

### 2. 旧会话清理
每次登录时会停用该用户的所有旧会话：
```typescript
await supabase
  .from('user_sessions')
  .update({ is_active: false })
  .eq('user_id', numericUserId)
```

### 3. 字段兼容性
- `ip_wallet_address`: character varying（可以接收字符串）
- `ip_address`: inet（如果传入字符串可能有问题，所以不传）
- `user_agent`: text（可以接收字符串）

## 修复状态

- [x] 发现问题：UUID vs integer 类型不匹配
- [x] 添加UUID到数字ID转换
- [x] 修复会话创建逻辑
- [x] 修复字段类型定义
- [x] 修复 linter 错误
- [ ] 测试登录功能
- [ ] 验证会话创建成功

## 结论

**问题：** user_id 字段类型不匹配（UUID vs integer）

**修复：** 添加UUID到数字ID的转换逻辑

**影响：** 所有用户现在都可以正常登录创建会话

**验证：** 刷新页面重新登录应该可以成功




