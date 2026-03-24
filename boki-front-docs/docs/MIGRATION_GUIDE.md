# MIGRATION_GUIDE.md — Migración a FSD en boki-front

## Pre-requisitos

Antes de iniciar la migración:

1. Angular 19+ con standalone components habilitado
2. TypeScript strict mode activado en `tsconfig.json`
3. ESLint configurado (no TSLint)
4. Git en rama limpia para la migración

---

## Fase 0: Preparación (antes de mover código)

### 0.1 Configurar path aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
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

### 0.2 Crear la estructura de directorios vacía

```bash
mkdir -p src/{pages,widgets,features,entities,shared/{ui,tokens,lib,api,config}}
```

### 0.3 Crear archivos index.ts vacíos

Cada directorio de segment y slice necesita su barrel export:

```bash
# Shared segments
touch src/shared/ui/index.ts
touch src/shared/tokens/index.ts
touch src/shared/lib/index.ts
touch src/shared/api/index.ts
touch src/shared/config/index.ts
```

### 0.4 Instalar ESLint con reglas de boundaries

```bash
npm install -D eslint @typescript-eslint/eslint-plugin eslint-plugin-import
```

Crear reglas básicas (se refinan en Fase 5):

```json
// .eslintrc.json (reglas iniciales)
{
  "rules": {
    "no-restricted-imports": ["warn", {
      "patterns": [
        {
          "group": ["../../../*"],
          "message": "Usa path aliases (@shared/*, @features/*, etc.) en vez de rutas relativas profundas"
        }
      ]
    }]
  }
}
```

---

## Fase 1: Capa Shared (la base)

Migrar primero lo que no tiene dependencias. Todo en `shared/` es la fundación.

### 1.1 shared/tokens/ — Sistema de theming

Crear los archivos del sistema de theming (ver `THEMING_SYSTEM.md` para especificación completa):

```
shared/tokens/
├── theme.model.ts       # Interfaces: ThemeConfig, ThemeFile, ThemeColors, etc.
├── theme.service.ts     # Servicio que parsea JSON → CSS custom properties
└── index.ts             # export { ThemeService, ThemeConfig, ThemeFile, ... }
```

**Acción**: Crear `theme.model.ts` con todas las interfaces de tipado.
**Acción**: Crear `theme.service.ts` con la lógica de CSS variables.
**Acción**: Crear `assets/themes/default.json` con configuración light + dark.
**Acción**: Crear `app/providers/theme.provider.ts` con APP_INITIALIZER.
**Acción**: Registrar `provideTheme()` en `app.config.ts`.

### 1.2 shared/ui/ — Componentes atómicos

Crear o migrar componentes UI base. Cada uno en su directorio:

```
shared/ui/
├── button/
│   ├── button.component.ts
│   ├── button.component.html    # si > 10 líneas de template
│   ├── button.component.css
│   └── button.component.spec.ts
├── input/
│   ├── input.component.ts
│   ├── input.component.html
│   └── input.component.css
├── select/
├── textarea/
├── checkbox/
├── radio/
├── toggle/
├── badge/
├── card/
├── modal/
├── alert/
├── spinner/
├── icon/
├── tooltip/
├── breadcrumb/
├── pagination/
├── form-field/              # Molécula: Label + Input + Error message
└── index.ts
```

**Reglas para cada componente atómico**:

1. `standalone: true`
2. Selector: `bk-{nombre}` (ej: `bk-button`, `bk-input`)
3. Clases CSS: `bk-{nombre}` (ej: `.bk-btn`, `.bk-input`)
4. Todos los colores via `var(--bk-color-*)` 
5. Todos los tamaños via `var(--bk-size-*)` o `var(--bk-font-size-*)`
6. Todos los bordes via `var(--bk-border-*)`
7. `ChangeDetectionStrategy.OnPush`
8. Signal inputs: `input()`, `input.required()`
9. Signal outputs: `output()`
10. CERO dependencias de servicios de negocio

**Orden sugerido de creación** (de menor a mayor complejidad):

```
1. Icon → 2. Spinner → 3. Badge → 4. Button → 5. Input →
6. Textarea → 7. Select → 8. Checkbox → 9. Radio → 10. Toggle →
11. Tooltip → 12. Card → 13. FormField → 14. Alert/Toast →
15. Modal → 16. Breadcrumb → 17. Pagination
```

### 1.3 shared/lib/ — Utilidades

```
shared/lib/
├── pipes/
│   ├── currency-cop.pipe.ts     # Formato moneda colombiana
│   ├── truncate.pipe.ts
│   ├── relative-date.pipe.ts
│   └── index.ts
├── directives/
│   ├── click-outside.directive.ts
│   ├── autofocus.directive.ts
│   ├── debounce-click.directive.ts
│   └── index.ts
├── utils/
│   ├── date.utils.ts
│   ├── string.utils.ts
│   ├── object.utils.ts
│   └── index.ts
└── index.ts
```

