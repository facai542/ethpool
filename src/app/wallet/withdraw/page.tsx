'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WithdrawForm } from '@/components/WithdrawForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Staking } from '@/hooks/useWeb3Staking';
import { CURRENT_NETWORK } from '@/lib/contracts';
import { api } from '@/lib/api';

export default function WithdrawPage() {
  const { toast } = useToast();
  const { account, isConnected, connect } = useWallet();
  const { switchToSupportedNetwork, usdtBalance, refetchUsdtBalance } = useWeb3Staking();
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [withdrawableBalance, setWithdrawableBalance] = useState('0');

  // 自动连接钱包 - 页面加载时自动尝试连接
  useEffect(() => {
    const autoConnectWallet = async () => {
      // 如果已经连接，直接返回
      if (isConnected && account) {
        console.log('🔗 钱包已连接:', account);
        return;
      }

      // 检查是否有之前的连接状态
      const wasConnected = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_connected') === 'true';
      const savedAddress = typeof window !== 'undefined' && 
        localStorage.getItem('wallet_address');

      if (wasConnected && savedAddress && !isConnected && connect) {
        console.log('🔄 检测到之前的连接状态，尝试自动恢复连接...', {
          address: savedAddress,
          wasConnected
        });
        
        try {
          // 延迟一点时间确保Web3组件完全加载
          setTimeout(async () => {
            try {
              await connect();
              console.log('✅ 自动恢复钱包连接成功');
            } catch (error) {
              console.log('⚠️ 自动恢复钱包连接失败，用户需要手动连接:', error);
            }
          }, 1500); // 增加延迟时间确保Wagmi完全初始化
        } catch (error) {
          console.log('⚠️ 自动恢复钱包连接失败:', error);
        }
      } else if (!isConnected && connect) {
        console.log('🚀 尝试自动连接钱包...');
        try {
          // 延迟一点时间确保Web3组件完全加载
          setTimeout(async () => {
            try {
              await connect();
              console.log('✅ 自动钱包连接成功');
            } catch (error) {
              console.log('⚠️ 自动钱包连接失败，用户需要手动连接:', error);
            }
          }, 1000);
        } catch (error) {
          console.log('⚠️ 自动钱包连接失败:', error);
        }
      }
    };

    autoConnectWallet();
  }, [isConnected, account, connect]);

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!account) return;
    
    try {
      const response = await api.fetchUserInfo(account);
      if (response.success) {
        setUserInfo(response.data);
        setWithdrawableBalance(response.data.withdrawable_usdt || '0');
        console.log('✅ 获取用户信息成功:', response.data);
      }
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
    }
  };

  // 初始化页面
  useEffect(() => {
    const initPage = async () => {
      if (isConnected && account) {
        try {
          setIsLoading(true);
          await switchToBSC();
          await refetchUsdtBalance();
          await fetchUserInfo(); // 获取用户可提现余额
        } catch (error: unknown) {
          console.error('初始化页面失败:', error);
          toast({
            title: '初始化失败',
            description: error instanceof Error ? error.message : '未知错误',
            variant: 'destructive'
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    initPage();
  }, [isConnected, account, switchToBSC, refetchUsdtBalance, toast]);

  // 连接钱包
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true);
      await connect();
    } catch (error: unknown) {
      toast({
        title: '连接钱包失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">提款</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>连接钱包</CardTitle>
            <CardDescription>请先连接您的钱包以继续</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              onClick={handleConnectWallet} 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? '连接中...' : '连接钱包'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
                <CardDescription>您的钱包和余额信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">钱包地址</p>
                    <p className="font-mono text-sm break-all">{account}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">链上 USDT 余额</p>
                    <p className="text-xl font-bold">{usdtBalance} USDT</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">可提现 USDT 余额</p>
                    <p className="text-xl font-bold text-green-400">{withdrawableBalance} USDT</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">网络</p>
                    <p className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                      {CURRENT_NETWORK.CHAIN_ID === 56 ? 'BSC 主网' : 'BSC 测试网'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>提款说明</CardTitle>
                <CardDescription>如何使用签名服务提取资金</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  <li>输入您的提款ID和金额</li>
                  <li>系统将生成签名验证您的提款请求</li>
                  <li>确认交易，资金将转入您的钱包</li>
                  <li>交易确认后，您可以在BSC浏览器查看详情</li>
                </ol>
              </CardContent>
            </Card>
          </div>
          
          <WithdrawForm userAddress={account || ''} withdrawableBalance={withdrawableBalance} />
        </div>
      )}
    </div>
  );
} 