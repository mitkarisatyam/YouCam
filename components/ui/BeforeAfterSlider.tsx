'use client'

import { useState } from 'react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden glass-panel select-none">
      {/* After Image (Background) */}
      <img src={afterImage} alt="After visual" className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-3 right-3 glass-pill px-2.5 py-1 text-[10px] font-bold text-[var(--text-primary)] rounded-full">
        {afterLabel}
      </span>

      {/* Before Image (Clipped Foreground) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img src={beforeImage} alt="Before visual" className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: '100%' }} />
        <span className="absolute top-3 left-3 glass-pill px-2.5 py-1 text-[10px] font-bold text-[var(--text-primary)] rounded-full">
          {beforeLabel}
        </span>
      </div>

      {/* Slider Handle Divider */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 rounded-full bg-white text-[#191919] shadow-xl flex items-center justify-center text-xs font-bold border border-gray-200">
          ↔
        </div>
      </div>

      {/* Hidden range input over container */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={e => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
      />
    </div>
  )
}
