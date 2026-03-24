# ARCHITECTURE.md — Decisión arquitectónica boki-front

## ADR-001: Arquitectura FSD + Smart/Dumb + Atomic Design

**Estado**: Aprobada
**Fecha**: 2026-03-16
**Contexto**: boki-front como base multi-proyecto empresarial en Angular

---

## Contexto y problema

Se necesita una arquitectura para un proyecto Angular que:

1. Sirva como **base (boilerplate) para múltiples proyectos** de la empresa
2. Soporte **theming dinámico** (dark/light + personalización por cliente vía JSON/BD)
3. Sea **libre de librerías UI externas** — componentes propios personalizables
4. Escale en funcionalidades sin degradar la mantenibilidad
5. Permita que nuevos desarrolladores se orienten rápidamente
6. Sea compatible con Angular 19+ standalone components y Signals

## Opciones evaluadas

### Opción A: Estructura clásica Angular (core/shared/modules)

```
src/app/
├── core/          # Servicios singleton, guards, interceptors
├── shared/        # Componentes, pipes, directivas reutilizables
└── modules/       # Feature modules lazy-loaded
    ├── auth/
    ├── dashboard/
    └── contracts/
```

**Pros**: Familiar, bien documentada, fácil de arrancar.
**Contras**: No escala bien — `shared/` se convierte en cajón de sastre. Sin reglas de dependencia explícitas. Difícil distinguir qué es reutilizable vs qué es de un feature específico. No hay convención para componentes multi-dominio.

### Opción B: Domain-Driven Design con Nx monorepo

```
packages/
├── contracts/
│   ├── feat-contract-list/
│   ├── feat-contract-detail/
│   ├── ui-contract-card/
│   └── data-access/
├── shared/
│   ├── ui/
│   └── util/
└── apps/
    └── boki-app/
```

**Pros**: Excelente para multi-app, boundaries por librería, tooling Nx.
**Contras**: Overhead de Nx para un solo proyecto. Demasiada granularidad inicial. Requiere monorepo desde día 1. Más complejo de entender para equipos pequeños.

### Opción C: Feature-Sliced Design + Smart/Dumb + Atomic Design (ELEGIDA)

```
src/
├── app/           # Bootstrap
├── pages/         # Vistas por ruta
├── widgets/       # Bloques compuestos
├── features/      # Acciones de usuario
├── entities/      # Modelos de dominio
└── shared/        # UI kit + utils + tokens
```

**Pros**:
- Reglas de dependencia explícitas y enforceable con ESLint
- Estructura por dominio de negocio, no por tipo técnico
- Cada slice es removible como "cortar un pedazo de pastel"
- Escala de proyecto pequeño a enterprise sin refactor
- Compatible con migración gradual
- Smart/Dumb dentro de cada slice mantiene testabilidad
- Atomic Design en `shared/ui/` permite design system propio
- Path alias claros: `@features/auth`, `@entities/user`
- Adoptable sin herramientas externas (solo ESLint)

**Contras**:
- Curva de aprendizaje media (los 6 layers + regla de dependencia)
- Requiere disciplina en public APIs
- Más archivos `index.ts`

### Opción D: Hexagonal/Clean Architecture

**Pros**: Máximo desacoplamiento del framework, domain puro.
**Contras**: Over-engineering para frontend. Demasiadas capas de abstracción (ports, adapters, use cases). Difícil de adoptar gradualmente. No aporta valor proporcional al costo en un proyecto Angular standalone.

## Decisión

**Opción C: Feature-Sliced Design + Smart/Dumb + Atomic Design**

La combinación de tres patrones complementarios cubre todos los requisitos:

| Requisito | Cómo lo resuelve |
|-----------|-----------------|
| Base multi-proyecto | FSD: estructura estandarizada + `shared/` extraíble |
| Theming dinámico | Atomic Design en `shared/ui/` + CSS custom properties |
| Sin librerías UI | Componentes propios en `shared/ui/` con tokens |
| Mantenibilidad | FSD: regla de dependencia unidireccional |
| Extensibilidad | FSD: agregar slice sin tocar otros |
| Onboarding rápido | FSD: estructura predecible + Smart/Dumb: patrón universal |
| Angular 19+ | Standalone components + Signals nativos |

## Reglas arquitectónicas (INVARIANTES)

