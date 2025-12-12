// 全局类型声明

// 扩展Window接口以包含ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isCoinbaseBrowser?: boolean;
      isTrust?: boolean;
      isPhantom?: boolean;
      isImToken?: boolean;
      isTokenPocket?: boolean;
      isCryptoComWallet?: boolean;
      isBitKeep?: boolean;
      isOkxWallet?: boolean;
      isRabby?: boolean;
      isRainbow?: boolean;
      isBraveWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export {};

