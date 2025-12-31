// 测试正则表达式
const testString = "货币兑换: 0.33773139 ETH -> 1449.46320175 USDT (汇率: 4313.33, 手续费: 0.50%)";
const usdtMatch = testString.match(/->\s*(\d+\.?\d*)\s*USDT/);
console.log('测试字符串:', testString);
console.log('匹配结果:', usdtMatch);
if (usdtMatch) {
  console.log('提取的USDT金额:', usdtMatch[1]);
} else {
  console.log('匹配失败');
}

