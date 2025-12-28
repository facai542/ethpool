"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff,
  BarChart3,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calendar,
  Globe,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/contexts/WalletContext";

// Placeholder WorldMap component
const WorldMap = ({ dots, lineColor }: { 
  dots: Array<{
    start: { lat: number; lng: number; label: string }
    end: { lat: number; lng: number; label: string }
  }>; 
  lineColor: string 
}) => {
  return (
    <div className="w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-gray-700">
      <div className="text-center">
        <Globe className="h-16 w-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-400 text-lg">Global Mining Network</p>
        <p className="text-gray-500 text-sm mt-2">Connected mining nodes worldwide</p>
      </div>
    </div>
  );
};

interface MiningPool {
  id: string;
  name: string;
  symbol: string;
  minAmount: number;
  maxAmount: number;
  apy: number;
  minProfit: number;
  maxProfit: number;
  isActive: boolean;
}

interface MiningRecord {
  id: string;
  date: string;
  amount: number;
  profit: number;
  status: "completed" | "pending" | "failed";
}

const miningPools: MiningPool[] = [
  { id: "1", name: "USDT Pool", symbol: "USDT", minAmount: 0, maxAmount: 999, apy: 0.50, minProfit: 0, maxProfit: 4.95, isActive: true },
  { id: "2", name: "USDT Pool", symbol: "USDT", minAmount: 1000, maxAmount: 4999, apy: 0.75, minProfit: 7.5, maxProfit: 37.49, isActive: true },
  { id: "3", name: "USDT Pool", symbol: "USDT", minAmount: 5000, maxAmount: 9999, apy: 1.25, minProfit: 62.5, maxProfit: 124.98, isActive: true },
  { id: "4", name: "USDT Pool", symbol: "USDT", minAmount: 10000, maxAmount: 29999, apy: 2.00, minProfit: 200, maxProfit: 599.98, isActive: true },
  { id: "5", name: "USDT Pool", symbol: "USDT", minAmount: 30000, maxAmount: 59999, apy: 3.00, minProfit: 900, maxProfit: 1799.97, isActive: true },
  { id: "6", name: "USDT Pool", symbol: "USDT", minAmount: 60000, maxAmount: 99999, apy: 3.50, minProfit: 2100, maxProfit: 3499.96, isActive: true },
];

const miningRecords: MiningRecord[] = [
  { id: "1", date: "2024-01-15", amount: 1500, profit: 11.25, status: "completed" },
  { id: "2", date: "2024-01-14", amount: 2300, profit: 17.25, status: "completed" },
  { id: "3", date: "2024-01-13", amount: 800, profit: 4.00, status: "pending" },
  { id: "4", date: "2024-01-12", amount: 5000, profit: 62.50, status: "completed" },
  { id: "5", date: "2024-01-11", amount: 1200, profit: 9.00, status: "failed" },
];

