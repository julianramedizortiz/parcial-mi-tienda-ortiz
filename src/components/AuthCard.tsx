import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '@/constants/theme';

/** Fondo de color con logo y tarjeta blanca (login y registro). */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Ionicons name="storefront" size={36} color={colors.primary} />
          </View>
          <Text style={styles.brand}>Mi Tienda</Text>
          <Text style={styles.tagline}>Inventario de Doña Rosa · Riohacha</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, gap: 24 },
  hero: { alignItems: 'center', gap: 6 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brand: { fontSize: 30, fontWeight: '800', color: '#fff' },
  tagline: { color: colors.primarySoft },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 22, gap: 14, ...shadow },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { color: colors.muted, marginTop: -8 },
});
