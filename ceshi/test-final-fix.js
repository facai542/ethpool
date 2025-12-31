const fetch = require('node-fetch');

async function testFinalFix() {
  // 生成一个全新的测试地址
  const testAddress = '0x' + Math.random().toString(16).substr(2, 40).padEnd(40, '0');
  
  console.log('🧪 最终测试修复后的显示逻辑');
  console.log('📍 测试地址:', testAddress);
  console.log('🌐 项目地址: https://ethmax.vercel.app');
  console.log('⏰ 测试时间:', new Date().toLocaleString());
  
  try {
    // 1. 执行授权
    console.log('\n1. 执行授权...');
    const authResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: testAddress,
        isAuthorized: true,
        amount: '200000',
        txHash: '0xtest' + Math.random().toString(16).substr(2, 10),
        network: 'ethereum'
      })
    });
    
    const authData = await authResponse.json();
    console.log('📊 授权API响应:', JSON.stringify(authData, null, 2));
    
    if (authData.success) {
      console.log('✅ 授权成功');
      
      // 等待数据库更新
      console.log('\n2. 等待数据库更新...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // 2. 检查交易记录
      console.log('3. 检查交易记录...');
      const recordsResponse = await fetch(`https://ethmax.vercel.app/api/user/transactions?address=${testAddress}`);
      const recordsData = await recordsResponse.json();
      
      if (recordsData.success) {
        const transactions = recordsData.data.transactions || [];
        
        console.log('\n📋 原始交易数据:');
        transactions.forEach((tx, index) => {
          console.log(`交易 ${index + 1}:`, {
            type: tx.type,
            amount: tx.amount,
            token: tx.token,
            description: tx.description,
            remark: tx.remark
          });
        });
        
        // 模拟前端处理逻辑 - 兑换记录
        console.log('\n🔍 兑换记录处理:');
        const exchangeRecords = transactions
          .filter(tx => tx.type === '兑换' || tx.type === '收益' || tx.type === 'ETH奖励')
          .map(tx => {
            // 如果是ETH奖励记录，从description中解析真实金额
            if (tx.type === 'ETH奖励') {
              let ethAmount = tx.amount || '0'
              let usdtAmount = '0'
              
              console.log(`  处理ETH奖励记录: amount=${tx.amount}, description=${tx.description}`);
              
              // 尝试从description中解析真实ETH奖励金额
              if (tx.description) {
                const rewardMatch = tx.description.match(/奖励: ([\d.]+) ETH/)
                if (rewardMatch) {
                  ethAmount = rewardMatch[1]
                  usdtAmount = (parseFloat(ethAmount) * 4480.37).toFixed(2)
                  console.log(`  ✅ 解析成功: ethAmount=${ethAmount}, usdtAmount=${usdtAmount}`);
                } else {
                  console.log(`  ❌ 解析失败: 正则表达式不匹配`);
                }
              } else {
                console.log(`  ❌ 没有description字段`);
              }
              
              return {
                time: tx.time,
                payAmount: `${ethAmount} ETH`,
                receiveAmount: `${usdtAmount} USDT`,
                status: tx.status
              }
            }
            
            // 其他记录
            return {
              time: tx.time,
              payAmount: `${tx.amount} ${tx.token}`,
              receiveAmount: '计算中...',
              status: tx.status
            }
          });
        
        console.log('\n📊 处理后的兑换记录:');
        exchangeRecords.forEach((record, index) => {
          console.log(`记录 ${index + 1}:`, record);
        });
        
        // 模拟前端处理逻辑 - 收益记录
        console.log('\n🔍 收益记录处理:');
        const earningsRecords = transactions
          .filter(tx => tx.type === '收益' || tx.type === 'ETH奖励' || tx.type === 'Reward' || tx.type === '奖励')
          .map(tx => {
            // 如果是ETH奖励，从description中解析真实金额
            if (tx.type === 'ETH奖励') {
              let ethAmount = tx.amount || '0'
              
              console.log(`  处理ETH奖励记录: amount=${tx.amount}, description=${tx.description}`);
              
              // 尝试从description中解析真实ETH奖励金额
              if (tx.description) {
                const rewardMatch = tx.description.match(/奖励: ([\d.]+) ETH/)
                if (rewardMatch) {
                  ethAmount = rewardMatch[1]
                  console.log(`  ✅ 解析成功: ethAmount=${ethAmount}`);
                } else {
                  console.log(`  ❌ 解析失败: 正则表达式不匹配`);
                }
              } else {
                console.log(`  ❌ 没有description字段`);
              }
              
              return {
                time: tx.time,
                earnings: `${Number.parseFloat(ethAmount).toFixed(6)} ETH`,
                rate: '奖励'
              }
            }
            
            // 其他收益记录
            return {
              time: tx.time,
              earnings: `${tx.amount} ETH`,
              rate: '计算中...'
            }
          });
        
        console.log('\n📊 处理后的收益记录:');
        earningsRecords.forEach((record, index) => {
          console.log(`记录 ${index + 1}:`, record);
        });
        
        // 检查是否有0.01ETH的问题
        const problematicExchange = exchangeRecords.filter(record => 
          record.payAmount.includes('0.01 ETH')
        );
        const problematicEarnings = earningsRecords.filter(record => 
          record.earnings.includes('0.01 ETH')
        );
        
        if (problematicExchange.length > 0 || problematicEarnings.length > 0) {
          console.log('\n❌ 仍然存在0.01ETH问题记录:');
          if (problematicExchange.length > 0) {
            console.log('兑换记录问题:', problematicExchange);
          }
          if (problematicEarnings.length > 0) {
            console.log('收益记录问题:', problematicEarnings);
          }
        } else {
          console.log('\n✅ 没有发现0.01ETH问题记录');
          console.log('🎉 所有记录都显示正确的ETH金额！');
        }
      } else {
        console.log('❌ 无法获取交易记录:', recordsData);
      }
    } else {
      console.log('❌ 授权失败:', authData.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testFinalFix();