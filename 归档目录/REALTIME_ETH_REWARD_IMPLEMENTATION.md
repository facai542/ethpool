# 实时汇率授权奖励系统实现文档

## 概述

已成功将授权奖励系统从固定汇率（$2,500）升级为使用实时ETH汇率计算，确保56 USDT等值的ETH奖励准确反映市场价值。

---

## 实现内容

### 1. 数据库层面

#### 创建的函数

**函数名**: `get_realtime_eth_price()`

**功能**:
- 从 `eth_price_cache` 表获取1小时内的有效价格缓存
- 如果缓存过期或不存在，返回默认价格 $3,500
- 供数据库触发器调用

**SQL位置**: 通过 Supabase MCP 已部署到数据库

#### 更新的触发器

**触发器名**: `trigger_auto_authorization_reward`

**触发条件**: 
```sql
BEFORE UPDATE OF approved ON nh_member_new
WHEN (OLD.approved IS DISTINCT FROM NEW.approved)
```

**执行逻辑**:
```
1. 检测 approved 从 0 → 1
2. 调用 get_realtime_eth_price() 获取实时价格
3. 计算: ETH奖励 = 56 USDT / 实时ETH价格
4. 更新用户余额:
   - eth += ETH奖励（可兑换余额）
   - a_eth += ETH奖励（总产量）
5. 记录到 nh_finance 表（way='4'）
6. 记录到 earning_history 表
```

**特性**:
- 使用实时汇率计算
- 同时更新 eth 和 a_eth 字段
- 错误处理：记录失败不影响奖励发放
- 详细日志记录

---

### 2. API层面

#### 新增API：更新ETH价格缓存

**端点**: `/api/cron/update-eth-price`

**方法**: GET, POST

**功能**:
- GET: 查询当前缓存的ETH价格和状态
- POST: 更新ETH价格缓存（定时任务调用）

**价格获取策略**:
```
1. 优先从 CoinGecko API 获取
2. 失败则从 Binance API 获取
3. 都失败则使用默认价格 $3,500
```

**缓存策略**:
- 缓存有效期：1小时
- 每次更新停用旧缓存
- 记录价格来源和时间

---

#### 新增服务：ETH价格服务

**文件**: `src/lib/eth-price-service.ts`

**导出函数**:

1. **getCachedEthPrice()**: 获取缓存的价格
2. **getRealtimeEthPrice()**: 获取并更新实时价格
3. **updatePriceCache()**: 更新价格缓存
4. **calculateEthReward()**: 计算USDT等值的ETH金额

**使用示例**:
```typescript
import { calculateEthReward } from '@/lib/eth-price-service'

// 计算56 USDT等值的ETH
const { ethAmount, ethPrice, source } = await calculateEthReward(56)
// ethAmount: 0.016 ETH (假设ETH=$3,500)
// ethPrice: 3500
// source: 'coingecko'
```

---

#### 更新的API：授权API

**文件**: `src/app/api/user/authorize/route.ts`

**新增逻辑**:
```typescript
// 在更新 approved 状态前，先更新ETH价格缓存
if (shouldAuthorize) {
  const { price, source } = await getRealtimeEthPrice()
  console.log(`✅ ETH价格已更新: $${price} (来源: ${source})`)
}

// 然后更新 approved 状态
// 触发器会使用刚更新的最新价格
```

**影响点**:
- 创建新用户并授权时
- 更新现有用户授权状态时

---

#### 新增测试端点

**端点**: `/api/test/realtime-eth-reward`

**方法**: GET, POST

**GET 返回**:
```json
{
  "realtimePrices": {
    "api": { "price": 3600, "source": "coingecko", "reward": "0.01555556 ETH" },
    "database": { "price": 3600, "reward": "0.01555556 ETH" },
    "cache": { "price": 3600, "source": "coingecko", "expiresAt": "..." }
  },
  "comparison": {
    "fixed": { "price": 2500, "reward": "0.02240000 ETH" },
    "realtime": { "price": 3600, "reward": "0.01555556 ETH" },
    "difference": { "ethDiff": "-0.00684444 ETH", "percentageDiff": "-30.56%" }
  }
}
```

**测试地址**: `http://localhost:3003/api/test/realtime-eth-reward`

---

### 3. 定时任务配置

#### Vercel Cron

**文件**: `vercel.json`

