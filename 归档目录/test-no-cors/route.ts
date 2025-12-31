import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试无CORS API...')
    
    // 测试基本功能
    const testData = {
      message: 'Hello World',
      timestamp: new Date().toISOString(),
      success: true
    }
    
    console.log('📊 测试数据:', testData)
    
    return NextResponse.json({
      success: true,
      data: testData
    })
    
  } catch (error) {
    console.error('❌ 无CORS API测试异常:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}













