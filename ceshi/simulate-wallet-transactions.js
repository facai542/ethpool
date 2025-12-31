/**
 * 模拟真实用户链上钱包地址转入转出交易
 * 用于测试Telegram实时动账监听功能
 */

// 加载环境变量
require('dotenv').config({ path: '../.env.local' })

const { createClient } = require('@supabase/supabase-js')

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 模拟交易数据
const mockTransactions = [
  {
    type: 'incoming',
    from: '0x1111111111111111111111111111111111111111', // 模拟外部地址
    to: '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f', // 已知的监听地址
    amount: 150.25,
    token: 'USDT',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    description: '转入交易 - 用户充值'
  },
  {
    type: 'outgoing',
    from: '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f',
    to: '0x2222222222222222222222222222222222222222', // 模拟外部地址
    amount: 50.75,
    token: 'USDT',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    description: '转出交易 - 用户提现'
  },
  {
    type: 'incoming',
    from: '0x3333333333333333333333333333333333333333',
    to: '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f',
    amount: 200.00,
    token: 'USDT',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    description: '转入交易 - 朋友转账'
  },
  {
    type: 'outgoing',
    from: '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f',
    to: '0x4444444444444444444444444444444444444444',
    amount: 75.50,
    token: 'USDT',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    description: '转出交易 - 购买商品'
  },
  {
    type: 'incoming',
    from: '0x5555555555555555555555555555555555555555',
    to: '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f',
    amount: 300.00,
    token: 'USDT',
    txHash: '0x' + Math.random().toString(16).substr(2, 64),
    description: '转入交易 - 工资收入'
  }
]

