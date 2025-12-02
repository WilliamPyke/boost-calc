import React, { FC } from 'react';
import { Slider } from './Slider';
import { formatNumber, parseNumber } from '../utils';

interface SystemRowProps {
  label: string;
  icon?: string;
  value: number;
  max: number;
  onValueChange: (val: number) => void;
  onMaxChange: (val: number) => void;
}

export const SystemRow: FC<SystemRowProps> = ({ 
  label, 
  icon,
  value, 
  max, 
  onValueChange, 
  onMaxChange 
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold tracking-tight text-text-primary flex items-center gap-2 font-display">
          {icon && <img src={icon} alt="" className="w-4 h-4 opacity-70" />}
          {label}
        </span>
        
        {/* Editable Current Value */}
        <input 
          type="text"
          inputMode="decimal"
          value={formatNumber(value)}
          onChange={(e) => onValueChange(parseNumber(e.target.value))}
          className="w-32 text-right text-sm font-semibold tracking-tight tabular-nums bg-transparent text-text-secondary border-b border-transparent hover:border-surface-4 focus:border-brand-pink focus:text-text-primary focus:outline-none transition-colors p-0 font-mono"
        />
      </div>
      
      <div className="flex items-center gap-3">
        {/* Slider */}
        <div className="flex-grow">
          <Slider 
            min={0} 
            max={max} 
            step={max / 1000}
            value={value} 
            onChange={onValueChange} 
          />
        </div>

        {/* Editable Max Range */}
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-text-muted uppercase font-semibold tracking-wider font-display">Max</span>
          <input 
            type="text"
            inputMode="decimal"
            value={formatNumber(max)}
            onChange={(e) => onMaxChange(parseNumber(e.target.value))}
            className="w-16 text-right text-xs font-medium text-text-muted bg-surface-2 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-pink font-mono"
          />
        </div>
      </div>
    </div>
  );
};
