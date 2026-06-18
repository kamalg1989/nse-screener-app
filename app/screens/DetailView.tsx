import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DetailView({ route }: any) {
  const { symbol } = route?.params || {}
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{symbol || 'Stock Details'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700' },
})
