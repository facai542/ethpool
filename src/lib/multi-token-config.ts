// BSC链多币种代币配置
export interface TokenConfig {
  symbol: string
  name: string
  address: string
  decimals: number
  icon: string
  defaultApproveAmount: string
  isStakeable: boolean
  color: string
}

// ETH主网代币配置
export const ETH_TOKENS: Record<string, TokenConfig> = {
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    defaultApproveAmount: '500000',
    isStakeable: true,
    color: '#26A17B'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xA0b86a33E6441d8C6E5b4e8B8b8b8b8b8b8b8b8b',
    decimals: 6,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86a33E6441d8C6E5b4e8B8b8b8b8b8b8b8b8b/logo.png',
    defaultApproveAmount: '500000',
    isStakeable: true,
    color: '#2775CA'
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    defaultApproveAmount: '500000',
    isStakeable: true,
    color: '#FF6B35'
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18,
    icon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    defaultApproveAmount: '100',
    isStakeable: true,
    color: '#627EEA'
  }
}

// 获取支持的代币列表
export const getSupportedTokens = (): TokenConfig[] => {
  return Object.values(ETH_TOKENS)
}

// 根据符号获取代币配置
export const getTokenConfig = (symbol: string): TokenConfig | undefined => {
  return ETH_TOKENS[symbol.toUpperCase()]
}

// 获取可质押的代币
export const getStakeableTokens = (): TokenConfig[] => {
  return Object.values(ETH_TOKENS).filter(token => token.isStakeable)
}

// 检查是否是原生代币
export const isNativeToken = (address: string): boolean => {
  return address === '0x0000000000000000000000000000000000000000'
}

// 格式化代币金额显示
export const formatTokenAmount = (amount: string, decimals = 18): string => {
  const num = Number.parseFloat(amount)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  } else {
    return num.toFixed(2)
  }
} 