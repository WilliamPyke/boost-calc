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
    <div className={`relative w-full h-8 flex items-center select-none touch-none isolation-auto ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      {/* Track Background */}
      <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full overflow-hidden pointer-events-none">
         {/* Active Track (Pink) */}
        <div 
          className="h-full bg-brand-pink" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Actual Input Range - Invisible but captures interaction */}
      {/* The styling for this is largely handled in index.html to ensure cross-browser thumb sizing */}
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

      {/* Custom Thumb Visual - Centered on value */}
      <div 
        className={`absolute h-5 w-5 bg-white border-[3px] border-brand-pink rounded-full z-10 shadow-md pointer-events-none transition-transform ${disabled ? 'scale-75 bg-gray-100 border-gray-400' : ''}`}
        style={{ 
          left: `calc(${percentage}% - 10px)` // Center the 20px thumb
        }}
      />
    </div>
  );
};