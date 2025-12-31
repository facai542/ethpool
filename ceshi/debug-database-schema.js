const fetch = require('node-fetch');

async function debugDatabaseSchema() {
  console.log('🔍 调试数据库表结构...');
  
  try {
    // 创建一个简单的测试脚本来检查数据库连接
    const response = await fetch('https://ethmax.vercel.app/api/test/eth-price');
    
    if (response.ok) {
      console.log('✅ 基本API连接正常');
      
      // 测试一个简单的数据库查询
      const testResponse = await fetch('https://ethmax.vercel.app/api/user/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: '0x1234567890123456789012345678901234567890',
          isAuthorized: false
        })
      });
      
      const errorText = await testResponse.text();
      console.log('📊 错误详情:', errorText);
      
      // 分析错误信息
      if (errorText.includes('date/time field value out of range')) {
        console.log('🔍 问题分析:');
        console.log('  - 错误类型: 时间戳格式不匹配');
        console.log('  - 当前使用: Unix时间戳 (10位数字)');
        console.log('  - 数据库期望: 可能是ISO字符串格式');
        console.log('  - 建议: 检查nh_member表的时间字段类型');
      }
      
    } else {
      console.log('❌ 基本API连接失败');
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugDatabaseSchema();
