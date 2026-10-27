import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

// enableChangeListener es necesario para que useLiveQuery se actualice solo
const expoDb = openDatabaseSync('mi-tienda.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });
