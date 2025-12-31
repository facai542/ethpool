'use client';

import type React from 'react';
import { Web3Detection, WalletStatus } from './index';

// 简单的使用示例
export const Web3Example: React.FC = () => {
  return (
    <Web3Detection>
      <div className="p-8 bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-6">Web3应用示例</h1>
        
        {/* 显示钱包状态 */}
        <WalletStatus showDetails={true} className="mb-6" />
        
        {/* 您的应用内容 */}
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">应用功能</h2>
          <p className="text-gray-300">
            这里是您的Web3应用的主要内容。只有在检测到Web3钱包后才会显示。
          </p>
        </div>
      </div>
    </Web3Detection>
  );
};

// 更高级的使用示例
export const AdvancedWeb3Example: React.FC = () => {
  return (
    <Web3Detection 
      showInstallGuide={true}
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">需要Web3钱包</h1>
            <p>请安装Web3钱包以继续使用</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">高级Web3应用</h1>
        
        {/* 钱包状态卡片 */}
        <div className="mb-8">
          <WalletStatus showDetails={true} />
        </div>
        
        {/* 应用功能区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">DeFi功能</h2>
            <p className="text-gray-300 mb-4">
              连接您的钱包以访问去中心化金融功能
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              开始交易
            </button>
          </div>
          
          <div className="bg-white/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">NFT市场</h2>
            <p className="text-gray-300 mb-4">
              浏览和交易NFT收藏品
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
              查看NFT
            </button>
          </div>
        </div>
      </div>
    </Web3Detection>
  );
};

