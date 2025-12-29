// ETH 网络配置
// 以太坊主网配置

export const ETH_NETWORK_CONFIG = {
  // 以太坊主网 RPC URL
  RPC_URL: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
  
  // 备用 RPC 节点
  FALLBACK_RPC_URLS: [
    'https://eth.llamarpc.com',
    'https://ethereum.publicnode.com',
    'https://eth-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.g.alchemy.com/v2/demo',
  ],
  
  // USDT 合约地址（ETH 主网）
  USDT_CONTRACT_ADDRESS: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  
  // 质押/归集合约地址
  STAKING_CONTRACT_ADDRESS: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
  
  // USDT 精度
  USDT_DECIMALS: 6,
  
  // 链 ID（ETH 主网 = 1）
  CHAIN_ID: 1,
  
  // 网络名称
  NETWORK_NAME: 'Ethereum Mainnet',
  
  // 是否为测试环境
  IS_TESTNET: false,
}

export default ETH_NETWORK_CONFIG

