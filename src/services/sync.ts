import {
  getLocalByClientIds,
  getPendingProducts,
  insertFromCloud,
  markSynced,
  updateFromCloud,
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
  // 1. Bajar: productos del usuario en la nube
  const { data, error } = await supabase
    .from('products')
    .select('client_id, name, quantity, price, updated_at')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);

  const remote = (data ?? []) as RemoteProduct[];
  const local = await getLocalByClientIds(remote.map((r) => r.client_id));
  let downloaded = 0;
  for (const r of remote) {
    const fields = {
      name: r.name,
      quantity: r.quantity,
      price: r.price,
      updatedAt: new Date(r.updated_at),
    };
    const existing = local.get(r.client_id);
    if (!existing) {
      // No está en el teléfono: se inserta marcado como sincronizado
      await insertFromCloud({ clientId: r.client_id, ...fields });
      downloaded++;
    } else if (fields.updatedAt.getTime() > existing.updatedAt.getTime()) {
      // Extra "gana el último cambio": la nube es más reciente que el teléfono
      await updateFromCloud(existing.id, fields);
      downloaded++;
    }
    // Si el local es más reciente, queda pendiente y se sube en el paso 2
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
