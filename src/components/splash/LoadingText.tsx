'use client';

import { motion } from 'framer-motion';

export function LoadingText() {
  return (
    <div className="relative">
      <style>{`
        .spinner {
          height: 50px;
          width: max-content;
          font-size: 18px;
          font-weight: 600;
          font-family: monospace;
          letter-spacing: 1em;
          color: #f5f5f5;
          filter: drop-shadow(0 0 10px);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .spinner span {
          animation: loading6454 1.75s ease infinite;
        }

        @keyframes loading6454 {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        .spinner span:nth-child(1) { color: hsl(calc(360 / 7 * 0), 80%, 60%); }
        .spinner span:nth-child(2) { color: hsl(calc(360 / 7 * 1), 80%, 60%); animation-delay: 0.25s; }
        .spinner span:nth-child(3) { color: hsl(calc(360 / 7 * 2), 80%, 60%); animation-delay: 0.5s; }
        .spinner span:nth-child(4) { color: hsl(calc(360 / 7 * 3), 80%, 60%); animation-delay: 0.75s; }
        .spinner span:nth-child(5) { color: hsl(calc(360 / 7 * 4), 80%, 60%); animation-delay: 1s; }
        .spinner span:nth-child(6) { color: hsl(calc(360 / 7 * 5), 80%, 60%); animation-delay: 1.25s; }
        .spinner span:nth-child(7) { color: hsl(calc(360 / 7 * 6), 80%, 60%); animation-delay: 1.5s; }
      `}</style>
      
      <motion.div
        className="spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span>L</span>
        <span>O</span>
        <span>A</span>
        <span>D</span>
        <span>I</span>
        <span>N</span>
        <span>G</span>
      </motion.div>
    </div>
  );
}


