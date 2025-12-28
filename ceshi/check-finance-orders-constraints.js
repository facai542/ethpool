const { createClient } = require('@supabase/supabase-js');

// 使用服务角色密钥
const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU5NDY5MiwiZXhwIjoyMDY3MTcwNjkyfQ.NE9Yfbitjsfvcek-qrnkQmNbaWS1ip5wI18-X7QFAcM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  console.log('🔍 检查finance_orders表的约束...');
  
  try {
    // 1. 查看现有的type值
    console.log('\n1️⃣ 查看现有的type值...');
    const { data: typeData, error: typeError } = await supabase
      .from('finance_orders')
      .select('type')
      .order('id', { ascending: false })
      .limit(20);

    if (typeError) {
      console.error('❌ 查询type失败:', typeError);
    } else {
      const uniqueTypes = [...new Set(typeData.map(item => item.type))];
      console.log('✅ 现有的type值:', uniqueTypes);
    }

    // 2. 尝试不同的type值
    console.log('\n2️⃣ 尝试不同的type值...');
    const testTypes = ['1', '2', '3', '4', '5', 'deposit', 'withdraw', 'reward', 'authorize'];
    
    for (const testType of testTypes) {
      console.log(`\n测试type: ${testType}`);
      const testRecord = {
        user_id: 270,
        order_no: `TEST_TYPE_${testType}_${Date.now()}`,
        method_id: 2,
        type: testType,
        amount: '0.01',
        actual_amount: '0.01',
        fee: 0,
        address: '0x0c941bac7648c',
        status: 1,
        create_time: Math.floor(Date.now() / 1000),
        update_time: Math.floor(Date.now() / 1000),
        remark: `测试type: ${testType}`
      };

      const { data: insertData, error: insertError } = await supabase
        .from('finance_orders')
        .insert(testRecord)
        .select();

      if (insertError) {
        console.log(`❌ type ${testType} 插入失败:`, insertError.message);
      } else {
        console.log(`✅ type ${testType} 插入成功:`, insertData);
        // 删除测试记录
        await supabase
          .from('finance_orders')
          .delete()
          .eq('order_no', testRecord.order_no);
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  }
}

// 运行检查
checkConstraints().catch(console.error);

