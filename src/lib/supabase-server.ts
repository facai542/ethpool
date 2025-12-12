import { createClient } from '@supabase/supabase-js'

/**
 * 创建 Supabase 服务器端客户端
 * 使用 Service Role Key 或 Anon Key 作为备用
 * 
 * 注意：在 Netlify 控制台必须设置 SUPABASE_SERVICE_ROLE_KEY 环境变量
 * 
 * @returns Supabase 客户端实例
 * @throws 如果配置缺失则抛出错误（仅在运行时）
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.SUPABASE_URL || 
    'https://bfcpimnfgidhgigtgehs.supabase.co'
  
  // 优先使用 SUPABASE_SERVICE_ROLE_KEY，如果没有则使用 ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 验证 Service Role Key 格式（应该是 JWT 格式，不应该以 sbp_ 开头）
  if (supabaseServiceRoleKey && supabaseServiceRoleKey.startsWith('sbp_')) {
    console.error('❌ 检测到错误的 Supabase Key 格式')
    console.error('   SUPABASE_SERVICE_ROLE_KEY 不能是 publishable key (sbp_ 开头)')
    console.error('   请使用 Service Role Key (JWT 格式，以 eyJ 开头)')
    console.error('   在 Supabase 控制台: Settings > API > service_role key')
    throw new Error('Supabase Service Role Key 格式错误：检测到 publishable key，请使用 service_role key (JWT 格式)')
  }

  // 检查是否在构建时（Next.js 构建过程）
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                      process.env.NEXT_PHASE === 'phase-development-build' ||
                      !process.env.SUPABASE_SERVICE_ROLE_KEY

  // 如果在构建时且没有配置，使用占位符值（仅用于通过构建，不会实际使用）
  if (isBuildTime && !process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase Service Role Key 未设置，使用占位符（仅用于构建）')
    // 使用一个有效的格式但不会实际工作的占位符
    return createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU')
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // 在运行时，如果没有 Service Role Key，尝试使用 Anon Key 作为备用
    const fallbackKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (fallbackKey && supabaseUrl) {
      console.warn('⚠️ 使用 ANON_KEY 作为备用（功能可能受限）')
      return createClient(supabaseUrl, fallbackKey)
    }
    
    const error = new Error('Supabase配置缺失，请检查环境变量。请在部署平台设置 SUPABASE_SERVICE_ROLE_KEY')
    console.error('❌ Supabase配置缺失:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceRoleKey,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      nextPhase: process.env.NEXT_PHASE
    })
    throw error
  }

  // 验证 URL 格式
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('⚠️ Supabase URL 格式可能不正确:', supabaseUrl)
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey)
}









