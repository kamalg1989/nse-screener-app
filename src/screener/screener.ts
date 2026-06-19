import { OHLC, defaultConfig } from './config/defaults'
import { calculateEMA, calculateSMA } from './utils/ema'

export interface Alert {
  symbol: string
  entry: number
  target: number
  sl: number
  qty: number
  rr: number
  stage: number
  type: string
  date: string
  charts: {
    daily: OHLC[]
    weekly: OHLC[]
  }
  ema?: { ema10: number[]; ema21: number[]; ema50: number[]; sma200: number[] }
  emaWeekly?: { ema10: number[]; ema21: number[]; ema50: number[]; sma200: number[] }
  reasoning: string
}

export interface BacktestResult {
  date: string
  regime: string
  candidatesCount: number
  top3: Alert[]
  allResults: Alert[]
}

function checkLiquidity(bars: OHLC[], config: any): { passed: boolean; turnover: number } {
  const MIN_TURNOVER = config.minDailyTurnover || 10_00_00_000
  if (bars.length < 20) return { passed: false, turnover: 0 }
  const last20 = bars.slice(-20)
  let totalTurnover = 0
  for (const bar of last20) {
    totalTurnover += bar.close * bar.volume
  }
  const avgTurnover = totalTurnover / 20
  return { passed: avgTurnover >= MIN_TURNOVER, turnover: avgTurnover }
}

function filterTechnical(bars: OHLC[], config: any): { passed: boolean; reason: string; ema50?: number; sma200?: number } {
  const REQUIRED_BARS = config.requiredMinBars || 200
  if (bars.length < REQUIRED_BARS) {
    return { passed: false, reason: `Insufficient bars: ${bars.length} < ${REQUIRED_BARS}` }
  }
  const close = bars[bars.length - 1].close
  const ema50 = calculateEMA(bars, 50)[bars.length - 1]
  const sma200 = calculateSMA(bars, 200)[bars.length - 1]
  if (!(close > ema50 && ema50 > sma200)) {
    return { passed: false, reason: `Alignment failed` }
  }
  const last20 = bars.slice(-20)
  let validBars = 0
  for (const bar of last20) {
    if ((bar.high - bar.low) / bar.close < 0.2) validBars++
  }
  const baseRangePercent = (validBars / 20) * 100
  if (baseRangePercent < 50) {
    return { passed: false, reason: `Base range check failed` }
  }
  return { passed: true, reason: 'Technical passed', ema50, sma200 }
}

function assessBaseQuality(bars: OHLC[]): { passed: boolean; reason: string; priorUpmove?: number; giveback?: number } {
  if (bars.length < 100) return { passed: false, reason: 'Insufficient bars' }
  const last100 = bars.slice(-100)
  const currentClose = last100[last100.length - 1].close
  const startClose = last100[0].close
  let peakClose = startClose
  let peakIdx = 0
  for (let i = 0; i < last100.length; i++) {
    if (last100[i].close > peakClose) {
      peakClose = last100[i].close
      peakIdx = i
    }
  }
  const priorUpmove = ((peakClose - startClose) / startClose) * 100
  if (priorUpmove < 15) return { passed: false, reason: `Prior upmove too low`, priorUpmove }
  const giveback = ((peakClose - currentClose) / peakClose) * 100
  if (giveback > 30) return { passed: false, reason: `Giveback too high`, giveback }
  const peakVol = last100[peakIdx].volume
  const currentVol = last100[last100.length - 1].volume
  const volDryUp = peakVol / Math.max(currentVol, 1)
  if (volDryUp > 1.3) return { passed: false, reason: `Vol dry-up extreme` }
  return { passed: true, reason: 'Base quality passed', priorUpmove, giveback }
}

function detectEntryTechnique(bars: OHLC[]): { technique: string; score: number } {
  if (bars.length < 20) return { technique: 'UNKNOWN', score: 0 }
  const last = bars[bars.length - 1]
  const prev = bars[bars.length - 2]
  if (last.high > prev.high && last.low > prev.low) return { technique: 'HH_HL', score: 0.8 }
  if (last.high <= prev.high && last.low >= prev.low) return { technique: 'INSIDE_BAR', score: 0.7 }
  const lowerWick = last.low - Math.min(last.open, last.close)
  const bodySize = Math.abs(last.close - last.open)
  if (lowerWick > bodySize * 2 && last.close > last.open) return { technique: 'PIN_BAR', score: 0.75 }
  const range = last.high - last.low
  if (range > prev.high - prev.low && last.close > (last.high + last.low) / 2) return { technique: 'TREND_BAR', score: 0.7 }
  return { technique: 'NEUTRAL', score: 0.5 }
}

function computeTarget(entry: number, sl: number, config: any): number {
  const rMultiple = config.targetFixedRMultiple || 2.0
  const risk = entry - sl
  return entry + risk * rMultiple
}

function getTickSize(price: number): number {
  if (price < 1) return 0.01
  if (price < 100) return 0.05
  if (price < 500) return 0.1
  return 1
}

function resolveEntry(price: number, slPrice: number): { entry: number; sl: number } {
  const tick = getTickSize(price)
  const entry = Math.ceil(price / tick) * tick
  const sl = Math.floor(slPrice / tick) * tick
  return { entry, sl }
}

