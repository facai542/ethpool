'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  withSound?: boolean
  withHaptic?: boolean
  glowEffect?: boolean
}

export function EnhancedButton({
  children,
  className,
  variant = 'default',
  size = 'default',
  withSound = true,
  withHaptic = true,
  glowEffect = true,
  onClick,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const playClickSound = () => {
    if (withSound && typeof window !== 'undefined') {
      // Create a subtle click sound using Web Audio API
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        const audioContext = new AudioContextClass()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (error) {
        // Silently fail if audio context is not available
      }
    }
  }

  const triggerHaptic = () => {
    if (withHaptic && 'vibrate' in navigator) {
      navigator.vibrate(10) // Very short haptic feedback
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)

    playClickSound()
    triggerHaptic()

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'relative overflow-hidden transition-all duration-300 transform',
        glowEffect && 'btn-glow',
        isPressed && 'scale-95',
        'hover:scale-105 active:scale-95',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
        'before:translate-x-[-100%] before:transition-transform before:duration-700',
        'hover:before:translate-x-[100%]',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>

      {/* Ripple effect */}
      <div className="absolute inset-0 overflow-hidden bg-[#ffff00]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] transition-transform duration-1000 hover:translate-x-[100%]" />
      </div>
    </Button>
  )
}
