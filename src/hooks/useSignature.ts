import { useState, useCallback } from 'react';
import { createSignatureClient, type SignatureResponse, type SignatureVerifyResponse } from '@/lib/signature-client';
import type { WithdrawRequest } from '@/lib/signature-service';
import { useToast } from './use-toast';

export interface UseSignatureOptions {
  apiKey?: string;
  onSuccess?: (data: SignatureResponse) => void;
  onError?: (error: Error) => void;
}

export function useSignature(options: UseSignatureOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SignatureResponse | null>(null);
  const [verifyResult, setVerifyResult] = useState<SignatureVerifyResponse | null>(null);
  
  const { toast } = useToast();
  
  // 创建签名客户端
  const signatureClient = createSignatureClient(options.apiKey);
  
  // 请求签名
  const requestSignature = useCallback(async (
    request: Omit<WithdrawRequest, 'timestamp'>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await signatureClient.requestSignature(request);
      
      if (!response.success) {
        throw new Error(response.error || '签名请求失败');
      }
      
      setData(response);
      options.onSuccess?.(response);
      return response;
    } catch (err: any) {
      setError(err);
      options.onError?.(err);
      toast({
        title: '签名请求失败',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signatureClient, options, toast]);
  
  // 验证签名
  const verifySignature = useCallback(async (
    request: WithdrawRequest,
    signature: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await signatureClient.verifySignature(request, signature);
      
      if (!response.success) {
        throw new Error(response.error || '签名验证失败');
      }
      
      setVerifyResult(response);
      return response;
    } catch (err: any) {
      setError(err);
      toast({
        title: '签名验证失败',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signatureClient, toast]);
  
  // 使用签名执行合约提款
  const executeWithdraw = useCallback(async (
    contract: any,
    request: WithdrawRequest,
    signature: string
  ) => {
    if (!contract) {
      throw new Error('合约未初始化');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 调用合约的withdraw方法
      const tx = await contract.withdraw(
        request.id,
        request.currencyId,
        request.amount,
        request.timestamp,
        signature
      );
      
      // 等待交易确认
      const receipt = await tx.wait();
      
      toast({
        title: '提款成功',
        description: `交易哈希: ${receipt.transactionHash}`,
      });
      
      return receipt;
    } catch (err: any) {
      setError(err);
      toast({
        title: '提款失败',
        description: err.message,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  return {
    loading,
    error,
    data,
    verifyResult,
    requestSignature,
    verifySignature,
    executeWithdraw
  };
} 