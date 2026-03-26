# ADR 0001: Modular Monolith First

## Estado

Aceptado

## Contexto

El MVP requiere velocidad de salida, tipado fuerte, un dominio claro y la capacidad de crecer sin reescribir todo el sistema.

## Decisión

Implementar un monorepo con:

- `apps/api` como modular monolith NestJS.
- `apps/worker` para tareas asíncronas.
- `apps/mobile` y `apps/admin` desacoplados por contratos compartidos.
- `packages/contracts` como fuente única de validaciones Zod y tipos inferidos.

## Consecuencias

- Menor costo operacional que microservicios.
- Fronteras de dominio claras desde el día 1.
- Reutilización consistente de contratos entre backend y frontends.

