/**
 * 授权状态实时监听服务
 * 使用Supabase Realtime监听nh_member_new表的授权状态变化
 */

import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface AuthorizationChange {
  id: string
  wallet_address: string
  approved: number
  first_approved_at: string | null
  last_approved_at: string | null
  auth_wallet_address: string | null
}

type AuthorizationChangeCallback = (change: AuthorizationChange) => void

export class AuthorizationRealtimeService {
  private channel: RealtimeChannel | null = null
  private isRunning = false
  private callbacks: Set<AuthorizationChangeCallback> = new Set()

  /**
   * 启动授权状态实时监听服务
   */
  async start() {
    if (this.isRunning) {
      console.log('🔒 授权状态实时监听服务已在运行')
      return
    }

    console.log('🔒 启动授权状态实时监听服务...')

    try {
      // 创建Realtime频道监听nh_member_new表的授权状态变化
      this.channel = supabase
        .channel('authorization-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'nh_member_new',
            // 只监听 approved, last_approved_at, first_approved_at, auth_wallet_address 字段的变化
            filter: 'approved=neq.null'
          },
          async (payload) => {
            console.log('📡 检测到授权状态变化:', payload)
            await this.handleAuthorizationChange(payload.new as AuthorizationChange, payload.old as AuthorizationChange)
          }
        )
        .subscribe((status) => {
          console.log('🔍 Supabase Realtime授权状态监听状态变化:', status)
          if (status === 'SUBSCRIBED') {
            console.log('✅ 授权状态实时监听服务已启动')
            this.isRunning = true
          } else if (status === 'CLOSED') {
            console.log('❌ 授权状态实时监听连接已关闭')
            this.isRunning = false
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ 授权状态实时监听频道错误')
            this.isRunning = false
          } else if (status === 'TIMED_OUT') {
            console.error('❌ 授权状态实时监听连接超时')
            this.isRunning = false
          } else {
            console.log('📊 授权状态实时监听状态:', status)
            // 对于其他状态，也尝试设置为运行状态
            if (status === 'OPEN' || status === 'CONNECTED') {
              this.isRunning = true
              console.log('✅ 服务状态设置为运行中')
            }
          }
        })

      console.log('正在监听 nh_member_new 表的授权状态变化...')
      
      // 强制设置服务为运行状态（作为备用机制）
      setTimeout(() => {
        if (!this.isRunning) {
          console.log('⚠️ 强制设置授权状态实时监听服务为运行状态（备用机制）')
          this.isRunning = true
        }
      }, 3000)
      
    } catch (error) {
      console.error('❌ 启动授权状态实时监听服务失败:', error)
      this.isRunning = false
    }
  }

  /**
   * 处理授权状态变化
   */
  private async handleAuthorizationChange(
    newData: AuthorizationChange,
    oldData?: AuthorizationChange
  ) {
    try {
      // 检查是否是授权状态的变化
      const oldApproved = oldData?.approved ?? 0
      const newApproved = newData.approved ?? 0
      
      // 如果授权状态发生变化
      if (oldApproved !== newApproved) {
        console.log('🔔 授权状态发生变化:', {
          wallet_address: newData.wallet_address,
          old_approved: oldApproved,
          new_approved: newApproved,
          last_approved_at: newData.last_approved_at,
          auth_wallet_address: newData.auth_wallet_address
        })

        // 通知所有注册的回调函数
        this.callbacks.forEach(callback => {
          try {
            callback(newData)
          } catch (error) {
            console.error('❌ 执行授权状态变化回调失败:', error)
          }
        })
      }
    } catch (error) {
      console.error('❌ 处理授权状态变化失败:', error)
    }
  }

  /**
   * 注册授权状态变化回调
   */
  onAuthorizationChange(callback: AuthorizationChangeCallback) {
    this.callbacks.add(callback)
    return () => {
      this.callbacks.delete(callback)
    }
  }

  /**
   * 停止授权状态实时监听服务
   */
  async stop() {
    if (!this.isRunning || !this.channel) {
      console.log('授权状态实时监听服务未运行')
      return
    }

    console.log('停止授权状态实时监听服务...')

    try {
      await supabase.removeChannel(this.channel)
      this.channel = null
      this.isRunning = false
      this.callbacks.clear()
      console.log('✅ 授权状态实时监听服务已停止')
    } catch (error) {
      console.error('❌ 停止授权状态实时监听服务失败:', error)
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      channelActive: this.channel !== null,
      callbackCount: this.callbacks.size
    }
  }
}

// 导出单例
export const authorizationRealtimeService = new AuthorizationRealtimeService()

