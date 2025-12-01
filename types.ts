export enum LockState {
  NONE = 'NONE',
  MEZO = 'MEZO',
  BTC = 'BTC'
}

export interface CalculatorState {
  userMezo: string;
  userBtc: string;
  totalVeMezo: number;
  totalVeBtc: number;
  boost: number;
  veMezoMax: number;
  veBtcMax: number;
}
