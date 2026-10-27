import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: productId ? 'Editar producto' : 'Nuevo producto' }} />
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej. Arroz 500 g" />
      <Text style={styles.label}>Cantidad</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="number-pad"
        placeholder="0"
      />
      <Text style={styles.label}>Precio (pesos)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="number-pad"
        placeholder="0"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  error: { color: '#c62828' },
  button: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
