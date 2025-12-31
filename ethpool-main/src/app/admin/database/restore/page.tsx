export default function DatabaseRestorePage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据库恢复</h1>
          <p className="text-slate-400">从备份文件恢复数据库</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          上传备份文件
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">恢复选项</h2>
        <div className="space-y-4">
          <div className="bg-yellow-600 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-100">
              ⚠️ 警告：数据库恢复操作将覆盖现有数据，请确保已经做好相关备份工作。
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">选择备份文件</label>
              <input 
                type="file" 
                accept=".sql,.gz,.zip"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">恢复选项</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-white">删除现有数据</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-white">创建数据库结构</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-white">导入数据</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                开始恢复
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">恢复历史</h2>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="border border-slate-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">恢复操作 #{i + 1}</h3>
                  <p className="text-slate-400 text-sm">
                    备份文件: backup_2024_01_{String(i + 1).padStart(2, '0')}.sql
                  </p>
                  <p className="text-slate-400 text-sm">
                    时间: 2024-01-{String(i + 1).padStart(2, '0')} 14:30:00
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-sm">
                    成功
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 