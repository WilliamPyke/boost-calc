import { useState, useEffect } from 'react'

// Mezo mainnet VotingEscrow contract addresses
// Full addresses from packages/shared/src/contracts/index.ts in the main webapp repo
const VEBTC_ADDRESS = import.meta.env.VITE_VEBTC_ADDRESS ?? '0x3D4b1b884A7a1E59fE8589a3296EC8f8cBB6f279'
const VEMEZO_ADDRESS = import.meta.env.VITE_VEMEZO_ADDRESS ?? '0xb90fdAd3DFD180458D62Cc6acedc983D78E20122'

const MEZO_RPC_URL = import.meta.env.VITE_MEZO_RPC_URL ?? 'https://rpc.mezo.org'

// supply() function selector = first 4 bytes of keccak256("supply()")
const SUPPLY_DATA = '0x047fc9aa'

async function readSupply(address: string, rpcUrl: string): Promise<bigint> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: address, data: SUPPLY_DATA }, 'latest'],
    }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  if (!json.result || json.result === '0x') return 0n
  return BigInt(json.result)
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export interface VeSupply {
  totalVeBtc: number | undefined
  totalVeMezo: number | undefined
  fetchStatus: FetchStatus
}

export default function useVeSupply(): VeSupply {
  const [totalVeBtc, setTotalVeBtc] = useState<number | undefined>(undefined)
  const [totalVeMezo, setTotalVeMezo] = useState<number | undefined>(undefined)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')

  useEffect(() => {
    if (!VEBTC_ADDRESS || !VEMEZO_ADDRESS) return

    setFetchStatus('loading')

    Promise.all([
      readSupply(VEBTC_ADDRESS, MEZO_RPC_URL),
      readSupply(VEMEZO_ADDRESS, MEZO_RPC_URL),
    ])
      .then(([btcRaw, mezoRaw]) => {
        setTotalVeBtc(Number(btcRaw) / 1e18)
        setTotalVeMezo(Number(mezoRaw) / 1e18)
        setFetchStatus('success')
      })
      .catch(() => {
        setFetchStatus('error')
      })
  }, [])

  return { totalVeBtc, totalVeMezo, fetchStatus }
}
