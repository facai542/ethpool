import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bfcpimnfgidhgigtgehs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmY3BpbW5mZ2lkaGdpZ3RnZWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1OTQ2OTIsImV4cCI6MjA2NzE3MDY5Mn0.fa_jyfnVlTnFGk8ilpDHATub2CjODORlh9NZqJNVHBk'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key length:', supabaseKey.length)

const supabase = createClient(supabaseUrl, supabaseKey)

export interface Announcement {
  id?: number
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'published' | 'scheduled' | 'expired'
  target_type: 'all' | 'specific' | 'group'
  target_users?: string[]
  target_groups?: string[]
  template_style: 'modal' | 'banner' | 'toast' | 'sidebar'
  template_config: {
    width?: string
    height?: string
    background_color?: string
    text_color?: string
    button_color?: string
    animation?: 'fade' | 'slide' | 'bounce' | 'none'
  }
  auto_close: boolean
  auto_close_delay?: number
  start_time?: Date
  end_time?: Date
  view_count: number
  click_count: number
  created_by?: string
  created_at?: Date
  updated_at?: Date
}

export interface AnnouncementTemplate {
  id?: number
  name: string
  description?: string
  style: 'modal' | 'banner' | 'toast' | 'sidebar'
  config: any
  preview_image?: string
  is_default: boolean
  created_at?: Date
  updated_at?: Date
}

export interface UserAnnouncementRead {
  id?: number
  user_address: string
  announcement_id: number
  read_at?: Date
  clicked: boolean
  clicked_at?: Date
}

