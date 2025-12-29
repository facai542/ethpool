// ETH 网络配置
// 使用 Tenderly 虚拟测试网进行测试

export const ETH_NETWORK_CONFIG = {
  // Tenderly 虚拟测试网 RPC URL
  RPC_URL: process.env.ETH_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/58095ba4-b67b-4671-8302-50cd5e04cbef',
  
  // 备用 RPC 节点（如果需要）
  FALLBACK_RPC_URLS: [
    'https://virtual.mainnet.eu.rpc.tenderly.co/58095ba4-b67b-4671-8302-50cd5e04cbef',
    'https://ethereum.publicnode.com',
    'https://eth.llamarpc.com',
  ],
  
  // USDT 合约地址（ETH 主网）
  USDT_CONTRACT_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  
  // 质押/归集合约地址
  STAKING_CONTRACT_ADDRESS: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
  
  // USDT 精度
  USDT_DECIMALS: 6,
  
  // 链 ID（ETH 主网 = 1，测试网可能不同）
  CHAIN_ID: 1,
  
  // 网络名称
  NETWORK_NAME: 'Tenderly Virtual Mainnet',
  
  // 是否为测试环境
  IS_TESTNET: true,
}

export default ETH_NETWORK_CONFIG

