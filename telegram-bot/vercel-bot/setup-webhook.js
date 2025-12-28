// 设置Telegram Bot Webhook的脚本
const https = require('https');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.VERCEL_URL || 'https://your-bot.vercel.app'; // 替换为你的Vercel域名

if (!BOT_TOKEN) {
  console.error('❌ 错误: 请设置 TELEGRAM_BOT_TOKEN 环境变量');
  process.exit(1);
}

async function setupWebhook() {
  const webhookEndpoint = `${WEBHOOK_URL}/webhook`;
  const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`;
  
  const postData = JSON.stringify({
    url: webhookEndpoint,
    allowed_updates: ['message', 'callback_query']
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(telegramApiUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('✅ Webhook设置成功!');
            console.log(`📡 Webhook URL: ${webhookEndpoint}`);
            resolve(response);
          } else {
            console.error('❌ Webhook设置失败:', response.description);
            reject(new Error(response.description));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 获取当前Webhook信息
async function getWebhookInfo() {
  const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`;
  
  return new Promise((resolve, reject) => {
    https.get(telegramApiUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.ok) {
            console.log('📊 当前Webhook信息:');
            console.log(`🔗 URL: ${response.result.url || '未设置'}`);
            console.log(`✅ 证书有效: ${response.result.has_custom_certificate ? '是' : '否'}`);
            console.log(`📈 待处理更新: ${response.result.pending_update_count}`);
            if (response.result.last_error_date) {
              console.log(`❌ 最后错误: ${new Date(response.result.last_error_date * 1000).toLocaleString()}`);
              console.log(`🔍 错误消息: ${response.result.last_error_message}`);
            }
            resolve(response);
          } else {
            reject(new Error(response.description));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}

async function main() {
  try {
    console.log('🔍 检查当前Webhook状态...');
    await getWebhookInfo();
    
    console.log('\n🔧 设置新的Webhook...');
    await setupWebhook();
    
    console.log('\n✅ 完成! 机器人现在使用Webhook模式。');
    console.log('🧪 测试: 向机器人发送 /status 命令');
    
  } catch (error) {
    console.error('❌ 设置失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

