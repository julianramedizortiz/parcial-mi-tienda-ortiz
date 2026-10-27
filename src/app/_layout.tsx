import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useDbMigrations } from '@/hooks/useDbMigrations';

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
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}>
      {/* Sin sesión: solo Login y Registro */}
      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
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
  const { success, error } = useDbMigrations();

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
