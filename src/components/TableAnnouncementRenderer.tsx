'use client'

import { useState, useEffect } from 'react'

interface TableColumn {
  key: string
  title: string
  width: string
  type: 'address' | 'datetime' | 'text' | 'badge'
}

interface TableConfig {
  header_bg_color: string
  header_text_color: string
  row_bg_color: string
  row_alt_bg_color: string
  row_text_color: string
  border_color: string
  font_size: string
  header_font_size: string
  row_height: string
  header_height: string
}

interface TableAnnouncementConfig {
  template_id: number
  width: string
  height: string
  background_image: string
  table_area: {
    x: string
    y: string
    width: string
    height: string
  }
  table_config: TableConfig
  columns: TableColumn[]
  title_color: string
  text_color: string
  button_color: string
  animation: string
}

interface TableRowData {
  user_address?: string
  timestamp?: string
  message_type?: string
  status?: string
  [key: string]: any
}

interface TableAnnouncementRendererProps {
  data: TableRowData[]
  config: TableAnnouncementConfig
  title?: string
  content?: string
  targetType?: 'all' | 'specific' | 'group'
  targetUsers?: string[]
}

export function TableAnnouncementRenderer({
  data,
  config,
  title = 'Announcement',
  content = '',
  targetType = 'all',
  targetUsers = []
}: TableAnnouncementRendererProps) {
  const [tableData, setTableData] = useState<TableRowData[]>([])

  // 获取用户语言偏好
  const getLanguage = () => {
    if (typeof navigator !== 'undefined') {
      return navigator.language.startsWith('zh') ? 'zh' : 'en'
    }
    return 'en'
  }

  const lang = getLanguage()

  // 多语言文本
  const texts = {
    zh: {
      allUsers: '所有用户',
      specificUser: '指定用户',
      sent: '已发送',
      adminMessage: '管理员消息',
      messageHistory: '消息通知 - Historical records',
      read: 'Read',
      ok: '确定'
    },
    en: {
      allUsers: 'All Users',
      specificUser: 'Specific User', 
      sent: 'Sent',
      adminMessage: 'Admin Message',
      messageHistory: 'Message Notifications - History',
      read: 'Read',
      ok: 'OK'
    }
  }

  const t = texts[lang]

  useEffect(() => {
    // 根据目标类型生成表格数据
    const generateTableData = () => {
      if (targetType === 'all') {
        return [{
          user_address: 'all',
          timestamp: new Date().toISOString(),
          message_type: t.adminMessage,
          status: t.read
        }]
      } else if (targetType === 'specific' && targetUsers.length > 0) {
        return targetUsers.map(address => ({
          user_address: address,
          timestamp: new Date().toISOString(),
          message_type: t.adminMessage,
          status: t.read
        }))
      }
      return data || []
    }

    setTableData(generateTableData())
  }, [data, targetType, targetUsers, lang])

  const formatAddress = (address: string): string => {
    if (!address || address === 'all') {
      return t.allUsers
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDateTime = (timestamp: string): string => {
    try {
      // 根据语言设置显示格式
      const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
      const date = new Date(timestamp)
      
      if (lang === 'zh') {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      } else {
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    } catch {
      return timestamp
    }
  }

  const getStatusBadge = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'Sent': 'bg-green-100 text-green-800',
      'Read': 'bg-blue-100 text-blue-800',
      'Unread': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
      '已发送': 'bg-green-100 text-green-800',
      'Read': 'bg-blue-100 text-blue-800',
      '未读': 'bg-yellow-100 text-yellow-800',
      '失败': 'bg-red-100 text-red-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  const renderCellContent = (row: TableRowData, column: TableColumn) => {
    const value = row[column.key]
    
    switch (column.type) {
      case 'address':
        return formatAddress(value || '')
      case 'datetime':
        return formatDateTime(value || '')
      case 'text':
        return value || ''
      case 'badge':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(value || '')}`}>
            {value || ''}
          </span>
        )
      default:
        return value || ''
    }
  }

  return (
    <div 
      className="relative bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl mx-auto"
      style={{
        width: 'min(95vw, 700px)',
        height: 'min(80vh, 500px)',
        backgroundImage: `url(${config.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* 标题区域 */}
      <div className="absolute top-2 sm:top-4 left-0 right-0 text-center px-2 sm:px-4">
        <h2 
          className="text-lg sm:text-xl font-bold break-words"
          style={{ 
            color: config.title_color,
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          📢 {lang === 'zh' ? '消息通知 - Historical records' : 'Message Notifications - History'}
        </h2>
        {content && (
          <p 
            className="text-xs sm:text-sm mt-1 sm:mt-2 px-2 sm:px-4 break-words whitespace-pre-wrap"
            style={{ 
              color: config.text_color,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              hyphens: 'auto'
            }}
          >
            {content}
          </p>
        )}
      </div>

      {/* 表格区域 */}
      <div
        className="absolute overflow-auto px-2 sm:px-4"
        style={{
          left: 'max(10px, 5%)',
          top: 'max(100px, 20%)',
          width: 'calc(100% - max(20px, 10%))',
          height: 'calc(100% - max(150px, 35%))'
        }}
      >
        <table 
          className="w-full border-collapse bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden text-xs sm:text-sm"
          style={{ fontSize: 'min(14px, 3.5vw)' }}
        >
          <thead>
            <tr style={{ 
              backgroundColor: config.table_config.header_bg_color,
              color: config.table_config.header_text_color,
              height: 'max(35px, 8vw)'
            }}>
              {config.columns.map((column) => {
                // 翻译表头
                let headerText = column.title
                if (lang === 'zh') {
                  if (column.title === 'Message Type') headerText = '消息类型'
                  if (column.title === 'Status') headerText = '状态'
                  if (column.title === 'Date') headerText = '日期'
                  if (column.title === 'User') headerText = '用户'
                }
                
                return (
                  <th 
                    key={column.key}
                    className="px-1 sm:px-4 py-1 sm:py-2 text-left font-medium border"
                    style={{ 
                      width: 'auto',
                      borderColor: config.table_config.border_color,
                      fontSize: 'min(16px, 4vw)'
                    }}
                  >
                    {headerText}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50/50 transition-colors"
                style={{ 
                  backgroundColor: index % 2 === 0 
                    ? config.table_config.row_bg_color 
                    : config.table_config.row_alt_bg_color,
                  color: config.table_config.row_text_color,
                  height: 'max(30px, 7vw)'
                }}
              >
                {config.columns.map((column) => (
                  <td 
                    key={column.key}
                    className="px-1 sm:px-4 py-1 sm:py-2 border text-xs sm:text-sm"
                    style={{ borderColor: config.table_config.border_color }}
                  >
                    {renderCellContent(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 底部按钮区域 */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4">
        <button
          className="px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-sm sm:text-base min-w-[60px] sm:min-w-[80px]"
          style={{ backgroundColor: config.button_color }}
          onClick={() => window.parent?.postMessage?.({ type: 'close_announcement' }, '*')}
        >
          {t.ok}
        </button>
      </div>
    </div>
  )
} 