# WIDGET_CATALOG.md — Catálogo de widgets reusables boki-front

## Principios de widgets

Un widget en FSD es un **bloque autónomo de UI compuesto** que:

- Combina componentes de `shared/ui/`, `entities/` y opcionalmente `features/`
- Tiene su propio estado interno (via signal store local)
- Es reutilizable en múltiples pages
- NO importa de `pages/` (nunca hacia arriba)
- Expone una API clara via `input()` / `output()`
- Es un **container** internamente pero se comporta como **presentacional** hacia afuera

---

## 1. DataTable — `widgets/data-table/`

### Propósito
Tabla de datos genérica con sort, paginación, selección y templates custom por columna.

### API pública

```typescript
// Inputs
data: input.required<T[]>();              // Datos a mostrar
columns: input.required<TableColumn[]>(); // Definición de columnas
config: input<TableConfig>({});           // Configuración opcional
loading: input(false);                    // Estado de carga
trackBy: input<keyof T | ((row: T) => string | number)>('id'); // Key o función para trackBy
templates: input<Record<string, TemplateRef<any>>>({}); // Templates custom

// Outputs
selectionChange: output<Set<string | number>>();  // IDs seleccionados
rowClick: output<T>();                             // Click en fila
sortChange: output<TableSort | null>();            // Cambio de sort
pageChange: output<number>();                      // Cambio de página
```

### Estructura interna

```
widgets/data-table/
├── ui/
│   ├── data-table.component.ts         # Container principal
│   ├── column-header.component.ts      # Encabezado con sort
│   ├── table-pagination.component.ts   # Controles de paginación
│   └── table-empty-state.component.ts  # Estado vacío
├── model/
│   ├── table.model.ts                  # TableColumn, TableSort, TableConfig
│   └── table.store.ts                  # Signal store con sort/paging/selection
└── index.ts                            # Public API
```

### Uso

```html
<bk-data-table
  [data]="contracts()"
  [columns]="columns"
  [loading]="loading()"
  [config]="{ selectable: true, stickyHeader: true }"
  [templates]="{ status: statusTpl }"
  (selectionChange)="onSelect($event)"
/>
<ng-template #statusTpl let-value let-row="row">
  <bk-badge [variant]="value === 'active' ? 'success' : 'warning'">{{ value }}</bk-badge>
</ng-template>
```

---

## 2. Header — `widgets/header/`

### Propósito
Barra superior con logo dinámico del tenant, navegación, toggle de tema, y menú de usuario.

### API pública

```typescript
// Inputs
title: input<string>('');
showSidebarToggle: input(true);

// Outputs
sidebarToggle: output<void>();
```

### Estructura interna

```
widgets/header/
├── ui/
│   └── header.component.ts    # Consume ThemeService para logo, isDark
└── index.ts
```

### Dependencias (capas inferiores)

- `@shared/tokens` → ThemeService (logo, toggle dark/light)
- `@shared/ui` → Button, Icon
- `InjectionToken<UserInfo>` → Provisto desde `app/` para desacoplar el header de `@features/auth`

> **Nota**: El header NO importa directamente de `@features/auth`. En su lugar, usa un `InjectionToken<UserInfo>` que se provee en `app.config.ts`, inyectando los datos del usuario desde el nivel de app. Esto respeta la regla FSD: widgets no deben depender de features directamente para datos de identidad del usuario.

---

## 3. Sidebar — `widgets/sidebar/`

### Propósito
Menú lateral colapsable con items de navegación configurables por proyecto.

### API pública

```typescript
// Inputs
items: input.required<SidebarItem[]>();
collapsed: input(false);

// Outputs
collapsedChange: output<boolean>();
navigate: output<string>();      // Emite la ruta al hacer click
```

### Modelo de datos

```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon: string;            // Nombre del icono
  route: string;           // Ruta Angular
  children?: SidebarItem[];
  badge?: string | number; // Notificación en el item
  visible?: boolean;       // Controlar visibilidad por permisos
}
```

### Estructura

```
widgets/sidebar/
├── ui/
│   ├── sidebar.component.ts
│   └── sidebar-item.component.ts
├── model/
│   └── sidebar.model.ts
└── index.ts
```

---

## 4. Layout Shell — `widgets/layout-shell/`

### Propósito
Composición del layout principal: Header + Sidebar + Content area. Las pages autenticadas se renderizan dentro del content area via `<router-outlet>`.

### API pública

```typescript
// Inputs
sidebarItems: input.required<SidebarItem[]>();
showSidebar: input(true);
```

### Template conceptual

```html
<div class="bk-layout">
  <bk-header (sidebarToggle)="toggleSidebar()" />
  @if (showSidebar()) {
    <bk-sidebar
      [items]="sidebarItems()"
      [collapsed]="sidebarCollapsed()"
      (collapsedChange)="sidebarCollapsed.set($event)"
    />
  }
  <main class="bk-layout__content">
    <ng-content />   <!-- o <router-outlet /> -->
  </main>
</div>
```

