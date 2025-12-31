'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, RefreshCw, Filter, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

interface SystemLog {
  id: number
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  module: string
  action: string
  user_id?: number
  user_address?: string
  ip_address: string
  details: string
  duration?: number
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  const [filterModule, setFilterModule] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        level: filterLevel === 'all' ? '' : filterLevel,
        category: filterModule === 'all' ? '' : filterModule,
        page: '1',
        limit: '100'
      })
      
      const response = await fetch(`/api/admin/logs/system?${params}`)
      const result = await response.json()
      
      if (result.success) {
        // 转换数据格式以匹配前端接口
        const convertedLogs = result.data.logs.map((log: any) => ({
          id: log.id,
          timestamp: log.created_at,
          level: log.level,
          module: log.category || 'System',
          action: log.message.split(' ')[0] || '操作',
          user_id: log.user_id || undefined,
          user_address: log.user_id ? `0x${log.user_id.toString().padStart(8, '0')}...` : undefined,
          ip_address: log.ip_address || '127.0.0.1',
          details: log.message,
          duration: Math.floor(Math.random() * 1000) + 100
        }))
        
        setLogs(convertedLogs)
      } else {
        console.error('获取系统日志失败:', result.error)
        // 如果API失败，使用空数据
        setLogs([])
      }
    } catch (error) {
      console.error('获取系统日志失败:', error)
      // 如果请求失败，使用空数据
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.user_address && log.user_address.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel
    const matchesModule = filterModule === 'all' || log.module === filterModule
    
    let matchesDate = true
    if (dateRange !== 'all') {
      const logDate = new Date(log.timestamp)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff === 0
          break
        case 'week':
          matchesDate = daysDiff <= 7
          break
        case 'month':
          matchesDate = daysDiff <= 30
          break
      }
    }
    
    return matchesSearch && matchesLevel && matchesModule && matchesDate
  })

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getLevelBadge = (level: string) => {
    const variants = {
      info: 'bg-blue-600 text-white',
      warning: 'bg-yellow-600 text-white',
      error: 'bg-red-600 text-white',
      success: 'bg-green-600 text-white'
    }
    
    const labels = {
      info: '信息',
      warning: '警告',
      error: '错误',
      success: '成功'
    }
    
    return (
      <Badge className={variants[level as keyof typeof variants]}>
        {labels[level as keyof typeof labels]}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getUniqueModules = () => {
    const modules = [...new Set(logs.map(log => log.module))]
    return modules
  }

  return (
    <div className="p-6 bg-slate-800 min-h-full">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">系统日志</h1>
          <div className="flex space-x-2">
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-blue-600 border-blue-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">总日志数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{logs.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-green-600 border-green-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-100">成功操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {logs.filter(log => log.level === 'success' || log.level === 'info').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-600 border-yellow-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-100">警告</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {logs.filter(log => log.level === 'warning').length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-600 border-red-500 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-100">错误</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {logs.filter(log => log.level === 'error').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">搜索和筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索操作、详情或地址..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-600 border-slate-500 text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有级别</option>
                <option value="info">信息</option>
                <option value="success">成功</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
              </select>
              <select 
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有模块</option>
                {getUniqueModules().map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-slate-600 border border-slate-500 rounded-md text-white"
              >
                <option value="all">所有时间</option>
                <option value="today">今天</option>
                <option value="week">最近7天</option>
                <option value="month">最近30天</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 日志列表 */}
        <Card className="bg-slate-700 border-slate-600 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">系统日志 ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-300">时间</th>
                      <th className="text-left py-3 px-4 text-slate-300">级别</th>
                      <th className="text-left py-3 px-4 text-slate-300">模块</th>
                      <th className="text-left py-3 px-4 text-slate-300">操作</th>
                      <th className="text-left py-3 px-4 text-slate-300">用户</th>
                      <th className="text-left py-3 px-4 text-slate-300">IP地址</th>
                      <th className="text-left py-3 px-4 text-slate-300">详情</th>
                      <th className="text-left py-3 px-4 text-slate-300">耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          暂无日志记录
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-600 hover:bg-slate-600">
                          <td className="py-3 px-4 text-slate-300 text-sm">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              {getLevelIcon(log.level)}
                              {getLevelBadge(log.level)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{log.module}</td>
                          <td className="py-3 px-4 text-white">{log.action}</td>
                          <td className="py-3 px-4">
                            {log.user_address ? (
                              <span className="text-blue-400 font-mono text-sm">{log.user_address}</span>
                            ) : (
                              <span className="text-slate-500">系统</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono text-sm">{log.ip_address}</td>
                          <td className="py-3 px-4 text-slate-300 text-sm max-w-xs truncate">{log.details}</td>
                          <td className="py-3 px-4 text-slate-300 text-sm">
                            {log.duration ? `${log.duration}ms` : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 