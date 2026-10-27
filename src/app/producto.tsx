import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Field } from '@/components/ui';
import { colors, money, radius, shadow } from '@/constants/theme';
import { productActions } from '@/hooks/useProducts';

const isNonNegativeInt = (value: string) => /^\d+$/.test(value.trim());

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id ? Number(id) : undefined;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modo edición: carga el producto desde SQLite
  useEffect(() => {
    if (!productId) return;
    productActions.getProductById(productId).then((p) => {
      if (!p) return;
      setName(p.name);
      setQuantity(String(p.quantity));
      setPrice(String(p.price));
    });
  }, [productId]);

  const onSave = async () => {
    if (!name.trim()) return setError('El nombre es obligatorio.');
    if (!isNonNegativeInt(quantity)) return setError('La cantidad debe ser un número entero ≥ 0.');
    if (!isNonNegativeInt(price)) return setError('El precio debe ser un número entero ≥ 0.');

    const input = { name: name.trim(), quantity: Number(quantity), price: Number(price) };
    if (productId) {
      await productActions.updateProduct(productId, input);
    } else {
      await productActions.createProduct(input);
    }
    router.back();
  };

  const subtotal = isNonNegativeInt(quantity) && isNonNegativeInt(price) ? Number(quantity) * Number(price) : 0;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: productId ? 'Editar producto' : 'Nuevo producto' }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field label="Nombre" icon="pricetag-outline" value={name} onChangeText={setName} placeholder="Ej. Arroz 500 g" />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Cantidad"
                icon="cube-outline"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
                placeholder="0"
              />
            </View>
            <View style={styles.flex}>
              <Field
                label="Precio (pesos)"
                icon="cash-outline"
                value={price}
                onChangeText={setPrice}
                keyboardType="number-pad"
                placeholder="0"
              />
            </View>
          </View>
          <View style={styles.subtotal}>
            <Text style={styles.subtotalLabel}>Valor en inventario</Text>
            <Text style={styles.subtotalValue}>{money(subtotal)}</Text>
          </View>
        </View>
        {error && <Banner kind="error" text={error} />}
        <Button title={productId ? 'Guardar cambios' : 'Agregar producto'} icon="checkmark" onPress={onSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: 16, gap: 14 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 18, gap: 14, ...shadow },
  row: { flexDirection: 'row', gap: 12 },
  subtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    padding: 12,
  },
  subtotalLabel: { color: colors.primaryDark, fontWeight: '600' },
  subtotalValue: { color: colors.primaryDark, fontWeight: '800', fontSize: 18 },
});
