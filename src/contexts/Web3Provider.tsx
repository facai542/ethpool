'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Web3State, Web3ContextType } from '@/types/web3';

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [web3State, setWeb3State] = useState<Web3State>({
    isWeb3Available: false,
    isConnected: false,
    account: null,
    chainId: null,
    provider: null,
    error: null
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // 检测Web3可用性
  const checkWeb3Availability = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        setWeb3State(prev => ({
          ...prev,
          isWeb3Available: true,
          provider: window.ethereum,
          error: null
        }));
        
        // 检查是否已连接
        await checkConnection();
      } else {
        setWeb3State(prev => ({
          ...prev,
          isWeb3Available: false,
          provider: null,
          error: 'Web3 wallet not detected'
        }));
      }
    } catch (error) {
      setWeb3State(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 检查连接状态
  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWeb3State(prev => ({
          ...prev,
          isConnected: accounts.length > 0,
          account: accounts[0] || null,
          chainId: chainId ? Number.parseInt(chainId, 16) : null
        }));
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Web3 wallet not detected');
      }

      setIsLoading(true);
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setWeb3State(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId: Number.parseInt(chainId, 16),
        error: null
      }));
    } catch (error) {
      setWeb3State(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Connection failed'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 断开连接
  const disconnectWallet = () => {
    setWeb3State(prev => ({
      ...prev,
      isConnected: false,
      account: null,
      chainId: null,
      error: null
    }));
  };

  // 切换网络
  const switchChain = async (chainId: number) => {
    try {
      if (!window.ethereum) {
        throw new Error('Web3 wallet not detected');
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        throw new Error('Network not supported');
      }
      throw error;
    }
  };

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setWeb3State(prev => ({
          ...prev,
          isConnected: accounts.length > 0,
          account: accounts[0] || null
        }));
      };

      const handleChainChanged = (chainId: string) => {
        setWeb3State(prev => ({
          ...prev,
          chainId: Number.parseInt(chainId, 16)
        }));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // 初始化检测
  useEffect(() => {
    checkWeb3Availability();
  }, []);

  const value: Web3ContextType = {
    web3State,
    connectWallet,
    disconnectWallet,
    switchChain,
    isLoading
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
