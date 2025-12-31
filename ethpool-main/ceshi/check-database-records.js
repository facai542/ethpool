const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseRecords() {
  console.log('🔍 检查数据库记录...');
  
  try {
    // 1. 检查用户表
    console.log('\n1️⃣ 检查用户表...');
    const { data: users, error: usersError } = await supabase
      .from('nh_member')
      .select('id, address, eth, usdt, cash, add_time, update_time')
      .order('id', { ascending: false })
      .limit(10);

    if (usersError) {
      console.error('❌ 查询用户失败:', usersError);
    } else {
      console.log('✅ 用户记录:', users);
    }

    // 2. 检查finance_orders表
    console.log('\n2️⃣ 检查finance_orders表...');
    const { data: orders, error: ordersError } = await supabase
      .from('finance_orders')
      .select('*')
      .order('create_time', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ 查询finance_orders失败:', ordersError);
    } else {
      console.log('✅ finance_orders记录:', orders);
    }

    // 3. 检查nh_logs表
    console.log('\n3️⃣ 检查nh_logs表...');
    const { data: logs, error: logsError } = await supabase
      .from('nh_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ 查询nh_logs失败:', logsError);
    } else {
      console.log('✅ nh_logs记录:', logs);
    }

    // 4. 检查是否有ETH余额大于0的用户
    console.log('\n4️⃣ 检查有ETH余额的用户...');
    const { data: ethUsers, error: ethError } = await supabase
      .from('nh_member')
      .select('id, address, eth')
      .gt('eth', '0')
      .order('eth', { ascending: false });

    if (ethError) {
      console.error('❌ 查询ETH用户失败:', ethError);
    } else {
      console.log('✅ 有ETH余额的用户:', ethUsers);
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkDatabaseRecords().catch(console.error);

