'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'

interface SystemSettings {
  support: {
    telegram: string
    whatsapp: string
    facebook: string
    email: string
    phone: string
  }
  footer: {
    copyright: string
    companyName: string
    whitepaperUrl: string
  }
  social: {
    telegram: string
    whatsapp: string
    facebook: string
    twitter: string
    linkedin: string
    youtube: string
  }
  menu: {
    companyAbout: string
    companyFaqs: string
    companyPrivacy: string
    companyTerms: string
    companyWhitepaper: string
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch system settings')
  }
  const data = await res.json()
  return data.success ? data.data : null
}

export function useSystemSettings() {
  const { data, error, isLoading, mutate } = useSWR<SystemSettings>(
    '/api/config/system',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 0, // 不自动刷新
    }
  )

  return {
    settings: data,
    isLoading,
    isError: error,
    refetch: mutate
  }
}

