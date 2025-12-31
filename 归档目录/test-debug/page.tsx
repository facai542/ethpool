'use client'

export default function TestDebugPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🧪 测试页面</h1>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">测试功能</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">1. 基本API测试</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test/eth-price')
                    const result = await response.json()
                    console.log('ETH价格API测试:', result)
                    alert('ETH价格API测试成功，请查看控制台')
                  } catch (error) {
                    console.error('ETH价格API测试失败:', error)
                    alert('ETH价格API测试失败，请查看控制台')
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
              >
                测试ETH价格API
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">2. 用户信息API测试</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/info?address=0x1234567890123456789012345678901234567890')
                    const result = await response.json()
                    console.log('用户信息API测试:', result)
                    alert('用户信息API测试完成，请查看控制台')
                  } catch (error) {
                    console.error('用户信息API测试失败:', error)
                    alert('用户信息API测试失败，请查看控制台')
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white"
              >
                测试用户信息API
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">3. 链上余额API测试</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/blockchain/usdt-balance', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ address: '0x2a2eAe05aa9eBA985A1243cbfc67808aF0192141' })
                    })
                    const result = await response.json()
                    console.log('链上余额API测试:', result)
                    alert('链上余额API测试完成，请查看控制台')
                  } catch (error) {
                    console.error('链上余额API测试失败:', error)
                    alert('链上余额API测试失败，请查看控制台')
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
              >
                测试链上余额API
              </button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4. 授权API测试</h3>
              <button 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/user/authorize', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        address: '0x1234567890123456789012345678901234567890',
                        isAuthorized: false
                      })
                    })
                    const result = await response.json()
                    console.log('授权API测试:', result)
                    alert('授权API测试完成，请查看控制台')
                  } catch (error) {
                    console.error('授权API测试失败:', error)
                    alert('授权API测试失败，请查看控制台')
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                测试授权API
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded">
            <h3 className="text-lg font-medium mb-2">说明</h3>
            <p className="text-gray-300 text-sm">
              点击上面的按钮测试各个API功能。如果测试成功，说明API正常工作。
              如果测试失败，请查看浏览器控制台的错误信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
