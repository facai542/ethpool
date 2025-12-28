"use client";

import React from 'react';

interface GlassRadioGroupProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function GlassRadioGroup({ 
  options, 
  value, 
  onChange, 
  name = "glass-radio-group" 
}: GlassRadioGroupProps) {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const translateX = activeIndex >= 0 ? activeIndex * 100 : 0;
  const itemWidth = 100 / options.length;

  return (
    <>
      <style jsx>{`
        .glass-radio-group {
          --bg: rgba(255, 255, 255, 0.06);
          --text: #e5e5e5;
          
          display: flex;
          position: relative;
          background: var(--bg);
          border-radius: 1rem;
          backdrop-filter: blur(12px);
          box-shadow:
            inset 1px 1px 4px rgba(255, 255, 255, 0.2),
            inset -1px -1px 6px rgba(0, 0, 0, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          width: 100%;
        }

        .glass-radio-group input {
          display: none;
        }

        .glass-radio-group label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 80px;
          font-size: 14px;
          padding: 0.8rem 1.6rem;
          cursor: pointer;
          font-weight: 600;
          letter-spacing: 0.3px;
          color: var(--text);
          position: relative;
          z-index: 2;
          transition: color 0.3s ease-in-out;
        }

        .glass-radio-group label:hover {
          color: white;
        }

        .glass-radio-group input:checked + label {
          color: #fff;
        }

        .glass-glider {
          position: absolute;
          top: 0;
          bottom: 0;
          width: ${itemWidth}%;
          border-radius: 1rem;
          z-index: 1;
          transition:
            transform 0.5s cubic-bezier(0.37, 1.95, 0.66, 0.56),
            background 0.4s ease-in-out,
            box-shadow 0.4s ease-in-out;
          transform: translateX(${translateX}%);
          background: linear-gradient(135deg, #facc1555, #fbbf24);
          box-shadow:
            0 0 18px rgba(250, 204, 21, 0.5),
            0 0 10px rgba(255, 235, 150, 0.4) inset;
        }
      `}</style>
      <div className="glass-radio-group">
        {options.map((option) => (
          <React.Fragment key={option.value}>
            <input
              type="radio"
              name={name}
              id={`${name}-${option.value}`}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <label htmlFor={`${name}-${option.value}`}>
              {option.label}
            </label>
          </React.Fragment>
        ))}
        <div className="glass-glider" />
      </div>
    </>
  );
}

export default GlassRadioGroup;

