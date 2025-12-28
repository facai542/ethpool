# 测试地址列表 API

## 问题
Railway 显示 "当前监听 0 个地址"，但数据库中应该有已授权的用户。

## 可能的原因

### 1. Vercel 还未部署新的 API
- `/api/monitor/addresses` 是新创建的
- Vercel 可能还没有部署这个新 API

### 2. 数据库查询条件问题
- `approved = true` 条件可能不匹配
- `is_active = true` 条件可能不匹配

### 3. API 调用失败
- Railway 无法访问 Vercel API
- 网络问题或 API 错误

## 排查步骤

### 步骤 1：检查 Vercel 部署状态
访问：https://vercel.com/facai1422s-projects

查看是否有新的部署，是否包含：
- `src/app/api/monitor/addresses/route.ts`
- `src/app/api/transactions/record/route.ts`

### 步骤 2：手动测试 API
在浏览器访问：
```
https://ethmax.vercel.app/api/monitor/addresses
```

预期响应：
```json
{
  "success": true,
  "addresses": ["0x...", "0x..."],
  "count": 2,
  "timestamp": "2025-10-12T..."
}
```

如果返回 404，说明 Vercel 还未部署。

### 步骤 3：检查数据库
在 Supabase SQL Editor 执行：
```sql
SELECT 
  id,
  wallet_address, 
  approved, 
  is_active,
  created_at
FROM nh_member_new
WHERE approved = true 
  AND is_active = true
ORDER BY created_at DESC;
```

查看是否有符合条件的用户。

### 步骤 4：查看 Railway 错误日志
在 Railway 日志中搜索：
- "获取监听地址列表失败"
- "错误"
- "失败"

## 临时解决方案

如果 Vercel 部署较慢，可以临时修改 Railway 代码，直接返回测试地址：

```javascript
// 临时：直接返回已知的地址
async function fetchMonitoredAddresses() {
  // 返回最近两次授权的地址用于测试
  return [
    '0x41641A3803B8FaC9a5903dbBa5bBe5DCc2d69Df0',
    '0x417BF6595Bfcc8E4EDe65d7Ec625601980f6044B'
  ]
}
```

## 预期结果

修复后，Railway 日志应该显示：
```
📊 当前监听 2 个地址
```

然后当这些地址有 USDT 转账时，会收到 Telegram 通知。

