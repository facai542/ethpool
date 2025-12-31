"use client"

import { ParticleTextEffect } from "./particle-text-effect"

interface MiningParticleTextProps {
  className?: string
  showInstructions?: boolean
  onComplete?: () => void
  displayTimePerWord?: number
}

const MINING_WORDS = [
  "ETH MINING"
]

export function MiningParticleText({ 
  className = "", 
  showInstructions = false,
  onComplete,
  displayTimePerWord = 3000
}: MiningParticleTextProps) {
  return (
    <ParticleTextEffect 
      words={MINING_WORDS}
      className={className}
      showInstructions={showInstructions}
      onComplete={onComplete}
      displayTimePerWord={displayTimePerWord}
    />
  )
}
