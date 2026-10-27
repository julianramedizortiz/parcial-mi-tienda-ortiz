import {
  getExistingClientIds,
  getPendingProducts,
  insertFromCloud,
  markSynced,
} from '@/db/repositories/products';
import { supabase } from '@/lib/supabase';

export type SyncResult = { uploaded: number; downloaded: number };

type RemoteProduct = {
  client_id: string;
  name: string;
  quantity: number;
  price: number;
  updated_at: string;
};

export async function syncProducts(userId: string): Promise<SyncResult> {
  // 1. Bajar: productos del usuario que no estén en el teléfono
  const { data, error } = await supabase
    .from('products')
    .select('client_id, name, quantity, price, updated_at')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const remote = (data ?? []) as RemoteProduct[];
  const existing = await getExistingClientIds(remote.map((r) => r.client_id));
  let downloaded = 0;
  for (const r of remote) {
    if (existing.has(r.client_id)) continue;
    await insertFromCloud({
      clientId: r.client_id,
      name: r.name,
      quantity: r.quantity,
      price: r.price,
      updatedAt: new Date(r.updated_at),
    });
    downloaded++;
  }

  // 2. Subir: pendientes con upsert por client_id (no duplica)
  const pending = await getPendingProducts();
  let uploaded = 0;
  for (const p of pending) {
    const { error: upError } = await supabase.from('products').upsert(
      {
        client_id: p.clientId,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        updated_at: p.updatedAt.toISOString(),
      },
      { onConflict: 'client_id' }
    );
    if (upError) throw new Error(upError.message);
    // syncedAt = el updatedAt que se subió (si se edita después, vuelve a quedar pendiente)
    await markSynced(p.id, p.updatedAt);
    uploaded++;
  }

  return { uploaded, downloaded };
}
