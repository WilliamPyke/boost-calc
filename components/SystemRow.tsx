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
      <div className="flex justify-between items-center mb-1">
        <span className="text-xl font-bold tracking-tight text-black flex items-center gap-2">
          {icon && <img src={icon} alt="" className="w-5 h-5" />}
          {label}
        </span>
        
        {/* Editable Current Value */}
        <div className="relative group">
          <input 
            type="text"
            inputMode="decimal"
            value={formatNumber(value)}
            onChange={(e) => onValueChange(parseNumber(e.target.value))}
            className="w-36 text-right text-xl font-bold tracking-tight tabular-nums bg-transparent border-b border-transparent hover:border-gray-300 focus:border-brand-pink focus:outline-none transition-colors p-0"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Slider controls value from 0 to Max */}
        <div className="flex-grow">
          <Slider 
            min={0} 
            max={max} 
            step={max / 1000} // Fine grained step based on range
            value={value} 
            onChange={onValueChange} 
          />
        </div>

        {/* Editable Max Range */}
        <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Max</span>
            <input 
                type="text"
                inputMode="decimal"
                value={formatNumber(max)}
                onChange={(e) => onMaxChange(parseNumber(e.target.value))}
                className="w-20 text-right text-xs font-bold text-gray-500 bg-gray-100 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-pink"
            />
        </div>
      </div>
    </div>
  );
};
