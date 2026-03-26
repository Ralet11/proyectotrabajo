# Oficios Marketplace

Monorepo del MVP mobile-first para conectar clientes con profesionales de oficios en Argentina.

## Workspaces

- `apps/mobile`: app Expo + React Native
- `apps/admin`: panel web interno con React + Vite + MUI
- `apps/api`: backend NestJS + Prisma + PostgreSQL
- `apps/worker`: procesos BullMQ para tareas asíncronas
- `packages/contracts`: contratos Zod y tipos compartidos
- `packages/domain`: enums y conceptos del dominio
- `packages/config`: validación de variables de entorno
- `packages/utils`: helpers transversales

## Primeros pasos

```bash
pnpm install
pnpm db:generate
pnpm build
```

La fuente de verdad funcional y de coordinación para humanos y agentes está en `AGENTS.md`.

