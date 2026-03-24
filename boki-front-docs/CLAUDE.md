# CLAUDE.md — boki-front

## Proyecto

boki-front es una plataforma base (boilerplate empresarial) en **Angular 19+ standalone** diseñada para servir como fundación de múltiples proyectos frontend. Cada instancia se personaliza por cliente/empresa cambiando únicamente un archivo JSON de theming (posteriormente desde BD).

## Stack tecnológico

- **Framework**: Angular 19+ (standalone components, NO NgModules)
- **Lenguaje**: TypeScript strict mode
- **Estado**: Angular Signals (signal, computed, effect) — NO RxJS para estado local de componentes. RxJS permitido para HttpClient, Router y streams asíncronos
- **Estilos**: CSS custom properties alimentadas por JSON de theming. Tailwind CSS permitido como utilidad. SIN librerías de componentes UI (Material, PrimeNG, etc.)
- **Build**: Angular CLI + esbuild
- **Linting**: ESLint con reglas de boundaries arquitectónicas
- **Testing**: Vitest o Jest + Angular Testing Library

## Arquitectura: FSD + Smart/Dumb + Atomic Design

La arquitectura combina tres patrones complementarios:

1. **Feature-Sliced Design (FSD)** para la estructura de carpetas y reglas de dependencia
2. **Container/Presentational (Smart/Dumb)** para la separación de responsabilidades en componentes
3. **Atomic Design adaptado** para la jerarquía de componentes UI en `shared/ui/`

### Estructura de carpetas (FSD)

```
src/
├── app/                          # CAPA: App — bootstrap, routing, providers globales
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.component.ts
│   └── providers/
│       ├── theme.provider.ts     # APP_INITIALIZER: carga JSON antes de render
│       └── auth.provider.ts
│
├── pages/                        # CAPA: Pages — vistas completas, lazy-loaded
│   ├── login/
│   │   ├── ui/
│   │   │   └── login-page.component.ts
│   │   └── index.ts              # Public API
│   ├── dashboard/
│   │   ├── ui/
│   │   └── index.ts
│   └── contracts/
│       ├── ui/
│       └── index.ts
│
├── widgets/                      # CAPA: Widgets — bloques compuestos autónomos
│   ├── sidebar/
│   │   ├── ui/
│   │   └── index.ts
│   ├── data-table/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   └── header/
│       ├── ui/
│       └── index.ts
│
├── features/                     # CAPA: Features — acciones de usuario con valor de negocio
│   ├── auth/
│   │   ├── ui/                   # Componentes presentacionales
│   │   ├── model/                # Estado (signals), guards, interceptors
│   │   ├── api/                  # Servicios HTTP, DTOs, mappers
│   │   └── index.ts
│   ├── create-contract/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   └── upload-document/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
│
├── entities/                     # CAPA: Entities — modelos de dominio
│   ├── user/
│   │   ├── ui/                   # Representación visual base (UserCard, UserAvatar)
│   │   ├── model/                # interface, enums, store global
│   │   ├── api/                  # CRUD service, DTOs
│   │   └── index.ts
│   ├── contract/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   └── document/
│       ├── model/
│       ├── api/
│       └── index.ts
│
└── shared/                       # CAPA: Shared — sin slices, solo segments
    ├── ui/                       # Componentes atómicos del design system
    │   ├── button/
    │   ├── input/
    │   ├── select/
    │   ├── modal/
    │   ├── alert/
    │   ├── badge/
    │   ├── card/
    │   ├── spinner/
    │   └── index.ts
    ├── tokens/                   # Sistema de theming
    │   ├── theme.service.ts
    │   ├── theme.model.ts
    │   └── index.ts
    ├── lib/                      # Pipes, directivas, utils
    │   ├── pipes/
    │   ├── directives/
    │   ├── utils/
    │   └── index.ts
    ├── api/                      # HTTP base, interceptors, error handling
    │   ├── http-base.service.ts
    │   ├── error.interceptor.ts
    │   └── index.ts
    └── config/                   # Constantes, enums globales, environment
        ├── app.constants.ts
        └── index.ts
```

### Regla de dependencia FSD (CRÍTICA)

```
app/ → puede importar de TODAS las capas inferiores
pages/ → widgets/, features/, entities/, shared/
widgets/ → features/, entities/, shared/  (NO pages/)
features/ → entities/, shared/  (NO widgets/, NO pages/)
entities/ → shared/  (NO features/, NO widgets/, NO pages/)
shared/ → NADA (es la base)
```

**NUNCA** importar lateralmente: un slice no puede importar otro slice de la misma capa.

