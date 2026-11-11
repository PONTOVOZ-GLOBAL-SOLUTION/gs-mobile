import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'parada_inteligente.db';
const DATABASE_VERSION = 1;

/**
 * Cria/atualiza as tabelas. Chamado pelo SQLiteProvider antes de qualquer tela abrir.
 * Usa PRAGMA user_version para rodar cada migração uma única vez.
 */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        destination_name TEXT NOT NULL,
        best_option TEXT NOT NULL,
        best_total_minutes INTEGER NOT NULL,
        options_count INTEGER NOT NULL,
        searched_at TEXT NOT NULL
      );
    `);
    currentVersion = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
