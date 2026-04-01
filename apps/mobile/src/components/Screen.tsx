import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { AppTheme, useAppTheme } from '@/theme';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = false }: ScreenProps) {
  const theme = useAppTheme();
  const styles = createStyles(theme);

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />
      <View style={styles.glowTertiary} />
      {content}
    </SafeAreaView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    glowPrimary: {
      position: 'absolute',
      top: -120,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: theme.colors.secondary,
      opacity: 0.55,
    },
    glowSecondary: {
      position: 'absolute',
      top: 180,
      left: -110,
      width: 240,
      height: 240,
      borderRadius: 999,
      backgroundColor: theme.colors.backgroundAccent,
      opacity: 0.7,
    },
    glowTertiary: {
      position: 'absolute',
      bottom: -80,
      right: -40,
      width: 220,
      height: 220,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceAlt,
      opacity: 0.45,
    },
  });
}
