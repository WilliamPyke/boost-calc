import React, { useState, useEffect } from 'react';
import { InputRow } from './components/InputRow';
import { Slider } from './components/Slider';
import { SystemRow } from './components/SystemRow';
import { formatNumber, parseNumber, clampBoost } from './utils';
import { LockState } from './types';

// Initial constants
const INITIAL_TOTAL_VEMEZO = 150000000;
const INITIAL_TOTAL_VEBTC = 2933.3;
const INITIAL_BTC = '2.00';
const INITIAL_MEZO = '102273.89';

const App = () => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const [lockState, setLockState] = useState<LockState>(LockState.MEZO);
  
  const [userMezo, setUserMezo] = useState<string>(INITIAL_MEZO);
  const [userBtc, setUserBtc] = useState<string>(INITIAL_BTC);
  
  const [totalVeMezo, setTotalVeMezo] = useState<number>(INITIAL_TOTAL_VEMEZO);
  const [totalVeBtc, setTotalVeBtc] = useState<number>(INITIAL_TOTAL_VEBTC);

  // Initial max ranges for the sliders
  const [maxVeMezo, setMaxVeMezo] = useState<number>(500000000);
  const [maxVeBtc, setMaxVeBtc] = useState<number>(10000);
  
  const [boost, setBoost] = useState<number>(5.0);
  
  // Collapsible section state
  const [systemTotalsOpen, setSystemTotalsOpen] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Formulae
  // --------------------------------------------------------------------------

  // Calculate Boost based on both inputs
  const calculateBoost = (btc: number, mezo: number, tBtc: number, tMezo: number) => {
    if (btc <= 0 || mezo <= 0 || tBtc <= 0 || tMezo <= 0) return 1;
    // Formula: Boost = 1 + 4 * (TotalBTC / UserBTC) * (UserMEZO / TotalMEZO)
    const term1 = tBtc / btc;
    const term2 = mezo / tMezo;
    const boostCalc = 4 * term1 * term2;
    return clampBoost(1 + boostCalc);
  };

  // Solve for MEZO (when locked) based on Target Boost and User BTC
  const solveForMezo = (targetBoost: number, btc: number, tBtc: number, tMezo: number) => {
    if (btc <= 0 || tBtc <= 0 || tMezo <= 0) return 0;
    const boostCalc = targetBoost - 1;
    if (boostCalc <= 0) return 0;
    // Formula: Mezo = (Boost - 1) * TotalMEZO * UserBTC / (4 * TotalBTC)
    return (boostCalc * tMezo * btc) / (4 * tBtc);
  };

  // Solve for BTC (when locked) based on Target Boost and User MEZO
  const solveForBtc = (targetBoost: number, mezo: number, tBtc: number, tMezo: number) => {
    if (mezo <= 0 || tBtc <= 0 || tMezo <= 0) return 0;
    const boostCalc = targetBoost - 1;
    if (boostCalc <= 0) return 0;
    // Formula: BTC = 4 * TotalBTC * UserMEZO / (TotalMEZO * (Boost - 1))
    return (4 * tBtc * mezo) / (tMezo * boostCalc);
  };

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  const handleMezoChange = (val: string) => {
    setUserMezo(val);
    if (lockState === LockState.MEZO) return; 

    const mezoNum = parseNumber(val);
    const btcNum = parseNumber(userBtc);

    if (lockState === LockState.NONE) {
      setBoost(calculateBoost(btcNum, mezoNum, totalVeBtc, totalVeMezo));
    } else if (lockState === LockState.BTC) {
      const newBtc = solveForBtc(boost, mezoNum, totalVeBtc, totalVeMezo);
      setUserBtc(formatNumber(newBtc));
    }
  };

  const handleBtcChange = (val: string) => {
    setUserBtc(val);
    if (lockState === LockState.BTC) return;

    const btcNum = parseNumber(val);
    const mezoNum = parseNumber(userMezo);

    if (lockState === LockState.NONE) {
      setBoost(calculateBoost(btcNum, mezoNum, totalVeBtc, totalVeMezo));
    } else if (lockState === LockState.MEZO) {
      const newMezo = solveForMezo(boost, btcNum, totalVeBtc, totalVeMezo);
      setUserMezo(formatNumber(newMezo));
    }
  };

  const handleBoostChange = (newBoost: number) => {
    setBoost(newBoost);
    
    if (lockState === LockState.BTC) {
        const mezoNum = parseNumber(userMezo);
        const newBtc = solveForBtc(newBoost, mezoNum, totalVeBtc, totalVeMezo);
        setUserBtc(formatNumber(newBtc));
    } else if (lockState === LockState.MEZO) {
        const btcNum = parseNumber(userBtc);
        const newMezo = solveForMezo(newBoost, btcNum, totalVeBtc, totalVeMezo);
        setUserMezo(formatNumber(newMezo));
    }
  };

  const handleTotalChange = (newTotalBtc: number, newTotalMezo: number) => {
    setTotalVeBtc(newTotalBtc);
    setTotalVeMezo(newTotalMezo);

    const btcNum = parseNumber(userBtc);
    const mezoNum = parseNumber(userMezo);

    if (lockState === LockState.NONE) {
        setBoost(calculateBoost(btcNum, mezoNum, newTotalBtc, newTotalMezo));
    } else if (lockState === LockState.BTC) {
        // Boost is fixed input, calculate Output BTC
        const newBtc = solveForBtc(boost, mezoNum, newTotalBtc, newTotalMezo);
        setUserBtc(formatNumber(newBtc));
    } else if (lockState === LockState.MEZO) {
        // Boost is fixed input, calculate Output MEZO
        const newMezo = solveForMezo(boost, btcNum, newTotalBtc, newTotalMezo);
        setUserMezo(formatNumber(newMezo));
    }
  };

  const toggleLock = (target: LockState) => {
    if (lockState === target) {
      setLockState(LockState.NONE);
      // Snap boost to current inputs
      const btcNum = parseNumber(userBtc);
      const mezoNum = parseNumber(userMezo);
      setBoost(calculateBoost(btcNum, mezoNum, totalVeBtc, totalVeMezo));
    } else {
      setLockState(target);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-6 px-1 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary font-display">
            veBoost Calculator
          </h1>
          <p className="text-sm text-text-muted mt-1 font-display">
            Calculate your optimal veMEZO and veBTC locks
          </p>
        </div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors group"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg className="w-5 h-5 text-text-muted group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-text-muted group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Card */}
      <div className="relative bg-surface-1 rounded-2xl border border-surface-3 shadow-card dark:shadow-card-dark overflow-hidden">
        <div className="relative z-10 p-6 flex flex-col gap-6">
          
          {/* Input Section */}
          <div className="flex flex-col gap-3">
            <InputRow 
              label="veBTC" 
              icon="/vebtc.svg"
              value={userBtc} 
              isLocked={lockState === LockState.BTC}
              readOnly={lockState === LockState.BTC}
              onToggleLock={() => toggleLock(LockState.BTC)}
              onChange={handleBtcChange}
            />

            <InputRow 
              label="veMEZO" 
              icon="/vemezo.svg"
              value={userMezo} 
              isLocked={lockState === LockState.MEZO}
              readOnly={lockState === LockState.MEZO}
              onToggleLock={() => toggleLock(LockState.MEZO)}
              onChange={handleMezoChange}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-surface-3 to-transparent" />

          {/* System Totals (Collapsible) */}
          <div>
            <button 
              onClick={() => setSystemTotalsOpen(!systemTotalsOpen)}
              className="w-full flex justify-between items-center py-1 group"
            >
              <span className="text-xs font-semibold text-text-muted uppercase tracking-widest font-display">
                System Totals
              </span>
              <svg 
                className={`w-4 h-4 text-text-muted transition-transform duration-300 ${systemTotalsOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                systemTotalsOpen ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col gap-6 pb-2">
                <SystemRow 
                  label="veBTC"
                  icon="/vebtc.svg"
                  value={totalVeBtc}
                  max={maxVeBtc}
                  onValueChange={(val) => handleTotalChange(val, totalVeMezo)}
                  onMaxChange={setMaxVeBtc}
                />

                <SystemRow 
                  label="veMEZO"
                  icon="/vemezo.svg"
                  value={totalVeMezo}
                  max={maxVeMezo}
                  onValueChange={(val) => handleTotalChange(totalVeBtc, val)}
                  onMaxChange={setMaxVeMezo}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-surface-3 to-transparent" />

          {/* Boost Section */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-widest font-display">
                Your Boost
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight tabular-nums font-mono text-brand-pink">
                  {boost.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-text-muted">×</span>
              </div>
            </div>
            
            {/* Slider Container */}
            <div className={`transition-all duration-200 ${lockState === LockState.NONE ? 'opacity-30' : ''}`}>
              <Slider 
                min={1} 
                max={5} 
                step={0.01}
                value={boost} 
                onChange={handleBoostChange} 
                disabled={lockState === LockState.NONE}
              />
            </div>
            
            {/* Scale markers */}
            <div className="flex justify-between text-xs font-medium mt-3 text-text-muted font-mono px-0.5">
              <span>1×</span>
              <span>2×</span>
              <span>3×</span>
              <span>4×</span>
              <span>5×</span>
            </div>
            
            {/* Hint */}
            {lockState === LockState.NONE && (
              <p className="text-xs text-text-muted mt-4 text-center font-display">
                Lock one input to adjust boost target
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <a 
        href="https://testnet.mezo.org/earn/lock" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-xs text-text-muted mt-4 text-center font-display hover:text-brand-pink transition-colors"
      >
        <span>Manage my locks</span>
        <svg 
          className="w-3 h-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </a>
    </div>
  );
};

export default App;
