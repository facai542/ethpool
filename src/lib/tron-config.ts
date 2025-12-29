/**
 * TRON 网络配置
 * 支持 TRON 主网、Shasta 测试网、Nile 测试网和本地节点
 */

export interface TronNetworkConfig {
  fullHost: string
  networkId: string
  explorerUrl: string
  networkName: string
  usdtContract: string
  chainType: 'TRC20' | 'ERC20'
}

export const TRON_NETWORKS: Record<string, TronNetworkConfig> = {
  // Shasta 测试网（推荐用于开发）
  SHASTA: {
    fullHost: 'https://api.shasta.trongrid.io',
    networkId: '201910292',
    explorerUrl: 'https://shasta.tronscan.org',
    networkName: 'Shasta Testnet',
    usdtContract: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Shasta 测试网 USDT
    chainType: 'TRC20'
  },
  // Nile 测试网（用于新功能测试）
  NILE: {
    fullHost: 'https://api.nileex.io',
    networkId: '201910292',
    explorerUrl: 'https://nile.tronscan.org',
    networkName: 'Nile Testnet',
    usdtContract: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf', // Nile 测试网 USDT
    chainType: 'TRC20'
  },
  // TRON 主网
  MAINNET: {
    fullHost: 'https://api.trongrid.io',
    networkId: '1',
    explorerUrl: 'https://tronscan.org',
    networkName: 'TRON Mainnet',
    usdtContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // TRON 主网 USDT
    chainType: 'TRC20'
  },
  // 本地节点
  LOCAL: {
    fullHost: 'http://127.0.0.1:8090',
    networkId: '1',
    explorerUrl: 'http://localhost:8090',
    networkName: 'Local TRON Node',
    usdtContract: '', // 需要部署测试合约
    chainType: 'TRC20'
  }
}

/**
 * 获取当前网络配置
 * @param network 网络名称，默认为 SHASTA
 * @returns TRON 网络配置
 */
export function getTronNetworkConfig(network: string = 'SHASTA'): TronNetworkConfig {
  const networkKey = network.toUpperCase()
  return TRON_NETWORKS[networkKey] || TRON_NETWORKS.SHASTA
}

/**
 * 获取所有可用的网络列表
 */
export function getAvailableTronNetworks(): string[] {
  return Object.keys(TRON_NETWORKS)
}

