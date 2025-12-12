'use client'

import { useLoading } from '@/contexts/LoadingContext'
import { useEffect, useState } from 'react'

export default function GlobalLoader() {
  const { isLoading } = useLoading()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
    } else {
      // 延迟隐藏，确保动画完成
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!shouldRender) return null

  return (
    <div className="global-loader-overlay">
      <div className="global-loader-container">
        <div className="loader-middle">
          <div className="loader-bar loader-bar1"></div>
          <div className="loader-bar loader-bar2"></div>
          <div className="loader-bar loader-bar3"></div>
          <div className="loader-bar loader-bar4"></div>
          <div className="loader-bar loader-bar5"></div>
          <div className="loader-bar loader-bar6"></div>
          <div className="loader-bar loader-bar7"></div>
          <div className="loader-bar loader-bar8"></div>
        </div>
        <div className="loader-text">Loading...</div>
      </div>
      
      <style jsx>{`
        .global-loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(5px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease-in-out;
        }

        .global-loader-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loader-middle {
          position: relative;
          display: flex;
          gap: 5px;
        }

        .loader-bar {
          width: 10px;
          height: 70px;
          display: inline-block;
          transform-origin: bottom center;
          border-top-right-radius: 20px;
          border-top-left-radius: 20px;
          box-shadow: 5px 10px 20px inset rgba(255, 255, 0, 0.8);
          animation: loaderAnimation 1.2s linear infinite;
        }

        .loader-bar1 { animation-delay: 0.1s; }
        .loader-bar2 { animation-delay: 0.2s; }
        .loader-bar3 { animation-delay: 0.3s; }
        .loader-bar4 { animation-delay: 0.4s; }
        .loader-bar5 { animation-delay: 0.5s; }
        .loader-bar6 { animation-delay: 0.6s; }
        .loader-bar7 { animation-delay: 0.7s; }
        .loader-bar8 { animation-delay: 0.8s; }

        .loader-text {
          color: #ffd700;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          animation: textPulse 2s ease-in-out infinite;
        }

        @keyframes loaderAnimation {
          0% {
            transform: scaleY(0.1);
            background: transparent;
          }
          50% {
            transform: scaleY(1);
            background: linear-gradient(to bottom, #ffd700, #ffff00);
          }
          100% {
            transform: scaleY(0.1);
            background: transparent;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes textPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
} 