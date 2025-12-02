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

  return (
    <div className={`relative w-full h-10 flex items-center select-none touch-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      {/* Track Background */}
      <div className="absolute left-0 right-0 h-2 bg-surface-3 rounded-full overflow-hidden pointer-events-none">
        {/* Active Track (Gradient) */}
        <div 
          className="h-full bg-gradient-to-r from-brand-pink to-brand-glow transition-all duration-75" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actual Input Range */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => !disabled && onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="opacity-0" 
      />

      {/* Custom Thumb */}
      <div 
        className={`absolute h-5 w-5 rounded-full z-10 pointer-events-none transition-all duration-75 ${
          disabled 
            ? 'bg-surface-3 border-2 border-surface-4' 
            : 'bg-surface-1 shadow-lg ring-2 ring-brand-pink'
        }`}
        style={{ 
          left: `calc(${percentage}% - 10px)`
        }}
      />
    </div>
  );
};
