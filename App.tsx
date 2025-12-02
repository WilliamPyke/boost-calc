import React, { useState, useEffect } from 'react';
import { InputRow } from './components/InputRow';
import { Slider } from './components/Slider';
import { SystemRow } from './components/SystemRow';
import { formatNumber, parseNumber, clampBoost } from './utils';
import { LockState } from './types';

// Initial constants
const INITIAL_TOTAL_VEMEZO = 150000000;
const INITIAL_TOTAL_VEBTC = 2933.3;
const INITIAL_BTC = '21';
const INITIAL_BOOST = 5.0;

// Calculate initial MEZO from BTC and target boost
// Formula: Mezo = (Boost - 1) * TotalMEZO * UserBTC / (4 * TotalBTC)
const calcInitialMezo = () => {
  const btc = parseFloat(INITIAL_BTC);
  const boostCalc = INITIAL_BOOST - 1;
  return (boostCalc * INITIAL_TOTAL_VEMEZO * btc) / (4 * INITIAL_TOTAL_VEBTC);
};

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
  
  const [userMezo, setUserMezo] = useState<string>(() => formatNumber(calcInitialMezo()));
  const [userBtc, setUserBtc] = useState<string>(INITIAL_BTC);
  
  const [totalVeMezo, setTotalVeMezo] = useState<number>(INITIAL_TOTAL_VEMEZO);
  const [totalVeBtc, setTotalVeBtc] = useState<number>(INITIAL_TOTAL_VEBTC);

  // Initial max ranges for the sliders
  const [maxVeMezo, setMaxVeMezo] = useState<number>(500000000);
  const [maxVeBtc, setMaxVeBtc] = useState<number>(10000);
  
  const [boost, setBoost] = useState<number>(INITIAL_BOOST);
  
  // Collapsible section state
  const [systemTotalsOpen, setSystemTotalsOpen] = useState<boolean>(false);
  const [explainerOpen, setExplainerOpen] = useState<boolean>(false);
  
  // Animate explainer open on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setExplainerOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6 w-full transition-all duration-500 ease-out">
      {/* Main Calculator */}
      <div className={`w-full max-w-md transition-all duration-500 ease-out ${explainerOpen ? '' : ''}`}>
        {/* Header */}
        <div className="mb-4 sm:mb-6 px-1 flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary font-display">
              veBoost Calculator
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1 font-display">
              Calculate your optimal veMEZO and veBTC locks
            </p>
          </div>
          
          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-2 flex-shrink-0">
            {/* Info Icon */}
            <button
              onClick={() => setExplainerOpen(!explainerOpen)}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                explainerOpen 
                  ? 'bg-brand-pink/10 text-brand-pink' 
                  : 'bg-surface-2 text-text-muted hover:bg-surface-3 hover:text-brand-pink'
              }`}
              aria-label="Toggle information panel"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors group"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted group-hover:text-brand-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative bg-surface-1 rounded-xl sm:rounded-2xl border border-surface-3 shadow-card dark:shadow-card-dark overflow-hidden">
          <div className="relative z-10 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
            
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
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-widest font-display">
                  System Totals
                </span>
                <svg 
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted transition-transform duration-300 ${systemTotalsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  systemTotalsOpen ? 'max-h-64 opacity-100 mt-3 sm:mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex flex-col gap-4 sm:gap-6 pb-2 px-1">
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
              <div className="flex justify-between items-end mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-semibold text-text-muted uppercase tracking-widest font-display">
                  Your Boost
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums font-mono text-brand-pink">
                    {boost.toFixed(2)}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-text-muted">×</span>
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
              <div className={`flex justify-between text-[10px] sm:text-xs font-medium mt-2 sm:mt-3 font-mono px-0.5 ${lockState === LockState.NONE ? 'opacity-30' : ''}`}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => lockState !== LockState.NONE && handleBoostChange(val)}
                    disabled={lockState === LockState.NONE}
                    className={`transition-colors ${
                      lockState !== LockState.NONE 
                        ? 'hover:text-brand-pink cursor-pointer' 
                        : 'cursor-not-allowed'
                    } ${Math.round(boost) === val ? 'text-brand-pink' : 'text-text-muted'}`}
                  >
                    {val}×
                  </button>
                ))}
              </div>
              
              {/* Hint */}
              {lockState === LockState.NONE && (
                <p className="text-[10px] sm:text-xs text-text-muted mt-3 sm:mt-4 text-center font-display">
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
          className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-text-muted mt-3 sm:mt-4 text-center font-display hover:text-brand-pink transition-colors"
        >
          <span>Manage my locks</span>
          <svg 
            className="w-2.5 h-2.5 sm:w-3 sm:h-3" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
        
        {/* Built by Mallard Labs */}
        <a
          href="https://mallardlabs.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 py-2 group"
        >
          <span className="text-[10px] sm:text-xs text-white font-display opacity-60 group-hover:opacity-100 transition-opacity dark:text-white invert dark:invert-0">
            Built by
          </span>
          <img 
            src="/mallardlabs_logo.svg" 
            alt="Mallard Labs" 
            className="h-2.5 sm:h-3 opacity-60 group-hover:opacity-100 transition-opacity dark:invert-0 invert"
          />
        </a>
      </div>

      {/* Explainer Side Panel */}
      <div className={`explainer-wrapper w-full max-w-md lg:flex-shrink-0 ${explainerOpen ? 'open' : 'closed'}`}>
        <div className={`explainer-panel w-full lg:w-96 bg-surface-1 rounded-xl sm:rounded-2xl border border-surface-3 shadow-card dark:shadow-card-dark overflow-hidden ${explainerOpen ? 'open' : 'closed'}`}>
          {/* Panel Header */}
          <div className="flex justify-between items-center p-3 sm:p-4 border-b border-surface-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-text-primary font-display">
                How to Use
              </span>
            </div>
            <button 
              onClick={() => setExplainerOpen(false)}
              className="p-1.5 rounded-md hover:bg-surface-2 transition-colors text-text-muted hover:text-text-primary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="p-3 sm:p-4 space-y-4 sm:space-y-5 max-h-[50vh] sm:max-h-[60vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* What is this? */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary font-display">What is this calculator?</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-display">
                This tool helps you plan your veMEZO and veBTC lock amounts to achieve your desired boost multiplier. 
                Your boost affects the rewards you earn from the Mezo protocol.
              </p>
            </div>

            {/* Lock Icons */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary font-display">Using the Lock Icons</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-display">
                Click the lock icon next to an input to fix the value. 
              </p>
              <div className="flex gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                <div className="flex-1 p-1.5 sm:p-2 bg-surface-2 rounded-md sm:rounded-lg border border-surface-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs font-medium text-text-primary font-display">Locked</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-text-muted font-display">Auto-calculated</p>
                </div>
                <div className="flex-1 p-1.5 sm:p-2 bg-surface-2 rounded-md sm:rounded-lg border border-surface-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] sm:text-xs font-medium text-text-primary font-display">Unlocked</span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-text-muted font-display">User Input</p>
                </div>
              </div>
            </div>

            {/* Boost Slider */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary font-display">The Boost Slider</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-display">
                When one input is locked, use the boost slider to set your target multiplier (1× to 5×). 
                The locked value will update to show how much you need for that boost.
              </p>
            </div>

            {/* Both Unlocked */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary font-display">Unlock Both Values</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-display">
                Now you can manually enter both veBTC and veMEZO amounts, 
                and the calculator will show you the resulting boost you'd receive.
              </p>
              <div className="mt-1.5 sm:mt-2 p-2 sm:p-3 bg-brand-pink/5 rounded-md sm:rounded-lg border border-brand-pink/20">
                <p className="text-[11px] sm:text-xs text-text-secondary font-display">
                  <span className="text-brand-pink font-semibold">Tip:</span> This mode is great for 
                  checking "what if" scenarios with specific token amounts you have in mind.
                </p>
              </div>
            </div>

            {/* System Totals */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-xs sm:text-sm font-semibold text-text-primary font-display">System Totals</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-text-secondary leading-relaxed font-display">
                Expand "System Totals" to adjust the total veBTC and veMEZO in the protocol. 
                This helps you model different scenarios as the protocol grows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
