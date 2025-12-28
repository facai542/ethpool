# 代理链接邀请用户显示问题修复验证报告

## 数据库实际情况

### 1. nh_member_new 表结构
```sql
- id: uuid (主键)
- wallet_address: text (唯一)
- agent_id: integer (默认值: 0)
- referred_by: text (注意：文本类型，不是数字)
- referral_code: text (用户自己的邀请码)
- is_active: boolean (默认值: true) ← 关键字段
- approved: integer (默认值: 0, 授权后为1)
- created_at: timestamptz
- updated_at: timestamptz
```

### 2. 当前数据统计
```
总用户数: 72
is_active = true: 72 (100%)
已授权用户: 67 (approved = 1)
有代理关联的用户: 1 (agent_id > 0)
```

### 3. 代理表 (nh_agents)
```
活跃代理数: 2
- XL001 (id=8, referral_code=AGENT000008): 1个邀请用户
- XL002 (id=9, referral_code=AGENT000009): 0个邀请用户
```

## 问题根源

**之前代码中 `is_active` 字段查询不一致：**
- 数据库实际：`is_active = true` (boolean类型)
- 旧代码查询：`.eq('is_active', 0)` ← 错误！
- 结果：查询不到任何用户

## 修复内容

### 1. 用户注册 API (`src/app/api/user/register/route.ts`)
- 查询现有用户：`is_active: 0` → `is_active: true`
- 查找推荐人：`is_active: 0` → `is_active: true`
- 添加现有用户的代理关系更新逻辑
- 统一使用 ISO 时间格式
- referred_by 字段正确转换为字符串

### 2. 代理成员列表 API (`src/app/api/agent/members/route.ts`)
- 查询条件：`is_active: 0` → `is_active: true`
- 授权状态判断：同时检查 `approved` 和 `is_effective`
- 添加 `approved` 字段到查询结果

### 3. 用户绑定 API (`src/app/api/user/bind/route.ts`)
- 查询和创建：`is_active: 0` → `is_active: true`
- 简化创建字段，使用 ISO 时间格式

### 4. 用户邀请统计 API (`src/app/api/user/referrals/route.ts`)
- 所有查询：`is_active: 0` → `is_active: true`
- 使用 `approved` 字段替代 `is_effective`
- 时间格式处理（ISO 而非 Unix）
- referred_by 查询转换为字符串

### 5. ETH 余额 API (`src/app/api/user/eth-balance/route.ts`)
- 查询条件：`is_active: 0` → `is_active: true`
- 使用正确的 `eth` 字段

### 6. 首次授权检查 API (`src/app/api/user/check-first-authorization/route.ts`)
- 查询条件：`is_active: 0` → `is_active: true`
- 使用 `first_approved_at` 字段

## 测试验证步骤

### 1. 准备测试代理邀请码
```
XL001 代理邀请码: AGENT000008
XL002 代理邀请码: AGENT000009
```

### 2. 测试新用户注册
```bash
# 使用代理邀请码注册
curl -X POST http://localhost:3002/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestNewUser001",
    "referralCode": "AGENT000008"
  }'

# 预期结果：
# - 用户创建成功
# - agent_id 设置为 8
# - XL001 的 total_invites +1
```

### 3. 测试用户授权
```bash
# 授权用户
curl -X POST http://localhost:3002/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestNewUser001",
    "isAuthorized": true,
    "referralCode": "AGENT000008"
  }'

# 预期结果：
# - approved 更新为 1
# - 如果之前没有 agent_id，现在应该设置
```

### 4. 测试代理后台查询
```bash
# 查询代理成员列表（需要代理 session）
curl http://localhost:3002/api/agent/members?page=1&limit=20 \
  -H "Cookie: agent_session=xxx"

# 预期结果：
# - 能够查询到 agent_id = 8 的所有用户
# - 包括刚注册的测试用户
```

### 5. 验证数据库
```sql
-- 查询代理邀请的用户
SELECT 
  id,
  wallet_address,
  agent_id,
  approved,
  created_at
FROM nh_member_new
WHERE agent_id = 8 AND is_active = true
ORDER BY created_at DESC;

-- 查询代理统计
SELECT 
  id,
  agent_name,
  total_invites,
  valid_invites
FROM nh_agents
WHERE id = 8;
```

## 现有数据情况

### 成功案例
```
用户: 0xB8A14FFBF76e5eD8288C9460541a8Cbae578f3eb
agent_id: 8
approved: 1
created_at: 2025-10-08 07:20:42
referral_code: FH5MXBK3
```
这个用户正确关联了 XL001 代理

### 其他用户
最近10个用户中有9个 agent_id = 0，说明：
1. 他们可能直接访问网站注册（没有通过代理链接）
2. 或者在授权时没有传入 referralCode

## 关键发现

1. **数据库字段类型**
   - `is_active`: boolean (true/false)
   - `agent_id`: integer
   - `referred_by`: text (注意是文本！)

2. **查询一致性**
   - 所有查询必须使用 `is_active: true`
   - `referred_by` 查询时要转换为字符串
   - `agent_id` 是数字类型，可以直接比较

3. **字段映射**
   - 授权状态：`approved` (0/1)
   - 旧系统可能有 `is_effective` 字段
   - 两者都要检查以保证兼容性

## 注意事项

1. **前端邀请链接**
   确保前端生成的邀请链接包含正确的 referral_code:
   ```
   https://yourdomain.com?ref=AGENT000008
   ```

2. **授权流程**
   用户授权时要确保传入 referralCode:
   ```javascript
   await fetch('/api/user/authorize', {
     body: JSON.stringify({
       wallet_address,
       isAuthorized: true,
       referralCode: refCodeFromUrl  // 重要！
     })
   })
   ```

3. **现有用户更新**
   如果用户之前已注册但没有 agent_id，可以：
   - 在授权时传入 referralCode 会自动更新
   - 或运行数据迁移脚本批量更新

## 后续建议

1. **监控新用户注册**
   - 检查 agent_id 是否正确设置
   - 检查代理统计是否正确更新

2. **日志记录**
   - 记录每次注册/授权的 referralCode
   - 方便排查问题

3. **数据一致性**
   - 定期检查代理统计和实际用户数是否一致
   - 可以写个定时任务自动修正

## 修复完成状态

- [x] 修复 user/register API
- [x] 修复 agent/members API  
- [x] 修复 user/bind API
- [x] 修复 user/referrals API
- [x] 修复 user/eth-balance API
- [x] 修复 user/check-first-authorization API
- [x] 使用 Supabase MCP 验证数据库结构
- [x] 验证现有数据状态
- [x] 创建测试验证文档




