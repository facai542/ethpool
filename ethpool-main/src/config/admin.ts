// 管理后台配置
export const ADMIN_CONFIG = {
  // 最大重试次数
  MAX_RETRY_ATTEMPTS: 3,
  
  // Gas 配置
  GAS_PRICE_GWEI: 20, // ETH网络推荐Gas价格
  GAS_LIMIT_BUFFER: 0.2, // 20% 缓冲
  
  // 网络配置 - ETH主网RPC端点
  ETH_RPC_URL: 'https://eth.llamarpc.com',
  ETH_BACKUP_RPC_URL: 'https://eth-mainnet.public.blastapi.io',
  ETH_RPC_URLS: [
    'https://eth.llamarpc.com',
    'https://eth-mainnet.public.blastapi.io',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://eth-mainnet.g.alchemy.com/v2/demo'
  ],
  
  // Etherscan API配置
  ETHERSCAN_API_KEY: 'GNIPZGWDPY16Z9BJN2GR1DGVHTP9GW1Y9P',
  ETHERSCAN_API_URL: 'https://api.etherscan.io/api',
  
  // 合约配置
  CONTRACTS: {
    // ETH主网合约地址
    USDT_CONTRACT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    STAKING_CONTRACT: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
    TREASURY_ADDRESS: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a', // ETH资金收款地址
  },
  
  // 管理员配置 - 仅用于测试环境！生产环境请使用环境变量
  ADMIN_ADDRESS: '0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2', // 实际合约部署者地址
  ADMIN_PRIVATE_KEY: 'd41c083bf7923a6bc472d6ea2bc5b6e5a850d3ccae222dcc4efa33ff83697da2', // 对应的私钥
  
  // 权限等级
  PERMISSION_LEVELS: {
    OWNER: 'owner',
    ADMIN: 'admin',
    USER: 'user'
  },
  
  // 操作类型
  OPERATION_TYPES: {
    BALANCE_QUERY: 'balance_query',
    BALANCE_COLLECTION: 'balance_collection',
    PERMISSION_SET: 'permission_set',
    USER_WITHDRAW: 'user_withdraw',
    BALANCE_ADJUST: 'balance_adjust'
  }
} as const

// 获取可用的RPC URL - 轮询使用
let currentRpcIndex = 0
export function getAvailableRpcUrl(): string {
  const rpcUrl = ADMIN_CONFIG.ETH_RPC_URLS[currentRpcIndex]
  currentRpcIndex = (currentRpcIndex + 1) % ADMIN_CONFIG.ETH_RPC_URLS.length
  console.log(`🌐 使用RPC: ${rpcUrl}`)
  return rpcUrl
}

// 获取管理员私钥 - 优先使用环境变量
export function getAdminPrivateKey(): string {
  // 生产环境应该从环境变量获取
  if (process.env.ADMIN_PRIVATE_KEY) {
    return process.env.ADMIN_PRIVATE_KEY
  }
  
  // 测试环境使用硬编码的私钥
  console.warn('⚠️ 警告：使用硬编码的管理员私钥，仅用于测试环境！')
  return ADMIN_CONFIG.ADMIN_PRIVATE_KEY
}

// 使用BSCScan API获取Gas价格
export async function getGasPriceFromBSCScan(): Promise<string | null> {
  try {
    const response = await fetch(
      `${ADMIN_CONFIG.ETHERSCAN_API_URL}?module=gastracker&action=gasoracle&apikey=${ADMIN_CONFIG.ETHERSCAN_API_KEY}`
    )
    const data = await response.json()
    if (data.status === '1' && data.result) {
      // 返回标准Gas价格（SafeGasPrice）
      return data.result.SafeGasPrice
    }
    return null
  } catch (error) {
    console.error('❌ 获取BSCScan Gas价格失败:', error)
    return null
  }
}

// 操作日志类型
export interface AdminOperationLog {
  id?: number
  user_address: string
  admin_address: string
  operation_type: string
  operation_data: any
  tx_hash?: string
  gas_used?: string
  block_number?: number
  status: 'pending' | 'success' | 'failed'
  error_message?: string
  created_at?: Date
}

// Web3配置
export const WEB3_CONFIG = {
  // 超时设置
  TIMEOUT: 30000,
  
  // 重试配置
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // 交易确认数
  CONFIRMATION_BLOCKS: 1
} 