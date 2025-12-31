# 邀请奖励记录功能实现文档

## 功能概述

在用户端的"记录"标签页中新增"邀请奖励"子标签，显示基于邀请关系获得的奖励记录。

## 实现日期
2025-10-08

---

## 邀请奖励逻辑

### 基本规则
1. **邀请关系**：A用户（邀请人）通过邀请链接邀请B用户（被邀请人）授权加入矿池
2. **奖励计算**：A用户可获得B用户每日收益的10%作为邀请奖励
3. **奖励来源**：邀请奖励由矿池直接发放，不从被邀请人的收益中扣除

### 示例
- B用户链上钱包存入1000 USDT
- B用户每天可获得20 USDT的利润
- A用户每天可获得B用户利润的10%，即2 USDT（等值ETH）

---

## 数据库结构

### 邀请关系表 (`nh_member_new`)
```sql
- referral_code: TEXT    -- 用户的邀请码
- referred_by: TEXT      -- 被邀请人使用的邀请码
```

### 收益记录表 (`earning_history`)
```sql
- member_id: UUID              -- 用户ID
- wallet_address: TEXT         -- 钱包地址
- earning_type: TEXT           -- 收益类型（scheduled_reward, periodic_reward）
- eth_amount: NUMERIC          -- ETH金额
- equivalent_usdt: NUMERIC     -- 等值USDT金额
- created_at: TIMESTAMP        -- 创建时间
```

---

## 后端实现

### API端点修改

**文件**: `src/app/api/user/transactions/route.ts`

#### 1. 查询邀请关系
```typescript
// 查找使用该邀请码注册的用户
const { data: invitedUsers, error: invitedError } = await supabase
  .from('nh_member_new')
  .select('id, wallet_address, approved, created_at')
  .eq('referred_by', user.referral_code)
  .eq('approved', 1) // 只查询已授权的用户
  .order('created_at', { ascending: false })
```

#### 2. 计算邀请奖励
```typescript
for (const invitedUser of invitedUsers) {
  // 查询被邀请用户的收益记录
  const { data: inviteeEarnings } = await supabase
    .from('earning_history')
    .select('eth_amount, equivalent_usdt, created_at, description')
    .eq('member_id', invitedUser.id)
    .in('earning_type', ['scheduled_reward', 'periodic_reward'])
    .order('created_at', { ascending: false })
    .limit(20)

  // 为每条收益记录生成10%的邀请奖励
  inviteeEarnings.forEach((earning) => {
    const invitationReward = (earning.eth_amount || 0) * 0.1 // 10%邀请奖励
    const invitationRewardUsdt = (earning.equivalent_usdt || 0) * 0.1
    
    invitationRewards.push({
      inviter_id: user.id,
      invitee_address: invitedUser.wallet_address,
      invitation_reward_eth: invitationReward,
      invitation_reward_usdt: invitationRewardUsdt,
      based_on_earning: earning.eth_amount,
      reward_date: earning.created_at,
      description: `邀请奖励 - 来自 ${invitedUser.wallet_address} 的收益分成 (10%)`
    })
  })
}
```

#### 3. 添加到交易记录
```typescript
invitationRewards.forEach(reward => {
  transactions.push({
    type: 'Shared',
    amount: reward.invitation_reward_eth?.toString() || '0',
    token: 'ETH',
    time: reward.reward_date,
    status: 'success',
    description: reward.description,
    invitee_address: reward.invitee_address
  })
})
```

---

## 前端实现

### Hook修改

**文件**: `src/hooks/useTransactionRecords.ts`

#### 1. 添加SharedRecord接口
```typescript
interface SharedRecord {
  time: string
  address: string
  income: string
}
```

#### 2. 更新TransactionRecordsData接口
```typescript
interface TransactionRecordsData {
  exchangeRecords: ExchangeRecord[]
  withdrawRecords: WithdrawRecord[]
  earningsRecords: EarningsRecord[]
  sharedRecords: SharedRecord[]  // 新增
}
```

#### 3. 处理Shared记录
```typescript
const sharedRecords: SharedRecord[] = transactions
  .filter((tx: TransactionRecord) => tx.type === 'Shared')
  .map((tx: TransactionRecord) => ({
    time: formatTime(tx.time),
    address: tx.invitee_address || 'Unknown',
    income: `${Number.parseFloat(tx.amount || '0').toFixed(6)} ETH`
  }))
```

---

### 主页面修改

**文件**: `src/app/page.tsx`

#### 1. 标签映射修改
```typescript
// 记录子标签映射
const recordsTabMapping = ['exchange', 'withdraw', 'shared', 'earnings']
const getRecordsTabIndex = (tab: string) => recordsTabMapping.indexOf(tab)
const setRecordsTabByIndex = (index: number) => setRecordsSubTab(recordsTabMapping[index])
```

#### 2. 获取sharedRecords
```typescript
const { 
  exchangeRecords, 
  withdrawRecords, 
  earningsRecords, 
  sharedRecords,  // 新增
  loading: recordsLoading,
  refetch: refetchRecords
} = useTransactionRecords(account)
```

