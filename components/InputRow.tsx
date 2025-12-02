import React, { FC, useRef } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface InputRowProps {
  value: string;
  label: string;
  icon?: string;
  isLocked: boolean;
  onToggleLock: () => void;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const InputRow: FC<InputRowProps> = ({ 
  value, 
  label, 
  icon,
  isLocked, 
  onToggleLock, 
  onChange,
  readOnly = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow changes if not readOnly
    if (readOnly) return;

    // Allow digits and one decimal point
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimals
    if ((raw.match(/\./g) || []).length > 1) return;

    onChange(raw);
  };

  return (
    <div className="flex items-center justify-end mb-4 relative">
      <div className={`relative flex items-center rounded-xl overflow-hidden w-full h-20 transition-all ${
        readOnly 
          ? 'bg-gray-100 ring-2 ring-brand-pink/10' 
          : 'bg-brand-input focus-within:ring-2 focus-within:ring-black/5'
      }`}>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="0"
          className={`w-full h-full bg-transparent text-right text-4xl font-bold px-4 pr-36 outline-none placeholder-gray-400 transition-colors ${
            readOnly ? 'text-gray-500 cursor-default' : 'text-black'
          }`}
        />
        
        {/* Unit Badge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className={`font-bold text-sm px-3 py-1.5 rounded-md tracking-wide flex items-center gap-1.5 ${
            readOnly ? 'bg-gray-200 text-gray-500' : 'bg-[#dcdcdc] text-black'
          }`}>
            {icon && <img src={icon} alt="" className="w-4 h-4" />}
            {label}
          </span>
        </div>
      </div>

      {/* Lock Icon */}
      <button 
        onClick={onToggleLock}
        className={`absolute -top-3 right-0 transition-colors p-1.5 rounded-full shadow-sm z-10 border ${
            isLocked 
            ? 'bg-black text-white border-black hover:bg-gray-800' 
            : 'bg-white text-gray-400 border-gray-200 hover:text-black hover:border-gray-300'
        }`}
        title={isLocked ? "Unlock (Enable Editing)" : "Lock (Calculate this value)"}
      >
        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>
    </div>
  );
};