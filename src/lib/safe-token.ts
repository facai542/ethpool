import { ethers } from 'ethers'
import { SAFE_TOKEN_ABI, getSafeTokenAddress, getMaxApproveAmount } from './contracts'

// SafeToken交互类
export class SafeTokenService {
  private provider: any = null
  private signer: any = null
  private contract: any = null
  private address = ''

  constructor() {
    // 初始化时不立即连接，等待connect方法调用
    this.address = getSafeTokenAddress()
  }

  // 连接到Web3提供商
  public async connect(provider: any): Promise<boolean> {
    try {
      this.provider = new ethers.BrowserProvider(provider)
      this.signer = await this.provider.getSigner()
      this.contract = new ethers.Contract(this.address, SAFE_TOKEN_ABI, this.signer)
      return true
    } catch (error) {
      console.error('SafeToken连接失败:', error)
      return false
    }
  }

  // 获取代币名称
  public async getName(): Promise<string> {
    if (!this.contract) return ''
    try {
      return await this.contract.name()
    } catch (error) {
      console.error('获取代币名称失败:', error)
      return ''
    }
  }

  // 获取代币符号
  public async getSymbol(): Promise<string> {
    if (!this.contract) return ''
    try {
      return await this.contract.symbol()
    } catch (error) {
      console.error('获取代币符号失败:', error)
      return ''
    }
  }

  // 获取代币小数位数
  public async getDecimals(): Promise<number> {
    if (!this.contract) return 18
    try {
      return await this.contract.decimals()
    } catch (error) {
      console.error('获取代币小数位数失败:', error)
      return 18
    }
  }

  // 获取代币总供应量
  public async getTotalSupply(): Promise<string> {
    if (!this.contract) return '0'
    try {
      const totalSupply = await this.contract.totalSupply()
      const decimals = await this.getDecimals()
      return ethers.formatUnits(totalSupply, decimals)
    } catch (error) {
      console.error('获取代币总供应量失败:', error)
      return '0'
    }
  }

  // 获取账户余额
  public async getBalance(account: string): Promise<string> {
    if (!this.contract) return '0'
    try {
      const balance = await this.contract.balanceOf(account)
      const decimals = await this.getDecimals()
      return ethers.formatUnits(balance, decimals)
    } catch (error) {
      console.error('获取账户余额失败:', error)
      return '0'
    }
  }

  // 转账
  public async transfer(recipient: string, amount: string): Promise<string> {
    if (!this.contract) throw new Error('合约未初始化')
    try {
      const decimals = await this.getDecimals()
      const amountWei = ethers.parseUnits(amount, decimals)
      const tx = await this.contract.transfer(recipient, amountWei)
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('转账失败:', error)
      throw error
    }
  }

  // verify
  public async approve(spender: string, amount?: string): Promise<string> {
    if (!this.contract) throw new Error('合约未初始化')
    try {
      const decimals = await this.getDecimals()
      // 如果没有指定金额，使用最大verify金额
      const approveAmount = amount || getMaxApproveAmount().toString()
      const amountWei = ethers.parseUnits(approveAmount, decimals)
      const tx = await this.contract.approve(spender, amountWei)
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error('verify失败:', error)
      throw error
    }
  }

  // 获取verify额度
  public async getAllowance(owner: string, spender: string): Promise<string> {
    if (!this.contract) return '0'
    try {
      const allowance = await this.contract.allowance(owner, spender)
      const decimals = await this.getDecimals()
      return ethers.formatUnits(allowance, decimals)
    } catch (error) {
      console.error('获取verify额度失败:', error)
      return '0'
    }
  }

  // 检查是否需要verify
  public async needsApproval(owner: string, spender: string, amount: string): Promise<boolean> {
    try {
      const allowance = await this.getAllowance(owner, spender)
      return Number.parseFloat(allowance) < Number.parseFloat(amount)
    } catch (error) {
      console.error('检查verify需求失败:', error)
      return true
    }
  }

  // 获取合约地址
  public getContractAddress(): string {
    return this.address
  }
}

// 创建单例实例
export const safeTokenService = new SafeTokenService()

// 导出默认实例
export default safeTokenService 