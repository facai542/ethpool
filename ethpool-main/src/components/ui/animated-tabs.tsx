"use client" 

import * as React from "react"
import { GlassRadioGroup } from "./glass-radio-group";
 
export interface AnimatedTabsProps {
  tabs: { label: string; value: string }[];
  activeTab: string;
  onTabChange: (value: string) => void;
}
 
export function AnimatedTabs({ tabs, activeTab, onTabChange }: AnimatedTabsProps) {
  return (
    <div className="w-full">
      <GlassRadioGroup
        options={tabs}
        value={activeTab}
        onChange={onTabChange}
        name="animated-tabs"
      />
    </div>
  );
}
