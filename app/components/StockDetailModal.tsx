import React from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import ChartView from './ChartView'
import { Alert } from '../screener/screener'

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { flex: 1, backgroundColor: '#fff', marginTop: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { backgroundColor: '#3b82f6', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  symbol: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  closeBtn: { fontSize: 24, color: '#fff' },
  body: { padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detailCol: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#6b7280' },
  detailValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  chartContainer: { marginVertical: 16 },
  chartTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
})

interface Props {
  alert: Alert
  visible: boolean
  onClose: () => void
}

export default function StockDetailModal({ alert, visible, onClose }: Props) {
  const dailyBars = alert.charts?.daily || []
  const weeklyBars = alert.charts?.weekly || []

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modal}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.symbol}>{alert.symbol}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Entry</Text>
                <Text style={styles.detailValue}>₹{alert.entry.toFixed(2)}</Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Target</Text>
                <Text style={[styles.detailValue, { color: '#16a34a' }]}>₹{alert.target.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
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
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{alert.type}</Text>
              </View>
            </View>

            {dailyBars.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Daily Chart</Text>
                <ChartView bars={dailyBars.slice(-90)} ema10={alert.ema?.ema10?.slice(-90)} ema21={alert.ema?.ema21?.slice(-90)} ema50={alert.ema?.ema50?.slice(-90)} sma200={alert.ema?.sma200?.slice(-90)} title="Daily" />
              </View>
            )}

            {weeklyBars.length > 0 && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weekly Chart</Text>
                <ChartView bars={weeklyBars.slice(-90)} ema10={alert.emaWeekly?.ema10?.slice(-90)} ema21={alert.emaWeekly?.ema21?.slice(-90)} ema50={alert.emaWeekly?.ema50?.slice(-90)} sma200={alert.emaWeekly?.sma200?.slice(-90)} title="Weekly" />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
