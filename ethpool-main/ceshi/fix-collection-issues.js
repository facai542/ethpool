/**
 * 修复余额归集功能问题
 * 1. 创建测试用户数据
 * 2. 检查管理员权限配置
 * 3. 测试修复后的功能
 */

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// 配置
const SUPABASE_URL = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk'
const API_BASE_URL = 'http://localhost:3000'

// 测试用户数据
const TEST_USER = {
  auth_address: '0x1234567890123456789012345678901234567890',
  usdt: 1000.0,
  gj_cash: 500.0,
  withdrawal_usdt: 0.0,
  username: 'test_user_collection',
  phone: '13800138000',
  email: 'test@example.com'
}

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createTestUser() {
  console.log('🔧 创建测试用户数据...')
  
  try {
    // 检查用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('nh_member')
      .select('id, auth_address')
      .eq('auth_address', TEST_USER.auth_address)
      .single()

    if (existingUser) {
      console.log('✅ 测试用户已存在:', existingUser.id)
      return existingUser.id
    }

    // 创建新用户
    const { data: newUser, error: createError } = await supabase
      .from('nh_member')
      .insert([TEST_USER])
      .select('id')
      .single()

    if (createError) {
      console.error('❌ 创建测试用户失败:', createError)
      return null
    }

    console.log('✅ 测试用户创建成功:', newUser.id)
    return newUser.id
  } catch (error) {
    console.error('❌ 创建测试用户异常:', error)
    return null
  }
}

async function testDatabaseCollection() {
  console.log('\n🔧 测试数据库归集功能...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/balance-collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: TEST_USER.auth_address,
        amount: 100.0
      })
    })

    const result = await response.json()
    console.log('📊 数据库归集结果:', result)
    
    if (result.success) {
      console.log('✅ 数据库归集功能正常')
      return true
    } else {
      console.log('❌ 数据库归集功能异常:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ 数据库归集测试异常:', error)
    return false
  }
}

async function testOnChainCollection() {
  console.log('\n🔧 测试链上归集功能...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/real-balance-collection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: TEST_USER.auth_address,
        amount: 50.0
      })
    })

    const result = await response.json()
    console.log('📊 链上归集结果:', result)
    
    if (result.success) {
      console.log('✅ 链上归集功能正常')
      return true
    } else {
      console.log('❌ 链上归集功能异常:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ 链上归集测试异常:', error)
    return false
  }
}

async function testBalanceQuery() {
  console.log('\n🔧 测试余额查询功能...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/query-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: TEST_USER.auth_address
      })
    })

    const result = await response.json()
    console.log('📊 余额查询结果:', result)
    
    if (result.success) {
      console.log('✅ 余额查询功能正常')
      return true
    } else {
      console.log('❌ 余额查询功能异常:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ 余额查询测试异常:', error)
    return false
  }
}

async function testAllowanceQuery() {
  console.log('\n🔧 测试授权查询功能...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/query-allowance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress: TEST_USER.auth_address,
        spenderAddress: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
      })
    })

    const result = await response.json()
    console.log('📊 授权查询结果:', result)
    
    if (result.success) {
      console.log('✅ 授权查询功能正常')
      return true
    } else {
      console.log('❌ 授权查询功能异常:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ 授权查询测试异常:', error)
    return false
  }
}

async function checkCollectionRecords() {
  console.log('\n🔧 检查归集记录...')
  
  try {
    const { data: records, error } = await supabase
      .from('authorized_transfers')
      .select('*')
      .eq('user_address', TEST_USER.auth_address)
      .order('create_time', { ascending: false })
      .limit(5)

    if (error) {
      console.error('❌ 查询归集记录失败:', error)
      return
    }

    console.log('📊 最近的归集记录:')
    records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.transaction_type} - ${record.amount} USDT - ${record.status}`)
      console.log(`   交易哈希: ${record.transaction_hash}`)
      console.log(`   时间: ${record.create_time}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ 检查归集记录异常:', error)
  }
}

async function main() {
  console.log('🚀 开始修复余额归集功能...\n')
  
  // 1. 创建测试用户
  const userId = await createTestUser()
  if (!userId) {
    console.log('❌ 无法创建测试用户，停止测试')
    return
  }

  // 2. 测试数据库归集
  const dbResult = await testDatabaseCollection()
  
  // 3. 测试余额查询
  const balanceResult = await testBalanceQuery()
  
  // 4. 测试授权查询
  const allowanceResult = await testAllowanceQuery()
  
  // 5. 测试链上归集（可能会失败，因为需要管理员权限）
  const onChainResult = await testOnChainCollection()
  
  // 6. 检查归集记录
  await checkCollectionRecords()

  // 7. 总结
  console.log('\n📋 修复结果总结:')
  console.log(`✅ 数据库归集: ${dbResult ? '正常' : '异常'}`)
  console.log(`✅ 余额查询: ${balanceResult ? '正常' : '异常'}`)
  console.log(`✅ 授权查询: ${allowanceResult ? '正常' : '异常'}`)
  console.log(`⚠️  链上归集: ${onChainResult ? '正常' : '需要管理员权限配置'}`)
  
  if (!onChainResult) {
    console.log('\n🔧 链上归集修复建议:')
    console.log('1. 确保 ADMIN_PRIVATE_KEY 环境变量已设置')
    console.log('2. 确保管理员地址是合约所有者 (0xc0754D163B8F3C0dD6AdA0168f8029796Bed1BA2)')
    console.log('3. 确保测试用户已授权 USDT 给合约地址')
  }
}

// 运行修复
main().catch(console.error)
