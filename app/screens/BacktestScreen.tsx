import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { useBacktest } from '../hooks/useBacktest'
import ChartView from '../components/ChartView'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  dateInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 },
  input: { fontSize: 16, color: '#000' },
  dateLabel: { fontSize: 10, color: '#9ca3af', marginTop: 4 },
  selectedDate: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginTop: 8 },
  durationRow: { flexDirection: 'row', gap: 8 },
  durationBtn: { flex: 1, backgroundColor: '#e5e7eb', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  durationBtnActive: { backgroundColor: '#3b82f6' },
  durationBtnText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  durationBtnTextActive: { color: '#fff' },
  runButton: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 20 },
  runButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  summaryBox: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 8, padding: 12, marginBottom: 16 },
  summaryText: { fontSize: 14, color: '#1e3a8a' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 8, color: '#6b7280' },
  emptyText: { textAlign: 'center', color: '#9ca3af', paddingVertical: 32 },
  alertBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
  alertHeader: { backgroundColor: '#3b82f6', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertSymbol: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  alertType: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  alertReasoning: { fontSize: 12, color: '#bfdbfe', paddingHorizontal: 16, paddingVertical: 8 },
  alertDetails: { padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#6b7280' },
  detailValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4, color: '#000' },
  detailValueGreen: { color: '#16a34a' },
  detailValueRed: { color: '#dc2626' },
  detailValueBlue: { color: '#2563eb' },
  divider: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginVertical: 12 },
  chartContainer: { marginTop: 12 },
  chartTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  debugText: { fontSize: 10, color: '#ef4444', padding: 8, backgroundColor: '#fee2e2', borderRadius: 4, marginBottom: 8 },
})

function getEndDate(startDate: string, days: number): string {
  const current = new Date(startDate)
  current.setDate(current.getDate() + days - 1)
  return current.toISOString().split('T')[0]
}

function getDurationDays(duration: string): number {
  switch (duration) {
    case 'single': return 1
    case '1m': return 30
    case '3m': return 90
    case '6m': return 180
    default: return 1
  }
}

