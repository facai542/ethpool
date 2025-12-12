/**
 * 钱包交易记录API
 * 用于记录钱包地址的交易（转入/转出）
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userAddress,
      transactionType, // 'in' | 'out'
      amount,
      token,
      txHash,
      blockNumber,
      fromAddress,
      toAddress
    } = body

    // 验证必要参数
    if (!userAddress || !transactionType || !amount || !token || !txHash) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: userAddress, transactionType, amount, token, txHash'
      }, { status: 400 })
    }

    // 验证交易类型
    if (!['in', 'out'].includes(transactionType)) {
      return NextResponse.json({
        success: false,
        error: 'transactionType必须是"in"或"out"'
      }, { status: 400 })
    }

    console.log(`📝 记录钱包交易: ${transactionType} - ${amount} ${token}`)

    // 插入交易记录
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_address: userAddress,
        transaction_type: transactionType,
        amount: amount.toString(),
        token: token.toUpperCase(),
        tx_hash: txHash,
        block_number: blockNumber || 0,
        timestamp: new Date().toISOString(),
        from_address: fromAddress || '',
        to_address: toAddress || '',
        is_processed: false
      })
      .select()
      .single()

    if (error) {
      console.error('记录钱包交易失败:', error)
      return NextResponse.json({
        success: false,
        error: '记录钱包交易失败: ' + error instanceof Error ? error.message : "未知错误"
      }, { status: 500 })
    }

    console.log('✅ 钱包交易记录成功:', data.id)

    return NextResponse.json({
      success: true,
      message: '钱包交易记录成功',
      data: {
        id: data.id,
        userAddress,
        transactionType,
        amount,
        token,
        txHash,
        timestamp: data.timestamp
      }
    })

  } catch (error) {
    console.error('记录钱包交易异常:', error)
    return NextResponse.json({
      success: false,
      error: '记录钱包交易异常: ' + error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('address')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('wallet_transactions')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (userAddress) {
      query = query.eq('user_address', userAddress)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('查询钱包交易失败:', error)
      return NextResponse.json({
        success: false,
        error: '查询钱包交易失败: ' + error instanceof Error ? error.message : "未知错误"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions: data || [],
        total: count || 0,
        limit,
        offset
      }
    })

  } catch (error) {
    console.error('查询钱包交易异常:', error)
    return NextResponse.json({
      success: false,
      error: '查询钱包交易异常: ' + error instanceof Error ? error.message : "未知错误"
    }, { status: 500 })
  }
}






