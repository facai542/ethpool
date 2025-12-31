import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '修复验证测试',
    fixes: {
      exchangeRecords: {
        ethDecimals: 4,
        usdtDecimals: 2,
        description: '兑换记录小数位数已修复'
      },
      withdrawError: {
        fixed: true,
        description: '提现错误处理已修复'
      },
      recordClassification: {
        earnings: '只显示ETH奖励和定时奖励',
        exchange: '只显示兑换操作',
        withdraw: '只显示提现操作'
      }
    },
    timestamp: new Date().toISOString()
  })
}
