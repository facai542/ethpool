const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApiDirect() {
  console.log('🔍 直接调试API逻辑...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    // 1. 查找用户
    console.log('\n1️⃣ 查找用户...');
    const { data: user, error: userError } = await supabase
      .from('nh_member')
      .select('*')
      .eq('address', testAddress)
      .eq('is_del', 0)
      .single();

    if (userError) {
      console.error('❌ 用户查询失败:', userError);
      return;
    }
    console.log('✅ 用户找到:', user.id, user.address);

    // 2. 查询提现记录
    console.log('\n2️⃣ 查询提现记录...');
    const { data: withdrawals, error: withdrawError } = await supabase
      .from('nh_withdraw')
      .select('*')
      .eq('user_id', user.id)
      .order('add_time', { ascending: false })
      .range(0, 20);

    if (withdrawError) {
      console.error('❌ 提现记录查询失败:', withdrawError);
    } else {
      console.log('✅ 提现记录:', withdrawals.length, '条');
      withdrawals.forEach((w, i) => {
        console.log(`  ${i+1}. 金额: ${w.price} USDT, 状态: ${w.status}, 时间: ${w.add_time}`);
      });
    }

    // 3. 查询finance_orders记录
    console.log('\n3️⃣ 查询finance_orders记录...');
    const { data: financeOrders, error: ordersError } = await supabase
      .from('finance_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('create_time', { ascending: false })
      .range(0, 30);

    if (ordersError) {
      console.error('❌ finance_orders查询失败:', ordersError);
    } else {
      console.log('✅ finance_orders记录:', financeOrders.length, '条');
      financeOrders.forEach((order, i) => {
        console.log(`  ${i+1}. 类型: ${order.type}, 金额: ${order.amount}, 备注: ${order.remark}`);
      });
    }

    // 4. 查询nh_logs记录
    console.log('\n4️⃣ 查询nh_logs记录...');
    const { data: logs, error: logsError } = await supabase
      .from('nh_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(0, 20);

    if (logsError) {
      console.error('❌ nh_logs查询失败:', logsError);
    } else {
      console.log('✅ nh_logs记录:', logs.length, '条');
      logs.forEach((log, i) => {
        console.log(`  ${i+1}. 动作: ${log.action}, 详情: ${log.details}`);
      });
    }

    // 5. 模拟API处理逻辑
    console.log('\n5️⃣ 模拟API处理逻辑...');
    const transactions = [];

    // 添加提现记录
    if (withdrawals) {
      withdrawals.forEach(withdrawal => {
        transactions.push({
          type: 'Extract',
          amount: withdrawal.price?.toString() || '0',
          token: 'USDT',
          hash: withdrawal.hash || 'Pending',
          time: withdrawal.add_time,
          status: withdrawal.status === 1 ? 'success' : withdrawal.status === 0 ? 'pending' : 'failed',
          network: 'BSC',
          description: 'User withdrawal'
        });
      });
    }

    // 添加finance_orders记录
    if (financeOrders && financeOrders.length > 0) {
      financeOrders.forEach(order => {
        if (order.remark && order.remark.includes('[ETH奖励]')) {
          transactions.push({
            type: 'ETH奖励',
            amount: order.amount?.toString() || '0',
            token: 'ETH',
            hash: 'System Reward',
            time: new Date(order.create_time * 1000).toISOString(),
            status: order.status === 1 ? 'success' : 'pending',
            network: 'Platform',
            description: order.remark || 'Authorization reward'
          });
        } else if (order.type === 'withdraw' && order.remark && order.remark.includes('授权')) {
          transactions.push({
            type: '授权',
            amount: '授权',
            token: 'USDT',
            hash: order.remark?.includes('哈希') ? 
              order.remark.match(/哈希: ([A-Fa-f0-9x]+)/)?.[1] || 'System' : 'System',
            time: new Date(order.create_time * 1000).toISOString(),
            status: order.status === 1 ? 'success' : 'pending',
            network: 'BSC',
            description: order.remark || 'Wallet authorization'
          });
        } else if (order.type === 'withdraw') {
          transactions.push({
            type: '提现',
            amount: order.amount?.toString() || '0',
            token: 'USDT',
            hash: order.address || 'Pending',
            time: new Date(order.create_time * 1000).toISOString(),
            status: order.status === 1 ? 'success' : 'pending',
            network: 'BSC',
            description: order.remark || 'User withdrawal'
          });
        }
      });
    }

    // 添加日志记录
    if (logs && logs.length > 0) {
      logs.forEach(log => {
        if (log.action === 'authorize') {
          transactions.push({
            type: 'authorize',
            amount: 'authorize',
            token: 'USDT',
            hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
            time: log.created_at,
            status: 'success',
            network: 'BSC',
            description: 'USDT authorization'
          });
        }
      });
    }

    console.log('\n📊 最终交易记录:', transactions.length, '条');
    transactions.forEach((tx, i) => {
      console.log(`  ${i+1}. ${tx.type} - ${tx.amount} ${tx.token} - ${tx.status}`);
    });

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

// 运行调试
debugApiDirect().catch(console.error);

