import { createClient } from '@supabase/supabase-js'

// Supabase configuration - 使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface AdminUser {
  id: number
  name: string
  password: string
  nickname: string
  email: string
  mobile?: string
  avatar?: string
  status: number
  create_time: string
  update_time: string
  last_login_time?: string
  login_ip?: string
}

export interface AdminGroup {
  id: number
  name: string
  description: string
  status: number
  rules: string
  create_time: string
  update_time: string
}

export interface User {
  id: number
  address: string
  email?: string
  username?: string
  avatar?: string
  phone?: string
  status: number
  balance: number
  create_time: string
  update_time: string
  last_login_time?: string
  login_ip?: string
}

export interface UserProfile {
  id: number
  user_id: number
  nickname?: string
  bio?: string
  avatar?: string
  created_at: string
  updated_at: string
}

export interface UserBalance {
  id: number
  user_id: number
  balance: number
  frozen_balance: number
  total_income: number
  total_expense: number
  created_at: string
  updated_at: string
}

export interface UserRecharge {
  id: number
  user_id: number
  order_number: string
  amount: number
  currency: string
  status: string
  payment_method: string
  transaction_hash?: string
  created_at: string
  updated_at: string
}

export interface UserWithdraw {
  id: number
  user_id: number
  order_number: string
  amount: number
  currency: string
  status: string
  to_address: string
  transaction_hash?: string
  created_at: string
  updated_at: string
}

export interface Article {
  id: number
  title: string
  content: string
  status: number
  category: string
  author: string
  views: number
  created_at: string
  updated_at: string
}

export interface SystemConfig {
  id: number
  key: string
  value: string
  description: string
  type: string
  created_at: string
  updated_at: string
}

export interface Statistics {
  id: number
  date: string
  total_users: number
  active_users: number
  total_volume: number
  total_transactions: number
  created_at: string
} 