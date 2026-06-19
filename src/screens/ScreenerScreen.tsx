import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ScreenerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screener</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700' },
})
