'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Wallet, 
  Search, 
  Plus, 
  Edit2, 
  Trash2,
  DollarSign,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Lock,
  Unlock,
  Calendar,
  Hash,
  Zap,
  MessageSquare,
  Coins,
  Activity,
  Gift
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ActionMenu } from '@/components/ui/ark-menu'
import CollectionSuccessModal from '@/components/CollectionSuccessModal'
import BalanceQueryModal from '@/components/BalanceQueryModal'
import CollectionConfirmModal from '@/components/CollectionConfirmModal'
import { Label } from '@/components/ui/label'
import { getAdminSession } from '@/lib/auth'
import { authorizationRealtimeService } from '@/services/authorizationRealtimeService'

  // 用户数据接口 - 适配 nh_member_new 表
interface User {
  id: string // UUID
  wallet_address: string
  auth_wallet_address?: string | null
  approved: number
  first_approved_at: string | null
  last_approved_at: string | null
  a_eth: number
  eth: number
  usdt: number
  withdrawal_usdt: number
  withdrawable_usdt: number
  dividend_usdt: number
  onchain_usdt_balance?: number | string | null  // 链上USDT余额
  onchain_eth_balance?: number | string | null  // 链上ETH余额
  balance_updated_at?: string | null  // 余额更新时间
  daily_reward_rate: number
  last_reward_at: string | null
  reward_count_today: number
  telegram_user_id: string | null
  referral_code: string | null
  referred_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  withdraw_forbidden?: boolean  // 禁止提现
  earnings_forbidden?: boolean  // 禁止收益
  // 在线状态和IP国家信息
  is_online?: boolean  // 是否在线
  online_status?: string  // 在线状态文本
  registration_ip?: string | null  // 注册IP
  registration_country?: string | null  // 注册国家
  last_login_ip?: string | null  // 最后登录IP
  last_login_country?: string | null  // 最后登录国家
  last_active_at?: string | null  // 最后活动时间
  // 兼容旧字段
  is_effective?: number | string
  agent_id?: number
  status?: number
  type?: number | null
  // 代理关联信息
  agent_name?: string | null
  agent_code?: string | null
  agent_referral_code?: string | null
}

// 统计信息接口
interface UserStats {
  total: number
  authorized: number
  totalBalance: number // 总余额（授权钱包地址链上USDT余额）
  collected: number // 已归集
  gifted: number // 已赠送（首次授权成功赠送的奖励）
}

