import * as SecureStore from 'expo-secure-store';

// SecureStore tiene un límite de ~2048 bytes por valor y la sesión de Supabase
// suele ser más grande, así que se guarda partida en fragmentos.
const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}_chunks`;
const chunkKey = (key: string, i: number) => `${key}_${i}`;

async function removeItem(key: string) {
  const count = Number(await SecureStore.getItemAsync(countKey(key))) || 0;
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(chunkKey(key, i));
  }
  await SecureStore.deleteItemAsync(countKey(key));
}

async function getItem(key: string) {
  const count = Number(await SecureStore.getItemAsync(countKey(key))) || 0;
  if (count === 0) return null;
  let value = '';
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part === null) return null;
    value += part;
  }
  return value;
}

async function setItem(key: string, value: string) {
  await removeItem(key);
  const count = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < count; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(countKey(key), String(count));
}

export const secureStorage = { getItem, setItem, removeItem };
