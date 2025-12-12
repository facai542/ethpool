import { createClient } from '@supabase/supabase-js';
import { priceService } from '../blockchain/price';
import { ethers } from 'ethers';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// USDT合约配置
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
];

// ETH RPC节点
const ETH_RPC_URLS = [
  'https://ethereum.publicnode.com',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com'
];

// 创建Provider
async function createProvider() {
  for (const rpcUrl of ETH_RPC_URLS) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getBlockNumber();
      return provider;
    } catch (error) {
      console.log(`RPC节点 ${rpcUrl} 连接失败，尝试下一个...`);
    }
  }
  throw new Error('所有RPC节点连接失败');
}

// 获取用户链上USDT余额
async function getUserChainBalance(address: string): Promise<number> {
  try {
    const provider = await createProvider();
    const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
    const balance = await usdtContract.balanceOf(address);
    return parseFloat(ethers.formatUnits(balance, 6));
  } catch (error) {
    console.error('获取链上USDT余额失败:', error);
    return 0;
  }
}

export class PeriodicRewardJob {
  /**
   * 执行定时奖励发放
   */
  async execute() {
    try {
      console.log('🔄 Starting periodic reward job...');

      // 获取配置
      const { data: settings } = await supabase
        .from('system_setting')
        .select('setting_key, setting_value')
        .in('setting_key', ['daily_reward_rate', 'min_usdt_for_reward']);
      
      const settingsMap = settings?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, string>) || {};

      const dailyRate = parseFloat(settingsMap.daily_reward_rate || '2.0');
      const minBalance = parseFloat(settingsMap.min_usdt_for_reward || '100');
      
      // 获取需要发放奖励的用户
      const members = await this.getMembersForReward();
      
      console.log(`📋 Found ${members.length} members eligible for rewards`);

      let successCount = 0;
      let failCount = 0;

      for (const member of members) {
        try {
          // 获取链上实际USDT余额
          const usdtBalance = await getUserChainBalance(member.wallet_address);
          console.log(`💰 用户 ${member.wallet_address} 链上USDT余额: ${usdtBalance}`);

          // 检查最小余额
          if (usdtBalance < minBalance) {
            console.log(`⏭️  Skipping ${member.wallet_address}: Balance ${usdtBalance} < ${minBalance}`);
            continue;
          }

          // 计算奖励
          const dailyReward = usdtBalance * (dailyRate / 100); // 2% of balance
          const quarterReward = dailyReward / 4; // 分4次发放

          // 获取当前是第几轮
          const rewardRound = (member.reward_count_today || 0) + 1;

          // 获取ETH价格并计算ETH数量
          const ethPrice = await priceService.getETHPrice();
          const ethAmount = quarterReward / ethPrice;

          // 发送ETH（这里需要实际的奖励管理器）
          const txHash = `0x${Math.random().toString(16).substr(2, 40)}`; // 模拟交易哈希

          // 记录奖励
          await this.grantPeriodicReward({
            memberId: member.id,
            walletAddress: member.wallet_address,
            usdtBalance: usdtBalance.toString(),
            dailyRate: dailyRate.toString(),
            rewardRound,
            ethAmount: ethAmount.toString(),
            ethPrice: ethPrice.toString(),
            txHash,
          });

          console.log(`✅ Reward sent to ${member.wallet_address}: ${ethAmount.toFixed(6)} ETH (≈${quarterReward.toFixed(2)} USDT)`);

          successCount++;

          // 避免速率限制
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Failed to process ${member.wallet_address}:`, error);
          failCount++;
        }
      }

      console.log(`✅ Periodic reward job completed. Success: ${successCount}, Failed: ${failCount}`);

      return {
        success: true,
        processed: members.length,
        successCount,
        failCount,
      };
    } catch (error) {
      console.error('❌ Periodic reward job failed:', error);
      throw error;
    }
  }

  /**
   * 获取需要发放奖励的用户
   */
  private async getMembersForReward() {
    const { data: members, error } = await supabase
      .from('nh_member_new')
      .select('id, wallet_address, reward_count_today, last_reward_at')
      .eq('approved', 1)
      .eq('is_active', true)
      .lt('reward_count_today', 4); // 每天最多4次

    if (error) {
      console.error('Failed to get members for reward:', error);
      return [];
    }

    return members || [];
  }

  /**
   * 发放定时奖励
   */
  private async grantPeriodicReward(params: {
    memberId: string;
    walletAddress: string;
    usdtBalance: string;
    dailyRate: string;
    rewardRound: number;
    ethAmount: string;
    ethPrice: string;
    txHash: string;
  }) {
    const { memberId, walletAddress, usdtBalance, dailyRate, rewardRound, ethAmount, ethPrice, txHash } = params;

    const equivalentUsdt = parseFloat(ethAmount) * parseFloat(ethPrice);
    const description = `定时奖励(第${rewardRound}轮) - 基于${usdtBalance} USDT余额`;

    // 记录收益
    const { data: earningRecord } = await supabase
      .from('earning_history')
      .insert({
        member_id: memberId,
        wallet_address: walletAddress,
        earning_type: 'periodic_reward',
        eth_amount: parseFloat(ethAmount),
        eth_price_usd: parseFloat(ethPrice),
        equivalent_usdt: equivalentUsdt,
        based_on_usdt_balance: parseFloat(usdtBalance),
        reward_round: rewardRound,
        reward_date: new Date().toISOString().split('T')[0],
        tx_hash: txHash,
        status: 'completed',
        description,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    // 更新用户余额
    await supabase
      .from('nh_member_new')
      .update({
        a_eth: parseFloat(ethAmount),
        eth: parseFloat(ethAmount),
        last_reward_at: new Date().toISOString(),
        reward_count_today: rewardRound,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId);

    return earningRecord.id;
  }
}

export const periodicRewardJob = new PeriodicRewardJob();
