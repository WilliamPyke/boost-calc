import React, { FC } from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

export const Slider: FC<SliderProps> = ({ value, min, max, step = 0.01, onChange, disabled = false }) => {
  // Clamp value between min and max
  const safeValue = Math.min(Math.max(value, min), max);
  
  // Calculate percentage for visual track
  const percentage = max > min ? ((safeValue - min) / (max - min)) * 100 : 0;

  // Thumb element: 20px (w-5), ring adds 2px each side = 24px total visual
  // Container has 12px padding each side (px-3) to fit the full thumb + ring
  // Track spans the padded content area (left-3 right-3)
  // Thumb position: maps [0%, 100%] to element positions where visual stays in bounds

  return (
    <div className={`relative w-full h-10 flex items-center select-none touch-none overflow-visible ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      {/* Track Background - inset to align with thumb center at edges */}
      <div className="absolute left-3 right-3 h-2 bg-surface-3 rounded-full overflow-hidden pointer-events-none">
        {/* Active Track (Gradient) */}
        <div 
          className="h-full bg-gradient-to-r from-brand-pink to-brand-glow transition-all duration-75" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actual Input Range - covers full width for interaction */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => !disabled && onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-inherit" 
      />

      {/* Custom Thumb
          At 0%: element left = 2px (ring starts at 0px)
          At 100%: element left = calc(100% - 22px) (ring ends at 100%)
          Formula: left = 2px + percentage * (100% - 24px) / 100 */}
      <div 
        className={`absolute h-5 w-5 rounded-full z-10 pointer-events-none transition-all duration-75 ${
          disabled 
            ? 'bg-surface-3 border-2 border-surface-4' 
            : 'bg-surface-1 shadow-lg ring-2 ring-brand-pink'
        }`}
        style={{ 
          left: `calc(2px + ${percentage}% - ${percentage * 0.24}px)`
        }}
      />
    </div>
  );
};
