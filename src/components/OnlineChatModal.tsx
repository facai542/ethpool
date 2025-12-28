'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minimize2, Maximize2, MessageSquare, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnlineChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const OnlineChatModal: React.FC<OnlineChatModalProps> = ({ isOpen, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // 客服系统URL
  const customerServiceUrl = 'https://chat.boltcode.vip?visiter_id=&visiter_name=&avatar=&business_id=1&groupid=0&special=1'

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      // 模拟加载时间
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleOpenInNewTab = () => {
    window.open(customerServiceUrl, '_blank', 'noopener,noreferrer')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 100 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          height: isMinimized ? 60 : 500
        }}
        exit={{ opacity: 0, scale: 0.8, y: 100 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="fixed bottom-4 right-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">在线客服</h3>
              <p className="text-xs opacity-80">专业客服为您服务</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 h-auto text-white hover:bg-blue-700"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            {isLoading ? (
              <div className="h-80 flex items-center justify-center bg-gray-800">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-300 text-sm">正在连接客服系统...</p>
                </div>
              </div>
            ) : (
              <div className="h-80 bg-gray-800 relative">
                <iframe
                  ref={iframeRef}
                  src={customerServiceUrl}
                  className="w-full h-full border-0"
                  title="客服系统"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    onClick={handleOpenInNewTab}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    新窗口打开
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default OnlineChatModal
