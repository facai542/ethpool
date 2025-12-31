'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastTime = useRef<number>(0)

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.3, // 减少速度
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 1.5 + 0.5, // 减少大小
    opacity: Math.random() * 0.2 + 0.05, // 减少透明度
    hue: Math.random() * 60 + 30
  }), [])

  const updateParticle = useCallback((particle: Particle, canvas: HTMLCanvasElement) => {
    particle.x += particle.vx
    particle.y += particle.vy

    // Wrap around edges
    if (particle.x < 0) particle.x = canvas.width
    if (particle.x > canvas.width) particle.x = 0
    if (particle.y < 0) particle.y = canvas.height
    if (particle.y > canvas.height) particle.y = 0

    // 减少opacity更新频率
    if (Math.random() < 0.1) {
      particle.opacity += (Math.random() - 0.5) * 0.005
      particle.opacity = Math.max(0.02, Math.min(0.2, particle.opacity))
    }
  }, [])

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save()
    ctx.globalAlpha = particle.opacity

    // 简化粒子绘制，不使用渐变
    ctx.fillStyle = `hsl(${particle.hue}, 100%, 60%)`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }, [])

  // 大幅优化连接线绘制
  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const maxDistance = 80 // 减少连接距离
    const maxConnections = 50 // 限制最大连接数
    let connectionCount = 0
    
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)' // 降低透明度
    ctx.lineWidth = 0.3

    // 只检查相邻的粒子，减少计算量
    for (let i = 0; i < particles.current.length && connectionCount < maxConnections; i++) {
      const p1 = particles.current[i]
      
      // 只检查后面的几个粒子，而不是全部
      const checkLimit = Math.min(i + 10, particles.current.length)
      for (let j = i + 1; j < checkLimit && connectionCount < maxConnections; j++) {
        const p2 = particles.current[j]
        const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

        if (distance < maxDistance) {
          ctx.globalAlpha = (maxDistance - distance) / maxDistance * 0.1
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
          connectionCount++
        }
      }
    }
    ctx.globalAlpha = 1
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置性能优化
    ctx.imageSmoothingEnabled = false

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initParticles = () => {
      particles.current = []
      // 大幅减少粒子数量
      const particleCount = Math.min(30, Math.floor((canvas.width * canvas.height) / 25000))
      for (let i = 0; i < particleCount; i++) {
        particles.current.push(createParticle(canvas))
      }
    }

    // 使用帧率限制，避免过度渲染
    const animate = (currentTime: number) => {
      if (currentTime - lastTime.current < 32) { // 限制到约30fps
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      lastTime.current = currentTime

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新和绘制粒子
      for (const particle of particles.current) {
        updateParticle(particle, canvas)
        drawParticle(ctx, particle)
      }

      // 每隔几帧才绘制连接线
      if (Math.floor(currentTime / 100) % 3 === 0) {
        drawConnections(ctx)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    initParticles()
    animationRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      resizeCanvas()
      initParticles()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createParticle, updateParticle, drawParticle, drawConnections])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'transparent',
        mixBlendMode: 'screen'
      }}
    />
  )
}
