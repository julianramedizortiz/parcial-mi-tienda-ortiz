# Mi Tienda — Parcial

App móvil de inventario para la tienda de Doña Rosa (Riohacha). Funciona sin internet (SQLite es la fuente de verdad) y respalda los productos en Supabase al sincronizar.

- **Nombre:** _TU NOMBRE COMPLETO_
- **Código:** _TU CÓDIGO_

## Stack

Expo SDK 58 + TypeScript · Expo Router (`Stack.Protected`) · `expo-sqlite` + Drizzle ORM · Supabase (Auth + tabla `products`) · `expo-secure-store` · `expo-crypto`

## Cómo ejecutar

1. Crear `.env` en la raíz (copiar `.env.example`) con los datos del proyecto de Supabase:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   ```
2. En Supabase → SQL Editor, ejecutar el SQL de la tabla `products` con RLS (ver instrucciones del parcial).
3. En Supabase → Authentication → Email, desactivar **Confirm email**.
4. Instalar y ejecutar:
   ```bash
   npm install
   npx expo start
   ```

Las migraciones locales están en `drizzle/` y se aplican solas al abrir la app (`useMigrations`). Si se cambia `src/db/schema.ts`: `npx drizzle-kit generate`.

## Estructura

```
src/app/            pantallas (login, registro, index, producto) y _layout con Stack.Protected
src/db/             schema.ts, client.ts, repositories/products.ts
src/hooks/          useProducts.ts (lista en vivo + totales)
src/lib/            supabase.ts, secureStorage.ts (SecureStore por fragmentos)
src/context/        AuthContext.tsx
src/services/       sync.ts (syncProducts: bajar y luego subir)
drizzle/            migraciones generadas
```

## Capturas

![Login](capturas/01-login.png)
![Registro](capturas/02-registro.png)
![Principal](capturas/03-principal.png)
![Formulario](capturas/04-formulario.png)
![Sin conexión](capturas/05-sin-conexion.png)
![Sincronizado](capturas/06-sincronizado.png)
![Supabase](capturas/07-supabase.png)

## Qué funciona

- Login, registro (correo, contraseña ≥ 6, confirmación) y cerrar sesión con Supabase Auth.
- Sesión persistente en SecureStore (adaptador por fragmentos); rutas protegidas con `Stack.Protected`.
- CRUD local en SQLite con Drizzle; lista reactiva con `useLiveQuery`; funciona en modo avión.
- Totales: unidades, valor del inventario y pendientes por subir.
- Indicador por producto: **en la nube** / **pendiente**.
- Eliminar con confirmación (mantener presionado → `Alert`).
- Sincronizar: baja productos que faltan en el teléfono y sube pendientes con `upsert` por `client_id`; muestra "X subidos, Y bajados" o el error.

## Qué faltó

- Puntos extra no implementados: borrado sincronizado, "gana el último cambio", sincronización automática y búsqueda.
- _Completar según tus pruebas._
