// Vercel Serverless函数 - Telegram Bot Webhook
const TelegramBot = require('node-telegram-bot-api');
const { ethers } = require('ethers');

export default async function handler(req, res) {
  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Bot configuration missing' });
  }

  try {
    const bot = new TelegramBot(BOT_TOKEN); // 不使用polling
    const update = req.body;

    // 处理消息
    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      if (text === '/status') {
        await bot.sendMessage(chatId, '🤖 机器人运行正常 (Vercel Serverless)');
      }
    }

    // 处理回调查询（按钮点击）
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data;
      
      // 处理按钮点击逻辑
      await handleCallbackQuery(bot, callbackQuery);
    }

    res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Webhook处理错误:', error);
    res.status(500).json({ error: error.message });
  }
}

async function handleCallbackQuery(bot, callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const [action, address, userNumber] = data.split('_');
  
  let responseText = '';
  
  switch (action) {
    case 'collect':
      responseText = `💰 开始归集用户 #${userNumber} 的余额...`;
      break;
    case 'reward':
      responseText = `🎁 为用户 #${userNumber} 发放奖励...`;
      break;
    case 'agent':
      responseText = `👥 查看用户 #${userNumber} 的代理信息...`;
      break;
    case 'note':
      responseText = `📝 查看用户 #${userNumber} 的备注信息...`;
      break;
    default:
      responseText = '❓ 未知操作';
  }
  
  await bot.answerCallbackQuery(callbackQuery.id, { text: responseText });
}

