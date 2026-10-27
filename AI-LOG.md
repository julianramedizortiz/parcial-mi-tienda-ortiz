# AI-LOG

Herramienta usada: Claude Code (modelo Claude Opus 5.5) dentro de VS Code.

## Prompt

> Le pasé el archivo `INSTRUCCIONES-PARCIAL.md` completo y le escribí: "ayudame con esto".

## Qué hizo la IA

- Instaló dependencias con `npx expo install` (versiones compatibles con SDK 58).
- Revisó las firmas reales en `node_modules` (`useMigrations`, `useLiveQuery`, `Stack.Protected`, `SecureStore`) antes de escribir código, en vez de confiar en su memoria.
- Generó esquema, migración, repositorio, hook, contexto de auth, sincronización y las 4 pantallas.
- Corrió `tsc --noEmit`, `expo lint`, `expo-doctor` y un `expo export` de Android para verificar que compila.

## Qué se corrigió del código generado

- El lint marcó comillas sin escapar en un texto JSX de `index.tsx` (`react/no-unescaped-entities`); se quitaron.
- _Agregar aquí lo que tú corrijas al probar en el teléfono._

## Alucinaciones detectadas

- _Ninguna detectada hasta ahora / describir si encuentras alguna al probar._
