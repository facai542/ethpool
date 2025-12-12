export default function PromotionMembersPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">推广成员管理</h1>
          <p className="text-slate-400">管理推广成员和推荐关系</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          导出数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">总推广成员</p>
              <div className="text-2xl font-bold text-white">2,345</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">活跃成员</p>
              <div className="text-2xl font-bold text-white">1,789</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">本月新增</p>
              <div className="text-2xl font-bold text-white">234</div>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">推广层级</p>
              <div className="text-2xl font-bold text-white">5</div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">推广成员列表</h2>
        
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="搜索成员地址..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
          />
          <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="inactive">未激活</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300">成员地址</th>
                <th className="text-left py-3 px-4 text-slate-300">推荐人</th>
                <th className="text-left py-3 px-4 text-slate-300">层级</th>
                <th className="text-left py-3 px-4 text-slate-300">状态</th>
                <th className="text-left py-3 px-4 text-slate-300">加入时间</th>
                <th className="text-left py-3 px-4 text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }, (_, i) => (
                <tr key={i} className="border-b border-slate-600 hover:bg-slate-700">
                  <td className="py-3 px-4 text-white font-mono text-sm">
                    0x{Math.random().toString(16).substring(2, 8)}...
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-sm">
                    0x{Math.random().toString(16).substring(2, 8)}...
                  </td>
                  <td className="py-3 px-4 text-white">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-sm">
                      L{Math.floor(Math.random() * 3) + 1}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-600 text-white rounded-full text-sm">
                      活跃
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    2024-01-{String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 mr-2">
                      详情
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      禁用
                    </button>
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