/**
 * 测试Telegram授权通知修复
 * 验证用户授权成功后是否自动发送群组通知
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function testTelegramAuthorizationFix() {
  console.log('🧪 开始测试Telegram授权通知修复...')
  
  try {
    // 1. 检查Telegram实时服务状态
    console.log('\n📊 1. 检查Telegram实时服务状态...')
    const statusResponse = await fetch(`${BASE_URL}/api/telegram-realtime/status`)
    const statusResult = await statusResponse.json()
    console.log('服务状态:', statusResult)

    // 2. 如果服务未启动，则启动服务
    if (!statusResult.data?.isRunning) {
      console.log('\n🚀 2. 启动Telegram实时服务...')
      const startResponse = await fetch(`${BASE_URL}/api/telegram-realtime/start`, {
        method: 'POST'
      })
      const startResult = await startResponse.json()
      console.log('启动结果:', startResult)
    }

    // 3. 创建测试授权通知
    console.log('\n📝 3. 创建测试授权通知...')
    const testData = {
      userId: 999,
      address: '0x1234567890123456789012345678901234567890',
      authAmount: '1000000',
      txHash: '0xtest123456789'
    }
    
    const testResponse = await fetch(`${BASE_URL}/api/telegram-realtime/test-authorization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    const testResult = await testResponse.json()
    console.log('测试通知创建结果:', testResult)

    if (!testResult.success) {
      throw new Error('创建测试通知失败')
    }

    // 4. 等待几秒让实时服务处理通知
    console.log('\n⏳ 4. 等待实时服务处理通知...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 5. 检查通知队列状态
    console.log('\n📋 5. 检查通知队列状态...')
    const queueResponse = await fetch(`${BASE_URL}/api/telegram/notification-queue?limit=5`)
    const queueResult = await queueResponse.json()
    console.log('通知队列状态:', queueResult)

    // 6. 如果有未发送的通知，手动处理
    if (queueResult.data?.stats?.pending > 0) {
      console.log('\n🔄 6. 手动处理未发送通知...')
      const processResponse = await fetch(`${BASE_URL}/api/telegram-realtime/process-pending`, {
        method: 'POST'
      })
      const processResult = await processResponse.json()
      console.log('处理结果:', processResult)
    }

    // 7. 再次检查通知队列状态
    console.log('\n📊 7. 最终检查通知队列状态...')
    const finalQueueResponse = await fetch(`${BASE_URL}/api/telegram/notification-queue?limit=5`)
    const finalQueueResult = await finalQueueResponse.json()
    console.log('最终通知队列状态:', finalQueueResult)

    // 8. 检查服务状态
    console.log('\n📊 8. 最终检查服务状态...')
    const finalStatusResponse = await fetch(`${BASE_URL}/api/telegram-realtime/status`)
    const finalStatusResult = await finalStatusResponse.json()
    console.log('最终服务状态:', finalStatusResult)

    console.log('\n✅ Telegram授权通知修复测试完成!')
    
    // 总结
    console.log('\n📋 测试总结:')
    console.log(`- 服务运行状态: ${finalStatusResult.data?.isRunning ? '✅ 运行中' : '❌ 未运行'}`)
    console.log(`- 频道活跃状态: ${finalStatusResult.data?.channelActive ? '✅ 活跃' : '❌ 未活跃'}`)
    console.log(`- 总通知数: ${finalQueueResult.data?.stats?.total || 0}`)
    console.log(`- 已发送: ${finalQueueResult.data?.stats?.sent || 0}`)
    console.log(`- 待发送: ${finalQueueResult.data?.stats?.pending || 0}`)
    console.log(`- 失败: ${finalQueueResult.data?.stats?.failed || 0}`)

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error('详细错误:', error)
  }
}

// 运行测试
testTelegramAuthorizationFix()
