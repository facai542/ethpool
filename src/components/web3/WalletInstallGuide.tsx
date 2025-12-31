'use client';

import type React from 'react';
import { useState } from 'react';
import { type WalletInfo, SUPPORTED_WALLETS, getBrowserWallets, getMobileWallets } from '@/config/wallets';

interface WalletInstallGuideProps {
  onClose?: () => void;
}

export const WalletInstallGuide: React.FC<WalletInstallGuideProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const desktopWallets = getBrowserWallets();
  const mobileWallets = getMobileWallets();

  const handleWalletClick = (wallet: WalletInfo) => {
    let url = '';
    
    if (isMobile && wallet.downloadUrl.mobile) {
      // 检测移动端系统
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS && wallet.downloadUrl.mobile.ios) {
        url = wallet.downloadUrl.mobile.ios;
      } else if (isAndroid && wallet.downloadUrl.mobile.android) {
        url = wallet.downloadUrl.mobile.android;
      } else if (wallet.downloadUrl.browser) {
        url = wallet.downloadUrl.browser;
      }
    } else {
      url = wallet.downloadUrl.browser || wallet.downloadUrl.desktop || '';
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  const WalletCard: React.FC<{ wallet: WalletInfo }> = ({ wallet }) => (
    <div 
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
      onClick={() => handleWalletClick(wallet)}
    >
      <div className="flex items-center space-x-4">
        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
          {wallet.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
            {wallet.name}
          </h3>
          <p className="text-gray-300 text-sm mt-1">
            {wallet.description}
          </p>
        </div>
        <div className="text-blue-400 group-hover:text-blue-300 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">安装Web3钱包</h2>
              <p className="text-blue-100 mt-2">选择适合您的钱包来连接区块链</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'desktop'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>桌面端钱包</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'mobile'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/10'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>移动端钱包</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'desktop' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">浏览器扩展钱包</h3>
                <p className="text-gray-400">在浏览器中安装扩展程序，方便快速访问</p>
              </div>
              <div className="grid gap-4">
                {desktopWallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">移动端钱包应用</h3>
                <p className="text-gray-400">下载移动应用，随时随地管理您的数字资产</p>
              </div>
              <div className="grid gap-4">
                {mobileWallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700">
          <div className="text-center text-gray-400 text-sm">
            <p>安装钱包后，请刷新页面以检测连接</p>
          </div>
        </div>
      </div>
    </div>
  );
};

