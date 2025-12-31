import React from 'react';

const SimpleEthAnimation = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      <style jsx>{`
        .background-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: url("/bg.jpg") no-repeat center center;
          background-size: cover;
          z-index: 1;
        }
        
        .meteor-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 2;
        }
        
        .meteor {
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: #fff;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(255,255,255,0.1),
                      0 0 0 8px rgba(255,255,255,0.1),
                      0 0 20px rgba(255,255,255,1);
          animation: meteor-fall 3s linear infinite;
        }
        
        .meteor::before {
          content: "";
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          height: 3px;
          background: linear-gradient(90deg, #fff, transparent);
        }
        
        .meteor-1 {
          top: 0;
          right: 0;
          animation-delay: 0s;
          animation-duration: 1s;
        }
        
        .meteor-2 {
          top: 0;
          right: 80px;
          animation-delay: 0.2s;
          animation-duration: 3s;
        }
        
        .meteor-3 {
          top: 80px;
          right: 0;
          animation-delay: 0.4s;
          animation-duration: 2s;
        }
        
        .meteor-4 {
          top: 0;
          right: 180px;
          animation-delay: 0.6s;
          animation-duration: 1.5s;
        }
        
        .meteor-5 {
          top: 0;
          right: 400px;
          animation-delay: 0.8s;
          animation-duration: 2.5s;
        }
        
        .meteor-6 {
          top: 0;
          right: 600px;
          animation-delay: 1s;
          animation-duration: 3s;
        }
        
        .meteor-7 {
          top: 300px;
          right: 0;
          animation-delay: 1.2s;
          animation-duration: 1.75s;
        }
        
        .meteor-8 {
          top: 0;
          right: 700px;
          animation-delay: 1.4s;
          animation-duration: 1.25s;
        }
        
        .meteor-9 {
          top: 0;
          right: 1000px;
          animation-delay: 0.75s;
          animation-duration: 2.25s;
        }
        
        .meteor-10 {
          top: 0;
          right: 450px;
          animation-delay: 2.75s;
          animation-duration: 2.25s;
        }
        
        @keyframes meteor-fall {
          0% {
            transform: rotate(315deg) translateX(0);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: rotate(315deg) translateX(-1000px);
            opacity: 0;
          }
        }
      `}</style>
      
      {/* 背景图片层 */}
      <div className="background-container"></div>
      
      {/* 流星雨动画层 */}
      <div className="meteor-container">
        <div className="meteor meteor-1"></div>
        <div className="meteor meteor-2"></div>
        <div className="meteor meteor-3"></div>
        <div className="meteor meteor-4"></div>
        <div className="meteor meteor-5"></div>
        <div className="meteor meteor-6"></div>
        <div className="meteor meteor-7"></div>
        <div className="meteor meteor-8"></div>
        <div className="meteor meteor-9"></div>
        <div className="meteor meteor-10"></div>
      </div>
    </div>
  );
}

export default SimpleEthAnimation;