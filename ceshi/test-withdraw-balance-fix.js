// 测试提现余额显示修复
const https = require('https');

async function testWithdrawBalanceFix() {
  try {
    console.log('🧪 测试提现余额显示修复...');
    
    // 测试地址
    const testAddress = '0x5041ed759Dd4aFc3a72b8192C143F72f4724081A';
    
    // 1. 获取用户信息
    console.log('1️⃣ 获取用户信息...');
    const userResponse = await fetch(`http://localhost:3002/api/user/info?address=${testAddress}`);
    const userResult = await userResponse.json();
    
    if (userResult.success) {
      const userData = userResult.data;
      console.log('✅ 用户信息获取成功');
      console.log('📊 用户余额信息:');
      console.log(`  - cash (可提现余额): ${userData.cash} USDT`);
      console.log(`  - usdt (质押余额): ${userData.usdt} USDT`);
      console.log(`  - eth (ETH余额): ${userData.eth} ETH`);
      console.log(`  - withdrawal_usdt (已提现): ${userData.withdrawal_usdt} USDT`);
      
      // 2. 测试提现功能
      if (userData.cash > 10) {
        console.log('\n2️⃣ 测试提现功能...');
        const withdrawAmount = Math.min(10, userData.cash - 1); // 提现10 USDT或余额-1
        
        const withdrawResponse = await fetch('http://localhost:3002/api/user/withdraw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userAddress: testAddress,
            amount: withdrawAmount,
            withdrawAddress: testAddress
          })
        });
        
        const withdrawResult = await withdrawResponse.json();
        
        if (withdrawResult.success) {
          console.log('✅ 提现申请成功');
          console.log(`📝 提现金额: ${withdrawAmount} USDT`);
          console.log(`📝 提现ID: ${withdrawResult.data.withdrawId}`);
          
          // 等待一下让数据库操作完成
          console.log('⏳ 等待数据库操作完成...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 3. 再次获取用户信息，检查余额是否更新
          console.log('\n3️⃣ 检查余额更新...');
          const userResponse2 = await fetch(`http://localhost:3002/api/user/info?address=${testAddress}`);
          const userResult2 = await userResponse2.json();
          
          if (userResult2.success) {
            const userData2 = userResult2.data;
            console.log('📊 提现后用户余额信息:');
            console.log(`  - cash (可提现余额): ${userData2.cash} USDT`);
            console.log(`  - usdt (质押余额): ${userData2.usdt} USDT`);
            console.log(`  - eth (ETH余额): ${userData2.eth} ETH`);
            
            // 检查余额是否正确扣除
            const expectedCash = userData.cash - withdrawAmount;
            const actualCash = userData2.cash;
            
            console.log('\n🔍 余额变化验证:');
            console.log(`  - 提现前cash: ${userData.cash} USDT`);
            console.log(`  - 提现金额: ${withdrawAmount} USDT`);
            console.log(`  - 预期cash: ${expectedCash} USDT`);
            console.log(`  - 实际cash: ${actualCash} USDT`);
            
            if (Math.abs(actualCash - expectedCash) < 0.01) {
              console.log('✅ 余额扣除正确！');
            } else {
              console.log('❌ 余额扣除不正确！');
            }
            
          } else {
            console.log('❌ 无法获取提现后用户信息');
          }
          
        } else {
          console.log('❌ 提现申请失败:', withdrawResult.error);
        }
        
      } else {
        console.log('⚠️ 用户可提现余额不足，跳过提现测试');
        console.log(`💡 当前可提现余额: ${userData.cash} USDT，需要至少10 USDT`);
      }
      
    } else {
      console.log('❌ 无法获取用户信息:', userResult.error);
    }
    
    console.log('\n✅ 提现余额显示修复测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('💡 请确保开发服务器正在运行 (npm run dev)');
  }
}

// 运行测试
testWithdrawBalanceFix();