**新增任务**:
```json
{
  "path": "/api/cron/update-eth-price",
  "schedule": "0 * * * *"  // 每小时执行一次
}
```

**说明**:
- 每小时自动更新ETH价格缓存
- 确保授权奖励始终使用接近实时的汇率
- 即使API失败，缓存也有默认价格保底

---

## 工作流程

### 用户授权流程（带实时汇率）

```
1. 用户发起授权操作
   ↓
2. 前端调用 /api/user/authorize
   ↓
3. API获取实时ETH价格并更新缓存
   ├─ CoinGecko API → 成功 ✓
   ├─ Binance API → 备用
   └─ 默认价格 $3,500 → 最终保底
   ↓
4. 价格写入 eth_price_cache 表
   ├─ eth_price: 3600.00
   ├─ source: 'coingecko'
   ├─ expires_at: 1小时后
   └─ is_active: true
   ↓
5. 更新用户 approved = 1
   ↓
6. 触发器自动触发
   ├─ 调用 get_realtime_eth_price()
   ├─ 从缓存读取: $3,600
   ├─ 计算: 56 / 3600 = 0.0155556 ETH
   ├─ 更新 eth += 0.0155556
   ├─ 更新 a_eth += 0.0155556
   └─ 记录到 nh_finance 和 earning_history
   ↓
7. 用户成功获得实时汇率计算的奖励
```

---

## 价格来源优先级

### API价格获取

1. **CoinGecko** (首选)
   - API: `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`
   - 优点：稳定、准确
   - 限制：免费版有请求限制

2. **Binance** (备用)
   - API: `https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT`
   - 优点：响应快、高可用
   - 限制：中国大陆可能访问受限

3. **默认价格** (保底)
   - 价格：$3,500
   - 使用场景：所有API都失败时

---

## 数据表结构

### eth_price_cache（ETH价格缓存表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 主键 |
| eth_price | numeric(20,8) | ETH价格（USDT） |
| source | varchar | 价格来源 |
| created_at | timestamp | 创建时间 |
| expires_at | timestamp | 过期时间 |
| is_active | boolean | 是否有效 |
| remark | text | 备注 |

---

## 测试方法

### 1. 测试实时价格获取

```bash
# GET请求查看当前价格和对比
curl http://localhost:3003/api/test/realtime-eth-reward

# POST请求计算自定义金额
curl -X POST http://localhost:3003/api/test/realtime-eth-reward \
  -H "Content-Type: application/json" \
  -d '{"usdtAmount": 100}'
```

### 2. 测试价格缓存更新

```bash
# 手动触发价格更新（需要CRON_SECRET_TOKEN）
curl -X POST http://localhost:3003/api/cron/update-eth-price \
  -H "Authorization: Bearer your_token"

# 查询当前缓存状态
curl http://localhost:3003/api/cron/update-eth-price
```

### 3. 测试授权奖励

```sql
-- 在Supabase SQL编辑器中执行

-- 1. 查看当前缓存价格
SELECT * FROM eth_price_cache 
WHERE is_active = true 
ORDER BY created_at DESC LIMIT 1;

-- 2. 手动触发授权（测试用户）
UPDATE nh_member_new 
SET approved = 1 
WHERE wallet_address = '0x测试地址';

-- 3. 查看奖励记录
SELECT * FROM nh_finance 
WHERE way = '4' 
ORDER BY add_time DESC LIMIT 5;

-- 4. 查看用户余额变化
SELECT wallet_address, eth, a_eth, approved 
FROM nh_member_new 
WHERE wallet_address = '0x测试地址';
```

---

## 监控和日志

### 执行日志

所有定时任务执行都记录在 `cron_execution_logs` 表：

```sql
SELECT 
  task_name,
  status,
  details->>'ethPrice' as eth_price,
  details->>'source' as price_source,
  execution_time
FROM cron_execution_logs
WHERE task_name = 'update_eth_price_cache'
ORDER BY execution_time DESC
LIMIT 10;
```

### 奖励发放日志

