import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Campo de texto con etiqueta e ícono. */
export function Field({ label, icon, ...props }: TextInputProps & { label: string; icon: IconName }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <Ionicons name={icon} size={18} color={colors.muted} />
        <TextInput style={styles.input} placeholderTextColor="#94A3B8" {...props} />
      </View>
    </View>
  );
}

/** Botón principal (relleno) o secundario (borde). */
export function Button({
  title,
  onPress,
  icon,
  loading,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}) {
  const outline = variant === 'outline';
  const fg = outline ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, outline && styles.buttonOutline, pressed && { opacity: 0.8 }]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={fg} />}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

/** Mensaje de error o éxito con ícono. */
export function Banner({ text, kind }: { text: string; kind: 'error' | 'success' }) {
  const error = kind === 'error';
  return (
    <View style={[styles.banner, { backgroundColor: error ? colors.dangerSoft : colors.successSoft }]}>
      <Ionicons
        name={error ? 'alert-circle' : 'checkmark-circle'}
        size={18}
        color={error ? colors.danger : colors.success}
      />
      <Text style={[styles.bannerText, { color: error ? colors.danger : colors.success }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  button: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.sm,
  },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  buttonText: { fontSize: 16, fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.sm },
  bannerText: { flex: 1, fontWeight: '600' },
});
