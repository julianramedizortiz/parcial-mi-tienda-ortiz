import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner, Button } from '@/components/ui';
import { colors, money, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { productActions, useProducts } from '@/hooks/useProducts';
import { syncProducts } from '@/services/sync';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function PrincipalScreen() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const { products, totalUnits, totalValue, pendingCount, isPending } = useProducts();
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'error' | 'success' } | null>(null);
  const [search, setSearch] = useState('');

  // Extra: búsqueda por nombre (los totales siguen siendo de todo el inventario)
  const visible = products.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const onSync = async () => {
    if (!session) return;
    setSyncing(true);
    setMessage(null);
    try {
      const { uploaded, downloaded } = await syncProducts(session.user.id);
      setMessage({ kind: 'success', text: `${plural(uploaded, 'subido')}, ${plural(downloaded, 'bajado')}` });
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      setMessage({ kind: 'error', text: `No se pudo sincronizar (¿sin conexión?): ${detail}` });
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

  const header = (
    <View style={styles.headerContent}>
      <View style={styles.stats}>
        <Stat icon="cube-outline" label="Unidades" value={String(totalUnits)} />
        <Stat icon="cash-outline" label="Valor inventario" value={money(totalValue)} />
        <Stat
          icon="cloud-upload-outline"
          label="Pendientes"
          value={String(pendingCount)}
          highlight={pendingCount > 0}
        />
      </View>

      <Button title="Sincronizar" icon="sync-outline" variant="outline" onPress={onSync} loading={syncing} />
      {message && <Banner kind={message.kind} text={message.text} />}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre"
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <Text style={styles.sectionTitle}>Productos ({visible.length})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hola 👋</Text>
          <Text style={styles.email} numberOfLines={1}>
            {session?.user.email}
          </Text>
        </View>
        <Pressable style={styles.logout} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={header}
        contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 10 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="basket-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No hay productos todavía</Text>
          </View>
        }
        ListFooterComponent={
          products.length > 0 ? (
            <Text style={styles.hint}>Toca para editar · mantén presionado para eliminar</Text>
          ) : undefined
        }
        renderItem={({ item }) => {
          const pending = isPending(item);
          return (
            <Pressable
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
              onPress={() => router.push({ pathname: '/producto', params: { id: String(item.id) } })}
              onLongPress={() => confirmDelete(item.id, item.name)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemSub}>
                  {item.quantity} und · {money(item.price)} c/u
                </Text>
                <View style={[styles.badge, { backgroundColor: pending ? colors.warningSoft : colors.successSoft }]}>
                  <Ionicons
                    name={pending ? 'time-outline' : 'cloud-done-outline'}
                    size={12}
                    color={pending ? colors.warning : colors.success}
                  />
                  <Text style={[styles.badgeText, { color: pending ? colors.warning : colors.success }]}>
                    {pending ? 'Pendiente' : 'En la nube'}
                  </Text>
                </View>
              </View>
              <Text style={styles.subtotal}>{money(item.quantity * item.price)}</Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, { bottom: insets.bottom + 20 }, pressed && { opacity: 0.85 }]}
        onPress={() => router.push('/producto')}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Agregar</Text>
      </Pressable>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.stat, highlight && { backgroundColor: colors.warningSoft }]}>
      <Ionicons name={icon} size={18} color={highlight ? colors.warning : colors.primary} />
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  hello: { color: '#fff', fontSize: 22, fontWeight: '800' },
  email: { color: colors.primarySoft },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  headerContent: { gap: 12, marginBottom: 4 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, padding: 12, gap: 4, ...shadow },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.muted },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: radius.md,
    ...shadow,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.primary },
  itemName: { fontSize: 16, fontWeight: '700', color: colors.text },
  itemSub: { color: colors.muted, fontSize: 13 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  subtotal: { fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyText: { color: colors.muted },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    ...shadow,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
