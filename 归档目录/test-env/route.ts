import { type NextRequest, NextResponse } from 'next/server'
import { addCorsHeaders } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 测试环境变量...')
    
    const envVars = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置',
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('📊 环境变量:', envVars)
    
    const response = NextResponse.json({
      success: true,
      data: envVars
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ 环境变量测试异常:', error)
    const response = NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}













