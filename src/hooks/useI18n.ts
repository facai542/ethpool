'use client'

import { useContext } from 'react'
import { I18nContext } from '@/contexts/I18nContext'
import type { Language } from '@/lib/i18n'

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 简化的翻译函数，用于快速使用
export const useTranslation = () => {
  const { t } = useI18n()
  return { t }
}

// 格式化数字的hook
export const useFormatNumber = () => {
  const { language } = useI18n()
  
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    const locale = getLocaleFromLanguage(language)
    return new Intl.NumberFormat(locale, options).format(num)
  }
  
  const formatCurrency = (amount: number, currency = 'USD') => {
    const locale = getLocaleFromLanguage(language)
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount)
  }
  
  const formatPercent = (value: number) => {
    const locale = getLocaleFromLanguage(language)
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100)
  }
  
  return {
    formatNumber,
    formatCurrency,
    formatPercent
  }
}

// 格式化日期的hook
export const useFormatDate = () => {
  const { language } = useI18n()
  
  const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const locale = getLocaleFromLanguage(language)
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, options).format(dateObj)
  }
  
  const formatDateTime = (date: Date | string | number) => {
    return formatDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const formatTime = (date: Date | string | number) => {
    return formatDate(date, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }
  
  const formatRelativeTime = (date: Date | string | number) => {
    const locale = getLocaleFromLanguage(language)
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    }
  }
  
  return {
    formatDate,
    formatDateTime,
    formatTime,
    formatRelativeTime
  }
}

// 语言到locale的映射
const getLocaleFromLanguage = (language: Language): string => {
  const localeMap: Record<Language, string> = {
    zh: 'zh-CN',
    en: 'en-US'
  }
  return localeMap[language] || 'en-US'
} 