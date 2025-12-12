import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
import { CurrencySelect } from '@/components/ui/currency-select';
import GradientButton from '@/components/ui/gradient-button';
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
import styled, { createGlobalStyle } from 'styled-components';

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
`;

const GlobalSelectStyles = createGlobalStyle`
  [data-radix-select-content],
  [data-radix-select-content][data-state="open"],
  [data-radix-select-content][data-state="closed"],
  [data-radix-select-content][data-state="open"].animate-in,
  [data-radix-select-content][data-state="closed"].animate-out,
  [data-radix-select-content].slide-in-from-top-2,
  [data-radix-select-content].slide-in-from-bottom-2,
  [data-radix-select-content].slide-in-from-left-2,
  [data-radix-select-content].slide-in-from-right-2,
  [data-radix-select-content].fade-in-0,
  [data-radix-select-content].fade-out-0,
  [data-radix-select-content].zoom-in-95,
  [data-radix-select-content].zoom-out-95,
  [data-radix-select-content][data-side="bottom"],
  [data-radix-select-content][data-side="top"],
  [data-radix-select-content][data-side="left"],
  [data-radix-select-content][data-side="right"] {
    animation: none !important;
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
    will-change: auto !important;
  }
  [data-radix-select-content] *,
  [data-radix-select-content] *::before,
  [data-radix-select-content] *::after {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  /* 覆盖 Tailwind 动画类 */
  .animate-in,
  .animate-out,
  .fade-in-0,
  .fade-out-0,
  .zoom-in-95,
  .zoom-out-95,
  .slide-in-from-top-2,
  .slide-in-from-bottom-2,
  .slide-in-from-left-2,
  .slide-in-from-right-2 {
    animation: none !important;
    transition: none !important;
  }
  [data-radix-select-content] .animate-in,
  [data-radix-select-content] .animate-out,
  [data-radix-select-content] .fade-in-0,
  [data-radix-select-content] .fade-out-0,
  [data-radix-select-content] .zoom-in-95,
  [data-radix-select-content] .zoom-out-95,
  [data-radix-select-content] .slide-in-from-top-2,
  [data-radix-select-content] .slide-in-from-bottom-2 {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
`;

const StyledBookmarkButton = styled.button`
  width: 56px;
  height: 28px;
  border-radius: 14px;
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
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 1;
    font-size: 0.75em;
  }
`;

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
  const [fromCurrency, setFromCurrency] = useState('ETH');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(4480.37);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [balances, setBalances] = useState<{ [key: string]: number }>({
    ETH: 0,
    USDT: 0,
    USDC: 0
  });
  
  // 支持的币种
  const currencies = ['USDT', 'ETH', 'USDC'];
  
  // 动态移除SelectContent动画
  useEffect(() => {
    const removeAnimations = () => {
      const selectContents = document.querySelectorAll('[data-radix-select-content]');
      selectContents.forEach((content) => {
        const element = content as HTMLElement;
        element.style.animation = 'none';
        element.style.transition = 'none';
        element.style.transform = 'none';
        element.style.opacity = '1';
        element.style.willChange = 'auto';
        
        // 移除所有动画相关的类
        element.classList.remove('animate-in', 'animate-out', 'fade-in-0', 'fade-out-0', 
          'zoom-in-95', 'zoom-out-95', 'slide-in-from-top-2', 'slide-in-from-bottom-2',
          'slide-in-from-left-2', 'slide-in-from-right-2');
      });
    };

    // 初始移除
    removeAnimations();

    // 使用MutationObserver监听DOM变化
    const observer = new MutationObserver(() => {
      removeAnimations();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-state']
    });

    return () => observer.disconnect();
  }, []);

  // 币种图标映射
  const currencyIcons: { [key: string]: string } = {
    'USDT': 'https://h5.bosss.club/static/img/crypto/USDT.svg?v=3.9.4',
    'ETH': 'https://h5.bosss.club/static/img/crypto/ETH.svg?v=3.9.4',
    'USDC': 'https://h5.bosss.club/static/img/crypto/USDC.svg?v=3.9.4'
  };

  // 币种选项（用于自定义下拉菜单）
  const currencyOptions = currencies.map(currency => ({
    value: currency,
    label: currency,
    icon: currencyIcons[currency] || '/2.png'
  }));
  
  // 质押状态管理
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState<{[key: string]: boolean}>({});
  const [isStaking, setIsStaking] = useState(false);
  const [showStakeInput, setShowStakeInput] = useState<{[key: string]: boolean}>({});

  // 获取实时汇率
  const fetchExchangeRate = useCallback(async () => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return;
    
    try {
      setIsLoadingRate(true);
      const response = await fetch(`/api/exchange?from=${fromCurrency}&to=${toCurrency}&amount=1`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      
      if (data.success && data.data.rate) {
        setExchangeRate(data.data.rate);
        console.log(`✅ 实时汇率获取成功: 1${fromCurrency} = ${data.data.rate}${toCurrency}`);
      } else {
        console.warn('⚠️ 获取汇率失败，使用默认汇率');
        // 设置默认汇率（如果 API 失败）
        if (fromCurrency === 'ETH' && toCurrency === 'USDT') {
          setExchangeRate(4480.37);
        } else if (fromCurrency === 'USDT' && toCurrency === 'ETH') {
          setExchangeRate(1 / 4480.37);
        } else {
          setExchangeRate(1); // 其他币种对默认 1:1
        }
      }
    } catch (error) {
      console.error('❌ 获取汇率失败:', error);
      // 设置默认汇率
      if (fromCurrency === 'ETH' && toCurrency === 'USDT') {
        setExchangeRate(4480.37);
      } else if (fromCurrency === 'USDT' && toCurrency === 'ETH') {
        setExchangeRate(1 / 4480.37);
      } else {
        setExchangeRate(1);
      }
    } finally {
      setIsLoadingRate(false);
    }
  }, [fromCurrency, toCurrency]);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load mining pools from database (公开数据)
        const poolsResponse = await fetch('/api/supabase/mining-pools');
        if (!poolsResponse.ok) {
          // 尝试解析错误响应
          let errorMessage = `HTTP error! status: ${poolsResponse.status}`;
          try {
            const errorData = await poolsResponse.json();
            if (errorData.error) {
              errorMessage = errorData.error;
              if (errorData.details) {
                console.error('API错误详情:', errorData.details);
              }
            }
          } catch (e) {
            // 如果无法解析JSON，使用默认错误消息
          }
          throw new Error(errorMessage);
        }
        const poolsContentType = poolsResponse.headers.get('content-type');
        if (!poolsContentType || !poolsContentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const poolsResult = await poolsResponse.json();
        
        // 检查API返回的成功状态
        if (!poolsResult.success) {
          console.error('API返回失败:', poolsResult.error || '未知错误');
          throw new Error(poolsResult.error || '获取挖矿池数据失败');
        }
        
        // 如果API返回了数据，使用数据库中的数据
        // 否则使用默认的USDT池
        if (poolsResult.data && poolsResult.data.length > 0) {
          // 转换数据库格式到组件需要的格式
          const transformedPools: StakingPool[] = poolsResult.data.map((pool: any) => ({
            id: `pool-${pool.id}`,
            name: pool.name || `${pool.symbol || 'USDT'} Pool`,
            symbol: pool.symbol || 'USDT',
            apy: Number.parseFloat(pool.reward_rate || pool.apy || '12.5') * 100, // 转换为百分比
            totalStaked: pool.total_staked ? Number.parseFloat(pool.total_staked).toLocaleString() : '2,580,000',
            minStake: pool.min_amount ? Number.parseFloat(pool.min_amount).toString() : '10',
            lockPeriod: pool.lock_period || '30 days',
            status: pool.status === 1 ? 'active' : 'inactive',
            featured: pool.featured === true || pool.id === 1
          }));
          setPoolsData(transformedPools);
        } else {
          // 如果没有数据，使用默认USDT池
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
        }
        
        // 只有钱包连接时才加载用户质押数据
        if (isConnected && account) {
          try {
            const ordersResponse = await fetch(`/api/supabase/mining-orders?address=${account}`);
            if (!ordersResponse.ok) {
              throw new Error(`HTTP error! status: ${ordersResponse.status}`);
            }
            const ordersContentType = ordersResponse.headers.get('content-type');
            if (!ordersContentType || !ordersContentType.includes('application/json')) {
              throw new Error('Response is not JSON');
            }
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
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('加载数据时出错:', {
          message: errorMessage,
          error: error,
          stack: error instanceof Error ? error.stack : undefined
        });
        
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
  }, [isConnected, account]); // 依赖钱包连接状态
  
  // 当币种对改变时，重新获取汇率
  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency, fetchExchangeRate]);

  // 获取用户余额
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !account) {
        setBalances({ ETH: 0, USDT: 0, USDC: 0 });
        return;
      }

      try {
        const response = await fetch(`/api/user/info?address=${account}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await response.json();

        if (data.success && data.data) {
          setBalances({
            ETH: Number.parseFloat(data.data.eth || '0'),
            USDT: Number.parseFloat(data.data.usdt || '0'),
            USDC: Number.parseFloat(data.data.usdc || data.data.usdt || '0')
          });
        }
      } catch (error) {
        console.error('获取余额失败:', error);
      }
    };

    fetchBalances();
  }, [isConnected, account]);

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
      if (!ordersResponse.ok) {
        throw new Error(`HTTP error! status: ${ordersResponse.status}`);
      }
      const ordersContentType = ordersResponse.headers.get('content-type');
      if (!ordersContentType || !ordersContentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
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

  // 兑换相关函数 - 支持多种币种
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(Number.parseFloat(value))) {
      const calculated = (Number.parseFloat(value) * exchangeRate).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(Number.parseFloat(value))) {
      const calculated = (Number.parseFloat(value) / exchangeRate).toFixed(6);
      setFromAmount(calculated);
    } else {
      setFromAmount('');
    }
  };

  const handleSwapCurrencies = () => {
    const tempFrom = fromCurrency;
    const tempTo = toCurrency;
    const tempFromAmount = fromAmount;
    const tempToAmount = toAmount;
    
    setFromCurrency(tempTo);
    setToCurrency(tempFrom);
    setFromAmount(tempToAmount);
    setToAmount(tempFromAmount);
  };
  
  // 处理币种选择
  const handleFromCurrencyChange = (currency: string) => {
    if (currency === toCurrency) {
      // 如果选择的币种和目标币种相同，交换它们
      setToCurrency(fromCurrency);
    }
    setFromCurrency(currency);
    setFromAmount('');
    setToAmount('');
  };
  
  const handleToCurrencyChange = (currency: string) => {
    if (currency === fromCurrency) {
      // 如果选择的币种和源币种相同，交换它们
      setFromCurrency(toCurrency);
    }
    setToCurrency(currency);
    setFromAmount('');
    setToAmount('');
  };

  // 处理兑换操作
  const handleExchange = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) {
      alert('请输入有效的兑换金额');
      return;
    }
    
    if (fromCurrency === toCurrency) {
      alert('请选择不同的币种进行兑换');
      return;
    }

    try {
      setIsStaking(true); // 使用isStaking作为loading状态
      console.log(`兑换 ${fromAmount} ${fromCurrency} -> ${toAmount} ${toCurrency}`);

      const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: account,
          from: fromCurrency,
          to: toCurrency,
          amount: Number.parseFloat(fromAmount)
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();
      
      console.log('🔍 兑换API响应:', {
        success: data.success,
        error: data.error,
        data: data.data,
        status: response.status
      });

      if (data.success) {
        alert(`兑换成功！获得 ${data.data.exchange.toAmount.toFixed(6)} ${toCurrency}`);
        setFromAmount('');
        setToAmount('');
        
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
      // 获取用户余额
      const response = await fetch(`/api/user/info?address=${account}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await response.json();

      if (data.success && data.data) {
        let balance = 0;
        const currencyKey = fromCurrency.toLowerCase();
        
        // 根据币种获取对应的余额字段
        if (currencyKey === 'eth') {
          balance = Number.parseFloat(data.data.eth || '0');
        } else if (currencyKey === 'usdt') {
          balance = Number.parseFloat(data.data.usdt || '0');
        } else if (currencyKey === 'usdc') {
          balance = Number.parseFloat(data.data.usdc || data.data.usdt || '0'); // USDC 可能使用 USDT 字段
        }
        
        if (balance > 0) {
          // 限制最多7位小数
          const formattedBalance = balance.toFixed(7).replace(/\.?0+$/, '');
          setFromAmount(formattedBalance);
          handleFromAmountChange(formattedBalance);
        } else {
          alert(`${fromCurrency} 余额不足`);
        }
      } else {
        alert(`无法获取${fromCurrency}余额`);
      }
    } catch (error) {
      console.error('获取余额失败:', error);
      alert('获取余额失败');
    }
  };


  return (
    <>
      <GlobalSelectStyles />
      <div className="space-y-6">
      {/* 兑换卡片 */}
      <StyledStatsCard>
        <div className="bgblue">
          <div className="card-wrapper">
            <div className="space-y-4">
              {/* 源币种输入框 */}
              <div className="bg-[#1a1a1a] border border-gray-600 rounded-2xl p-4 overflow-visible">
                <div className="flex items-start justify-between gap-4">
                  {/* 左侧：金额和美元价值 */}
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="bg-transparent text-[#bec4cf] outline-none w-full font-bold text-3xl mb-1" 
                    />
                    <div className="text-[#bec4cf] text-sm opacity-70">
                      ${(Number.parseFloat(fromAmount || '0') * (fromCurrency === 'ETH' ? exchangeRate : 1)).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* 右侧：货币选择器和余额 */}
                  <div className="flex flex-col items-end gap-2">
                    <CurrencySelect
                      value={fromCurrency}
                      onChange={handleFromCurrencyChange}
                      options={currencyOptions}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[#bec4cf] text-xs opacity-70">
                        {balances[fromCurrency as keyof typeof balances]?.toFixed(8) || '0.00'} {fromCurrency}
                      </span>
                      <StyledBookmarkButton onClick={handleExchangeAll}>
                        <div className="IconContainer">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                        </div>
                        <div className="text">全部</div>
                      </StyledBookmarkButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* 交换按钮 */}
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={handleSwapCurrencies}
                  className="bg-[#1a1a1a] border border-gray-600 rounded-full p-2 hover:bg-gray-700 transition-colors"
                  title="Swap Currencies"
                >
                  <RouteIcon 
                    size={24} 
                    className="text-[#bec4cf]"
                  />
                </button>
              </div>

              {/* 目标币种输入框 */}
              <div className="bg-[#1a1a1a] border border-gray-600 rounded-2xl p-4 overflow-visible">
                <div className="flex items-start justify-between gap-4">
                  {/* 左侧：金额和价格影响 */}
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      className="bg-transparent text-[#bec4cf] outline-none w-full font-bold text-3xl mb-1" 
                    />
                    <div className="text-[#bec4cf] text-sm opacity-70">
                      ${(Number.parseFloat(toAmount || '0') * (toCurrency === 'ETH' ? exchangeRate : 1)).toFixed(2)} 价格影响%
                    </div>
                  </div>
                  
                  {/* 右侧：货币选择器和余额 */}
                  <div className="flex flex-col items-end gap-2">
                    <CurrencySelect
                      value={toCurrency}
                      onChange={handleToCurrencyChange}
                      options={currencyOptions}
                    />
                    <div className="text-[#bec4cf] text-xs opacity-70">
                      {balances[toCurrency as keyof typeof balances]?.toFixed(8) || '0.00'} {toCurrency}
                    </div>
                  </div>
                </div>
              </div>

              {/* 兑换按钮 */}
              <GradientButton 
                disabled={!fromAmount || !toAmount || fromCurrency === toCurrency || isStaking}
                onClick={handleExchange}
              >
                {isStaking ? (t.processing || '处理中...') : (t.trade || '交易')}
              </GradientButton>
            </div>
          </div>
        </div>
      </StyledStatsCard>
    </div>
    </>
  );
};

export default BinanceLiquidityStaking;
