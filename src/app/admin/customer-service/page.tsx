'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink, Loader2, Copy, Check } from 'lucide-react'

export default function CustomerServicePage() {
  const [isOpening, setIsOpening] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 延迟跳转到客服工作台
    const timer = setTimeout(() => {
      setIsOpening(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleOpenCustomerService = () => {
    // 打开客服工作台
    window.open('https://kefu-seven.vercel.app/', '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">客服工作台</h1>
          <p className="text-slate-400">管理用户咨询和客服工作</p>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            客服工作台访问
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isOpening ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
              <p className="text-slate-300">
                正在为您准备客服工作台...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-slate-300 mb-6">
                  点击下方按钮打开客服工作台，使用以下账号密码登录：
                </p>
                
                <Button
                  onClick={handleOpenCustomerService}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  打开客服工作台
                </Button>
              </div>

              <div className="bg-slate-700 p-6 rounded-lg">
                <h3 className="text-white font-semibold mb-4 text-center">登录信息</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <span className="text-slate-300">账号：</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-lg">admin</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('admin')}
                        className="p-1 h-8 w-8"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <span className="text-slate-300">密码：</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono text-lg">123456</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard('123456')}
                        className="p-1 h-8 w-8"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <h4 className="text-blue-300 font-semibold mb-2">使用说明：</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 点击"打开客服工作台"按钮在新窗口中打开客服系统</li>
                  <li>• 使用上述账号密码登录客服工作台</li>
                  <li>• 可以点击复制按钮快速复制账号或密码</li>
                  <li>• 客服工作台用于处理用户咨询和客服相关事务</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
