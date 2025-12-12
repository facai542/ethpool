'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ShaderBackground from '@/components/ui/shader-background'

function AdminLoginContent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
        window.location.href = '/admin'
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
    <>
      <style>{`
        *,
        *::after,
        *::before {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .bg {
          display: flex;
          min-height: 100dvh;
          background-color: black;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
        }

        input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
      <main className="bg">
        <ShaderBackground className="fixed inset-0 w-full h-full" />
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 10000,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 0.5rem 0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>{isAgentLogin ? '代理后台登录' : '管理后台登录'}</h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.875rem',
              margin: '0',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>{isAgentLogin ? '代理管理系统' : '投资理财管理系统'}</p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>管理员账号</label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入管理员账号"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '500',
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}>密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(248, 215, 218, 0.8)',
                color: '#721c24',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(114, 28, 36, 0.3)'
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(108, 117, 125, 0.6)' : 'rgba(102, 126, 234, 0.8)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s, opacity 0.2s',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="bg" style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
