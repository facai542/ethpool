# 代理邀请链接完整测试指南

## 测试准备

### 代理信息确认
```
代理ID: 9
代理名称: XL002
代理编码: XL002
邀请码: AGENT000009
当前统计: total_invites=0, valid_invites=0
状态: active ✓
```

### 测试环境
```
前端URL: http://localhost:3000
代理邀请链接: http://localhost:3000?ref=AGENT000009
测试钱包: 准备一个MetaMask测试钱包
```

## 完整测试流程

### 步骤1：访问代理邀请链接

**操作：**
1. 打开Chrome浏览器（隐身模式推荐）
2. 打开开发者工具（F12）
3. 访问：`http://localhost:3000?ref=AGENT000009`

**预期控制台输出：**
```
🔗 检测到邀请码: AGENT000009
✅ 邀请码已保存到localStorage
```

**验证：**
```javascript
// 在控制台执行
localStorage.getItem('referralCode')
// 应该返回: "AGENT000009"
```

### 步骤2：连接钱包

**操作：**
1. 点击页面上的 "Connect Wallet" 按钮
2. 选择 MetaMask
3. 在弹出的MetaMask窗口中选择测试账户
4. 点击"连接"

**预期结果：**
- 钱包成功连接
- 页面显示钱包地址
- 控制台显示连接成功日志

**记录钱包地址：**
```
测试钱包地址: 0x... (记下完整地址)
```

### 步骤3：授权USDT

**操作：**
1. 找到页面上的"授权"或"Approve"按钮
2. 点击授权按钮
3. MetaMask弹出授权请求
4. 确认授权交易（授权额度：1,000,000 USDT）
5. 等待交易确认

**预期控制台输出：**
```
💰 授权金额: 1000000 USDT
📍 授权给合约地址: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
✅ 授权成功: 0x[交易哈希]
🔄 立即更新数据库中的用户授权状态...
```

**关键日志（授权API调用）：**
```
Body包含:
{
  wallet_address: "0x...",
  isAuthorized: true,
  referralCode: "AGENT000009",  ← 关键！应该有这个
  txHash: "0x...",
  amount: "1000000"
}
```

### 步骤4：验证后端处理

**打开另一个终端查看后端日志：**

**预期看到：**
```
🔑 处理授权请求: {
  wallet_address: '0x...',
  isAuthorized: true,
  referralCode: 'AGENT000009',
  ...
}
🔍 处理推荐关系 - 邀请码: AGENT000009
🔍 在代理表中查找推荐码: AGENT000009
✅ 找到代理推荐人: { id: 9, code: 'XL002', name: 'XL002' }
📝 创建新用户记录... (或更新现有用户)
✅ 用户创建成功
📝 更新代理邀请统计...
✅ 代理邀请统计更新成功
```

### 步骤5：验证数据库

**使用Supabase MCP查询：**

```sql
-- 1. 查询新创建的用户
SELECT 
  id,
  wallet_address,
  agent_id,
  approved,
  referral_code,
  created_at
FROM nh_member_new
WHERE wallet_address = '你的测试钱包地址'
ORDER BY created_at DESC
LIMIT 1;
```

**预期结果：**
```
id: [UUID]
wallet_address: 0x[你的钱包地址]
agent_id: 9  ← 关键！应该是9
approved: 1  ← 已授权
referral_code: [自动生成的8位码]
```

```sql
-- 2. 查询代理统计
SELECT 
  id,
  agent_name,
  agent_code,
  total_invites,
  valid_invites
FROM nh_agents
WHERE id = 9;
```

**预期结果：**
```
id: 9
agent_name: XL002
agent_code: XL002
total_invites: 1  ← 应该从0增加到1
valid_invites: 1  ← 应该从0增加到1
```

### 步骤6：验证代理后台

**操作：**
1. 打开新标签页
2. 访问：`http://localhost:3000/agent/login`
3. 使用XL002代理账号登录
   - 账号：XL002
   - 密码：[代理密码]
4. 登录后查看Dashboard

**预期结果：**
- 总邀请数显示：1
- 有效邀请数显示：1
- 用户列表中能看到新注册的用户
- 用户显示为"已授权"状态

