import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Svg, { G, Line, Text as SvgText, Polyline, Rect } from 'react-native-svg'

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  chart: { width: '100%', height: 300, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
})

interface OHLC {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface Props {
  bars: OHLC[]
  title: string
  ema10?: number[]
  ema21?: number[]
  ema50?: number[]
  sma200?: number[]
}

export default function ChartView({ bars, title, ema10, ema21, ema50, sma200 }: Props) {
  if (!bars || bars.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No data available</Text>
      </View>
    )
  }

  const width = Dimensions.get('window').width - 32
  const chartHeight = 240
  const volumeHeight = 40
  const padding = { top: 10, right: 10, bottom: 10, left: 40 }

  let minPrice = Math.min(...bars.map((b) => b.low))
  let maxPrice = Math.max(...bars.map((b) => b.high))

  // Include EMAs in scale calculation
  const allEmas = [ema10, ema21, ema50, sma200].filter(Boolean).flat()
  if (allEmas.length > 0) {
    const validEmas = allEmas.filter((v) => !isNaN(v))
    if (validEmas.length > 0) {
      minPrice = Math.min(minPrice, Math.min(...validEmas))
      maxPrice = Math.max(maxPrice, Math.max(...validEmas))
    }
  }

  const priceRange = Math.max(maxPrice - minPrice, 1)
  const chartWidth = width - padding.left - padding.right
  const candleWidth = chartWidth / bars.length
  const candleBodyWidth = Math.max(candleWidth * 0.6, 2)

  const priceToY = (price: number) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight
  }

  const indexToX = (index: number) => {
    return padding.left + index * candleWidth + candleWidth / 2
  }

  // Align EMAs with bars (both should be same length after slicing)
  const getEmaPoints = (emaArray?: number[]) => {
    if (!emaArray || emaArray.length === 0) return []
    return bars
      .map((_, i) => {
        const val = emaArray[i]
        if (isNaN(val) || val === undefined) return null
        return `${indexToX(i)},${priceToY(val)}`
      })
      .filter(Boolean)
      .join(' ')
  }

  return (
    <View style={styles.container}>
      <Svg width={width} height={chartHeight + volumeHeight + 60}>
        <Rect width={width} height={chartHeight + volumeHeight + 60} fill="#f9fafb" />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + chartHeight * (1 - ratio)
          const price = minPrice + priceRange * ratio
          return (
            <G key={`grid-${i}`}>
              <Line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <SvgText x={padding.left - 5} y={y + 4} fontSize="10" textAnchor="end" fill="#9ca3af">
                {price.toFixed(0)}
              </SvgText>
            </G>
          )
        })}

        {/* SMA200 (purple) */}
        {sma200 && sma200.length > 0 && getEmaPoints(sma200) && (
          <Polyline points={getEmaPoints(sma200)} fill="none" stroke="#a855f7" strokeWidth="2" />
        )}

        {/* EMA50 (blue) */}
        {ema50 && ema50.length > 0 && getEmaPoints(ema50) && (
          <Polyline points={getEmaPoints(ema50)} fill="none" stroke="#3b82f6" strokeWidth="2" />
        )}

        {/* EMA21 (red) */}
        {ema21 && ema21.length > 0 && getEmaPoints(ema21) && (
          <Polyline points={getEmaPoints(ema21)} fill="none" stroke="#ef4444" strokeWidth="2" />
        )}

        {/* EMA10 (green) */}
        {ema10 && ema10.length > 0 && getEmaPoints(ema10) && (
          <Polyline points={getEmaPoints(ema10)} fill="none" stroke="#10b981" strokeWidth="2" />
        )}

        {/* Candlesticks */}
        {bars.map((bar, i) => {
          const x = indexToX(i)
          const openY = priceToY(bar.open)
          const closeY = priceToY(bar.close)
          const highY = priceToY(bar.high)
          const lowY = priceToY(bar.low)
          const isGreen = bar.close >= bar.open
          const color = isGreen ? '#10b981' : '#ef4444'
          const bodyTop = Math.min(openY, closeY)
          const bodyBottom = Math.max(openY, closeY)
          const bodyHeight = Math.max(bodyBottom - bodyTop, 1)

          return (
            <G key={`candle-${i}`}>
              <Line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="0.5" />
              <Rect x={x - candleBodyWidth / 2} y={bodyTop} width={candleBodyWidth} height={bodyHeight} fill={color} />
            </G>
          )
        })}

        {/* Volume */}
        <Line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#d1d5db"
          strokeWidth="1"
        />

        {bars.map((bar, i) => {
          const x = indexToX(i)
          const maxVol = Math.max(...bars.map((b) => b.volume), 1)
          const volHeight = (bar.volume / maxVol) * volumeHeight * 0.8
          const volY = padding.top + chartHeight + volumeHeight - volHeight
          const isGreen = bar.close >= bar.open
          const color = isGreen ? '#10b98133' : '#ef444433'

          return <Rect key={`vol-${i}`} x={x - candleBodyWidth / 2} y={volY} width={candleBodyWidth} height={volHeight} fill={color} />
        })}

        {/* Legend */}
        <G>
          {ema10 && ema10.length > 0 && (
            <>
              <Rect x={padding.left} y={padding.top + chartHeight + volumeHeight + 5} width={10} height={10} fill="#10b981" />
              <SvgText x={padding.left + 15} y={padding.top + chartHeight + volumeHeight + 15} fontSize="10" fill="#374151">
                EMA10
              </SvgText>
            </>
          )}
          {ema21 && ema21.length > 0 && (
            <>
              <Rect x={padding.left + 70} y={padding.top + chartHeight + volumeHeight + 5} width={10} height={10} fill="#ef4444" />
              <SvgText x={padding.left + 85} y={padding.top + chartHeight + volumeHeight + 15} fontSize="10" fill="#374151">
                EMA21
              </SvgText>
            </>
          )}
          {ema50 && ema50.length > 0 && (
            <>
              <Rect x={padding.left + 140} y={padding.top + chartHeight + volumeHeight + 5} width={10} height={10} fill="#3b82f6" />
              <SvgText x={padding.left + 155} y={padding.top + chartHeight + volumeHeight + 15} fontSize="10" fill="#374151">
                EMA50
              </SvgText>
            </>
          )}
          {sma200 && sma200.length > 0 && (
            <>
              <Rect x={padding.left + 210} y={padding.top + chartHeight + volumeHeight + 5} width={10} height={10} fill="#a855f7" />
              <SvgText x={padding.left + 225} y={padding.top + chartHeight + volumeHeight + 15} fontSize="10" fill="#374151">
                SMA200
              </SvgText>
            </>
          )}
        </G>
      </Svg>
    </View>
  )
}