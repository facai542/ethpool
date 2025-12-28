const { createClient } = require('@supabase/supabase-js');

// 使用服务角色密钥
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWithServiceKey() {
  console.log('🔍 使用服务角色密钥测试finance_orders表插入...');
  
  try {
    // 尝试插入一条测试记录
    console.log('\n1️⃣ 尝试插入测试记录...');
    const testRecord = {
      user_id: 270,
      order_no: `SERVICE_TEST_REWARD_${Date.now()}`,
      method_id: 2,
      type: '4',
      amount: '0.01302326',
      actual_amount: '0.01302326',
      fee: 0,
      address: '0x0c941bac7648c',
      status: 1,
      create_time: Math.floor(Date.now() / 1000),
      update_time: Math.floor(Date.now() / 1000),
      remark: '服务角色测试授权奖励记录'
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

    // 检查插入后的记录
    console.log('\n2️⃣ 检查插入后的记录...');
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
testWithServiceKey().catch(console.error);

