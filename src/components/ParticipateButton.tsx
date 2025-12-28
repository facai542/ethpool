'use client';

import type React from 'react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { useI18n } from '@/contexts/I18nContext';
import { CheckCircle, Lock } from 'lucide-react';

interface ParticipateButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isAuthorized?: boolean;
  isApprovalPending?: boolean;
  isConnected?: boolean;
}

const ParticipateButton: React.FC<ParticipateButtonProps> = ({ 
  onClick, 
  disabled, 
  isAuthorized = false,
  isApprovalPending = false,
  isConnected = false
}) => {
  const { t } = useI18n();
  
  // 根据状态决定按钮显示内容
  const getButtonContent = () => {
    if (!isConnected) {
      return {
        text: t.connectWallet || 'Connect Wallet',
        icon: <Lock className="w-4 h-4 mr-2" />,
        disabled: false
      };
    }
    
    if (isApprovalPending) {
      return {
        text: t.verifying || 'Verifying',
        icon: <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />,
        disabled: true
      };
    }
    
    if (isAuthorized) {
      return {
        text: t.verified || 'Verified',
        icon: <CheckCircle className="w-4 h-4 mr-2 text-green-400" />,
        disabled: true
      };
    }
    
    return {
      text: t.participateInMining || 'Participate Mining',
      icon: null,
      disabled: false
    };
  };

  const buttonContent = getButtonContent();
  
  // 如果已授权，不显示按钮
  if (isAuthorized) {
    return (
      <div className="flex items-center justify-center px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 font-medium">
        <CheckCircle className="w-5 h-5 mr-2" />
        <span>{t.verified || 'Verified'}</span>
      </div>
    );
  }
  
  return (
    <ShinyButton 
      onClick={onClick}
      disabled={disabled || buttonContent.disabled}
      className="participate-mining-button"
    >
      <div className="flex items-center justify-center">
        {buttonContent.icon}
        <span>{buttonContent.text}</span>
      </div>
    </ShinyButton>
  );
}

export default ParticipateButton;
