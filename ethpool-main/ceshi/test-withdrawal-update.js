// 测试提现订单状态更新
const BASE_URL = 'http://localhost:3003'

async function testWithdrawalUpdate() {
  console.log('🧪 测试提现订单状态更新\n')
  
  try {
    // 1. 获取一个pending状态的提现记录
    console.log('1️⃣ 获取pending状态的提现记录...')
    const getResponse = await fetch(`${BASE_URL}/api/admin/withdrawals?status=pending&limit=1`)
    const getData = await getResponse.json()
    
    if (!getData.success || getData.data.withdrawals.length === 0) {
      console.log('❌ 没有pending状态的提现记录')
      return
    }
    
    const withdrawal = getData.data.withdrawals[0]
    console.log(`✅ 找到提现记录 #${withdrawal.id}`)
    console.log(`   金额: ${withdrawal.amount} USDT`)
    console.log(`   状态: ${withdrawal.status}`)
    console.log(`   地址: ${withdrawal.to_address}\n`)
    
    // 2. 测试更新为completed状态
    console.log('2️⃣ 测试更新为completed状态...')
    const updateResponse = await fetch(`${BASE_URL}/api/admin/withdrawals`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        withdrawalId: withdrawal.id,
        status: 'completed',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      })
    })
    
    const updateData = await updateResponse.json()
    
    if (updateData.success) {
      console.log('✅ 状态更新成功\n')
      
      // 3. 验证更新结果
      console.log('3️⃣ 验证更新结果...')
      const verifyResponse = await fetch(`${BASE_URL}/api/admin/withdrawals?search=${withdrawal.id}`)
      const verifyData = await verifyResponse.json()
      
      if (verifyData.success && verifyData.data.withdrawals.length > 0) {
        const updated = verifyData.data.withdrawals[0]
        console.log(`   ID: ${updated.id}`)
        console.log(`   状态: ${updated.status}`)
        console.log(`   交易哈希: ${updated.transaction_hash}`)
        
        if (updated.status === 'completed') {
          console.log('\n🎉 测试成功！状态已正确更新为completed')
        } else {
          console.log(`\n❌ 测试失败！状态应该是completed，但实际是${updated.status}`)
        }
      }
      
      // 4. 恢复为pending状态（可选）
      console.log('\n4️⃣ 恢复为pending状态...')
      await fetch(`${BASE_URL}/api/admin/withdrawals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawalId: withdrawal.id,
          status: 'pending'
        })
      })
      console.log('✅ 已恢复为pending状态')
      
    } else {
      console.log('❌ 状态更新失败:', updateData.error)
    }
    
  } catch (error) {
    console.error('❌ 测试出错:', error.message)
  }
}

// 运行测试
testWithdrawalUpdate()

