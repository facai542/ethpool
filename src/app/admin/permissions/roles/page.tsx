export default function PermissionRolesPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">角色权限管理</h1>
          <p className="text-slate-400">管理系统角色和权限分配</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          添加角色
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">总角色数</p>
              <div className="text-2xl font-bold text-white">8</div>
            </div>
            <div className="text-3xl">👑</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">活跃角色</p>
              <div className="text-2xl font-bold text-white">6</div>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">权限总数</p>
              <div className="text-2xl font-bold text-white">45</div>
            </div>
            <div className="text-3xl">🔐</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">自定义角色</p>
              <div className="text-2xl font-bold text-white">3</div>
            </div>
            <div className="text-3xl">⚙️</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">角色列表</h2>
        <div className="space-y-4">
          {[
            { name: '超级管理员', permissions: 45, users: 2, color: 'bg-red-600' },
            { name: '管理员', permissions: 30, users: 5, color: 'bg-blue-600' },
            { name: '操作员', permissions: 15, users: 8, color: 'bg-green-600' },
            { name: '客服', permissions: 8, users: 12, color: 'bg-yellow-600' },
            { name: '财务', permissions: 12, users: 3, color: 'bg-purple-600' }
          ].map((role, i) => (
            <div key={i} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                  <div>
                    <h3 className="text-white font-medium">{role.name}</h3>
                    <p className="text-slate-400 text-sm">权限: {role.permissions}个 | 用户: {role.users}人</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    编辑
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                    复制
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