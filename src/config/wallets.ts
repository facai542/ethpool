import type { WalletInfo } from '@/types/web3';

export const SUPPORTED_WALLETS: WalletInfo[] = [
  // 浏览器钱包
  {
    name: 'MetaMask',
    id: 'metamask',
    icon: '🦊',
    downloadUrl: {
      browser: 'https://metamask.io/download/',
      mobile: {
        ios: 'https://apps.apple.com/app/metamask/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask'
      }
    },
    description: '最受欢迎的以太坊钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    icon: '🔵',
    downloadUrl: {
      browser: 'https://www.coinbase.com/wallet',
      mobile: {
        ios: 'https://apps.apple.com/app/coinbase-wallet/id1278383455',
        android: 'https://play.google.com/store/apps/details?id=org.toshi'
      }
    },
    description: 'Coinbase官方钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Trust Wallet',
    id: 'trust',
    icon: '🛡️',
    downloadUrl: {
      browser: 'https://trustwallet.com/browser-extension',
      mobile: {
        ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409',
        android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp'
      }
    },
    description: 'Binance官方钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Phantom',
    id: 'phantom',
    icon: '👻',
    downloadUrl: {
      browser: 'https://phantom.app/download',
      mobile: {
        ios: 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977',
        android: 'https://play.google.com/store/apps/details?id=app.phantom'
      }
    },
    description: 'Solana生态钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'imToken',
    id: 'imtoken',
    icon: '🔐',
    downloadUrl: {
      browser: 'https://token.im/download',
      mobile: {
        ios: 'https://apps.apple.com/app/imtoken2/id1384798940',
        android: 'https://play.google.com/store/apps/details?id=im.token.app'
      }
    },
    description: '专业数字资产钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'TokenPocket',
    id: 'tokenpocket',
    icon: '🎯',
    downloadUrl: {
      browser: 'https://www.tokenpocket.pro/en/download/pc',
      mobile: {
        ios: 'https://apps.apple.com/app/tokenpocket/id1288339409',
        android: 'https://play.google.com/store/apps/details?id=vip.mytokenpocket'
      }
    },
    description: '多链数字资产钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Crypto.com DeFi Wallet',
    id: 'crypto',
    icon: '💎',
    downloadUrl: {
      browser: 'https://crypto.com/defi-wallet',
      mobile: {
        ios: 'https://apps.apple.com/app/crypto-com-defi-wallet/id1512048310',
        android: 'https://play.google.com/store/apps/details?id=com.defi.wallet'
      }
    },
    description: 'Crypto.com官方钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Bitget Wallet',
    id: 'bitget',
    icon: '🦎',
    downloadUrl: {
      browser: 'https://web3.bitget.com/en/wallet-download',
      mobile: {
        ios: 'https://apps.apple.com/app/bitget-wallet/id1488080465',
        android: 'https://play.google.com/store/apps/details?id=com.bitkeep.wallet'
      }
    },
    description: 'Bitget官方钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'OKX Wallet',
    id: 'okx',
    icon: '⚡',
    downloadUrl: {
      browser: 'https://www.okx.com/web3',
      mobile: {
        ios: 'https://apps.apple.com/app/okx-buy-bitcoin-eth-crypto/id1327268470',
        android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp'
      }
    },
    description: 'OKX官方钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Rabby Wallet',
    id: 'rabby',
    icon: '🐰',
    downloadUrl: {
      browser: 'https://rabby.io/',
      mobile: {
        ios: 'https://apps.apple.com/app/rabby-wallet/id1662577818',
        android: 'https://play.google.com/store/apps/details?id=io.rabby.wallet'
      }
    },
    description: 'DeFi友好钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Rainbow',
    id: 'rainbow',
    icon: '🌈',
    downloadUrl: {
      browser: 'https://rainbow.me/',
      mobile: {
        ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
        android: 'https://play.google.com/store/apps/details?id=me.rainbow'
      }
    },
    description: '以太坊彩虹钱包',
    isMobile: false,
    category: 'both'
  },
  {
    name: 'Brave Wallet',
    id: 'brave',
    icon: '🦁',
    downloadUrl: {
      browser: 'https://brave.com/wallet/',
    },
    description: 'Brave浏览器内置钱包',
    isMobile: false,
    category: 'browser'
  }
];

export const getWalletById = (id: string): WalletInfo | undefined => {
  return SUPPORTED_WALLETS.find(wallet => wallet.id === id);
};

export const getBrowserWallets = (): WalletInfo[] => {
  return SUPPORTED_WALLETS.filter(wallet => 
    wallet.category === 'browser' || wallet.category === 'both'
  );
};

export const getMobileWallets = (): WalletInfo[] => {
  return SUPPORTED_WALLETS.filter(wallet => 
    wallet.category === 'mobile' || wallet.category === 'both'
  );
};

export const detectInstalledWallets = (): WalletInfo[] => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return [];
  }

  const installedWallets: WalletInfo[] = [];
  
  // 检测各种钱包的标识
  const walletDetectors = {
    metamask: () => window.ethereum?.isMetaMask,
    coinbase: () => window.ethereum?.isCoinbaseWallet || window.ethereum?.isCoinbaseBrowser,
    trust: () => window.ethereum?.isTrust,
    phantom: () => window.ethereum?.isPhantom,
    imtoken: () => window.ethereum?.isImToken,
    tokenpocket: () => window.ethereum?.isTokenPocket,
    crypto: () => window.ethereum?.isCryptoComWallet,
    bitget: () => window.ethereum?.isBitKeep,
    okx: () => window.ethereum?.isOkxWallet,
    rabby: () => window.ethereum?.isRabby,
    rainbow: () => window.ethereum?.isRainbow,
    brave: () => window.ethereum?.isBraveWallet
  };

  Object.entries(walletDetectors).forEach(([id, detector]) => {
    if (detector()) {
      const wallet = getWalletById(id);
      if (wallet) {
        installedWallets.push(wallet);
      }
    }
  });

  return installedWallets;
};
