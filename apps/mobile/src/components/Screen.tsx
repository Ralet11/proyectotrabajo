import { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = false }: ScreenProps) {
  const content = scroll ? <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView> : <View style={styles.content}>{children}</View>;

  return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f4',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 14,
  },
});

