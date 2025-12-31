/**
 * 诊断链上监听和通知问题
 * 检查所有可能的问题点
 */

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjY5ZDY3MjkwLWIxMTYtNDIwNC04MzhjLTE4NTJjMzU2YWIyOSIsIm9yZ0lkIjoiNDc0NjA0IiwidXNlcklkIjoiNDg4MjQ3IiwidHlwZUlkIjoiMzQ4NmRkMzktOTBlOC00YTAxLWI0NWItMGJhNWQ2MWFiYTMxIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTk4NDYwMzcsImV4cCI6NDkxNTYwNjAzN30.RIEwHUZ5nluSbvV3clgcclLLE5sha4BUxGHiyxiFa2A'
const TELEGRAM_BOT_TOKEN = '8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I'
const TELEGRAM_CHAT_ID = '-1003149735777'
const APP_URL = 'https://ethmax.vercel.app'
const TARGET_ADDRESS = '0xDDab159D4D75D588BB331B326c5ce0bA8Aa7a3A0'

async function diagnose() {
  console.log('\n========== 🔍 链上监听通知诊断 ==========\n')
  console.log(`📍 目标地址: ${TARGET_ADDRESS}\n`)
  
  let issuesFound = []
  let suggestions = []
  
  try {
    // 1. 检查 Moralis Streams
    console.log('1️⃣ 检查 Moralis Streams...')
    
    try {
      const streamsResponse = await fetch('https://api.moralis-streams.com/streams/evm', {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'Accept': 'application/json'
        }
      })
      
      if (!streamsResponse.ok) {
        issuesFound.push('❌ 无法访问 Moralis API')
        suggestions.push('检查 MORALIS_API_KEY 是否正确')
      } else {
        const streamsData = await streamsResponse.json()
        console.log(`   ✅ 找到 ${streamsData.total || streamsData.result?.length || 0} 个 Stream`)
        
        // 查找目标 Stream
        const targetStream = streamsData.result?.find(s => 
          s.tag === 'eth-usdt-monitor' || 
          s.id === 'eth-usdt-monitor' ||
          s.description?.includes('USDT')
        )
        
        if (!targetStream) {
          issuesFound.push('❌ 未找到 eth-usdt-monitor Stream')
          suggestions.push('需要创建 Moralis Stream')
          suggestions.push('运行: 完成一次用户授权操作（系统会自动创建）')
          console.log('   ❌ 未找到目标 Stream')
        } else {
          console.log(`   ✅ 找到 Stream: ${targetStream.id}`)
          console.log(`      - 状态: ${targetStream.status}`)
          console.log(`      - Webhook: ${targetStream.webhookUrl}`)
          
          // 检查 Stream 状态
          if (targetStream.status !== 'active') {
            issuesFound.push(`❌ Stream 状态异常: ${targetStream.status}`)
            suggestions.push('在 Moralis Dashboard 中激活 Stream')
          }
          
          // 检查 Webhook URL
          if (!targetStream.webhookUrl?.includes(APP_URL)) {
            issuesFound.push(`❌ Webhook URL 不匹配: ${targetStream.webhookUrl}`)
            suggestions.push(`应该是: ${APP_URL}/api/moralis/webhook`)
          }
          
          // 获取监听地址列表
          try {
            const addressesResponse = await fetch(
              `https://api.moralis-streams.com/streams/evm/${targetStream.id}/address`,
              {
                headers: {
                  'X-API-Key': MORALIS_API_KEY,
                  'Accept': 'application/json'
                }
              }
            )
            
            if (addressesResponse.ok) {
              const addressesData = await addressesResponse.json()
              const total = addressesData.total || 0
              console.log(`      - 监听地址数: ${total}`)
              
              if (total === 0) {
                issuesFound.push('❌ Stream 中没有监听地址')
                suggestions.push('需要添加地址到 Stream')
              } else {
                // 检查目标地址是否在列表中
                const addresses = addressesData.result || []
                const isMonitored = addresses.some(a => 
                  a.address?.toLowerCase() === TARGET_ADDRESS.toLowerCase()
                )
                
                if (isMonitored) {
                  console.log(`      ✅ 目标地址已在监听列表中`)
                } else {
                  issuesFound.push('❌ 目标地址不在监听列表中')
                  suggestions.push('需要添加该地址到 Stream')
                  console.log(`      ❌ 目标地址不在监听列表中`)
                  console.log(`      ℹ️  当前监听的地址:`, addresses.slice(0, 3).map(a => a.address))
                }
              }
            }
          } catch (addrError) {
            console.log('      ⚠️  无法获取地址列表')
          }
        }
      }
    } catch (moralisError) {
      issuesFound.push('❌ Moralis API 访问失败')
      suggestions.push('检查网络连接和 API Key')
      console.log('   ❌ Moralis API 访问失败:', moralisError.message)
    }
    
    // 2. 测试 Webhook 端点
    console.log('\n2️⃣ 测试 Webhook 端点...')
    
    try {
      const webhookUrl = `${APP_URL}/api/moralis/webhook`
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      
      if (testResponse.ok) {
        console.log(`   ✅ Webhook 端点正常: ${webhookUrl}`)
      } else {
        issuesFound.push(`❌ Webhook 端点返回错误: ${testResponse.status}`)
        suggestions.push('检查 Vercel 部署状态')
        console.log(`   ❌ Webhook 返回: ${testResponse.status}`)
      }
    } catch (webhookError) {
      issuesFound.push('❌ Webhook 端点无法访问')
      suggestions.push('检查 URL 是否正确，Vercel 是否部署成功')
      console.log('   ❌ Webhook 无法访问:', webhookError.message)
    }
    
    // 3. 测试 Telegram Bot
    console.log('\n3️⃣ 测试 Telegram Bot...')
    
    try {
      // 测试发送消息
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
      const testMessage = `🧪 测试消息\n时间: ${new Date().toLocaleString('zh-CN')}\n地址: ${TARGET_ADDRESS}`
      
      const telegramResponse = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: testMessage
        })
      })
      
      const telegramResult = await telegramResponse.json()
      
      if (telegramResult.ok) {
        console.log('   ✅ Telegram Bot 正常工作')
        console.log('   ✅ 测试消息已发送到群组')
      } else {
        issuesFound.push(`❌ Telegram Bot 发送失败: ${telegramResult.description}`)
        suggestions.push('检查 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID')
        console.log('   ❌ Telegram 发送失败:', telegramResult.description)
      }
    } catch (telegramError) {
      issuesFound.push('❌ Telegram API 访问失败')
      suggestions.push('检查网络连接')
      console.log('   ❌ Telegram 测试失败:', telegramError.message)
    }
    
    // 4. 模拟 Moralis Webhook 事件
    console.log('\n4️⃣ 模拟 Moralis Webhook 事件...')
    
    try {
      const webhookUrl = `${APP_URL}/api/moralis/webhook`
      const mockEvent = {
        confirmed: true,
        tag: 'Transfer',
        from: '0x1111111111111111111111111111111111111111',
        to: TARGET_ADDRESS,
        value: '1000000', // 1 USDT
        transactionHash: '0xtest' + Date.now(),
        blockNumber: '12345678',
        chainId: '0x1'
      }
      
      const mockResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockEvent)
      })
      
      const mockResult = await mockResponse.json()
      
      if (mockResult.success) {
        console.log('   ✅ Webhook 处理逻辑正常')
        console.log('   ℹ️  检查 Telegram 群组是否收到模拟交易通知')
      } else {
        issuesFound.push('❌ Webhook 处理逻辑异常')
        console.log('   ❌ Webhook 处理失败:', mockResult)
      }
    } catch (mockError) {
      console.log('   ⚠️  模拟事件发送失败:', mockError.message)
    }
    
    // 5. 总结诊断结果
    console.log('\n========== 📊 诊断结果 ==========\n')
    
    if (issuesFound.length === 0) {
      console.log('✅ 所有检查项都正常！\n')
      console.log('如果仍然没有收到通知，可能的原因:')
      console.log('   1. 交易还未确认（等待1-2分钟）')
      console.log('   2. 地址刚添加，需要等待Moralis同步（等待5-10分钟）')
      console.log('   3. 测试交易金额太小（建议 >= 1 USDT）')
      console.log('   4. 检查 Telegram 群组的消息过滤设置')
    } else {
      console.log('❌ 发现以下问题:\n')
      issuesFound.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`)
      })
      
      console.log('\n💡 建议的解决方案:\n')
      suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`)
      })
    }
    
    console.log('\n========== 📝 下一步操作 ==========\n')
    console.log('方法 1: 使用 Moralis Dashboard 手动添加')
    console.log('   1. 访问: https://admin.moralis.io/streams')
    console.log('   2. 找到或创建 Stream: eth-usdt-monitor')
    console.log('   3. 配置 Webhook URL: https://ethmax.vercel.app/api/moralis/webhook')
    console.log(`   4. 添加地址: ${TARGET_ADDRESS}`)
    console.log('')
    console.log('方法 2: 检查 Vercel 环境变量')
    console.log('   1. 访问: https://vercel.com')
    console.log('   2. 项目 → Settings → Environment Variables')
    console.log('   3. 确认以下变量存在:')
    console.log('      - MORALIS_API_KEY')
    console.log('      - TELEGRAM_BOT_TOKEN')
    console.log('      - TELEGRAM_CHAT_ID')
    console.log('      - SUPABASE_SERVICE_ROLE_KEY')
    console.log('')
    console.log('方法 3: 查看实时日志')
    console.log('   1. Vercel Dashboard → Logs')
    console.log('   2. 发送测试USDT交易')
    console.log('   3. 观察日志输出')
    console.log('')
    
  } catch (error) {
    console.error('\n❌ 诊断过程出错:', error.message)
    console.error('错误详情:', error)
  }
}

diagnose()









