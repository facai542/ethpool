"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import ETHKLineChart from "@/components/ETHKLineChart";
import DatabaseWithRestApi from "@/components/DatabaseWithRestApi";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* 数据库动画组件 - 替代原来的文字标题 */}
      <div className="flex justify-center py-2 bg-black">
        <div className="scale-100 md:scale-125">
          <DatabaseWithRestApi
            badgeTexts={{
              first: "USDT",
              second: "USDC", 
              third: "BTC",
              fourth: "ETH"
            }}
            buttonTexts={{
              first: "挖礦平台",
              second: "實時數據"
            }}
            title="加密貨幣數據交換平台"
            circleText="API"
            lightColor="#ffdd00"
          />
        </div>
      </div>
      
      <ContainerScroll
        titleComponent={<div></div>}
      >
        <ETHKLineChart className="rounded-2xl" />
      </ContainerScroll>
    </div>
  );
}
