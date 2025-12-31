'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createSignatureClient } from '@/lib/signature-client';
import type { WithdrawRequest } from '@/lib/signature-service';
import { ethers } from 'ethers';

export default function SignatureManagementPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 生成签名表单状态
  const [userAddress, setUserAddress] = useState('');
  const [withdrawId, setWithdrawId] = useState('');
  const [currencyId, setCurrencyId] = useState('0');
  const [amount, setAmount] = useState('');
  const [signature, setSignature] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [requestData, setRequestData] = useState<WithdrawRequest | null>(null);
  
  // 验证签名表单状态
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyResult, setVerifyResult] = useState<{ isValid: boolean } | null>(null);
  
  // 创建签名客户端
  const signatureClient = createSignatureClient(apiKey);
  
  // 生成签名
  const handleGenerateSignature = async () => {
    if (!userAddress || !withdrawId || !amount) {
      toast({
        title: '请填写所有必填字段',
        variant: 'destructive'
      });
      return;
    }
    
    if (!ethers.isAddress(userAddress)) {
      toast({
        title: '无效的用户地址',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const request = {
        user: userAddress,
        id: Number.parseInt(withdrawId),
        currencyId: Number.parseInt(currencyId),
        amount: amount,
      };
      
      const response = await signatureClient.requestSignature(request);
      
      if (!response.success) {
        throw new Error(response.error || '签名生成失败');
      }
      
      setSignature(response.signature);
      setRequestData(response.request);
      setTimestamp(response.request.timestamp.toString());
      
      toast({
        title: '签名生成成功',
        description: '签名已生成并可用于提款',
      });
    } catch (error) {
      toast({
        title: '签名生成失败',
        description: error instanceof Error ? error.message : "未知错误",
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 验证签名
  const handleVerifySignature = async () => {
    if (!requestData || !verifySignature) {
      toast({
        title: '请先生成签名或填写验证签名',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await signatureClient.verifySignature(
        requestData,
        verifySignature
      );
      
      setVerifyResult(response);
      
      toast({
        title: '签名验证结果',
        description: response.isValid ? '签名有效' : '签名无效',
        variant: response.isValid ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: '签名验证失败',
        description: error instanceof Error ? error.message : "未知错误",
        variant: 'destructive'
      });
      setVerifyResult(null);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">签名服务管理</h1>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>API密钥配置</CardTitle>
            <CardDescription>设置用于访问签名服务的API密钥</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入API密钥"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="generate">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">生成签名</TabsTrigger>
          <TabsTrigger value="verify">验证签名</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>生成提款签名</CardTitle>
              <CardDescription>为用户提款请求生成签名</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="userAddress">用户地址</Label>
                  <Input
                    id="userAddress"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="withdrawId">提款ID</Label>
                    <Input
                      id="withdrawId"
                      type="number"
                      value={withdrawId}
                      onChange={(e) => setWithdrawId(e.target.value)}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="currencyId">货币ID</Label>
                    <Input
                      id="currencyId"
                      type="number"
                      value={currencyId}
                      onChange={(e) => setCurrencyId(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="amount">金额</Label>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.01"
                  />
                </div>
                
                {signature && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="timestamp">时间戳</Label>
                      <Input
                        id="timestamp"
                        value={timestamp}
                        readOnly
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="signature">生成的签名</Label>
                      <Textarea
                        id="signature"
                        value={signature}
                        readOnly
                        className="h-24 font-mono text-xs"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateSignature} 
                disabled={loading || !apiKey}
              >
                {loading ? '处理中...' : '生成签名'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>验证签名</CardTitle>
              <CardDescription>验证提款签名是否有效</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="verifySignature">签名</Label>
                  <Textarea
                    id="verifySignature"
                    value={verifySignature}
                    onChange={(e) => setVerifySignature(e.target.value)}
                    placeholder="0x..."
                    className="h-24 font-mono text-xs"
                  />
                </div>
                
                {verifyResult !== null && (
                  <div className={`p-4 rounded-md ${verifyResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="font-medium">
                      {verifyResult.isValid ? '✅ 签名有效' : '❌ 签名无效'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleVerifySignature} 
                disabled={loading || !requestData || !verifySignature}
              >
                {loading ? '验证中...' : '验证签名'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 