function buildWeeklyCandles(dailyBars: OHLC[]): OHLC[] {
  if (dailyBars.length === 0) return []
  const weekly: OHLC[] = []
  let weekOpen = dailyBars[0].open
  let weekHigh = dailyBars[0].high
  let weekLow = dailyBars[0].low
  let weekVolume = 0
  let weekDate = dailyBars[0].date

  for (let i = 0; i < dailyBars.length; i++) {
    const bar = dailyBars[i]
    const barDate = new Date(bar.date)
    const isWeekEnd = barDate.getDay() === 5 || i === dailyBars.length - 1
    
    weekHigh = Math.max(weekHigh, bar.high)
    weekLow = Math.min(weekLow, bar.low)
    weekVolume += bar.volume
    weekDate = bar.date

    if (isWeekEnd) {
      weekly.push({
        date: weekDate,
        open: weekOpen,
        high: weekHigh,
        low: weekLow,
        close: bar.close,
        volume: weekVolume,
      })
      if (i < dailyBars.length - 1) {
        weekOpen = dailyBars[i + 1].open
        weekHigh = dailyBars[i + 1].high
        weekLow = dailyBars[i + 1].low
        weekVolume = 0
      }
    }
  }
  return weekly
}

export function runScreener(
  symbol: string,
  daily: OHLC[],
  allStockData: Record<string, OHLC[]>,
  niftyDaily: OHLC[] | null,
  config: any
): Alert | null {
  try {
    console.log(`[${symbol}] Starting screener pipeline... bars=${daily.length}`)

    if (daily.length === 0) {
      console.log(`[${symbol}] ❌ No bars`)
      return null
    }

    const regime = 'NEUTRAL'
    console.log(`[${symbol}] ✓ Regime: ${regime}`)

    const liqCheck = checkLiquidity(daily, config)
    if (!liqCheck.passed) {
      console.log(`[${symbol}] ❌ Liquidity failed`)
      return null
    }
    console.log(`[${symbol}] ✓ Liquidity passed`)

    const techCheck = filterTechnical(daily, config)
    if (!techCheck.passed) {
      console.log(`[${symbol}] ❌ Technical failed`)
      return null
    }
    console.log(`[${symbol}] ✓ Technical passed`)

    const baseCheck = assessBaseQuality(daily)
    if (!baseCheck.passed) {
      console.log(`[${symbol}] ❌ Base quality failed`)
      return null
    }
    console.log(`[${symbol}] ✓ Base quality passed`)

    const technique = detectEntryTechnique(daily)
    console.log(`[${symbol}] ✓ Technique: ${technique.technique}`)

    const lastBar = daily[daily.length - 1]
    const entryPrice = lastBar.close
    const atrStop = lastBar.low - (lastBar.high - lastBar.low) * 0.5
    const { entry, sl } = resolveEntry(entryPrice, atrStop)
    const target = computeTarget(entry, sl, config)
    const rr = (target - entry) / (entry - sl)

    const capital = config.capital || 400000
    const riskPerTrade = capital * 0.02
    const riskPerShare = entry - sl
    const qty = Math.floor(riskPerTrade / riskPerShare)

    // Calculate EMAs for daily
    const ema10 = calculateEMA(daily, 10)
    const ema21 = calculateEMA(daily, 21)
    const ema50 = calculateEMA(daily, 50)
    const sma200 = calculateSMA(daily, 200)

    // Build weekly and calculate EMAs
    const weekly = buildWeeklyCandles(daily)
    const weeklyEma10 = calculateEMA(weekly, 10)
    const weeklyEma21 = calculateEMA(weekly, 21)
    const weeklyEma50 = calculateEMA(weekly, 50)
    const weeklySma200 = calculateSMA(weekly, 200)

    const alert: Alert = {
      symbol,
      entry,
      target,
      sl,
      qty,
      rr,
      stage: 1,
      type: technique.technique,
      date: lastBar.date,
      charts: { daily, weekly },
      ema: { ema10, ema21, ema50, sma200 },
      emaWeekly: { ema10: weeklyEma10, ema21: weeklyEma21, ema50: weeklyEma50, sma200: weeklySma200 },
      reasoning: `${technique.technique} | Liq: ${(liqCheck.turnover / 1e7).toFixed(1)}cr | Base: ↑${baseCheck.priorUpmove?.toFixed(1)}%`,
    }

    console.log(`[${symbol}] ✅ ALERT: Entry=${entry.toFixed(2)} SL=${sl.toFixed(2)} Target=${target.toFixed(2)} RR=${rr.toFixed(2)}`)
    return alert
  } catch (error) {
    console.error(`[${symbol}] Error during screening:`, error)
    return null
  }
}

export function runScreenerForDate(
  targetDate: string,
  allStockData: Record<string, OHLC[]>,
  niftyDaily: OHLC[] | null,
  config: any
): BacktestResult {
  console.log(`\n[Screener] Running for ${targetDate}`)
  console.log(`[Screener] Total symbols: ${Object.keys(allStockData).length}`)

  const alerts: Alert[] = []
  let checkedCount = 0
  let techFailCount = 0
  let liqFailCount = 0
  let baseFailCount = 0

  for (const symbol in allStockData) {
    const allBars = allStockData[symbol]
    const filteredBars = allBars.filter((b) => b.date <= targetDate)

    if (filteredBars.length < (config.requiredMinBars || 100)) {
      continue
    }

    checkedCount++
    const alert = runScreener(symbol, filteredBars, allStockData, niftyDaily, config)
    if (alert) {
      alerts.push(alert)
    } else {
      // Track why alerts failed (requires adding logs in runScreener)
    }
  }

  const top3 = alerts.sort((a, b) => b.rr - a.rr).slice(0, 3)

  console.log(`[Screener] ${targetDate}: Checked=${checkedCount}, Alerts=${alerts.length}, Top3=${top3.length}`)

  return {
    date: targetDate,
    regime: 'NEUTRAL',
    candidatesCount: alerts.length,
    top3,
    allResults: alerts,
  }
}