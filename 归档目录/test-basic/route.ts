import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试基本API...')
    
    // 测试基本功能
    const testData = {
      message: 'Hello World',
      timestamp: new Date().toISOString(),
      success: true
    }
    
    console.log('📊 测试数据:', testData)
    
    const response = NextResponse.json({
      success: true,
      data: testData
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ 基本API测试异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}