### Estructura

```
widgets/layout-shell/
├── ui/
│   └── layout-shell.component.ts
└── index.ts
```

---

## 5. Confirm Dialog — `widgets/confirm-dialog/`

### Propósito
Diálogo de confirmación genérico para acciones destructivas o importantes.

### API pública

```typescript
// Inputs
open: input(false);
title: input('¿Estás seguro?');
message: input('');
confirmLabel: input('Confirmar');
cancelLabel: input('Cancelar');
variant: input<'danger' | 'warning' | 'info'>('danger');

// Outputs
confirm: output<void>();
cancel: output<void>();
```

### Estructura

```
widgets/confirm-dialog/
├── ui/
│   └── confirm-dialog.component.ts
└── index.ts
```

---

## 6. Alert Center — `widgets/alert-center/`

### Propósito
Sistema de notificaciones toast. Un servicio global emite alertas, el widget las renderiza.

### AlertService (en shared, NO en el widget)

`AlertService` vive en `shared/lib/alerts/alert.service.ts` porque es un servicio global que cualquier feature/entity puede consumir. El widget alert-center solo renderiza las alertas.

```typescript
// shared/lib/alerts/alert.service.ts
showSuccess(message: string): void;
showError(message: string): void;
showWarning(message: string): void;
showInfo(message: string): void;
dismiss(id: string): void;
dismissAll(): void;
```

```typescript
// shared/lib/alerts/alert.model.ts
// AlertType, AlertItem interfaces
```

### Estructura

```
widgets/alert-center/
├── ui/
│   ├── alert-center.component.ts    # Container: lista de toasts, consume AlertService de @shared/lib
│   └── alert-toast.component.ts     # Individual toast con auto-dismiss
└── index.ts
```

> **Nota**: El servicio (`AlertService`) y modelos (`AlertItem`, `AlertType`) se importan desde `@shared/lib`, no desde el widget.

### Uso

```typescript
// En cualquier feature o page:
private alertService = inject(AlertService);

this.alertService.showSuccess('Contrato creado exitosamente');
this.alertService.showError('Error al guardar. Intenta de nuevo.');
```

```html
<!-- En app.component.ts, una sola instancia global -->
<router-outlet />
<bk-alert-center />
```

---

## 7. Search Bar — `widgets/search-bar/`

### Propósito
Barra de búsqueda global con debounce, historial reciente, y resultados.

### API pública

```typescript
// Inputs
placeholder: input('Buscar...');
debounceMs: input(300);

// Outputs
search: output<string>();
```

---

## Prioridad de implementación

| Prioridad | Widget | Razón |
|-----------|--------|-------|
| 1 | Layout Shell | Necesario para cualquier page autenticada |
| 2 | Header | Parte del layout, muestra logo/theme/user |
| 3 | Sidebar | Navegación principal |
| 4 | Alert Center | Feedback al usuario en todas las operaciones |
| 5 | Data Table | Widget más usado en apps empresariales |
| 6 | Confirm Dialog | Necesario para operaciones destructivas |
| 7 | Search Bar | Nice to have para primera versión |

---

## Cómo crear un nuevo widget

1. Crear directorio en `widgets/{nombre}/`
2. Crear segments: `ui/`, `model/` (si tiene estado)
3. Crear componentes internos (presentacionales + container)
4. Crear `index.ts` exponiendo SOLO el componente principal y modelos necesarios
5. El widget NO debe importar de `pages/`
6. El widget puede importar de `features/`, `entities/`, `shared/`
7. Documentar la API pública en este catálogo
8. Incluir accesibilidad básica (ver sección abajo)

---

## Accesibilidad básica por widget

Cada widget debe cumplir estos requisitos mínimos:

| Widget | Keyboard nav | ARIA | Notas |
|--------|-------------|------|-------|
| DataTable | Tab entre filas, Enter para acción | `role="grid"`, `aria-sort` en headers | Focus visible en fila activa |
| Header | Tab entre controles | `role="banner"`, `aria-label` en botones | Skip-to-content link |
| Sidebar | Arrow keys entre items, Enter para navegar | `role="navigation"`, `aria-current="page"` en item activo | Collapse/expand con Enter/Space |
| Layout Shell | — | `role="main"` en content area | Landmark roles correctos |
| Confirm Dialog | Tab entre botones, Escape para cerrar | `role="alertdialog"`, `aria-modal="true"` | Focus trap activo |
| Alert Center | — | `role="alert"`, `aria-live="polite"` | Auto-dismiss con pausa en hover |
| Search Bar | Escape para limpiar | `role="search"`, `aria-label` | Autocomplete con `aria-activedescendant` |
