'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, DollarSign, Wallet, ArrowRight, Loader2, MessageCircle } from 'lucide-react'
import { useAccount, useContractWrite, useWaitForTransactionReceipt, useContractRead } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { USDT_ABI } from '@/lib/contracts'
import { useWeb3Staking } from '@/hooks/useWeb3Staking'
import { useAppKit } from '@reown/appkit/react'
import { useI18n } from '@/contexts/I18nContext'

interface ActivityCardProps {
  userAddress?: string
  className?: string
}

interface ActivityData {
  id: number
  user_id: number
  user_address: string
  activity_id: string
  standard_amount: number
  output_amount: number
  countdown_hours: number
  is_enabled: boolean
  created_at: string
  expires_at: string
}

interface WalletBalance {
  usdt: string
  eth: string
}

export default function ActivityCard({ userAddress, className }: ActivityCardProps) {
  const { address } = useAccount()
  const { open } = useAppKit()
  const { t } = useI18n()
  const { 
    approveUsdt, 
    stakeUsdt, 
    usdtBalance, 
    usdtAllowance, 
    isOnSupportedNetwork 
  } = useWeb3Staking()

  const [activityData, setActivityData] = useState<ActivityData | null>(null)
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({ usdt: '0', eth: '0' })
  const [isExpired, setIsExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // 获取活动数据
  const fetchActivityData = useCallback(async () => {
    if (!userAddress) return

    try {
      const response = await fetch(`/api/admin/user-activity?user_address=${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // 只在活动启用时才设置数据，否则隐藏卡片
          if (data.data.is_enabled) {
            setActivityData(data.data)
          } else {
            setActivityData(null)
          }
        } else {
          setActivityData(null)
        }
      }
    } catch (error) {
      console.error('获取活动数据失败:', error)
      setActivityData(null)
    }
  }, [userAddress])

  // 获取钱包余额
  const fetchWalletBalance = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/user/info?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWalletBalance({
            usdt: data.data.usdtBalance || '0',
            eth: data.data.ethBalance || '0'
          })
        }
      }
    } catch (error) {
      console.error('获取钱包余额失败:', error)
    }
  }, [address])

  // 倒计时计算
  useEffect(() => {
    if (!activityData) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(activityData.expires_at).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft('00:00:00:00:000')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      const milliseconds = Math.floor((difference % 1000))

      setTimeLeft(`${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 100)

    return () => clearInterval(interval)
  }, [activityData])

  useEffect(() => {
    if (userAddress) {
      fetchActivityData()
    }
    if (address) {
      fetchWalletBalance()
    }
    
    // 添加自动刷新：每10秒检查活动状态
    const refreshInterval = setInterval(() => {
      if (userAddress) {
        console.log('🔄 自动刷新活动状态...')
        fetchActivityData()
      }
    }, 10000) // 10秒刷新一次
    
    return () => clearInterval(refreshInterval)
  }, [userAddress, address, fetchActivityData, fetchWalletBalance])

  // 处理奖励按钮点击 - 与首页质押按钮功能一模一样
  const handleRewardClick = async () => {
    if (!address) {
      console.log('🔗 Wallet not connected, starting connection...')
      await open()
      return
    }

    if (!isOnSupportedNetwork) {
      alert(t.pleaseSwitchToBsc)
      return
    }

    if (!activityData) {
      alert('活动数据不存在')
      return
    }

    setIsProcessing(true)
    try {
      console.log('🎯 参与活动...')
      
      // 调用参与活动API
      const response = await fetch('/api/user/participate-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          activity_id: activityData.activity_id,
          user_address: address,
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ 参与活动成功')
        alert('参与成功！')
        
        // 刷新活动数据
        await fetchActivityData()
      } else {
        console.error('❌ 参与活动失败:', result.error)
        alert(result.error || '参与活动失败')
      }
      
      setIsProcessing(false)
      
    } catch (error) {
      console.error('❌ 参与活动异常:', error)
      setIsProcessing(false)
      alert('参与活动失败')
    }
  }

  if (!activityData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">{t.noActivityData}</div>
      </div>
    )
  }

  const isConnected = !!address
  const isAuthorized = usdtAllowance && Number.parseFloat(usdtAllowance) > 0 && !isProcessing
  const totalBalance = Number.parseFloat(walletBalance.usdt) + Number.parseFloat(walletBalance.eth)
  const requiredUsdt = activityData.standard_amount

  return (
    <div className="w-full bg-transparent font-sans" style={{ marginTop: '-80px' }}>
      <div className="flex flex-col items-center">
        {/* 主卡片 */}
        <div className="w-full max-w-[600px] h-[120px] bg-[#313131] rounded-t-[20px] flex flex-row items-center justify-between text-white transition-transform duration-300 ease-in-out relative cursor-pointer z-[2] p-4 md:p-6 hover:scale-[1.02]">
          {/* ETH图标 */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 784.37 1277.39"
            className="h-[80%] w-auto relative transition-all duration-200 ease-in-out z-[1] flex-shrink-0 eth-float-animation"
          >
            <g>
              <polygon points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54" fill="#343434" />
              <polygon points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33" fill="#8C8C8C" />
              <polygon points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89" fill="#3C3C3B" />
              <polygon points="392.07,1277.38 392.07,956.52 -0,724.89" fill="#8C8C8C" />
              <polygon points="392.07,882.29 784.13,650.54 392.07,472.33" fill="#141414" />
              <polygon points="0,650.54 392.07,882.29 392.07,472.33" fill="#393939" />
            </g>
          </svg>

          <div className="flex flex-col items-start justify-center z-[5] gap-1 ml-5">
            <div className="text-2xl font-bold text-white">
              Apply Mining Pool Rewards
            </div>
            <div className="text-base text-[#999] font-normal">
              ERC-20 Smart Contract
            </div>
          </div>
        </div>

        {/* 底部内容卡片 */}
        <div className="w-full max-w-[600px] bg-[#1a1a1a] rounded-b-[20px] overflow-visible max-h-[300px] opacity-100 transition-all duration-400 ease-in-out z-[1] pt-4">
          <div className="flex flex-col gap-0">
            <div className="flex justify-between items-center py-4 px-6 border-b border-[#2a2a2a]">
              <span className="text-[15px] text-[#888] font-normal">Standard:</span>
              <span className="text-[15px] text-white font-semibold">{activityData.standard_amount}</span>
            </div>
            <div className="flex justify-between items-center py-4 px-6 border-b border-[#2a2a2a]">
              <span className="text-[15px] text-[#888] font-normal">Output:</span>
              <span className="text-[15px] text-white font-semibold">{activityData.output_amount || 6}</span>
            </div>
            <div className="flex justify-between items-center py-4 px-6 border-b border-[#2a2a2a]">
              <span className="text-[15px] text-[#888] font-normal">Total balance:</span>
              <span className="text-[15px] text-white font-semibold">{totalBalance.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center py-4 px-6 border-b border-[#2a2a2a]">
              <span className="text-[15px] text-[#888] font-normal">Required USDT:</span>
              <span className="text-[15px] text-white font-semibold">{requiredUsdt.toFixed(6)}</span>
            </div>
            <div className="flex justify-between items-center py-4 px-6 border-b border-[#2a2a2a]">
              <span className="text-[15px] text-[#888] font-normal">Countdown:</span>
              <span className="text-[15px] text-white font-semibold">
                {isExpired ? '00:00:00:00:000' : timeLeft}
              </span>
            </div>
          </div>
          
          <button 
            className="w-full py-5 bg-[rgb(0,107,179)] border-[3px] border-[#ffffff4d] rounded-b-[20px] text-white text-base font-bold cursor-pointer transition-all duration-300 ease-in-out mt-0 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] relative overflow-hidden flex items-center justify-center gap-2 hover:scale-[1.05] hover:border-[#fff9] hover:before:animate-[shine_1.5s_ease-out_infinite] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExpired || !isConnected || isProcessing}
            onClick={handleRewardClick}
          >
            {isExpired ? t.noActivityDataMessage :
             !isConnected ? t.connectWallet :
             !isOnSupportedNetwork ? t.switchToBsc :
             isProcessing ? (
               <>
                 <Loader2 className="w-5 h-5 animate-spin" />
                 {t.verifying}
               </>
             ) : 'Reward'}
            
            {!isProcessing && (
              <svg className="w-6 h-6 transition-all duration-300 ease-in-out group-hover:translate-x-1" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .eth-float-animation {
          animation: ethFloat 4s ease-in-out infinite;
        }

        @keyframes ethFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(1deg);
          }
          50% {
            transform: translateY(-12px) rotate(0deg);
          }
          75% {
            transform: translateY(-8px) rotate(-1deg);
          }
        }

        @keyframes anim {
          50% {
            transform: translateY(-10%) rotate(5deg);
          }
        }

        @keyframes shine {
          0% {
            left: -100px;
          }
          60% {
            left: 100%;
          }
          to {
            left: 100%;
          }
        }

        button::before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100%;
          background-image: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0) 70%
          );
          top: 0;
          left: -100px;
          opacity: 0.6;
        }

        button:hover svg {
          transform: translateX(4px);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .max-w-\\[600px\\] {
            max-width: 90vw;
          }
          
          .text-2xl {
            font-size: 1.25rem;
          }
          
          .text-base {
            font-size: 0.875rem;
          }
          
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        @media (max-width: 480px) {
          .max-w-\\[600px\\] {
            max-width: 95vw;
          }
          
          .text-2xl {
            font-size: 1.125rem;
          }
          
          .h-\\[120px\\] {
            height: 100px;
          }
          
          .py-4 {
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}