'use client'

import { useState, useEffect, useRef } from 'react'

interface QRCodeGeneratorProps {
  text: string
  size?: number
  className?: string
}

export default function QRCodeGenerator({ 
  text, 
  size = 200, 
  className = '' 
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [text, size])

  const generateQRCode = async () => {
    try {
      // 使用在线二维码生成API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&color=000000&bgcolor=ffffff&margin=10`
      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('生成二维码失败:', error)
    }
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = 'invite-qrcode.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert('链接已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      alert('复制失败，请手动复制')
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {qrCodeUrl ? (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img 
            src={qrCodeUrl} 
            alt="邀请二维码"
            className="w-full h-full object-contain"
            style={{ width: size, height: size }}
          />
        </div>
      ) : (
        <div 
          className="bg-gray-200 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          onClick={downloadQRCode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          下载二维码
        </button>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          复制链接
        </button>
      </div>
    </div>
  )
} 
 
 