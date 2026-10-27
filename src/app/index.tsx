import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { productActions, useProducts } from '@/hooks/useProducts';
import { syncProducts } from '@/services/sync';

const money = (n: number) => '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function PrincipalScreen() {
  const { session, signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount, isPending } = useProducts();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSync = async () => {
    if (!session) return;
    setSyncing(true);
    setMessage(null);
    try {
      const { uploaded, downloaded } = await syncProducts(session.user.id);
      setMessage(`${uploaded} subidos, ${downloaded} bajados`);
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setMessage(`No se pudo sincronizar (¿sin conexión?): ${detail}`);
    } finally {
      setSyncing(false);
    }
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => productActions.deleteProduct(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text>Total unidades: {totalUnits}</Text>
        <Text>Valor inventario: {money(totalValue)}</Text>
        <Text>Pendientes por subir: {pendingCount}</Text>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.button} onPress={onSync} disabled={syncing}>
          {syncing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sincronizar</Text>}
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push('/producto')}>
          <Text style={styles.buttonText}>Agregar</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.logout]} onPress={signOut}>
          <Text style={styles.buttonText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      {message && <Text style={styles.message}>{message}</Text>}

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        ListEmptyComponent={<Text style={styles.empty}>No hay productos. Toca Agregar.</Text>}
        renderItem={({ item }) => {
          const pending = isPending(item);
          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
              onLongPress={() => confirmDelete(item.id, item.name)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text>
                  {item.quantity} und × {money(item.price)}
                </Text>
              </View>
              <Text style={[styles.badge, pending ? styles.pending : styles.synced]}>
                {pending ? 'pendiente' : 'en la nube'}
              </Text>
            </Pressable>
          );
        }}
      />
      <Text style={styles.hint}>Toca para editar · mantén presionado para eliminar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#fff' },
  summary: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, gap: 4 },
  row: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center' },
  logout: { backgroundColor: '#757575' },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  message: { textAlign: 'center', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#777', marginTop: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, fontSize: 12, overflow: 'hidden' },
  pending: { backgroundColor: '#fff3cd', color: '#8a6d00' },
  synced: { backgroundColor: '#d1f2d9', color: '#1b6e33' },
  hint: { textAlign: 'center', color: '#999', fontSize: 12 },
});
