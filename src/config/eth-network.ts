// ETH 网络配置
// 使用 Tenderly 虚拟测试网

export const ETH_NETWORK_CONFIG = {
  // Tenderly 虚拟测试网 RPC URL
  // 格式: https://virtual.mainnet.eu.rpc.tenderly.co/{project_slug}/{fork_id}
  // 请替换为你的实际 Tenderly 项目 URL
  RPC_URL: process.env.ETH_RPC_URL || process.env.TENDERLY_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_PROJECT/YOUR_FORK',
  
  // 备用 RPC 节点（虚拟测试网）
  FALLBACK_RPC_URLS: [
    process.env.ETH_RPC_URL || process.env.TENDERLY_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/YOUR_PROJECT/YOUR_FORK',
    'https://eth.llamarpc.com',
    'https://ethereum.publicnode.com',
  ],
  
  // USDT 合约地址（ETH 主网，虚拟测试网中保持相同）
  USDT_CONTRACT_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  
  // 质押/归集合约地址（虚拟测试网中保持相同）
  STAKING_CONTRACT_ADDRESS: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
  
  // USDT 精度
  USDT_DECIMALS: 6,
  
  // 链 ID（虚拟测试网通常使用主网链ID = 1）
  CHAIN_ID: 1,
  
  // 网络名称
  NETWORK_NAME: 'Tenderly Virtual Mainnet',
  
  // 是否为测试环境
  IS_TESTNET: true,
}

export default ETH_NETWORK_CONFIG

