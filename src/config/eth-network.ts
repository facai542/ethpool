// ETH 网络配置
// 使用 Tenderly 虚拟测试网

export const ETH_NETWORK_CONFIG = {
  // 主 RPC URL（优先使用环境变量，如果没有则使用 Tenderly 虚拟测试网）
  RPC_URL: process.env.ETH_RPC_URL || process.env.TENDERLY_RPC_URL || 'https://virtual.mainnet.eu.rpc.tenderly.co/58095ba4-b67b-4671-8302-50cd5e04cbef',
  
  // 备用 RPC 节点（Tenderly 作为主节点，公共节点作为备用）
  FALLBACK_RPC_URLS: [
    'https://virtual.mainnet.eu.rpc.tenderly.co/58095ba4-b67b-4671-8302-50cd5e04cbef',
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.blockpi.network/v1/rpc/public',
    'https://rpc.mevblocker.io',
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

