import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { addSearch, clearSearches, deleteSearch, listSearches, NewHistoryItem } from '../database/searchHistoryRepository';
import { HistoryItem } from '../types';

type HistoryContextData = {
  history: HistoryItem[];
  recentDestinations: string[];
  loading: boolean;
  error: string | null;
  saveSearch: (item: NewHistoryItem) => Promise<void>;
  removeSearch: (id: number) => Promise<void>;
  clearHistory: () => Promise<void>;
  reloadHistory: () => Promise<void>;
};

const HistoryContext = createContext<HistoryContextData | null>(null);

// Guarda o histórico de buscas do totem (salvo no SQLite) e compartilha com todas as telas.
export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHistory(await listSearches(db));
    } catch {
      setError('Não foi possível ler as buscas salvas.');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    reloadHistory();
  }, [reloadHistory]);

  const saveSearch = async (item: NewHistoryItem) => {
    await addSearch(db, item);
    await reloadHistory();
  };

  const removeSearch = async (id: number) => {
    await deleteSearch(db, id);
    await reloadHistory();
  };

  const clearHistory = async () => {
    await clearSearches(db);
    await reloadHistory();
  };

  // Últimos destinos sem repetir — viram atalhos na tela inicial.
  const recentDestinations = [...new Set(history.map((h) => h.destinationName))].slice(0, 4);

  return (
    <HistoryContext.Provider
      value={{ history, recentDestinations, loading, error, saveSearch, removeSearch, clearHistory, reloadHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory deve ser usado dentro do HistoryProvider');
  return context;
}
