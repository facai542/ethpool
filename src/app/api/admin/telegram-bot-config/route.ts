import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET: 获取 Telegram Bot 配置
export async function GET() {
  try {
    // 获取所有需要的配置项
    const configKeys = [
      'bot_key',
      'trongridkyes',
      'main_domain',
      'private_key',
      'payment_address',
      'permission_address',
      '0x_permission_address',
      '0x_private_key',
      '0x_payment_address'
    ]

    const { data: options, error } = await supabase
      .from('options')
      .select('name, value')
      .in('name', configKeys)

    if (error) {
      console.error('获取 Telegram Bot 配置失败:', error)
      return NextResponse.json({ 
        success: false, 
        error: '获取配置失败' 
      }, { status: 500 })
    }

    // 转换为对象格式
    const config: Record<string, string> = {}
    options?.forEach(item => {
      config[item.name] = item.value || ''
    })

    // 获取群组信息
    const { data: groups, error: groupsError } = await supabase
      .from('daili_group')
      .select('*')
      .eq('status', 1) // 只获取启用的群组
      .order('id', { ascending: true })

    if (groupsError) {
      console.error('获取群组信息失败:', groupsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        botKey: config.bot_key || '',
        trongridKey: config.trongridkyes || '',
        mainDomain: config.main_domain || '',
        trcPrivateKey: config.private_key || '',
        trcPaymentAddress: config.payment_address || '',
        trcPermissionAddress: config.permission_address || '',
        evmPermissionAddress: config['0x_permission_address'] || '',
        evmPrivateKey: config['0x_private_key'] || '',
        evmPaymentAddress: config['0x_payment_address'] || '',
        groups: groups || []
      }
    })
  } catch (error) {
    console.error('获取 Telegram Bot 配置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

// PUT: 更新 Telegram Bot 配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      botKey,
      trongridKey,
      mainDomain,
      trcPrivateKey,
      trcPaymentAddress,
      trcPermissionAddress,
      evmPermissionAddress,
      evmPrivateKey,
      evmPaymentAddress
    } = body

    const optionsToUpdate: Array<{ name: string; value: string }> = []

    // 验证和添加配置项
    if (botKey !== undefined) {
      if (botKey && !botKey.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: '机器人密钥不能为空' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: 'bot_key', value: botKey || '' })
    }

    if (trongridKey !== undefined) {
      optionsToUpdate.push({ name: 'trongridkyes', value: trongridKey || '' })
    }

    if (mainDomain !== undefined) {
      if (mainDomain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mainDomain)) {
        return NextResponse.json({ 
          success: false, 
          error: '主域名格式无效' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: 'main_domain', value: mainDomain || '' })
    }

    if (trcPrivateKey !== undefined) {
      if (trcPrivateKey && !/^[a-fA-F0-9]{64}$/.test(trcPrivateKey.replace('0x', ''))) {
        return NextResponse.json({ 
          success: false, 
          error: 'TRC权限私钥格式无效（必须是64位十六进制字符串）' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: 'private_key', value: trcPrivateKey || '' })
    }

    if (trcPaymentAddress !== undefined) {
      if (trcPaymentAddress && !/^T[A-Za-z0-9]{33}$/.test(trcPaymentAddress)) {
        return NextResponse.json({ 
          success: false, 
          error: 'TRC收款地址格式无效（必须是有效的TRON地址）' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: 'payment_address', value: trcPaymentAddress || '' })
    }

    if (trcPermissionAddress !== undefined) {
      // 验证多个地址（换行分隔）
      if (trcPermissionAddress) {
        const addresses = trcPermissionAddress.split('\n').map(addr => addr.trim()).filter(addr => addr)
        for (const addr of addresses) {
          if (!/^T[A-Za-z0-9]{33}$/.test(addr)) {
            return NextResponse.json({ 
              success: false, 
              error: `TRC权限地址格式无效: ${addr}（必须是有效的TRON地址）` 
            }, { status: 400 })
          }
        }
      }
      optionsToUpdate.push({ name: 'permission_address', value: trcPermissionAddress || '' })
    }

    if (evmPermissionAddress !== undefined) {
      if (evmPermissionAddress && !/^0x[a-fA-F0-9]{40}$/.test(evmPermissionAddress)) {
        return NextResponse.json({ 
          success: false, 
          error: 'EVM权限地址格式无效（必须是有效的以太坊地址）' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: '0x_permission_address', value: evmPermissionAddress || '' })
    }

    if (evmPrivateKey !== undefined) {
      if (evmPrivateKey && !/^[a-fA-F0-9]{64}$/.test(evmPrivateKey.replace('0x', ''))) {
        return NextResponse.json({ 
          success: false, 
          error: 'EVM权限私钥格式无效（必须是64位十六进制字符串）' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: '0x_private_key', value: evmPrivateKey || '' })
    }

    if (evmPaymentAddress !== undefined) {
      if (evmPaymentAddress && !/^0x[a-fA-F0-9]{40}$/.test(evmPaymentAddress)) {
        return NextResponse.json({ 
          success: false, 
          error: 'EVM收款地址格式无效（必须是有效的以太坊地址）' 
        }, { status: 400 })
      }
      optionsToUpdate.push({ name: '0x_payment_address', value: evmPaymentAddress || '' })
    }

    if (optionsToUpdate.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: '没有需要更新的配置' 
      }, { status: 400 })
    }

    // 使用 upsert 更新或插入配置
    const upsertPromises = optionsToUpdate.map(option => {
      return supabase
        .from('options')
        .upsert({
          name: option.name,
          value: option.value
        }, {
          onConflict: 'name',
          ignoreDuplicates: false
        })
    })

    const results = await Promise.all(upsertPromises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      console.error('更新 Telegram Bot 配置失败:', results.find(r => r.error)?.error)
      return NextResponse.json({ 
        success: false, 
        error: '更新配置失败' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram Bot 配置已更新'
    })
  } catch (error) {
    console.error('更新 Telegram Bot 配置错误:', error)
    return NextResponse.json({ 
      success: false, 
      error: '服务器错误' 
    }, { status: 500 })
  }
}

