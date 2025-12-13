"use client";

import { Users, TrendingUp, Coins, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface InviteStatsProps {
  stats: {
    totalInvites: number;
    activeMiners: number;
    totalRewards: number;
    pendingRewards: number;
  };
}

export function InviteStats({ stats }: InviteStatsProps) {
  // Generate sample bar data based on totalInvites (simulating invite trend over time)
  const generateBarData = (total: number) => {
    const days = 24;
    const data = [];
    let accumulated = 0;
    for (let i = 0; i < days; i++) {
      const growth = Math.random() * (total / days) * 1.5;
      accumulated += growth;
      data.push(Math.min(accumulated, total) / total);
    }
    return data;
  };

  const barData = generateBarData(stats.totalInvites);
  const maxValue = Math.max(...barData, 0.1); // 避免除零
  const normalizedData = barData.map((value) => value / maxValue);

  // Animation variants for bars
  const barVariants = {
    hidden: { scaleY: 0 },
    visible: (i: number) => ({
      scaleY: 1,
      transition: {
        delay: i * 0.015,
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
  };

  const statItems = [
    {
      icon: Users,
      label: '累计邀请',
      value: stats.totalInvites,
      suffix: '人',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: TrendingUp,
      label: '活跃矿工',
      value: stats.activeMiners,
      suffix: '人',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Coins,
      label: '累计奖励',
      value: stats.totalRewards.toFixed(4),
      suffix: 'ETH',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Clock,
      label: '待领取',
      value: stats.pendingRewards.toFixed(4),
      suffix: 'ETH',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="w-full rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-blue-950/30 to-pink-950/40 backdrop-blur-sm shadow-xl px-4 md:px-6 py-4 md:py-6">
      <div className="flex gap-4 md:gap-8">
        {/* Left side - Bar graph showing invite trend */}
        <div className="flex-1 min-w-0">
          <div className="mb-3 md:mb-4">
            <div className="text-purple-200 text-xs md:text-sm mb-1">邀请趋势</div>
            <div className="flex items-baseline gap-1.5 md:gap-2">
              <span className="text-white text-xl md:text-3xl">{stats.totalInvites}</span>
              <span className="text-purple-300 text-sm md:text-base">位好友</span>
            </div>
          </div>

          {/* Bar graph */}
          <div className="relative pr-8 md:pr-10">
            {/* Y-axis labels */}
            <div className="absolute right-0 top-0 flex h-24 md:h-32 flex-col justify-between text-[10px] md:text-xs text-purple-400/60">
              <span>{stats.totalInvites}</span>
              <span>{Math.floor(stats.totalInvites / 2)}</span>
              <span>0</span>
            </div>

            {/* Horizontal guide lines */}
            <div className="absolute inset-0 flex h-24 md:h-32 flex-col justify-between pointer-events-none">
              <div className="h-px border-t border-dashed border-purple-500/20" />
              <div className="h-px border-t border-dashed border-purple-500/20" />
              <div className="h-px border-t border-dashed border-purple-500/20" />
            </div>

            {/* Bars */}
            <div className="mb-1.5 md:mb-2 flex h-24 md:h-32 items-end gap-[1.5px] md:gap-[2px] relative z-10">
              {normalizedData.map((height, index) => {
                const isHighlighted = height > 0.7;
                const barColor = isHighlighted
                  ? "bg-gradient-to-t from-purple-500 to-purple-400"
                  : "bg-purple-500/40";

                return (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={barVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex-1 rounded-t-sm origin-bottom ${barColor}`}
                    style={{ height: `${height * 100}%` }}
                  />
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[10px] md:text-xs text-purple-400/60">
              <span>7天前</span>
              <span>3天前</span>
              <span>今天</span>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="w-px bg-purple-500/20" />

        {/* Right side - Stats list */}
        <div className="flex flex-col gap-2 md:gap-4 justify-center min-w-[140px] sm:min-w-[180px] md:min-w-[280px]">
          {statItems
            .filter(item => item.label !== '活跃矿工' && item.label !== '待领取')
            .map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center gap-2 md:gap-4 bg-white/5 rounded-lg p-2 md:p-3 border border-purple-500/20 hover:border-purple-400/40 transition-all"
              >
                <div className={`p-1.5 md:p-2 flex-shrink-0`}>
                  <img 
                    src="https://cy-747263170.imgix.net/top-certification-tick-dark.png" 
                    alt=""
                    className="w-6 h-6 md:w-8 md:h-8"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-purple-300 text-[10px] md:text-xs mb-0.5">{item.label}</div>
                  <div className="flex items-baseline gap-1 md:gap-1.5">
                    <span className="text-white text-sm md:text-base truncate">{item.value}</span>
                    <span className="text-purple-400 text-xs md:text-sm flex-shrink-0">{item.suffix}</span>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}

