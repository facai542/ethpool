'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { languageNames, type Language } from '@/lib/i18n'

interface LanguageSelectorProps {
  className?: string
  variant?: 'default' | 'compact' | 'icon-only'
}

export default function LanguageSelector({ 
  className = '', 
  variant = 'default' 
}: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages, isLoaded } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // 计算下拉菜单的最佳位置
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return

    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const dropdownWidth = 192 // w-48 = 192px
    
    // 如果按钮右侧空间不足，则向左展开
    if (buttonRect.right + dropdownWidth > viewportWidth) {
      setDropdownPosition('left')
    } else {
      setDropdownPosition('right')
    }
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  const handleToggle = () => {
    if (!isOpen) {
      calculateDropdownPosition()
    }
    setIsOpen(!isOpen)
  }

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setIsOpen(false)
  }

  // 加载状态
  if (!isLoaded) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    )
  }

  // Binance样式的地球图标
  const GlobeIcon = ({ className: iconClassName = "" }) => (
    <svg 
      className={`bn-svg language-icon hover-color ${iconClassName}`} 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
      width="20" 
      height="20"
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M15.23 20.403a9.011 9.011 0 005.684-7.153h-3.942c-.147 2.86-.793 5.388-1.741 7.153zm-.757-7.153c-.178 4.102-1.217 7.25-2.473 7.25-1.256 0-2.295-3.148-2.473-7.25h4.946zm0-2.5H9.527C9.705 6.648 10.744 3.5 12 3.5c1.256 0 2.295 3.148 2.473 7.25zm2.499 0h3.942a9.01 9.01 0 00-5.683-7.153c.948 1.765 1.594 4.293 1.741 7.153zm-9.936 0c.147-2.862.793-5.392 1.743-7.156a9.01 9.01 0 00-5.693 7.156h3.95zm0 2.5h-3.95a9.01 9.01 0 005.693 7.157c-.95-1.765-1.596-4.295-1.743-7.157z" 
        fill="currentColor"
      />
    </svg>
  )

  // 获取下拉菜单的定位类名
  const getDropdownClasses = () => {
    const baseClasses = "absolute mt-2 w-48 rounded-lg shadow-xl border border-gray-600 z-[10000] max-h-64 overflow-y-auto"
    const bgColor = "bg-[#1e2329]" // 使用指定的背景色
    
    if (dropdownPosition === 'left') {
      return `${baseClasses} ${bgColor} right-0`
    } else {
      return `${baseClasses} ${bgColor} left-0`
    }
  }

  // 图标模式 - 类似Binance的简洁设计
  if (variant === 'icon-only') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            isOpen ? 'text-yellow-400' : 'text-white'
          }`}
          aria-label="选择语言"
        >
          <GlobeIcon />
        </button>

        {isOpen && (
          <div className={getDropdownClasses()}>
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    language === lang 
                      ? 'bg-yellow-600/20 text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <GlobeIcon className={language === lang ? 'text-yellow-400' : 'text-gray-500'} />
                  <span className="text-sm">{languageNames[lang]}</span>
                  {language === lang && (
                    <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 紧凑模式 - Binance风格，只显示地球图标
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/10 transition-colors ${
            isOpen ? 'text-yellow-400' : 'text-white'
          }`}
          aria-label="选择语言"
        >
          <GlobeIcon className="text-current" />
        </button>

        {isOpen && (
          <div className={getDropdownClasses()}>
            <div className="py-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    language === lang 
                      ? 'bg-yellow-600/20 text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  <GlobeIcon className={language === lang ? 'text-yellow-400' : 'text-gray-500'} />
                  <span className="text-sm">{languageNames[lang]}</span>
                  {language === lang && (
                    <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 默认模式 - 完整的Binance风格
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors ${
          isOpen 
            ? 'bg-[#1e2329] text-yellow-400' 
            : 'bg-[#1e2329] text-white hover:text-yellow-400'
        }`}
      >
        <GlobeIcon className="text-current" />
        <span className="text-sm font-medium">{languageNames[language]}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={getDropdownClasses().replace('left-0', dropdownPosition === 'left' ? 'right-0' : 'left-0')}>
          <div className="py-1">
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  language === lang 
                    ? 'bg-yellow-600/20 text-yellow-400' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <GlobeIcon className={language === lang ? 'text-yellow-400' : 'text-gray-500'} />
                <span className="text-sm">{languageNames[lang]}</span>
                {language === lang && (
                  <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 