'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Circle } from 'lucide-react'

interface OnlineUser {
  id: string
  wallet_address: string
  user_name: string
  status: 'online' | 'offline' | 'away'
  last_seen: string
  metadata?: Record<string, any>
}

export default function OnlineUsersList() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始在线用户
    const fetchOnlineUsers = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('*')
        .in('status', ['online', 'away'])
        .order('last_seen', { ascending: false })

      if (error) {
        console.error('获取在线用户失败:', error)
      } else {
        setOnlineUsers(data || [])
        console.log(`✅ 获取到 ${data?.length || 0} 个在线用户`)
      }
      setLoading(false)
    }

    fetchOnlineUsers()

    // 订阅实时更新
    const channel = supabase
      .channel('admin_presence_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('📡 在线用户实时更新:', payload)

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newUser = payload.new as OnlineUser

            setOnlineUsers((prev) => {
              const filtered = prev.filter(u => u.wallet_address !== newUser.wallet_address)
              
              if (newUser.status === 'online' || newUser.status === 'away') {
                return [...filtered, newUser].sort((a, b) => 
                  new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
                )
              }
              return filtered
            })
          } else if (payload.eventType === 'DELETE') {
            const oldUser = payload.old as OnlineUser
            setOnlineUsers((prev) => prev.filter(u => u.wallet_address !== oldUser.wallet_address))
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'away':
        return 'text-yellow-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return '在线'
      case 'away':
        return '离开'
      default:
        return '离线'
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}小时前`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}天前`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-800 rounded-lg border border-slate-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Circle className="w-5 h-5 text-green-500 animate-pulse" />
          在线用户
        </h2>
        <span className="text-sm text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
          {onlineUsers.length} 人在线
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {onlineUsers.length === 0 ? (
          <p className="text-center text-slate-500 py-8">暂无在线用户</p>
        ) : (
          onlineUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusBgColor(
                      user.status
                    )} rounded-full border-2 border-slate-800 ${
                      user.status === 'online' ? 'animate-pulse' : ''
                    }`}
                  ></span>
                </div>
                <div>
                  <p className="font-medium text-white font-mono text-sm">
                    {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {user.metadata?.browser ? user.metadata.browser.split(' ')[0] : '未知浏览器'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </p>
                <p className="text-xs text-slate-500">
                  {formatLastSeen(user.last_seen)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          实时更新 · 每30秒心跳检测
        </p>
      </div>
    </div>
  )
}




