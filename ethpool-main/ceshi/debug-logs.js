const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLogs() {
  console.log('🔍 调试日志记录处理...');
  
  try {
    const testAddress = '0x6ce3a1a06235f4C6FA94266887Bf22182ec2392f';
    
    // 1. 查找用户
    const { data: user, error: userError } = await supabase
      .from('nh_member')
      .select('id')
      .eq('address', testAddress)
      .eq('is_del', 0)
      .single();

    if (userError) {
      console.error('❌ 用户查询失败:', userError);
      return;
    }

    // 2. 查询货币兑换日志
    console.log('\n1️⃣ 查询货币兑换日志...');
    const { data: logs, error: logsError } = await supabase
      .from('nh_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('action', 'currency_exchange')
      .order('created_at', { ascending: false });

    if (logsError) {
      console.error('❌ 日志查询失败:', logsError);
    } else {
      console.log('✅ 货币兑换日志:', logs.length, '条');
      logs.forEach((log, i) => {
        console.log(`  ${i+1}. 动作: ${log.action}, 描述: ${log.description}, 时间: ${log.created_at}`);
      });
    }

    // 3. 模拟parseLogData函数
    console.log('\n2️⃣ 模拟parseLogData函数...');
    if (logs && logs.length > 0) {
      logs.forEach((log, i) => {
        console.log(`\n处理日志 ${i+1}:`);
        console.log(`  原始描述: ${log.description}`);
        
        const details = log.description || '';
        const usdtMatch = details.match(/->\s*(\d+\.?\d*)\s*USDT/);
        
        if (usdtMatch) {
          console.log(`  ✅ 匹配成功: ${usdtMatch[1]} USDT`);
          const result = {
            type: '收益',
            amount: usdtMatch[1],
            token: 'USDT',
            hash: 'Currency Exchange',
            time: log.created_at,
            status: 'success',
            network: 'Platform',
            description: details || 'Currency exchange'
          };
          console.log(`  处理结果:`, result);
        } else {
          console.log(`  ❌ 匹配失败`);
        }
      });
    }

  } catch (error) {
    console.error('❌ 调试过程中发生错误:', error);
  }
}

debugLogs();

