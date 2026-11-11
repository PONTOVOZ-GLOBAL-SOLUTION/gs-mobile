/**
 * Repositório do histórico de buscas feitas neste totem.
 * Único lugar do app que escreve SQL; as telas usam o hook useSearchHistory.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import type { HistoryItem } from '../types';

interface SearchHistoryRow {
  id: number;
  query: string;
  destination_name: string;
  best_option: string;
  best_total_minutes: number;
  options_count: number;
  searched_at: string;
}

export type NewHistoryItem = Omit<HistoryItem, 'id' | 'searchedAt'>;

function toEntry(row: SearchHistoryRow): HistoryItem {
  return {
    id: row.id,
    query: row.query,
    destinationName: row.destination_name,
    bestOption: row.best_option,
    bestTotalMinutes: row.best_total_minutes,
    optionsCount: row.options_count,
    searchedAt: row.searched_at,
  };
}

export async function addSearch(db: SQLiteDatabase, entry: NewHistoryItem): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO search_history
       (query, destination_name, best_option, best_total_minutes, options_count, searched_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    entry.query,
    entry.destinationName,
    entry.bestOption,
    entry.bestTotalMinutes,
    entry.optionsCount,
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

export async function listSearches(db: SQLiteDatabase, limit = 50): Promise<HistoryItem[]> {
  const rows = await db.getAllAsync<SearchHistoryRow>(
    'SELECT * FROM search_history ORDER BY searched_at DESC, id DESC LIMIT ?',
    limit,
  );
  return rows.map(toEntry);
}

export async function deleteSearch(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM search_history WHERE id = ?', id);
}

export async function clearSearches(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM search_history');
}
