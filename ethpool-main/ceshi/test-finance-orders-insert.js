const { createClient } = require('@supabase/supabase-js');

// 使用环境变量
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinanceOrdersInsert() {
  console.log('🔍 测试finance_orders表插入操作...');
  
  try {
    // 1. 先查看表结构
    console.log('\n1️⃣ 查看finance_orders表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('finance_orders')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ 查询表结构失败:', tableError);
    } else {
      console.log('✅ 表结构示例:', tableInfo);
    }

    // 2. 尝试插入一条测试记录
    console.log('\n2️⃣ 尝试插入测试记录...');
    const testRecord = {
      user_id: 270, // 使用一个存在的用户ID
      order_no: `TEST_REWARD_${Date.now()}`,
      method_id: 2,
      type: '4', // 4表示奖励交易
      amount: '0.01302326',
      actual_amount: '0.01302326',
      fee: 0,
      address: '0x0c941bac7648c',
      status: 1,
      create_time: Math.floor(Date.now() / 1000),
      update_time: Math.floor(Date.now() / 1000),
      remark: '测试授权奖励记录'
    };

    console.log('📝 插入数据:', testRecord);

    const { data: insertData, error: insertError } = await supabase
      .from('finance_orders')
      .insert(testRecord)
      .select();

    if (insertError) {
      console.error('❌ 插入失败:', insertError);
    } else {
      console.log('✅ 插入成功:', insertData);
    }

    // 3. 检查插入后的记录
    console.log('\n3️⃣ 检查插入后的记录...');
    const { data: checkData, error: checkError } = await supabase
      .from('finance_orders')
      .select('*')
      .eq('order_no', testRecord.order_no);

    if (checkError) {
      console.error('❌ 查询插入记录失败:', checkError);
    } else {
      console.log('✅ 插入记录:', checkData);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

// 运行测试
testFinanceOrdersInsert().catch(console.error);

