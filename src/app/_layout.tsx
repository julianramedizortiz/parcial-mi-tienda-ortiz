import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { db } from '@/db/client';
import migrations from '../../drizzle/migrations';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const loggedIn = !!session;
  return (
    <Stack>
      {/* Sin sesión: solo Login y Registro */}
      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="registro" options={{ title: 'Registro' }} />
      </Stack.Protected>
      {/* Con sesión: solo Principal y Formulario */}
      <Stack.Protected guard={loggedIn}>
        <Stack.Screen name="index" options={{ title: 'Mi Tienda' }} />
        <Stack.Screen name="producto" options={{ title: 'Producto' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error en la migración: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});
