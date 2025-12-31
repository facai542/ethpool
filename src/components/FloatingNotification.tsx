import type React from 'react'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

interface FloatingNotificationProps {
  userAddress?: string
}

interface Announcement {
  id: number
  title: string
  content: string
  type: 'system' | 'admin'
  created_at: string
  is_read?: boolean
}

const FloatingNotification: React.FC<FloatingNotificationProps> = ({ userAddress }) => {
  const [showHistory, setShowHistory] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useI18n()

  // 只在打开Historical records时获取公告
  const fetchAnnouncements = async () => {
    if (!userAddress) return
    
    setIsLoading(true)
    try {
      // 获取历史公告（包括Read和未读）
      const response = await fetch(`/api/announcements?user_address=${userAddress}&include_read=true`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAnnouncements(result.data.announcements || [])
        }
      }
    } catch (error) {
      console.error('获取公告失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationClick = () => {
    setShowHistory(true)
    // 打开时才获取历史公告
    fetchAnnouncements()
  }

  const handleCloseHistory = () => {
    setShowHistory(false)
  }

  const markAsRead = async (announcementId: number) => {
    try {
      // 这里可以添加标记Read的API调用
      // await fetch(`/api/announcements/${announcementId}/read`, { method: 'POST' })
      
      // 本地更新状态
      setAnnouncements(prev => 
        prev.map(ann => 
          ann.id === announcementId ? { ...ann, is_read: true } : ann
        )
      )
    } catch (error) {
      console.error('标记Read失败:', error)
    }
  }

  // 如果没有钱包地址，不显示通知按钮
  if (!userAddress) {
    return null
  }

  return (
    <>
      {/* 悬浮通知按钮 - 深色主题 */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50">
        <button
          onClick={handleNotificationClick}
          className="relative bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-3 group border border-gray-600/50"
          title={t.viewNotifications}
          aria-label={t.viewNotifications}
        >
          <img 
            src="/tongzhi.svg" 
            alt={t.notifications} 
            className="w-8 h-8 group-hover:scale-110 transition-transform duration-300 filter invert" 
          />
          {/* 移除未读数量显示，避免重复 */}
        </button>
      </div>

      {/* 历史公告弹窗 - 深色主题 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-gray-700">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <h3 className="text-lg font-bold text-white">📢 {t.notifications} - Historical records</h3>
              <button
                onClick={handleCloseHistory}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
                title={t.close}
                aria-label={t.close}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* 公告列表 */}
            <div className="overflow-y-auto max-h-[60vh] bg-gray-900">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  {t.loading}
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  ®Historical records
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 hover:bg-gray-800 cursor-pointer transition-colors ${
                        !announcement.is_read ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => markAsRead(announcement.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">
                            {announcement.title}
                          </h4>
                          <p className="text-sm text-gray-300 mb-2 leading-relaxed">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.type === 'system' 
                                ? 'bg-blue-900/50 text-blue-300 border border-blue-700' 
                                : 'bg-green-900/50 text-green-300 border border-green-700'
                            }`}>
                              {announcement.type === 'system' ? `🔔 ${t.systemAnnouncement}` : `👤 ${t.adminMessage}`}
                            </span>
                            <span>📅 {new Date(announcement.created_at).toLocaleString()}</span>
                            {announcement.is_read && (
                              <span className="text-green-500">✓ Read</span>
                            )}
                          </div>
                        </div>
                        {!announcement.is_read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            {announcements.length > 0 && (
              <div className="p-3 bg-gray-800 border-t border-gray-700 text-center text-xs text-gray-400">
                Click on the announcement to mark it as Read
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FloatingNotification 