'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'hair' | 'skin' | 'wardrobe' | 'generic'
  fallbackLabel?: string
}

export function ImageWithFallback({ src, alt, className, fallbackType = 'generic', fallbackLabel, ...props }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getFallbackIcon = () => {
    switch (fallbackType) {
      case 'hair': return '💇'
      case 'skin': return '✨'
      case 'wardrobe': return '👗'
      default: return '📷'
    }
  }

  const getFallbackText = () => {
    if (fallbackLabel) return fallbackLabel
    switch (fallbackType) {
      case 'hair': return 'Hairstyle preview'
      case 'skin': return 'Skin analysis preview'
      case 'wardrobe': return 'Clothing preview'
      default: return 'Image preview'
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[var(--bg-muted)] animate-pulse"
          />
        )}
      </AnimatePresence>

      {!hasError ? (
        <img
          src={src}
          alt={alt || getFallbackText()}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true)
            setIsLoading(false)
          }}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[var(--surface)] border border-dashed border-[var(--border-color)] text-[var(--text-muted)]">
          <span className="text-3xl mb-2 opacity-50">{getFallbackIcon()}</span>
          <span className="text-xs uppercase tracking-widest">{getFallbackText()}</span>
        </div>
      )}
    </div>
  )
}
