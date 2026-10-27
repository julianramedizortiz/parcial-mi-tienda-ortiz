# AI-LOG

Herramienta usada: Claude Code (modelo Claude Opus 5.5) dentro de VS Code.

## Prompts

> Le pasé el archivo `INSTRUCCIONES-PARCIAL.md` completo y le escribí: "ayudame con esto".

> "antes de seguir quiero que te asegures de que los criterios de la evaluación se cumplan" (adjuntando el PDF del parcial).

> "hazme otro diseño que se vea más estético".

## Qué hizo la IA

- Instaló dependencias con `npx expo install` (versiones compatibles con SDK 58).
- Revisó las firmas reales en `node_modules` (`useMigrations`, `useLiveQuery`, `Stack.Protected`, `SecureStore`) antes de escribir código, en vez de confiar en su memoria.
- Generó esquema, migración, repositorio, hook, contexto de auth, sincronización y las 4 pantallas.
- Corrió `tsc --noEmit`, `expo lint`, `expo-doctor` y un `expo export` de Android para verificar que compila.

## Qué se corrigió del código generado

- El lint marcó comillas sin escapar en un texto JSX de `index.tsx` (`react/no-unescaped-entities`); se quitaron.
- La primera versión llamaba a `useMigrations` (Drizzle) directamente en `_layout.tsx`. Al revisar los criterios del PDF ("las pantallas no importan Drizzle") se movió a un hook propio, `src/hooks/useDbMigrations.ts`.
- El mensaje de sincronización decía siempre "subidos/bajados"; se ajustó singular/plural ("1 subido").
- En el rediseño, TypeScript rechazó `null` en `ListFooterComponent` del `FlatList`; se cambió por `undefined`.
- La rama se renombró de `master` a `main` para seguir el PDF.

## Alucinaciones detectadas

- Ninguna detectada: las APIs usadas se verificaron contra los tipos instalados y la app funcionó en el teléfono.