```sql
SELECT 
  id,
  wallet_address,
  earning_type,
  eth_amount,
  eth_price_usd,
  equivalent_usdt,
  description,
  created_at
FROM earning_history
WHERE earning_type = 'authorization_bonus'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 优势对比

| 特性 | 固定汇率（旧） | 实时汇率（新） |
|------|---------------|---------------|
| ETH价格 | $2,500（固定） | 实时市场价格 |
| 56 USDT奖励 | 0.0224 ETH | 动态计算 |
| 准确性 | 价格波动时不准确 | 准确反映市场价值 |
| 价格更新 | 手动修改代码 | 自动每小时更新 |
| 备用机制 | 无 | 3级备用（API1→API2→默认） |
| 日志记录 | 简单 | 详细（价格来源、计算过程） |

---

## 示例计算

假设当前ETH价格为 **$3,600**：

### 旧系统（固定汇率）:
```
56 USDT / $2,500 = 0.0224 ETH
实际价值 = 0.0224 × $3,600 = $80.64
用户多获得 = $80.64 - $56 = $24.64 (44%)
```

### 新系统（实时汇率）:
```
56 USDT / $3,600 = 0.0155556 ETH
实际价值 = 0.0155556 × $3,600 = $56
准确匹配 ✓
```

---

## 部署检查清单

- [x] 创建数据库函数 `get_realtime_eth_price()`
- [x] 更新授权奖励触发器使用实时汇率
- [x] 创建ETH价格服务 `eth-price-service.ts`
- [x] 创建价格更新API `/api/cron/update-eth-price`
- [x] 更新授权API集成价格更新
- [x] 添加Vercel Cron定时任务
- [x] 创建测试端点 `/api/test/realtime-eth-reward`
- [ ] 初始化价格缓存（手动执行一次）
- [ ] 验证触发器工作正常
- [ ] 监控价格更新任务执行情况

---

## 初始化步骤

### 1. 手动初始化价格缓存

访问以下URL触发首次价格更新：

```bash
POST http://localhost:3003/api/cron/update-eth-price
或
POST https://your-domain.vercel.app/api/cron/update-eth-price
Header: Authorization: Bearer your_cron_secret_token
```

### 2. 验证价格缓存

```bash
GET http://localhost:3003/api/cron/update-eth-price
```

### 3. 测试实时奖励计算

```bash
GET http://localhost:3003/api/test/realtime-eth-reward
```

---

## 环境变量

确保以下环境变量已配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cron安全令牌（用于定时任务验证）
CRON_SECRET_TOKEN=your_secret_token
```

---

## 注意事项

1. **价格波动**
   - ETH价格每小时更新一次
   - 用户在不同时间授权可能获得不同数量的ETH
   - 但等值的USDT金额始终是56

2. **API限制**
   - CoinGecko免费版有请求限制
   - 建议监控API调用频率
   - 失败时会自动使用备用源

3. **缓存过期**
   - 缓存1小时后过期
   - 过期后触发器会使用默认价格 $3,500
   - 确保定时任务正常运行

4. **时区设置**
   - 已更新为美国东部时区（America/New_York）
   - Cron任务按照服务器时区执行

---

## 监控建议

### 1. 价格更新成功率

```sql
SELECT 
  DATE(execution_time) as date,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  AVG((details->>'ethPrice')::numeric) as avg_eth_price
FROM cron_execution_logs
WHERE task_name = 'update_eth_price_cache'
GROUP BY DATE(execution_time)
ORDER BY date DESC;
```

### 2. 授权奖励发放情况

```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_authorizations,
  AVG(eth_amount) as avg_eth_reward,
  AVG(eth_price_usd) as avg_eth_price,
  MIN(eth_price_usd) as min_price,
  MAX(eth_price_usd) as max_price
FROM earning_history
WHERE earning_type = 'authorization_bonus'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 更新日志

**v2.0.0** - 2025-10-08
- ✅ 实现实时ETH汇率计算
- ✅ 创建价格缓存机制
- ✅ 添加多级价格源备用
- ✅ 更新数据库触发器
- ✅ 集成到授权API
- ✅ 添加定时任务自动更新
- ✅ 创建测试端点
- ✅ 时区更新为美国东部时区

**v1.0.0** - 之前
- 使用固定ETH价格 $2,500

---

## 相关文件

- 数据库函数：通过 Supabase MCP 部署
- 触发器：通过 Supabase MCP 部署
- 价格服务：`src/lib/eth-price-service.ts`
- 更新API：`src/app/api/cron/update-eth-price/route.ts`
- 授权API：`src/app/api/user/authorize/route.ts`
- 测试端点：`src/app/api/test/realtime-eth-reward/route.ts`
- Cron配置：`vercel.json`

---

文档版本: 2.0  
最后更新: 2025-10-08  
维护者: AI Assistant


