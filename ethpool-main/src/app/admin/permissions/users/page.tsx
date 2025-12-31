export default function PermissionUsersPage() {
  return (
    <div className="p-6 space-y-6 bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户权限管理</h1>
          <p className="text-slate-400">管理用户权限和角色分配</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          分配权限
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">用户权限列表</h2>
        
        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="搜索用户..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
          />
          <select className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white">
            <option value="all">全部角色</option>
            <option value="admin">管理员</option>
            <option value="operator">操作员</option>
            <option value="user">普通用户</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4 text-slate-300">用户</th>
                <th className="text-left py-3 px-4 text-slate-300">角色</th>
                <th className="text-left py-3 px-4 text-slate-300">权限数量</th>
                <th className="text-left py-3 px-4 text-slate-300">状态</th>
                <th className="text-left py-3 px-4 text-slate-300">最后登录</th>
                <th className="text-left py-3 px-4 text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'admin', role: '超级管理员', permissions: 45, status: '在线', login: '2024-01-15 14:30' },
                { name: 'manager', role: '管理员', permissions: 30, status: '离线', login: '2024-01-15 10:20' },
                { name: 'operator1', role: '操作员', permissions: 15, status: '在线', login: '2024-01-15 13:45' },
                { name: 'support', role: '客服', permissions: 8, status: '在线', login: '2024-01-15 14:15' },
                { name: 'finance', role: '财务', permissions: 12, status: '离线', login: '2024-01-14 18:00' }
              ].map((user, i) => (
                <tr key={i} className="border-b border-slate-600 hover:bg-slate-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${user.status === '在线' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-sm">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{user.permissions}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      user.status === '在线' ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{user.login}</td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 mr-2">
                      编辑
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