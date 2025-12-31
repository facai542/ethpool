"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Props for the individual currency input panel
interface CurrencyInputPanelProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  tokenSymbol: string;
  tokenIcon: string;
  usdValue: string;
  showMaxButton?: boolean;
  maxBalance?: string;
  onMaxClick?: () => void;
}

// A reusable component for the "Sell" and "Buy" sections
const CurrencyInputPanel: React.FC<CurrencyInputPanelProps> = ({
  label,
  value,
  onValueChange,
  tokenSymbol,
  tokenIcon,
  usdValue,
  showMaxButton = false,
  maxBalance,
  onMaxClick,
}) => (
  <Card className="bg-background rounded-2xl border-none shadow-none">
    <CardContent className="p-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="flex items-center justify-between gap-4">
          <Input
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="text-3xl md:text-4xl font-semibold h-auto p-0 border-none focus-visible:ring-0 shadow-none bg-transparent flex-1"
          />
          <div className="flex items-center gap-2">
            <img src={tokenIcon} alt={tokenSymbol} className="w-8 h-8 rounded-full" />
            <span className="text-lg font-medium">{tokenSymbol}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">${usdValue}</span>
          {showMaxButton && maxBalance && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{maxBalance} {tokenSymbol}</span>
              <Button variant="secondary" size="sm" className="rounded-full h-7" onClick={onMaxClick}>
                Max
              </Button>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Props for the main EthUsdtSwapCard component
export interface EthUsdtSwapCardProps extends React.HTMLAttributes<HTMLDivElement> {
  ethAmount: string;
  usdtAmount: string;
  exchangeRate: number;
  onEthAmountChange: (value: string) => void;
  onUsdtAmountChange: (value: string) => void;
  onSwap: () => void;
  onSwapPosition: () => void;
  isEthOnTop?: boolean;
  isLoading?: boolean;
  userEthBalance?: number;
  onExchangeAll?: () => void;
}

const EthUsdtSwapCard = React.forwardRef<HTMLDivElement, EthUsdtSwapCardProps>(
  ({ 
    className, 
    ethAmount,
    usdtAmount,
    exchangeRate,
    onEthAmountChange,
    onUsdtAmountChange,
    onSwap,
    onSwapPosition,
    isEthOnTop = true,
    isLoading = false,
    userEthBalance,
    onExchangeAll,
    ...props 
  }, ref) => {
    // Calculate USD values
    const ethUsdValue = ethAmount && !isNaN(parseFloat(ethAmount)) 
      ? (parseFloat(ethAmount) * exchangeRate).toFixed(2) 
      : "0.00";
    const usdtUsdValue = usdtAmount && !isNaN(parseFloat(usdtAmount))
      ? parseFloat(usdtAmount).toFixed(2)
      : "0.00";

    // Format balance for display
    const formattedBalance = userEthBalance 
      ? userEthBalance.toFixed(7).replace(/\.?0+$/, '')
      : "0";

    // Panels configuration
    const ethPanel = (
      <CurrencyInputPanel
        label="Sell"
        value={ethAmount}
        onValueChange={onEthAmountChange}
        tokenSymbol="ETH"
        tokenIcon="/1.png"
        usdValue={ethUsdValue}
        showMaxButton={!!userEthBalance}
        maxBalance={formattedBalance}
        onMaxClick={onExchangeAll}
      />
    );

    const usdtPanel = (
      <CurrencyInputPanel
        label="Buy"
        value={usdtAmount}
        onValueChange={onUsdtAmountChange}
        tokenSymbol="USDT"
        tokenIcon="/2.png"
        usdValue={usdtUsdValue}
      />
    );

    return (
      <Card
        ref={ref}
        className={cn("w-full bg-transparent border-none shadow-none", className)}
        {...props}
      >
        <CardContent className="p-0">
          {/* Exchange rate and Exchange All button */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-center text-yellow-400 text-sm flex-1">
              Exchange 1ETH={exchangeRate.toFixed(2)}USDT
            </div>
            {onExchangeAll && (
              <button 
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-xl bg-white hover:bg-gray-100 text-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                style={{ backgroundColor: '#ffffff', color: '#000000' }}
                onClick={onExchangeAll}
              >
                Exchange All
              </button>
            )}
          </div>
          
          {/* Main content with animated swap */}
          <div className="relative">
            <AnimatePresence initial={false}>
              <motion.div
                key={isEthOnTop ? "eth" : "usdt"}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white/5 rounded-2xl mb-1"
              >
                {isEthOnTop ? ethPanel : usdtPanel}
              </motion.div>
              <motion.div
                key={isEthOnTop ? "usdt" : "eth"}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white/5 rounded-2xl"
              >
                {isEthOnTop ? usdtPanel : ethPanel}
              </motion.div>
            </AnimatePresence>

            {/* Swap button in the middle */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-10">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full h-10 w-10 border-4 border-black/90 backdrop-blur-sm bg-gray-800 hover:bg-gray-700"
                onClick={onSwapPosition}
              >
                <ArrowLeftRight className="h-5 w-5 rotate-90 text-yellow-400" />
              </Button>
            </div>
          </div>
          
          {/* Swap action button */}
          <button
            className="w-full mt-6 h-14 text-lg rounded-2xl bg-white hover:bg-gray-100 text-black font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
            onClick={onSwap}
            disabled={(!ethAmount && !usdtAmount) || isLoading}
          >
            {isLoading ? 'Processing...' : 'Exchange'}
          </button>

          {/* Exchange rate info */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            1 ETH = {exchangeRate.toFixed(2)} USDT
          </div>
        </CardContent>
      </Card>
    );
  }
);

EthUsdtSwapCard.displayName = "EthUsdtSwapCard";

export { EthUsdtSwapCard };

