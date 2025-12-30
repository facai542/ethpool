# Tenderly 虚拟测试网快速配置指南

## 📝 配置步骤

### 1. 获取 Tenderly RPC URL

1. 登录 [Tenderly Dashboard](https://dashboard.tenderly.co/)
2. 创建或选择一个项目
3. 创建一个 Fork（分叉）
4. 在 Fork 详情页找到 RPC URL，格式如下：
   ```
   https://virtual.mainnet.eu.rpc.tenderly.co/{project_slug}/{fork_id}
   ```

### 2. 配置环境变量

在 `.env.local` 文件中添加：

```bash
# Tenderly 虚拟测试网 RPC URL
ETH_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_PROJECT/YOUR_FORK

# 或者使用 TENDERLY_RPC_URL
TENDERLY_RPC_URL=https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_PROJECT/YOUR_FORK
```

### 3. 验证配置

配置完成后，系统将：
- ✅ 使用 Tenderly 虚拟测试网进行所有链上操作
- ✅ 保持主网链 ID (1)，但使用虚拟测试网环境
- ✅ 所有交易在虚拟测试网中执行，不会影响真实主网

## 🔧 当前配置状态

- **网络类型**: Tenderly Virtual Mainnet
- **链 ID**: 1 (保持主网链ID)
- **测试网标志**: `IS_TESTNET: true`
- **RPC URL**: 从环境变量 `ETH_RPC_URL` 或 `TENDERLY_RPC_URL` 读取

## ⚠️ 注意事项

1. **合约地址**: 虚拟测试网中使用与主网相同的合约地址
2. **链 ID**: 保持为 1，这样 MetaMask 等钱包可以正常连接
3. **测试数据**: 虚拟测试网中的数据是独立的，不会影响主网
4. **Gas 费用**: 虚拟测试网中 Gas 费用为 0，可以免费测试

## 🚀 快速切换回主网

如果需要切换回主网，只需：
1. 删除或注释掉 `ETH_RPC_URL` 环境变量
2. 修改 `src/config/eth-network.ts` 中的 `IS_TESTNET: false`
3. 更新 `NETWORK_NAME` 为 `'Ethereum Mainnet'`


