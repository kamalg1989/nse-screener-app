import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import ChartView from './ChartView'
import { Alert } from '../screener/screener'

interface Props {
  alert: Alert
  onPress: () => void
}

const styles = StyleSheet.create({
  card: {
    width: Dimensions.get('window').width - 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  type: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#3b82f6' },
  body: { padding: 16 },
  reasoning: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 11, color: '#9ca3af' },
  detailValue: { fontSize: 14, fontWeight: 'bold', marginTop: 4, color: '#000' },
  chartContainer: { marginTop: 16, marginBottom: 16 },
  chartLabel: { fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  tapHint: { fontSize: 12, color: '#3b82f6', textAlign: 'center', paddingVertical: 12, fontWeight: '600' },
})

export default function StockCard({ alert, onPress }: Props) {
  const dailyBars = alert.charts?.daily?.slice(-90) || []

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.symbol}>{alert.symbol}</Text>
        <Text style={styles.type}>{alert.type}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.reasoning}>{alert.reasoning}</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Entry</Text>
            <Text style={styles.detailValue}>₹{alert.entry.toFixed(2)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Target</Text>
            <Text style={[styles.detailValue, { color: '#16a34a' }]}>₹{alert.target.toFixed(2)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>SL</Text>
            <Text style={[styles.detailValue, { color: '#dc2626' }]}>₹{alert.sl.toFixed(2)}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>RR</Text>
            <Text style={[styles.detailValue, { color: '#2563eb' }]}>1:{alert.rr.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Qty</Text>
            <Text style={styles.detailValue}>{alert.qty} shares</Text>
          </View>
        </View>

        {dailyBars.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartLabel}>Daily Chart (90 candles)</Text>
            <ChartView bars={dailyBars} ema10={alert.ema?.ema10?.slice(-90)} ema21={alert.ema?.ema21?.slice(-90)} ema50={alert.ema?.ema50?.slice(-90)} sma200={alert.ema?.sma200?.slice(-90)} title="Daily" />
          </View>
        )}

        <Text style={styles.tapHint}>👆 Tap for full details</Text>
      </View>
    </TouchableOpacity>
  )
}
