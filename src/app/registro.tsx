import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthCard } from '@/components/AuthCard';
import { Banner, Button, Field } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function RegistroScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim()) return setError('El correo es obligatorio.');
    if (password.length < 6) return setError('La contraseña debe tener mínimo 6 caracteres.');
    if (password !== confirm) return setError('Las contraseñas no coinciden.');

    setBusy(true);
    setError(null);
    const message = await signUp(email.trim(), password);
    setBusy(false);
    // Con "Confirm email" desactivado, signUp inicia sesión y Stack.Protected navega solo
    if (message) setError(message);
  };

  return (
    <AuthCard title="Crear cuenta" subtitle="Regístrate para respaldar tu inventario">
      <Field
        label="Correo"
        icon="mail-outline"
        placeholder="tucorreo@ejemplo.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        label="Contraseña"
        icon="lock-closed-outline"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Field
        label="Confirmar contraseña"
        icon="shield-checkmark-outline"
        placeholder="Repite la contraseña"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      {error && <Banner kind="error" text={error} />}
      <Button title="Registrarme" icon="person-add-outline" onPress={onSubmit} loading={busy} />
      <Text style={styles.footer}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={styles.link}>
          Volver al login
        </Link>
      </Text>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  footer: { textAlign: 'center', color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
