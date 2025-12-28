const { ethers } = require('ethers');
require('dotenv').config({ path: '../.env.local' });

// 配置
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';
const TEST_ADDRESS = '0xbDa6620688a7B3D574FF7C234090Dc2e51Fc7077';

async function verifyRealMonitoring() {
  try {
    console.log('🔍 验证真正的区块链监听服务...\n');
    
    // 1. 检查监听服务状态
    console.log('📋 1. 检查监听服务状态');
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
    const latestBlock = await provider.getBlockNumber();
    console.log(`最新区块号: ${latestBlock}`);
    
    // 2. 检查最近的USDT交易
    console.log('\n📋 2. 检查最近的USDT交易');
    const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const USDT_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    // 检查最近10个区块的USDT交易
    const fromBlock = Math.max(0, latestBlock - 10);
    const logs = await provider.getLogs({
      fromBlock: fromBlock,
      toBlock: latestBlock,
      address: USDT_CONTRACT,
      topics: [USDT_TRANSFER_TOPIC]
    });
    
    console.log(`最近10个区块发现 ${logs.length} 个USDT Transfer事件`);
    
    if (logs.length > 0) {
      console.log('\n最近的USDT交易:');
      for (let i = 0; i < Math.min(3, logs.length); i++) {
        const log = logs[i];
        const from = '0x' + log.topics[1].slice(26);
        const to = '0x' + log.topics[2].slice(26);
        const amountHex = log.data;
        const amountWei = BigInt(amountHex);
        const amount = (Number(amountWei) / Math.pow(10, 6)).toString();
        
        console.log(`  ${i + 1}. ${from} -> ${to}, 金额: ${parseFloat(amount).toFixed(6)} USDT`);
        
        // 检查是否涉及监听地址
        if (from.toLowerCase() === TEST_ADDRESS.toLowerCase() || 
            to.toLowerCase() === TEST_ADDRESS.toLowerCase()) {
          console.log(`    🎯 涉及监听地址: ${TEST_ADDRESS}`);
        }
      }
    }
    
    // 3. 检查监听地址状态
    console.log('\n📋 3. 检查监听地址状态');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: monitorData } = await supabase
      .from('wallet_monitor')
      .select('*')
      .eq('is_active', true)
      .eq('monitor_transactions', true);
    
    console.log(`活跃监听地址数: ${monitorData ? monitorData.length : 0}`);
    
    const isMonitored = monitorData && monitorData.some(item => 
      item.wallet_address.toLowerCase() === TEST_ADDRESS.toLowerCase()
    );
    console.log(`测试地址监听状态: ${isMonitored ? '✅ 已监听' : '❌ 未监听'}`);
    
    // 4. 检查最近的通知记录
    console.log('\n📋 4. 检查最近的通知记录');
    const { data: notifications } = await supabase
      .from('telegram_notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`最近通知记录数: ${notifications ? notifications.length : 0}`);
    if (notifications && notifications.length > 0) {
      console.log('最新通知:', {
        type: notifications[0].notification_type,
        address: notifications[0].user_address,
        sent: notifications[0].is_sent,
        time: notifications[0].created_at
      });
    }
    
    // 5. 检查最近的交易记录
    console.log('\n📋 5. 检查最近的交易记录');
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log(`最近交易记录数: ${transactions ? transactions.length : 0}`);
    if (transactions && transactions.length > 0) {
      console.log('最新交易:', {
        address: transactions[0].user_address,
        type: transactions[0].transaction_type,
        amount: transactions[0].amount,
        processed: transactions[0].is_processed,
        time: transactions[0].created_at
      });
    }
    
    console.log('\n✅ 验证完成!');
    console.log('\n📊 总结:');
    console.log(`- 最新区块: ${latestBlock}`);
    console.log(`- USDT交易: ${logs.length}个 (最近10个区块)`);
    console.log(`- 监听地址: ${monitorData ? monitorData.length : 0}个`);
    console.log(`- 通知记录: ${notifications ? notifications.length : 0}条`);
    console.log(`- 交易记录: ${transactions ? transactions.length : 0}条`);
    
  } catch (error) {
    console.error('❌ 验证失败:', error);
  }
}

// 运行验证
verifyRealMonitoring();


