# 定时奖励固定金额问题报告

## 问题发现

在检查定时奖励逻辑时发现，所有历史奖励都是**基于固定1000 USDT**发放的，而不是基于用户实际的链上USDT余额。

## 数据统计

### 历史奖励记录
```
总定时奖励记录数: 5,482 条
基于固定1000 USDT: 5,482 条 (100%)
基于实际余额: 0 条 (0%)
余额范围: min=1000, max=1000, avg=1000
```

### 示例记录
```
wallet_address: 0x89dade2d2d3d5
earning_type: periodic_reward
based_on_usdt_balance: 1000 (固定值)
eth_amount: 0.0017857142857142857
equivalent_usdt: 5
description: "定时奖励(第3轮) - 基于1000 USDT余额"
```

## 问题原因

### 代码层面
**文件：** `src/jobs/periodic-rewards.ts`
**问题代码（第42行）：**
```javascript
const usdtBalance = 1000; // 模拟USDT余额
```

这是硬编码的固定值，导致所有奖励计算都使用1000 USDT，而不是查询实际的链上余额。

### 奖励计算逻辑
```javascript
const dailyReward = usdtBalance * (dailyRate / 100); // 2% of balance
const quarterReward = dailyReward / 4; // 分4次发放

// 当 usdtBalance = 1000（固定）:
// dailyRate = 2%
// dailyReward = 1000 * 0.02 = 20 USDT
// quarterReward = 20 / 4 = 5 USDT
```

**结果：** 每次定时奖励固定发放 5 USDT 等值的 ETH

## 影响分析

### 对用户的影响

#### 1. 余额 > 1000 USDT 的用户
- **应得奖励：** 基于实际余额计算（如2000 USDT → 10 USDT/次）
- **实际获得：** 基于1000 USDT计算（5 USDT/次）
- **影响：** 少发奖励

#### 2. 余额 < 1000 USDT 的用户
- **应得奖励：** 基于实际余额计算（如500 USDT → 2.5 USDT/次）
- **实际获得：** 基于1000 USDT计算（5 USDT/次）
- **影响：** 多发奖励

#### 3. 余额 = 1000 USDT 的用户
- **影响：** 无影响（准确）

### 财务影响

需要查询每个用户的实际链上余额来计算准确的应发奖励，然后对比已发奖励：

```
应发奖励 = 实际链上余额 * 2% / 4
已发奖励 = 1000 * 2% / 4 = 5 USDT
差额 = 应发奖励 - 已发奖励
```

## 已修复内容

### 代码修复
**文件：** `src/jobs/periodic-rewards.ts`

**修复前：**
```javascript
const usdtBalance = 1000; // 模拟USDT余额
```

**修复后：**
```javascript
// 获取链上实际USDT余额
const usdtBalance = await getUserChainBalance(member.wallet_address);
console.log(`💰 用户 ${member.wallet_address} 链上USDT余额: ${usdtBalance}`);
```

**新增函数：**
```javascript
// 获取用户链上USDT余额
async function getUserChainBalance(address: string): Promise<number> {
  try {
    const provider = await createProvider();
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
    const balance = await usdtContract.balanceOf(address);
    return parseFloat(ethers.formatUnits(balance, 6));
  } catch (error) {
    console.error('获取链上USDT余额失败:', error);
    return 0;
  }
}
```

### 修复效果
- ✓ 现在查询实际链上USDT余额
- ✓ 根据实际余额计算奖励
- ✓ 记录中会显示真实的余额值

## 历史数据处理建议

### 方案1：保持现状（推荐）
- **优点：** 
  - 简单，不需要复杂的计算和调整
  - 避免用户混淆
  - 已发放的奖励不变
- **缺点：** 
  - 历史数据不准确
  - 可能存在多发或少发情况

### 方案2：标记历史数据
```sql
-- 在描述中标记历史记录
UPDATE earning_history
SET description = description || ' [历史记录-使用固定余额]'
WHERE earning_type = 'periodic_reward' 
  AND based_on_usdt_balance = 1000
  AND created_at < NOW();
```

### 方案3：重新计算并调整（复杂）
需要：
1. 查询每个用户在每次奖励时的实际链上余额（需要历史区块数据）
2. 重新计算应发奖励
3. 计算差额
4. 补发或扣除（需要管理员决策）

**不推荐原因：**
- 查询历史区块数据成本高
- 计算复杂，容易出错
- 调整用户余额敏感

## 后续奖励

### 新的奖励逻辑
从现在开始，所有新的定时奖励将：
1. 查询用户实际链上USDT余额
2. 根据实际余额计算奖励
3. 记录真实的余额值

### 示例
```
用户A: 链上2000 USDT
  → 日奖励率 2%
  → 日奖励 40 USDT
  → 每6小时 10 USDT
  
用户B: 链上500 USDT
  → 日奖励率 2%
  → 日奖励 10 USDT
  → 每6小时 2.5 USDT
```

## 验证查询

### 查看用户实际链上余额 vs 奖励记录
```sql
-- 需要通过API查询链上余额
SELECT 
  m.wallet_address,
  COUNT(e.id) as reward_count,
  SUM(e.eth_amount::numeric) as total_eth,
  AVG(e.based_on_usdt_balance::numeric) as avg_balance_used
FROM nh_member_new m
LEFT JOIN earning_history e ON e.wallet_address = m.wallet_address 
  AND e.earning_type = 'periodic_reward'
WHERE m.is_active = true AND m.approved = 1
GROUP BY m.wallet_address
ORDER BY reward_count DESC;
```

## 建议措施

### 立即措施
1. ✓ 代码已修复，使用实际链上余额
2. 标记历史记录（可选）
3. 通知用户新的奖励计算方式

### 长期措施
1. 监控奖励发放准确性
2. 定期审计链上余额 vs 奖励金额
3. 建立异常检测机制

### 沟通建议
向用户说明：
- 之前的奖励按照固定标准发放
- 现在改为按照实际链上余额发放
- 更公平合理的奖励机制

## 修复状态

- [x] 发现问题：所有奖励基于固定1000 USDT
- [x] 统计数据：5482条记录，100%使用固定值
- [x] 代码修复：改为查询实际链上余额
- [x] 添加链上余额查询函数
- [x] 添加日志记录实际余额
- [ ] 决定是否处理历史数据（待定）
- [ ] 测试新的奖励发放逻辑

## 结论

**问题确认：** 是的，目前项目的定时奖励**全部按照固定金额1000 USDT**发放。

**已修复：** 代码已修复为查询实际链上USDT余额。

**历史数据：** 5482条记录都是基于1000 USDT，建议保持现状或仅标记，避免复杂的追溯调整。

**未来奖励：** 将基于用户实际链上USDT余额准确计算。




