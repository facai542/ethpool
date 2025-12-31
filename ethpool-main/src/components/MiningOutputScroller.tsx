'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface MiningRecord {
  id: string
  address: string
  amount: string
}

export const MiningOutputScroller: React.FC = () => {
  const { t } = useI18n()
  const [records, setRecords] = useState<MiningRecord[]>([])
  const [displayRecords, setDisplayRecords] = useState<MiningRecord[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const usedAddresses = useRef(new Set<string>())
  const usedAmounts = useRef(new Set<string>())

  // 生成随机钱包地址
  const generateRandomAddress = (): string => {
    const chars = '0123456789abcdefABCDEF'
    let address: string
    
    do {
      address = '0x'
      // 生成前6位
      for (let i = 0; i < 6; i++) {
        address += chars[Math.floor(Math.random() * chars.length)]
      }
      address += '...'
      // 生成后8位
      for (let i = 0; i < 8; i++) {
        address += chars[Math.floor(Math.random() * chars.length)]
      }
    } while (usedAddresses.current.has(address))
    
    usedAddresses.current.add(address)
    // 限制缓存大小，避免内存泄漏
    if (usedAddresses.current.size > 1000) {
      const addressArray = Array.from(usedAddresses.current)
      usedAddresses.current.clear()
      // 保留最近的500个地址
      addressArray.slice(-500).forEach(addr => usedAddresses.current.add(addr))
    }
    
    return address
  }

  // 生成随机金额
  const generateRandomAmount = (): string => {
    let amount: string
    
    do {
      // 生成10-1000之间的随机数，保留2位小数
      const value = (Math.random() * 990 + 10).toFixed(2)
      amount = `${value}USDT`
    } while (usedAmounts.current.has(amount))
    
    usedAmounts.current.add(amount)
    // 限制缓存大小
    if (usedAmounts.current.size > 1000) {
      const amountArray = Array.from(usedAmounts.current)
      usedAmounts.current.clear()
      // 保留最近的500个金额
      amountArray.slice(-500).forEach(amt => usedAmounts.current.add(amt))
    }
    
    return amount
  }

  // 生成新的挖矿记录
  const generateNewRecord = (): MiningRecord => {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: generateRandomAddress(),
      amount: generateRandomAmount()
    }
  }

  // 初始化记录
  useEffect(() => {
    const initialRecords: MiningRecord[] = []
    for (let i = 0; i < 15; i++) {
      initialRecords.push(generateNewRecord())
    }
    setRecords(initialRecords)
    setDisplayRecords([...initialRecords, ...initialRecords]) // 双倍记录用于无缝滚动
  }, [])

  // 定期添加新记录
  useEffect(() => {
    const interval = setInterval(() => {
      const newRecord = generateNewRecord()
      setRecords(prev => {
        const updated = [...prev, newRecord]
        // 保持最多15条记录
        if (updated.length > 15) {
          return updated.slice(-15)
        }
        return updated
      })
    }, 2500) // 每2.5秒添加一条新记录

    return () => clearInterval(interval)
  }, [])

  // 更新显示记录
  useEffect(() => {
    if (records.length > 0) {
      setDisplayRecords([...records, ...records])
    }
  }, [records])

  // 自动滚动效果 - 使用CSS动画
  useEffect(() => {
    if (!scrollContainerRef.current || displayRecords.length === 0) return

    const container = scrollContainerRef.current
    
    // 添加CSS动画类
    const scrollContent = container.querySelector('.scroll-content') as HTMLElement
    if (scrollContent) {
      scrollContent.style.animation = 'scrollUp 30s linear infinite'
    }

    return () => {
      if (scrollContent) {
        scrollContent.style.animation = ''
      }
    }
  }, [displayRecords])

  if (displayRecords.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400">login...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center text-white">{t.miningOutput}</h3>
      
      {/* Headers */}
      <div className="flex justify-between items-center py-2 border-b border-gray-600/30">
        <span className="text-gray-400 text-sm font-medium">{t.address}</span>
        <span className="text-gray-400 text-sm font-medium">{t.amount}</span>
      </div>

      {/* 滚动列表 */}
      <div 
        ref={scrollContainerRef}
        className="h-72 overflow-hidden relative"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}
      >
        {/* 顶部渐变蒙版 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
        
        {/* 底部渐变蒙版 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
        
        <div className="scroll-content space-y-3">
          {displayRecords.map((record, index) => (
            <div key={`${record.id}-${index}`} className="flex justify-between items-center py-2 px-1">
              <span className="text-gray-300 text-sm font-mono">{record.address}</span>
              <span className="text-white font-bold">{record.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        .scroll-content {
          animation: scrollUp 30s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default MiningOutputScroller
