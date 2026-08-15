'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ScoreRingProps {
  score: number
  size?: number
  label?: string
  sublabel?: string
}

export function ScoreRing({ score, size = 160, label = 'ContextMirror Score', sublabel }: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (displayScore / 100) * circumference

  // Score color based on value
  const scoreColor = score >= 85 ? 'var(--accent-gold)' : score >= 70 ? 'var(--text-primary)' : 'var(--text-muted)'

  useEffect(() => {
    let start = 0
    const duration = 1200
    const stepTime = 16
    const steps = duration / stepTime
    const increment = score / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.round(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Glow ring behind */}
      <div
        className="absolute rounded-full animate-score-glow"
        style={{
          width: size - 20,
          height: size - 20,
          opacity: score >= 85 ? 0.5 : 0.2,
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.5}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={scoreColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="font-numeric text-4xl font-bold tracking-tight"
          style={{ color: scoreColor }}
        >
          {displayScore}
        </motion.span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
          / 100
        </span>
      </div>
    </div>
  )
}
