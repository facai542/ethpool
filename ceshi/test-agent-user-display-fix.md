# 代理链接邀请用户显示问题修复验证

## 问题描述
代理通过邀请链接注册的用户，授权后在代理后台用户列表中未显示。

## 问题原因
1. `is_active` 字段值不一致导致查询失败
   - 注册和授权时创建用户使用 `is_active: true`
   - 代理后台查询时使用 `.eq('is_active', 0)`
   - 查询条件不匹配，导致查不到数据

2. 相关文件中的 `is_active` 使用不一致

## 修复内容

### 1. 用户注册 API (`src/app/api/user/register/route.ts`)
- 修复：查询现有用户时使用 `is_active: true`
- 修复：查找推荐人时使用 `is_active: true`
- 修复：添加对现有用户的代理关系更新逻辑
- 修复：统一使用 ISO 时间格式
- 修复：推荐人下级数量统计使用正确的查询条件

### 2. 代理成员列表 API (`src/app/api/agent/members/route.ts`)
- 修复：查询条件从 `is_active: 0` 改为 `is_active: true`
- 修复：授权状态判断同时检查 `approved` 和 `is_effective` 字段
- 新增：查询时包含 `approved` 字段

### 3. 用户绑定 API (`src/app/api/user/bind/route.ts`)
- 修复：查询和创建用户时使用 `is_active: true`
- 修复：简化创建用户的字段，只保留必要字段
- 修复：使用 ISO 时间格式

### 4. 用户邀请统计 API (`src/app/api/user/referrals/route.ts`)
- 修复：所有查询都使用 `is_active: true`
- 修复：使用 `approved` 字段替代 `is_effective`
- 修复：时间格式处理（从 Unix 时间戳改为 ISO）
- 修复：referred_by 查询时转换为字符串

### 5. ETH 余额 API (`src/app/api/user/eth-balance/route.ts`)
- 修复：使用 `is_active: true`
- 修复：使用正确的 `eth` 字段而不是 `balance`
- 修复：any 类型改为 Record<string, string>

### 6. 首次授权检查 API (`src/app/api/user/check-first-authorization/route.ts`)
- 修复：使用 `is_active: true`
- 修复：使用 `first_approved_at` 字段替代 `first_authorization_reward`

## 数据库字段约定

### is_active 字段
- `true` = 正常用户（未删除）
- `false` 或 `0` = 已删除用户

### agent_id 字段
- 数字类型，存储代理ID
- 0 = 无代理
- > 0 = 有代理

### referred_by 字段
- 字符串类型，存储推荐人的用户ID
- null = 无推荐人
- 有值 = 有推荐人

## 验证步骤

### 1. 测试代理邀请注册流程
```bash
# 1. 使用代理邀请码注册新用户
curl -X POST http://localhost:3002/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestAddress001",
    "referralCode": "AGENT_CODE"
  }'

# 预期结果：
# - 用户创建成功
# - agent_id 字段正确设置
# - 代理统计更新
```

### 2. 测试用户授权流程
```bash
# 2. 授权用户
curl -X POST http://localhost:3002/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestAddress001",
    "isAuthorized": true,
    "referralCode": "AGENT_CODE"
  }'

# 预期结果：
# - approved 字段更新为 1
# - 如果之前没有 agent_id，现在应该设置
```

### 3. 测试代理后台用户列表查询
```bash
# 3. 查询代理成员列表（需要代理 session）
curl http://localhost:3002/api/agent/members?page=1&limit=20 \
  -H "Cookie: agent_session=xxx"

# 预期结果：
# - 能够查询到通过邀请码注册并授权的用户
# - 用户信息完整显示
```

### 4. 测试代理 Dashboard
```bash
# 4. 查询代理 dashboard
curl http://localhost:3002/api/agent/dashboard \
  -H "Cookie: agent_session=xxx"

# 预期结果：
# - stats 中显示正确的邀请用户数量
# - invitedUsers 列表包含所有邀请的用户
```

## 注意事项

1. **历史数据处理**
   - 如果数据库中已存在 `is_active: 0` 或 `false` 的正常用户
   - 需要运行数据迁移脚本统一修正

2. **数据库字段类型**
   - 确认 `is_active` 字段在数据库中的类型（boolean 或 integer）
   - 确认 `agent_id` 字段在数据库中存在
   - 确认 `referred_by` 字段的类型（string 或 integer）

3. **其他文件**
   - 还有其他文件使用了 `is_active: 0`，包括：
     - `src/app/api/test-simple/route.ts`
     - `src/app/api/user/withdraw/route.ts`
     - `src/app/api/staking/route.ts`
     - `src/app/api/exchange/route.ts`
     - `src/app/api/admin/update-rewards-with-onchain-balance/route.ts`
   - 建议全面检查并修复

## 修复后的数据流程

```
1. 用户访问邀请链接：?ref=AGENT_CODE
   ↓
2. 前端调用注册 API，传入 referralCode
   ↓
3. 后端查找代理（通过 referral_code）
   ↓
4. 创建用户，设置 agent_id = 代理ID
   ↓
5. 用户授权
   ↓
6. 更新 approved = 1
   ↓
7. 代理后台查询：.eq('agent_id', agentId).eq('is_active', true)
   ↓
8. 用户正确显示在列表中
```

## 测试检查清单

- [ ] 新用户通过代理链接注册
- [ ] 用户记录中 agent_id 正确设置
- [ ] 代理统计（total_invites, valid_invites）正确更新
- [ ] 用户授权后 approved 字段更新
- [ ] 代理后台成员列表能查询到用户
- [ ] 代理 dashboard 显示正确的统计数据
- [ ] 现有用户通过邀请链接访问，代理关系正确更新
- [ ] 邀请统计 API 返回正确数据

## 相关数据库表

### nh_member_new 表
```sql
- id (uuid/string): 用户ID
- wallet_address (string): 钱包地址
- agent_id (integer): 代理ID
- referred_by (string): 推荐人ID
- referral_code (string): 用户的邀请码
- is_active (boolean): 是否活跃
- approved (integer): 是否已授权 (0/1)
- first_approved_at (timestamp): 首次授权时间
- last_approved_at (timestamp): 最后授权时间
- created_at (timestamp): 创建时间
- updated_at (timestamp): 更新时间
```

### nh_agents 表
```sql
- id (integer): 代理ID
- agent_code (string): 代理编码
- agent_name (string): 代理名称
- referral_code (string): 代理邀请码
- total_invites (integer): 总邀请数
- valid_invites (integer): 有效邀请数
- status (string): 状态 (active/inactive)
```