#### 3. 添加Shared标签
```typescript
<SlideTabs
  tabs={[
    t.exchangeRecords,
    t.withdrawRecords,
    t.invitationRewards,  // 新增
    t.earningsRecords
  ]}
  activeTab={getRecordsTabIndex(recordsSubTab)}
  onTabChange={setRecordsTabByIndex}
/>
```

#### 4. Shared标签页内容
```typescript
{recordsSubTab === 'shared' && (
  <div className="space-y-4">
    {/* 表格头 */}
    <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-600/30">
      <span className="text-gray-400 text-sm font-medium">{t.time}</span>
      <span className="text-gray-400 text-sm font-medium">{t.address}</span>
      <span className="text-gray-400 text-sm font-medium">{t.income}</span>
    </div>

    {/* 记录列表 */}
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {recordsLoading ? (
        <div className="flex justify-center py-8">
          <div className="text-gray-400">{t.loading}...</div>
        </div>
      ) : sharedRecords.length > 0 ? (
        sharedRecords.map((record, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
            <span className="text-gray-300 text-sm">{record.time}</span>
            <span className="text-blue-400 text-sm font-medium truncate" title={record.address}>
              {record.address.substring(0, 8)}...{record.address.substring(record.address.length - 6)}
            </span>
            <span className="text-green-400 text-sm font-medium">{record.income}</span>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          {t.noRecords}
        </div>
      )}
    </div>
  </div>
)}
```

---

## 国际化支持

**文件**: `src/lib/i18n.ts`

### 添加翻译键
```typescript
interface TranslationContent {
  // ...
  invitationRewards: string
  // ...
}
```

### 各语言翻译
- **English**: 'Shared'
- **Deutsch**: 'Geteilt'
- **Español**: 'Compartido'
- **Français**: 'Partagé'
- **Italiano**: 'Condiviso'
- **Русский**: 'Общий'
- **繁體中文**: '邀請獎勵'

---

## 显示格式

### 邀请奖励记录标签页

| 时间 | 地址 | 收入 |
|------|------|------|
| 2025-10-08 01:54:53 | 0x9999...9999 | 0.000100 ETH |
| 2025-10-07 22:00:04 | 0x9999...9999 | 0.000178 ETH |

### 字段说明
- **时间 (Time)**: 被邀请人获得收益的时间
- **地址 (Address)**: 被邀请人的钱包地址（缩略显示）
- **收入 (Income)**: 邀请人获得的邀请奖励（ETH）

---

## 测试端点

为了方便测试，创建了以下测试端点：

### 1. 邀请奖励测试
**URL**: `/api/test/invitation-rewards?wallet_address=<address>`

返回邀请奖励记录的详细信息，包括被邀请用户列表和奖励计算结果。

### 2. 简化邀请测试
**URL**: `/api/test/simple-invitation`

返回简化的邀请奖励记录，用于快速验证功能。

### 3. 调试端点
**URL**: `/api/test/debug-invitation?wallet_address=<address>`

返回详细的调试信息，包括用户信息、被邀请用户、邀请奖励记录等。

---

## 注意事项

### 1. 数据来源
- 邀请奖励记录是**实时计算**的，基于被邀请用户的 `earning_history` 表数据
- 目前未单独存储邀请奖励记录，每次查询时都会重新计算

### 2. 性能考虑
- 为了避免性能问题，目前限制每个被邀请用户最多查询最近20条收益记录
- 如果被邀请用户数量较多，可能需要增加缓存机制

### 3. 未来优化方向
- 考虑创建专门的邀请奖励记录表，存储已计算的邀请奖励
- 添加定时任务，自动计算并发放邀请奖励
- 增加邀请奖励的累计统计功能

---

## 相关文件清单

### 后端文件
- `src/app/api/user/transactions/route.ts` - 主要API端点
- `src/app/api/test/invitation-rewards/route.ts` - 测试端点
- `src/app/api/test/simple-invitation/route.ts` - 简化测试端点
- `src/app/api/test/debug-invitation/route.ts` - 调试端点

### 前端文件
- `src/hooks/useTransactionRecords.ts` - 交易记录Hook
- `src/app/page.tsx` - 主页面
- `src/lib/i18n.ts` - 国际化配置

---

## 修复记录

### 问题1: 标签切换无法打开收益记录列表
**原因**: 添加"邀请奖励"标签后，忘记更新标签映射数组 `recordsTabMapping`

**解决方案**: 
```typescript
// 修改前
const recordsTabMapping = ['exchange', 'withdraw', 'earnings']

// 修改后
const recordsTabMapping = ['exchange', 'withdraw', 'shared', 'earnings']
```

**修复日期**: 2025-10-08

---

## 总结

邀请奖励记录功能已成功实现，包括：

✅ 后端API支持邀请关系查询和奖励计算  
✅ 前端新增"邀请奖励"标签页显示  
✅ 国际化支持（7种语言）  
✅ 标签切换功能正常工作  
✅ 测试端点可用于验证功能  

用户现在可以在"记录"标签页的"邀请奖励"子标签中查看基于邀请关系获得的收益分成记录。

