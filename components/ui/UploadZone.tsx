'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  currentPreview?: string
  loading?: boolean
  label?: string
  sublabel?: string
}

export function UploadZone({
  onFileSelect,
  currentPreview = '',
  loading = false,
  label = 'Add Reference Photo',
  sublabel = 'Drop an image here or click to select',
}: UploadZoneProps) {
  const [preview, setPreview] = useState(currentPreview)

  function handleFileChange(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelect(file)
  }

  return (
    <div className="glass-level-2 p-5 rounded-3xl text-center space-y-3 relative overflow-hidden">
      <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">{label}</h4>

      <label className="block aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all cursor-pointer overflow-hidden relative glass-pill group">
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.img
              key={preview}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={preview}
              alt="Uploaded reference"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-[var(--text-muted)]"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📷</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">{sublabel}</span>
              <span className="text-[10px] opacity-70">PNG, JPG up to 10MB</span>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFileChange(file)
          }}
        />
      </label>

      {loading && (
        <div className="space-y-1 pt-1">
          <div className="text-xs font-mono text-[var(--text-muted)] animate-pulse">Running AI Visual Analysis...</div>
          <div className="h-1 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--text-primary)] rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}
    </div>
  )
}
