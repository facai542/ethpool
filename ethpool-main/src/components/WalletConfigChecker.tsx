'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function WalletConfigChecker() {
  const [configStatus, setConfigStatus] = useState<{
    isChecking: boolean;
    isLoaded: boolean;
    message: string;
    details?: string;
  }>({
    isChecking: true,
    isLoaded: false,
    message: '正在检查钱包配置...'
  })

  // 强制应用配置
  const forceApplyConfig = () => {
    if (typeof window !== 'undefined') {
      try {
        // 从环境变量获取配置，增加更多检查
        const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c482c3062b88c6cc75e14712c5249b37'
        const stakingContract = process.env.MAIN_CONTRACT_ADDRESS || '0xf50b17a057AD47Dac17eEE3E075bA568e772f79D'
        const treasuryAddress = process.env.TREASURY_ADDRESS || '0x967487daD4899Ccd5CF81108d41E83999bE1cC07'
        const usdtContract = process.env.USDT_CONTRACT || '0x55d398326f99059fF775485246999027B3197955'
        const safeTokenContract = process.env.SAFE_TOKEN_CONTRACT || '0xf50b17a057AD47Dac17eEE3E075bA568e772f79D'
        
        // 严格验证配置项
        if (!projectId || !stakingContract || !treasuryAddress || !safeTokenContract) {
          throw new Error('配置不完整：缺少必要的配置项')
        }
        
        // 获取当前配置或创建新配置
        const currentConfig = (window as any).LOCAL_CONFIG || {}
        
        // 强制设置所有必要的配置项，并增加更多验证
        const updatedConfig = {
          ...currentConfig,
          STAKING_CONTRACT: stakingContract,
          TREASURY_ADDRESS: treasuryAddress,
          SAFE_TOKEN_CONTRACT: safeTokenContract,
          PROJECT_ID: projectId,
          APPLIED: true,
          VALIDATION_TIMESTAMP: Date.now(),
          VALIDATION_HASH: btoa(stakingContract + treasuryAddress + projectId) // 增加简单的验证哈希
        }
        
        // 将配置添加到全局window对象
        (window as any).LOCAL_CONFIG = updatedConfig
        
        console.log('✅ 强制应用本地配置:', updatedConfig)
        
        // 修复web3modal和appkit配置
        const modalInstances = [
          (window as any).web3modal, 
          (window as any).appkit, 
          (window as any).appkitModal
        ]
        
        modalInstances.forEach(modal => {
          if (modal) {
            console.log('✅ 找到Web3实例，正在应用配置')
            modal.LOCAL_CONFIG = updatedConfig
          }
        })
        
        // 添加全局辅助函数，增加更多验证
        (window as any).getLocalConfig = () => (window as any).LOCAL_CONFIG
        
        // 增强配置检查函数
        (window as any).checkLocalConfig = () => {
          const config = (window as any).LOCAL_CONFIG
          const isValid = 
            config && 
            config.APPLIED === true && 
            config.STAKING_CONTRACT && 
            config.TREASURY_ADDRESS && 
            config.PROJECT_ID
          
          console.log('🔍 配置检查结果:', {
            isValid,
            config
          })
          
          return isValid
        }
        
        // 触发配置更新事件
        const configUpdatedEvent = new CustomEvent('local-config-updated', { 
          detail: updatedConfig 
        })
        window.dispatchEvent(configUpdatedEvent)
        
        return true
      } catch (error) {
        console.error('❌ 强制应用配置失败:', error)
        return false
      }
    }
    return false
  }

  // 检查本地配置是否被正确加载
  const checkLocalConfig = () => {
    setConfigStatus({
      isChecking: true,
      isLoaded: false,
      message: '正在检查钱包配置...'
    })

    setTimeout(() => {
      try {
        // 检查window对象上是否有LOCAL_CONFIG
        const localConfig = typeof window !== 'undefined' ? (window as any).LOCAL_CONFIG : null;
        
        if (!localConfig) {
          console.warn('⚠️ 未找到本地配置对象')
          // 尝试自动创建配置
          const created = forceApplyConfig();
          
          if (created) {
            setConfigStatus({
              isChecking: false,
              isLoaded: true,
              message: '钱包配置已自动创建并应用'
            });
            return;
          }
          
          setConfigStatus({
            isChecking: false,
            isLoaded: false,
            message: '未找到钱包配置',
            details: '本地配置对象未初始化，请点击"应用配置"按钮或刷新页面重试'
          })
          return
        }
        
        // 检查所有必要的配置项
        const hasRequiredFields = 
          localConfig.STAKING_CONTRACT && 
          localConfig.TREASURY_ADDRESS && 
          localConfig.SAFE_TOKEN_CONTRACT &&
          localConfig.PROJECT_ID;
          
        // 检查配置是否已被应用
        const isApplied = localConfig.APPLIED === true;
        
        console.log('🔍 本地配置检查:', {
          hasRequiredFields,
          isApplied,
          config: localConfig
        })

        if (hasRequiredFields && isApplied) {
          console.log('✅ 本地配置已正确加载并应用:', localConfig)
          setConfigStatus({
            isChecking: false,
            isLoaded: true,
            message: '钱包配置已正确加载'
          })
        } else if (hasRequiredFields && !isApplied) {
          console.warn('⚠️ 本地配置已加载但未应用')
          // 自动应用配置
          const applied = forceApplyConfig();
          
          if (applied) {
            setConfigStatus({
              isChecking: false,
              isLoaded: true,
              message: '钱包配置已自动应用'
            })
          } else {
            setConfigStatus({
              isChecking: false,
              isLoaded: false,
              message: '本地配置已忽略',
              details: '配置已加载但未被应用，请点击"应用配置"按钮'
            })
          }
        } else {
          console.warn('⚠️ 本地配置不完整')
          // 尝试自动修复配置
          const fixed = forceApplyConfig();
          
          if (fixed) {
            setConfigStatus({
              isChecking: false,
              isLoaded: true,
              message: '钱包配置已自动修复并应用'
            });
            return;
          }
          
          setConfigStatus({
            isChecking: false,
            isLoaded: false,
            message: '钱包配置不完整',
            details: `缺少必要的配置项: ${!localConfig.STAKING_CONTRACT ? 'STAKING_CONTRACT ' : ''}${!localConfig.TREASURY_ADDRESS ? 'TREASURY_ADDRESS ' : ''}${!localConfig.SAFE_TOKEN_CONTRACT ? 'SAFE_TOKEN_CONTRACT ' : ''}${!localConfig.PROJECT_ID ? 'PROJECT_ID' : ''}`
          })
        }
      } catch (error) {
        console.error('❌ 检查本地配置时出错:', error)
        setConfigStatus({
          isChecking: false,
          isLoaded: false,
          message: '检查配置时出错',
          details: error instanceof Error ? error.message : '未知错误'
        })
      }
    }, 1000)
  }

  // 手动应用配置
  const applyConfig = () => {
    forceApplyConfig();
  }

  // 刷新页面
  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  // 组件加载时检查配置
  useEffect(() => {
    checkLocalConfig()
    
    // 每2秒自动重新检查一次配置
    const interval = setInterval(() => {
      if (!configStatus.isLoaded) {
        checkLocalConfig();
      }
    }, 2000);
    
    // 监听配置更新事件
    const handleConfigUpdate = () => {
      checkLocalConfig();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('wallet:config:updated', handleConfigUpdate);
    }
    
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('wallet:config:updated', handleConfigUpdate);
      }
    };
  }, [configStatus.isLoaded])

  // 如果正在检查或已加载成功，不显示任何内容
  if (configStatus.isChecking || configStatus.isLoaded) {
    return null
  }

  // 如果配置加载失败，显示警告
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>配置错误: {configStatus.message}</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        {configStatus.details && <p>{configStatus.details}</p>}
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={checkLocalConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新检查
          </Button>
          <Button size="sm" variant="outline" onClick={applyConfig}>
            应用配置
          </Button>
          <Button size="sm" variant="destructive" onClick={handleRefresh}>
            刷新页面
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
} 