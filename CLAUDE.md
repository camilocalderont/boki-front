# CLAUDE.md — boki-front

## Proyecto

boki-front es una plataforma base (boilerplate empresarial) en **Angular 20 standalone** diseñada para servir como fundación de múltiples proyectos frontend. Cada instancia se personaliza por cliente/empresa cambiando un archivo JSON de theming.

## Stack tecnológico

- **Framework**: Angular 20 (standalone components, NO NgModules)
- **Lenguaje**: TypeScript strict mode
- **Estado**: Angular Signals (signal, computed, effect) — NO RxJS para estado local de componentes. RxJS permitido para HttpClient, Router y streams asíncronos
- **Estilos**: CSS custom properties (`var(--bk-*)`) alimentadas por JSON de theming. Tailwind CSS permitido como utilidad para layout. SIN librerías de componentes UI (Material, PrimeNG, etc.)
- **Build**: Angular CLI + esbuild
- **Linting**: ESLint con reglas de boundaries FSD (`eslint.config.js`)

## Arquitectura: FSD (Feature-Sliced Design)

```
src/
├── app/                    # Bootstrap, routing, providers globales
│   ├── app.config.ts       # Providers: router, http, theme, auth token
│   ├── app.routes.ts       # Rutas principales (auth + dashboard shell)
│   └── app.component.ts    # Root: router-outlet + alert-center
│
├── pages/                  # CAPA: Pages — vistas por ruta, lazy-loaded
│   ├── login/              # Página de login (usa @features/auth)
│   ├── register/           # Página de registro
│   ├── shell/              # Dashboard shell (layout-shell + sidebar items)
│   ├── dashboard/          # Vista principal del dashboard
│   ├── company/            # Gestión de empresas
│   ├── catalog/            # Catálogo de servicios
│   ├── professionals/      # Profesionales
│   ├── appointments/       # Citas
│   ├── plans/              # Planes
│   ├── faqs/               # Preguntas frecuentes
│   └── not-found/          # 404
│
├── widgets/                # CAPA: Widgets — bloques compuestos autónomos
│   ├── layout-shell/       # Header + Sidebar + Content (router-outlet)
│   ├── header/             # Barra superior con logo, acciones
│   ├── sidebar/            # Menú lateral colapsable
│   ├── alert-center/       # Sistema de notificaciones toast
│   └── confirm-dialog/     # Diálogo de confirmación
│
├── features/               # CAPA: Features — acciones de usuario
│   ├── auth/               # Login, registro, guards, AuthStore
│   ├── theme-toggle/       # Toggle dark/light mode
│   ├── manage-company/     # Store de gestión de empresas
│   ├── manage-catalog/     # Store de categorías + servicios
│   ├── manage-professionals/ # Store de profesionales
│   ├── manage-appointments/  # Store de citas
│   ├── manage-plans/       # Store de planes
│   └── manage-faqs/        # Store de FAQs
│
├── entities/               # CAPA: Entities — modelos de dominio
│   ├── user/               # User, UserStore, UserApiService
│   ├── company/            # Company, CompanyApiService
│   ├── plan/               # Plan, PlanApiService
│   ├── professional/       # Professional, ProfessionalApiService
│   ├── appointment/        # Appointment, AppointmentApiService
│   ├── category/           # Category, CategoryApiService
│   ├── service/            # ServiceEntity, ServiceApiService
│   ├── faq/                # Faq, FaqApiService
│   └── client/             # Client, ClientApiService
│
└── shared/                 # CAPA: Shared — sin slices, solo segments
    ├── ui/                 # Componentes atómicos: bk-button, bk-input, bk-modal, etc.
    ├── tokens/             # ThemeService, ThemeFile interfaces, provideTheme()
    ├── lib/                # AlertService, TruncatePipe
    ├── api/                # authInterceptor, errorInterceptor, AUTH_TOKEN_GETTER, ApiModels
    └── config/             # APP_CONSTANTS, STORAGE_KEYS, ROUTES
```

### Regla de dependencia FSD (CRÍTICA)

```
app → pages → widgets → features → entities → shared
```

Capa superior SOLO importa de capas inferiores. Nunca lateral, nunca hacia arriba.

### Path aliases (tsconfig.json)

```
@app/*       → src/app/*
@pages/*     → src/pages/*
@widgets/*   → src/widgets/*
@features/*  → src/features/*
@entities/*  → src/entities/*
@shared/*    → src/shared/*
```

## Código legacy (coexistencia temporal)

Código viejo en `src/app/` que aún funciona y será migrado gradualmente:

- `src/app/views/` — Vistas antiguas usadas como children del dashboard shell
- `src/app/services/` — Servicios HTTP antiguos (company, appointment, category, etc.)
- `src/app/shared/` — Componentes temáticos antiguos (button-theme, form-input-theme, etc.)
- `src/app/dashboard/main/` — Vista principal del dashboard

Estos componentes usan el sistema viejo de theming (Tailwind classes desde JSON) y serán migrados a CSS custom properties (`var(--bk-*)`).

## Sistema de theming

1. `APP_INITIALIZER` carga `assets/themes/default.json` (light + dark)
2. `ThemeService` en `@shared/tokens` parsea JSON → CSS custom properties en `:root`
3. Componentes `bk-*` en `@shared/ui/` consumen `var(--bk-*)` — cero colores hardcodeados
4. Dark/light: `ThemeService.toggleMode()`, preferencia en `localStorage`
5. Fallback: variables CSS inline en `styles.css` si JSON falla

## Convenciones

- **Componentes**: standalone, OnPush, signal inputs (`input()`), signal outputs (`output()`), prefix `bk-`
- **Stores**: Injectable con signals (`signal`, `computed`, `asReadonly`), private `_state` + public `readonly`
- **Imports**: siempre via path aliases y public API (`index.ts`)
- **CSS**: `var(--bk-*)` para colores/sizing, Tailwind para layout utilities
- **Auth**: token en `sessionStorage`, `AUTH_TOKEN_GETTER` InjectionToken para interceptor desacoplado

## Sistema de íconos

Todos los íconos se renderizan con `<bk-icon>` de `@shared/ui`. **Nunca** pegar SVGs inline en templates.

```html
<!-- Color via Tailwind text-* | variant: outline (default) | fill -->
<bk-icon name="edit" class="text-slate-500" />
<bk-icon name="trash" variant="fill" size="lg" class="text-red-500" />
```

| Archivo | Rol |
|---------|-----|
| `src/shared/ui/icon/icon.component.ts` | `BkIconComponent` — selector `bk-icon` |
| `src/shared/ui/icon/icon.registry.ts` | `ICON_REGISTRY` — paths SVG outline + fill (fuente: Heroicons v2 MIT) |

**Agregar un ícono**: copiar inner SVG de heroicons.com → pegar como nueva entrada en `icon.registry.ts`.

**Nunca** instalar `lucide-angular`, `ng-icons` ni ninguna librería de íconos — el registry es la única fuente.

## Documentación detallada

Ver `boki-front-docs/docs/` para especificaciones completas:
1. `ARCHITECTURE.md` — ADR con justificación de la arquitectura
2. `MIGRATION_GUIDE.md` — Plan de migración paso a paso
3. `THEMING_SYSTEM.md` — Especificación del sistema de theming
4. `CODING_STANDARDS.md` — Convenciones de código
5. `WIDGET_CATALOG.md` — Catálogo de widgets y su API
