export default function MessagesPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户消息管理</h1>
          <p className="text-slate-400">管理系统消息和用户通知</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          发送消息
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">总消息数</p>
              <div className="text-2xl font-bold text-white">1,234</div>
            </div>
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">📧</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Read消息</p>
              <div className="text-2xl font-bold text-white">980</div>
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">✓</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">未读消息</p>
              <div className="text-2xl font-bold text-white">254</div>
            </div>
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">📨</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">系统消息</p>
              <div className="text-2xl font-bold text-white">89</div>
            </div>
            <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">🔔</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border-slate-700 border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="搜索消息内容或用户..."
            className="flex-1 px-4 py-2 bg-slate-700 border-slate-600 border rounded-md text-white placeholder-slate-400"
          />
          <select className="px-4 py-2 bg-slate-700 border-slate-600 border rounded-md text-white">
            <option>全部状态</option>
            <option>Read</option>
            <option>未读</option>
          </select>
          <select className="px-4 py-2 bg-slate-700 border-slate-600 border rounded-md text-white">
            <option>全部类型</option>
            <option>系统消息</option>
            <option>用户消息</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800 border-slate-700 border rounded-lg">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">消息列表</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 border border-slate-600 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">U</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-medium">用户消息 #{i}</h3>
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">系统</span>
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Read</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        这是一条示例消息内容，用于展示消息管理界面的布局和样式。
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>收件人: 0x1234...5678</span>
                        <span>发送时间: 2024-01-0{i} 10:30</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                      详情
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-2">
        <button className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600">
          上一页
        </button>
        <span className="flex items-center px-4 text-slate-400">
          第 1 页，共 10 页
        </span>
        <button className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600">
          下一页
        </button>
      </div>
    </div>
  )
} 