### 1.4 shared/api/ — Infraestructura HTTP

```
shared/api/
├── http-base.service.ts      # Wrapper de HttpClient con error handling base
├── error.interceptor.ts      # Interceptor global de errores HTTP
├── auth.interceptor.ts       # Adjunta token a requests
├── api.model.ts              # Interfaces: ApiResponse<T>, PaginatedResponse<T>, ApiError
└── index.ts
```

### 1.5 shared/config/

```
shared/config/
├── app.constants.ts          # API_BASE_URL, APP_VERSION, etc.
├── storage.keys.ts           # Claves de localStorage/sessionStorage
├── route.constants.ts        # Rutas como constantes tipadas
└── index.ts
```

### 1.6 Eliminar BaseComponent

La clase abstracta `BaseComponent` actual inyecta el tema en todos los componentes. En la nueva arquitectura:
- Mover lógica de tema a `inject(ThemeService)` donde se necesite
- Los componentes de `shared/ui/` consumen CSS variables directamente, no necesitan inyectar ThemeService
- Eliminar `BaseComponent` y el patrón de herencia

### 1.7 Eliminar Angular Material gradualmente

A medida que se crean los componentes `bk-*` equivalentes:
- Reemplazar `MatSnackBar` → `AlertService` + `bk-alert-center`
- Reemplazar `MatDialog` → `DialogService` + `bk-confirm-dialog` / `bk-modal`
- Reemplazar cualquier otro componente Material con su equivalente `bk-*`
- Al final de la migración: `npm uninstall @angular/material @angular/cdk`

### Nota: Coexistencia con Tailwind CSS

Tailwind CSS se mantiene como framework de utilidades para layout (flex, grid, spacing, responsive). Los componentes `bk-*` usan CSS variables (`var(--bk-*)`) para colores y theming, y pueden usar clases Tailwind para layout cuando sea conveniente. No hay conflicto entre ambos enfoques.

**Checkpoint Fase 1**: La app compila. `shared/` no importa nada externo. Los componentes atómicos se ven correctamente con el theming aplicado.

---

## Fase 2: Capa Entities (modelos de dominio)

Identificar las entidades de negocio del proyecto. Para boki-front como base, las entidades mínimas son:

### 2.1 Crear entity slices

```
entities/
├── user/
│   ├── model/
│   │   ├── user.model.ts          # interface User, UserRole, UserStatus
│   │   └── user.store.ts          # Signal store: currentUser, isAuthenticated
│   ├── ui/
│   │   ├── user-avatar.component.ts
│   │   └── user-card.component.ts
│   ├── api/
│   │   ├── user.service.ts        # CRUD HTTP
│   │   ├── user.dto.ts            # DTOs del backend
│   │   └── user.mapper.ts         # DTO → Domain model
│   └── index.ts
├── contract/                       # Ejemplo para proyectos tipo PANDORA
│   ├── model/
│   │   ├── contract.model.ts
│   │   └── contract-status.enum.ts
│   ├── ui/
│   │   └── contract-badge.component.ts
│   ├── api/
│   │   ├── contract.service.ts
│   │   └── contract.dto.ts
│   └── index.ts
└── document/
    ├── model/
    │   └── document.model.ts
    ├── api/
    │   └── document.service.ts
    └── index.ts
```

### 2.2 Patrón de Entity Store

```typescript
// entities/user/model/user.store.ts
import { Injectable, signal, computed } from '@angular/core';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  // Estado privado
  private _currentUser = signal<User | null>(null);
  private _loading = signal(false);

  // Signals públicos (readonly)
  currentUser = this._currentUser.asReadonly();
  loading = this._loading.asReadonly();
  isAuthenticated = computed(() => this._currentUser() !== null);
  displayName = computed(() => this._currentUser()?.fullName ?? 'Invitado');

  // Mutaciones
  setUser(user: User): void { this._currentUser.set(user); }
  clearUser(): void { this._currentUser.set(null); }
  setLoading(v: boolean): void { this._loading.set(v); }
}
```

### 2.3 Public API de entity

```typescript
// entities/user/index.ts
export { User, UserRole, UserStatus } from './model/user.model';
export { UserStore } from './model/user.store';
export { UserAvatarComponent } from './ui/user-avatar.component';
export { UserCardComponent } from './ui/user-card.component';
// NO exportar: UserService, UserDto, UserMapper (son internos)
```

