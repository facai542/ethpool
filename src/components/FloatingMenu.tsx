'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Home, User, Plus, X } from 'lucide-react'

const FloatingMenu = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleHomeClick = () => {
    console.log('点击首页按钮')
    router.push('/')
    setIsOpen(false)
  }

  const handleUserClick = () => {
    console.log('点击USER按钮')
    router.push('/mining')
    setIsOpen(false)
  }


  const toggleMenu = () => {
    console.log('切换菜单状态:', !isOpen)
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="relative">
        {/* 主按钮 */}
        <motion.button
          onClick={toggleMenu}
          className="w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-black/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="w-6 h-6 text-black" /> : <Plus className="w-6 h-6 text-black" />}
          </motion.div>
        </motion.button>

        {/* 选项按钮 */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* A按钮 - 首页 */}
              <motion.button
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: 1, y: -80, x: 80 }}
                exit={{ opacity: 0, y: 0, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onClick={handleHomeClick}
                className="absolute w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400"
                title="首页"
              >
                <Home className="w-5 h-5 text-yellow-400" />
              </motion.button>

              {/* B按钮 - USER */}
              <motion.button
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ opacity: 1, y: 80, x: 80 }}
                exit={{ opacity: 0, y: 0, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                onClick={handleUserClick}
                className="absolute w-12 h-12 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-400"
                title="USER"
              >
                <User className="w-5 h-5 text-yellow-400" />
              </motion.button>

            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FloatingMenu