### Path aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*":      ["src/app/*"],
      "@pages/*":    ["src/pages/*"],
      "@widgets/*":  ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*":   ["src/shared/*"]
    }
  }
}
```

### Public API por slice

Cada slice DEBE tener un `index.ts` que expone SOLO lo público:

```typescript
// features/auth/index.ts
export { LoginFormComponent } from './ui/login-form.component';
export { AuthStore } from './model/auth.store';
export { authGuard } from './model/auth.guard';
// NO exportar servicios internos, DTOs, mappers
```

**Regla**: todo import externo al slice debe usar el path alias + nombre del slice:
```typescript
// ✅ Correcto
import { LoginFormComponent } from '@features/auth';

// ❌ Prohibido — rompe encapsulación
import { AuthService } from '@features/auth/api/auth.service';
```

## Convenciones de componentes

### Container (Smart)

- Vive en `ui/` de su slice como `*-page.component.ts` o `*-container.component.ts`
- Inyecta servicios con `inject()`
- Usa signals para estado: `signal()`, `computed()`, `toSignal()`
- Orquesta componentes hijos vía `@Input()` / `@Output()` o `input()` / `output()`
- SIEMPRE `changeDetection: ChangeDetectionStrategy.OnPush`

### Presentational (Dumb)

- Vive en `ui/` de su slice
- CERO inyecciones de servicios de negocio
- Recibe datos por `input()` (signal inputs)
- Emite eventos por `output()`
- SIEMPRE `changeDetection: ChangeDetectionStrategy.OnPush`
- SIEMPRE `standalone: true`

### Patrón de componente estándar

```typescript
@Component({
  standalone: true,
  selector: 'bk-nombre',                    // prefijo 'bk-' para boki
  imports: [/* solo lo necesario */],
  templateUrl: './nombre.component.html',    // template externo si > 10 líneas
  styleUrl: './nombre.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NombreComponent {
  // Signal inputs (nuevo API Angular 17+)
  label = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);

  // Signal outputs
  clicked = output<void>();

  // Computed
  cssClass = computed(() => `bk-nombre--${this.size()}`);
}
```

## Sistema de theming

### Flujo

1. `APP_INITIALIZER` en `app/providers/theme.provider.ts` carga JSON al inicio
2. `ThemeService` en `shared/tokens/` parsea JSON → genera CSS custom properties → aplica a `:root`
3. Todos los componentes en `shared/ui/` consumen `var(--bk-*)` — CERO colores hardcodeados
4. Dark/light: el JSON define ambas paletas; `ThemeService` aplica la activa

### Prefijo de CSS variables: `--bk-`

```css
/* Colors */     --bk-color-primary, --bk-color-secondary, --bk-color-danger, etc.
/* Typography */ --bk-font-family, --bk-font-size-base, --bk-font-size-sm, etc.
/* Borders */    --bk-border-radius-md, --bk-border-width-default, etc.
/* Sizing */     --bk-size-input-height, --bk-size-button-height, etc.
/* Backgrounds */--bk-bg-page, --bk-bg-surface, --bk-bg-overlay
```

### Selector prefix de componentes: `bk-`

Todos los componentes usan prefijo `bk-` en su selector: `bk-button`, `bk-input`, `bk-modal`, etc.

### Clases CSS: prefijo `bk-`

```css
.bk-btn { }
.bk-btn--primary { }
.bk-btn--sm { }
.bk-input { }
.bk-input--error { }
```

## Documentos de referencia

Lee estos archivos en orden para contexto completo:

1. `docs/ARCHITECTURE.md` — ADR con justificación de la arquitectura elegida
2. `docs/MIGRATION_GUIDE.md` — Plan de migración paso a paso desde estructura actual
3. `docs/THEMING_SYSTEM.md` — Especificación completa del sistema de theming
4. `docs/CODING_STANDARDS.md` — Convenciones de código, naming, testing
5. `docs/WIDGET_CATALOG.md` — Catálogo de widgets reusables y su API

## Reglas para Claude Code

- **Siempre** crear componentes standalone (NUNCA NgModules)
- **Siempre** usar `ChangeDetectionStrategy.OnPush`
- **Siempre** usar signal inputs (`input()`, `input.required()`) en vez de decorator `@Input()`
- **Siempre** usar signal outputs (`output()`) en vez de `@Output() EventEmitter`
- **Siempre** respetar la regla de dependencia FSD antes de importar
- **Siempre** exportar via `index.ts` (public API) del slice
- **Siempre** usar CSS variables `var(--bk-*)` para colores, tamaños, tipografía
- **Nunca** instalar librerías UI externas (Material, PrimeNG, etc.)
- **Nunca** hardcodear colores, tamaños de fuente, o border-radius
- **Nunca** usar `any` — tipar todo con interfaces en `model/`
- **Nunca** importar archivos internos de otro slice (solo via index.ts)
- **Nunca** que un slice importe de la misma capa o superior
