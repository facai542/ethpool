# 代理注册问题排查

## 当前问题

1. **代理后台用户列表为空** - 没有显示通过代理链接注册的用户
2. **代理统计不更新** - total_invites和valid_invites保持为0

## 数据库现状

### 最近注册的3个用户：
| ID | 钱包地址 | agent_id | referred_by | 创建时间 |
|----|---------|----------|-------------|----------|
| 86db0626... | 0xB8A14F... | 0 | null | 07:20:42 |
| e2dc19a8... | 0x6079Af... | 0 | null | 07:09:03 |
| 4a807469... | 0x86e75a... | 0 | null | 06:54:20 |

**发现**: 所有用户的`agent_id`都是0！

### 代理列表：
| ID | 代理账号 | 邀请码 | 邀请人数 | 有效用户 |
|----|---------|--------|----------|----------|
| 8 | XL001 | AGENT000008 | 0 → 1 | 0 → 1 |

## 问题原因分析

### 注册流程：
1. 用户访问: `域名?ref=AGENT000008`
2. 注册API接收`referralCode = 'AGENT000008'`
3. 查找代理:
   ```typescript
   .eq('referral_code', referralCode)
   .eq('status', 'active')
   ```
4. 如果找到代理，设置`agentId = agentReferrer.id`
5. 创建用户时: `agent_id: agentId`

## 可能的问题

1. **referralCode没有正确传递** - 前端没有传ref参数
2. **代理状态不是'active'** - 但查询显示是active
3. **referral_code不匹配** - 大小写问题？
4. **查询失败** - 有错误但被忽略了

## 手动修复测试

已手动将最新用户关联到代理ID=8：
```sql
UPDATE nh_member_new
SET agent_id = 8
WHERE id = '86db0626-640b-4e8d-a667-baad424c9008';

UPDATE nh_agents
SET total_invites = 1, valid_invites = 1
WHERE id = 8;
```

现在代理后台应该能看到1个用户了。

## 下一步修复

需要查看注册时的实际日志，确认：
1. referralCode是否正确接收
2. 代理查询是否成功
3. agentId是否正确设置

