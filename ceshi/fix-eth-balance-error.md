# 修复 "Could not find the 'eth' column of 'users'" 错误

## 问题分析

错误信息显示：`"Could not find the 'eth' column of 'users' in the schema cache"`

但代码已经修改为使用 `nh_member` 表，这意味着问题可能是：

1. **Supabase 客户端缓存问题**：Supabase 客户端缓存了旧的表结构信息
2. **服务端缓存问题**：Supabase 服务端缓存了旧的表结构信息
3. **环境变量问题**：使用了错误的 Supabase 环境变量

## 解决方案

### 方案1：验证 Supabase 环境变量

1. 检查 `.env.local` 文件中的 Supabase 环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. 确保这些变量指向正确的 Supabase 项目

### 方案2：清除所有缓存并重启

1. 停止所有 Node 进程：
   ```powershell
   taskkill /f /im node.exe
   ```

2. 删除所有缓存：
   ```powershell
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules/.cache
   ```

3. 重新安装依赖：
   ```powershell
   npm install
   ```

4. 重启开发服务器：
   ```powershell
   npm run dev
   ```

### 方案3：验证 Supabase 数据库表结构

登录 Supabase 控制台，确认：

1. `nh_member` 表存在
2. `nh_member` 表有 `eth` 字段
3. 没有 `users` 表（或 `users` 表不应该被使用）

### 方案4：手动测试 API

使用以下命令手动测试 API：

```powershell
# 测试更新 ETH 余额
curl -X POST http://localhost:3001/api/user/update-eth-balance `
  -H "Content-Type: application/json" `
  -d '{"address": "0xYourAddress", "ethAmount": "0.01", "reason": "test"}'
```

## 代码已修复的内容

文件：`src/app/api/user/update-eth-balance/route.ts`

1. **表名**：从 `users` 改为 `nh_member`
2. **字段**：使用正确的字段名称和格式
3. **时间格式**：统一使用 ISO 字符串格式
4. **日志记录**：使用 `nh_logs` 表记录操作日志

## 下一步操作

请按照以下步骤操作：

1. 停止当前开发服务器
2. 删除 `.next` 目录
3. 重新启动开发服务器
4. 尝试重新 verify
5. 如果仍然出现错误，请检查 Supabase 环境变量和数据库表结构

## 如果问题仍然存在

请提供以下信息：

1. `.env.local` 文件中的 Supabase 环境变量（请隐藏敏感信息）
2. Supabase 数据库中 `nh_member` 表的结构
3. 完整的错误日志

