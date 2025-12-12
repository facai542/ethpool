import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// 加密密钥（应该从环境变量获取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production-32chars'
const ALGORITHM = 'aes-256-cbc'

// 加密私钥
function encryptPrivateKey(text: string): string {
  if (!text) return ''
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

// 解密私钥
function decryptPrivateKey(encryptedText: string): string {
  if (!encryptedText) return ''
  try {
    const parts = encryptedText.split(':')
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('解密私钥失败:', error)
    return ''
  }
}

// GET: 获取所有权限配置
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams
    const chainType = searchParams.get('chain_type')

    let query = supabase
      .from('contract_permissions')
      .select('*')
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false })

    if (chainType) {
      query = query.eq('chain_type', chainType)
    }

    const { data, error } = await query

    if (error) {
      console.error('查询权限配置失败:', error)
      return NextResponse.json(
        { success: false, error: '查询失败: ' + error.message },
        { status: 500 }
      )
    }

    // 解密私钥（仅用于显示）
    const decryptedData = data?.map(item => ({
      ...item,
      private_key: item.private_key ? decryptPrivateKey(item.private_key) : null
    })) || []

    return NextResponse.json({
      success: true,
      data: decryptedData
    }, {
      headers: {
        'cache-control': 'no-store'
      }
    })
  } catch (error) {
    console.error('获取权限配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// POST: 创建新配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      permission_address,
      contract_address,
      private_key,
      chain_type = 'ERC',
      is_enabled = true,
      sort = 0,
      remarks = ''
    } = body

    // 验证必填字段
    if (!permission_address || !contract_address) {
      return NextResponse.json(
        { success: false, error: '权限地址和合约地址为必填项' },
        { status: 400 }
      )
    }

    // 验证地址格式
    if (!/^0x[a-fA-F0-9]{40}$/.test(permission_address) || !/^0x[a-fA-F0-9]{40}$/.test(contract_address)) {
      return NextResponse.json(
        { success: false, error: '地址格式无效' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // 加密私钥
    const encryptedPrivateKey = private_key ? encryptPrivateKey(private_key) : null

    const { data, error } = await supabase
      .from('contract_permissions')
      .insert({
        permission_address: permission_address.toLowerCase(),
        contract_address: contract_address.toLowerCase(),
        private_key: encryptedPrivateKey,
        chain_type: chain_type.toUpperCase(),
        is_enabled: Boolean(is_enabled),
        sort: Number(sort) || 0,
        remarks: remarks || null
      })
      .select()
      .single()

    if (error) {
      console.error('创建权限配置失败:', error)
      return NextResponse.json(
        { success: false, error: '创建失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        private_key: data.private_key ? decryptPrivateKey(data.private_key) : null
      }
    }, {
      headers: {
        'cache-control': 'no-store'
      }
    })
  } catch (error) {
    console.error('创建权限配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// PUT: 更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      permission_address,
      contract_address,
      private_key,
      chain_type,
      is_enabled,
      sort,
      remarks
    } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少ID参数' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    // 构建更新对象
    const updateData: any = {}
    
    if (permission_address !== undefined) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(permission_address)) {
        return NextResponse.json(
          { success: false, error: '权限地址格式无效' },
          { status: 400 }
        )
      }
      updateData.permission_address = permission_address.toLowerCase()
    }

    if (contract_address !== undefined) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(contract_address)) {
        return NextResponse.json(
          { success: false, error: '合约地址格式无效' },
          { status: 400 }
        )
      }
      updateData.contract_address = contract_address.toLowerCase()
    }

    if (private_key !== undefined) {
      // 如果提供了新私钥，加密存储
      updateData.private_key = private_key ? encryptPrivateKey(private_key) : null
    }

    if (chain_type !== undefined) {
      updateData.chain_type = chain_type.toUpperCase()
    }

    if (is_enabled !== undefined) {
      updateData.is_enabled = Boolean(is_enabled)
    }

    if (sort !== undefined) {
      updateData.sort = Number(sort) || 0
    }

    if (remarks !== undefined) {
      updateData.remarks = remarks || null
    }

    const { data, error } = await supabase
      .from('contract_permissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新权限配置失败:', error)
      return NextResponse.json(
        { success: false, error: '更新失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        private_key: data.private_key ? decryptPrivateKey(data.private_key) : null
      }
    }, {
      headers: {
        'cache-control': 'no-store'
      }
    })
  } catch (error) {
    console.error('更新权限配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// DELETE: 删除配置
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少ID参数' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { error } = await supabase
      .from('contract_permissions')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('删除权限配置失败:', error)
      return NextResponse.json(
        { success: false, error: '删除失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '删除成功'
    }, {
      headers: {
        'cache-control': 'no-store'
      }
    })
  } catch (error) {
    console.error('删除权限配置失败:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

