import { ethers } from 'ethers';
import { env } from './env';

// 签名服务配置类型
export interface SignatureConfig {
  privateKey: string;
  networkProvider?: string;
}

// 提款请求类型
export interface WithdrawRequest {
  user: string;       // 用户地址
  id: number;         // 提款ID
  currencyId: number; // 货币ID
  amount: string;     // 提款金额 (使用字符串以避免精度问题)
  timestamp: number;  // 时间戳
}

export class SignatureService {
  private signer: ethers.Wallet;
  
  constructor(config: SignatureConfig) {
    // 创建provider
    const provider = config.networkProvider 
      ? new ethers.JsonRpcProvider(config.networkProvider)
      : null;
    
    // 使用私钥创建钱包实例
    this.signer = provider 
      ? new ethers.Wallet(config.privateKey, provider)
      : new ethers.Wallet(config.privateKey);
  }

  /**
   * 为提款请求生成签名
   * @param request 提款请求数据
   * @returns 签名结果
   */
  async signWithdrawRequest(request: WithdrawRequest): Promise<{
    signature: string;
    request: WithdrawRequest;
  }> {
    try {
      // 验证地址格式
      if (!ethers.isAddress(request.user)) {
        throw new Error('无效的用户地址');
      }

      // 确保金额为字符串
      const amount = ethers.parseUnits(
        request.amount,
        18 // USDT在BSC上是18位小数
      );

      // 构建消息哈希
      // 根据合约中的Signer函数实现: abi.encodePacked(_user, _id, _cid, _amount, _timestamp)
      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [request.user, request.id, request.currencyId, amount, request.timestamp]
      );

      // 签名消息
      const signature = await this.signer.signMessage(ethers.getBytes(messageHash));
      
      return {
        signature,
        request
      };
    } catch (error) {
      console.error('签名生成失败:', error);
      throw error;
    }
  }

  /**
   * 验证签名是否有效
   * @param request 提款请求数据
   * @param signature 签名
   * @returns 签名是否有效
   */
  async verifySignature(request: WithdrawRequest, signature: string): Promise<boolean> {
    try {
      // 构建消息哈希
      const amount = ethers.parseUnits(
        request.amount,
        18
      );

      const messageHash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
        [request.user, request.id, request.currencyId, amount, request.timestamp]
      );

      // 从签名恢复地址
      const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      
      // 获取签名者地址
      const signerAddress = await this.signer.getAddress();
      
      // 比较恢复的地址与签名者地址
      return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
    } catch (error) {
      console.error('签名验证失败:', error);
      return false;
    }
  }
}

// 创建默认的签名服务实例
export const createSignatureService = () => {
  // 从环境变量获取私钥
  const privateKey = env.SIGNATURE_PRIVATE_KEY || '';
  
  if (!privateKey) {
    throw new Error('未配置签名私钥，请在环境变量中设置 SIGNATURE_PRIVATE_KEY');
  }
  
  return new SignatureService({
    privateKey,
    networkProvider: env.BSC_RPC_URL
  });
}; 