**Checkpoint Fase 2**: Entities definidas con modelos tipados. Stores con signals. Componentes de representación visual base. Cada entity tiene public API.

---

## Fase 3: Capa Features (casos de uso)

Cada feature encapsula una acción completa del usuario.

### 3.1 Identificar features por proyecto

Para boki-front base, las features mínimas:

```
features/
├── auth/                    # Login, logout, register, password reset
│   ├── ui/
│   │   ├── login-form.component.ts
│   │   ├── register-form.component.ts
│   │   └── auth-error.component.ts
│   ├── model/
│   │   ├── auth.store.ts
│   │   └── auth.guard.ts
│   ├── api/
│   │   ├── auth.service.ts
│   │   └── auth.mapper.ts
│   └── index.ts
├── theme-toggle/            # Cambiar dark/light mode
│   ├── ui/
│   │   └── theme-toggle.component.ts
│   └── index.ts
└── user-profile/            # Editar perfil propio
    ├── ui/
    │   └── profile-form.component.ts
    ├── api/
    │   └── profile.service.ts
    └── index.ts
```

Features adicionales por proyecto (agregar según necesidad):

```
features/
├── create-contract/         # Crear contrato (PANDORA)
├── upload-document/         # Subir documento (ORFEO integration)
├── search-global/           # Búsqueda global
├── export-report/           # Exportar datos a Excel/PDF
├── manage-notifications/    # Centro de notificaciones
└── bulk-upload/             # Carga masiva (CDP/CRP)
```

### 3.2 Patrón de feature

```typescript
// features/auth/ui/login-form.component.ts — PRESENTATIONAL
@Component({
  standalone: true,
  selector: 'bk-login-form',
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, FormFieldComponent],
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginFormComponent {
  credentials = output<{ email: string; password: string }>();
  loading = input(false);
  error = input<string | null>(null);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.credentials.emit(this.form.getRawValue());
    }
  }
}
```

```typescript
// features/auth/model/auth.store.ts
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _token = signal<string | null>(sessionStorage.getItem('bk-token'));
  private _error = signal<string | null>(null);
  private _loading = signal(false);

  token = this._token.asReadonly();
  error = this._error.asReadonly();
  loading = this._loading.asReadonly();
  isAuthenticated = computed(() => this._token() !== null);

  setToken(token: string): void {
    this._token.set(token);
    sessionStorage.setItem('bk-token', token);
  }
  setError(err: string | null): void { this._error.set(err); }
  setLoading(v: boolean): void { this._loading.set(v); }
  logout(): void {
    this._token.set(null);
    sessionStorage.removeItem('bk-token');
  }
}
```

**Checkpoint Fase 3**: Features implementadas con Smart/Dumb. Cada feature tiene store con signals, componentes presentacionales, y servicio API. Public APIs expuestas.

---

## Fase 4: Capas Widgets y Pages

### 4.1 Widgets

```
widgets/
├── header/
│   ├── ui/
│   │   └── header.component.ts     # Logo dinámico, nav, theme toggle, user menu
│   └── index.ts
├── sidebar/
│   ├── ui/
│   │   ├── sidebar.component.ts
│   │   └── sidebar-item.component.ts
│   ├── model/
│   │   └── sidebar.model.ts        # MenuItem interface
│   └── index.ts
├── data-table/
│   ├── ui/
│   │   ├── data-table.component.ts
│   │   ├── column-header.component.ts
│   │   └── table-pagination.component.ts
│   ├── model/
│   │   ├── table.model.ts
│   │   └── table.store.ts
│   └── index.ts
├── layout-shell/
│   ├── ui/
│   │   └── layout-shell.component.ts  # Header + Sidebar + Content area
│   └── index.ts
└── confirm-dialog/
    ├── ui/
    │   └── confirm-dialog.component.ts
    └── index.ts
```

### 4.2 Pages

```
pages/
├── login/
│   ├── ui/
│   │   └── login-page.component.ts    # Container: compone LoginForm + AuthStore
│   ├── login.routes.ts                # Lazy route config
│   └── index.ts
├── dashboard/
│   ├── ui/
│   │   └── dashboard-page.component.ts
│   ├── dashboard.routes.ts
│   └── index.ts
├── not-found/
│   ├── ui/
│   │   └── not-found-page.component.ts
│   └── index.ts
└── contracts/                          # Ejemplo dominio específico
    ├── ui/
    │   ├── contracts-page.component.ts
    │   └── contract-detail-page.component.ts
    ├── contracts.routes.ts
    └── index.ts
```

### 4.3 Routing lazy-loaded

