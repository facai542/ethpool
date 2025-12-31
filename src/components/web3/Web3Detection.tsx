'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Provider';
import { WalletInstallGuide } from './WalletInstallGuide';
import { detectInstalledWallets } from '@/config/wallets';

interface Web3DetectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showInstallGuide?: boolean;
  autoShowGuide?: boolean;
}

export const Web3Detection: React.FC<Web3DetectionProps> = ({
  children,
  fallback,
  showInstallGuide = true,
  autoShowGuide = false
}) => {
  const { web3State, isLoading } = useWeb3();
  const [showGuide, setShowGuide] = useState(false);
  const [installedWallets, setInstalledWallets] = useState<string[]>([]);

  useEffect(() => {
    if (!web3State.isWeb3Available && autoShowGuide) {
      setShowGuide(true);
    }
  }, [web3State.isWeb3Available, autoShowGuide]);

  useEffect(() => {
    // 检测已安装的钱包
    const wallets = detectInstalledWallets();
    setInstalledWallets(wallets.map(w => w.name));
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">检测Web3钱包中...</p>
        </div>
      </div>
    );
  }

  // Web3不可用
  if (!web3State.isWeb3Available) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* 主标题 */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Web3钱包未检测到
            </h1>
            <p className="text-gray-300 text-lg">
              您需要安装Web3钱包才能使用此应用
            </p>
          </div>

          {/* 已检测到的钱包 */}
          {installedWallets.length > 0 && (
            <div className="mb-8">
              <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-4">
                <p className="text-green-400 font-medium">
                  检测到已安装的钱包: {installedWallets.join(', ')}
                </p>
                <p className="text-green-300 text-sm mt-1">
                  请确保钱包已解锁并刷新页面
                </p>
              </div>
            </div>
          )}

          {/* 安装按钮 */}
          {showInstallGuide && (
            <div className="space-y-4">
              <button
                onClick={() => setShowGuide(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                选择钱包安装
              </button>
              
              <div className="text-gray-400 text-sm">
                <p>支持MetaMask、Coinbase Wallet、Trust Wallet等主流钱包</p>
              </div>
            </div>
          )}

          {/* 移动端提示 */}
          <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500/50 rounded-xl">
            <h3 className="text-blue-400 font-semibold mb-2">移动端用户</h3>
            <p className="text-blue-300 text-sm">
              在移动设备上，建议直接在钱包应用的DApp浏览器中打开此网站
            </p>
          </div>

          {/* 错误信息 */}
          {web3State.error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 font-medium">错误信息</p>
              <p className="text-red-300 text-sm mt-1">{web3State.error}</p>
            </div>
          )}
        </div>

        {/* 钱包安装引导弹窗 */}
        {showGuide && (
          <WalletInstallGuide onClose={() => setShowGuide(false)} />
        )}
      </div>
    );
  }

  // Web3可用，显示正常内容
  return <>{children}</>;
};

// 简化版本，仅检测不显示引导
export const Web3Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { web3State, isLoading } = useWeb3();

  if (isLoading || !web3State.isWeb3Available) {
    return null;
  }

  return <>{children}</>;
};

