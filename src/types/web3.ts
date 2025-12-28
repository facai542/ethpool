export interface WalletInfo {
  name: string;
  id: string;
  icon: string;
  downloadUrl: {
    desktop?: string;
    mobile?: {
      ios?: string;
      android?: string;
    };
    browser?: string;
  };
  description: string;
  isMobile: boolean;
  category: 'browser' | 'mobile' | 'both';
}

export interface Web3State {
  isWeb3Available: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  provider: any;
  error: string | null;
}

export interface Web3ContextType {
  web3State: Web3State;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
  isLoading: boolean;
}

export interface WalletDetectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showInstallGuide?: boolean;
}

