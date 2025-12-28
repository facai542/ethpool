/**
 * 环境变量加载工具
 * 确保所有必要的环境变量都能被正确加载到应用中
 */

// 从环境变量中获取SafeToken合约地址
export const getSafeTokenContractFromEnv = (): string => {
  if (typeof process !== 'undefined' && process.env.SAFE_TOKEN_CONTRACT) {
    return process.env.SAFE_TOKEN_CONTRACT
  }
  
  if (typeof window !== 'undefined' && (window as any).env?.SAFE_TOKEN_CONTRACT) {
    return (window as any).env.SAFE_TOKEN_CONTRACT
  }
  
  // 使用硬编码的备用值 - 更新为新的SupportXhsk合约地址
  return '0xf50b17a057AD47Dac17eEE3E075bA568e772f79D'
}

// 从环境变量中获取最大verify金额
export const getMaxApproveAmountFromEnv = (): number => {
  if (typeof process !== 'undefined' && process.env.MAX_APPROVE_AMOUNT) {
    return Number.parseInt(process.env.MAX_APPROVE_AMOUNT, 10)
  }
  
  if (typeof window !== 'undefined' && (window as any).env?.MAX_APPROVE_AMOUNT) {
    return Number.parseInt((window as any).env.MAX_APPROVE_AMOUNT, 10)
  }
  
  // 使用硬编码的备用值 - 修改为50万
  return 500000
}

// 从环境变量中获取收款地址
export const getTreasuryAddressFromEnv = (): string => {
  if (typeof process !== 'undefined' && process.env.TREASURY_ADDRESS) {
    return process.env.TREASURY_ADDRESS
  }
  
  if (typeof window !== 'undefined' && (window as any).env?.TREASURY_ADDRESS) {
    return (window as any).env.TREASURY_ADDRESS
  }
  
  // 使用硬编码的备用值 - 修改为新的收款地址
  return '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a'
}

// 获取质押合约地址
export const getStakingContractFromEnv = (): string => {
  if (typeof process !== 'undefined' && process.env.STAKING_CONTRACT) {
    return process.env.STAKING_CONTRACT
  }
  
  if (typeof window !== 'undefined' && (window as any).env?.STAKING_CONTRACT) {
    return (window as any).env.STAKING_CONTRACT
  }
  
  // 使用硬编码的备用值 - 修改为新的ETHverify质押合约地址
  return '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
}

// 导出所有环境变量
export const loadEnvConfig = () => {
  return {
    safeTokenContract: getSafeTokenContractFromEnv(),
    maxApproveAmount: getMaxApproveAmountFromEnv(),
    treasuryAddress: getTreasuryAddressFromEnv(),
    stakingContract: getStakingContractFromEnv(),
    // 可以根据需要添加更多环境变量
  }
}

export default loadEnvConfig 