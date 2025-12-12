'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface Announcement {
  id: number
  title: string
  content: string
  priority: 'high' | 'normal' | 'low'
  status: 'published' | 'draft'
  target_type: 'all' | 'specific' | 'group'
  target_users?: string[]
  template_style: 'modal' | 'banner' | 'toast'
  template_config?: any
  auto_close: boolean
  auto_close_delay?: number
  start_time?: string
  end_time?: string
  view_count: number
  click_count: number
  created_at: string
  updated_at: string
}

interface EnhancedAnnouncementModalProps {
  isOpen: boolean
  onClose: () => void
  announcements: Announcement[]
  currentIndex: number
  userAddress?: string
  onAnnouncementRead?: (announcementId: number) => void
}

export function EnhancedAnnouncementModal({
  isOpen,
  onClose,
  announcements,
  currentIndex,
  userAddress,
  onAnnouncementRead
}: EnhancedAnnouncementModalProps) {
  const [isChecked, setIsChecked] = useState(false)

  const currentAnnouncement = announcements[currentIndex]

  // 移除自动关闭功能，现在需要用户手动点击复选框关闭

  const handleClose = () => {
    // 标记当前公告为已读
    if (currentAnnouncement && onAnnouncementRead) {
      onAnnouncementRead(currentAnnouncement.id)
    }
    onClose()
  }

  const handleCheckboxChange = () => {
    setIsChecked(true)
    // 延迟一点时间让用户看到动画效果
    setTimeout(() => {
      handleClose()
      setIsChecked(false) // 重置状态
    }, 800)
  }

  if (!currentAnnouncement) return null

  // 只显示有背景图片的图片模板公告弹窗
  if (!currentAnnouncement.template_config?.background_image) {
    console.log('公告没有背景图片，跳过显示:', currentAnnouncement.title)
    return null
  }

  // 检查是否为专属公告
  const isTargeted = currentAnnouncement.target_type === 'specific' && 
                    currentAnnouncement.target_users && 
                    userAddress && 
                    currentAnnouncement.target_users.includes(userAddress)

  // 显示图片模板公告弹窗
  return (
    <>
      <style jsx>{`
        .checkbox-wrapper {
          --checkbox-size: 25px;
          --checkbox-color: #00ff88;
          --checkbox-shadow: rgba(0, 255, 136, 0.3);
          --checkbox-border: rgba(0, 255, 136, 0.7);
          display: flex;
          align-items: center;
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          cursor: pointer;
          padding: 10px;
          z-index: 2147483648;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 10px;
          border: 1px solid var(--checkbox-border);
        }

        .checkbox-wrapper input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkbox-wrapper .checkmark {
          position: relative;
          width: var(--checkbox-size);
          height: var(--checkbox-size);
          border: 2px solid var(--checkbox-border);
          border-radius: 8px;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          box-shadow: 0 0 15px var(--checkbox-shadow);
          overflow: hidden;
        }

        .checkbox-wrapper .checkmark::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, var(--checkbox-color), #00ffcc);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          transform: scale(0) rotate(-45deg);
        }

        .checkbox-wrapper input:checked ~ .checkmark::before {
          opacity: 1;
          transform: scale(1) rotate(0);
        }

        .checkbox-wrapper .checkmark svg {
          width: 0;
          height: 0;
          color: #1a1a1a;
          z-index: 1;
          transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
        }

        .checkbox-wrapper input:checked ~ .checkmark svg {
          width: 18px;
          height: 18px;
          transform: rotate(360deg);
        }

        .checkbox-wrapper:hover .checkmark {
          border-color: var(--checkbox-color);
          transform: scale(1.1);
          box-shadow:
            0 0 20px var(--checkbox-shadow),
            0 0 40px var(--checkbox-shadow),
            inset 0 0 10px var(--checkbox-shadow);
        }

        .checkbox-wrapper input:checked ~ .checkmark {
          animation: pulse 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 20px var(--checkbox-shadow);
          }
          50% {
            transform: scale(0.9);
            box-shadow:
              0 0 30px var(--checkbox-shadow),
              0 0 50px var(--checkbox-shadow);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 20px var(--checkbox-shadow);
          }
        }

        .checkbox-wrapper .label {
          margin-left: 15px;
          font-family: "Segoe UI", sans-serif;
          color: var(--checkbox-color);
          font-size: 18px;
          text-shadow: 0 0 10px var(--checkbox-shadow);
          opacity: 0.9;
          transition: all 0.3s;
        }

        .checkbox-wrapper:hover .label {
          opacity: 1;
          transform: translateX(5px);
        }

        .checkbox-wrapper::after,
        .checkbox-wrapper::before {
          content: "";
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--checkbox-color);
          opacity: 0;
          transition: all 0.5s;
        }

        .checkbox-wrapper::before {
          left: -10px;
          top: 50%;
        }

        .checkbox-wrapper::after {
          right: -10px;
          top: 50%;
        }

        .checkbox-wrapper:hover::before {
          opacity: 1;
          transform: translateX(-10px);
          box-shadow: 0 0 10px var(--checkbox-color);
        }

        .checkbox-wrapper:hover::after {
          opacity: 1;
          transform: translateX(10px);
          box-shadow: 0 0 10px var(--checkbox-color);
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="announcement-dialog max-w-2xl w-[95vw] p-0 bg-transparent border-none shadow-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-auto">
          <div className="relative flex items-center justify-center min-h-0" style={{ zIndex: 2147483647 }}>
            {/* 背景图片 */}
            <img
              src={currentAnnouncement.template_config.background_image}
              alt="Announcement Background"
              className="w-full h-auto rounded-lg max-w-full"
              style={{ maxHeight: '80vh', maxWidth: '95vw', objectFit: 'contain' }}
            />

            {/* 标题区域 */}
            {currentAnnouncement.template_config.title_area && (
              <div
                className="absolute"
                style={{
                  left: currentAnnouncement.template_config.title_area.x,
                  top: currentAnnouncement.template_config.title_area.y,
                  width: currentAnnouncement.template_config.title_area.width,
                  height: currentAnnouncement.template_config.title_area.height,
                  color: '#ffffff !important',
                  fontSize: currentAnnouncement.template_config.title_font_size || '18px',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div 
                  className="w-full px-2" 
                  style={{ 
                    color: '#ffffff !important',
                    textAlign: 'center',
                    wordWrap: 'break-word',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  {currentAnnouncement.title}
                </div>
              </div>
            )}

            {/* 内容区域 */}
            {currentAnnouncement.template_config.content_area && (
              <div
                className="absolute"
                style={{
                  left: currentAnnouncement.template_config.content_area.x,
                  top: currentAnnouncement.template_config.content_area.y,
                  width: currentAnnouncement.template_config.content_area.width,
                  height: currentAnnouncement.template_config.content_area.height,
                  color: '#ffffff !important',
                  fontSize: currentAnnouncement.template_config.font_size || '14px',
                  lineHeight: '1.4',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }}
              >
                <div 
                  className="w-full h-full px-2 py-1 text-center"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    boxSizing: 'border-box',
                    minHeight: '0',
                    maxHeight: '100%'
                  }}
                >
                  <div 
                    className="break-words whitespace-pre-wrap text-left"
                    style={{ 
                      color: '#ffffff !important',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textAlign: 'center',
                      whiteSpace: 'pre-wrap',
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}
                  >
                    {currentAnnouncement.content}
                  </div>
                  
                  {/* 专属地址显示 */}
                  {isTargeted && userAddress && (
                    <div className="mt-3 pt-2 border-t border-gray-300/50">
                      <p className="text-xs opacity-80">
                        Recipient: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 多条公告导航 */}
            {announcements.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                {currentIndex + 1} / {announcements.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 自定义复选框 */}
      {isOpen && (
        <label className="checkbox-wrapper">
          <input 
            type="checkbox" 
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <div className="checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                d="M20 6L9 17L4 12"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="label">Viewed. Close the window.</span>
        </label>
      )}
    </>
  )
} 