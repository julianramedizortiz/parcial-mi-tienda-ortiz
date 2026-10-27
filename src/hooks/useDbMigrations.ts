import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { db } from '@/db/client';
import migrations from '../../drizzle/migrations';

/** Aplica las migraciones de drizzle/ al abrir la app. */
export function useDbMigrations() {
  return useMigrations(db, migrations);
}
