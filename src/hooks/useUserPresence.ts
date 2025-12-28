import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UserPresenceData {
  wallet_address: string
  user_name: string
  status: 'online' | 'offline' | 'away'
  last_seen: string
  metadata?: Record<string, any>
}

export function useUserPresence(walletAddress: string | undefined) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresenceData[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [presenceId, setPresenceId] = useState<string | null>(null)

  // 更新用户状态
  const updatePresence = useCallback(async (status: 'online' | 'offline' | 'away') => {
    if (!walletAddress) return

    try {
      const { data, error } = await supabase
        .from('user_presence')
        .upsert({
          wallet_address: walletAddress,
          user_name: walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4),
          status,
          last_seen: new Date().toISOString(),
          metadata: {
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
            timestamp: new Date().toISOString()
          }
        }, {
          onConflict: 'wallet_address'
        })
        .select('id')
        .single()

      if (error) {
        console.error('更新在线状态失败:', error)
      } else if (data) {
        setPresenceId(data.id)
        console.log(`✅ 用户在线状态更新: ${status}`)
      }
    } catch (error) {
      console.error('更新在线状态异常:', error)
    }
  }, [walletAddress])

  // 设置用户为在线状态
  const setUserOnline = useCallback(() => {
    updatePresence('online')
    setIsOnline(true)
  }, [updatePresence])

  // 设置用户为离线状态
  const setUserOffline = useCallback(() => {
    updatePresence('offline')
    setIsOnline(false)
  }, [updatePresence])

  // 设置用户为离开状态
  const setUserAway = useCallback(() => {
    updatePresence('away')
  }, [updatePresence])

  useEffect(() => {
    if (!walletAddress) return

    console.log('🚀 启动用户在线状态追踪:', walletAddress)

    // 初始设置为在线
    setUserOnline()

    // 监听页面可见性变化
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserAway()
      } else {
        setUserOnline()
      }
    }

    // 监听页面关闭
    const handleBeforeUnload = () => {
      // 使用sendBeacon确保请求发送
      const data = JSON.stringify({
        wallet_address: walletAddress,
        status: 'offline',
        last_seen: new Date().toISOString()
      })
      
      // 尝试同步更新
      setUserOffline()
    }

    // 定期心跳更新（每30秒）
    const heartbeatInterval = setInterval(() => {
      if (!document.hidden && isOnline) {
        updatePresence('online')
      }
    }, 30000)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    // 清理函数
    return () => {
      clearInterval(heartbeatInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      setUserOffline()
    }
  }, [walletAddress, setUserOnline, setUserAway, setUserOffline, updatePresence, isOnline])

  // 订阅在线用户变化
  useEffect(() => {
    // 获取初始在线用户列表
    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .in('status', ['online', 'away'])
        .order('last_seen', { ascending: false })

      if (error) {
        console.error('获取在线用户失败:', error)
        return
      }

      setOnlineUsers(data || [])
      console.log(`✅ 获取到 ${data?.length || 0} 个在线用户`)
    }

    fetchOnlineUsers()

    // 订阅实时变化
    const channel = supabase
      .channel('user_presence_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('📡 在线状态实时更新:', payload)

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as UserPresenceData

            setOnlineUsers((prev) => {
              const filtered = prev.filter(u => u.wallet_address !== newData.wallet_address)
              
              if (newData.status === 'online' || newData.status === 'away') {
                return [...filtered, newData].sort((a, b) => 
                  new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
                )
              }
              return filtered
            })
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as UserPresenceData
            setOnlineUsers((prev) => prev.filter(u => u.wallet_address !== oldData.wallet_address))
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime订阅状态:', status)
      })

    return () => {
      console.log('🔌 取消Realtime订阅')
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    onlineUsers,
    onlineCount: onlineUsers.length,
    isOnline,
    updatePresence,
    setUserOnline,
    setUserOffline,
    setUserAway
  }
}




