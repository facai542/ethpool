import React from 'react';

export default function EthCrystalAnimation() {
  return (
    <div style={styles.body}>
      <div style={styles.circle}></div>
      <div style={styles.frame}>
        <div style={styles.poligon1}></div>
        <div style={styles.poligon2}></div>
        <div style={styles.poligon3}></div>
        <div style={styles.poligon4}></div>
        <div style={styles.poligon5}></div>
        <div style={styles.poligon6}></div>
        <div style={styles.poligon7}></div>
        <div style={styles.poligon8}></div>
      </div>
      <style>{keyframes}</style>
    </div>
  );
}

const keyframes = `
  @keyframes float-gentle {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  @keyframes glow-breathe {
    0% {
      opacity: 0.6;
      filter: blur(150px);
    }
    50% {
      opacity: 0.8;
      filter: blur(180px);
    }
    100% {
      opacity: 0.6;
      filter: blur(150px);
    }
  }
`;

const styles = {
  body: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '100vw',
    margin: 0,
    display: 'flex',
    justifyContent: 'center', // 水平居中
    alignItems: 'flex-start', // 改为顶部对齐
    paddingTop: '15vh', // 行星动画在25vh，ETH动画在15vh
    background: 'transparent',
    backgroundRepeat: 'no-repeat',
    zIndex: -1, // 确保在背景层
    overflow: 'hidden',
  },
  frame: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'float-gentle 4s ease-in-out infinite',
    transform: 'scale(0.25)', // 缩小动画
  },
  circle: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: '#22ee33',
    animation: 'glow-breathe 5s ease-in-out infinite',
    opacity: 0.7,
  },
  poligon1: {
    width: '296px',
    height: '420px',
    position: 'relative',
    backgroundRepeat: 'no-repeat',
    clipPath: 'polygon(60% 0, 60% 50%, 40% 53%, 0 60%)',
    background: 'linear-gradient(-30.9deg, #000000 48.73%, #84daff 79.31%)',
  },
  poligon2: {
    left: '59px',
    width: '296px',
    height: '420px',
    position: 'absolute',
    transform: 'scale(-1, 1)',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(-18.9deg, #000000 45.73%, #1d3d4b 75.31%)',
    clipPath: 'polygon(60% 0, 60% 50%, 40% 53%, 0 60%)',
  },
  poligon3: {
    left: 0,
    top: '50%',
    width: '355px',
    height: '280px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(20deg, #1d3d4b 55.7%, #000000 88.3%)',
    clipPath: 'polygon(50% 0, 50% 0, 50% 50%, 0 14%)',
    transform: 'scale(1, 1)',
    justifyContent: 'center',
    display: 'flex',
  },
  poligon4: {
    top: '50%',
    left: '4px',
    width: '345px',
    height: '280px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(20deg, #1d3d4b 55.7%, #000000 88.3%)',
    clipPath: 'polygon(50% 0, 50% 0, 50% 50%, 0 14%)',
    transform: 'scale(-1, 1)',
    justifyContent: 'center',
    display: 'flex',
  },
  poligon5: {
    left: '5px',
    top: '75%',
    width: '345px',
    height: '200px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(-195.7deg, #9ce1ff 20.7%, #020b0f 55%)',
    clipPath: 'polygon(50% 25%, 50% 0, 50% 60%, 0 0)',
    transform: 'scale(-1, 1) translateZ(30px)',
  },
  poligon6: {
    top: '75%',
    left: '6px',
    width: '345px',
    height: '200px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(-195.7deg, #9ce1ff 20.7%, #020b0f 55%)',
    clipPath: 'polygon(50% 25%, 50% 0, 50% 60%, 0 0)',
    transform: 'scale(1, 1) translateZ(30px)',
  },
  poligon7: {
    top: '80%',
    left: '5px',
    width: '345px',
    height: '250px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(to right, #1d3d4b 30.2%, #000000 60%)',
    clipPath: 'polygon(50% 25%, 48% 25%, 50% 60%, 0 0)',
    transform: 'scale(1, 1) rotate(5deg)',
  },
  poligon8: {
    left: '15px',
    top: '80%',
    width: '345px',
    height: '250px',
    position: 'absolute',
    backgroundRepeat: 'no-repeat',
    background: 'linear-gradient(to left, #1d3d4b 30.2%, #000000 90%)',
    clipPath: 'polygon(55% 25%, 52% 23%, 55% 60%, 0 0)',
    transform: 'scale(-1, 1) rotate(5deg)',
  },
};