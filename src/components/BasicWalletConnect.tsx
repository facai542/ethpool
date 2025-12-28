'use client'

import { useState, useEffect } from 'react'

// 声明window.ethereum类型
declare global {
  interface Window {
    ethereum?: any
  }
}

interface WalletInfo {
  address: string
  chainId: string
  balance: string
}

export default function BasicWalletConnect() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')

  // 检查钱包连接状态
  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [accounts[0], 'latest']
          })
          
          setWallet({
            address: accounts[0],
            chainId: chainId,
            balance: (Number.parseInt(balance, 16) / 1e18).toFixed(4)
          })
        }
      } catch (err: any) {
        console.error('检查连接失败:', err)
      }
    }
  }

  // 连接钱包
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('请安装MetaMask钱包')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })

        setWallet({
          address: accounts[0],
          chainId: chainId,
          balance: (Number.parseInt(balance, 16) / 1e18).toFixed(4)
        })

        console.log('✅ 钱包连接成功:', accounts[0])
      }
    } catch (err: any) {
      console.error('❌ 连接失败:', err)
      setError(err.message || '连接失败')
    } finally {
      setIsConnecting(false)
    }
  }

  // 断开钱包
  const disconnectWallet = () => {
    setWallet(null)
    setError('')
    console.log('🔌 钱包已断开')
  }

  // 切换网络
  const switchToNetwork = async (chainId: string) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      })
    } catch (err: any) {
      console.error('网络切换失败:', err)
      setError('网络切换失败: ' + err.message)
    }
  }

  // 监听账户和网络变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection()

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet(null)
        } else {
          checkConnection()
        }
      }

      const handleChainChanged = () => {
        checkConnection()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: string) => {
    const id = Number.parseInt(chainId, 16)
    switch (id) {
      case 1: return 'Ethereum Mainnet'
      case 56: return 'BSC Mainnet'
      case 11155111: return 'Sepolia Testnet'
      case 97: return 'BSC Testnet'
      default: return `Chain ${id}`
    }
  }

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '18px',
        fontWeight: '600',
        color: '#333'
      }}>
        🦊 钱包连接
      </h3>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {!wallet ? (
        <div>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000',
              backgroundColor: '#fcd535',
              border: 'none',
              borderRadius: '8px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              opacity: isConnecting ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.backgroundColor = '#e6c230'
              }
            }}
            onMouseLeave={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.backgroundColor = '#fcd535'
              }
            }}
          >
            {isConnecting ? '🔄 连接中...' : '🔗 连接钱包'}
          </button>
          
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center' as const
          }}>
            支持 MetaMask, Trust Wallet, 等
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>地址:</strong> {formatAddress(wallet.address)}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>网络:</strong> {getNetworkName(wallet.chainId)}
            </div>
            <div>
              <strong>余额:</strong> {wallet.balance} ETH
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
            <button
              onClick={() => switchToNetwork('0x1')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Ethereum
            </button>
            <button
              onClick={() => switchToNetwork('0x38')}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '14px',
                backgroundColor: '#f0b90b',
                color: '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              BSC
            </button>
          </div>

          <button
            onClick={disconnectWallet}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '14px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '12px'
            }}
          >
            🔌 断开连接
          </button>
        </div>
      )}
    </div>
  )
} 