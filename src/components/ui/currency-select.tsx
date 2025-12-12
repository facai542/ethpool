"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CurrencyOption {
  value: string;
  label: string;
  icon: string;
}

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CurrencyOption[];
  className?: string;
}

export function CurrencySelect({ value, onChange, options, className = "" }: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[#bec4cf] px-2 py-1 text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          background: 'none',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
        }}
      >
        <img 
          src={selectedOption.icon} 
          alt={selectedOption.label} 
          className="w-6 h-6 rounded-full"
        />
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-40 rounded-xl overflow-hidden z-[9999] bg-[#1a1a1a] border border-gray-600 shadow-xl"
          style={{
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors ${
                value === option.value 
                  ? "bg-yellow-500/20 text-yellow-400" 
                  : "text-[#bec4cf] hover:bg-gray-700"
              }`}
            >
              <img 
                src={option.icon} 
                alt={option.label} 
                className="w-7 h-7 rounded-full"
              />
              <span className="font-medium">{option.label}</span>
              {value === option.value && (
                <svg className="w-4 h-4 ml-auto text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

