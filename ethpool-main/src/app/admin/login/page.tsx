'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Lock, User, Eye, EyeOff, Users } from 'lucide-react'
import { CanvasRevealEffect } from '@/components/ui/sign-in-flow-1'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAgentLogin = searchParams?.get('agent') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = isAgentLogin 
        ? '/api/admin/auth/login?agent=true' 
        : '/api/admin/auth/login'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.success) {
        console.log('登录成功，服务器已设置会话:', data.admin)
        window.location.href = '/admin/dashboard'
      } else {
        setError(data.message || '登录失败')
      }
    } catch (error) {
      console.error('登录错误:', error)
      setError('登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* 3D 动画背景 */}
      <div className="absolute inset-0 z-0">
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[
            [255, 255, 255],
            [255, 255, 255],
          ]}
          dotSize={6}
          reverse={false}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.7)_0%,_rgba(0,0,0,0.9)_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
      </div>

      {/* 登录表单 */}
      <div className="relative z-10 max-w-md w-full px-8">
        <div className="text-center mb-8">
          <div className={`mx-auto w-20 h-20 ${isAgentLogin ? 'bg-blue-600' : 'bg-red-600'} rounded-full flex items-center justify-center shadow-lg mb-6`}>
            {isAgentLogin ? <Users className="w-10 h-10 text-white" /> : <Shield className="w-10 h-10 text-white" />}
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            {isAgentLogin ? '代理后台登录' : '管理员登录'}
          </h2>
          <p className="text-slate-400">
            {isAgentLogin ? '请输入您的代理账号密码' : '请输入您的管理员账号密码'}
          </p>
        </div>

        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {isAgentLogin ? '代理后台系统' : '后台管理系统'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">用户名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="请输入管理员账号"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                    placeholder="请输入密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
