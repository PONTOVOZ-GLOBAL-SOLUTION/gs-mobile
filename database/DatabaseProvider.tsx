import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SQLiteProvider } from 'expo-sqlite';
import Loading from '../components/Loading';
import Message from '../components/Message';
import { colors, spacing } from '../constants/theme';
import { DATABASE_NAME, migrateDatabase } from './database';

type Status = 'checking' | 'waiting' | 'ready' | 'error';

const LOCK_NAME = 'parada-inteligente-db';

// Abre o banco SQLite para o app inteiro.
//
// No celular o banco abre direto. Na versão WEB o banco é um arquivo do navegador
// que só UMA aba consegue abrir por vez. Por isso, antes de abrir, pedimos uma
// "trava" ao navegador (Web Locks API): se o app já estiver aberto em outra aba,
// esta aba espera e abre sozinha quando a outra for fechada.
export default function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>(Platform.OS === 'web' ? 'checking' : 'ready');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
    if (!locks) {
      setStatus('ready');
      return;
    }

    // A trava fica presa enquanto a aba estiver aberta (a promise nunca resolve)
    let release: () => void = () => {};
    const holdForever = new Promise<void>((resolve) => (release = resolve));

    locks.request(LOCK_NAME, { ifAvailable: true }, async (lock) => {
      if (lock) {
        setStatus('ready');
        return holdForever;
      }
      // Outra aba está com o banco: espera na fila até ela fechar
      setStatus('waiting');
      return locks.request(LOCK_NAME, async () => {
        // pequena pausa para o navegador liberar o arquivo da outra aba
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStatus('ready');
        return holdForever;
      });
    });

    return () => release();
  }, []);

  const handleError = (error: Error) => {
    // adiado para não alterar o estado durante a renderização do SQLiteProvider
    setTimeout(() => {
      setErrorMessage(error.message);
      setStatus('error');
    }, 0);
  };

  if (status === 'checking') {
    return (
      <View style={styles.screen}>
        <Loading message="Abrindo o banco de dados..." />
      </View>
    );
  }

  if (status === 'waiting') {
    return (
      <View style={styles.screen}>
        <Message
          type="empty"
          title="O app já está aberto em outra aba"
          message="O banco de dados só pode ser usado por uma aba por vez. Feche a outra aba e esta abre sozinha."
        />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.screen}>
        <Message
          type="error"
          title="Não foi possível abrir o banco de dados"
          message={errorMessage}
          actionTitle={Platform.OS === 'web' ? 'Recarregar' : undefined}
          onAction={Platform.OS === 'web' ? () => window.location.reload() : undefined}
        />
      </View>
    );
  }

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase} onError={handleError}>
      {children}
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.md,
  },
});
