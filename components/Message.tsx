import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, borders, lineHeight } from '../constants/theme';
import Button from './Button';

type Props = {
  type: 'error' | 'empty';
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
  children?: React.ReactNode;
};

// Usado para os estados de ERRO (com "Tentar de novo") e de LISTA VAZIA.
export default function Message({ type, title, message, actionTitle, onAction, children }: Props) {
  const isError = type === 'error';

  return (
    <View
      style={[styles.container, isError && styles.containerError]}
      accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'file-tray-outline'}
        size={fonts.huge}
        color={isError ? colors.danger : colors.textMuted}
      />
      <Text style={[styles.title, isError && styles.titleError]} accessibilityRole="header">
        {title}
      </Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {children}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} icon={isError ? 'refresh-outline' : undefined} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
  },
  containerError: { borderColor: colors.danger, borderWidth: borders.regular },
  title: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  titleError: { color: colors.danger },
  message: { fontSize: fonts.regular, color: colors.textMuted, textAlign: 'center', lineHeight: fonts.regular * lineHeight },
});
