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
  
  const [lockState, setLockState] = useState<LockState>(LockState.BTC);
  
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
    <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 flex flex-col gap-8 font-sans">
      
      {/* Top Section: Inputs */}
      <div className="flex flex-col gap-3">
        <InputRow 
          label="veMEZO" 
          icon="/vemezo.svg"
          value={userMezo} 
          isLocked={lockState === LockState.MEZO}
          readOnly={lockState === LockState.MEZO}
          onToggleLock={() => toggleLock(LockState.MEZO)}
          onChange={handleMezoChange}
        />

        <InputRow 
          label="veBTC" 
          icon="/vebtc.svg"
          value={userBtc} 
          isLocked={lockState === LockState.BTC}
          readOnly={lockState === LockState.BTC}
          onToggleLock={() => toggleLock(LockState.BTC)}
          onChange={handleBtcChange}
        />
      </div>

      {/* Middle Section: System Totals (Collapsible) */}
      <div className="px-2">
        <button 
          onClick={() => setSystemTotalsOpen(!systemTotalsOpen)}
          className="w-full flex justify-between items-center py-2 group"
        >
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">System Totals</span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${systemTotalsOpen ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            systemTotalsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col gap-8 pt-4 pb-2">
            <SystemRow 
              label="veMEZO"
              icon="/vemezo.svg"
              value={totalVeMezo}
              max={maxVeMezo}
              onValueChange={(val) => handleTotalChange(totalVeBtc, val)}
              onMaxChange={setMaxVeMezo}
            />

            <SystemRow 
              label="veBTC"
              icon="/vebtc.svg"
              value={totalVeBtc}
              max={maxVeBtc}
              onValueChange={(val) => handleTotalChange(val, totalVeMezo)}
              onMaxChange={setMaxVeBtc}
            />
          </div>
        </div>
      </div>

      {/* Bottom Section: Boost */}
      <div className="pt-2 px-2">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-3xl font-bold tracking-tight text-black">Boost</span>
          <span className="text-3xl font-bold tracking-tight tabular-nums">{boost.toFixed(2)}x</span>
        </div>
        
        {/* Container with conditional opacity */}
        <div className={`transition-opacity duration-200 ${lockState === LockState.NONE ? 'opacity-50 grayscale' : ''}`}>
          <Slider 
            min={1} 
            max={5} 
            step={0.01}
            value={boost} 
            onChange={handleBoostChange} 
            disabled={lockState === LockState.NONE}
          />
        </div>
        
        <div className="flex justify-between text-xs font-semibold mt-3 text-gray-400 px-1">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
        </div>
      </div>

    </div>
  );
};

export default App;
