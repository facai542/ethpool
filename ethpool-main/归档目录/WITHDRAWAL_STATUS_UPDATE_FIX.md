# 提现订单状态更新修复总结

## 问题描述
管理后台提现订单页面无法确认和拒绝，提示失败。

## 根本原因
API中的状态映射不一致：

### 修复前（错误）
```typescript
// GET方法中 - failed映射为2
const statusMap = {
  'pending': 0,
  'completed': 1,
  'failed': 2  // ❌ 错误
}

// PATCH方法中 - failed映射为-1
status: status === 'failed' ? -1 : 0  // ✅ 正确

// 返回数据时的映射也有问题
status: withdrawal.status === 0 ? 'pending' : 
        withdrawal.status === 1 ? 'completed' : 'failed'
// ❌ 这会把所有非0和非1的值都当作failed
```

这导致：
1. GET请求查询failed状态时，查询的是`status=2`，但数据库中没有这个值
2. PATCH请求更新failed状态时，设置的是`status=-1`
3. 两者不匹配，导致状态更新失败

## 修复方案

### 1. 统一状态映射（✅ 已完成）

**nh_withdraw表的status字段值：**
- `0` = pending (待处理)
- `1` = completed (已完成)
- `-1` = failed (失败)

**修复后的GET方法：**
```typescript
// 状态筛选
const statusMap: { [key: string]: number } = {
  'pending': 0,
  'completed': 1,
  'failed': -1  // ✅ 修正为-1
}
```

**修复后的状态转换：**
```typescript
status: withdrawal.status === 1 ? 'completed' : 
        withdrawal.status === -1 ? 'failed' : 'pending'
// ✅ 明确判断每个状态值
```

**PATCH方法（无需修改）：**
```typescript
const updateData: any = {
  status: status === 'completed' ? 1 : status === 'failed' ? -1 : 0,
  update_time: new Date().toISOString()
}
```

## 修复的文件
- ✅ `src/app/api/admin/withdrawals/route.ts`

## 修复内容

### 1. GET方法 - 状态筛选（第37-46行）
```typescript
// 修复前
'failed': 2

// 修复后
'failed': -1
```

### 2. GET方法 - 总数查询（第76-85行）
```typescript
// 修复前
'failed': 2

// 修复后
'failed': -1
```

### 3. GET方法 - 状态转换（第127-128行）
```typescript
// 修复前
status: withdrawal.status === 0 ? 'pending' : 
        withdrawal.status === 1 ? 'completed' : 'failed',

// 修复后
status: withdrawal.status === 1 ? 'completed' : 
        withdrawal.status === -1 ? 'failed' : 'pending',
```

## 测试步骤

### 方法1: 浏览器测试（推荐）
1. 启动开发服务器: `npm run dev`
2. 访问: `http://localhost:3003/admin/users/withdrawals`
3. 找到一个"处理中"状态的提现订单
4. 点击绿色的✓按钮（批准提现）
5. 输入交易哈希（可选）
6. 查看是否成功更新为"已完成"状态

### 方法2: API测试
```powershell
# 1. 获取pending状态的提现记录
$response = Invoke-WebRequest -Uri "http://localhost:3003/api/admin/withdrawals?status=pending&limit=1"
$data = $response.Content | ConvertFrom-Json
$withdrawal = $data.data.withdrawals[0]
Write-Host "提现ID: $($withdrawal.id)"

# 2. 更新状态为completed
$body = @{
    withdrawalId = $withdrawal.id
    status = "completed"
    transactionHash = "0x1234567890abcdef"
} | ConvertTo-Json

$updateResponse = Invoke-WebRequest -Uri "http://localhost:3003/api/admin/withdrawals" `
    -Method PATCH `
    -ContentType "application/json" `
    -Body $body

$updateData = $updateResponse.Content | ConvertFrom-Json
Write-Host "更新结果: $($updateData.success)"

# 3. 验证更新结果
$verifyResponse = Invoke-WebRequest -Uri "http://localhost:3003/api/admin/withdrawals?search=$($withdrawal.id)"
$verifyData = $verifyResponse.Content | ConvertFrom-Json
Write-Host "当前状态: $($verifyData.data.withdrawals[0].status)"
```

### 方法3: 使用测试脚本
```bash
node ceshi/test-withdrawal-update.js
```

## 数据库验证

### 查看当前所有状态值
```sql
SELECT DISTINCT status, COUNT(*) as count
FROM nh_withdraw
GROUP BY status
ORDER BY status;
```

### 手动测试更新
```sql
-- 查看一个pending记录
SELECT id, price, status, add_time
FROM nh_withdraw
WHERE status = 0
LIMIT 1;

-- 更新为completed
UPDATE nh_withdraw
SET status = 1, update_time = NOW()
WHERE id = <记录ID>;

-- 验证更新
SELECT id, status, update_time
FROM nh_withdraw
WHERE id = <记录ID>;

-- 恢复为pending（如果需要）
UPDATE nh_withdraw
SET status = 0, update_time = NOW()
WHERE id = <记录ID>;
```

## 前端操作流程

### 批准提现（确认）
1. 用户点击绿色✓按钮
2. 弹出输入框要求输入交易哈希（可选）
3. 调用API: `PATCH /api/admin/withdrawals`
   ```json
   {
     "withdrawalId": 175,
     "status": "completed",
     "transactionHash": "0x..."
   }
   ```
4. 数据库更新: `status=1, update_time=NOW(), hash='0x...'`
5. 前端刷新列表，状态显示为"已完成"

### 拒绝提现
1. 用户点击红色×按钮
2. 弹出确认对话框
3. 调用API: `PATCH /api/admin/withdrawals`
   ```json
   {
     "withdrawalId": 175,
     "status": "failed"
   }
   ```
4. 数据库更新: `status=-1, update_time=NOW()`
5. 前端刷新列表，状态显示为"失败"

## 状态说明

| 数据库值 | 前端显示 | 颜色 | 可执行操作 |
|---------|---------|------|-----------|
| 0 | 处理中 | 黄色 | 批准、拒绝 |
| 1 | 已完成 | 绿色 | 仅查看 |
| -1 | 失败 | 红色 | 仅查看 |

## 常见问题

### 1. 点击批准/拒绝按钮后提示"更新失败"
**原因**: 可能是权限问题或网络错误
**解决**: 
- 打开浏览器开发者工具（F12）
- 查看Console标签的错误信息
- 查看Network标签中PATCH请求的响应

### 2. 更新成功但页面没有刷新
**原因**: 前端刷新逻辑问题
**解决**: 手动刷新页面（F5）

### 3. 数据库中status值不是0/1/-1
**原因**: 历史数据可能有其他值
**解决**: 运行SQL查询检查实际值，必要时更新数据库

## 后续建议

1. **添加操作日志**
   - 记录谁在什么时间批准/拒绝了哪个提现
   - 记录原因和备注

2. **添加批量操作**
   - 批量批准多个提现
   - 批量拒绝多个提现

3. **添加自动验证**
   - 检查交易哈希是否有效
   - 检查链上交易状态

---
**修复完成时间**: 2025-10-08 05:40:00
**状态**: ✅ 已修复并等待测试验证

