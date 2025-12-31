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

const BinanceLiquidityStaking: React.FC = () => {
  const { t } = useI18n();
  const { account, isConnected, connect } = useWallet();
  
  // 兑换相关状态
  const [ethAmount, setEthAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [exchangeRate] = useState(4480.37); // ETH to USDT 汇率
  const [isEthToUsdt, setIsEthToUsdt] = useState(true); // true: ETH->USDT, false: USDT->ETH

  // 兑换相关函数
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

  const handleSwapCurrencies = () => {
    setIsEthToUsdt(!isEthToUsdt);
    // 交换输入框的值
    const tempEth = ethAmount;
    const tempUsdt = usdtAmount;
    setEthAmount(tempUsdt || '');
    setUsdtAmount(tempEth || '');
  };

  return (
    <div className="space-y-6">
      {/* 兑换内容 */}
      <div className="w-full">
        <div className="space-y-6">
          <div className="relative">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
            />
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center text-sm text-gray-400 mb-6">
                  兌換 1ETH={exchangeRate}USDT
                </div>
                
                <div className="space-y-4">
                  {/* 第一个币种输入框 */}
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <img 
                      src={isEthToUsdt ? "/1.png" : "/2.png"} 
                      alt={isEthToUsdt ? "ETH" : "USDT"} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-black text-sm font-medium">
                      {isEthToUsdt ? "ETH" : "USDT"}
                    </span>
                    <div className="ml-auto">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={isEthToUsdt ? ethAmount : usdtAmount}
                        onChange={(e) => isEthToUsdt ? handleEthAmountChange(e.target.value) : handleUsdtAmountChange(e.target.value)}
                        className="bg-transparent text-black text-right outline-none w-20 font-bold text-lg" 
                      />
                    </div>
                  </div>

                  {/* 交换图标 - 可点击 */}
                  <div className="flex justify-center">
                    <RouteIcon
                      onClick={handleSwapCurrencies}
                      className="cursor-pointer transform hover:scale-110 duration-200 text-yellow-400"
                      size={28}
                    />
                  </div>

                  {/* 第二个币种输入框 */}
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4">
                    <img 
                      src={isEthToUsdt ? "/2.png" : "/1.png"} 
                      alt={isEthToUsdt ? "USDT" : "ETH"} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-black text-sm font-medium">
                      {isEthToUsdt ? "USDT" : "ETH"}
                    </span>
                    <div className="ml-auto">
                      <input 
                        type="number" 
                        placeholder="0" 
                        value={isEthToUsdt ? usdtAmount : ethAmount}
                        onChange={(e) => isEthToUsdt ? handleUsdtAmountChange(e.target.value) : handleEthAmountChange(e.target.value)}
                        className="bg-transparent text-black text-right outline-none w-20 font-bold text-lg" 
                      />
                    </div>
                  </div>

                  {/* 兌換按钮 */}
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg font-bold"
                    disabled={!ethAmount && !usdtAmount}
                  >
                    兌換
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinanceLiquidityStaking;

