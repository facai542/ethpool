'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface WithdrawFormProps {
  userAddress: string;
  withdrawableBalance?: string;
}

export function WithdrawForm({ userAddress, withdrawableBalance = '0' }: WithdrawFormProps) {
  const { toast } = useToast();
  const [withdrawId, setWithdrawId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawId || !amount) {
      toast({
        title: '输入错误',
        description: '请填写提款ID和金额',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // 这里应该调用实际的提款API
      console.log('提款请求:', { withdrawId, amount, userAddress });
      
      toast({
        title: '提款请求已提交',
        description: '请等待系统处理您的提款请求',
      });
      
    } catch (error) {
      console.error('提款失败:', error);
      toast({
        title: '提款失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>提款申请</CardTitle>
        <CardDescription>输入您的提款信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="withdrawId">提款ID</Label>
          <Input
            id="withdrawId"
            value={withdrawId}
            onChange={(e) => setWithdrawId(e.target.value)}
            placeholder="请输入提款ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amount">提款金额 (USDT)</Label>
          <div className="space-y-2">
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入提款金额"
              max={withdrawableBalance}
            />
            <div className="text-sm text-muted-foreground">
              可提现余额: <span className="text-green-400 font-semibold">{withdrawableBalance} USDT</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? '处理中...' : '提交提款申请'}
        </Button>
      </CardContent>
    </Card>
  );
}
