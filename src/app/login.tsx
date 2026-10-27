import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AuthCard } from '@/components/AuthCard';
import { Banner, Button, Field } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setBusy(true);
    setError(null);
    const message = await signIn(email.trim(), password);
    setBusy(false);
    // Si sale bien, Stack.Protected cambia solo a la pantalla Principal
    if (message) setError(message);
  };

  return (
    <AuthCard title="Iniciar sesión" subtitle="Ingresa para ver tu inventario">
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
        placeholder="••••••"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {error && <Banner kind="error" text={error} />}
      <Button title="Ingresar" icon="log-in-outline" onPress={onSubmit} loading={busy} />
      <Text style={styles.footer}>
        ¿No tienes cuenta?{' '}
        <Link href="/registro" style={styles.link}>
          Regístrate
        </Link>
      </Text>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  footer: { textAlign: 'center', color: colors.muted },
  link: { color: colors.primary, fontWeight: '700' },
});
