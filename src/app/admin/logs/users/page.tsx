export default function UserLogsPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户操作日志</h1>
          <p className="text-slate-400">查看用户操作记录和行为分析</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          导出日志
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">今日操作</p>
              <div className="text-2xl font-bold text-white">1,234</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">活跃用户</p>
              <div className="text-2xl font-bold text-white">567</div>
            </div>
            <div className="text-3xl">👤</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">异常操作</p>
              <div className="text-2xl font-bold text-white">12</div>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">登录次数</p>
              <div className="text-2xl font-bold text-white">890</div>
            </div>
            <div className="text-3xl">🔑</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">用户操作记录</h2>
        
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="搜索用户地址..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
          />
          <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
            <option value="all">全部操作</option>
            <option value="login">登录</option>
            <option value="transaction">交易</option>
            <option value="withdraw">提现</option>
            <option value="deposit">充值</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300">用户地址</th>
                <th className="text-left py-3 px-4 text-slate-300">操作类型</th>
                <th className="text-left py-3 px-4 text-slate-300">描述</th>
                <th className="text-left py-3 px-4 text-slate-300">IP地址</th>
                <th className="text-left py-3 px-4 text-slate-300">时间</th>
                <th className="text-left py-3 px-4 text-slate-300">状态</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => (
                <tr key={i} className="border-b border-slate-600 hover:bg-slate-700">
                  <td className="py-3 px-4 text-white font-mono text-sm">
                    0x{Math.random().toString(16).substring(2, 8)}...
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-sm">
                      {['登录', '交易', '提现', '充值'][Math.floor(Math.random() * 4)]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    用户执行了相关操作
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    192.168.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    2024-01-{String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} 14:30
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-600 text-white rounded-full text-sm">
                      成功
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 