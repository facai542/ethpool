import { NextRequest, NextResponse } from 'next/server'
import { createSignatureService } from '@/lib/signature-service'
import type { WithdrawRequest } from '@/lib/signature-service'

export const dynamic = 'force-dynamic'

// POST: 生成签名
export async function POST(request: NextRequest) {
  try {
    // 验证API密钥（如果需要）
    const apiKey = request.headers.get('x-api-key')
    const expectedApiKey = process.env.SIGNATURE_API_KEY
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return NextResponse.json({
        success: false,
        error: '无效的API密钥'
      }, { status: 401 })
    }

    const body = await request.json()
    const { user, id, currencyId, amount } = body

    // 验证必填字段
    if (!user || !id || currencyId === undefined || !amount) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段: user, id, currencyId, amount'
      }, { status: 400 })
    }

    // 创建签名服务
    const signatureService = createSignatureService()

    // 构建提款请求
    const withdrawRequest: WithdrawRequest = {
      user,
      id: Number.parseInt(id.toString()),
      currencyId: Number.parseInt(currencyId.toString()),
      amount: amount.toString(),
      timestamp: Math.floor(Date.now() / 1000)
    }

    // 生成签名
    const result = await signatureService.signWithdrawRequest(withdrawRequest)

    return NextResponse.json({
      success: true,
      signature: result.signature,
      request: result.request
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('生成签名失败:', error)
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '生成签名失败'
    }, { status: 500 })
  }
}

// PUT: 验证签名
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, id, currencyId, amount, timestamp, signature } = body

    // 验证必填字段
    if (!user || !id || currencyId === undefined || !amount || !timestamp || !signature) {
      return NextResponse.json({
        success: false,
        error: '缺少必填字段: user, id, currencyId, amount, timestamp, signature'
      }, { status: 400 })
    }

    // 创建签名服务
    const signatureService = createSignatureService()

    // 构建提款请求
    const withdrawRequest: WithdrawRequest = {
      user,
      id: Number.parseInt(id.toString()),
      currencyId: Number.parseInt(currencyId.toString()),
      amount: amount.toString(),
      timestamp: Number.parseInt(timestamp.toString())
    }

    // 验证签名
    const isValid = await signatureService.verifySignature(withdrawRequest, signature)

    return NextResponse.json({
      success: true,
      isValid
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('验证签名失败:', error)
    }
    
    return NextResponse.json({
      success: false,
      isValid: false,
      error: error instanceof Error ? error.message : '验证签名失败'
    }, { status: 500 })
  }
}


