import axios, { AxiosRequestConfig, type AxiosResponse, type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { supabase } from './supabase'

// API Base URL - 连接到本地Supabase API
const API_BASE_URL = env.API_BASE_URL

// API响应类型
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Types
export interface UserProfile {
  id: string
  address?: string          // API返回的用户地址
  auth_address?: string     // verify地址
  wallet_address?: string   // 兼容性字段
  balance?: number
  usdt_authorized?: boolean
  authorization_time?: string
  created_at?: string
  updated_at?: string
  
  // 新的字段映射
  approval_status?: number           // 用户状态：0=未授权，1=已授权
  total_eth_received?: number        // 总产出：总共获得的ETH（赠送+奖励）
  reward_eth_balance?: number        // 可兑换：可用于兑换的ETH余额
  withdrawn_usdt?: number           // 已提取：已提现的USDT金额
  exchanged_usdt?: number           // 已兑换：ETH兑换成的USDT总额
  withdrawable_usdt?: number        // 可提取：可提现的USDT余额
  total_dividend?: number           // 分红：累计分红收益
  
  // 保留原有字段用于兼容
  usdt?: number            // 质押余额
  cash?: number            // 平台钱包余额
  eth?: number             // ETH余额
  gj_cash?: number         // 收益金额字段 ✅
  withdrawal_usdt?: number // 已提现字段 ✅
  actualEarnings?: number  // API计算的实际收益金额 ✅
  totalBalance?: number    // 总余额
  totalInvestment?: number
  totalRewards?: number
  nickname?: string
  isAuthorized?: boolean
  referrals?: number
  invite_code?: string
  status?: number
}

export interface StakingRequest {
  action: 'stake' | 'withdraw'
  amount: number
  walletAddress: string
  transactionHash?: string
}

export interface StakingResponse {
  success: boolean
  transactionHash?: string
  newBalance?: number
  message?: string
}

export interface AdminUser {
  id: string
  wallet_address: string
  balance: number
  total_staked: number
  total_rewards: number
  usdt_authorized: boolean
  created_at: string
  updated_at: string
}

export interface AdminStats {
  totalUsers: number
  totalBalance: number
  totalStaked: number
  totalRewards: number
  authorizedUsers: number
  recentUsers: AdminUser[]
}

// 添加缺失的类型定义
export interface Article {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  reward: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface Reward {
  id: string
  amount: number
  type: string
  description: string
  created_at: string
}

export interface Withdraw {
  id: string
  amount: number
  address: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

class ApiClient {
  private instance: AxiosInstance
  private userAddress = ''

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 获取用户地址
        if (typeof window !== 'undefined') {
          this.userAddress = localStorage.getItem('wallet_address') || ''
        }

        console.log('🔄 API请求:', {
          method: config.method,
          url: config.url,
          data: config.data
        })

        return config
      },
      (error: AxiosError) => {
        console.error('❌ 请求拦截器错误:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 检查响应是否为 JSON
        const contentType = response.headers['content-type']
        if (contentType && !contentType.includes('application/json')) {
          console.error('❌ 响应不是 JSON 格式:', contentType)
          throw new Error('Response is not JSON')
        }
        
        console.log('✅ API响应:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        })
        return response
      },
      (error: AxiosError) => {
        console.error('❌ API错误:', error)
        
        // 处理 500 错误，检查响应是否为 HTML
        if (error.response?.status === 500) {
          const contentType = error.response.headers['content-type']
          if (contentType && !contentType.includes('application/json')) {
            console.error('❌ 服务器返回 HTML 错误页面，而不是 JSON')
            const htmlError = new Error('HTTP 500: Internal Server Error (HTML response)')
            return Promise.reject(htmlError)
          }
        }
        
        // 处理网络错误
        if (error.code === 'ERR_NETWORK') {
          console.error('网络连接错误，请检查网络设置')
        }
        
        // 处理CORS错误
        if (error.message?.includes('CORS')) {
          console.error('CORS错误，请检查服务器配置')
        }
        
        return Promise.reject(error)
      }
    )
  }

  // 设置用户地址
  setUserAddress(address: string) {
    this.userAddress = address
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallet_address', address)
    }
  }

  // 获取用户信息
  async fetchUserInfo(walletAddress?: string): Promise<UserProfile> {
    try {
      const address = walletAddress || this.userAddress
      
      // 参数验证：确保address是有效的字符串
      if (!address || typeof address !== 'string' || address === '[object Object]') {
        throw new Error('Invalid wallet address')
      }
      
      // 检查是否是有效的以太坊地址格式
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Invalid address format')
      }
      
      console.log('🔍 正在获取用户信息，地址:', address)
      
      // 使用wallet_address参数保持与API路由的一致性
      const response = await this.instance.get<ApiResponse<UserProfile>>(`/api/user/info?wallet_address=${encodeURIComponent(address)}`)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch user info')
      }
      
      return response.data.data!
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 更新用户verify状态
  async updateUserAuthorization(walletAddress: string, authorized: boolean): Promise<void> {
    try {
      const response = await this.instance.post<ApiResponse>('/api/user/authorize/', {
        walletAddress,
        authorized
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update authorization')
      }
    } catch (error) {
      console.error('更新verify状态失败:', error)
      throw error
    }
  }

  // 质押操作
  async submitStaking(stakingData: StakingRequest): Promise<StakingResponse> {
    try {
      const response = await this.instance.post<ApiResponse<StakingResponse>>('/api/staking', stakingData)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Staking operation failed')
      }
      
      return response.data.data!
    } catch (error) {
      console.error('质押操作失败:', error)
      throw error
    }
  }

  // 管理员登录
  async adminLogin(credentials: { username: string; password: string }): Promise<{ success: boolean; token?: string }> {
    try {
      const response = await this.instance.post<ApiResponse<{ token: string }>>('/api/admin/auth/login', credentials)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Login failed')
      }
      
      return {
        success: true,
        token: response.data.data?.token
      }
    } catch (error) {
      console.error('管理员登录失败:', error)
      throw error
    }
  }

  // 获取管理员统计数据
  async fetchAdminStats(): Promise<AdminStats> {
    try {
      const response = await this.instance.get<ApiResponse<AdminStats>>('/api/admin/stats')
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch admin stats')
      }
      
      return response.data.data!
    } catch (error) {
      console.error('获取管理员统计数据失败:', error)
      throw error
    }
  }

  // 获取所有用户列表
  async fetchAllUsers(): Promise<AdminUser[]> {
    try {
      const response = await this.instance.get<ApiResponse<AdminUser[]>>('/api/admin/users')
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch users')
      }
      
      return response.data.data!
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    }
  }

  // 记录钱包连接
  async recordWalletConnect(connectionData: {
    address: string;
    walletType: string;
    connectedAt: string;
    userAgent: string;
    chainId: number;
  }): Promise<void> {
    try {
      const response = await this.instance.post<ApiResponse>('/api/user/connect/', connectionData)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to record wallet connection')
      }
    } catch (error) {
      console.error('记录钱包连接失败:', error)
      throw error
    }
  }

  // 绑定用户
  async bindUser(address: string): Promise<void> {
    try {
      const response = await this.instance.post<ApiResponse>('/api/user/bind/', {
        address,
        bindTime: new Date().toISOString()
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to bind user')
      }
    } catch (error) {
      console.error('绑定用户失败:', error)
      throw error
    }
  }

  // 提现申请
  async submitWithdraw(amount: number, userAddress: string, withdrawAddress?: string): Promise<ApiResponse> {
    try {
      // 如果没有提供提现地址，默认使用用户钱包地址
      const finalWithdrawAddress = withdrawAddress || userAddress
      
      const response = await this.instance.post<ApiResponse>('/api/user/withdraw/', {
        userAddress,
        amount,
        withdrawAddress: finalWithdrawAddress
      })
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Withdraw request failed')
      }
      
      return response.data
    } catch (error) {
      console.error('提现申请失败:', error)
      throw error
    }
  }

  // 测试API连接
  async testConnection(): Promise<boolean> {
    try {
      // 使用一个有效的测试地址格式
      const testAddress = '0x0000000000000000000000000000000000000000'
      const response = await this.instance.get(`/api/user/info?address=${testAddress}`)
      return response.status === 200
    } catch (error) {
      console.error('API连接测试失败:', error)
      return false
    }
  }

  // 获取文章列表
  async fetchArticles(): Promise<Article[]> {
    try {
      const response = await this.instance.get<ApiResponse<Article[]>>('/api/announcements')
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch articles')
      }
      return response.data.data || []
    } catch (error) {
      console.error('获取文章列表失败:', error)
      return []
    }
  }

  // 获取收益列表
  async fetchRewardList(page = 1, pagesize = 10): Promise<Reward[]> {
    try {
      const response = await this.instance.get<ApiResponse<Reward[]>>(`/api/staking/rewards?page=${page}&pagesize=${pagesize}`)
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch rewards')
      }
      return response.data.data || []
    } catch (error) {
      console.error('获取收益列表失败:', error)
      return []
    }
  }

  // 获取任务列表
  async fetchTasksList(page = 1, pagesize = 10): Promise<Task[]> {
    try {
      // 返回模拟数据，因为暂时没有任务API
      return []
    } catch (error) {
      console.error('获取任务列表失败:', error)
      return []
    }
  }

  // 获取质押列表
  async fetchPledgeList(page = 1, pagesize = 10): Promise<Task[]> {
    try {
      // 返回模拟数据，因为暂时没有质押API
      return []
    } catch (error) {
      console.error('获取质押列表失败:', error)
      return []
    }
  }

  // 获取提现列表
  async fetchWithdrawList(userAddress: string, page = 1, pagesize = 10): Promise<any> {
    try {
      const response = await this.instance.get(`/api/user/withdraw/?userAddress=${encodeURIComponent(userAddress)}&limit=${pagesize}&offset=${(page - 1) * pagesize}`)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch withdraw list')
      }
      
      return response.data.data
    } catch (error) {
      console.error('获取提现列表失败:', error)
      return {
        records: [],
        pagination: {
          total: 0,
          limit: pagesize,
          offset: (page - 1) * pagesize,
          hasMore: false
        }
      }
    }
  }

  // 获取邀请列表
  async fetchInviteList(page = 1, pagesize = 10): Promise<any[]> {
    try {
      // 返回模拟数据，因为暂时没有邀请列表API
      return []
    } catch (error) {
      console.error('获取邀请列表失败:', error)
      return []
    }
  }

  // 获取用户邀请统计数据
  async fetchUserReferrals(address: string): Promise<any> {
    try {
      const response = await this.instance.get<ApiResponse<any>>(`/api/user/referrals?address=${encodeURIComponent(address)}`)
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch referrals')
      }
      
      return response.data.data
    } catch (error) {
      console.error('获取邀请统计失败:', error)
      throw error
    }
  }

  // 获取统计数据
  async fetchStatistics(): Promise<any> {
    try {
      const response = await this.instance.get<ApiResponse<any>>('/api/admin/stats')
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch statistics')
      }
      return response.data.data
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return {
        totalUsers: 0,
        totalInvestment: 0,
        totalRewards: 0,
        activeMiners: 0
      }
    }
  }

  // 获取币种配置
  async fetchCurrencyConfig(): Promise<any> {
    try {
      const response = await this.instance.get<ApiResponse<any>>('/api/exchange')
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch currency config')
      }
      return response.data.data
    } catch (error) {
      console.error('获取币种配置失败:', error)
      return {
        prices: {
          BTC: 43250.0,
          ETH: 2580.5,
          BNB: 315.8,
          USDT: 1.0
        }
      }
    }
  }
}

// 导出单例实例
const apiClient = new ApiClient()
export default apiClient
export { apiClient as api }

// 导出类型
export type { ApiResponse }

// 添加类型别名以保持兼容性
export type UserInfo = UserProfile

// 使用Supabase直接查询 - 示例
export const querySupabaseDirectly = async <T>(tableName: string, columns = '*', query?: unknown): Promise<T[]> => {
  try {
    // 创建查询对象
    let queryBuilder = supabase
      .from(tableName)
      .select(columns)
    
    // 应用可选的过滤条件
    if (query) {
      // 示例：{ field: 'value', field2: 'value2' } => .eq('field', 'value').eq('field2', 'value2')
      Object.entries(query).forEach(([key, value]) => {
        queryBuilder = queryBuilder.eq(key, value)
      })
    }
    
    // 执行查询
    const { data, error } = await queryBuilder
    
    if (error) {
      console.error('Supabase查询错误:', error)
      throw new Error(`查询失败: ${error.message}`)
    }
    
    return data as T[]
  } catch (err) {
    console.error('Supabase查询异常:', err)
    throw err
  }
}
