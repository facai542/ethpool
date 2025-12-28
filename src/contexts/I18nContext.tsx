'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { 
  getTranslation, 
  getBrowserLanguage, 
  type Language, 
  type TranslationContent 
} from '@/lib/i18n'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationContent
  availableLanguages: Language[]
  isLoaded: boolean
}

export const I18nContext = createContext<I18nContextType | null>(null)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // 初始化语言设置
  useEffect(() => {
    let savedLanguage: Language | null = null
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        savedLanguage = localStorage.getItem('app-language') as Language
      }
    } catch (error) {
      console.warn('localStorage access failed:', error)
    }

    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // 默认设置为英语
      setLanguage('en')
    }
    
    setIsLoaded(true)
  }, [])

  // 切换语言
  const handleSetLanguage = (lang: Language) => {
    // 1. 立即更新状态
    setLanguage(lang)
    
    // 2. 保存到localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('app-language', lang)
      }
    } catch (error) {
      console.warn('localStorage save failed:', error)
    }
  }

  // 获取当前语言的翻译内容
  const t = getTranslation(language)

  // 可用语言列表
  const availableLanguages: Language[] = ['en', 'de', 'es', 'fr', 'it', 'ru', 'zh']

  const value: I18nContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    availableLanguages,
    isLoaded
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
} 