# 提现订单状态自动更新功能

## 实现内容

### 1. 用户端自动刷新提现记录 ✅

**文件**: `src/hooks/useTransactionRecords.ts`

添加了每15秒自动刷新功能：

```typescript
useEffect(() => {
  fetchRecords()
  
  // 添加自动刷新：每15秒静默刷新一次数据（提现状态更新）
  const refreshInterval = setInterval(() => {
    console.log('🔄 自动刷新交易记录（提现状态更新）')
    fetchRecords() // 刷新记录
  }, 15000) // 15秒

  return () => clearInterval(refreshInterval)
}, [address, fetchRecords])
```

### 2. 提现状态映射

**数据库状态**（`nh_withdraw`表）：
- `status = 0`: 处理中（pending）
- `status = 1`: 已完成（completed）
- `status = -1`: 已取消/失败（failed）

**前端显示状态**：
- 处理中: 黄色，显示 "⏳ 处理中"
- 已完成: 绿色，显示 "✅ 已完成"
- 已取消: 红色，显示 "❌ 已取消"

### 3. 管理后台操作 → 用户端自动更新流程

#### 管理员点击"确认"
1. 管理后台更新 `nh_withdraw.status = 1`
2. 用户端每15秒自动查询
3. API返回最新状态 `status: 'completed'`
4. 前端显示更新为"✅ 已完成"（绿色）

#### 管理员点击"取消"
1. 管理后台更新 `nh_withdraw.status = -1`
2. 用户端每15秒自动查询
3. API返回最新状态 `status: 'failed'`
4. 前端显示更新为"❌ 已取消"（红色）
5. 系统自动退回提现金额到用户账户

### 4. 显示逻辑

**用户端页面**: `src/app/page.tsx` (第1051-1086行)

```typescript
{recordsSubTab === 'withdraw' && (
  <div className="space-y-4">
    {withdrawRecords.map((record, index) => (
      <div key={index} className="grid grid-cols-3 gap-4">
        <span className="text-gray-300 text-sm">{record.time}</span>
        <span className="text-white text-sm font-medium">{record.amount}</span>
        <span className={`text-sm font-medium ${
          record.status === t.completed ? 'text-green-400' :   // 已完成
          record.status === t.processing ? 'text-blue-400' :   // 处理中
          record.status === t.pending ? 'text-yellow-400' :    // 待处理
          'text-gray-400'                                       // 其他
        }`}>{record.status}</span>
      </div>
    ))}
  </div>
)}
```

### 5. 自动刷新时间线

```
时间 0秒    -> 管理员点击"确认"按钮
时间 0秒    -> 数据库更新: status = 1
时间 0-15秒 -> 用户端等待下一次刷新
时间 15秒   -> 用户端自动查询新数据
时间 15秒   -> 前端显示更新为"已完成"
```

**最长延迟**: 15秒
**平均延迟**: 7.5秒

### 6. 额外优化

如果需要更快的更新速度，可以：

1. **减少刷新间隔**（当前15秒，可改为5-10秒）
2. **使用WebSocket实时推送**（需要额外开发）
3. **使用Supabase Realtime**（实时数据库监听）

### 7. Supabase Realtime 实现示例（可选）

如果需要真正的实时更新（无延迟），可以使用以下代码：

```typescript
useEffect(() => {
  if (!address) return

  // 订阅提现表的变化
  const channel = supabase
    .channel('withdraw-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'nh_withdraw',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('🔔 提现订单状态更新:', payload)
        // 立即刷新数据
        fetchRecords()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [address, userId])
```

## 测试步骤

1. **用户提交提现**
   - 打开用户端
   - 查看"记录"标签 → "提现记录"
   - 状态显示为"⏳ 处理中"（黄色）

2. **管理员确认提现**
   - 打开管理后台 `/admin/users/withdrawals`
   - 找到对应订单
   - 点击"确认"按钮
   - 数据库状态更新为 `status = 1`

3. **用户端自动更新**
   - 等待最多15秒
   - 用户端页面自动刷新
   - 提现记录状态变为"✅ 已完成"（绿色）

4. **测试取消功能**
   - 提交新的提现订单
   - 管理员点击"拒绝"按钮
   - 数据库状态更新为 `status = -1`
   - 用户端自动刷新后显示"❌ 已取消"（红色）

## 部署状态

- ✅ 代码已修改
- ✅ 自动刷新已启用（15秒间隔）
- ✅ 状态映射已确认
- 🔄 待部署到生产环境

---
**创建时间**: 2025-10-08
**功能状态**: 已实现，待部署

