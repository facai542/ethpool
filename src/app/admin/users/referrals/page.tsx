 'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/hooks/useI18n'

export default function ReferralsPage() {
  const [relations, setRelations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { t } = useI18n()

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users/referrals')
      const result = await response.json()
      
      if (result.success) {
        setRelations(result.data || [])
      }
    } catch (error) {
      console.error('获取推荐关系失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t.referralManagement}</h1>
          <p className="text-slate-400">{t.manageReferralRelations}</p>
        </div>
        <button 
          onClick={fetchReferrals} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t.loadingData : t.refreshData}
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{t.totalReferrals}</p>
              <div className="text-2xl font-bold text-white">{relations.length}</div>
            </div>
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{t.activeRelations}</p>
              <div className="text-2xl font-bold text-white">{relations.filter(r => r.status === 'active').length}</div>
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">✓</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{t.commission}</p>
              <div className="text-2xl font-bold text-white">${relations.reduce((sum, r) => sum + (r.total_commission || 0), 0).toLocaleString()}</div>
            </div>
            <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">💰</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{t.maxLevel}</p>
              <div className="text-2xl font-bold text-white">{Math.max(...relations.map(r => r.level || 0), 0)}</div>
            </div>
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">🔗</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="bg-slate-800 border-slate-700 border rounded-lg p-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t.searchReferrer}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2 bg-slate-700 border-slate-600 border rounded-md text-white placeholder-slate-400"
          />
        </div>
      </div>

      {/* 推荐关系列表 */}
      <div className="bg-slate-800 border-slate-700 border rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{t.referralList}</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              {t.loadingData}
            </div>
          ) : relations.length > 0 ? (
            <div className="space-y-4">
              {relations.filter(r => 
                !searchTerm || 
                r.referrer_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.referee_address?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((relation, index) => (
                <div key={index} className="p-4 border border-slate-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">推</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {relation.referrer_name || formatAddress(relation.referrer_address || '')}
                          </p>
                          <p className="text-slate-400 text-xs">{formatAddress(relation.referrer_address || '')}</p>
                        </div>
                      </div>

                      <div className="text-slate-400">→</div>

                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">被</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {relation.referee_name || formatAddress(relation.referee_address || '')}
                          </p>
                          <p className="text-slate-400 text-xs">{formatAddress(relation.referee_address || '')}</p>
                        </div>
                      </div>

                      <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                        L{relation.level || 1}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">{t.commissionRate}</p>
                        <p className="text-white font-bold">{relation.commission_rate || 0}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">{t.accumulatedCommission}</p>
                        <p className="text-green-400 font-bold">${(relation.total_commission || 0).toLocaleString()}</p>
                      </div>

                      <div className={`px-2 py-1 text-xs rounded ${
                        relation.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {relation.status === 'active' ? t.activeStatus : t.inactiveStatus}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>{t.createdAt}: {relation.created_at ? new Date(relation.created_at).toLocaleString('zh-CN') : '未知'}</span>
                    <span>{t.updatedAt}: {relation.updated_at ? new Date(relation.updated_at).toLocaleString('zh-CN') : '未知'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              {t.noReferralRecords}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 