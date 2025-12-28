# Telegram授权通知链上余额查询修复

## 问题描述

用户授权后，Telegram机器人通知显示：
```
钱包余额: 0.000000
```

但实际链上该地址有51 USDT余额。

## 问题原因

1. **地址格式问题**: `padStart(64, '0')`会将地址本身也填充，导致地址错误
2. **缺少日志**: 无法追踪查询过程
3. **区块号查询**: 不必要的额外请求

## 修复方案

### 修复1: 地址格式处理

**修复前**:
```typescript
data: `0x70a08231${address.slice(2).padStart(64, '0')}`
```
问题: `address.slice(2)`得到40个字符，`padStart(64, '0')`会在前面补24个0，地址本身不变。但如果地址长度不对会有问题。

**修复后**:
```typescript
const addressParam = address.toLowerCase().replace('0x', '').padStart(64, '0')
data: `0x70a08231000000000000000000000000${addressParam}`
```
改进: 先去除0x，然后在左侧补0到64位（前24位都是0，后40位是地址）

### 修复2: 移除不必要的区块号查询

**修复前**:
```typescript
// 1. 先查询最新区块号
const blockResponse = await fetch(...)
const blockNumber = blockData.result;

// 2. 再用区块号查询余额
params: [..., blockNumber]
```

**修复后**:
```typescript
// 直接使用'latest'
params: [..., 'latest']
```

### 修复3: 添加详细日志

```typescript
console.log(`🔍 开始查询链上USDT余额 - 地址: ${address}`)
console.log(`📡 RPC响应:`, JSON.stringify(balanceData))
console.log(`✅ 链上USDT余额查询成功: ${balanceFormatted} USDT`)
```

### 修复4: 使用授权地址字段

**数据库新增字段**:
```sql
ALTER TABLE nh_member_new 
ADD COLUMN auth_wallet_address VARCHAR(255);
```

**查询逻辑**:
```typescript
// 优先使用授权地址，如果没有则使用注册地址
const addressToQuery = memberData.auth_wallet_address || memberData.wallet_address || userAddress
console.log(`🔍 查询链上USDT余额 - 授权地址: ${addressToQuery}`)
const onChainUsdtBalance = await getOnChainUsdtBalance(addressToQuery);
```

### 修复5: 代理信息显示

**修复前**:
```typescript
const topAgent = hasReferrer ? '代理名称' : '默认代理'
const agentNickname = hasReferrer ? '代理昵称' : '直链授权'
```

**修复后**:
```typescript
if (memberData.agent_id && memberData.agent_id > 0) {
  const { data: agentData } = await supabase
    .from('nh_agents')
    .select('agent_name, referral_code')
    .eq('id', memberData.agent_id)
    .single()
  
  if (agentData) {
    topAgent = agentData.agent_name || '默认代理'
    agentNickname = agentData.referral_code || '直链授权'
  }
}
```

## 测试地址

测试地址: `0x6079Af2E39e8b9F841465E72d8CeF0eD34fF65af`

**数据库记录**:
- 注册地址: 0x6079Af2E39e8b9F841465E72d8CeF0eD34fF65af
- 授权地址: 0x6079Af2E39e8b9F841465E72d8CeF0eD34fF65af
- 质押余额: 56.009911836600004 USDT
- 可提现: 56.009911836600004 USDT

**期望结果**:
```
钱包余额: 51.000000  ← 应该显示链上实际余额
顶层代理: 默认代理
代理昵称: 直链授权
用户编号: XXXXXX
```

## 部署步骤

1. ✅ 数据库添加`auth_wallet_address`字段
2. ✅ 修复Edge Function查询逻辑
3. ✅ 代码已推送到GitHub
4. 🔄 需要重新部署Edge Function到Supabase

## 下一步

需要在Supabase控制台重新部署Edge Function：
```bash
supabase functions deploy telegram-notifier
```

或者等待自动部署完成后测试。

---
**修复时间**: 2025-10-08
**状态**: 代码已修复，等待部署测试