### 1. Regla de dependencia FSD

```
Capa superior SOLO importa de capas inferiores.
Nunca lateral. Nunca hacia arriba.

app → pages → widgets → features → entities → shared
```

### 2. Aislamiento de slices

Un slice NO puede importar otro slice de la misma capa.

```typescript
// ❌ PROHIBIDO: feature importando otra feature
// features/create-contract/api/contract.service.ts
import { AuthStore } from '@features/auth';  // VIOLACIÓN

// ✅ CORRECTO: si create-contract necesita auth, 
// el page que los compone pasa los datos via input/output
```

### 3. Public API obligatoria

Todo slice expone un `index.ts`. Imports externos SOLO via public API.

### 4. Container/Presentational por feature

Cada feature/page se divide en:
- **Container** (1-2 por slice): inyecta servicios, gestiona estado
- **Presentational** (N por slice): solo `input()` + `output()`, OnPush

### 5. Componentes atómicos en shared/ui/

`shared/ui/` sigue jerarquía Atomic Design adaptada:
- **Átomos**: Button, Input, Badge, Icon, Spinner
- **Moléculas**: FormField (Label + Input + Error), SearchBar, Breadcrumb
- **Organismos**: Modal, Alert/Toast, Dropdown

Todos consumen CSS custom properties `var(--bk-*)`. Cero estilos hardcodeados.

### 6. Estado con Signals

- Estado local de componente: `signal()`, `computed()`
- Estado de slice (feature/entity): clase `*Store` con signals
- NO usar NgRx, NGXS, o RxJS BehaviorSubject para estado
- RxJS solo para streams HTTP (`HttpClient`) y operadores de transformación

### 7. Theming via CSS custom properties

- JSON define la configuración visual completa (colores, tipografía, borders, sizing)
- `ThemeService` aplica JSON → CSS variables en `:root`
- Dark/light son dos objetos en el mismo JSON
- Componentes NUNCA definen colores directamente

## Consecuencias

### Positivas
- Cualquier proyecto nuevo arranca con la misma estructura
- Cambiar de cliente = cambiar JSON de theming
- Un desarrollador nuevo entiende dónde va cada cosa en <1 día
- Se puede extraer `shared/` como librería Nx en el futuro sin refactor
- Los tests son simples: presentacionales se testean con inputs/outputs

### Negativas aceptadas
- Más archivos `index.ts` que mantener
- Requiere disciplina: la regla de dependencia no se enforza sola sin ESLint
- Curva de aprendizaje inicial para devs acostumbrados a estructura clásica
- Widgets como data-table requieren diseño genérico upfront

### Riesgos mitigados
- **Riesgo**: Devs ignoran las reglas → **Mitigación**: ESLint + CI que falla en violaciones
- **Riesgo**: `shared/ui/` crece sin control → **Mitigación**: componentes se gradúan de átomo a molécula con review
- **Riesgo**: Sobre-ingeniería → **Mitigación**: no todos los layers son obligatorios; empezar con shared → entities → features → pages

## Diagrama de dependencias

```
┌─────────────────────────────────────────┐
│                  app/                    │  ← Bootstrap, routing, providers
│  Importa: pages, widgets, features,     │
│           entities, shared              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│                pages/                    │  ← Vistas completas (lazy routes)
│  Importa: widgets, features,            │
│           entities, shared              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│               widgets/                   │  ← Bloques compuestos (data-table, sidebar)
│  Importa: features, entities, shared    │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              features/                   │  ← Acciones de negocio (login, create-contract)
│  Importa: entities, shared              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│              entities/                   │  ← Modelos de dominio (user, contract)
│  Importa: shared                        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│               shared/                    │  ← UI kit, tokens, utils, API base
│  Importa: NADA                          │
└─────────────────────────────────────────┘
```

## Referencias

- [Feature-Sliced Design](https://feature-sliced.design/)
- [FSD en Angular — codecentric](https://www.codecentric.de/en/knowledge-hub/blog/feature-sliced-design-and-good-frontend-architecture)
- [Angular Architecture Best Practices — dev-academy](https://dev-academy.com/angular-architecture-best-practices/)
- [Container/Presentational Pattern](https://www.patterns.dev/vue/container-presentational/)
- [Atomic Design — Brad Frost](https://atomicdesign.bradfrost.com/chapter-2/)
