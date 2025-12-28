'use client';

import type React from 'react';
import { useWeb3 } from '@/contexts/Web3Provider';

interface WalletStatusProps {
  showDetails?: boolean;
  className?: string;
}

export const WalletStatus: React.FC<WalletStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { web3State, connectWallet, disconnectWallet, isLoading } = useWeb3();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      3: 'Ropsten',
      4: 'Rinkeby',
      5: 'Goerli',
      42: 'Kovan',
      56: 'BSC',
      97: 'BSC Testnet',
      137: 'Polygon',
      80001: 'Mumbai',
      250: 'Fantom',
      43114: 'Avalanche',
      25: 'Cronos'
    };
    return networks[chainId] || `Chain ${chainId}`;
  };

  if (!web3State.isWeb3Available) {
    return (
      <div className={`bg-red-500/20 border border-red-500/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-400 font-medium">Web3不可用</span>
        </div>
        {showDetails && (
          <p className="text-red-300 text-sm mt-1">请安装Web3钱包</p>
        )}
      </div>
    );
  }

  if (!web3State.isConnected) {
    return (
      <div className={`bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-400 font-medium">钱包未连接</span>
          </div>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {isLoading ? '连接中...' : '连接钱包'}
          </button>
        </div>
        {showDetails && (
          <p className="text-yellow-300 text-sm mt-1">点击连接您的钱包</p>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-green-500/20 border border-green-500/50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400 font-medium">已连接</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          断开连接
        </button>
      </div>
      
      {showDetails && web3State.account && (
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">地址:</span>
            <span className="text-white font-mono">
              {formatAddress(web3State.account)}
            </span>
          </div>
          {web3State.chainId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">网络:</span>
              <span className="text-white">
                {getNetworkName(web3State.chainId)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

