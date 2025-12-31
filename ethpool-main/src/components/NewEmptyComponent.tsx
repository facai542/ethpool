'use client'

import type React from 'react';
import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DraggableChatButtonProps {
  className?: string;
  onOpenChat?: () => void;
}

const DraggableChatButton: React.FC<DraggableChatButtonProps> = ({ 
  className = '', 
  onOpenChat 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (!isDragging) {
      if (onOpenChat) {
        onOpenChat();
      }
    }
  }, [isDragging, onOpenChat]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div 
      ref={constraintsRef} 
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        initial={{ x: 0, y: 0 }}
        animate={{ x: position.x, y: position.y }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`absolute right-0 top-1/2 pointer-events-auto cursor-pointer ${className}`}
        style={{ 
          width: 70, 
          height: 70,
          touchAction: 'none'
        }}
      >
        <div className="chat">
          <div className="background" />
          <svg viewBox="0 0 100 100" height={70} width={70} className="chat-bubble">
            <g className="bubble">
              <path d="M 30.7873,85.113394 30.7873,46.556405 C 30.7873,41.101961
            36.826342,35.342 40.898074,35.342 H 59.113981 C 63.73287,35.342
            69.29995,40.103201 69.29995,46.784744" className="line line1" />
              <path d="M 13.461999,65.039335 H 58.028684 C
              63.483128,65.039335
              69.243089,59.000293 69.243089,54.928561 V 45.605853 C
              69.243089,40.986964 65.02087,35.419884 58.339327,35.419884" className="line line2" />
            </g>
            <circle cx="42.5" cy="50.7" r="1.9" className="circle circle1" />
            <circle r="1.9" cy="50.7" cx="49.9" className="circle circle2" />
            <circle cx="57.3" cy="50.7" r="1.9" className="circle circle3" />
          </svg>
        </div>
      </motion.div>
      
      <style jsx>{`
        .chat {
          display: flex;
          position: relative;
        }

        .background {
          background-color: #1950ff;
          border-radius: 50%;
          box-shadow: 0 2.1px 1.3px rgba(0, 0, 0, 0.044),
            0 5.9px 4.2px rgba(0, 0, 0, 0.054), 0 12.6px 9.5px rgba(0, 0, 0, 0.061),
            0 25px 20px rgba(0, 0, 0, 0.1);
          height: 56px;
          left: 7px;
          position: absolute;
          top: 7px;
          width: 56px;
          transition: all 0.3s ease;
        }

        .chat-bubble {
          cursor: pointer;
          position: relative;
        }

        .bubble {
          transform-origin: 50%;
          transition: transform 500ms cubic-bezier(0.17, 0.61, 0.54, 0.9);
        }

        .line {
          fill: none;
          stroke: #ffffff;
          stroke-width: 2.75;
          stroke-linecap: round;
          transition: stroke-dashoffset 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .line1 {
          stroke-dasharray: 60 90;
          stroke-dashoffset: -20;
        }

        .line2 {
          stroke-dasharray: 67 87;
          stroke-dashoffset: -18;
        }

        .circle {
          fill: #ffffff;
          stroke: none;
          transform-origin: 50%;
          transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
        }

      `}</style>
    </div>
  );
}

export default DraggableChatButton;