// 分页信息
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats>({ 
    total: 0, authorized: 0, totalBalance: 0, collected: 0, gifted: 0
  })
  const [pagination, setPagination] = useState<Pagination>({ 
    page: 1, limit: 20, total: 0, totalPages: 0 
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [authFilter, setAuthFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [agents, setAgents] = useState<Array<{id: number, agent_name: string, agent_code: string}>>([])
  const [loadingAgents, setLoadingAgents] = useState(false)
  const [adminSession, setAdminSession] = useState<{id: number, role_id: number, username: string} | null>(null)
  const [treasuryAddress, setTreasuryAddress] = useState<string>('0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a')
  
  // 自动奖励发放状态
  const [autoRewardsEnabled, setAutoRewardsEnabled] = useState(false)
  const [autoRewardsLoading, setAutoRewardsLoading] = useState(false)
  const [nextRewardRun, setNextRewardRun] = useState<string | null>(null)
  
  // 检查是否为代理用户
  const isAgentUser = useCallback(() => {
    if (!adminSession) return false
    return adminSession.role_id === 2
  }, [adminSession])
  
  // 模态框状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCollectionSuccessModalOpen, setIsCollectionSuccessModalOpen] = useState(false)
  const [collectionSuccessData, setCollectionSuccessData] = useState<{
    userId: string
    amount: string
    fromAddress: string
    toAddress: string
    transactionHash: string
    explorerUrl: string
    status: string
  } | null>(null)
  const [isBalanceQueryModalOpen, setIsBalanceQueryModalOpen] = useState(false)
  const [balanceQueryData, setBalanceQueryData] = useState<{
    userId: string
    wallet_address: string
    ethBalance: string
    usdtBalance: string
    allowance: string
    error?: string
    isSuccess: boolean
  } | null>(null)
  const [isCollectionConfirmModalOpen, setIsCollectionConfirmModalOpen] = useState(false)
  const [isTelegramNoteModalOpen, setIsTelegramNoteModalOpen] = useState(false)
  const [telegramNoteData, setTelegramNoteData] = useState<{
    userId: string
    wallet_address: string
    currentNote: string
    loading: boolean
  } | null>(null)
  const [isEthBalanceModalOpen, setIsEthBalanceModalOpen] = useState(false)
  const [ethBalanceData, setEthBalanceData] = useState<{
    userId: string
    wallet_address: string
    currentBalance: number
    operation: 'add' | 'subtract'
    amount: string
    loading: boolean
  } | null>(null)
  const [isWalletMonitorModalOpen, setIsWalletMonitorModalOpen] = useState(false)
  const [walletMonitorData, setWalletMonitorData] = useState<{
    userId: string
    wallet_address: string
    isMonitored: boolean
    loading: boolean
  } | null>(null)
  const [collectionConfirmData, setCollectionConfirmData] = useState<{
    userId: string
    fromAddress: string
    toAddress: string
    amount: string
  } | null>(null)
  // 归集输入对话框状态
  const [isCollectionInputModalOpen, setIsCollectionInputModalOpen] = useState(false)
  const [collectionInputData, setCollectionInputData] = useState<{
    userId: string
    fromAddress: string
    amount: string
    toAddress: string
  } | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // 添加余额调整模态框状态
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [balanceModalData, setBalanceModalData] = useState({
    userId: '',
    balanceType: '' as 'staking' | 'platform' | 'reward',
    currentBalance: 0,
    operation: 'add' as 'add' | 'subtract',
    amount: '',
    adminAddress: '',
    reason: ''
  })
  
  // 质押奖励模态框状态
  const [isStakingRewardModalOpen, setIsStakingRewardModalOpen] = useState(false)
  const [stakingRewardData, setStakingRewardData] = useState({
    rewardPercentage: '',
    reason: '',
    loading: false,
    preview: {
      totalUsers: 0,
      totalStaking: 0,
      estimatedReward: 0
    }
  })

  // 活动设置模态框状态
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityModalData, setActivityModalData] = useState({
    userId: '',
    userAddress: '',
    activityId: '',
    standardAmount: '',
    outputAmount: '',
    countdownHours: 24,
    isEnabled: false,
    loading: false
  })
  
  // 归集转账模态框状态
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferData, setTransferData] = useState({
    userId: '',
    userName: '',
    userAddress: '',
    authAddress: '',
    amount: '',
    adminAddress: '',
    reason: ''
  })
  
  // 移除自动刷新 - 解决翻页问题
  // const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())

  // 表单数据
  const [formData, setFormData] = useState({
    wallet_address: '',
    auth_wallet_address: '',
    agent_id: 0,
    referred_by: 0,
    status: 1,
    type: 2,
    referral_code: '',
    telegram_user_id: '',
    withdrawable_usdt: 0,
    usdt: 0,
    eth: 0,
    withdrawal_usdt: 0,
    gj_withdrawable_usdt: 0,
    is_effective: 0,
    forbid_day: 0,
    pause: 2
  })

  // 余额查询状态（用于手动查询时的加载状态）
  const [balanceStates, setBalanceStates] = useState<Record<string, {loading: boolean, balance: string}>>({})
  const [batchQueryLoading, setBatchQueryLoading] = useState(false)

  // 获取系统配置（收款地址）
  const fetchSystemConfig = async () => {
    try {
      const response = await fetch('/api/admin/system/config')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.treasuryAddress) {
          setTreasuryAddress(result.data.treasuryAddress)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取系统配置失败:', error)
      }
    }
  }

  // 获取代理列表
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true)
      const response = await fetch('/api/admin/agents')
      
      // 检查响应状态
      if (!response.ok) {
        setAgents([]) // 设置为空数组
        return
      }
      
      // 检查内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setAgents([]) // 设置为空数组
        return
      }
      
      const result = await response.json() as {success: boolean, agents?: Array<{id: number, agent_name: string, agent_code: string}>, error?: string}
      
      if (result.success) {
        setAgents(result.agents || [])
      } else {
        setAgents([])
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取代理列表失败:', error)
      }
      setAgents([]) // 设置为空数组
    } finally {
      setLoadingAgents(false)
    }
  }

  // 获取自动奖励发放状态
  const fetchAutoRewardsStatus = async () => {
    try {
      const response = await fetch('/api/admin/auto-rewards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAutoRewardsEnabled(result.data.enabled)
          setNextRewardRun(result.data.nextRun)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取自动奖励状态失败:', error)
      }
    }
  }

  // 切换自动奖励发放状态
  const toggleAutoRewards = async () => {
    try {
      setAutoRewardsLoading(true)
      const response = await fetch('/api/admin/auto-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !autoRewardsEnabled
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setAutoRewardsEnabled(result.data.enabled)
        setNextRewardRun(result.data.nextRun)
        alert(`自动奖励发放已${result.data.enabled ? '开启' : '关闭'}`)
      } else {
        alert(`操作失败: ${result.error}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('切换自动奖励状态失败:', error)
      }
      alert('操作失败，请重试')
    } finally {
      setAutoRewardsLoading(false)
    }
  }

  // 获取用户列表
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter,
        auth: authFilter,
        agent: agentFilter
      })
      
      // 如果是代理用户，只显示该代理的下级用户
      if (isAgentUser() && adminSession) {
        params.set('agent_only', adminSession.id.toString())
      }
      
      const response = await fetch(`/api/admin/users?${params}`)
      
      // 检查响应状态
      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error('API响应错误:', response.status, response.statusText)
        }
        throw new Error(`API请求失败: ${response.status}`)
      }
      
      // 检查内容类型
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('响应不是JSON格式:', contentType)
        }
        throw new Error('API返回的不是JSON格式')
      }
      
      const result = await response.json() as {
        success: boolean
        data?: {
          users?: User[]
          stats?: UserStats
          pagination?: Pagination
        }
        error?: string
      }
      
      if (result.success && result.data) {
        setUsers(result.data.users || [])
        setStats(result.data.stats || { total: 0, authorized: 0, totalBalance: 0, collected: 0, gifted: 0 })
        setPagination(result.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
        setLastRefreshTime(new Date())
      } else {
        console.error('Failed to fetch users:', result.error)
        // 设置默认值避免undefined错误
        setUsers([])
        setStats({ total: 0, authorized: 0, totalBalance: 0, collected: 0, gifted: 0 })
        setPagination({ page: 1, limit: 20, total: 0, totalPages: 0 })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, statusFilter, authFilter, agentFilter, adminSession, isAgentUser])

  // 手动刷新
  const handleManualRefresh = () => {
    fetchUsers()
  }

  // 移除自动刷新功能 - 解决翻页被重置问题
  // useEffect(() => {
  //   // 清除之前的定时器
  //   if (autoRefreshInterval) {
  //     clearInterval(autoRefreshInterval)
  //   }

  //   // 启动新的定时器，每30秒刷新一次
  //   const interval = setInterval(() => {
  //     console.log('🔄 Auto-refreshing user list...')
  //     fetchUsers()
  //   }, 30000) // 30秒

  //   setAutoRefreshInterval(interval)

  //   // 组件卸载时清理定时器
  //   return () => {
  //     if (interval) {
  //       clearInterval(interval)
  //     }
  //   }
  // }, [pagination.page, pagination.limit, searchTerm, statusFilter, authFilter])

  // 使用 useRef 存储最新的 fetchUsers，避免 useEffect 依赖导致循环
  const fetchUsersRef = useRef(fetchUsers)
  useEffect(() => {
    fetchUsersRef.current = fetchUsers
  }, [fetchUsers])

  // 初始加载
  useEffect(() => {
    // 获取管理员session
    const session = getAdminSession()
    setAdminSession(session)
    
    // 启动授权状态实时监听服务
    authorizationRealtimeService.start()
    
    // 注册授权状态变化回调（使用防抖避免频繁刷新）
    let refreshTimer: NodeJS.Timeout | null = null
    let lastRefreshTime = 0
    const REFRESH_COOLDOWN = 2000 // 2秒冷却时间，避免频繁刷新
    
    const unsubscribe = authorizationRealtimeService.onAuthorizationChange((change) => {
      console.log('🔔 收到授权状态变化通知:', change)
      
      const now = Date.now()
      // 如果距离上次刷新时间太短，跳过
      if (now - lastRefreshTime < REFRESH_COOLDOWN) {
        console.log('⏸️ 刷新冷却中，跳过本次刷新')
        return
      }
      
      // 清除之前的定时器
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      
      // 防抖：延迟1秒刷新，避免频繁刷新
      refreshTimer = setTimeout(() => {
        console.log('🔄 实时监听触发用户列表刷新')
        lastRefreshTime = Date.now()
        fetchUsersRef.current() // 使用 ref 中的最新函数
        refreshTimer = null
      }, 1000)
    })
    
    // 清理函数
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
      }
      unsubscribe()
      // 注意：不在这里停止服务，因为可能其他页面也在使用
    }
  }, []) // 移除所有依赖，避免循环

  // 当session或查询参数变化时重新加载数据
  useEffect(() => {
    if (adminSession !== null) { // 等待session初始化完成
      fetchSystemConfig() // 获取系统配置（收款地址）
      fetchAgents() // 加载代理列表
      fetchUsers()
      fetchAutoRewardsStatus() // 获取自动奖励状态
    }
  }, [adminSession, fetchUsers])

  // 移除10秒自动刷新 - 解决翻页被重置问题
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     fetchUsers()
  //   }, 10000) // 10秒刷新一次，更快显示新verify用户

  //   return () => clearInterval(interval)
  // }, [])

  // 批量查询所有用户的链上余额
  const batchQueryBalances = async () => {
    // 过滤出有钱包地址的用户（优先使用授权地址，其次使用注册地址）
    const usersWithAddress = users.filter(user => user.wallet_address)
    
    if (usersWithAddress.length === 0) {
      alert('没有找到有钱包地址的用户')
      return
    }

    setBatchQueryLoading(true)
    
    let successCount = 0
    let failCount = 0
    
    for (const user of usersWithAddress) {
      // 优先使用授权地址，如果没有授权地址或为空则使用注册地址
      const queryAddress = (user.auth_wallet_address && user.auth_wallet_address.trim()) 
        ? user.auth_wallet_address 
        : user.wallet_address
      
      // 设置加载状态
      setBalanceStates(prev => ({
        ...prev,
        [user.id]: { loading: true, balance: '查询中...' }
      }))

      try {
        // 使用链上余额查询API，更直接和准确
        const response = await fetch(`/api/user/chain-balance?address=${encodeURIComponent(queryAddress)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json() as {
          success: boolean
          data?: {
            usdtBalance: string
            address: string
            blockNumber?: number
            timestamp?: string
          }
          error?: string
        }

        if (result.success && result.data) {
          const balance = Number.parseFloat(result.data.usdtBalance || '0').toFixed(8)
          setBalanceStates(prev => ({
            ...prev,
            [user.id]: { 
              loading: false, 
              balance: balance
            }
          }))
          
          // 将查询到的余额保存到数据库（异步执行，不阻塞）
          fetch('/api/admin/update-onchain-balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              walletAddress: queryAddress,
              usdtBalance: balance
            })
          }).then(saveResponse => {
            if (saveResponse.ok) {
              return saveResponse.json()
            }
            return null
          }).then(saveResult => {
            if (saveResult?.success) {
              console.log(`✅ 用户 ${user.id} 链上余额已保存到数据库: ${balance} USDT`)
            }
          }).catch(saveError => {
            console.warn(`⚠️ 用户 ${user.id} 保存余额到数据库失败:`, saveError)
          })
          
          successCount++
        } else {
          setBalanceStates(prev => ({
            ...prev,
            [user.id]: { loading: false, balance: '查询失败' }
          }))
          failCount++
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`❌ 用户 ${user.id} 链上余额查询网络错误:`, error)
        }
        setBalanceStates(prev => ({
          ...prev,
          [user.id]: { loading: false, balance: '网络错误' }
        }))
        failCount++
      }
      
      // 添加延迟避免请求过快（增加到800ms）
      await new Promise(resolve => setTimeout(resolve, 800))
    }
    
    setBatchQueryLoading(false)
    // 显示批量查询结果弹窗（批量查询不显示单个用户信息）
    // 批量查询完成后只显示统计信息，不打开弹窗
    const message = `批量查询完成！\n✅ 成功: ${successCount} 个\n❌ 失败: ${failCount} 个`
    alert(message)
    // 不打开弹窗，因为批量查询没有单个用户信息
  }

  // 移除自动查询余额 - 改为手动触发
  // useEffect(() => {
  //   if (users.length > 0) {
  //     batchQueryBalances()
  //   }
  // }, [users.length])

  // 格式化地址显示
  const formatAddress = (wallet_address: string | null) => {
    if (!wallet_address) return '无'
    if (wallet_address.length <= 10) return wallet_address
    return `${wallet_address.slice(0, 6)}...${wallet_address.slice(-4)}`
  }

  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount?.toFixed(8) || '0.00000000'
  }

  // 格式化时间
  const formatTime = (timeStr: string | null) => {
    if (!timeStr || timeStr === '0000-00-00 00:00:00') return '未知'
    try {
      return new Date(timeStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '未知'
    }
  }

  // 将UUID转换为纯数字ID显示
  const convertUuidToNumericId = (uuid: string): string => {
    if (!uuid) return '0'
    
    // 移除UUID中的连字符
    const cleanUuid = uuid.replace(/-/g, '')
    
    // 使用简单的哈希算法将16进制字符串转换为数字
    let hash = 0
    for (let i = 0; i < cleanUuid.length; i++) {
      const char = cleanUuid.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    // 取绝对值并限制为8位数字
    const numericId = Math.abs(hash) % 100000000
    
    return numericId.toString().padStart(8, '0')
  }

  // 获取所属代理显示 - 优先使用API返回的关联数据
  const getAgentDisplay = (user: User) => {
    // 优先使用API返回的关联代理信息
    if (user.agent_name && user.agent_code) {
      return `${user.agent_name} (${user.agent_code})`
    }
    
    // 回退到通过agents列表查找
    if (user.agent_id && user.agent_id > 0) {
      const agent = agents.find(a => a.id === user.agent_id)
      if (agent) {
        return `${agent.agent_name} (${agent.agent_code})`
      }
      return `代理${user.agent_id}`
    } else if (user.referred_by) {
      return `用户邀请`
    }
    return '无'
  }

  // 获取网络类型
  const getNetworkType = (type: number) => {
    return type === 1 ? 'TRC20' : 'ERC20'
  }

  // 获取在线状态（新增）
  const getOnlineStatusBadge = (isOnline: boolean, statusText: string) => {
    return isOnline ? (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400 text-sm">在线</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-gray-500" />
        <span className="text-gray-400 text-sm">{statusText || '离线'}</span>
      </div>
    )
  }

  // 获取账户状态
  const getAccountStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        <CheckCircle className="w-3 h-3 mr-1" />
        启用
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        停用
      </Badge>
    )
  }

  // 获取发息状态
  const getEarningStatusBadge = (pause: number) => {
    return pause === 2 ? (
      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
        <TrendingUp className="w-3 h-3 mr-1" />
        正常
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-500">
        <Ban className="w-3 h-3 mr-1" />
        停息
      </Badge>
    )
  }

  // 获取授权状态
  const getAuthStatusBadge = (isEffective: number | string, userId?: string, hash?: string | null) => {
    // 处理数字和字符串类型
    const isAuthorized = isEffective === 1 || isEffective === '1' || Number(isEffective) === 1
    
    return isAuthorized ? (
      <Badge variant="default" className="bg-purple-500 hover:bg-purple-600">
        <Lock className="w-3 h-3 mr-1" />
        已授权
      </Badge>
    ) : (
      <Badge variant="outline" className="border-gray-400 text-gray-400">
        <Unlock className="w-3 h-3 mr-1" />
        未授权
      </Badge>
    )
  }

  // 获取IP和国家信息显示（新增，使用中文国家名）
  const getIPCountryDisplay = (user: User) => {
    // 优先显示授权用户的最后登录IP和国家
    const ip = user.last_login_ip || user.registration_ip
    const country = user.last_login_country || user.registration_country
    
    if (!ip && !country) {
      return <span className="text-gray-500 text-xs">未记录</span>
    }
    
    // 转换为中文国家名
    const countryCN = country ? getCountryNameCN(country) : null
    
    return (
      <div className="flex flex-col gap-1">
        {countryCN && (
          <div className="flex items-center gap-1">
            <span className="text-blue-400 text-sm">{countryCN}</span>
          </div>
        )}
        {ip && (
          <div className="text-gray-400 text-xs font-mono" title={ip}>
            {ip}
          </div>
        )}
      </div>
    )
  }
  
  // 获取国家名中文
  const getCountryNameCN = (country: string): string => {
    if (!country) return '未知'
    
    const countryMap: Record<string, string> = {
      'China': '中国',
      'United States': '美国',
      'Japan': '日本',
      'South Korea': '韩国',
      'United Kingdom': '英国',
      'France': '法国',
      'Germany': '德国',
      'Singapore': '新加坡',
      'Hong Kong': '香港',
      'Taiwan': '台湾',
      'Russia': '俄罗斯',
      'Canada': '加拿大',
      'Australia': '澳大利亚',
      'India': '印度',
      'Brazil': '巴西',
      'Thailand': '泰国',
      'Vietnam': '越南',
      'Malaysia': '马来西亚',
      'Indonesia': '印度尼西亚',
      'Philippines': '菲律宾',
      'Netherlands': '荷兰',
      'Switzerland': '瑞士',
      'Spain': '西班牙',
      'Italy': '意大利'
    }
    
    return countryMap[country] || country
  }

  // 获取归集状态
  const getCollectionStatusBadge = (gjStatus: number) => {
    if (gjStatus === 2) {
      return (
        <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
          已归集
        </Badge>
      )
    } else if (gjStatus === 1) {
      return (
        <Badge variant="outline" className="border-orange-400 text-orange-400">
          未归集
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-500 text-white">
          归集中
        </Badge>
      )
    }
  }

  // 更新用户状态
  const updateUserStatus = async (userId: string, newStatus: number) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: userId, status: newStatus })
      })
      
      const result = await response.json() as {success: boolean, error?: string}
      if (result.success) {
        await fetchUsers()
      } else {
        console.error('Failed to update user status:', result.error)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // 移除重复的批量查询函数 - 已由 batchQueryBalances 替代

  // 查询链上余额和授权额度
  const handleBalanceQuery = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || !user.wallet_address) {
      alert('用户没有钱包地址，无法查询余额')
      return
    }

    // 优先使用授权地址，如果没有授权地址或为空则使用注册地址
    const queryAddress = (user.auth_wallet_address && user.auth_wallet_address.trim()) 
      ? user.auth_wallet_address 
      : user.wallet_address
    
    console.log(`🔍 查询用户 ${userId} 的链上余额`, {
      注册地址: user.wallet_address,
      授权地址: user.auth_wallet_address,
      查询地址: queryAddress
    })

    // 设置加载状态
    setBalanceStates(prev => ({
      ...prev,
      [userId]: { loading: true, balance: '查询中...' }
    }))

    try {
      // 并行查询USDT余额和授权额度
      const [balanceResponse, allowanceResponse] = await Promise.all([
        fetch(`/api/user/chain-balance?address=${queryAddress}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/admin/query-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userAddress: queryAddress,
            spenderAddress: user.auth_wallet_address || undefined // 如果用户有授权地址，使用授权地址查询
          })
        })
      ])

      let usdtBalance = '0.000000'
      let ethBalance = '0.000000'
      let allowance = '0.000000'
      const error: string | null = null

      // 处理USDT余额查询结果
      if (balanceResponse.ok) {
        const balanceResult = await balanceResponse.json()
        if (balanceResult.success && balanceResult.data) {
          const balance = balanceResult.data.usdtBalance
          if (balance !== undefined && balance !== null) {
            usdtBalance = Number.parseFloat(balance.toString()).toFixed(6)
          }
        } else {
          console.warn('USDT余额查询返回失败:', balanceResult)
        }
      } else {
        const errorText = await balanceResponse.text()
        console.error('USDT余额查询HTTP错误:', balanceResponse.status, errorText)
      }

      // 处理授权额度查询结果
      let authorizationUpdated = false
      if (allowanceResponse.ok) {
        const allowanceResult = await allowanceResponse.json()
        if (allowanceResult.success && allowanceResult.data) {
          ethBalance = allowanceResult.data.ethBalance || '0.000000'
          
          // 检查授权状态是否已更新
          authorizationUpdated = allowanceResult.data.authorizationUpdated === true
          
          // 优先使用传入的spenderAddress对应的授权额度
          // 如果有allAllowances，显示所有权限地址的授权额度
          if (allowanceResult.data.allAllowances && Object.keys(allowanceResult.data.allAllowances).length > 0) {
            // 找到最大的授权额度
            const allAllowances = allowanceResult.data.allAllowances as Record<string, string>
            const allowanceValues = Object.values(allAllowances).map(v => Number.parseFloat(String(v)))
            const maxAllowance = Math.max(...allowanceValues)
            allowance = maxAllowance.toFixed(6)
            
            console.log('📊 所有权限地址的授权额度:', allAllowances)
            console.log('📊 最大授权额度:', allowance)
          } else {
            // 兼容旧格式
            allowance = allowanceResult.data.allowance || '0.000000'
          }
          
          console.log('📊 授权额度查询结果:', {
            allowance: allowanceResult.data.allowance,
            allAllowances: allowanceResult.data.allAllowances,
            permissionAddresses: allowanceResult.data.permissionAddresses,
            spenderAddress: allowanceResult.data.spenderAddress,
            最终使用的额度: allowance,
            授权状态已更新: authorizationUpdated
          })
          
          // 如果授权状态已更新，刷新用户列表（使用防抖避免频繁刷新）
          if (authorizationUpdated) {
            console.log('🔄 检测到授权状态已更新，将在1秒后刷新用户列表...')
            // 使用更长的延迟，避免与实时监听服务冲突
            setTimeout(() => {
              console.log('🔄 查询余额触发用户列表刷新')
              fetchUsers()
            }, 1000) // 延迟1秒刷新，确保数据库更新完成，并避免与实时监听冲突
          }
        } else {
          console.warn('授权额度查询返回失败:', allowanceResult)
        }
      } else {
        const errorText = await allowanceResponse.text()
        console.error('授权额度查询HTTP错误:', allowanceResponse.status, errorText)
      }
      
      console.log('📊 查询结果汇总:', {
        userId: convertUuidToNumericId(userId),
        wallet_address: queryAddress,
        ethBalance,
        usdtBalance,
        allowance
      })

      // 更新余额状态
      setBalanceStates(prev => ({
        ...prev,
        [userId]: { 
          loading: false, 
          balance: usdtBalance
        }
      }))
      
      // 将查询到的余额保存到数据库
      try {
        const saveResponse = await fetch('/api/admin/update-onchain-balance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            walletAddress: queryAddress,
            usdtBalance: usdtBalance
          })
        })

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json()
          if (saveResult.success) {
            console.log(`✅ 链上余额已保存到数据库: ${usdtBalance} USDT`)
            // 刷新用户列表以显示最新的余额
            fetchUsers()
          } else {
            console.warn('⚠️ 保存余额到数据库失败:', saveResult.error)
          }
        } else {
          console.warn('⚠️ 保存余额到数据库HTTP错误:', saveResponse.status)
        }
      } catch (saveError) {
        console.error('❌ 保存余额到数据库异常:', saveError)
        // 不阻止显示查询结果，只记录错误
      }
      
      // 显示查询结果弹窗
      const displayAddress = queryAddress || user.wallet_address || user.auth_wallet_address || ''
      if (!displayAddress) {
        console.error('❌ 无法获取钱包地址:', { userId, user })
        alert('用户没有有效的钱包地址')
        return
      }
      
      setBalanceQueryData({
        userId: convertUuidToNumericId(userId), // 转换为数字ID显示
        wallet_address: displayAddress, // 使用查询地址
        ethBalance: ethBalance,
        usdtBalance: usdtBalance,
        allowance: allowance,
        isSuccess: true
      })
      setIsBalanceQueryModalOpen(true)

    } catch (error) {
      console.error(`❌ 用户 ${userId} 查询错误:`, error)
      setBalanceStates(prev => ({
        ...prev,
        [userId]: { loading: false, balance: '查询失败' }
      }))
      // 显示查询失败弹窗
      const queryAddress = (user.auth_wallet_address && user.auth_wallet_address.trim()) 
        ? user.auth_wallet_address 
        : user.wallet_address
      
      setBalanceQueryData({
        userId: convertUuidToNumericId(userId), // 转换为数字ID显示
        wallet_address: queryAddress || user.wallet_address || '',
        ethBalance: '',
        usdtBalance: '',
        allowance: '',
        error: error instanceof Error ? error.message : '未知错误',
        isSuccess: false
      })
      setIsBalanceQueryModalOpen(true)
    }
  }

  // 修改Telegram用户备注
  const handleTelegramNote = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || !user.wallet_address) {
      alert('用户没有钱包地址，无法修改备注')
      return
    }

    setTelegramNoteData({
      userId: userId,
      wallet_address: user.wallet_address,
      currentNote: user.telegram_user_id || '',
      loading: false
    })
    setIsTelegramNoteModalOpen(true)
  }

  // 调整ETH余额
  const handleEthBalance = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user) {
      alert('用户不存在')
      return
    }

    setEthBalanceData({
      userId: userId,
      wallet_address: user.wallet_address || '',
      currentBalance: user.eth || 0,
      operation: 'add',
      amount: '',
      loading: false
    })
    setIsEthBalanceModalOpen(true)
  }

  // 确认调整ETH余额
  const handleConfirmEthBalance = async () => {
    if (!ethBalanceData || !ethBalanceData.amount) {
      alert('请输入调整金额')
      return
    }

    const adjustAmount = Number.parseFloat(ethBalanceData.amount)
    if (isNaN(adjustAmount) || adjustAmount <= 0) {
      alert('请输入有效的金额')
      return
    }

    setEthBalanceData(prev => prev ? {...prev, loading: true} : null)

    try {
      const response = await fetch('/api/user/update-eth-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: ethBalanceData.wallet_address,
          ethAmount: ethBalanceData.operation === 'subtract' ? -adjustAmount : adjustAmount,
          reason: `管理员${ethBalanceData.operation === 'subtract' ? '减少' : '增加'}ETH余额`
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`ETH余额调整成功`)
        setIsEthBalanceModalOpen(false)
        fetchUsers()
      } else {
        alert(`调整失败: ${data.error}`)
      }
    } catch (error) {
      console.error('调整ETH余额失败:', error)
      alert('调整失败，请重试')
    } finally {
      setEthBalanceData(prev => prev ? {...prev, loading: false} : null)
    }
  }

  // 添加钱包监听
  const handleWalletMonitor = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (!user || !user.wallet_address) {
      alert('用户没有钱包地址，无法添加监听')
      return
    }

    setWalletMonitorData({
      userId: userId,
      wallet_address: user.wallet_address,
      isMonitored: false, // 需要查询当前状态
      loading: false
    })
    setIsWalletMonitorModalOpen(true)
  }

  // 禁止/允许提现
  const handleToggleWithdraw = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? '允许' : '禁止'
    if (!confirm(`确定要${action}该用户提现吗？`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/toggle-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          forbidden: !currentStatus
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`${action}提现成功`)
        // 更新本地状态
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, withdraw_forbidden: !currentStatus }
            : u
        ))
      } else {
        alert(`${action}提现失败: ${data.error}`)
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败，请重试')
    }
  }

  // 禁止/允许收益
  const handleToggleEarnings = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? '允许' : '禁止'
    if (!confirm(`确定要${action}该用户收益吗？`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/toggle-earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          forbidden: !currentStatus
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`${action}收益成功`)
        // 更新本地状态
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, earnings_forbidden: !currentStatus }
            : u
        ))
      } else {
        alert(`${action}收益失败: ${data.error}`)
      }
    } catch (error) {
      console.error('操作失败:', error)
      alert('操作失败，请重试')
    }
  }

  // 调整可提取余额（使用统一的余额调整功能）
  const handleWithdrawableBalance = async (userId: string) => {
    openBalanceModal(userId, 'platform')
  }

  // 确认执行归集操作
  const confirmCollection = async () => {
    if (!collectionConfirmData) return
    
    const { userId, fromAddress, toAddress, amount } = collectionConfirmData
    
    try {
      const response = await fetch('/api/admin/real-balance-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userAddress: fromAddress,
          amount: Number.parseFloat(amount),
          toAddress: toAddress
        })
      })

      const result = await response.json() as {
        success: boolean
        data?: {
          toAddress?: string
          transactionHash?: string
          txHash?: string
          explorerUrl?: string
        }
        error?: string
        details?: string
      }
      
      if (result.success) {
        const data = result.data
        // 显示自定义成功弹窗
        setCollectionSuccessData({
          userId: userId,
          amount: amount,
          fromAddress: fromAddress,
          toAddress: data?.toAddress || toAddress,
          transactionHash: data?.transactionHash || data?.txHash || '交易中...',
          explorerUrl: data?.explorerUrl || '',
          status: '已完成'
        })
        setIsCollectionSuccessModalOpen(true)
        await fetchUsers() // 刷新用户列表
      } else {
        const errorMsg = `❌ 归集失败: ${result.error}\n详细信息: ${result.details || '无'}`
        alert(errorMsg)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 归集操作失败，错误详情:', error)
      }
      
      const errorMsg = error instanceof Error 
        ? `归集操作失败: ${error.message}` 
        : '归集操作失败: 未知错误'
      
      alert(`❌ ${errorMsg}\n\n请检查控制台获取详细错误信息`)
    } finally {
      // 关闭确认弹窗
      setIsCollectionConfirmModalOpen(false)
      setCollectionConfirmData(null)
    }
  }

  // 执行归集操作
  const handleBalanceCollection = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) {
        alert('用户未找到')
        return
      }

      const fromAddress = user.wallet_address
      if (!fromAddress) {
        alert('用户没有有效的钱包地址')
        return
      }

      // 打开输入对话框（使用系统配置的收款地址作为默认值）
      setCollectionInputData({
        userId: userId,
        fromAddress: fromAddress,
        amount: '',
        toAddress: treasuryAddress
      })
      setIsCollectionInputModalOpen(true)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 归集操作失败，错误详情:', error)
      }
      
      const errorMsg = error instanceof Error 
        ? `归集操作失败: ${error.message}` 
        : '归集操作失败: 未知错误'
      
      alert(`❌ ${errorMsg}\n\n请检查控制台获取详细错误信息`)
    }
  }

  // 处理归集输入确认
  const handleCollectionInputConfirm = () => {
    if (!collectionInputData) return

    const { amount, toAddress } = collectionInputData

    // 验证归集金额
    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      alert('请输入有效的归集金额')
      return
    }

    // 验证收款地址
    if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      alert('请输入有效的收款地址')
      return
    }

    // 关闭输入对话框
    setIsCollectionInputModalOpen(false)

    // 显示确认弹窗
    setCollectionConfirmData({
      userId: collectionInputData.userId,
      fromAddress: collectionInputData.fromAddress,
      toAddress: toAddress,
      amount: amount
    })
    setIsCollectionConfirmModalOpen(true)
  }

  // 处理直接归集转账
  const handleDirectTransfer = (user: User) => {
    setTransferData({
      userId: user.id,
      userName: user.wallet_address || '',
      userAddress: user.wallet_address || '',
      authAddress: user.wallet_address || '',
      amount: '',
      adminAddress: '0x571Bb55E5e16bdd3A994b8f5D09DaF44Cd61aA9a', // 默认收款地址
      reason: '授权地址归集转账'
    })
    setIsTransferModalOpen(true)
  }

  // 执行归集转账
  const executeTransfer = async () => {
    if (!transferData.amount || !transferData.adminAddress) {
      alert('请填写转账金额和管理员地址')
      return
    }

    if (!confirm(`确定要从授权地址 ${transferData.authAddress} 转账 ${transferData.amount} USDT 吗？`)) {
      return
    }

    setTransferLoading(true)
    try {
      const response = await fetch('/api/admin/real-balance-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userAddress: transferData.authAddress,
          amount: transferData.amount
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json() as {
        success: boolean
        data?: {
          toAddress?: string
          transactionHash?: string
          txHash?: string
          explorerUrl?: string
        }
        error?: string
        details?: string
      }
      
      if (result.success) {
        const data = result.data
        const successInfo = `
⚡ 真实链上归集成功!
👤 用户ID: ${transferData.userId}
💰 归集金额: ${transferData.amount} USDT
📍 从地址: ${transferData.authAddress}
📍 到地址: ${data?.toAddress || 'N/A'}
🔗 交易哈希: ${data?.transactionHash || data?.txHash || 'N/A'}
📊 状态: 已完成
🌐 查看交易: ${data?.explorerUrl || 'N/A'}
        `.trim()
        
        // 显示自定义成功弹窗
        setCollectionSuccessData({
          userId: transferData.userId,
          amount: transferData.amount,
          fromAddress: transferData.authAddress,
          toAddress: data?.toAddress || transferData.adminAddress,
          transactionHash: data?.transactionHash || data?.txHash || '交易中...',
          explorerUrl: data?.explorerUrl || '',
          status: '已完成'
        })
        setIsCollectionSuccessModalOpen(true)
        setIsTransferModalOpen(false)
        await fetchUsers() // 刷新用户列表
      } else {
        const errorMsg = `❌ 真实链上归集失败: ${result.error}\n详细信息: ${result.details || '无'}`
        alert(errorMsg)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 归集操作失败:', error)
      }
      alert(`归集操作失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setTransferLoading(false)
    }
  }

  // 余额调整操作
  // 打开余额调整模态框
  const openBalanceModal = (userId: string, balanceType: 'staking' | 'platform' | 'reward') => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    // 获取当前余额 - 对于收益金额使用智能计算
    let currentBalance = 0
    if (balanceType === 'reward') {
      // 收益金额使用智能计算函数
      currentBalance = calculateActualEarnings(user)
    } else {
      // 其他余额类型直接使用对应字段
      const fieldMapping = {
        staking: 'usdt',           // 质押余额对应 usdt 字段
        platform: 'withdrawable_usdt',         // 平台钱包余额对应 withdrawable_usdt 字段
      }
      const actualField = fieldMapping[balanceType as 'staking' | 'platform']
      currentBalance = user[actualField as keyof User] as number || 0
    }

    setBalanceModalData({
      userId,
      balanceType,
      currentBalance,
      operation: 'add',
      amount: '',
      adminAddress: '',
      reason: `管理员调整${balanceType === 'staking' ? '质押余额' : balanceType === 'platform' ? '平台钱包余额' : '收益金额'}`
    })
    setIsBalanceModalOpen(true)
  }

  // 执行余额调整
  const handleBalanceAdjustment = async () => {
    const { userId, balanceType, operation, amount, adminAddress, reason } = balanceModalData
    const user = users.find(u => u.id === userId)
    if (!user) return

    // 验证输入
    const adjustAmount = Number.parseFloat(amount)
    if (isNaN(adjustAmount) || adjustAmount <= 0) {
      alert('请输入有效的金额')
      return
    }

    // 管理员地址为可选字段，如果提供则验证格式
    if (adminAddress && !/^0x[a-fA-F0-9]{40}$/.test(adminAddress)) {
      alert('管理员地址格式无效 (0x开头的40位十六进制)')
      return
    }

    // 获取当前余额用于验证和显示
    let currentBalanceForValidation = 0
    let actualField = ''
    
    if (balanceType === 'reward') {
      // 收益金额：显示使用智能计算，实际操作使用 gj_withdrawable_usdt 字段
      currentBalanceForValidation = calculateActualEarnings(user)
      actualField = 'gj_withdrawable_usdt'
    } else {
      // 其他余额类型直接使用对应字段
      const fieldMapping = {
        staking: 'usdt',           // 质押余额对应 usdt 字段
        platform: 'withdrawable_usdt',         // 平台钱包余额对应 withdrawable_usdt 字段
      }
      actualField = fieldMapping[balanceType as 'staking' | 'platform']
      currentBalanceForValidation = user[actualField as keyof User] as number || 0
    }
    
    // 如果是减少操作，检查余额是否足够
    if (operation === 'subtract' && adjustAmount > currentBalanceForValidation) {
      alert(`余额不足！当前余额: ${currentBalanceForValidation}，要减少的金额: ${adjustAmount}`)
      return
    }

    const balanceTypeNames = {
      staking: '质押余额(USDT)',
      platform: '平台钱包余额(USDT)', 
      reward: '收益金额(ETH)'
    }

    const operationText = operation === 'add' ? '增加' : '减少'
    const newBalance = operation === 'add' 
      ? currentBalanceForValidation + adjustAmount 
      : currentBalanceForValidation - adjustAmount

    if (!confirm(`确定要${operationText}用户余额吗？\n\n用户ID: ${userId}\n余额类型: ${balanceTypeNames[balanceType]}\n操作: ${operationText} ${adjustAmount}\n当前余额: ${currentBalanceForValidation}\n调整后余额: ${newBalance}`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          userAddress: user.wallet_address,
          balanceType: actualField, // 发送数据库字段名：'usdt', 'withdrawable_usdt', 或 'gj_withdrawable_usdt'
          operation: operation,
          amount: adjustAmount,
          adminAddress: adminAddress,
          reason: reason
        })
      })

      const result = await response.json() as {
        success: boolean
        data?: {
          adjustAmount: number
          previousBalance: number
          newBalance: number
        }
        error?: string
      }
      if (result.success) {
        const data = result.data
        alert(`✅ 余额调整成功!\n用户ID: ${userId}\n${operationText}金额: ${data?.adjustAmount || 0}\n原余额: ${data?.previousBalance || 0}\n新余额: ${data?.newBalance || 0}`)
        setIsBalanceModalOpen(false)
        await fetchUsers() // 刷新用户列表
      } else {
        alert(`❌ 调整失败: ${result.error}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 余额调整失败:', error)
      }
      alert('❌ 余额调整失败，请检查网络连接后重试')
    }
  }

  // 删除用户
  const deleteUser = async (userId: string) => {
    if (!window.confirm('确定要删除这个用户吗？')) return
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: userId })
      })
      
      const result = await response.json() as {success: boolean, error?: string}
      if (result.success) {
        await fetchUsers()
      } else {
        console.error('Failed to delete user:', result.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // 创建用户
  const createUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      
      const result = await response.json() as {success: boolean, error?: string}
      if (result.success) {
        setIsCreateModalOpen(false)
        resetForm()
        await fetchUsers()
      } else {
        console.error('Failed to create user:', result.error)
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  // 编辑用户
  const editUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: selectedUser.id, ...formData })
      })
      
      const result = await response.json() as {success: boolean, error?: string}
      if (result.success) {
        setIsEditModalOpen(false)
        setSelectedUser(null)
        resetForm()
        await fetchUsers()
      } else {
        console.error('Failed to edit user:', result.error)
      }
    } catch (error) {
      console.error('Error editing user:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      wallet_address: '',
      auth_wallet_address: '',
      agent_id: 0,
      referred_by: 0,
      status: 1,
      type: 2,
      referral_code: '',
      telegram_user_id: '',
      withdrawable_usdt: 0,
      usdt: 0,
      eth: 0,
      withdrawal_usdt: 0,
      gj_withdrawable_usdt: 0,
      is_effective: 0,
      forbid_day: 30,
      pause: 2
    })
  }

  // 打开编辑模态框
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      wallet_address: user.wallet_address || '',
      auth_wallet_address: user.wallet_address || '',
      agent_id: user.agent_id || 0,
      referred_by: user.referred_by || 0,
      status: user.status || 1,
      type: user.type || 2,
      referral_code: user.referral_code || '',
      telegram_user_id: user.telegram_user_id || '',
      withdrawable_usdt: user.withdrawable_usdt || 0,
      usdt: user.usdt,
      eth: user.eth,
      withdrawal_usdt: user.withdrawal_usdt,
      gj_withdrawable_usdt: user.dividend_usdt || 0,
      is_effective: user.approved || 0,
      forbid_day: 0,
      pause: 0
    })
    setIsEditModalOpen(true)
  }

  // 获取质押奖励预览数据
  const fetchStakingRewardPreview = async () => {
    try {
      const response = await fetch('/api/admin/staking/batch-rewards')
      const result = await response.json() as {
        success: boolean
        data?: {
          totalUsers: number
          totalStaking: number
        }
        error?: string
      }
      
      if (result.success) {
        const { totalUsers, totalStaking } = result.data || { totalUsers: 0, totalStaking: 0 }
        const percentage = Number.parseFloat(stakingRewardData.rewardPercentage) || 0
        const estimatedReward = (totalStaking * percentage) / 100
        
        setStakingRewardData(prev => ({
          ...prev,
          preview: {
            totalUsers,
            totalStaking,
            estimatedReward
          }
        }))
      }
    } catch (error) {
      console.error('获取质押预览数据失败:', error)
    }
  }

  // 执行批量发放质押奖励
  const handleBatchStakingReward = async () => {
    const percentage = Number.parseFloat(stakingRewardData.rewardPercentage)
    
    if (!percentage || percentage <= 0 || percentage > 100) {
      alert('请输入有效的奖励比例 (0-100)')
      return
    }

    if (!confirm(`确定要为所有质押用户发放 ${percentage}% 的奖励吗？\n\n预计影响用户: ${stakingRewardData.preview.totalUsers}\n总奖励金额: ${stakingRewardData.preview.estimatedReward.toFixed(8)} USDT`)) {
      return
    }

    try {
      setStakingRewardData(prev => ({ ...prev, loading: true }))
      
      const response = await fetch('/api/admin/staking/auto-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          force: true, // 强制执行，不检查时间
          adminAddress: adminSession?.username || 'admin',
          reason: stakingRewardData.reason || '批量发放质押奖励'
        })
      })

      const result = await response.json() as {
        success: boolean
        data?: {
          totalUsers: number
          successCount: number
          totalRewardAmount: number
        }
        error?: string
      }
      
      if (result.success) {
        const data = result.data || { totalUsers: 0, successCount: 0, totalRewardAmount: 0 }
        alert(`✅ 奖励发放成功!\n\n影响用户: ${data.totalUsers}\n成功发放: ${data.successCount}\n总金额: ${data.totalRewardAmount.toFixed(8)} USDT`)
        setIsStakingRewardModalOpen(false)
        setStakingRewardData({
          rewardPercentage: '',
          reason: '',
          loading: false,
          preview: { totalUsers: 0, totalStaking: 0, estimatedReward: 0 }
        })
        // 刷新用户列表
        fetchUsers()
      } else {
        alert('❌ 发放失败: ' + result.error)
      }
    } catch (error) {
      console.error('发放质押奖励失败:', error)
      alert('❌ 发放失败: 网络错误')
    } finally {
      setStakingRewardData(prev => ({ ...prev, loading: false }))
    }
  }

  // 打开质押奖励模态框时获取预览数据
  const openStakingRewardModal = () => {
    setIsStakingRewardModalOpen(true)
    fetchStakingRewardPreview()
  }

  // 打开活动设置模态框
  const handleSetActivity = (user: User) => {
    setActivityModalData({
      userId: user.id,
      userAddress: user.wallet_address || '',
      activityId: 'standard',
      standardAmount: '1000',
      outputAmount: '6',
      countdownHours: 24,
      isEnabled: false,
      loading: false
    })
    setIsActivityModalOpen(true)
  }

  // 设置用户活动
  // 取消用户活动
  const handleCancelUserActivity = async () => {
    if (!confirm('确定要取消该用户的活动吗？用户端的活动卡片将自动隐藏。')) {
      return
    }

    setActivityModalData(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch('/api/admin/user-activity/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: activityModalData.userId,
          user_address: activityModalData.userAddress
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('活动已取消，用户端卡片将自动隐藏')
        setIsActivityModalOpen(false)
        fetchUsers()
      } else {
        alert(`取消活动失败: ${data.error}`)
      }
    } catch (error) {
      console.error('❌ 取消活动失败:', error)
      alert('取消活动失败，请重试')
    } finally {
      setActivityModalData(prev => ({ ...prev, loading: false }))
    }
  }

  const handleSetUserActivity = async () => {
    if (!activityModalData.activityId) {
      alert('请选择活动')
      return
    }

    if (!activityModalData.standardAmount || Number.parseFloat(activityModalData.standardAmount) <= 0) {
      alert('请输入有效的活动金额')
      return
    }

    if (!activityModalData.outputAmount || Number.parseFloat(activityModalData.outputAmount) <= 0) {
      alert('请输入有效的输出数额')
      return
    }

    if (!activityModalData.countdownHours || activityModalData.countdownHours <= 0) {
      alert('请输入有效的倒计时时间')
      return
    }

    setActivityModalData(prev => ({ ...prev, loading: true }))

    try {
      const requestBody = {
        user_id: activityModalData.userId,
        user_address: activityModalData.userAddress, // 修复：使用 user_address 而不是 user_wallet_address
        activity_id: activityModalData.activityId,
        standard_amount: Number.parseFloat(activityModalData.standardAmount),
        output_amount: Number.parseFloat(activityModalData.outputAmount), // 添加 output_amount 参数
        countdown_hours: activityModalData.countdownHours,
        is_enabled: activityModalData.isEnabled
      }
      
      console.log('📤 发送设置活动请求:', requestBody)
      
      const response = await fetch('/api/admin/user-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.success) {
        alert('活动设置成功')
        setIsActivityModalOpen(false)
        fetchUsers()
      } else {
        alert(data.error || '设置失败')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      alert('设置失败: ' + errorMessage)
    } finally {
      setActivityModalData(prev => ({ ...prev, loading: false }))
    }
  }

  // 智能收益计算函数
  const calculateActualEarnings = (user: User): number => {
    const withdrawable_usdt = user.withdrawable_usdt || 0
    const gj_withdrawable_usdt = user.dividend_usdt || 0
    const usdt = user.usdt || 0
    
    // 优先使用gj_withdrawable_usdt字段（管理后台设置的独立收益）
    if (gj_withdrawable_usdt > 0) {
      return gj_withdrawable_usdt
    }
    
    // 如果gj_withdrawable_usdt为0但用户有质押，推算收益
    if (usdt > 0 && withdrawable_usdt > 0) {
      // 假设用户初始充值较少，大部分withdrawable_usdt是收益
      // 这里可以根据实际业务逻辑调整
      return withdrawable_usdt > 100 ? withdrawable_usdt - 100 : withdrawable_usdt * 0.5
    }
    
    // 没有质押的情况，withdrawable_usdt可能就是收益
    return withdrawable_usdt
  }

  // 格式化收益金额显示
  const formatEarningsAmount = (user: User): string => {
    const actualEarnings = calculateActualEarnings(user)
    return actualEarnings.toFixed(2)
  }

  // 计算平台钱包总余额（withdrawable_usdt + dividend_usdt）
  const calculatePlatformBalance = (user: User): number => {
    const withdrawable_usdt = user.withdrawable_usdt || 0
    const gj_withdrawable_usdt = user.dividend_usdt || 0
    return withdrawable_usdt + gj_withdrawable_usdt
  }

  // 格式化平台钱包总余额显示
  const formatPlatformBalance = (user: User): string => {
    const totalBalance = calculatePlatformBalance(user)
    return totalBalance.toFixed(2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>用户管理</h1>
          <p>管理系统用户信息</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="dashboard-stats">
        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-title">总用户数</div>
            <div className="stat-icon users">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            注册用户总数
          </div>
        </div>
        
        <div className="stat-card products">
          <div className="stat-header">
            <div className="stat-title">已授权</div>
            <div className="stat-icon products">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.authorized}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            已完成授权用户
          </div>
        </div>
        
        <div className="stat-card orders">
          <div className="stat-header">
            <div className="stat-title">总余额</div>
            <div className="stat-icon orders">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.totalBalance.toFixed(2)}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            USDT
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-header">
            <div className="stat-title">已归集</div>
            <div className="stat-icon revenue">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.collected}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            已归集金额
          </div>
        </div>
        
        <div className="stat-card users">
          <div className="stat-header">
            <div className="stat-title">已赠送</div>
            <div className="stat-icon users">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="stat-value">{stats.gifted}</div>
          <div className="stat-change">
            <TrendingUp className="w-4 h-4" />
            首次授权奖励
          </div>
        </div>
      </div>

      {/* 自动奖励发放控制 */}
      <div className="content-card">
        <h3 className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-400" />
          自动奖励发放控制
        </h3>
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-sm">状态:</span>
                <Badge variant={autoRewardsEnabled ? "default" : "outline"} 
                       className={`${autoRewardsEnabled ? "bg-green-500 hover:bg-green-600" : "border-gray-400 text-gray-400"} text-xs`}>
                  {autoRewardsEnabled ? '已开启' : '已关闭'}
                </Badge>
              </div>
              <div className="text-xs lg:text-sm text-slate-400">
                发放频率: 每6小时执行一次 (每日4次)
              </div>
              {nextRewardRun && (
                <div className="text-xs lg:text-sm text-slate-400">
                  下次执行: {new Date(nextRewardRun).toLocaleString('zh-CN')}
                </div>
              )}
            </div>
            <Button
              onClick={toggleAutoRewards}
              disabled={autoRewardsLoading}
              variant={autoRewardsEnabled ? "destructive" : "default"}
              className={`${autoRewardsEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} w-full sm:w-auto`}
              size="sm"
            >
              {autoRewardsLoading ? (
                <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-2 animate-spin" />
              ) : autoRewardsEnabled ? (
                <XCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
              ) : (
                <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
              )}
              <span className="text-xs lg:text-sm">{autoRewardsLoading ? '处理中...' : autoRewardsEnabled ? '关闭自动发放' : '开启自动发放'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="content-card">
        <div className="p-3 lg:p-4">
          <div className="flex flex-col gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 lg:top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索地址、哈希、邀请码..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 h-9 lg:h-10 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm flex-1 min-w-0 sm:flex-none sm:min-w-[120px]"
                aria-label="筛选用户状态"
              >
                <option value="all">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
              </select>
              <select
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm flex-1 min-w-0 sm:flex-none sm:min-w-[120px]"
                aria-label="筛选授权状态"
              >
                <option value="all">全部授权</option>
                <option value="authorized">已授权</option>
                <option value="unauthorized">未授权</option>
              </select>
              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm flex-1 min-w-0 sm:flex-none sm:min-w-[120px]"
                aria-label="筛选代理"
              >
                <option value="all">全部代理</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>{agent.agent_name}</option>
                ))}
              </select>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleManualRefresh}
                  variant="outline"
                  className="border-slate-600 hover:bg-slate-700 h-9 w-full sm:w-auto"
                  title="手动刷新用户列表"
                  size="sm"
                >
                  <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  <span className="text-xs">刷新</span>
                </Button>
                <div className="text-xs text-slate-400 hidden sm:block">
                  <div>自动刷新: 30秒</div>
                  <div>上次: {lastRefreshTime.toLocaleTimeString()}</div>
                </div>
              </div>
              <Button 
                onClick={batchQueryBalances}
                variant="outline"
                className="border-slate-600 hover:bg-slate-700 h-9 w-full sm:w-auto"
                title="手动批量查询所有用户链上余额"
                disabled={batchQueryLoading}
                size="sm"
              >
                {batchQueryLoading ? (
                  <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 mr-1 animate-spin" />
                ) : (
                  <Eye className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                )}
                <span className="text-xs">{batchQueryLoading ? '查询中...' : '查余额'}</span>
              </Button>
              <Button 
                onClick={openStakingRewardModal}
                variant="outline"
                className="border-yellow-600 hover:bg-yellow-700 text-yellow-400 hover:text-yellow-300 h-9 w-full sm:w-auto"
                title="一键发放质押奖励"
                disabled={loading}
                size="sm"
              >
                <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                <span className="text-xs">发放奖励</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="data-table">
        <div className="table-header">
          <h3 className="table-title">用户列表</h3>
        </div>
        <div className="table-content">
          {loading ? (
            <div className="admin-loading" style={{ minHeight: '200px' }}>
              <div className="loading-spinner"></div>
              <p>加载中...</p>
            </div>
          ) : (
            <>
              {/* 桌面端表格视图 */}
              <div className="hidden lg:block overflow-x-auto">
              <table>
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">ID</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">代理</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">类型</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">地址</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">用户备注</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">链上钱包余额</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">平台钱包余额</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">已兑换余额</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">收益金额(ETH)</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">已提现收益</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">在线状态</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">授权状态</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">授权用户访问IP国家</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">创建时间</th>
                    <th className="text-left py-3 px-2 text-slate-300 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-2 text-white">{convertUuidToNumericId(user.id)}</td>
                      <td className="py-3 px-2">
                        <div className="text-white text-sm" title={user.agent_referral_code || ''}>
                          {getAgentDisplay(user)}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="border-blue-400 text-blue-400">
                          {getNetworkType(user.type || 2)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-white font-mono text-sm">
                          {formatAddress(user.wallet_address || '')}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-white text-sm max-w-32 truncate" title={user.telegram_user_id || '无备注'}>
                          {user.telegram_user_id || '无备注'}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-purple-400">
                        {balanceStates[user.id]?.loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          // 优先使用数据库中的链上余额（即使为0也使用数据库的值）
                          // 如果数据库中有值（包括0），使用数据库的值；否则使用手动查询的结果
                          (user.onchain_usdt_balance !== undefined && user.onchain_usdt_balance !== null)
                            ? Number.parseFloat(String(user.onchain_usdt_balance)).toFixed(8)
                            : (balanceStates[user.id]?.balance || '0.00000000')
                        )}
                      </td>
                      <td className="py-3 px-2 text-blue-400">{formatPlatformBalance(user)}</td>
                      <td className="py-3 px-2 text-green-400">{formatAmount(user.usdt)}</td>
                      <td className="py-3 px-2 text-yellow-400">{formatEarningsAmount(user)}</td>
                      <td className="py-3 px-2 text-white">{formatAmount(user.withdrawal_usdt)}</td>
                      <td className="py-3 px-2">{getOnlineStatusBadge(user.is_online || false, user.online_status || '离线')}</td>
                      <td className="py-3 px-2">{getAuthStatusBadge(user.approved, user.id, '')}</td>
                      <td className="py-3 px-2">{getIPCountryDisplay(user)}</td>
                      <td className="py-3 px-2 text-slate-400 text-xs">{formatTime(user.created_at || '')}</td>
                      <td className="py-3 px-2">
                        <ActionMenu
                          groups={[
                            {
                              label: '查询操作',
                              items: [
                                {
                                  label: '查询链上余额',
                                  icon: <Eye className="w-4 h-4" />,
                                  onClick: () => handleBalanceQuery(user.id),
                                  className: 'text-blue-400 hover:text-blue-300'
                                },
                                {
                                  label: '链上归集',
                                  icon: <Wallet className="w-4 h-4" />,
                                  onClick: () => handleBalanceCollection(user.id),
                                  className: 'text-orange-400 hover:text-orange-300'
                                }
                              ]
                            },
                            {
                              label: '余额调整',
                              items: [
                                {
                                  label: '调整ETH余额',
                                  icon: <Coins className="w-4 h-4" />,
                                  onClick: () => handleEthBalance(user.id),
                                  className: 'text-purple-400 hover:text-purple-300'
                                },
                                {
                                  label: '调整可提取余额',
                                  icon: <DollarSign className="w-4 h-4" />,
                                  onClick: () => handleWithdrawableBalance(user.id),
                                  className: 'text-yellow-400 hover:text-yellow-300'
                                }
                              ]
                            },
                            {
                              label: '监控通知',
                              items: [
                                {
                                  label: '钱包监听',
                                  icon: <Activity className="w-4 h-4" />,
                                  onClick: () => handleWalletMonitor(user.id),
                                  className: 'text-cyan-400 hover:text-cyan-300'
                                },
                                {
                                  label: 'Telegram备注',
                                  icon: <MessageSquare className="w-4 h-4" />,
                                  onClick: () => handleTelegramNote(user.id),
                                  className: 'text-green-400 hover:text-green-300'
                                }
                              ]
                            },
                            {
                              label: '权限控制',
                              items: [
                                {
                                  label: user.withdraw_forbidden ? '允许提现' : '禁止提现',
                                  icon: user.withdraw_forbidden ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />,
                                  onClick: () => handleToggleWithdraw(user.id, user.withdraw_forbidden || false),
                                  className: user.withdraw_forbidden ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                                },
                                {
                                  label: user.earnings_forbidden ? '允许收益' : '禁止收益',
                                  icon: user.earnings_forbidden ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />,
                                  onClick: () => handleToggleEarnings(user.id, user.earnings_forbidden || false),
                                  className: user.earnings_forbidden ? 'text-green-400 hover:text-green-300' : 'text-orange-400 hover:text-orange-300'
                                }
                              ]
                            },
                            {
                              label: '其他操作',
                              items: [
                                {
                                  label: '设置活动',
                                  icon: <Zap className="w-4 h-4" />,
                                  onClick: () => handleSetActivity(user),
                                  className: 'text-pink-400 hover:text-pink-300'
                                },
                                {
                                  label: '编辑用户',
                                  icon: <Edit2 className="w-4 h-4" />,
                                  onClick: () => openEditModal(user),
                                  className: 'text-slate-300 hover:text-white'
                                }
                              ]
                            },
                            {
                              label: '危险操作',
                              items: [
                                {
                                  label: '删除用户',
                                  icon: <Trash2 className="w-4 h-4" />,
                                  onClick: () => deleteUser(user.id),
                                  className: 'text-red-400 hover:text-red-300 hover:!bg-red-900/30'
                                }
                              ]
                            }
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              
              {/* 移动端卡片视图 */}
              <div className="lg:hidden space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="bg-slate-700/50 border-slate-600">
                    <CardContent className="p-3 space-y-2">
                      {/* 用户基本信息 */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-400 mb-1">ID: {convertUuidToNumericId(user.id)}</div>
                          <div className="text-sm text-white font-mono break-all">
                            {formatAddress(user.wallet_address || '')}
                          </div>
                          {user.telegram_user_id && (
                            <div className="text-xs text-slate-300 mt-1">{user.telegram_user_id}</div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          {getAuthStatusBadge(user.approved, user.id, '')}
                          {getAccountStatusBadge(user.status || 1)}
                        </div>
                      </div>
                      
                      {/* 余额信息 */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-600">
                        <div>
                          <span className="text-slate-400">链上余额:</span>
                          <span className="text-purple-400 ml-1">
                            {balanceStates[user.id]?.loading ? (
                              <RefreshCw className="w-3 h-3 inline animate-spin" />
                            ) : (
                              // 优先使用数据库中的链上余额（即使为0也使用数据库的值）
                              (user.onchain_usdt_balance !== undefined && user.onchain_usdt_balance !== null)
                                ? Number.parseFloat(String(user.onchain_usdt_balance)).toFixed(2)
                                : (balanceStates[user.id]?.balance || '0.00')
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">平台余额:</span>
                          <span className="text-blue-400 ml-1">{formatPlatformBalance(user)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">质押:</span>
                          <span className="text-green-400 ml-1">{formatAmount(user.usdt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">收益:</span>
                          <span className="text-yellow-400 ml-1">{formatEarningsAmount(user)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">已提现:</span>
                          <span className="text-white ml-1">{formatAmount(user.withdrawal_usdt)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">创建:</span>
                          <span className="text-slate-300 ml-1">{formatTime(user.created_at || '')}</span>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-600">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleBalanceQuery(user.id)}
                          className="text-blue-400 hover:text-blue-300 p-1 h-7"
                          title="查询余额"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleBalanceCollection(user.id)}
                          className="text-orange-400 hover:text-orange-300 p-1 h-7"
                          title="归集"
                        >
                          <Wallet className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleTelegramNote(user.id)}
                          className="text-green-400 hover:text-green-300 p-1 h-7"
                          title="备注"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEthBalance(user.id)}
                          className="text-purple-400 hover:text-purple-300 p-1 h-7"
                          title="ETH"
                        >
                          <Coins className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleWalletMonitor(user.id)}
                          className="text-cyan-400 hover:text-cyan-300 p-1 h-7"
                          title="监听"
                        >
                          <Activity className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleWithdrawableBalance(user.id)}
                          className="text-yellow-400 hover:text-yellow-300 p-1 h-7"
                          title="余额"
                        >
                          <DollarSign className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetActivity(user)}
                          className="text-pink-400 hover:text-pink-300 p-1 h-7"
                          title="活动"
                        >
                          <Zap className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditModal(user)}
                          className="text-slate-400 hover:text-white p-1 h-7"
                          title="编辑"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 p-1 h-7"
                          title="删除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="border-slate-600 hover:bg-slate-700"
              >
                上一页
              </Button>
              <span className="flex items-center px-3 text-slate-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="border-slate-600 hover:bg-slate-700"
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 创建用户模态框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wallet_address">用户地址 *</Label>
              <Input
                id="wallet_address"
                value={formData.wallet_address}
                onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth_wallet_address">授权地址</Label>
              <Input
                id="auth_wallet_address"
                value={formData.auth_wallet_address}
                onChange={(e) => setFormData(prev => ({ ...prev, auth_wallet_address: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent_id">代理ID</Label>
              <Input
                id="agent_id"
                type="number"
                value={formData.agent_id}
                onChange={(e) => setFormData(prev => ({ ...prev, agent_id: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="usdt">质押金额(USDT)</Label>
              <Input
                id="usdt"
                type="number"
                step="0.00000001"
                value={formData.usdt}
                onChange={(e) => setFormData(prev => ({ ...prev, usdt: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">网络类型</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                aria-label="网络类型选择"
              >
                <option value={1}>TRC20</option>
                <option value={2}>ERC20</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">账户状态</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                aria-label="账户状态选择"
              >
                <option value={1}>启用</option>
                <option value={0}>停用</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              取消
            </Button>
            <Button onClick={createUser} className="bg-blue-600 hover:bg-blue-700">
              创建
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑用户模态框 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="edit_wallet_address">用户地址</Label>
              <Input
                id="edit_wallet_address"
                value={formData.wallet_address}
                onChange={(e) => setFormData(prev => ({ ...prev, wallet_address: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_auth_wallet_address">授权地址</Label>
              <Input
                id="edit_auth_wallet_address"
                value={formData.auth_wallet_address}
                onChange={(e) => setFormData(prev => ({ ...prev, auth_wallet_address: e.target.value }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_usdt">质押余额(USDT)</Label>
              <Input
                id="edit_usdt"
                type="number"
                step="0.00000001"
                value={formData.usdt}
                onChange={(e) => setFormData(prev => ({ ...prev, usdt: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_withdrawable_usdt">钱包余额(ETH)</Label>
              <Input
                id="edit_withdrawable_usdt"
                type="number"
                step="0.00000001"
                value={formData.withdrawable_usdt}
                onChange={(e) => setFormData(prev => ({ ...prev, withdrawable_usdt: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_gj_withdrawable_usdt">收益金额</Label>
              <Input
                id="edit_gj_withdrawable_usdt"
                type="number"
                step="0.00000001"
                value={formData.gj_withdrawable_usdt}
                onChange={(e) => setFormData(prev => ({ ...prev, gj_withdrawable_usdt: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_withdrawal_usdt">已提现收益</Label>
              <Input
                id="edit_withdrawal_usdt"
                type="number"
                step="0.00000001"
                value={formData.withdrawal_usdt}
                onChange={(e) => setFormData(prev => ({ ...prev, withdrawal_usdt: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_forbid_day">禁提天数</Label>
              <Input
                id="edit_forbid_day"
                type="number"
                value={formData.forbid_day}
                onChange={(e) => setFormData(prev => ({ ...prev, forbid_day: Number(e.target.value) }))}
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">账户状态</Label>
              <select
                id="edit_status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                aria-label="账户状态选择"
              >
                <option value={1}>启用</option>
                <option value={0}>停用</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_pause">发息状态</Label>
              <select
                id="edit_pause"
                value={formData.pause}
                onChange={(e) => setFormData(prev => ({ ...prev, pause: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                aria-label="发息状态选择"
              >
                <option value={2}>正常</option>
                <option value={1}>停息</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_is_effective">授权状态</Label>
              <select
                id="edit_is_effective"
                value={formData.is_effective}
                onChange={(e) => setFormData(prev => ({ ...prev, is_effective: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md"
                aria-label="授权状态选择"
              >
                <option value={0}>未授权</option>
                <option value={1}>已授权</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit_telegram_user_id">用户备注</Label>
              <Input
                id="edit_telegram_user_id"
                value={formData.telegram_user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, telegram_user_id: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入用户备注信息"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button onClick={editUser} className="bg-blue-600 hover:bg-blue-700">
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 质押奖励发放模态框 */}
      <Dialog open={isStakingRewardModalOpen} onOpenChange={setIsStakingRewardModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              一键发放质押奖励
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 预览信息 */}
            <div className="p-4 bg-slate-700 rounded-lg space-y-2">
              <div className="text-sm text-slate-300">预览信息</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">质押用户:</span>
                  <span className="text-white ml-2">{stakingRewardData.preview.totalUsers} 人</span>
                </div>
                <div>
                  <span className="text-slate-400">总质押:</span>
                  <span className="text-green-400 ml-2">{stakingRewardData.preview.totalStaking.toFixed(4)} USDT</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">预计奖励:</span>
                  <span className="text-yellow-400 ml-2">{stakingRewardData.preview.estimatedReward.toFixed(8)} USDT</span>
                </div>
              </div>
            </div>

            {/* 奖励比例设置 */}
            <div className="space-y-2">
              <Label htmlFor="reward_percentage">奖励比例 (%)</Label>
              <Input
                id="reward_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={stakingRewardData.rewardPercentage}
                onChange={(e) => {
                  const value = e.target.value
                  setStakingRewardData(prev => ({ 
                    ...prev, 
                    rewardPercentage: value,
                    preview: {
                      ...prev.preview,
                      estimatedReward: (prev.preview.totalStaking * Number.parseFloat(value || '0')) / 100
                    }
                  }))
                }}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入奖励比例 (0-100)"
              />
              <p className="text-xs text-slate-400">
                例如: 输入 5 表示发放质押金额的 5% 作为奖励
              </p>
            </div>
            
            {/* 发放原因 */}
            <div className="space-y-2">
              <Label htmlFor="reward_reason">发放原因 (可选)</Label>
              <Input
                id="reward_reason"
                value={stakingRewardData.reason}
                onChange={(e) => setStakingRewardData(prev => ({ ...prev, reason: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="例如: 月度质押奖励"
              />
            </div>
            
            {/* 风险提示 */}
            <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 text-sm">
                <span>⚠️</span>
                <span className="font-medium">操作提示</span>
              </div>
              <p className="text-xs text-yellow-300 mt-1">
                • 奖励将直接添加到用户的平台钱包余额<br/>
                • 操作完成后无法撤销，请仔细确认<br/>
                • 建议在非高峰期操作以避免影响用户体验
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsStakingRewardModalOpen(false)}
              disabled={stakingRewardData.loading}
            >
              取消
            </Button>
            <Button 
              onClick={handleBatchStakingReward} 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={stakingRewardData.loading || !stakingRewardData.rewardPercentage}
            >
              {stakingRewardData.loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  发放中...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  确认发放
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 余额调整模态框 */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>调整用户余额</DialogTitle>
          </DialogHeader>
          <div className="modal-form-group">
            <div className="modal-info-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="modal-label">用户ID</span>
                <span style={{ color: 'white' }}>{balanceModalData.userId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="modal-label">余额类型</span>
                <span style={{ color: 'white' }}>
                  {balanceModalData.balanceType === 'staking' ? '质押余额(USDT)' : 
                   balanceModalData.balanceType === 'platform' ? '平台钱包余额(USDT)' : 
                   '收益金额(ETH)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="modal-label">当前余额</span>
                <span style={{ color: '#10b981', fontWeight: '600' }}>{balanceModalData.currentBalance}</span>
              </div>
            </div>

            <div>
              <label className="modal-label">操作类型</label>
              <div className="modal-button-group">
                <button
                  type="button"
                  onClick={() => setBalanceModalData(prev => ({ ...prev, operation: 'add' }))}
                  className={`modal-button ${balanceModalData.operation === 'add' ? 'active' : ''}`}
                >
                  增加余额
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceModalData(prev => ({ ...prev, operation: 'subtract' }))}
                  className={`modal-button ${balanceModalData.operation === 'subtract' ? 'active' : ''}`}
                >
                  扣减余额
                </button>
              </div>
            </div>
            
            <div>
              <label className="modal-label">调整金额</label>
              <input
                id="balance_amount"
                type="number"
                step="0.00000001"
                value={balanceModalData.amount}
                onChange={(e) => setBalanceModalData(prev => ({ ...prev, amount: e.target.value }))}
                className="modal-input"
                placeholder="请输入调整金额"
              />
            </div>
            
            <div>
              <label className="modal-label">管理员地址 (可选)</label>
              <input
                id="admin_wallet_address"
                type="text"
                value={balanceModalData.adminAddress}
                onChange={(e) => setBalanceModalData(prev => ({ ...prev, adminAddress: e.target.value }))}
                className="modal-input"
                placeholder="0x... (可选)"
              />
            </div>
            
            <div>
              <label className="modal-label">调整原因</label>
              <textarea
                id="balance_reason"
                value={balanceModalData.reason}
                onChange={(e) => setBalanceModalData(prev => ({ ...prev, reason: e.target.value }))}
                className="modal-textarea"
                placeholder="请输入调整原因（可选）"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setIsBalanceModalOpen(false)}
              className="modal-cancel-button"
            >
              取消
            </button>
            <button 
              onClick={handleBalanceAdjustment}
              className="modal-submit-button"
            >
              确认调整
            </button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* 归集转账模态框 */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>授权地址归集转账</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>用户账号</Label>
              <Input value={transferData.userName} disabled />
            </div>
            <div>
              <Label>用户地址</Label>
              <Input value={transferData.userAddress} disabled />
            </div>
            <div>
              <Label>授权地址（转出地址）</Label>
              <Input value={transferData.authAddress} disabled />
            </div>
            <div>
              <Label>转账金额 (USDT)</Label>
              <Input
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="请输入转账金额"
              />
            </div>
            <div>
              <Label>接收地址（管理员地址）</Label>
              <Input
                value={transferData.adminAddress}
                onChange={(e) => setTransferData(prev => ({ ...prev, adminAddress: e.target.value }))}
                placeholder="请输入管理员接收地址"
              />
            </div>
            <div>
              <Label>转账备注</Label>
              <Input
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="请输入转账原因"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                取消
              </Button>
              <Button onClick={executeTransfer} disabled={transferLoading}>
                {transferLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    转账中...
                  </>
                ) : (
                  '确认转账'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 活动设置模态框 */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="bg-slate-800 border-slate-600 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              设置用户活动
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>用户地址</Label>
              <Input
                value={activityModalData.userAddress}
                disabled
                className="bg-slate-700 border-slate-600"
              />
            </div>
            
            <div>
              <Label htmlFor="activity_type">活动类型</Label>
              <select
                id="activity_type"
                value={activityModalData.activityId}
                onChange={(e) => setActivityModalData(prev => ({ ...prev, activityId: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                aria-label="选择活动类型"
              >
                <option value="standard">Standard 活动</option>
              </select>
            </div>

            <div>
              <Label htmlFor="standard_amount">Standard 活动金额 (USDT)</Label>
              <Input
                id="standard_amount"
                type="number"
                step="0.01"
                min="0"
                value={activityModalData.standardAmount}
                onChange={(e) => setActivityModalData(prev => ({ ...prev, standardAmount: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入活动金额"
              />
            </div>

            <div>
              <Label htmlFor="output_amount">Output 数额 (ETH)</Label>
              <Input
                id="output_amount"
                type="number"
                step="0.01"
                min="0"
                value={activityModalData.outputAmount}
                onChange={(e) => setActivityModalData(prev => ({ ...prev, outputAmount: e.target.value }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入输出数额"
              />
            </div>

            <div>
              <Label htmlFor="countdown_hours">倒计时时间 (小时)</Label>
              <Input
                id="countdown_hours"
                type="number"
                min="1"
                max="168"
                value={activityModalData.countdownHours}
                onChange={(e) => setActivityModalData(prev => ({ ...prev, countdownHours: Number.parseInt(e.target.value) || 24 }))}
                className="bg-slate-700 border-slate-600"
                placeholder="请输入倒计时小时数"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_enabled"
                checked={activityModalData.isEnabled}
                onChange={(e) => setActivityModalData(prev => ({ ...prev, isEnabled: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                aria-label="启用活动"
              />
              <Label htmlFor="is_enabled" className="text-sm">
                启用活动
              </Label>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">活动说明：</p>
                <p>• 设置后用户端将显示活动卡片</p>
                <p>• 用户需要授权钱包进行活动参与</p>
                <p>• 倒计时结束后活动将自动结束</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              {/* 左侧：取消活动按钮 */}
              <Button 
                variant="destructive" 
                onClick={handleCancelUserActivity}
                disabled={activityModalData.loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {activityModalData.loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    取消中...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    取消活动
                  </>
                )}
              </Button>
              
              {/* 右侧：关闭和确认按钮 */}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>
                  关闭
                </Button>
                <Button onClick={handleSetUserActivity} disabled={activityModalData.loading}>
                  {activityModalData.loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      设置中...
                    </>
                  ) : (
                    '确认设置'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram用户备注修改弹窗 */}
      {telegramNoteData && isTelegramNoteModalOpen && (
        <Dialog open={isTelegramNoteModalOpen} onOpenChange={setIsTelegramNoteModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle>修改Telegram用户备注</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>用户地址</Label>
                <Input 
                  value={telegramNoteData.wallet_address} 
                  disabled 
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>当前备注</Label>
                <Input 
                  value={telegramNoteData.currentNote} 
                  disabled 
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>新备注</Label>
                <Input 
                  placeholder="请输入新的Telegram用户备注"
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTelegramNoteModalOpen(false)}>
                取消
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">
                保存
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ETH余额调整弹窗 */}
      {ethBalanceData && isEthBalanceModalOpen && (
        <Dialog open={isEthBalanceModalOpen} onOpenChange={setIsEthBalanceModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle>调整可兑换ETH余额</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>用户地址</Label>
                <Input 
                  value={ethBalanceData.wallet_address} 
                  disabled 
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>当前可兑换ETH余额</Label>
                <Input 
                  value={ethBalanceData.currentBalance.toFixed(8)} 
                  disabled 
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={ethBalanceData.operation === 'add' ? 'default' : 'outline'}
                  onClick={() => setEthBalanceData(prev => prev ? {...prev, operation: 'add'} : null)}
                >
                  增加
                </Button>
                <Button 
                  variant={ethBalanceData.operation === 'subtract' ? 'default' : 'outline'}
                  onClick={() => setEthBalanceData(prev => prev ? {...prev, operation: 'subtract'} : null)}
                >
                  减少
                </Button>
              </div>
              <div>
                <Label>调整金额 (ETH)</Label>
                <Input 
                  type="number"
                  step="0.00000001"
                  placeholder="请输入调整金额"
                  value={ethBalanceData.amount}
                  onChange={(e) => setEthBalanceData(prev => prev ? {...prev, amount: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEthBalanceModalOpen(false)}>
                取消
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleConfirmEthBalance}
                disabled={ethBalanceData.loading}
              >
                {ethBalanceData.loading ? '处理中...' : '确认调整'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 钱包监听弹窗 */}
      {walletMonitorData && isWalletMonitorModalOpen && (
        <Dialog open={isWalletMonitorModalOpen} onOpenChange={setIsWalletMonitorModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle>添加钱包监听</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>用户地址</Label>
                <Input 
                  value={walletMonitorData.wallet_address} 
                  disabled 
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label>监听状态</Label>
                <div className="flex items-center space-x-2">
                  <span className={walletMonitorData.isMonitored ? 'text-green-400' : 'text-red-400'}>
                    {walletMonitorData.isMonitored ? '已监听' : '未监听'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsWalletMonitorModalOpen(false)}>
                取消
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                {walletMonitorData.isMonitored ? '移除监听' : '添加监听'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Telegram用户备注编辑弹窗 */}
      {telegramNoteData && isTelegramNoteModalOpen && (
        <Dialog open={isTelegramNoteModalOpen} onOpenChange={setIsTelegramNoteModalOpen}>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-400" />
                修改用户备注
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>用户地址</Label>
                <Input 
                  value={telegramNoteData.wallet_address} 
                  disabled 
                  className="bg-slate-700 border-slate-600 text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="telegram_note">用户备注</Label>
                <Input
                  id="telegram_note"
                  value={telegramNoteData.currentNote}
                  onChange={(e) => setTelegramNoteData(prev => prev ? {...prev, currentNote: e.target.value} : null)}
                  className="bg-slate-700 border-slate-600"
                  placeholder="请输入用户备注"
                />
                <p className="text-xs text-slate-400 mt-1">
                  备注将同步到Telegram通知和提现订单
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsTelegramNoteModalOpen(false)}
                disabled={telegramNoteData.loading}
              >
                取消
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  if (!telegramNoteData) return
                  
                  setTelegramNoteData(prev => prev ? {...prev, loading: true} : null)
                  
                  try {
                    const response = await fetch('/api/admin/users', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({ 
                        id: telegramNoteData.userId, 
                        telegram_user_id: telegramNoteData.currentNote 
                      })
                    })
                    
                    const result = await response.json()
                    if (result.success) {
                      alert('用户备注更新成功')
                      setIsTelegramNoteModalOpen(false)
                      await fetchUsers()
                    } else {
                      alert('更新失败: ' + (result.error || '未知错误'))
                    }
                  } catch (error) {
                    console.error('更新用户备注失败:', error)
                    alert('更新失败，请重试')
                  } finally {
                    setTelegramNoteData(prev => prev ? {...prev, loading: false} : null)
                  }
                }}
                disabled={telegramNoteData.loading}
              >
                {telegramNoteData.loading ? '保存中...' : '保存'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* 归集成功弹窗 */}
      {collectionSuccessData && isCollectionSuccessModalOpen && (
        <CollectionSuccessModal
          isOpen={isCollectionSuccessModalOpen}
          onClose={() => {
            setIsCollectionSuccessModalOpen(false)
            setCollectionSuccessData(null)
          }}
          data={collectionSuccessData}
        />
      )}

      {/* 余额查询弹窗 */}
      {balanceQueryData && isBalanceQueryModalOpen && (
        <BalanceQueryModal
          isOpen={isBalanceQueryModalOpen}
          onClose={() => {
            setIsBalanceQueryModalOpen(false)
            setBalanceQueryData(null)
          }}
          data={balanceQueryData}
        />
      )}

      {/* 归集输入对话框 */}
      <Dialog 
        open={isCollectionInputModalOpen} 
        onOpenChange={(open) => {
          setIsCollectionInputModalOpen(open)
          if (!open) {
            setCollectionInputData(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>归集余额</DialogTitle>
          </DialogHeader>
          {collectionInputData && (
            <div className="modal-form-group">
              <div className="modal-info-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="modal-label">用户ID</span>
                  <span style={{ color: 'white' }}>{collectionInputData.userId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="modal-label">钱包地址</span>
                  <span style={{ color: 'white', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    {collectionInputData.fromAddress}
                  </span>
                </div>
              </div>

              <div>
                <label className="modal-label">归集金额 (USDT)</label>
                <input
                  type="number"
                  step="0.00000001"
                  value={collectionInputData.amount}
                  onChange={(e) => setCollectionInputData(prev => prev ? { ...prev, amount: e.target.value } : null)}
                  className="modal-input"
                  placeholder="请输入要归集的USDT金额"
                />
              </div>

              <div>
                <label className="modal-label">收款地址</label>
                <input
                  type="text"
                  value={collectionInputData.toAddress}
                  onChange={(e) => setCollectionInputData(prev => prev ? { ...prev, toAddress: e.target.value } : null)}
                  className="modal-input"
                  placeholder="0x..."
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => {
                setIsCollectionInputModalOpen(false)
                setCollectionInputData(null)
              }}
              className="modal-cancel-button"
            >
              取消
            </button>
            <button 
              onClick={handleCollectionInputConfirm}
              className="modal-submit-button"
            >
              下一步
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 归集确认弹窗 */}
      {collectionConfirmData && isCollectionConfirmModalOpen && (
        <CollectionConfirmModal
          isOpen={isCollectionConfirmModalOpen}
          onClose={() => {
            setIsCollectionConfirmModalOpen(false)
            setCollectionConfirmData(null)
          }}
          onConfirm={confirmCollection}
          data={collectionConfirmData}
        />
      )}
    </div>
  )
} 