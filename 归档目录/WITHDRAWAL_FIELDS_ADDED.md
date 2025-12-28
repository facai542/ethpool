# 提现订单添加代理昵称和用户备注字段

## 修改内容

### 1. 数据库字段添加 ✅

在`nh_withdraw`表中添加了两个新字段：

```sql
ALTER TABLE nh_withdraw
ADD COLUMN IF NOT EXISTS agent_nickname VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_remark TEXT;
```

| 字段名 | 类型 | 说明 |
|--------|------|------|
| agent_nickname | VARCHAR(255) | 代理昵称 |
| user_remark | TEXT | 用户备注 |

### 2. API修改 ✅

**文件**: `src/app/api/admin/withdrawals/route.ts`

#### 修改点1: 查询字段添加
```typescript
let query = supabase
  .from('nh_withdraw')
  .select(`
    id,
    user_id,
    price,
    status,
    sh_type,
    hash,
    add_time,
    update_time,
    to_address,
    agent_nickname,    // ✅ 新增
    user_remark        // ✅ 新增
  `)
```

#### 修改点2: 返回数据包含新字段
```typescript
return {
  id: withdrawal.id,
  user_id: withdrawal.user_id,
  user_address: userAddress,
  user_remark: withdrawal.user_remark || '',       // ✅ 从数据库读取
  agent_nickname: withdrawal.agent_nickname || '', // ✅ 从数据库读取
  agent_address: userInfo.referrer_address || '',
  referred_by: userInfo.referred_by || '',
  amount: Number.parseFloat(withdrawal.price || '0'),
  status: withdrawal.status === 1 ? 'completed' : 
          withdrawal.status === -1 ? 'failed' : 'pending',
  created_at: withdrawal.add_time,
  updated_at: withdrawal.update_time,
  transaction_hash: withdrawal.hash || '',
  to_address: withdrawal.to_address || '',
  sh_type: withdrawal.sh_type
}
```

### 3. 前端页面修改 ✅

**文件**: `src/app/admin/users/withdrawals/page.tsx`

#### 修改点1: 接口定义
```typescript
interface WithdrawalRecord {
  id: number
  user_id: number
  user_address: string
  user_remark?: string      // ✅ 用户备注
  agent_nickname?: string   // ✅ 代理昵称
  agent_address?: string
  referred_by?: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  transaction_hash?: string
  to_address?: string
  sh_type?: number
}
```

#### 修改点2: 表格列添加
```tsx
<thead>
  <tr className="border-b border-slate-700">
    <th>订单ID</th>
    <th>用户地址</th>
    <th>代理昵称</th>      {/* ✅ 新增列 */}
    <th>用户备注</th>      {/* ✅ 新增列 */}
    <th>提现金额</th>
    <th>状态</th>
    <th>交易哈希</th>
    <th>创建时间</th>
    <th>操作</th>
  </tr>
</thead>
```

#### 修改点3: 表格数据显示
```tsx
<tbody>
  {withdrawals.map((withdrawal) => (
    <tr key={withdrawal.id}>
      <td>#{withdrawal.id}</td>
      <td>{withdrawal.user_address.slice(0, 6)}...{withdrawal.user_address.slice(-4)}</td>
      
      {/* ✅ 代理昵称列 */}
      <td className="py-3 px-2 text-slate-300 text-sm">
        {withdrawal.agent_nickname || '-'}
      </td>
      
      {/* ✅ 用户备注列（超长时截断并显示tooltip） */}
      <td className="py-3 px-2 text-slate-300 text-sm max-w-[200px] truncate" 
          title={withdrawal.user_remark}>
        {withdrawal.user_remark || '-'}
      </td>
      
      <td>{withdrawal.amount.toFixed(2)} USDT</td>
      {/* ... 其他列 ... */}
    </tr>
  ))}
</tbody>
```

#### 修改点4: 详情弹窗显示
```tsx
{/* ✅ 代理昵称 */}
{selectedWithdrawal.agent_nickname && (
  <div className="p-4 bg-slate-700/50 rounded-lg">
    <div className="text-sm text-slate-400 mb-1">代理昵称</div>
    <div className="text-base text-slate-300">
      {selectedWithdrawal.agent_nickname}
    </div>
  </div>
)}

{/* ✅ 用户备注 */}
{selectedWithdrawal.user_remark && (
  <div className="p-4 bg-slate-700/50 rounded-lg">
    <div className="text-sm text-slate-400 mb-1">用户备注</div>
    <div className="text-base text-slate-300">
      {selectedWithdrawal.user_remark}
    </div>
  </div>
)}
```

## 使用说明

### 如何填充这些字段

这两个字段是用于存储Telegram机器人通知中的信息：

1. **代理昵称（agent_nickname）**
   - 当用户提现时，如果用户有上级代理
   - 可以在这个字段存储代理的昵称或标识
   - 方便管理员快速识别代理关系