```typescript
// app/app.routes.ts
export const routes: Routes = [
  { path: 'login', loadChildren: () => import('@pages/login').then(m => m.loginRoutes) },
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('@pages/dashboard').then(m => m.dashboardRoutes) },
      { path: 'contracts', loadChildren: () => import('@pages/contracts').then(m => m.contractsRoutes) },
    ]
  },
  { path: '**', loadComponent: () => import('@pages/not-found').then(m => m.NotFoundPageComponent) },
];
```

```typescript
// pages/login/index.ts (public API con routes)
export { LoginPageComponent } from './ui/login-page.component';
export { loginRoutes } from './login.routes';
```

```typescript
// pages/login/login.routes.ts
import { Routes } from '@angular/router';
import { LoginPageComponent } from './ui/login-page.component';

export const loginRoutes: Routes = [
  { path: '', component: LoginPageComponent }
];
```

**Checkpoint Fase 4**: App completa compilando. Routing lazy-loaded. Layout shell con header + sidebar. Todas las capas FSD funcionando.

---

## Fase 5: Enforcement (reglas automáticas)

### 5.1 ESLint — Reglas de boundaries

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["@pages/*/*/*"],
          "message": "Importa solo desde la public API del page: @pages/nombre"
        },
        {
          "group": ["@widgets/*/*/*"],
          "message": "Importa solo desde la public API del widget: @widgets/nombre"
        },
        {
          "group": ["@features/*/*/*"],
          "message": "Importa solo desde la public API del feature: @features/nombre"
        },
        {
          "group": ["@entities/*/*/*"],
          "message": "Importa solo desde la public API del entity: @entities/nombre"
        }
      ]
    }]
  },
  "overrides": [
    {
      "files": ["src/shared/**/*.ts"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            { "group": ["@pages/*", "@widgets/*", "@features/*", "@entities/*"],
              "message": "shared/ NO puede importar de capas superiores" }
          ]
        }]
      }
    },
    {
      "files": ["src/entities/**/*.ts"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            { "group": ["@pages/*", "@widgets/*", "@features/*"],
              "message": "entities/ solo puede importar de @shared/*" }
          ]
        }]
      }
    },
    {
      "files": ["src/features/**/*.ts"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            { "group": ["@pages/*", "@widgets/*"],
              "message": "features/ solo puede importar de @entities/* y @shared/*" }
          ]
        }]
      }
    },
    {
      "files": ["src/widgets/**/*.ts"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": [
            { "group": ["@pages/*"],
              "message": "widgets/ NO puede importar de @pages/*" }
          ]
        }]
      }
    }
  ]
}
```

### 5.2 CI Check

Agregar al pipeline de CI:

```bash
# En CI (GitHub Actions, GitLab CI, etc.)
npx eslint src/ --max-warnings 0
```

**Checkpoint Fase 5**: Las reglas de dependencia FSD se enforzan automáticamente. CI falla si alguien viola los boundaries.

---

## Orden de ejecución resumido

```
Fase 0  → Preparar aliases + directorios vacíos + ESLint base
Fase 1  → shared/ completo (tokens → ui → lib → api → config)
Fase 2  → entities/ (user primero, luego dominio específico)
Fase 3  → features/ (auth primero, luego features del proyecto)
Fase 4  → widgets/ + pages/ (layout shell → header → sidebar → pages)
Fase 5  → ESLint boundaries + CI enforcement
```

Cada fase es un commit (o PR) independiente. La app debe compilar al final de cada fase.

---

## Migración de código existente

Si ya hay código en estructura clásica (`core/`, `shared/`, `modules/`):

### Mapeo de estructura clásica → FSD

| Clásica | FSD |
|---------|-----|
| `core/services/auth.service.ts` | `features/auth/api/auth.service.ts` |
| `core/guards/auth.guard.ts` | `features/auth/model/auth.guard.ts` |
| `core/interceptors/error.interceptor.ts` | `shared/api/error.interceptor.ts` |
| `core/interceptors/auth.interceptor.ts` | `shared/api/auth.interceptor.ts` |
| `core/models/user.model.ts` | `entities/user/model/user.model.ts` |
| `shared/components/button/` | `shared/ui/button/` |
| `shared/pipes/` | `shared/lib/pipes/` |
| `shared/directives/` | `shared/lib/directives/` |
| `modules/dashboard/` | `pages/dashboard/` + `features/*` según lógica |
| `modules/contracts/` | `pages/contracts/` + `features/create-contract/` + `entities/contract/` |

### Estrategia de migración

1. **NO hacer big-bang** — migrar slice por slice
2. Empezar por lo que tiene menos dependencias (shared → entities → features)
3. Actualizar imports gradualmente usando los path aliases
4. Mantener tests pasando en cada paso
5. Cuando todo esté migrado, eliminar directorios viejos