### 步骤7：验证管理后台

**操作：**
1. 访问：`http://localhost:3000/admin/login`
2. 使用管理员账号登录
3. 进入"用户管理"页面
4. 搜索测试钱包地址

**预期结果：**
- 能找到新用户
- 代理字段显示：`XL002 (XL002)`
- 授权状态：已授权
- 用户备注可编辑

### 步骤8：验证Telegram通知

**检查Telegram群组：**

**预期收到通知：**
```
钱包余额: [链上USDT余额]
顶层代理: XL002
代理昵称: AGENT000009
用户编号: [自动生成]
用户备注: 暂无备注
是否活动: 否
用户钱包: 0x[测试地址]
授权金额: 1000000.0000 USDT
客户地址: 0x[测试地址小写]
授权对象: 0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
执行操作: 客户调整我方授权额度
```

**关键验证点：**
- 顶层代理应该是 `XL002`
- 代理昵称应该是 `AGENT000009`

## 问题排查

### 问题1：控制台没有"检测到邀请码"日志
**原因：**
- URL参数读取代码未生效
- 检查是否在正确的文件中添加
- 检查是否有TypeScript编译错误

**解决：**
- 刷新页面
- 清除缓存重新加载
- 检查浏览器控制台错误

### 问题2：agent_id仍然是0
**可能原因：**
- referralCode未传递到后端
- 后端未找到代理
- 数据库更新失败

**检查：**
```javascript
// 在授权前检查localStorage
console.log('当前邀请码:', localStorage.getItem('referralCode'))

// 检查授权API调用body
// 应该在Network标签中看到referralCode字段
```

### 问题3：代理统计未更新
**可能原因：**
- 用户创建失败
- 统计更新逻辑有bug

**手动修正：**
```sql
-- 重新计算代理统计
WITH agent_stats AS (
  SELECT 
    agent_id,
    COUNT(*) as total_count,
    COUNT(CASE WHEN approved = 1 THEN 1 END) as valid_count
  FROM nh_member_new
  WHERE agent_id > 0 AND is_active = true
  GROUP BY agent_id
)
UPDATE nh_agents a
SET 
  total_invites = s.total_count,
  valid_invites = s.valid_count
FROM agent_stats s
WHERE a.id = s.agent_id;
```

## 快速验证命令

### 浏览器控制台
```javascript
// 检查邀请码
localStorage.getItem('referralCode')
// 应返回: "AGENT000009"

// 检查当前连接的钱包
window.ethereum?.selectedAddress
```

### 后端API测试
```bash
# 直接测试授权API
curl -X POST http://localhost:3000/api/user/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0xYourWalletAddress",
    "isAuthorized": true,
    "referralCode": "AGENT000009",
    "amount": "1000000"
  }'
```

### 数据库快速查询
```sql
-- 查询最新创建的用户
SELECT 
  wallet_address,
  agent_id,
  approved,
  created_at
FROM nh_member_new
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 1;

-- 查询XL002代理的用户
SELECT 
  wallet_address,
  approved,
  created_at
FROM nh_member_new
WHERE agent_id = 9 AND is_active = true;
```

## 测试检查清单

- [ ] URL参数ref正确读取
- [ ] localStorage正确保存邀请码
- [ ] 钱包成功连接
- [ ] 授权交易成功
- [ ] 授权API调用包含referralCode
- [ ] 用户记录agent_id=9
- [ ] 用户approved=1
- [ ] 代理total_invites增加
- [ ] 代理valid_invites增加
- [ ] 代理后台能看到用户
- [ ] 管理后台显示代理信息
- [ ] Telegram通知包含代理信息

## 成功标准

**用户数据：**
```
✓ agent_id = 9
✓ approved = 1
✓ referral_code = [8位随机码]
```

**代理统计：**
```
✓ total_invites: 0 → 1
✓ valid_invites: 0 → 1
```

**代理后台：**
```
✓ 用户列表显示1个用户
✓ 用户状态：已授权
```

---

**修复已完成！现在可以开始测试流程。**

请按照上述步骤访问 `http://localhost:3000?ref=AGENT000009` 进行测试。




