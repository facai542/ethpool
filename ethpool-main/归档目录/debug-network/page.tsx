'use client';

import React, { useState } from 'react';
import { enhancedFetch, checkNetworkStatus } from '@/lib/fetch-utils';

export default function DebugNetworkPage() {
  const [testResults, setTestResults] = useState<Array<{
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    duration?: number;
  }>>([]);

  const runNetworkTests = async () => {
    const tests = [
      {
        name: '网络连接状态',
        test: async () => {
          return {
            status: checkNetworkStatus() ? 'success' : 'error',
            message: checkNetworkStatus() ? '网络连接正常' : '网络连接断开'
          };
        }
      },
      {
        name: 'Supabase连接测试',
        test: async () => {
          const start = Date.now();
          try {
            const response = await enhancedFetch('/api/supabase/mining-pools');
            const duration = Date.now() - start;
            if (response.ok) {
              return { status: 'success', message: 'Supabase连接正常', duration };
            } else {
              return { status: 'error', message: `Supabase连接失败: ${response.status}`, duration };
            }
          } catch (error) {
            const duration = Date.now() - start;
            return { status: 'error', message: `Supabase连接错误: ${error}`, duration };
          }
        }
      },
      {
        name: '管理员API测试',
        test: async () => {
          const start = Date.now();
          try {
            const response = await enhancedFetch('/api/admin/stats');
            const duration = Date.now() - start;
            if (response.ok) {
              return { status: 'success', message: '管理员API连接正常', duration };
            } else {
              return { status: 'error', message: `管理员API连接失败: ${response.status}`, duration };
            }
          } catch (error) {
            const duration = Date.now() - start;
            return { status: 'error', message: `管理员API连接错误: ${error}`, duration };
          }
        }
      },
      {
        name: '用户API测试',
        test: async () => {
          const start = Date.now();
          try {
            const response = await enhancedFetch('/api/user/info?address=0x0000000000000000000000000000000000000000');
            const duration = Date.now() - start;
            if (response.ok) {
              return { status: 'success', message: '用户API连接正常', duration };
            } else {
              return { status: 'error', message: `用户API连接失败: ${response.status}`, duration };
            }
          } catch (error) {
            const duration = Date.now() - start;
            return { status: 'error', message: `用户API连接错误: ${error}`, duration };
          }
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      // 设置测试为进行中
      setTestResults(prev => [...prev, { name: test.name, status: 'pending', message: '测试中...' }]);
      
      try {
        const result = await test.test();
        results.push({ name: test.name, ...result });
        setTestResults(prev => prev.map(t => 
          t.name === test.name ? { name: test.name, ...result } : t
        ));
      } catch (error) {
        const result = { name: test.name, status: 'error' as const, message: `测试失败: ${error}` };
        results.push(result);
        setTestResults(prev => prev.map(t => 
          t.name === test.name ? result : t
        ));
      }
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          网络连接调试工具
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">API连接测试</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={runNetworkTests}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              运行网络测试
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              清除结果
            </button>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">测试结果</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.status === 'success' ? 'bg-green-500' :
                      result.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500 animate-pulse'
                    }`} />
                    <span className="text-white font-medium">{result.name}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${
                      result.status === 'success' ? 'text-green-400' :
                      result.status === 'error' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {result.message}
                    </p>
                    {result.duration && (
                      <p className="text-xs text-gray-400">
                        {result.duration}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">常见问题解决方案</h3>
          <div className="text-gray-300 space-y-2">
            <p>• <strong>Failed to fetch</strong>：检查网络连接和API服务器状态</p>
            <p>• <strong>CORS错误</strong>：确保API路由正确配置</p>
            <p>• <strong>超时错误</strong>：检查网络延迟和服务器响应时间</p>
            <p>• <strong>404错误</strong>：检查API路由是否存在</p>
            <p>• <strong>500错误</strong>：检查服务器端代码和数据库连接</p>
          </div>
        </div>
      </div>
    </div>
  );
}

