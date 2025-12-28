import type React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AnimatedTabs } from '@/components/ui/animated-tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { TrendingUp, TrendingDown, Wallet, Lock, Unlock, Info, Star, Clock, DollarSign } from 'lucide-react';
import { RouteIcon } from '@/components/ui/route-icon';
import { EthUsdtSwapCard } from '@/components/ui/eth-usdt-swap-card';
import { useI18n } from '@/contexts/I18nContext';
import { useWallet } from '@/contexts/WalletContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StakingPool {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  totalStaked: string;
  minStake: string;
  lockPeriod: string;
  status: 'active' | 'ended' | 'coming';
  featured?: boolean;
}

interface UserStaking {
  poolId: string;
  amount: string;
  rewards: string;
  startDate: string;
  endDate: string;
}

interface BinanceLiquidityStakingProps {
  userEthBalance?: number;
  onExchangeSuccess?: () => void;
}

const BinanceLiquidityStaking: React.FC<BinanceLiquidityStakingProps> = ({ userEthBalance = 0, onExchangeSuccess }) => {
  const { t } = useI18n();
  const { account, isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState('兌換');
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [poolsData, setPoolsData] = useState<StakingPool[]>([]);
  const [userStakingsData, setUserStakingsData] = useState<UserStaking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 兑换相关状态
  const [ethAmount, setEthAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(4480.37);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  
  // 质押状态管理
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState<{[key: string]: boolean}>({});
  const [isStaking, setIsStaking] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState<{[key: string]: boolean}>({});

  // 获取实时汇率
  const fetchExchangeRate = async () => {
    try {
      setIsLoadingRate(true);
      const response = await fetch('/api/exchange?from=ETH&to=USDT&amount=1');
      const data = await response.json();
      
      if (data.success && data.data.rate) {
        setExchangeRate(data.data.rate);
        console.log('✅ 实时汇率获取成功:', data.data.rate);
      } else {
        console.warn('⚠️ 获取汇率失败，使用默认汇率');
      }
    } catch (error) {
      console.error('❌ 获取汇率失败:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load mining pools from database (公开数据)
        const poolsResponse = await fetch('/api/supabase/mining-pools');
        const poolsResult = await poolsResponse.json();
        
        // 只保留USDT池
        const transformedPools: StakingPool[] = [{
          id: 'usdt-bsc',
          name: 'USDT (BSC)',
          symbol: 'USDT',
          apy: 12.5,
          totalStaked: '2,580,000',
          minStake: '10',
          lockPeriod: '30 days',
          status: 'active',
          featured: true
        }];
        
        setPoolsData(transformedPools);
        
        // 只有钱包连接时才加载用户质押数据
        if (isConnected && account) {
          try {
            const ordersResponse = await fetch(`/api/supabase/mining-orders?address=${account}`);
            const ordersResult = await ordersResponse.json();
            
            if (ordersResult.success && ordersResult.data && ordersResult.data.length > 0) {
              // Transform mining orders to user stakings format
              const transformedStakings: UserStaking[] = ordersResult.data.slice(0, 10).map((order: {
                pool_id: number;
                amount: string;
                earnings: string;
                created_at: string;
              }) => ({
                poolId: order.pool_id.toString(),
                amount: Number.parseFloat(order.amount).toFixed(2),
                rewards: Number.parseFloat(order.earnings).toFixed(2),
                startDate: new Date(order.created_at).toISOString().split('T')[0],
                endDate: new Date(new Date(order.created_at).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              }));
              
              setUserStakingsData(transformedStakings);
            } else {
              // 没有质押记录
              setUserStakingsData([]);
            }
          } catch (userError) {
            console.error('Error loading user staking data:', userError);
            setUserStakingsData([]);
          }
        } else {
          // 钱包未连接时清空用户数据
          setUserStakingsData([]);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to default USDT pool
        setPoolsData([{
          id: 'usdt-bsc',
          name: 'USDT (BSC)',
          symbol: 'USDT',
          apy: 12.5,
          totalStaked: '2,580,000',
          minStake: '10',
          lockPeriod: '30 days',
          status: 'active',
          featured: true
        }]);
        
        // 错误时不显示用户数据
        setUserStakingsData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    fetchExchangeRate(); // 获取实时汇率
  }, [isConnected, account]); // 依赖钱包连接状态

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'ended':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'coming':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // 处理连接钱包
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // 处理verify - 直接verifyUSDT，不需要指定池子
  const handleApprove = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      setIsApproving(true);
      console.log('Approving USDT for staking contract...');
      
      // 这里应该调用实际的合约verify方法
      // 使用最大verify金额，避免用户需要多次verify
      // const tx = await usdtContract.approve(stakingContractAddress, maxAmount);
      // await tx.wait();
      
      // 模拟verify延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 设置所有池子为已verify状态
      const allPoolIds = poolsData.map(pool => pool.id);
      const approvedState = allPoolIds.reduce((acc, poolId) => {
        acc[poolId] = true;
        return acc;
      }, {} as {[key: string]: boolean});
      
      setIsApproved(approvedState);
      
      console.log('USDT approval successful');
      alert('USDTverify成功！现在可以开始质押了');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('verify失败，请重试');
    } finally {
      setIsApproving(false);
    }
  };

  // 处理质押
  const handleStake = async (poolId: string) => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) < 10) {
      alert('最少质押金额为10 USDT');
      return;
    }

    try {
      setIsStaking(true);
      console.log(`Staking ${stakeAmount} USDT...`);
      
      // 这里应该调用实际的质押合约方法
      // const tx = await stakingContract.stake(parseFloat(stakeAmount));
      // await tx.wait();
      
      // 模拟质押延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 重新加载用户数据
      const ordersResponse = await fetch(`/api/supabase/mining-orders?address=${account}`);
      const ordersResult = await ordersResponse.json();
      
      if (ordersResult.success && ordersResult.data) {
        const transformedStakings: UserStaking[] = ordersResult.data.slice(0, 10).map((order: {
          pool_id: number;
          amount: string;
          earnings: string;
          created_at: string;
        }) => ({
          poolId: order.pool_id.toString(),
          amount: Number.parseFloat(order.amount).toFixed(2),
          rewards: Number.parseFloat(order.earnings).toFixed(2),
          startDate: new Date(order.created_at).toISOString().split('T')[0],
          endDate: new Date(new Date(order.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }));
        
        setUserStakingsData(transformedStakings);
      }
      
      // 清空输入
      setStakeAmount('');
      setShowStakeInput(prev => ({ ...prev, [poolId]: false }));
      setIsApproved(prev => ({ ...prev, [poolId]: false }));
      
      console.log('Staking successful');
      alert('质押成功！');
    } catch (error) {
      console.error('Staking failed:', error);
      alert('质押失败，请重试');
    } finally {
      setIsStaking(false);
    }
  };

  // 兑换相关函数 - 只支持ETH兑换USDT
  const handleEthAmountChange = (value: string) => {
    setEthAmount(value);
    if (value && !isNaN(Number.parseFloat(value))) {
      const calculated = (Number.parseFloat(value) * exchangeRate).toFixed(2);
      setUsdtAmount(calculated);
    } else {
      setUsdtAmount('');
    }
  };

  const handleUsdtAmountChange = (value: string) => {
    setUsdtAmount(value);
    if (value && !isNaN(Number.parseFloat(value))) {
      const calculated = (Number.parseFloat(value) / exchangeRate).toFixed(6);
      setEthAmount(calculated);
    } else {
      setEthAmount('');
    }
  };

  const [isEthOnTop, setIsEthOnTop] = useState(true);

  const handleSwapCurrencies = () => {
    setIsEthOnTop(!isEthOnTop);
  };

  // 处理兑换操作
  const handleExchange = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    if (!ethAmount || Number.parseFloat(ethAmount) <= 0) {
      alert('请输入有效的兑换金额');
      return;
    }

    try {
      setIsStaking(true); // 使用isStaking作为loading状态
      console.log(`兑换 ${ethAmount} ETH -> ${usdtAmount} USDT`);

      const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          from: 'ETH',
          to: 'USDT',
          amount: Number.parseFloat(ethAmount)
        })
      });

      const data = await response.json();
      
      console.log('🔍 兑换API响应:', {
        success: data.success,
        error: data.error,
        data: data.data,
        status: response.status
      });

      if (data.success) {
        alert(`兑换成功！获得 ${data.data.exchange.toAmount.toFixed(2)} USDT`);
        setEthAmount('');
        setUsdtAmount('');
        
        // 优雅地更新余额，而不是刷新整个页面
        if (onExchangeSuccess) {
          onExchangeSuccess();
        }
      } else {
        console.error('❌ 兑换失败详情:', {
          error: data.error,
          status: response.status,
          response: data
        });
        alert(`兑换失败: ${data.error || '未知错误'}`);
      }
    } catch (error: unknown) {
      console.error('兑换失败:', error);
      const errorMessage = error instanceof Error ? error.message : '网络错误';
      alert(`兑换失败: ${errorMessage}`);
    } finally {
      setIsStaking(false);
    }
  };

  // 全部兑换
  const handleExchangeAll = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    try {
      // 获取用户ETH余额
      const response = await fetch(`/api/user/info?address=${account}`);
      const data = await response.json();

      if (data.success && data.data && data.data.eth) {
        const ethBalance = Number.parseFloat(data.data.eth);
        if (ethBalance > 0) {
          // 限制最多7位小数
          const formattedBalance = ethBalance.toFixed(7).replace(/\.?0+$/, '');
          setEthAmount(formattedBalance);
          handleEthAmountChange(formattedBalance);
        } else {
          alert('ETH余额不足');
        }
      } else {
        alert('无法获取ETH余额');
      }
    } catch (error) {
      console.error('获取余额失败:', error);
      alert('获取余额失败');
    }
  };


  return (
    <div className="space-y-6">
      {/* 兑换卡片 */}
      <div className="relative rounded-xl p-6" style={{ backgroundColor: '#0A0A0A' }}>
        <EthUsdtSwapCard
          ethAmount={ethAmount}
          usdtAmount={usdtAmount}
          exchangeRate={exchangeRate}
          onEthAmountChange={handleEthAmountChange}
          onUsdtAmountChange={handleUsdtAmountChange}
          onSwap={handleExchange}
          onSwapPosition={handleSwapCurrencies}
          isEthOnTop={isEthOnTop}
          isLoading={isStaking}
          userEthBalance={userEthBalance}
          onExchangeAll={handleExchangeAll}
        />
      </div>
    </div>
  );
};

export default BinanceLiquidityStaking;
