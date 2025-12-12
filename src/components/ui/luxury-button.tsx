'use client';

import React from 'react';
import styled from 'styled-components';

interface LuxuryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const LuxuryButton: React.FC<LuxuryButtonProps> = ({ 
  children, 
  onClick, 
  disabled = false,
  className = '',
  icon
}) => {
  return (
    <StyledWrapper className={className}>
      <button 
        className={`luxury-button ${disabled ? 'disabled' : ''}`}
        onClick={onClick}
        disabled={disabled}
        type="button"
      >
        {icon && <span className="button-icon">{icon}</span>}
        <span className="button-text">{children}</span>
        <span className="velvet-sheen" />
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  width: 100%;
  
  .luxury-button {
    position: relative;
    padding: 16px 24px;
    width: 100%;
    font-size: 14px;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #f0e4e4;
    background: #5a2e5a;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    /* Velvet base texture */
    background-image: linear-gradient(
      135deg,
      rgba(90, 46, 90, 0.9),
      rgba(45, 15, 45, 0.8)
    );
    background-blend-mode: overlay;
    background-size: cover;
    box-shadow:
      inset 3px 3px 6px rgba(0, 0, 0, 0.4),
      inset -3px -3px 6px rgba(255, 255, 255, 0.1),
      6px 6px 16px rgba(0, 0, 0, 0.5),
      -4px -4px 12px rgba(255, 255, 255, 0.05);
  }

  .luxury-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Stitching effect */
  .luxury-button::before {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border-radius: 9px;
    border: 1.5px dashed #d4a5a5;
    opacity: 0.6;
    box-shadow:
      inset 1px 1px 2px rgba(0, 0, 0, 0.3),
      1px 1px 2px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  /* Silk accent layer */
  .luxury-button::after {
    content: "";
    position: absolute;
    top: 50%;
    left: -150%;
    width: 150%;
    height: 30%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(240, 200, 200, 0.3),
      transparent
    );
    transform: translateY(-50%);
    opacity: 0.8;
    transition: all 0.5s ease;
    pointer-events: none;
  }

  /* Velvet sheen */
  .velvet-sheen {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    opacity: 0;
    transition: all 0.4s ease;
    pointer-events: none;
  }

  /* Hover effects */
  .luxury-button:not(.disabled):hover {
    transform: translateY(-3px);
    background-image: linear-gradient(
      135deg,
      rgba(100, 56, 100, 0.9),
      rgba(55, 25, 55, 0.8)
    );
    box-shadow:
      inset 2px 2px 5px rgba(0, 0, 0, 0.4),
      inset -2px -2px 5px rgba(255, 255, 255, 0.15),
      8px 8px 20px rgba(0, 0, 0, 0.55),
      -6px -6px 14px rgba(255, 255, 255, 0.08);
  }

  .luxury-button:not(.disabled):hover::before {
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    opacity: 0.9;
    border-color: #e0b5b5;
  }

  .luxury-button:not(.disabled):hover::after {
    left: 100%;
  }

  .luxury-button:not(.disabled):hover .velvet-sheen {
    opacity: 0.8;
    left: 100%;
  }

  /* Active (pressed) state */
  .luxury-button:not(.disabled):active {
    transform: translateY(2px);
    background-image: linear-gradient(
      135deg,
      rgba(70, 26, 70, 0.9),
      rgba(35, 5, 35, 0.8)
    );
    box-shadow:
      inset 5px 5px 10px rgba(0, 0, 0, 0.5),
      inset -2px -2px 5px rgba(255, 255, 255, 0.05);
  }

  .luxury-button:not(.disabled):active::before {
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    opacity: 0.5;
    border-color: #c49595;
  }

  /* Icon styling */
  .button-icon {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button-icon svg {
    width: 20px;
    height: 20px;
    filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.3));
  }

  /* Text embossing */
  .button-text {
    position: relative;
    z-index: 1;
    font-weight: 600;
    text-shadow:
      1px 1px 2px rgba(0, 0, 0, 0.4),
      -1px -1px 2px rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .luxury-button:not(.disabled):hover .button-text {
    text-shadow:
      1px 1px 3px rgba(0, 0, 0, 0.5),
      -1px -1px 3px rgba(255, 255, 255, 0.25);
  }

  .luxury-button:not(.disabled):active .button-text {
    text-shadow:
      0px 0px 1px rgba(0, 0, 0, 0.3),
      0px 0px 1px rgba(255, 255, 255, 0.1);
  }

  /* Sheen animation on focus */
  .luxury-button:focus .velvet-sheen {
    animation: velvet-sweep 0.6s ease-out;
  }

  @keyframes velvet-sweep {
    0% {
      left: -100%;
      opacity: 0;
    }
    50% {
      left: 0;
      opacity: 0.8;
    }
    100% {
      left: 100%;
      opacity: 0;
    }
  }
`;

export { LuxuryButton };
export default LuxuryButton;