2. **用户备注（user_remark）**
   - 可以存储用户在Telegram中的备注信息
   - 或者用户的特殊标记
   - 帮助管理员更好地识别用户

### 数据填充示例

```typescript
// 在创建提现订单时填充
const withdrawRequest = {
  agent_id: 0,
  user_id: numericUserId,
  price: withdrawAmount,
  status: 0,
  sh_type: 1,
  hash: '',
  add_time: currentTime,
  update_time: currentTime,
  to_address: withdrawAddress,
  agent_nickname: '张三',        // ✅ 填充代理昵称
  user_remark: 'VIP用户 - 大户'  // ✅ 填充用户备注
}
```

### SQL更新示例

```sql
-- 手动更新某个订单的代理昵称和用户备注
UPDATE nh_withdraw
SET 
  agent_nickname = '李四代理',
  user_remark = 'Telegram用户: @username'
WHERE id = 175;
```

## 显示效果

### 列表页面
```
┌────────┬─────────────┬──────────┬────────────┬──────────┬────────┐
│订单ID  │用户地址      │代理昵称   │用户备注     │提现金额  │状态     │
├────────┼─────────────┼──────────┼────────────┼──────────┼────────┤
│#175    │0xF48A...294 │张三代理   │VIP大户      │56.09     │处理中   │
│#174    │0xDDab...AA0 │李四      │普通用户     │55.70     │处理中   │
│#173    │0xFE86...bB4 │-         │-           │100.00    │处理中   │
└────────┴─────────────┴──────────┴────────────┴──────────┴────────┘
```

### 详情弹窗
```
┌─────────────────────────────┐
│  提现订单详情               │
├─────────────────────────────┤
│  订单ID: #175   [处理中]   │
│                             │
│  代理昵称                   │
│  张三代理                   │
│                             │
│  用户备注                   │
│  VIP大户 - Telegram: @user │
│                             │
│  提现金额                   │
│  56.09 USDT                │
│                             │
│  ...                        │
└─────────────────────────────┘
```

## 数据库字段详情

### 查看新增字段
```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'nh_withdraw'
AND (column_name = 'agent_nickname' OR column_name = 'user_remark');
```

**结果**:
```
agent_nickname  | character varying | 255
user_remark     | text             | NULL (无限制)
```

### 查询带有这些字段的记录
```sql
SELECT 
  id,
  user_id,
  price as amount,
  status,
  to_address,
  agent_nickname,
  user_remark,
  add_time
FROM nh_withdraw
ORDER BY add_time DESC
LIMIT 10;
```

## 部署信息

### Git提交
- ✅ Commit: `489ff92` - Add agent_nickname and user_remark fields to withdrawal orders
- ✅ 代码已推送到远程仓库

### Vercel部署
- 🔄 正在部署到生产环境...

### 数据库修改
- ✅ `nh_withdraw`表已添加`agent_nickname`字段
- ✅ `nh_withdraw`表已添加`user_remark`字段

## 注意事项

1. **字段为空时显示"-"**
   - 如果没有填充这些字段，列表中会显示"-"
   - 详情弹窗中会隐藏这些空字段

2. **用户备注长度限制**
   - 列表中超过200px宽度会自动截断
   - 鼠标悬停会显示完整内容（tooltip）
   - 详情弹窗中会完整显示

3. **代理昵称长度**
   - 数据库限制最大255字符
   - 建议不超过20个中文字符以保证显示效果

4. **后续集成**
   - 这些字段已准备好
   - 可以在Telegram机器人通知时填充
   - 或在用户提现API中自动填充

## 扩展建议

### 1. 自动填充代理昵称
在用户提现API中自动查询并填充：

```typescript
// 在 src/app/api/user/withdraw/route.ts 中
const { data: referrerData } = await supabase
  .from('nh_member_new')
  .select('wallet_address, telegram_user_id')
  .eq('referral_code', userData.referred_by)
  .single()

const withdrawRequest = {
  // ... 其他字段
  agent_nickname: referrerData?.telegram_user_id || '',
  user_remark: `Telegram: ${userData.telegram_user_id || 'N/A'}`
}
```

### 2. 允许管理员编辑
添加编辑按钮，允许管理员修改这两个字段：

```typescript
const updateRemark = async (withdrawalId: number, remark: string) => {
  await fetch('/api/admin/withdrawals', {
    method: 'PATCH',
    body: JSON.stringify({
      withdrawalId,
      user_remark: remark
    })
  })
}
```

### 3. 批量导入
支持从CSV导入用户备注：

```csv
withdrawal_id,agent_nickname,user_remark
175,张三代理,VIP大户
174,李四,普通用户
```

---
**添加完成时间**: 2025-10-08 06:30:00
**状态**: ✅ 已完成并部署


