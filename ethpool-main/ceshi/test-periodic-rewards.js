/**
 * 测试定时奖励任务
 */

// 模拟定时奖励任务测试
async function testPeriodicRewardJob() {
  console.log('🧪 测试定时奖励任务...');
  
  try {
    // 导入定时奖励任务
    const { PeriodicRewardJob } = await import('../src/jobs/periodic-rewards.js');
    const periodicRewardJob = new PeriodicRewardJob();
    
    // 执行一次奖励任务
    console.log('🔄 执行定时奖励任务...');
    const result = await periodicRewardJob.execute();
    
    console.log('✅ 定时奖励任务执行成功:', result);
    return result;
  } catch (error) {
    console.error('❌ 定时奖励任务测试失败:', error);
    throw error;
  }
}

async function testPriceService() {
  console.log('🧪 测试价格服务...');
  
  try {
    // 导入价格服务
    const { priceService } = await import('../src/blockchain/price.js');
    
    const ethPrice = await priceService.getETHPrice();
    console.log(`✅ ETH价格: $${ethPrice}`);
    
    const usdtValue = 56;
    const ethAmount = await priceService.calculateETHAmount(usdtValue);
    console.log(`✅ ${usdtValue} USDT = ${ethAmount.toFixed(6)} ETH`);
    
    const calculatedUsdt = await priceService.calculateUSDTValue(ethAmount);
    console.log(`✅ ${ethAmount.toFixed(6)} ETH = ${calculatedUsdt.toFixed(2)} USDT`);
    
    return { ethPrice, ethAmount, calculatedUsdt };
  } catch (error) {
    console.error('❌ 价格服务测试失败:', error);
    throw error;
  }
}

async function runPeriodicRewardTests() {
  console.log('🚀 开始定时奖励系统测试...\n');
  
  try {
    // 1. 测试价格服务
    await testPriceService();
    console.log('');
    
    // 2. 测试定时奖励任务
    await testPeriodicRewardJob();
    console.log('');
    
    console.log('✅ 所有定时奖励测试通过！系统运行正常');
    
  } catch (error) {
    console.error('❌ 定时奖励测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
runPeriodicRewardTests();
