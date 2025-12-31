export default function PromotionMembersStatsPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">推广成员统计</h1>
          <p className="text-slate-400">查看推广成员的详细统计数据</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-sm font-medium text-white">转化率</p>
              <div className="text-2xl font-bold text-white">76.3%</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">成员分布统计</h2>
        <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
          <p className="text-slate-400">图表区域</p>
        </div>
      </div>
    </div>
  )
} 