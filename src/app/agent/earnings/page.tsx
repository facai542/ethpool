'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/hooks/useI18n'

interface EarningRecord {
  id: number
  amount: number
  type: string
  source: string
  create_time: string
  remark: string
  member_address: string
}

interface EarningsStats {
  todayEarnings: number
  weekEarnings: number
  monthEarnings: number
  totalEarnings: number
  commission: number
  bonus: number
  records: EarningRecord[]
}

export default function AgentEarnings() {
  const [earnings, setEarnings] = useState<EarningsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')
  const [currentPage, setCurrentPage] = useState(1)
  const { t } = useI18n()

  useEffect(() => {
    fetchEarnings()
  }, [timeRange, currentPage])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        timeRange,
        page: currentPage.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/agent/earnings?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setEarnings(data.data)
      }
    } catch (error) {
      console.error('获取收益数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'commission': return '💰'
      case 'bonus': return '🎁'
      case 'referral': return '👥'
      default: return '📊'
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'commission': return t.referralCommission
      case 'bonus': return t.bonusRewards
      case 'referral': return t.referralRewards
      default: return t.income
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t.earningsManagement}</h1>
        <p className="text-gray-400 mt-1">{t.viewAgentEarnings}</p>
      </div>

      {/* 收益统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-100">{t.todayEarnings}</h3>
              <p className="text-2xl font-bold text-white">¥{earnings?.todayEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-100">{t.weekEarnings}</h3>
              <p className="text-2xl font-bold text-white">¥{earnings?.weekEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-100">{t.monthEarnings}</h3>
              <p className="text-2xl font-bold text-white">¥{earnings?.monthEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mr-4">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-100">{t.totalEarnings}</h3>
              <p className="text-2xl font-bold text-white">¥{earnings?.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 收益分类统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">{t.earningsCategory}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-300">{t.referralCommission}</span>
              </div>
              <span className="text-white font-semibold">¥{earnings?.commission?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-300">{t.bonusRewards}</span>
              </div>
              <span className="text-white font-semibold">¥{earnings?.bonus?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">{t.earningsTrend}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{t.dailyAverageEarnings}</span>
              <span className="text-white">¥{((earnings?.monthEarnings || 0) / 30).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.earningsRate}</span>
              <span className="text-green-400">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{t.activeDays}</span>
              <span className="text-white">25天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 收益记录 */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h3 className="text-lg font-semibold text-white">{t.earningsRecords}</h3>
            
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                title="Select time range"
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">{t.recentWeek}</option>
                <option value="month">{t.recentMonth}</option>
                <option value="quarter">{t.recentQuarter}</option>
                <option value="all">{t.allRecords}</option>
              </select>
              
              <button
                onClick={fetchEarnings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.refresh}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t.type}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t.amount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t.source}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t.time}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t.remark}
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {earnings?.records && earnings.records.length > 0 ? (
                earnings.records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getTypeIcon(record.type)}</span>
                        <span className="text-sm text-white">{getTypeName(record.type)}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-semibold">
                        +¥{record.amount?.toFixed(2)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {record.member_address ? 
                          `${record.member_address.slice(0, 6)}...${record.member_address.slice(-4)}` :
                          record.source || '系统'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(record.create_time).toLocaleString('zh-CN')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {record.remark || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    {t.noEarningsRecords}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 
 
 