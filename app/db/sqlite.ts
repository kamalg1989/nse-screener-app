// app/db/sqlite.ts

import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import * as zlib from 'zlib'

let cachedDB: SQLite.SQLiteDatabase | null = null

export async function openDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (Platform.OS === 'web') {
    console.log('Skipping DB init on web')
    return null
  }

  try {
    if (cachedDB) return cachedDB

    const dbName = 'screener_data.db'
    const dbPath = `${FileSystem.documentDirectory}${dbName}`

    // Check if DB already exists
    const dbFileInfo = await FileSystem.getInfoAsync(dbPath)
    if (!dbFileInfo.exists) {
      console.log('📥 Database not found, attempting to load bundled database...')
      await loadBundledDatabase()
    }

    // Open the database
    cachedDB = await SQLite.openDatabaseAsync(dbName)
    console.log('✅ Database opened successfully')
    return cachedDB
  } catch (error) {
    console.error('❌ Error opening database:', error)
    return null
  }
}

export async function loadBundledDatabase(): Promise<void> {
  try {
    console.log('🔍 Looking for bundled database...')

    const dbName = 'screener_data.db'
    const dbPath = `${FileSystem.documentDirectory}${dbName}`
    const assetPath = `${FileSystem.bundleDirectory}assets/data/${dbName}`

    const assetInfo = await FileSystem.getInfoAsync(assetPath)
    if (!assetInfo.exists) {
      console.log('⚠️ Bundled database not found')
      return
    }

    console.log('📦 Copying database...')
    await FileSystem.copyAsync({ from: assetPath, to: dbPath })
    console.log(`✅ Database ready`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

export async function getAllAsync<T>(
  db: SQLite.SQLiteDatabase,
  query: string,
  args?: any[]
): Promise<T[] | null> {
  if (!db) return null
  try {
    const result = await db.getAllAsync<T>(query, args)
    return result
  } catch (error) {
    console.error('❌ DB query error:', error)
    return null
  }
}