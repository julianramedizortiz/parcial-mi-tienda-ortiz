import * as Crypto from 'expo-crypto';
import { desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';

import { db } from '../client';
import { products, type Product } from '../schema';

export type { Product };
export type ProductInput = { name: string; quantity: number; price: number };

/** Consulta de todos los productos (se usa con useLiveQuery). */
export const allProductsQuery = () => db.select().from(products).orderBy(desc(products.updatedAt));

/** Pendiente = nunca subido o modificado después de la última subida. */
export const isPending = (p: Product) => !p.syncedAt || p.syncedAt.getTime() < p.updatedAt.getTime();

export async function getProductById(id: number) {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function createProduct(input: ProductInput) {
  await db.insert(products).values({
    clientId: Crypto.randomUUID(),
    ...input,
    updatedAt: new Date(),
  });
}

export async function updateProduct(id: number, input: ProductInput) {
  await db
    .update(products)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export async function getPendingProducts() {
  return db
    .select()
    .from(products)
    .where(or(isNull(products.syncedAt), lt(products.syncedAt, products.updatedAt)));
}

/** Productos locales que ya existen, indexados por clientId. */
export async function getLocalByClientIds(clientIds: string[]) {
  if (clientIds.length === 0) return new Map<string, Product>();
  const rows = await db.select().from(products).where(inArray(products.clientId, clientIds));
  return new Map(rows.map((r) => [r.clientId, r]));
}

/** "Gana el último cambio": la versión de la nube reemplaza la local y queda sincronizada. */
export async function updateFromCloud(id: number, p: ProductInput & { updatedAt: Date }) {
  await db
    .update(products)
    .set({ ...p, syncedAt: p.updatedAt })
    .where(eq(products.id, id));
}

/** Inserta un producto que viene de la nube, ya marcado como sincronizado. */
export async function insertFromCloud(p: ProductInput & { clientId: string; updatedAt: Date }) {
  await db
    .insert(products)
    .values({ ...p, syncedAt: p.updatedAt })
    .onConflictDoNothing();
}

/** Marca como sincronizada la versión exacta que se subió. */
export async function markSynced(id: number, uploadedUpdatedAt: Date) {
  await db.update(products).set({ syncedAt: uploadedUpdatedAt }).where(eq(products.id, id));
}