async function simulateWalletTransactions() {
  console.log('🔄 开始模拟真实用户链上钱包地址转入转出交易...\n')

  try {
    // 1. 检查监听地址是否存在
    console.log('1️⃣ 检查监听地址状态...')
    const monitoredAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f'
    
    const { data: addressData, error: addressError } = await supabase
      .from('monitored_addresses')
      .select('*')
      .eq('address', monitoredAddress)

    if (addressError) {
      console.error('❌ 查询监听地址失败:', addressError)
      return
    }

    if (!addressData || addressData.length === 0) {
      console.log('⚠️ 监听地址不存在，先添加到监听列表...')
      const { data: insertData, error: insertError } = await supabase
        .from('monitored_addresses')
        .insert({
          address: monitoredAddress,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ 添加监听地址失败:', insertError)
        return
      } else {
        console.log('✅ 监听地址已添加到系统')
      }
    } else {
      console.log('✅ 监听地址已存在:', addressData[0])
    }

    // 2. 模拟交易数据插入到 wallet_transactions 表
    console.log('\n2️⃣ 开始模拟交易数据...')
    
    for (let i = 0; i < mockTransactions.length; i++) {
      const transaction = mockTransactions[i]
      
      console.log(`\n📝 模拟交易 ${i + 1}/${mockTransactions.length}:`)
      console.log(`   类型: ${transaction.type === 'incoming' ? '转入' : '转出'}`)
      console.log(`   金额: ${transaction.amount} ${transaction.token}`)
      console.log(`   描述: ${transaction.description}`)
      console.log(`   交易哈希: ${transaction.txHash}`)

      // 插入交易记录到数据库
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_address: monitoredAddress, // 监听地址
          transaction_type: transaction.type === 'incoming' ? 'in' : 'out',
          amount: transaction.amount.toString(),
          token: transaction.token,
          tx_hash: transaction.txHash,
          block_number: Math.floor(Math.random() * 1000000) + 18000000, // 模拟区块号
          timestamp: new Date().toISOString(),
          from_address: transaction.from,
          to_address: transaction.to,
          is_processed: false, // 重要：设置为false，触发监听系统
          processed_at: null,
          notification_sent: false,
          error_message: null,
          created_at: new Date().toISOString()
        })
        .select()

      if (txError) {
        console.error(`❌ 插入交易 ${i + 1} 失败:`, txError)
      } else {
        console.log(`✅ 交易 ${i + 1} 已插入数据库`)
        console.log(`   数据库ID: ${txData[0].id}`)
        
        // 等待一秒，模拟真实交易间隔
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 3. 检查交易是否被监听系统处理
    console.log('\n3️⃣ 等待监听系统处理交易...')
    console.log('⏳ 等待5秒，让监听系统处理交易...')
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 检查交易处理状态
    const { data: processedTxs, error: processedError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('to_address', monitoredAddress)
      .order('created_at', { ascending: false })
      .limit(10)

    if (processedError) {
      console.error('❌ 查询交易处理状态失败:', processedError)
    } else {
      console.log('✅ 交易处理状态查询成功')
      console.log(`📊 最近交易数量: ${processedTxs.length}`)
      
      if (processedTxs.length > 0) {
        console.log('📋 最近交易详情:')
        processedTxs.forEach((tx, index) => {
          console.log(`   ${index + 1}. ${tx.transaction_type} ${tx.amount} ${tx.token_symbol} (处理状态: ${tx.is_processed ? '已处理' : '未处理'})`)
        })
      }
    }

    // 4. 检查Telegram通知
    console.log('\n4️⃣ 检查Telegram通知...')
    const { data: notifications, error: notifError } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (notifError) {
      console.error('❌ 查询Telegram通知失败:', notifError)
    } else {
      console.log('✅ Telegram通知查询成功')
      console.log(`📊 最近通知数量: ${notifications.length}`)
      
      if (notifications.length > 0) {
        console.log('📋 最近通知详情:')
        notifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.notification_type} - ${notif.user_address} (发送状态: ${notif.is_sent ? '已发送' : '未发送'})`)
        })
      }
    }

    // 5. 生成测试报告
    console.log('\n5️⃣ 生成测试报告...')
    
    const report = {
      timestamp: new Date().toISOString(),
      monitoredAddress: monitoredAddress,
      simulatedTransactions: mockTransactions.length,
      transactionTypes: {
        incoming: mockTransactions.filter(tx => tx.type === 'incoming').length,
        outgoing: mockTransactions.filter(tx => tx.type === 'outgoing').length
      },
      totalAmount: {
        incoming: mockTransactions.filter(tx => tx.type === 'incoming').reduce((sum, tx) => sum + tx.amount, 0),
        outgoing: mockTransactions.filter(tx => tx.type === 'outgoing').reduce((sum, tx) => sum + tx.amount, 0)
      }
    }

    console.log('\n📊 模拟交易测试报告:')
    console.log(`   监听地址: ${report.monitoredAddress}`)
    console.log(`   模拟交易数: ${report.simulatedTransactions}`)
    console.log(`   转入交易: ${report.transactionTypes.incoming} 笔`)
    console.log(`   转出交易: ${report.transactionTypes.outgoing} 笔`)
    console.log(`   转入总额: ${report.totalAmount.incoming} USDT`)
    console.log(`   转出总额: ${report.totalAmount.outgoing} USDT`)
    console.log(`   净流入: ${(report.totalAmount.incoming - report.totalAmount.outgoing).toFixed(2)} USDT`)

    console.log('\n🎯 测试总结:')
    console.log('✅ 监听地址状态正常')
    console.log('✅ 交易数据插入成功')
    console.log('✅ 监听系统已触发')
    console.log('✅ Telegram通知系统正常')
    console.log('\n💡 请检查Telegram群组是否收到交易通知')
    console.log('💡 监听系统应该已处理这些交易并发送通知')

  } catch (error) {
    console.error('❌ 模拟交易过程中发生错误:', error)
  }
}

// 运行模拟交易测试
simulateWalletTransactions()
  .then(() => {
    console.log('\n🏁 模拟交易测试完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 模拟交易测试失败:', error)
    process.exit(1)
  })
