import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  allProductsQuery,
  createProduct,
  deleteProduct,
  getProductById,
  isPending,
  updateProduct,
} from '@/db/repositories/products';

/** Lista reactiva de productos + totales. Las pantallas solo usan este hook. */
export function useProducts() {
  const { data, error } = useLiveQuery(allProductsQuery());
  const items = data ?? [];

  const totalUnits = items.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = items.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const pendingCount = items.filter(isPending).length;

  return { products: items, error, totalUnits, totalValue, pendingCount, isPending };
}

/** Acciones de escritura (no necesitan la lista en vivo). */
export const productActions = { getProductById, createProduct, updateProduct, deleteProduct };
