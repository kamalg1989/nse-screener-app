import { OHLC } from './config/defaults'
import { runScreenerForDate, BacktestResult } from './screener'
import { fetchOHLCFromGitHub, getCacheStats } from './utils/githubDataFetcher'

const defaultConfig = {
  capital: 400000,
  minDailyTurnover: 10_00_00_000,
  maxAlertsPerRun: 3,
  targetFixedRMultiple: 2.0,
  requiredMinBars: 100,
}

const NIFTY500_SYMBOLS = [
  'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'HINDUUNILVR',
  'KOTAKBANK', 'SBIN', 'BAJAJFINSV', 'LT', 'MARUTI', 'AXISBANK',
  'ASIANPAINT', 'NESTLEIND', 'TITAN', 'NTPC', 'POWERGRID', 'ADANIPORTS',
  'HCLTECH', 'WIPRO', 'JSWSTEEL', 'TATASTEEL', 'SUNPHARMA', 'DRREDDY',
  'BAJAJHLDNG', 'HINDUNILVR', 'GRASIM', 'BHARTIARTL', 'ITC', 'ADANIGREEN',
  'ABSLAMC', 'ACUTAAS', 'ADANIENSOL', 'APARINDS', 'ASTRAL', 'AUBANK',
  'BAJAJ-AUTO', 'BANDHANBNK', 'BANKBARODA', 'BATAINDIA', 'BERGEPAINT',
  'BHARATFORG', 'BEL', 'BHEL', 'BIOCON', 'BPCL', 'BRITANNIA', 'BSOFT',
  'CAMS', 'CANBK', 'CANFINHOME', 'CASTROLIND', 'CCL', 'CDSL', 'CEATLTD',
  'CGPOWER', 'CHAMBLFERT', 'CHOLAFIN', 'CIPLA', 'COALINDIA', 'COFORGE',
  'COLPAL', 'CONCOR', 'COROMANDEL', 'CREDITACC', 'CRISIL', 'CROMPTON',
  'CUB', 'CUMMINSIND', 'CYIENT', 'DABUR', 'DALBHARAT', 'DCMSHRIRAM',
  'DEEPAKFERT', 'DEEPAKNTR', 'DELHIVERY', 'DIVISLAB', 'DIXON', 'DLF',
  'DMART', 'DRREDDY', 'ECLERX', 'EICHERMOT', 'EIHOTEL', 'ELGIEQUIP',
  'EMAMILTD', 'EMCURE', 'ENDURANCE', 'ESCORTS', 'EXIDEIND',
  'FEDERALBNK', 'FINCABLES', 'FIRSTCRY', 'FLUOROCHEM', 'FORCEMOT', 'FORTIS',
  'GABRIEL', 'GAIL', 'GALLANTT', 'GICRE', 'GILLETTE', 'GLAND', 'GLAXO',
  'GLENMARK', 'GMRAIRPORT', 'GODREJCP', 'GODREJIND', 'GODREJPROP', 'GPIL',
  'GRANULES', 'GRAPHITE', 'GRASIM', 'GRAVITA', 'GROWW', 'GRSE', 'HAL',
  'HAVELLS', 'HEG', 'HEROMOTOCO', 'HEXT', 'HFCL', 'HINDALCO',
  'HINDCOPPER', 'HINDPETRO', 'HINDUNILVR', 'HINDZINC', 'HOMEFIRST',
  'HONASA', 'HONAUT', 'HSCL', 'HUDCO', 'HYUNDAI', 'ICICIAMC', 'ICICIBANK',
  'ICICIPRULI', 'IDEA', 'IDFCFIRSTB', 'IDBI', 'IEX', 'IFCI', 'IGIL', 'IGL',
  'IIFL', 'IKS', 'INDHOTEL', 'INDIACEM', 'INDIAMART', 'INDIANB',
  'INDIGO', 'INDUSINDBK', 'INDUSTOWER', 'INFY', 'INOXWIND', 'INTELLECT',
  'IOB', 'IOC', 'IPCALAB', 'IRB', 'IRCON', 'IRCTC', 'IREDA', 'IRFC', 'ITC',
]

async function fetchBatch(symbols: string[]): Promise<[string, OHLC[]][]> {
  return Promise.all(
    symbols.map(async (symbol) => {
      const ohlcData = await fetchOHLCFromGitHub(symbol)
      return [symbol, ohlcData] as [string, OHLC[]]
    })
  )
}

export async function runBacktestForDate(targetDate: string): Promise<BacktestResult> {
  console.log(`\n[Backtester] Loading data for ${targetDate}...`)
  
  const allStockData: Record<string, OHLC[]> = {}
  const BATCH_SIZE = 15 // Fetch 15 symbols in parallel
  let loadedCount = 0
  let failedCount = 0

  // Process in batches
  for (let i = 0; i < NIFTY500_SYMBOLS.length; i += BATCH_SIZE) {
    const batch = NIFTY500_SYMBOLS.slice(i, i + BATCH_SIZE)
    console.log(`[Backtester] Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(NIFTY500_SYMBOLS.length / BATCH_SIZE)}...`)
    
    try {
      const results = await fetchBatch(batch)
      for (const [symbol, ohlcData] of results) {
        if (ohlcData.length > 0) {
          allStockData[symbol] = ohlcData
          loadedCount++
        } else {
          failedCount++
        }
      }
    } catch (error) {
      console.error(`[Backtester] Batch error:`, error)
      failedCount += batch.length
    }
  }

  console.log(`[Backtester] ✅ Loaded ${loadedCount} symbols, failed ${failedCount}`)
  const stats = getCacheStats()
  console.log(`[Backtester] Cache: ${stats.cachedSymbols} symbols, ${stats.totalBars} total bars`)

  const result = runScreenerForDate(targetDate, allStockData, null, defaultConfig)
  
  return result
}
