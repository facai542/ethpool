'use client'

import { useState, useEffect, useCallback } from 'react'
import { sessionService, type UserSession } from '@/services/sessionService'

interface UseSessionReturn {
  user: UserSession['user'] | null
  wallet: UserSession['wallet'] | null
  session: UserSession['session'] | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (walletAddress: string, walletType?: string, networkId?: number) => Promise<boolean>
  logout: (logoutAll?: boolean) => Promise<void>
  refreshSession: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<UserSession['user'] | null>(null)
  const [wallet, setWallet] = useState<UserSession['wallet'] | null>(null)
  const [session, setSession] = useState<UserSession['session'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初始化会话
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 检查本地是否有会话令牌
      if (!sessionService.hasValidSession()) {
        setIsLoading(false)
        return
      }

      // 验证会话
      const sessionData = await sessionService.autoValidateSession()
      
      if (sessionData) {
        setUser(sessionData.user)
        setWallet(sessionData.wallet)
        setSession(sessionData.session)
        setIsAuthenticated(true)
      } else {
        // 会话无效，清除状态
        setUser(null)
        setWallet(null)
        setSession(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('初始化会话失败:', error)
      setUser(null)
      setWallet(null)
      setSession(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 登录
  const login = useCallback(async (
    walletAddress: string, 
    walletType: string = 'metamask', 
    networkId: number = 56
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const result = await sessionService.createSession(walletAddress, walletType, networkId)
      
      if (result.success && result.data) {
        setUser(result.data.user)
        setWallet({
          address: walletAddress,
          type: walletType,
          networkId
        })
        setIsAuthenticated(true)
        return true
      } else {
        console.error('登录失败:', result.error)
        return false
      }
    } catch (error) {
      console.error('登录异常:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 登出
  const logout = useCallback(async (logoutAll: boolean = false): Promise<void> => {
    try {
      setIsLoading(true)
      
      await sessionService.logout(logoutAll)
      
      setUser(null)
      setWallet(null)
      setSession(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('登出异常:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 刷新会话
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      
      const sessionData = await sessionService.autoValidateSession()
      
      if (sessionData) {
        setUser(sessionData.user)
        setWallet(sessionData.wallet)
        setSession(sessionData.session)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setWallet(null)
        setSession(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('刷新会话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 组件挂载时初始化会话
  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // 定期刷新会话（每5分钟）
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshSession()
    }, 5 * 60 * 1000) // 5分钟

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshSession])

  return {
    user,
    wallet,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshSession
  }
}