export default function BacktestScreen() {
  const [year, setYear] = useState('2025')
  const [month, setMonth] = useState('01')
  const [day, setDay] = useState('13')
  const [duration, setDuration] = useState('single')
  const { backtest, loading, runBacktest } = useBacktest()

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const durationDays = getDurationDays(duration)
  const endDate = durationDays === 1 ? dateStr : getEndDate(dateStr, durationDays)
  const rangeLabel = durationDays === 1 ? dateStr : `${dateStr} to ${endDate}`

  useEffect(() => {
    if (backtest?.top3?.[0]) {
      const alert = backtest.top3[0]
      console.log('[BacktestScreen] Alert structure:', {
        symbol: alert.symbol,
        hasEma: !!alert.ema,
        ema10Length: alert.ema?.ema10?.length,
        ema21Length: alert.ema?.ema21?.length,
        ema50Length: alert.ema?.ema50?.length,
        sma200Length: alert.ema?.sma200?.length,
        dailyBarsLength: alert.charts?.daily?.length,
        ema10First5: alert.ema?.ema10?.slice(0, 5),
      })
    }
  }, [backtest])

  const handleRun = () => {
    console.log(`[BacktestScreen] Running backtest for ${endDate}`)
    runBacktest(endDate)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📊 Backtest Screener</Text>

        <View style={styles.section}>
          <Text style={styles.label}>📅 Start Date</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <TextInput value={year} onChangeText={setYear} placeholder="2025" keyboardType="number-pad" maxLength={4} style={styles.input} />
              <Text style={styles.dateLabel}>Year</Text>
            </View>
            <View style={styles.dateInput}>
              <TextInput value={month} onChangeText={setMonth} placeholder="01" keyboardType="number-pad" maxLength={2} style={styles.input} />
              <Text style={styles.dateLabel}>Month</Text>
            </View>
            <View style={styles.dateInput}>
              <TextInput value={day} onChangeText={setDay} placeholder="13" keyboardType="number-pad" maxLength={2} style={styles.input} />
              <Text style={styles.dateLabel}>Day</Text>
            </View>
          </View>
          <Text style={styles.selectedDate}>Range: {rangeLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>⏱️ Lookback Period</Text>
          <View style={styles.durationRow}>
            <TouchableOpacity onPress={() => setDuration('single')} style={[styles.durationBtn, duration === 'single' && styles.durationBtnActive]}>
              <Text style={[styles.durationBtnText, duration === 'single' && styles.durationBtnTextActive]}>Single Day</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDuration('1m')} style={[styles.durationBtn, duration === '1m' && styles.durationBtnActive]}>
              <Text style={[styles.durationBtnText, duration === '1m' && styles.durationBtnTextActive]}>1 Month</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDuration('3m')} style={[styles.durationBtn, duration === '3m' && styles.durationBtnActive]}>
              <Text style={[styles.durationBtnText, duration === '3m' && styles.durationBtnTextActive]}>3 Months</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDuration('6m')} style={[styles.durationBtn, duration === '6m' && styles.durationBtnActive]}>
              <Text style={[styles.durationBtnText, duration === '6m' && styles.durationBtnTextActive]}>6 Months</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 8 }}>
            📌 Backtests end date ({endDate})
          </Text>
        </View>

        <TouchableOpacity onPress={handleRun} disabled={loading} style={[styles.runButton, loading && { opacity: 0.6 }]}>
          <Text style={styles.runButtonText}>{loading ? 'Running...' : '▶ Run Backtest'}</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Running screener for {endDate}...</Text>
        </View>
      )}

      {!loading && backtest && backtest.top3 && backtest.top3.length > 0 && (
        <View style={styles.content}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>📈 {backtest.candidatesCount} candidates | ⭐ {backtest.top3.length} alerts</Text>
          </View>

          {backtest.top3.map((alert: any, idx: number) => {
            const dailyBars = alert.charts?.daily?.slice(-90) || []
            const weeklyBars = alert.charts?.weekly?.slice(-90) || []
            const ema10Daily = alert.ema?.ema10?.slice(-90)
            const ema21Daily = alert.ema?.ema21?.slice(-90)
            const ema50Daily = alert.ema?.ema50?.slice(-90)
            const sma200Daily = alert.ema?.sma200?.slice(-90)

            return (
              <View key={`alert-${idx}`} style={styles.alertBox}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                  <Text style={styles.alertType}>{alert.type}</Text>
                </View>
                <Text style={styles.alertReasoning}>{alert.reasoning}</Text>

                {idx === 0 && (
                  <View style={styles.debugText}>
                    <Text>EMA Data: ema10={ema10Daily?.length}, ema50={ema50Daily?.length}, bars={dailyBars.length}</Text>
                  </View>
                )}

                <View style={styles.alertDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Entry</Text>
                      <Text style={styles.detailValue}>₹{alert.entry.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Target</Text>
                      <Text style={[styles.detailValue, styles.detailValueGreen]}>₹{alert.target.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>SL</Text>
                      <Text style={[styles.detailValue, styles.detailValueRed]}>₹{alert.sl.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>RR</Text>
                      <Text style={[styles.detailValue, styles.detailValueBlue]}>1:{alert.rr.toFixed(1)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>Qty</Text>
                      <Text style={styles.detailValue}>{alert.qty} shares</Text>
                    </View>
                  </View>

                  {dailyBars.length > 0 && (
                    <View style={styles.chartContainer}>
                      <Text style={styles.chartTitle}>Daily (90 candles)</Text>
                      <ChartView 
                        bars={dailyBars} 
                        ema10={ema10Daily}
                        ema21={ema21Daily}
                        ema50={ema50Daily}
                        sma200={sma200Daily}
                        title="Daily" 
                      />
                    </View>
                  )}

                  {weeklyBars.length > 0 && (
                    <View style={styles.chartContainer}>
                      <Text style={styles.chartTitle}>Weekly (90 candles)</Text>
                      <ChartView 
                        bars={weeklyBars} 
                        ema10={alert.emaWeekly?.ema10?.slice(-90)}
                        ema21={alert.emaWeekly?.ema21?.slice(-90)}
                        ema50={alert.emaWeekly?.ema50?.slice(-90)}
                        sma200={alert.emaWeekly?.sma200?.slice(-90)}
                        title="Weekly" 
                      />
                    </View>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

      {!loading && backtest && backtest.top3 && backtest.top3.length === 0 && (
        <View style={styles.content}>
          <Text style={styles.emptyText}>No alerts found for {endDate}</Text>
        </View>
      )}
    </ScrollView>
  )
}