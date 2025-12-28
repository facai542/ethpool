const fetch = require('node-fetch');

async function debugTelegramNotification() {
  console.log('🔍 调试Telegram通知系统...');
  
  try {
    // 1. 测试Telegram通知API
    console.log('\n📱 步骤1: 测试Telegram通知API...');
    const notificationResponse = await fetch('https://ethmax.vercel.app/api/test/telegram-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'authorize',
        address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
        userId: 275,
        authAddress: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141'
      })
    });

    if (notificationResponse.ok) {
      const notificationResult = await notificationResponse.json();
      console.log('✅ Telegram通知API正常');
      console.log('📝 消息内容:', notificationResult.data?.message?.substring(0, 100) + '...');
    } else {
      console.log('❌ Telegram通知API失败:', notificationResponse.status);
      const errorText = await notificationResponse.text();
      console.log('错误:', errorText);
    }

    // 2. 测试真实授权流程
    console.log('\n🔑 步骤2: 测试真实授权流程...');
    const authResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141',
        isAuthorized: true,
        amount: '1000000'
      })
    });

    if (authResponse.ok) {
      const authResult = await authResponse.json();
      console.log('✅ 授权API调用成功');
      console.log('📊 用户状态:', authResult.data?.isAuthorized ? '已授权' : '未授权');
      
      // 3. 检查通知队列
      console.log('\n📋 步骤3: 检查通知处理...');
      console.log('⏳ 等待3秒钟让通知处理...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n🔍 可能的问题排查:');
      console.log('1. 检查Telegram Bot Token是否正确配置');
      console.log('2. 检查Telegram Chat ID是否正确配置');
      console.log('3. 检查Supabase Edge Function是否正常运行');
      console.log('4. 检查通知队列是否被正确处理');
      
      console.log('\n📱 请手动检查:');
      console.log('- Telegram群组是否收到消息');
      console.log('- Vercel函数日志是否有错误');
      console.log('- Supabase Edge Function日志');
      
    } else {
      console.log('❌ 授权API调用失败:', authResponse.status);
      const errorText = await authResponse.text();
      console.log('错误:', errorText);
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugTelegramNotification();
