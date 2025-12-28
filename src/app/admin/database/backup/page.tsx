export default function DatabaseBackupPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据库备份</h1>
          <p className="text-slate-400">管理数据库备份和恢复</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          创建备份
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">备份总数</p>
              <div className="text-2xl font-bold text-white">23</div>
            </div>
            <div className="text-3xl">💾</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">最近备份</p>
              <div className="text-2xl font-bold text-white">2小时前</div>
            </div>
            <div className="text-3xl">🕐</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">备份大小</p>
              <div className="text-2xl font-bold text-white">1.2GB</div>
            </div>
            <div className="text-3xl">📦</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">备份列表</h2>
        <div className="space-y-4">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">backup_2024_01_{String(i + 1).padStart(2, '0')}.sql</h3>
                  <p className="text-slate-400 text-sm">创建时间: 2024-01-{String(i + 1).padStart(2, '0')} 10:30:00</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300">125.{i}MB</span>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    恢复
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    下载
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 