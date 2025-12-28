'use client'

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface KLineData {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ETHKLineChartProps {
  className?: string
}

const ETHKLineChart: React.FC<ETHKLineChartProps> = ({ className = '' }) => {
  const [klineData, setKlineData] = useState<KLineData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [priceChangePercent, setPriceChangePercent] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 生成模拟的K线数据
  const generateKLineData = () => {
    const data: KLineData[] = []
    let basePrice = 3400 + Math.random() * 200 // ETH基础价格3400-3600
    
    for (let i = 0; i < 100; i++) {
      const time = new Date(Date.now() - (100 - i) * 60000).toISOString() // 每分钟一个数据点
      const open = basePrice
      const change = (Math.random() - 0.5) * 50 // 价格变动范围
      const close = open + change
      const high = Math.max(open, close) + Math.random() * 20
      const low = Math.min(open, close) - Math.random() * 20
      const volume = Math.random() * 1000 + 500
      
      data.push({ time, open, high, low, close, volume })
      basePrice = close // 下一个开盘价是当前收盘价
    }
    
    return data
  }

  // 绘制K线图
  const drawKLineChart = () => {
    const canvas = canvasRef.current
    if (!canvas || klineData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    ctx.clearRect(0, 0, width, height)

    // 计算价格范围
    const prices = klineData.flatMap(d => [d.high, d.low])
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const priceRange = maxPrice - minPrice

    const candleWidth = width / klineData.length * 0.8
    const spacing = width / klineData.length

    klineData.forEach((data, index) => {
      const x = index * spacing + spacing / 2
      const openY = height - ((data.open - minPrice) / priceRange) * height
      const closeY = height - ((data.close - minPrice) / priceRange) * height
      const highY = height - ((data.high - minPrice) / priceRange) * height
      const lowY = height - ((data.low - minPrice) / priceRange) * height

      // 判断涨跌
      const isUp = data.close > data.open
      const color = isUp ? '#00ff88' : '#ff4444'

      // 绘制影线
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, highY)
      ctx.lineTo(x, lowY)
      ctx.stroke()

      // 绘制实体
      ctx.fillStyle = color
      const rectHeight = Math.abs(closeY - openY)
      const rectY = Math.min(openY, closeY)
      ctx.fillRect(x - candleWidth / 2, rectY, candleWidth, Math.max(rectHeight, 1))
    })

    // 绘制价格线
    ctx.strokeStyle = '#ffdd00'
    ctx.lineWidth = 2
    ctx.beginPath()
    klineData.forEach((data, index) => {
      const x = index * spacing + spacing / 2
      const y = height - ((data.close - minPrice) / priceRange) * height
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }

  // 更新实时价格
  const updateRealTimePrice = () => {
    if (klineData.length === 0) return

    const lastData = klineData[klineData.length - 1]
    const newPrice = lastData.close + (Math.random() - 0.5) * 10
    const change = newPrice - lastData.close
    const changePercent = (change / lastData.close) * 100

    setCurrentPrice(newPrice)
    setPriceChange(change)
    setPriceChangePercent(changePercent)

    // 更新最后一个K线数据
    setKlineData(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        close: newPrice,
        high: Math.max(updated[updated.length - 1].high, newPrice),
        low: Math.min(updated[updated.length - 1].low, newPrice)
      }
      return updated
    })
  }

  // 初始化数据
  useEffect(() => {
    const data = generateKLineData()
    setKlineData(data)
    setCurrentPrice(data[data.length - 1].close)
  }, [])

  // 绘制图表
  useEffect(() => {
    drawKLineChart()
  }, [klineData])

  // 实时更新价格
  useEffect(() => {
    const interval = setInterval(updateRealTimePrice, 2000) // 每2秒更新一次
    return () => clearInterval(interval)
  }, [klineData])

  return (
    <div className={`w-full h-full bg-black text-white ${className}`}>
      {/* 价格信息头部 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-yellow-400">ETH/USDT</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
              <span className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-400">
            <div>24h High: ${Math.max(...klineData.map(d => d.high)).toFixed(2)}</div>
            <div>24h Low: ${Math.min(...klineData.map(d => d.low)).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* K线图画布 */}
      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full border border-gray-700 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}
        />
      </div>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Volume 24h</div>
            <div className="font-bold text-green-400">
              {(Math.random() * 50000 + 100000).toFixed(0)} ETH
            </div>
          </div>
          <div>
            <div className="text-gray-400">Market Cap</div>
            <div className="font-bold text-blue-400">
              ${(currentPrice * 120000000).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Circulating</div>
            <div className="font-bold text-purple-400">120.3M ETH</div>
          </div>
          <div>
            <div className="text-gray-400">Rank</div>
            <div className="font-bold text-yellow-400">#2</div>
          </div>
        </div>
      </div>

      {/* 实时更新指示器 */}
      <motion.div
        className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  )
}

export default ETHKLineChart
