import { env } from './env';
import type { WithdrawRequest } from './signature-service';

export interface SignatureResponse {
  success: boolean;
  signature: string;
  request: WithdrawRequest;
  error?: string;
}

export interface SignatureVerifyResponse {
  success: boolean;
  isValid: boolean;
  error?: string;
}

export class SignatureClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || env.API_BASE_URL;
  }

  /**
   * 请求服务器为提款请求生成签名
   * @param request 提款请求数据
   * @returns 签名响应
   */
  async requestSignature(request: Omit<WithdrawRequest, 'timestamp'>): Promise<SignatureResponse> {
    try {
      const response = await fetch(`${this.baseUrl}api/signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(request)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '签名请求失败');
      }

      return data;
    } catch (error) {
      console.error('签名请求错误:', error);
      return {
        success: false,
        signature: '',
        request: { ...request, timestamp: 0 } as WithdrawRequest,
        error: error instanceof Error ? error.message : "未知错误"
      };
    }
  }

  /**
   * 验证签名是否有效
   * @param request 提款请求数据
   * @param signature 签名
   * @returns 验证响应
   */
  async verifySignature(
    request: WithdrawRequest,
    signature: string
  ): Promise<SignatureVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}api/signature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          signature
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '签名验证失败');
      }

      return data;
    } catch (error) {
      console.error('签名验证错误:', error);
      return {
        success: false,
        isValid: false,
        error: error instanceof Error ? error.message : "未知错误"
      };
    }
  }
}

// 创建默认的签名客户端实例
export const createSignatureClient = (apiKey?: string) => {
  return new SignatureClient({
    apiKey,
    baseUrl: env.API_BASE_URL
  });
}; 