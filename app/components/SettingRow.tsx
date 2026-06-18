import React from 'react'
import { View, Text, StyleSheet, Switch, TextInput } from 'react-native'
import Slider from '@react-native-community/slider'

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 4 },
  description: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  sliderContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
})

interface Props {
  label: string
  description?: string
  type: 'toggle' | 'slider' | 'input'
  value: any
  onChange: (value: any) => void
  sliderMin?: number
  sliderMax?: number
  sliderStep?: number
  inputKeyboardType?: 'numeric' | 'decimal-pad'
  suffix?: string
}

export default function SettingRow({ label, description, type, value, onChange, sliderMin, sliderMax, sliderStep, inputKeyboardType, suffix }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      
      <View style={styles.control}>
        {type === 'toggle' && <Switch value={value} onValueChange={onChange} />}
        
        {type === 'input' && (
          <TextInput
            value={String(value)}
            onChangeText={(text) => onChange(inputKeyboardType === 'numeric' ? parseInt(text) || 0 : parseFloat(text) || 0)}
            keyboardType={inputKeyboardType || 'numeric'}
            style={{ borderWidth: 1, borderColor: '#d1d5db', padding: 8, borderRadius: 4, width: 100, textAlign: 'right' }}
          />
        )}
        
        {type === 'slider' && (
          <View style={styles.sliderContainer}>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={sliderMin || 0}
              maximumValue={sliderMax || 100}
              step={sliderStep || 1}
              value={value}
              onValueChange={onChange}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#d1d5db"
              thumbTintColor="#3b82f6"
            />
            <Text style={styles.value}>
              {value.toFixed(sliderStep === 0.1 ? 1 : 0)}{suffix || ''}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
