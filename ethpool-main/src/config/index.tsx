import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet } from 'viem/chains'

// 直接使用真实项目ID，不依赖环境变量
export const projectId = 'c482c3062b88c6cc75e14712c5249b37'

console.log('🔧 使用项目ID:', projectId)

// 只使用ETH主网
export const networks = [mainnet]

// 设置Wagmi适配器配置
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 