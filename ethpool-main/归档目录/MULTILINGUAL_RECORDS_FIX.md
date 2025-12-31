# 记录类型多语言支持修复文档

## 修复日期
2025-10-08

---

## 问题描述

用户端记录标签页中的"兑换记录"、"提现记录"、"收益记录"等文字存在硬编码中文问题，导致多语言切换时这些文字无法正确翻译。

---

## 涉及的硬编码文字

### 原有问题
1. **兑换记录**: 硬编码为 `'兑换'`
2. **提现记录**: 硬编码为 `'提现'`
3. **收益记录**: 硬编码为 `'收益'`
4. **ETH奖励**: 硬编码为 `'ETH奖励'`, `'奖励'`
5. **收益率**: 硬编码为 `'奖励'`

---

## 修复方案

### 1. 使用国际化翻译键

**文件**: `src/hooks/useTransactionRecords.ts`

#### 修复前
```typescript
// 筛选兑换记录
.filter((tx: TransactionRecord) => 
  tx.type === '兑换' ||  // 硬编码中文
  tx.type === 'Exchange' || 
  tx.type === 'Swap'
)

// 筛选提现记录
.filter((tx: TransactionRecord) => 
  tx.type === 'Extract' || 
  tx.type === 'Withdraw' || 
  tx.type === '提现'  // 硬编码中文
)

// 筛选收益记录
.filter((tx: TransactionRecord) => 
  tx.type === 'ETH奖励' ||  // 硬编码中文
  tx.type === 'Reward' || 
  tx.type === '奖励' ||    // 硬编码中文
  (tx.type === '收益' && ...)  // 硬编码中文
)

// 收益率显示
rate: '奖励'  // 硬编码中文
```

#### 修复后
```typescript
// 使用国际化翻译（从 useI18n hook 获取）
const { t } = useI18n()

// 筛选兑换记录
.filter((tx: TransactionRecord) => 
  tx.type === t.exchange ||      // 多语言支持
  tx.type === t.exchangeRecords ||
  tx.type === 'Exchange' || 
  tx.type === 'Swap' ||
  tx.type === '兑换'  // 向后兼容旧数据
)

// 筛选提现记录
.filter((tx: TransactionRecord) => 
  tx.type === t.withdraw ||       // 多语言支持
  tx.type === t.withdrawRecords ||
  tx.type === 'Extract' || 
  tx.type === 'Withdraw' || 
  tx.type === '提现'  // 向后兼容旧数据
)

// 筛选收益记录
.filter((tx: TransactionRecord) => 
  tx.type === t.reward ||         // 多语言支持
  tx.type === 'Reward' || 
  tx.type === 'ETH奖励' ||       // 向后兼容旧数据
  tx.type === '奖励' ||          // 向后兼容旧数据
  ((tx.type === t.earnings || tx.type === t.earningsRecords || tx.type === '收益') && ...)
)

// 收益率显示
rate: t.reward  // 使用国际化文本
```

---

## 国际化翻译键

**文件**: `src/lib/i18n.ts`

### 可用的翻译键

| 键名 | 英文 | 中文 | 德文 | 西班牙文 | 法文 | 意大利文 | 俄文 |
|------|------|------|------|---------|------|---------|------|
| `exchange` | Exchange | 兌換 | Tauschen | Intercambio | Échange | Scambio | Обмен |
| `exchangeRecords` | Exchange | 兌換 | Tausch | Intercambio | Échange | Scambio | Обмен |
| `withdraw` | Withdraw | 提現 | Abheben | Retirar | Retirer | Preleva | Вывод |
| `withdrawRecords` | Withdraw | 提現 | Abhebung | Retiro | Retrait | Prelievo | Вывод |
| `earnings` | Earnings | 收益 | Erträge | Ganancias | Gains | Guadagni | Доходы |
| `earningsRecords` | Earnings | 收益 | Ertrag | Ganancias | Gains | Guadagni | Доходы |
| `reward` | Reward | 獎勵 | Belohnung | Recompensa | Récompense | Ricompensa | Награда |

