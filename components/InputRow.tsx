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
    if (readOnly) return;

    // Allow digits and one decimal point
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimals
    if ((raw.match(/\./g) || []).length > 1) return;

    onChange(raw);
  };

  return (
    <div className="group relative">
      <div className={`relative flex items-center rounded-xl overflow-hidden h-16 transition-all duration-200 ${
        readOnly 
          ? 'bg-surface-2 ring-1 ring-surface-3' 
          : 'bg-white ring-2 ring-brand-pink/30 shadow-glow-sm'
      }`}>
        {/* Lock Button - Left side */}
        <button 
          onClick={onToggleLock}
          className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 p-2 rounded-lg ${
            isLocked 
              ? 'bg-surface-3 text-text-muted hover:bg-surface-4' 
              : 'bg-brand-pink text-white shadow-glow-sm hover:bg-brand-glow'
          }`}
          title={isLocked ? "Unlock (Enable Editing)" : "Lock (Calculate this value)"}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          placeholder="0"
          className={`w-full h-full bg-transparent text-right text-2xl font-semibold pl-16 pr-28 outline-none placeholder-text-muted/50 transition-colors font-mono ${
            readOnly ? 'text-text-muted cursor-default' : 'text-text-primary'
          }`}
        />
        
        {/* Label Badge - Right side */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className={`font-semibold text-xs px-2.5 py-1.5 rounded-lg tracking-wide flex items-center gap-1.5 font-display transition-colors ${
            readOnly 
              ? 'bg-surface-3 text-text-muted' 
              : 'bg-brand-pink/10 text-brand-pink'
          }`}>
            {icon && <img src={icon} alt="" className="w-3.5 h-3.5 opacity-80" />}
            {label}
          </span>
        </div>
      </div>
      
    </div>
  );
};
