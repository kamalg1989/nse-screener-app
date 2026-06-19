import pako from 'pako'

const GITHUB_RAW = 'https://raw.githubusercontent.com/kamalg1989/nse-market-data/main/data'
const CACHE: Record<string, any[]> = {}

interface OHLC {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export async function fetchOHLCFromGitHub(symbol: string): Promise<OHLC[]> {
  if (CACHE[symbol]) {
    console.log(`[GitHub] ✅ Cache hit: ${symbol}`)
    return CACHE[symbol]
  }

  try {
    console.log(`[GitHub] Fetching ${symbol}...`)
    const url = `${GITHUB_RAW}/${symbol}.json.gz`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.log(`[GitHub] ${symbol} not found`)
      return []
    }

    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let decompressed = pako.ungzip(uint8Array, { to: 'string' })
    
    // Clean up the string
    decompressed = decompressed.trim()
    
    // CRITICAL: Replace NaN with null (NaN is not valid JSON)
    decompressed = decompressed.replace(/NaN/g, 'null')
    
    console.log(`[GitHub] ${symbol} cleaned, parsing...`)
    
    const rawData = JSON.parse(decompressed) as Array<[string, number, number, number, number, number] | any>
    console.log(`[GitHub] ${symbol} ✅ parsed: ${rawData.length} bars`)

    // Convert to OHLC, filtering out null close values
    const ohlcData: OHLC[] = rawData
      .filter((row: any) => row[4] !== null) // Filter out rows where close is null
      .map(([date, open, high, low, close, volume]: any) => ({
        date,
        open: open || 0,
        high: high || 0,
        low: low || 0,
        close: close || 0,
        volume: volume || 0,
      }))

    CACHE[symbol] = ohlcData
    console.log(`[GitHub] ✅ ${symbol}: ${ohlcData.length} bars loaded (filtered ${rawData.length - ohlcData.length})`)
    return ohlcData
  } catch (error) {
    console.error(`[GitHub] ❌ Error fetching ${symbol}:`, error)
    return []
  }
}

export function clearCache() {
  Object.keys(CACHE).forEach((key) => delete CACHE[key])
}

export function getCacheStats() {
  const symbols = Object.keys(CACHE)
  const totalBars = symbols.reduce((sum, sym) => sum + CACHE[sym].length, 0)
  return { cachedSymbols: symbols.length, totalBars }
}
