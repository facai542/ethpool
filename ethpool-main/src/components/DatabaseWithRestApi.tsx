'use client'

import type React from 'react'

interface DatabaseWithRestApiProps {
  badgeTexts?: {
    first: string
    second: string
    third: string
    fourth: string
  }
  buttonTexts?: {
    first: string
    second: string
  }
  title?: string
  circleText?: string
  lightColor?: string
  className?: string
}

export const DatabaseWithRestApi: React.FC<DatabaseWithRestApiProps> = ({ 
  badgeTexts = {
    first: "USDT",
    second: "USDC", 
    third: "BTC",
    fourth: "ETH"
  },
  buttonTexts = {
    first: "挖礦平台",
    second: "實時數據"
  },
  title = "加密貨幣數據交換平台",
  circleText = "API",
  lightColor = "#ffdd00",
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* 简单的数据库REST API展示组件 */}
      <div className="text-center text-white">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="flex justify-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-500 rounded text-sm">{badgeTexts.first}</span>
          <span className="px-3 py-1 bg-green-500 rounded text-sm">{badgeTexts.second}</span>
          <span className="px-3 py-1 bg-orange-500 rounded text-sm">{badgeTexts.third}</span>
          <span className="px-3 py-1 bg-purple-500 rounded text-sm">{badgeTexts.fourth}</span>
        </div>
        <div className="flex justify-center gap-2">
          <button className="px-4 py-2 bg-yellow-500 text-black rounded">{buttonTexts.first}</button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded">{buttonTexts.second}</button>
        </div>
        <div className="mt-4">
          <span className="inline-block w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">
            {circleText}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DatabaseWithRestApi
