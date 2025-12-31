'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { sessionService } from '@/services/sessionService'

export default function TestSessionPage() {
  const { 
    account, 
    isConnected, 
    isAuthenticated, 
    user, 
    wallet, 
    session,
    connect,
    disconnect,
    refreshSession
  } = useWallet()
  
  const [sessionData, setSessionData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 页面加载时检查会话
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)
      try {
        const data = await sessionService.autoValidateSession()
        setSessionData(data)
      } catch (error) {
        console.error('检查会话失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleCreateSession = async () => {
    if (!account) {
      alert('请先连接钱包')
      return
    }

    setIsLoading(true)
    try {
      const result = await sessionService.createSession(account, 'metamask', 56)
      if (result.success) {
        alert('会话创建成功！')
        setSessionData(result.data)
      } else {
        alert('会话创建失败: ' + result.error)
      }
    } catch (error) {
      console.error('创建会话失败:', error)
      alert('创建会话失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidateSession = async () => {
    setIsLoading(true)
    try {
      const result = await sessionService.validateSession()
      if (result.success) {
        alert('会话验证成功！')
        setSessionData(result.data)
      } else {
        alert('会话验证失败: ' + result.error)
      }
    } catch (error) {
      console.error('验证会话失败:', error)
      alert('验证会话失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await sessionService.logout()
      setSessionData(null)
      alert('登出成功！')
    } catch (error) {
      console.error('登出失败:', error)
      alert('登出失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">会话管理测试页面</h1>
        
        {/* 钱包状态 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">钱包状态</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">连接状态:</span>
              <span className={`ml-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? '已连接' : '未连接'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">地址:</span>
              <span className="ml-2 text-blue-400">{account || '未连接'}</span>
            </div>
            <div>
              <span className="text-gray-400">认证状态:</span>
              <span className={`ml-2 ${isAuthenticated ? 'text-green-400' : 'text-red-400'}`}>
                {isAuthenticated ? '已认证' : '未认证'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">用户ID:</span>
              <span className="ml-2 text-blue-400">{user?.id || '无'}</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            {!isConnected ? (
              <button
                onClick={connect}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                连接钱包
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
              >
                断开连接
              </button>
            )}
          </div>
        </div>

        {/* 会话管理 */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">会话管理</h2>
          
          <div className="mb-4">
            <span className="text-gray-400">本地会话令牌:</span>
            <div className="mt-2 p-2 bg-gray-700 rounded text-sm font-mono break-all">
              {sessionService.getSessionToken() || '无'}
            </div>
          </div>

          <div className="mb-4">
            <span className="text-gray-400">本地用户数据:</span>
            <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
              <pre>{JSON.stringify(sessionService.getUserData(), null, 2)}</pre>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCreateSession}
              disabled={isLoading || !isConnected}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg"
            >
              创建会话
            </button>
            <button
              onClick={handleValidateSession}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg"
            >
              验证会话
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded-lg"
            >
              登出
            </button>
            <button
              onClick={refreshSession}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-4 py-2 rounded-lg"
            >
              刷新会话
            </button>
          </div>
        </div>

        {/* 会话数据 */}
        {sessionData && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">当前会话数据</h2>
            <div className="bg-gray-700 rounded p-4">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <div>处理中...</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