const KLineChart = ({ symbol, price, change }: { symbol: string; price: string; change: string }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1W');
  const timeframes = ['1H', '1D', '1W', '1M', 'ALL'];

  return (
    <div className="relative w-80 h-80 bg-gradient-to-br from-white via-white/10 to-transparent rounded-3xl p-0.5 shadow-[0_0_80px_-10px_rgba(255,255,255,0.15)]">
      <div className="relative w-full h-full bg-radial-gradient from-gray-700 to-black rounded-3xl flex flex-col overflow-hidden">
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gray-600/30 blur-2xl rounded-full -z-10" />
        
        {/* Time Filter Tags */}
        <div className="flex items-center justify-between p-5">
          {timeframes.map((timeframe) => (
            <label key={timeframe} className="relative flex items-center justify-center w-10 rounded-xl text-gray-400 font-semibold text-xs cursor-pointer hover:text-white transition-colors">
              <input
                type="radio"
                name={`timeframe-${symbol}`}
                value={timeframe}
                checked={activeTimeframe === timeframe}
                onChange={(e) => setActiveTimeframe(e.target.value)}
                className="hidden"
              />
              <span className={`w-full py-1.5 flex items-center justify-center rounded-xl z-10 transition-all relative ${
                activeTimeframe === timeframe 
                  ? 'text-white transform scale-110 before:absolute before:inset-1 before:bg-gray-700 before:-z-10 before:rounded-xl before:shadow-inner' 
                  : ''
              }`}>
                {activeTimeframe === timeframe && (
                  <span className="absolute inset-0 bg-gradient-to-br from-gray-600 via-gray-800 to-black rounded-xl" />
                )}
                <span className="relative z-10">{timeframe}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Price Display */}
        <div className="flex flex-col px-5 mb-4">
          <div className="text-2xl font-medium bg-gradient-to-tl from-yellow-700 via-yellow-300 to-gray-400 bg-clip-text text-transparent">
            {symbol} {price}
          </div>
          <div className="text-lg bg-gradient-to-r from-red-600 via-white to-white bg-clip-text text-transparent">
            {change}
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative flex-1 group">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex justify-between">
            {[...Array(4)].map((_, i) => (
              <span 
                key={i} 
                className="w-0.5 h-full mx-4 bg-gradient-to-t from-transparent via-white/5 to-transparent"
              />
            ))}
          </div>

          {/* Animated SVG Charts */}
          <div className="absolute inset-0 flex w-full h-full transition-transform duration-500 group-hover:scale-150">
            {/* Week Chart */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 469 262" fill="none">
              <path 
                d="M2.5 261L6.42112 216.887C6.4726 216.308 6.69121 215.757 7.05039 215.3L11.359 209.816C11.7743 209.287 12 208.635 12 207.962V202.987C12 202.346 12.2055 201.722 12.5863 201.206L27.2479 181.342C27.4151 181.115 27.5496 180.866 27.6474 180.602L31.7748 169.458C32.2107 168.281 33.333 167.5 34.588 167.5H35.5756C37.8226 167.5 39.292 169.89 38.4086 171.956C36.1137 177.322 34.0615 183.976 36.5 185.5C39.338 187.274 43.1722 202.55 45.2823 212.494C45.6701 214.321 47.5992 215.378 49.3403 214.701L53.6761 213.015C54.5141 212.689 55.1618 212.004 55.4407 211.15L78.3519 140.954C78.45 140.653 78.5 140.339 78.5 140.023V114.385C78.5 114.129 78.5327 113.875 78.5974 113.627L95.9026 47.3728C95.9673 47.1253 96 46.8705 96 46.6147V27L102.483 117.259C102.494 117.42 102.519 117.578 102.555 117.735L108.878 144.485C108.959 144.826 109.098 145.15 109.291 145.442L117.591 158.073C118.871 160.022 121.788 159.829 122.8 157.729L131.594 139.49C132.629 137.343 135.632 137.202 136.864 139.241L147.401 156.681C148.059 157.771 149.334 158.326 150.581 158.067L170.757 153.863C171.832 153.639 172.942 154.02 173.654 154.856L187.803 171.481C189.536 173.517 192.865 172.441 193.078 169.776L199.81 85.6203C200.037 82.7832 203.718 81.8273 205.297 84.1955L227.5 117.5L230.279 122.299C231.461 124.342 234.43 124.282 235.53 122.194L237.842 117.801C237.947 117.601 238.074 117.414 238.222 117.242L261.286 90.4123C262.029 89.5473 263.199 89.1789 264.304 89.4616L280.695 93.6546C282.448 94.1029 284.196 92.9099 284.416 91.1144L294.882 6.02633C295.16 3.76377 297.761 2.62601 299.611 3.95714L322.945 20.7414C323.618 21.2254 324.061 21.9662 324.168 22.7881L335.097 106.419C335.317 108.103 336.89 109.268 338.565 108.989L365.007 104.582C366.835 104.277 368.5 105.688 368.5 107.541V116.792C368.5 117.258 368.608 117.717 368.817 118.133L385.671 151.842C386.179 152.858 387.218 153.5 388.354 153.5H393.231C393.736 153.5 394.232 153.373 394.674 153.13L406.191 146.814C407.884 145.886 409.999 146.775 410.522 148.633L418.132 175.692C418.366 176.523 418.23 177.415 417.76 178.139L412.903 185.611C412.341 186.476 412.262 187.568 412.694 188.504L426.196 217.757C426.686 218.82 427.749 219.5 428.919 219.5H439.146C440.282 219.5 441.321 220.142 441.829 221.158L454.169 245.839C454.387 246.273 454.706 246.648 455.1 246.932L467 255.5" 
                stroke={`url(#paint0_linear_week_${symbol})`}
                strokeWidth="5" 
                strokeDasharray="1500"
                className="opacity-80 animate-draw"
              />
              <defs>
                <linearGradient id={`paint0_linear_week_${symbol}`} x1="3" y1="176" x2="463" y2="189" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#89FB73" stopOpacity="0.05" />
                  <stop offset="0.5" stopColor="white" />
                  <stop offset="1" stopColor="#A62727" stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Month Chart */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 472 170" fill="none">
              <path 
                d="M2.5 167L7.87783 124.955C7.95728 124.334 8.22911 123.753 8.65521 123.294L12.5765 119.071C13.6568 117.908 15.4565 117.788 16.682 118.797L23 124L28.9022 129.246C30.4289 130.603 32.8358 130.071 33.648 128.197L37.7169 118.807C38.1923 117.71 39.2738 117 40.4696 117H47.9618C49.192 117 50.2976 116.249 50.7508 115.105L60.1181 91.4638C60.3655 90.8394 60.8153 90.316 61.3955 89.9776L72.0575 83.7581C72.3504 83.5873 72.6122 83.368 72.8317 83.1097L77.1069 78.0801C78.7093 76.195 81.7764 76.9507 82.3195 79.3645L85.1283 91.848C85.359 92.8733 86.1094 93.7031 87.1064 94.0355L93.877 96.2923C95.1364 96.7121 96.522 96.2542 97.2833 95.1666L116.458 67.7747C116.811 67.2705 117 66.6698 117 66.0543V52C117 50.3431 118.343 49 120 49H137.857C138.88 49 139.834 49.5221 140.385 50.3848L150.824 66.7248C150.941 66.9077 151.077 67.0774 151.231 67.2309L155.012 71.0123C156.318 72.3175 158.481 72.1456 159.563 70.6505L165.937 61.8495C167.019 60.3544 169.182 60.1824 170.488 61.4877L179.121 70.1213C179.684 70.6839 180.447 71 181.243 71H200.338C200.774 71 201.205 71.0952 201.601 71.279L213.688 76.891C214.517 77.2758 215.476 77.2619 216.293 76.8533L221.342 74.3292C222.358 73.821 223 72.7822 223 71.6459V37.4669C223 36.2725 223.704 35.1822 224.827 34.7763C228.907 33.3021 234.813 32.0629 235.5 35.5C236.221 39.1067 245.127 48.1338 250.781 53.4172C251.786 54.3559 253.302 54.4654 254.446 53.7028L261.5 49L279.106 36.4903C279.97 35.8764 281.094 35.7639 282.062 36.1944L292.391 40.7847C293.384 41.2263 294.539 41.0957 295.409 40.4433L301.025 36.2309C301.65 35.7622 302.068 35.0683 302.189 34.2966L306.775 5.11153C307.114 2.95384 309.572 1.87012 311.394 3.07489L337.527 20.3567C338.153 20.7705 338.601 21.4037 338.783 22.1314L344.852 46.4092C345.222 47.8862 346.639 48.8524 348.148 48.6567L370.337 45.7804C371.627 45.6132 372.877 46.296 373.434 47.4713L376.858 54.6994C376.952 54.8992 377.069 55.0879 377.205 55.2621L388.12 69.2333C388.938 70.281 390.349 70.665 391.585 70.1768L405.789 64.5701C407.299 63.9741 409.009 64.687 409.648 66.1788L414.257 76.934C414.417 77.3074 414.5 77.7095 414.5 78.1158V84.3944C414.5 85.3975 415.001 86.3342 415.836 86.8906L437 101L456.676 112.518C457.212 112.832 457.638 113.304 457.894 113.869L469.5 139.5" 
                stroke={`url(#paint0_linear_month_${symbol})`}
                strokeWidth="5" 
                strokeDasharray="1500"
                className="opacity-80 animate-draw-delayed"
              />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" y2="84" x2="465.5" y1="84" x1="14" id={`paint0_linear_month_${symbol}`}>
                  <stop stopOpacity="0.1" stopColor="white" />
                  <stop stopColor="white" offset="0.5" />
                  <stop stopOpacity="0.1" stopColor="white" offset="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnimatedText = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="overflow-hidden"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

const GradientCard = ({ 
  children, 
  className = "", 
  gradient = "from-gray-800 to-gray-900" 
}: { 
  children: React.ReactNode; 
  className?: string; 
  gradient?: string; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${gradient} border border-gray-700 rounded-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const BinanceLiquidityMining = () => {
  const [showBalance, setShowBalance] = useState(true);
  
  // 使用新的钱包上下文获取USDT余额
  const {
    isConnected: isWalletConnected,
    usdtBalance,
    formattedUsdtBalance,
    isUsdtBalanceLoading,
    usdtBalanceError,
    refetchUsdtBalance
  } = useWallet();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [myMiningBalance] = useState(0.00);
  const [isMiningActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Global Mining Network */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4">
              全球流動性挖礦網絡
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              連接全球幣安用戶，實現跨地區流動性挖礦和資產配置，享受24/7不間斷的挖礦收益
            </p>
          </div>
          <WorldMap
            dots={[
              {
                start: {
                  lat: 39.9042,
                  lng: 116.4074,
                  label: "北京"
                },
                end: {
                  lat: 40.7128,
                  lng: -74.0060,
                  label: "纽约"
                },
              },
              {
                start: { 
                  lat: 35.6762, 
                  lng: 139.6503,
                  label: "东京"
                },
                end: { 
                  lat: 51.5074, 
                  lng: -0.1278,
                  label: "伦敦"
                },
              },
              {
                start: { 
                  lat: 1.3521, 
                  lng: 103.8198,
                  label: "新加坡"
                },
                end: { 
                  lat: -33.8688, 
                  lng: 151.2093,
                  label: "悉尼"
                },
              },
              {
                start: { 
                  lat: 25.2048, 
                  lng: 55.2708,
                  label: "迪拜"
                },
                end: { 
                  lat: 52.5200, 
                  lng: 13.4050,
                  label: "柏林"
                },
              },
              {
                start: { 
                  lat: -23.5505, 
                  lng: -46.6333,
                  label: "圣保罗"
                },
                end: { 
                  lat: 37.7749, 
                  lng: -122.4194,
                  label: "旧金山"
                },
              },
              {
                start: { 
                  lat: 19.4326, 
                  lng: -99.1332,
                  label: "墨西哥城"
                },
                end: { 
                  lat: 55.7558, 
                  lng: 37.6176,
                  label: "莫斯科"
                },
              },
            ]}
            lineColor="#F59E0B"
          />
        </motion.div>

        {/* K-Line Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex gap-6 justify-center"
        >
          <KLineChart symbol="BNB" price="70K" change="-2.92%" />
          <KLineChart symbol="USDT" price="70K" change="-2.92%" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* My Mining Pool */}
            <GradientCard gradient="from-gray-800 via-gray-900 to-black">
              <AnimatedText>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-xl font-bold">我的挖矿池</h2>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {showBalance ? `${myMiningBalance.toFixed(2)} USDT` : '••••••••'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                </div>
              </AnimatedText>
            </GradientCard>

            {/* Total Production */}
            <GradientCard gradient="from-blue-900 via-gray-900 to-black">
              <AnimatedText delay={0.1}>
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-bold">总产量</h2>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  Left gradient
                </div>
              </AnimatedText>
            </GradientCard>

            {/* Wallet Status */}
            <GradientCard gradient="from-red-900 via-gray-900 to-black">
              <AnimatedText delay={0.2}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-red-400" />
                    <h2 className="text-xl font-bold">钱包状态</h2>
                    <Badge variant={isWalletConnected ? "default" : "destructive"}>
                      {isWalletConnected ? "已连接" : "已断开"}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-gray-400">USDT余额</div>
                      <button
                        type="button"
                        onClick={refetchUsdtBalance}
                        disabled={isUsdtBalanceLoading}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        title={isUsdtBalanceLoading ? "正在刷新USDT余额" : "刷新USDT余额"}
                        aria-label={isUsdtBalanceLoading ? "正在刷新USDT余额" : "刷新USDT余额"}
                      >
                        <RefreshCw className={`w-3 h-3 ${isUsdtBalanceLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    {isUsdtBalanceLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                        <span className="text-sm text-gray-400">加载中...</span>
                      </div>
                    ) : usdtBalanceError ? (
                      <div className="text-sm text-red-400">
                        {usdtBalanceError}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">
                        {showBalance ? (usdtBalance || '0.00') : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">矿池状态</div>
                    <Badge variant={isMiningActive ? "default" : "secondary"}>
                      {isMiningActive ? "活跃" : "不活跃"}
                    </Badge>
                  </div>
                </div>
              </AnimatedText>
            </GradientCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Liquidity Rewards */}
            <motion.div
              style={{
                rotateX: 10,
                scale: 1,
                boxShadow:
                  "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
              }}
              className="w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
            >
              <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 p-4">
                <AnimatedText delay={0.3}>
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-green-400" />
                    <h2 className="text-xl font-bold text-white">流动性奖励收益</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {miningPools.map((pool, index) => (
                      <motion.div
                        key={pool.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-black/30 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400 mb-1">金额USDT</div>
                            <div className="font-medium text-white">
                              {pool.minAmount}-{pool.maxAmount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">回报率24H</div>
                            <div className="font-medium text-green-400 flex items-center gap-1">
                              <Percent size={12} />
                              {pool.apy.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400 mb-1">利润USDT</div>
                            <div className="font-medium text-yellow-400">
                              {pool.minProfit}-{pool.maxProfit.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </AnimatedText>
              </div>
            </motion.div>

            {/* Mining Records */}
            <motion.div
              style={{
                rotateX: 10,
                scale: 1,
                boxShadow:
                  "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
              }}
              className="w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
            >
              <div className="h-full w-full overflow-hidden rounded-2xl bg-zinc-900 p-4">
                <AnimatedText delay={0.4}>
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-6 w-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">挖矿记录</h2>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <AnimatePresence>
                      {miningRecords.map((record, index) => (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-black/30 rounded-lg p-3 border border-gray-700"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="text-sm">
                                <div className="font-medium text-white">{formatCurrency(record.amount)}</div>
                                <div className="text-gray-400 text-xs">{record.date}</div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm font-medium text-green-400">
                                {record.profit >= 0 ? (
                                  <ArrowUpRight size={12} />
                                ) : (
                                  <ArrowDownRight size={12} />
                                )}
                                +{formatCurrency(record.profit)}
                              </div>
                              <Badge 
                                variant={
                                  record.status === "completed" ? "default" :
                                  record.status === "pending" ? "secondary" : "destructive"
                                }
                                className="text-xs"
                              >
                                {record.status === "completed" ? "完成" :
                                 record.status === "pending" ? "待处理" : "失败"}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </AnimatedText>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinanceLiquidityMining;