export class AnnouncementService {
  // 获取公告列表
  static async getAnnouncements(filters: {
    status?: string
    target_type?: string
    user_address?: string
    agent_id?: number  // 添加代理过滤参数
    page?: number
    limit?: number
  } = {}): Promise<{ announcements: Announcement[], total: number }> {
    console.log('AnnouncementService.getAnnouncements called with filters:', filters)
    
    try {
      let query = supabase
        .from('announcements')
        .select('*', { count: 'exact' })

      console.log('Initial query created')

      // 过滤过期公告
      query = query.or('end_time.is.null,end_time.gt.now()')
      console.log('Added expiry filter')

      if (filters.status) {
        query = query.eq('status', filters.status)
        console.log('Added status filter:', filters.status)
      }

      if (filters.target_type) {
        query = query.eq('target_type', filters.target_type)
        console.log('Added target_type filter:', filters.target_type)
      }

      // 如果是代理用户，只显示该代理创建的公告
      if (filters.agent_id) {
        query = query.eq('created_by_agent_id', filters.agent_id)
        console.log('Added agent filter:', filters.agent_id)
      }

      const page = filters.page || 1
      const limit = filters.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query
        .order('created_at', { ascending: false })
        .range(from, to)

      console.log('Added pagination:', { page, limit, from, to })

      console.log('Executing Supabase query...')
      const { data, error, count } = await query

      console.log('Supabase query result:', { 
        dataLength: data?.length, 
        count, 
        hasError: !!error 
      })

      if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }

      return { 
        announcements: data || [], 
        total: count || 0 
      }
    } catch (error) {
      console.error('AnnouncementService.getAnnouncements error:', error)
      throw error
    }
  }

  // 获取用户未读公告
  static async getUserUnreadAnnouncements(userAddress: string): Promise<Announcement[]> {
    console.log('AnnouncementService.getUserUnreadAnnouncements called with:', userAddress)
    
    try {
      // 首先获取所有已发布的公告
      const { data: allAnnouncements, error: allError } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .or('end_time.is.null,end_time.gt.now()')
        .or('start_time.is.null,start_time.lte.now()')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (allError) {
        console.error('Supabase error getting all announcements:', allError)
        throw allError
      }

      console.log('Found all announcements:', allAnnouncements?.length || 0)

      if (!allAnnouncements || allAnnouncements.length === 0) {
        console.log('No published announcements found')
        return []
      }

      // 过滤目标用户匹配的公告
      const matchingAnnouncements = allAnnouncements.filter(announcement => {
        if (announcement.target_type === 'all') {
          return true
        }
        
        if (announcement.target_type === 'specific' && Array.isArray(announcement.target_users)) {
          return announcement.target_users.includes(userAddress)
        }
        
        return false
      })

      console.log('Matching announcements:', matchingAnnouncements.length)

      if (matchingAnnouncements.length === 0) {
        console.log('No matching announcements for user')
        return []
      }

      // 获取用户Read记录
      const { data: readRecords, error: readError } = await supabase
        .from('user_announcement_reads')
        .select('announcement_id')
        .eq('user_address', userAddress)

      if (readError) {
        console.error('Supabase error getting read records:', readError)
        // 如果获取Read记录失败，返回所有匹配的公告
        return matchingAnnouncements
      }

      console.log('Read records:', readRecords?.length || 0)

      // 过滤掉Read的公告
      const readAnnouncementIds = new Set(readRecords?.map(r => r.announcement_id) || [])
      const unreadAnnouncements = matchingAnnouncements.filter(
        announcement => !readAnnouncementIds.has(announcement.id)
      )

      console.log('Unread announcements:', unreadAnnouncements.length)
      
      return unreadAnnouncements
    } catch (error) {
      console.error('获取用户未读公告失败:', error)
      return []
    }
  }

  // 获取用户所有公告（包括Read和未读）
  static async getUserAllAnnouncements(userAddress: string): Promise<Announcement[]> {
    console.log('AnnouncementService.getUserAllAnnouncements called with:', userAddress)
    
    try {
      // 获取所有已发布的公告
      const { data: allAnnouncements, error: allError } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'published')
        .or('end_time.is.null,end_time.gt.now()')
        .or('start_time.is.null,start_time.lte.now()')
        .order('created_at', { ascending: false })

      if (allError) {
        console.error('Supabase error getting all announcements:', allError)
        throw allError
      }

      console.log('Found all announcements:', allAnnouncements?.length || 0)

      if (!allAnnouncements || allAnnouncements.length === 0) {
        console.log('No published announcements found')
        return []
      }

      // 过滤目标用户匹配的公告
      const matchingAnnouncements = allAnnouncements.filter(announcement => {
        if (announcement.target_type === 'all') {
          return true
        }
        
        if (announcement.target_type === 'specific' && Array.isArray(announcement.target_users)) {
          return announcement.target_users.includes(userAddress)
        }
        
        return false
      })

      console.log('Matching announcements:', matchingAnnouncements.length)

      // 获取用户Read记录
      const { data: readRecords, error: readError } = await supabase
        .from('user_announcement_reads')
        .select('announcement_id, read_at')
        .eq('user_address', userAddress)

      if (readError) {
        console.error('Supabase error getting read records:', readError)
        // 如果获取Read记录失败，返回所有匹配的公告（标记为未读）
        return matchingAnnouncements.map(announcement => ({
          ...announcement,
          is_read: false
        }))
      }

      console.log('Read records:', readRecords?.length || 0)

      // 为公告添加Read状态
      const readAnnouncementIds = new Set(readRecords?.map(r => r.announcement_id) || [])
      const announcementsWithReadStatus = matchingAnnouncements.map(announcement => ({
        ...announcement,
        is_read: readAnnouncementIds.has(announcement.id)
      }))

      console.log('All announcements with read status:', announcementsWithReadStatus.length)
      
      return announcementsWithReadStatus
    } catch (error) {
      console.error('获取用户所有公告失败:', error)
      return []
    }
  }

  // 创建公告
  static async createAnnouncement(announcement: Omit<Announcement, 'id' | 'view_count' | 'click_count' | 'created_at' | 'updated_at'>): Promise<number> {
    console.log('AnnouncementService.createAnnouncement called with:', announcement)
    
    try {
      // 如果没有设置开始时间，默认为当前时间
      const announcementData = {
        ...announcement,
        start_time: announcement.start_time || new Date(),
        view_count: 0,
        click_count: 0
      }

      console.log('Processed announcement data:', announcementData)

      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()
        .single()

      console.log('Supabase insert result:', { 
        data, 
        hasError: !!error 
      })

      if (error) {
        console.error('Supabase insert error details:', error)
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Created announcement with ID:', data.id)
      return data.id
    } catch (error) {
      console.error('AnnouncementService.createAnnouncement error:', error)
      throw error
    }
  }

  // 更新公告
  static async updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({
          ...announcement,
          updated_at: new Date()
        })
        .eq('id', id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('更新公告失败:', error)
      throw error
    }
  }

  // 删除公告
  static async deleteAnnouncement(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('删除公告失败:', error)
      throw error
    }
  }

  // 获取单个公告
  static async getAnnouncementById(id: number): Promise<Announcement | null> {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('获取公告失败:', error)
      return null
    }
  }

  // 标记公告为Read
  static async markAnnouncementAsRead(userAddress: string, announcementId: number, clicked = false): Promise<boolean> {
    try {
      // 插入或更新Read记录
      const { error: readError } = await supabase
        .from('user_announcement_reads')
        .upsert({
          user_address: userAddress,
          announcement_id: announcementId,
          clicked,
          clicked_at: clicked ? new Date() : null,
          read_at: new Date()
        }, {
          onConflict: 'user_address,announcement_id'
        })

      if (readError) {
        console.error('Supabase read error:', readError)
        throw readError
      }

      // 更新公告的浏览或点击次数
      const updateField = clicked ? 'click_count' : 'view_count'
      const { error: updateError } = await supabase
        .rpc('increment_announcement_count', {
          announcement_id: announcementId,
          field_name: updateField
        })

      if (updateError) {
        console.error('Supabase update error:', updateError)
        // 这个错误不影响主要功能，只是统计
      }

      return true
    } catch (error) {
      console.error('标记公告Read失败:', error)
      return false
    }
  }

  // 获取公告模板
  static async getTemplates(): Promise<AnnouncementTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('announcement_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('获取模板失败:', error)
      return []
    }
  }

  // 获取公告统计
  static async getAnnouncementStats(filters: {
    status?: string
    agent_id?: number
  } = {}): Promise<{
    total: number
    published: number
    draft: number
    totalViews: number
    totalClicks: number
  }> {
    try {
      let query = supabase
        .from('announcements')
        .select('status, view_count, click_count')

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.agent_id) {
        query = query.eq('created_by_agent_id', filters.agent_id)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      const stats = data?.reduce((acc, announcement) => {
        acc.total++
        if (announcement.status === 'published') acc.published++
        if (announcement.status === 'draft') acc.draft++
        acc.totalViews += announcement.view_count || 0
        acc.totalClicks += announcement.click_count || 0
        return acc
      }, {
        total: 0,
        published: 0,
        draft: 0,
        totalViews: 0,
        totalClicks: 0
      })

      return stats || {
        total: 0,
        published: 0,
        draft: 0,
        totalViews: 0,
        totalClicks: 0
      }
    } catch (error) {
      console.error('获取统计失败:', error)
      return {
        total: 0,
        published: 0,
        draft: 0,
        totalViews: 0,
        totalClicks: 0
      }
    }
  }
} 