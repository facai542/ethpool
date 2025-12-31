import type React from 'react'
import { CounterAnimation } from './CounterAnimation'
import { HexagonLoaderInline } from './HexagonLoader'

interface StakingCardWithFrameProps {
  stakedAmount: number
  rewardAmount: number
  usdtBalance: string
  currentUsdtPrice: number
  stats: {
    totalRewards: number
  }
  isConnected: boolean
  isOnBSC: boolean
  isAuthorized: boolean
  isLoading: boolean
  isApprovalPending: boolean
  approvalTxHash: string | null
  onConnect: () => void
  onApprove: () => void
  onStake: () => void
  t: {
    earnedRewards: string
    connectWallet: string
    connectingWallet: string
    pleaseSwitchToBsc: string
  }
}

export const StakingCardWithFrame: React.FC<StakingCardWithFrameProps> = ({
  stakedAmount,
  rewardAmount,
  usdtBalance,
  currentUsdtPrice,
  stats,
  isConnected,
  isOnBSC,
  isAuthorized,
  isLoading,
  isApprovalPending,
  approvalTxHash,
  onConnect,
  onApprove,
  onStake,
  t
}) => {
  // 按钮基础样式
  const baseButtonStyle = {
    padding: '8px 16px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    minWidth: '120px',
    outline: 'none',
  }

  // 黄色按钮样式
  const yellowButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#eab308',
    color: '#000000',
  }

  // 橙色按钮样式
  const orangeButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#f97316',
    color: '#ffffff',
  }

  // 蓝色按钮样式
  const blueButtonStyle = {
    ...baseButtonStyle,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    opacity: 0.8,
  }

  return (
    <div className="relative bg-gradient-to-b from-[#F0B90B]/10 to-[#FCD535]/10 p-4 rounded-lg">
      {/* 质押卡片边框装饰 */}
      <div className="binance-frame flex min-h-[400px]">
        {/* 左侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="h-4" 
            style={{ 
              backgroundImage: "url('/fragments/frame-left-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderLeft: '1px solid rgb(252, 234, 156)' }}
          >
            <img 
              className="w-full h-full object-cover" 
              src="/fragments/left-gradient.svg" 
              alt="Left gradient"
            />
          </div>
        </div>

        {/* 中间质押卡片内容区域 */}
        <div className="flex flex-col flex-1">
          {/* 顶部边框 */}
          <div className="flex w-full">
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-left-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
            <div 
              className="w-[150px] bg-no-repeat bg-cover h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-center-mobile.svg')" 
              }}
            ></div>
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-top-right-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
          </div>

          {/* 质押卡片内容 */}
          <div className="flex-1 bg-gradient-to-br from-black/80 to-gray-900/90 backdrop-blur-sm border-l border-r border-yellow-500/20 p-6">
            {/* 主要质押信息 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <img src="/icons/binance-icon.png" alt="USDT" className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    <CounterAnimation end={stakedAmount} decimals={2} suffix=" USDT" className="counter-text" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.earnedRewards}: <span className="text-green-400 font-medium">
                      <CounterAnimation end={rewardAmount} decimals={2} suffix=" USDT" />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex flex-col gap-2">
                {!isConnected ? (
                  <button 
                    onClick={onConnect}
                    disabled={isLoading}
                    style={yellowButtonStyle}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#d19200'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#eab308'
                      }
                    }}
                  >
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000' }}>
                        <HexagonLoaderInline className="scale-50" />
                        <span>{t.connectingWallet}</span>
                      </div>
                    ) : (
                      <span>{t.connectWallet}</span>
                    )}
                  </button>
                ) : !isOnBSC ? (
                  <button 
                    onClick={() => alert(t.pleaseSwitchToBsc)}
                    style={orangeButtonStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ea580c'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f97316'
                    }}
                  >
                    <span>Switch to BSC</span>
                  </button>
                ) : isApprovalPending ? (
                  <button 
                    disabled={true}
                    style={blueButtonStyle}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
                      <HexagonLoaderInline className="scale-50" />
                      <span>Authorizing... {approvalTxHash === 'pending' ? '(Pending)' : ''}</span>
                    </div>
                  </button>
                ) : !isAuthorized ? (
                  <button 
                    onClick={onApprove}
                    disabled={isLoading}
                    style={yellowButtonStyle}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#d19200'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#eab308'
                      }
                    }}
                  >
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000' }}>
                        <HexagonLoaderInline className="scale-50" />
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <span>Approve USDT</span>
                    )}
                  </button>
                ) : (
                  <button 
                    onClick={onStake}
                    disabled={isLoading}
                    style={yellowButtonStyle}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#d19200'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#eab308'
                      }
                    }}
                  >
                    {isLoading ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000000' }}>
                        <HexagonLoaderInline className="scale-50" />
                        <span>Staking...</span>
                      </div>
                    ) : (
                      <span>Stake USDT</span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* 统计数据网格 */}
            <div className="space-y-4">
              {/* 三列统计数据 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">Reward Pool</div>
                  <div className="text-lg font-bold text-white">
                    <CounterAnimation end={stats.totalRewards / 1000} decimals={0} suffix="K" className="counter-text" />
                  </div>
                </div>
                <div className="text-center p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">Player Income</div>
                  <div className="text-lg font-bold text-white">
                    <CounterAnimation end={rewardAmount} decimals={2} className="counter-text" />
                  </div>
                </div>
                <div className="text-center p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">USDT Price</div>
                  <div className="text-lg font-bold text-white">
                    $<CounterAnimation end={currentUsdtPrice} decimals={2} className="counter-text" />
                  </div>
                </div>
              </div>

              {/* 两列统计数据 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">Wallet Balance</div>
                  <div className="text-lg font-bold text-white">
                    <CounterAnimation end={Number.parseFloat(usdtBalance || '0')} decimals={2} suffix=" USDT" className="counter-text" />
                  </div>
                </div>
                <div className="text-center p-3 bg-black/40 rounded-lg border border-yellow-500/20">
                  <div className="text-sm text-yellow-400 mb-1">Staking APY</div>
                  <div className="text-lg font-bold text-green-400">
                    <CounterAnimation end={15.6} decimals={1} suffix="%" className="counter-text" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部边框 */}
          <div className="flex w-full">
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-left-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
            <div 
              className="w-[150px] bg-no-repeat bg-cover h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-center-mobile.svg')" 
              }}
            ></div>
            <div 
              className="flex-1 h-[6px]" 
              style={{ 
                backgroundImage: "url('/fragments/frame-bottom-right-mobile.svg')",
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x' 
              }}
            ></div>
          </div>
        </div>

        {/* 右侧边框 */}
        <div className="flex flex-col w-[14px]">
          <div 
            className="h-4" 
            style={{ 
              backgroundImage: "url('/fragments/frame-right-corner-mobile.svg')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat' 
            }}
          ></div>
          <div 
            className="flex flex-1 bg-[#1E1E1E] items-center" 
            style={{ borderRight: '1px solid rgb(252, 234, 156)' }}
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
  )
} 