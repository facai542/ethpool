# 高级奖励系统文档

## 概述

本系统实现了基于用户链上USDT余额的定时奖励发放功能，支持多等级奖励机制，每日4次自动发放。

## 功能特性

### 1. 多等级奖励机制

| 链上USDT余额范围 | 奖励比例 | 每日奖励 | 单次奖励 |
|-----------------|---------|---------|---------|
| 1 - 4,999 USDT | 2% | 2% | 0.5% |
| 5,000 - 9,999 USDT | 2.5% | 2.5% | 0.625% |
| 10,000 - 99,999 USDT | 3% | 3% | 0.75% |
| 100,000 - 199,999 USDT | 4% | 4% | 1% |
| 200,000+ USDT | 5% | 5% | 1.25% |

### 2. 定时发放机制

- **频率**: 每6小时执行一次
- **每日次数**: 4次
- **建议执行时间**:
  - 00:00 UTC (北京时间 08:00)
  - 06:00 UTC (北京时间 14:00)
  - 12:00 UTC (北京时间 20:00)
  - 18:00 UTC (北京时间 02:00)

### 3. 链上余额验证

- 实时获取用户链上USDT余额
- 使用ETH主网USDT合约地址: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- 支持批量查询，提高效率

## 技术实现

### 1. 数据库结构

#### 奖励等级配置表 (reward_tiers)
```sql
CREATE TABLE reward_tiers (
    id SERIAL PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL,
    min_balance DECIMAL(18,6) NOT NULL,
    max_balance DECIMAL(18,6) NOT NULL,
    daily_rate DECIMAL(5,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 定时奖励发放记录表 (scheduled_rewards)
```sql
CREATE TABLE scheduled_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES nh_member(id),
    user_address TEXT NOT NULL,
    onchain_usdt_balance DECIMAL(18,6) NOT NULL,
    reward_tier_id INTEGER REFERENCES reward_tiers(id),
    daily_reward_usdt DECIMAL(18,6) NOT NULL,
    single_reward_usdt DECIMAL(18,6) NOT NULL,
    eth_price_usdt DECIMAL(18,6) NOT NULL,
    reward_eth DECIMAL(18,6) NOT NULL,
    distribution_time TIMESTAMP DEFAULT NOW(),
    is_distributed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 定时任务执行日志表 (cron_execution_logs)
```sql
CREATE TABLE cron_execution_logs (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    affected_records INTEGER DEFAULT 0,
    execution_time TIMESTAMP NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API端点

#### 基于链上余额的奖励发放
- **URL**: `/api/admin/distribute-rewards-with-onchain`
- **方法**: POST
- **功能**: 获取所有有效用户的链上USDT余额并发放奖励

#### 批量获取链上USDT余额
- **URL**: `/api/blockchain/batch-usdt-balance`
- **方法**: POST
- **功能**: 批量获取多个地址的链上USDT余额

#### 奖励记录查询
- **URL**: `/api/admin/distribute-advanced-rewards`
- **方法**: GET
- **功能**: 查询奖励发放记录和等级配置

### 3. 定时任务配置

#### Vercel Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/admin/distribute-rewards-with-onchain",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

#### 外部定时服务
- **URL**: `https://ethmax.vercel.app/api/admin/distribute-rewards-with-onchain`
- **方法**: POST
- **频率**: 每6小时
- **认证**: 无需认证

## 使用说明

### 1. 测试页面

访问 `/test-advanced-rewards` 页面可以：
- 查看奖励等级配置
- 测试奖励计算示例
- 执行奖励发放测试
- 查看奖励发放记录

### 2. 手动执行

```bash
# 测试基于链上余额的奖励发放
curl -X POST https://ethmax.vercel.app/api/admin/distribute-rewards-with-onchain

# 查询奖励记录
curl https://ethmax.vercel.app/api/admin/distribute-advanced-rewards
```

### 3. 监控和日志

- 所有奖励发放记录保存在 `scheduled_rewards` 表
- 定时任务执行日志保存在 `cron_execution_logs` 表
- 奖励记录同时写入 `finance_orders` 表，显示在兑换标签栏记录页面

## 奖励记录显示

奖励发放记录会显示在：
1. **兑换标签栏** → **记录标签页** → **收益记录列表**
2. 记录类型: `[定时奖励]`
3. 显示内容: 链上余额、奖励等级、ETH奖励金额

## 安全特性

1. **RLS策略**: 使用service role key绕过行级安全策略
2. **链上验证**: 实时获取链上余额，防止数据篡改
3. **批量处理**: 支持批量查询，提高效率
4. **错误处理**: 完善的错误处理和日志记录

## 部署说明

1. 确保环境变量已设置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. 部署到Vercel后，Cron Jobs会自动生效

3. 监控定时任务执行情况：
   ```sql
   SELECT * FROM cron_execution_logs 
   WHERE task_name = 'distribute_advanced_rewards' 
   ORDER BY execution_time DESC 
   LIMIT 10;
   ```

## 注意事项

1. **ETH价格**: 当前使用固定价格2500 USDT，建议集成实时价格API
2. **网络费用**: 批量查询链上余额会产生RPC调用费用
3. **执行时间**: 建议在低峰期执行，避免网络拥堵
4. **数据备份**: 定期备份奖励发放记录

## 更新日志

- **v1.0.0**: 初始版本，支持基于数据库余额的奖励发放
- **v1.1.0**: 添加基于链上余额的奖励发放功能
- **v1.2.0**: 添加定时任务和监控功能
- **v1.3.0**: 优化批量查询和错误处理