---

## 向后兼容性

### 保留旧数据兼容
为了确保已有数据库中存储的旧记录类型（如 `'兑换'`, `'收益'`, `'提现'` 等中文类型）仍然能正常显示，我们在筛选条件中保留了对这些硬编码中文的支持：

```typescript
// 示例：兑换记录筛选
.filter((tx: TransactionRecord) => 
  tx.type === t.exchange ||           // 新的多语言支持
  tx.type === t.exchangeRecords ||    // 新的多语言支持
  tx.type === 'Exchange' ||           // 英文类型
  tx.type === 'Swap' ||               // 英文类型
  tx.type === '兑换'                  // 向后兼容：支持旧数据
)
```

这样既实现了多语言支持，又不会影响已有数据的显示。

---

## 修复内容总结

### ✅ 已修复的地方

1. **兑换记录筛选** - 添加 `t.exchange` 和 `t.exchangeRecords` 支持
2. **提现记录筛选** - 添加 `t.withdraw` 和 `t.withdrawRecords` 支持
3. **收益记录筛选** - 添加 `t.reward`, `t.earnings`, `t.earningsRecords` 支持
4. **收益率显示** - 从硬编码 `'奖励'` 改为 `t.reward`
5. **调试日志** - 更新为使用国际化变量进行类型判断

### 📝 保留的中文内容

1. **开发者注释** - 代码注释保留中文，方便开发者理解
2. **正则表达式** - 用于解析后端返回的中文描述（如 `"奖励: 0.01 ETH"`）
3. **向后兼容** - 旧数据类型判断中保留中文（如 `'兑换'`, `'收益'`）
4. **调试日志输出** - console.log 中的中文描述（开发用途）

---

## 测试验证

### 测试场景

1. **切换到英文** - 记录类型应显示为 "Exchange", "Withdraw", "Earnings", "Reward"
2. **切换到中文** - 记录类型应显示为 "兌換", "提現", "收益", "獎勵"
3. **切换到其他语言** - 应显示对应语言的翻译
4. **旧数据兼容性** - 数据库中存储的 `'兑换'`, `'收益'` 等中文类型记录仍应正常显示

### 测试方法

```typescript
// 1. 切换语言
点击语言选择器 → 选择不同语言

// 2. 查看记录标签页
首页 → 兑换 → 记录 → 查看各个子标签

// 3. 验证显示内容
- 子标签名称应使用当前语言
- 记录列表中的类型字段应使用当前语言
- 收益率字段应使用当前语言
```

---

## 相关文件

### 修改的文件
- `src/hooks/useTransactionRecords.ts` - 主要修复文件
- `src/lib/i18n.ts` - 国际化配置（已有翻译键，未修改）

### 依赖的国际化键
- `exchange` / `exchangeRecords`
- `withdraw` / `withdrawRecords`  
- `earnings` / `earningsRecords`
- `reward`

---

## 未来优化建议

### 1. 后端统一记录类型
建议后端统一使用英文类型（如 `'Exchange'`, `'Withdraw'`, `'Earnings'`, `'Reward'`），而不是混用中英文，这样前端处理会更简单。

### 2. 记录类型枚举
可以考虑创建记录类型枚举：

```typescript
enum TransactionType {
  EXCHANGE = 'Exchange',
  WITHDRAW = 'Withdraw',
  EARNINGS = 'Earnings',
  REWARD = 'Reward',
  SHARED = 'Shared'
}
```

### 3. 数据迁移
如果可能，可以执行一次数据迁移，将数据库中所有旧的中文类型转换为统一的英文类型，这样就不需要保留向后兼容的代码。

---

## 总结

✅ **修复完成**：所有记录类型的硬编码中文问题已修复  
✅ **多语言支持**：支持7种语言的记录类型显示  
✅ **向后兼容**：保留对旧数据的支持，不影响已有记录  
✅ **代码质量**：使用国际化最佳实践，提高代码可维护性  

现在用户可以正常切换语言，所有记录类型的文字都会正确翻译显示。

