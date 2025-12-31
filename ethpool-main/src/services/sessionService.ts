'use client'

interface UserSession {
  sessionId: number
  sessionToken: string
  expiresAt: string
  user: {
    id: number
    address: string
    authAddress: string
    status: number
    isEffective: number
    usdt: string
    eth: string
    cash: string
  }
  wallet: {
    address: string
    type: string
    networkId: number
  }
  session: {
    lastActivity: string
    expiresAt: string
    createdAt: string
  }
}

interface CreateSessionResponse {
  success: boolean
  data?: {
    sessionId: number
    sessionToken: string
    expiresAt: string
    user: {
      id: number
      address: string
      authAddress: string
    }
  }
  error?: string
}

interface ValidateSessionResponse {
  success: boolean
  data?: UserSession
  error?: string
}

class SessionService {
  private readonly SESSION_KEY = 'user_session_token'
  private readonly USER_DATA_KEY = 'user_data'

  /**
   * 创建用户会话
   */
  async createSession(
    walletAddress: string,
    walletType: string = 'metamask',
    networkId: number = 56
  ): Promise<CreateSessionResponse> {
    try {
      const response = await fetch('/api/user/session/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          walletType,
          networkId,
          userAgent: navigator.userAgent,
          ipAddress: null // 前端无法获取真实IP
        })
      })

      const result = await response.json()

      if (result.success && result.data) {
        // 保存会话令牌到本地存储
        localStorage.setItem(this.SESSION_KEY, result.data.sessionToken)
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(result.data.user))
      }

      return result
    } catch (error) {
      console.error('创建会话失败:', error)
      return {
        success: false,
        error: '网络错误'
      }
    }
  }

  /**
   * 验证会话
   */
  async validateSession(): Promise<ValidateSessionResponse> {
    try {
      const sessionToken = localStorage.getItem(this.SESSION_KEY)
      
      if (!sessionToken) {
        return {
          success: false,
          error: '未找到会话令牌'
        }
      }

      const response = await fetch('/api/user/session/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken })
      })

      const result = await response.json()

      if (result.success && result.data) {
        // 更新本地存储的用户数据
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(result.data.user))
      } else {
        // 会话无效，清除本地存储
        this.clearSession()
      }

      return result
    } catch (error) {
      console.error('验证会话失败:', error)
      this.clearSession()
      return {
        success: false,
        error: '网络错误'
      }
    }
  }

  /**
   * 登出
   */
  async logout(logoutAll: boolean = false): Promise<boolean> {
    try {
      const sessionToken = localStorage.getItem(this.SESSION_KEY)
      
      if (sessionToken) {
        await fetch('/api/user/session/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken, logoutAll })
        })
      }

      this.clearSession()
      return true
    } catch (error) {
      console.error('登出失败:', error)
      this.clearSession()
      return false
    }
  }

  /**
   * 获取本地存储的会话令牌
   */
  getSessionToken(): string | null {
    return localStorage.getItem(this.SESSION_KEY)
  }

  /**
   * 获取本地存储的用户数据
   */
  getUserData(): any | null {
    const userData = localStorage.getItem(this.USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  }

  /**
   * 检查是否有有效会话
   */
  hasValidSession(): boolean {
    return !!this.getSessionToken()
  }

  /**
   * 清除本地会话数据
   */
  private clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY)
    localStorage.removeItem(this.USER_DATA_KEY)
  }

  /**
   * 自动验证会话（页面加载时调用）
   */
  async autoValidateSession(): Promise<UserSession | null> {
    if (!this.hasValidSession()) {
      return null
    }

    const result = await this.validateSession()
    return result.success ? result.data || null : null
  }
}

// 导出单例实例
export const sessionService = new SessionService()
export default sessionService

