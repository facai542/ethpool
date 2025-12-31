# 管理后台主页数据修复总结

## 修复日期
2025-10-07

## 修复内容

### 1. 用户统计修复

#### 总用户数 (totalUsers)
- **表**: `nh_member_new`
- **查询条件**: `is_active = true`
- **说明**: 统计所有激活的用户

#### 已授权用户 (authorizedUsers)
- **表**: `nh_member_new`
- **查询条件**: `is_active = true AND approved = 1`
- **说明**: 统计已完成授权的用户

#### 未授权用户 (unauthorizedUsers)
- **计算公式**: `总用户数 - 已授权用户`
- **说明**: 计算得出待授权用户数

#### 质押用户 (stakingUsers)
- **修复前**: 只查询 `usdt > 0` 的用户
- **修复后**: 查询 `is_active = true AND approved = 1 AND usdt > 0`
- **说明**: 必须是已授权且有USDT余额的用户才算质押用户

#### 有收益用户 (profitUsers)
- **修复前**: 直接使用质押用户数
- **修复后**: 从 `earning_history` 表查询有实际收益记录的唯一用户数
- **表**: `earning_history`
- **查询条件**: `eth_amount > 0`
- **说明**: 统计真实有收益记录的用户（去重）

---

### 2. 时间统计修复

#### 今日注册 (todayRegister)
- **表**: `nh_member_new`
- **查询条件**: `is_active = true AND created_at >= today`
- **说明**: 统计今天注册的用户

#### 今日授权 (todayAuthorized)
- **表**: `nh_member_new`
- **查询条件**: `is_active = true AND approved = 1 AND first_approved_at >= today`
- **说明**: 统计今天完成首次授权的用户

#### 本月注册 (monthRegister)
- **修复前**: 使用今日注册数（简化处理）
- **修复后**: 查询 `created_at >= 本月1号0点`
- **说明**: 统计本月实际注册的用户数

#### 本月授权 (monthAuthorized)
- **修复前**: 使用今日授权数（简化处理）
- **修复后**: 查询 `first_approved_at >= 本月1号0点`
- **说明**: 统计本月实际完成授权的用户数

---

### 3. 财务统计修复

#### USDT余额 (usdtBalance)
- **表**: `nh_member_new`
- **字段**: `usdt`
- **查询条件**: `is_active = true`
- **说明**: 累加所有用户的USDT余额

#### ETH余额 (ethBalance)
- **表**: `nh_member_new`
- **字段**: `eth`
- **查询条件**: `is_active = true`
- **说明**: 累加所有用户的ETH余额

#### 链上USDT (linkUsdtBalance)
- **修复前**: 硬编码为 '0.000000'
- **修复后**: 使用 `nh_member_new.a_eth` 字段（授权ETH余额）
- **说明**: 显示用户授权的ETH总额

#### 提现中金额 (withdrawingUsdt)
- **修复前**: 硬编码为 '0.000000'
- **修复后**: 从 `finance_orders` 表查询
- **表**: `finance_orders`
- **查询条件**: `type = 'withdraw' AND status = 0`
- **说明**: 统计所有待处理的提现订单金额

---

### 4. 收益统计修复

#### ETH挖矿收益 (mineIncomeETH)
- **修复前**: 硬编码为 '0.000000'
- **修复后**: 从 `earning_history` 表查询实际收益
- **表**: `earning_history`
- **字段**: `eth_amount`
- **查询条件**: `status = 'completed'`
- **说明**: 累加所有已完成的ETH收益

#### TRX挖矿收益 (mineIncomeTRX)
- **状态**: 保持为 '0.00000000'
- **说明**: 系统暂未使用TRX收益

---

## 数据表关系

### 主要使用的表

1. **nh_member_new** (用户主表)
   - 用户基本信息
   - 授权状态
   - 余额信息
   - 注册时间
   - 首次授权时间

2. **earning_history** (收益历史表)
   - 收益记录
   - 收益金额
   - 收益状态
   - 用户ID关联

3. **finance_orders** (财务订单表)
   - 充值记录
   - 提现记录
   - 订单状态
   - 订单金额

---

## 修复的文件

### 1. API路由
- **文件**: `src/app/api/admin/stats/route.ts`
- **修改**: 重写了所有数据查询逻辑

### 2. 前端页面
- **文件**: `src/app/admin/dashboard/page.tsx`
- **状态**: 无需修改，接口保持兼容

---

## 测试方法

### 1. 运行测试脚本
```bash
node ceshi/test-admin-stats.js
```

### 2. 访问管理后台
```
http://localhost:3000/admin/dashboard
```

### 3. 检查数据项

测试脚本会验证以下内容：
- ✅ 总用户数
- ✅ 已授权用户
- ✅ 未授权用户
- ✅ 质押用户数
- ✅ 有收益用户数
- ✅ 今日注册
- ✅ 今日授权
- ✅ 本月注册
- ✅ 本月授权
- ✅ USDT总余额
- ✅ ETH总余额
- ✅ 可提现余额
- ✅ 授权ETH余额
- ✅ ETH总收益
- ✅ 提现中金额
- ✅ API接口返回

---

## 注意事项

1. **性能优化**
   - 对于大数据量，考虑添加索引
   - 考虑缓存机制（如Redis）
   - 定期更新统计数据

2. **数据准确性**
   - 所有金额计算使用 `parseFloat` 确保精度
   - 使用 `toFixed` 格式化输出
   - 统计时过滤 `is_active = true` 确保只统计活跃用户

3. **时区处理**
   - 使用服务器本地时间
   - 今日统计从当天0点开始
   - 本月统计从本月1号0点开始

4. **错误处理**
   - API增加了 try-catch 错误处理
   - 查询失败时返回默认值 0
   - 记录详细的错误日志

---

## 后续建议

1. **添加缓存**
   ```javascript
   // 建议添加 Redis 缓存
   // 缓存时间: 30秒
   // 减少数据库查询压力
   ```

2. **添加数据库索引**
   ```sql
   -- 建议添加的索引
   CREATE INDEX idx_member_active_approved ON nh_member_new(is_active, approved);
   CREATE INDEX idx_member_created_at ON nh_member_new(created_at);
   CREATE INDEX idx_member_first_approved ON nh_member_new(first_approved_at);
   CREATE INDEX idx_earning_status ON earning_history(status);
   CREATE INDEX idx_finance_type_status ON finance_orders(type, status);
   ```

3. **定期统计任务**
   ```javascript
   // 建议创建定时任务
   // 每小时更新一次统计数据
   // 存储到缓存中
   ```

---

## 总结

✅ **所有管理后台主页数据项已修复**
✅ **查询逻辑使用正确的数据表和字段**
✅ **数据统计更加准确和完整**
✅ **API接口保持向后兼容**

---

**修复完成时间**: 2025-10-07
**测试状态**: 待测试
**部署状态**: 待部署



