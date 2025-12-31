'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface DebugResult {
  id: string
  timestamp: string
  category: string
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  details?: unknown
}

export default function DebugAuthorizationPage() {
  const [testAddress, setTestAddress] = useState('')
  const [debugResults, setDebugResults] = useState<DebugResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addDebugResult = (category: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details?: unknown) => {
    const result: DebugResult = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
      category,
      status,
      message,
      details
    }
    setDebugResults(prev => [result, ...prev])
  }

  const clearResults = () => {
    setDebugResults([])
  }

  const generateTestAddress = () => {
    const address = '0x' + Math.random().toString(16).substr(2, 40)
    setTestAddress(address)
  }

  // 1. 测试授权功能
  const testAuthorization = async () => {
    if (!testAddress) {
      addDebugResult('授权测试', 'error', '请先生成测试地址')
      return
    }

    try {
      setIsLoading(true)
      addDebugResult('授权测试', 'info', `开始测试授权，地址: ${testAddress}`)
      
      const response = await fetch('/api/user/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: testAddress,
          txHash: '0x' + Math.random().toString(16).substr(2, 64),
          authAmount: '1000000',
          isAuthorized: true
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        addDebugResult('授权测试', 'success', '✅ 授权成功')
        
        // 等待3秒后检查用户状态
        setTimeout(async () => {
          try {
            const userResponse = await fetch(`/api/user/info?address=${encodeURIComponent(testAddress)}`)
            const userData = await userResponse.json()
            
            if (userData.success) {
              addDebugResult('用户状态', 'success', `✅ 用户已授权，ETH余额: ${userData.data.eth}`)
            } else {
              addDebugResult('用户状态', 'error', '❌ 用户状态检查失败')
            }
          } catch (error) {
            addDebugResult('用户状态', 'error', '❌ 用户状态检查异常')
          }
        }, 3000)
        
      } else {
        addDebugResult('授权测试', 'error', `❌ 授权失败: ${data.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      addDebugResult('授权测试', 'error', `❌ 授权测试异常: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. 测试Telegram群组消息
  const testTelegramMessage = async () => {
    try {
      setIsLoading(true)
      addDebugResult('Telegram测试', 'info', '开始测试Telegram群组消息发送...')
      
      // 直接测试Telegram API发送
      addDebugResult('步骤1', 'info', '直接测试Telegram API发送...')
      
      const testData = {
        user_id: 999999,
        user_address: '0xTestTelegramMessage',
        notification_type: 'user_authorize',
        notification_data: {
          userId: 999999,
          address: '0xTestTelegramMessage',
          authAddress: '0xTestTelegramMessage',
          authAmount: '1000000',
          txHash: '0xTestHash',
          timestamp: new Date().toISOString()
        },
        is_sent: false
      }
      
      // 先添加到队列
      addDebugResult('步骤2', 'info', '添加测试通知到队列...')
      const addResponse = await fetch('/api/telegram/notification-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      
      if (!addResponse.ok) {
        addDebugResult('步骤2', 'error', `❌ 添加通知失败: HTTP ${addResponse.status}`)
        return
      }
      
      const addResult = await addResponse.json()
      
      if (addResult.success) {
        addDebugResult('步骤2', 'success', '✅ 测试通知已添加到队列')
        
        // 立即发送
        addDebugResult('步骤3', 'info', '立即发送Telegram消息...')
        const sendResponse = await fetch('/api/telegram/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (!sendResponse.ok) {
          addDebugResult('步骤3', 'error', `❌ 发送请求失败: HTTP ${sendResponse.status}`)
          return
        }
        
        const sendResult = await sendResponse.json()
        
        if (sendResult.success) {
          addDebugResult('步骤3', 'success', `✅ 发送完成: 成功 ${sendResult.successful} 条，总计 ${sendResult.processed} 条`)
          
          // 检查最终状态
          addDebugResult('步骤4', 'info', '检查最终发送状态...')
          setTimeout(async () => {
            try {
              const statusResponse = await fetch('/api/telegram/notification-queue')
              const statusResult = await statusResponse.json()
              
              if (statusResult.success) {
                const testNotification = statusResult.data.notifications?.find((n: { user_address: string }) => n.user_address === '0xTestTelegramMessage')
                if (testNotification) {
                  if (testNotification.is_sent) {
                    addDebugResult('最终结果', 'success', `✅ 群组已收到消息！消息ID: ${testNotification.telegram_message_id}`)
                    addDebugResult('群组状态', 'success', '✅ Telegram群组消息发送成功！')
                  } else {
                    addDebugResult('最终结果', 'error', `❌ 群组未收到消息！错误: ${testNotification.error_message || '未知错误'}`)
                    addDebugResult('群组状态', 'error', '❌ Telegram群组消息发送失败！')
                  }
                } else {
                  addDebugResult('最终结果', 'error', '❌ 未找到测试通知记录')
                }
              } else {
                addDebugResult('最终结果', 'error', `❌ 检查状态失败: ${statusResult.error}`)
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : '未知错误'
              addDebugResult('最终结果', 'error', `❌ 检查群组消息状态失败: ${errorMessage}`)
            }
          }, 3000)
          
        } else {
          addDebugResult('步骤3', 'error', `❌ 发送失败: ${sendResult.error}`)
          addDebugResult('群组状态', 'error', '❌ Telegram群组消息发送失败！')
        }
      } else {
        addDebugResult('步骤2', 'error', `❌ 添加测试通知失败: ${addResult.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      const errorStack = error instanceof Error ? error.stack : '无堆栈信息'
      addDebugResult('Telegram测试', 'error', `❌ Telegram测试异常: ${errorMessage}`)
      addDebugResult('错误详情', 'error', `详细错误: ${errorStack}`)
      
      // 添加具体的错误分析
      if (errorMessage.includes('fetch')) {
        addDebugResult('错误分析', 'error', '❌ 网络请求失败，可能是API端点不可用')
      } else if (errorMessage.includes('JSON')) {
        addDebugResult('错误分析', 'error', '❌ 响应解析失败，可能是服务器返回了错误格式')
      } else if (errorMessage.includes('timeout')) {
        addDebugResult('错误分析', 'error', '❌ 请求超时，可能是服务器响应太慢')
      } else {
        addDebugResult('错误分析', 'error', `❌ 未知错误类型: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // 3. 检查系统状态
  const checkSystemStatus = async () => {
    try {
      addDebugResult('系统检查', 'info', '检查系统状态...')
      
      // 检查环境变量
      const envResponse = await fetch('/api/debug/system-status')
      const envResult = await envResponse.json()
      
      if (envResult.success) {
        const env = envResult.data.environment
        addDebugResult('环境变量', 'info', 
          `Token: ${env.TELEGRAM_BOT_TOKEN}, ChatID: ${env.TELEGRAM_CHAT_ID}`
        )
      }
      
      // 检查Telegram服务
      const telegramResponse = await fetch('/api/telegram-realtime/status')
      const telegramResult = await telegramResponse.json()
      
      if (telegramResult.success) {
        addDebugResult('Telegram服务', 'info', 
          `运行状态: ${telegramResult.data.isRunning ? '正常' : '异常'}`
        )
      }
      
      // 检查通知队列
      const queueResponse = await fetch('/api/telegram/notification-queue')
      const queueResult = await queueResponse.json()
      
      if (queueResult.success) {
        const notifications = queueResult.data.notifications || []
        const pending = notifications.filter((n: { is_sent: boolean }) => !n.is_sent).length
        const sent = notifications.filter((n: { is_sent: boolean }) => n.is_sent).length
        
        addDebugResult('通知队列', 'info', `总通知: ${notifications.length}, 待发送: ${pending}, 已发送: ${sent}`)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      addDebugResult('系统检查', 'error', `❌ 系统检查异常: ${errorMessage}`)
    }
  }

  // 4. 详细诊断Telegram问题
  const detailedTelegramDiagnosis = async () => {
    try {
      addDebugResult('详细诊断', 'info', '开始详细诊断Telegram问题...')
      
      // 1. 检查环境变量
      addDebugResult('步骤1', 'info', '检查环境变量配置...')
      const envResponse = await fetch('/api/debug/system-status')
      const envResult = await envResponse.json()
      
      if (envResult.success) {
        const env = envResult.data.environment
        if (env.TELEGRAM_BOT_TOKEN === '✅ 已配置') {
          addDebugResult('环境变量', 'success', '✅ TELEGRAM_BOT_TOKEN 已配置')
        } else {
          addDebugResult('环境变量', 'error', '❌ TELEGRAM_BOT_TOKEN 未配置')
        }
        
        if (env.TELEGRAM_CHAT_ID === '✅ 已配置') {
          addDebugResult('环境变量', 'success', '✅ TELEGRAM_CHAT_ID 已配置')
        } else {
          addDebugResult('环境变量', 'error', '❌ TELEGRAM_CHAT_ID 未配置')
        }
      } else {
        addDebugResult('环境变量', 'error', `❌ 无法检查环境变量: ${envResult.error}`)
      }
      
      // 2. 测试Telegram API连接
      addDebugResult('步骤2', 'info', '测试Telegram API连接...')
      try {
        const testResponse = await fetch('/api/telegram/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        const testResult = await testResponse.json()
        
        if (testResult.success) {
          addDebugResult('API连接', 'success', `✅ Telegram API连接正常，处理了 ${testResult.processed} 条通知`)
        } else {
          addDebugResult('API连接', 'error', `❌ Telegram API连接失败: ${testResult.error}`)
        }
      } catch (apiError) {
        const apiErrorMessage = apiError instanceof Error ? apiError.message : '未知错误'
        addDebugResult('API连接', 'error', `❌ Telegram API连接异常: ${apiErrorMessage}`)
      }
      
      // 3. 检查数据库连接
      addDebugResult('步骤3', 'info', '检查数据库连接...')
      try {
        const dbResponse = await fetch('/api/telegram/notification-queue')
        const dbResult = await dbResponse.json()
        
        if (dbResult.success) {
          addDebugResult('数据库', 'success', '✅ 数据库连接正常')
          
          const notifications = dbResult.data.notifications || []
          const failedNotifications = notifications.filter((n: { error_message: string }) => n.error_message)
          
          if (failedNotifications.length > 0) {
            addDebugResult('失败通知', 'warning', `发现 ${failedNotifications.length} 条失败的通知`)
            failedNotifications.slice(0, 3).forEach((notification: { error_message: string; retry_count: number }, index: number) => {
              addDebugResult(`失败通知${index + 1}`, 'error', 
                `错误: ${notification.error_message}, 重试次数: ${notification.retry_count}`
              )
            })
          } else {
            addDebugResult('失败通知', 'success', '✅ 没有失败的通知')
          }
        } else {
          addDebugResult('数据库', 'error', `❌ 数据库连接失败: ${dbResult.error}`)
        }
      } catch (dbError) {
        const dbErrorMessage = dbError instanceof Error ? dbError.message : '未知错误'
        addDebugResult('数据库', 'error', `❌ 数据库连接异常: ${dbErrorMessage}`)
      }
      
      // 4. 检查网络连接
      addDebugResult('步骤4', 'info', '检查网络连接...')
      try {
        const networkResponse = await fetch('https://api.telegram.org/bot123456789:test/getMe')
        addDebugResult('网络连接', 'success', '✅ 网络连接正常')
      } catch (networkError) {
        const networkErrorMessage = networkError instanceof Error ? networkError.message : '未知错误'
        addDebugResult('网络连接', 'error', `❌ 网络连接异常: ${networkErrorMessage}`)
      }
      
      addDebugResult('详细诊断', 'info', '✅ 详细诊断完成，请查看上述结果')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      addDebugResult('详细诊断', 'error', `❌ 详细诊断异常: ${errorMessage}`)
    }
  }

  useEffect(() => {
    generateTestAddress()
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">🔧 系统测试工具</h1>
      
      {/* 测试地址 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">测试地址</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={testAddress}
            onChange={(e) => setTestAddress(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
          />
          <button
            onClick={generateTestAddress}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            生成新地址
          </button>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">功能测试</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testAuthorization}
            disabled={isLoading}
            className="px-6 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-lg font-semibold"
          >
            {isLoading ? '测试中...' : '🎯 测试授权'}
          </button>
          <button
            onClick={testTelegramMessage}
            disabled={isLoading}
            className="px-6 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-lg font-semibold"
          >
            {isLoading ? '测试中...' : '📱 测试群组消息'}
          </button>
          <button
            onClick={checkSystemStatus}
            disabled={isLoading}
            className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg font-semibold"
          >
            {isLoading ? '检查中...' : '🔍 检查系统状态'}
          </button>
          <button
            onClick={detailedTelegramDiagnosis}
            disabled={isLoading}
            className="px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 text-lg font-semibold"
          >
            {isLoading ? '诊断中...' : '🔬 详细诊断Telegram'}
          </button>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            清空结果
          </button>
        </div>
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>重要提示：</strong>如果看到"Telegram测试异常"，请点击"🔬 详细诊断Telegram"按钮查看具体的错误原因和解决方案！
          </p>
        </div>
      </div>

      {/* 测试结果 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">测试结果</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {debugResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">暂无测试结果</p>
          ) : (
            debugResults.map((result) => (
              <div
                key={result.id}
                className={`p-3 rounded-md border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-500 text-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : result.status === 'warning'
                    ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                    : 'bg-blue-50 border-blue-500 text-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">[{result.category}]</span>
                    <span className="ml-2">{result.message}</span>
                  </div>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}