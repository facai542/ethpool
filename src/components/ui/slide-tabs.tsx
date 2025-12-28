import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlideTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  // This effect runs when the component mounts or when the selected tab changes.
  // It calculates the position of the selected tab and sets the cursor.
  useEffect(() => {
    const selectedTab = tabsRef.current[activeTab];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [activeTab]);

  return (
    <ul
      onMouseLeave={() => {
        // When the mouse leaves the container, reset the cursor
        // to the position of the currently selected tab.
        const selectedTab = tabsRef.current[activeTab];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className="relative mx-auto flex w-fit rounded-full border-2 border-yellow-500/40 bg-black/90 backdrop-blur-sm p-1 shadow-2xl"
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => (tabsRef.current[i] = el)}
          setPosition={setPosition}
          onClick={() => onTabChange(i)}
        >
          {tab}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

// The Tab component is wrapped in forwardRef to accept a ref from its parent.
const Tab = React.forwardRef<
  HTMLLIElement,
  {
    children: React.ReactNode;
    setPosition: (position: { left: number; width: number; opacity: number }) => void;
    onClick: () => void;
  }
>(({ children, setPosition, onClick }, ref) => {
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref || typeof ref === 'function' || !ref.current) return;

        const { width } = ref.current.getBoundingClientRect();

        setPosition({
          left: ref.current.offsetLeft,
          width,
          opacity: 1,
        });
      }}
      className="relative z-10 block cursor-pointer px-4 py-2 text-sm uppercase text-white md:px-6 md:py-2 md:text-sm font-bold transition-all duration-200 hover:text-yellow-400"
      style={{
        textShadow: '0 0 8px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0, 0, 0, 0.8)',
        letterSpacing: '0.8px',
      }}
    >
      {children}
    </li>
  );
});

Tab.displayName = "Tab";

const Cursor: React.FC<{ position: { left: number; width: number; opacity: number } }> = ({ position }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      className="absolute z-0 h-full rounded-full bg-yellow-500/20 shadow-xl border-2 border-yellow-500/50 inset-y-0"
    />
  );
};
