import * as SQLite from 'expo-sqlite';

import { DB_NAME } from '@/constants/theme';
import {
  SAMPLE_IMAGES_INDEX,
  SAMPLE_IMAGES_TABLE,
  SAMPLES_SEARCH_INDEX,
  SAMPLES_TABLE,
} from '@/database/schema';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Open (or reuse) the singleton SQLite database connection. */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openAndMigrate();
  }
  return databasePromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${SAMPLES_TABLE}
    ${SAMPLE_IMAGES_TABLE}
    ${SAMPLE_IMAGES_INDEX}
    ${SAMPLES_SEARCH_INDEX}
  `);
  return db;
}

/** Close database connection (mainly for testing). */
export async function closeDatabase(): Promise<void> {
  if (databasePromise) {
    const db = await databasePromise;
    await db.closeAsync();
    databasePromise = null;
  }
}
