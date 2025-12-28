import axios from 'axios';

export class PriceService {
  private cachedPrice: number | null = null;
  private lastFetchTime: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5分钟缓存

  /**
   * 获取ETH当前价格(USD)
   */
  async getETHPrice(): Promise<number> {
    const now = Date.now();
    
    // 使用缓存
    if (this.cachedPrice && (now - this.lastFetchTime) < this.cacheDuration) {
      return this.cachedPrice;
    }

    try {
      // 使用 CoinGecko API
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
      );
      
      const price = response.data.ethereum.usd;
      this.cachedPrice = price;
      this.lastFetchTime = now;
      
      return price;
    } catch (error) {
      console.error('Failed to fetch ETH price:', error);
      
      // 如果有缓存,使用缓存
      if (this.cachedPrice) {
        return this.cachedPrice;
      }
      
      // 返回备用价格
      return 2800; // 默认价格
    }
  }

  /**
   * 计算USDT等值的ETH数量
   */
  async calculateETHAmount(usdtValue: number): Promise<number> {
    const ethPrice = await this.getETHPrice();
    return usdtValue / ethPrice;
  }

  /**
   * 计算ETH等值的USDT数量
   */
  async calculateUSDTValue(ethAmount: number): Promise<number> {
    const ethPrice = await this.getETHPrice();
    return ethAmount * ethPrice;
  }
}

export const priceService = new PriceService();
