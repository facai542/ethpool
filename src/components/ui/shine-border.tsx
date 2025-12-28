"use client";

import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

interface ShineBorderProps {
  shineColor?: string[];
  className?: string;
  children?: ReactNode;
  duration?: number;
  borderRadius?: number;
  borderWidth?: number;
}

export function ShineBorder({
  shineColor = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
  children,
  duration = 14,
  borderRadius = 8,
  borderWidth = 1,
}: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-background p-[1px]",
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `conic-gradient(from 0deg, ${shineColor.join(", ")}, ${shineColor[0]})`,
          animation: `spin ${duration}s linear infinite`,
        }}
      />
      <div
        className="relative z-10 rounded-lg bg-background"
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}



