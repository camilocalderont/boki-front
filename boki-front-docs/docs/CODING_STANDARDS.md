# CODING_STANDARDS.md — Convenciones de código boki-front

## Naming conventions

### Archivos

```
{nombre}.{tipo}.ts

Tipos válidos:
  .component.ts      → Componente Angular
  .service.ts        → Servicio inyectable
  .store.ts          → Store con signals
  .guard.ts          → Guard de ruta
  .interceptor.ts    → HTTP interceptor
  .pipe.ts           → Pipe
  .directive.ts      → Directiva
  .model.ts          → Interfaces y tipos
  .enum.ts           → Enumeraciones
  .dto.ts            → Data Transfer Objects (formas del backend)
  .mapper.ts         → Funciones de transformación DTO ↔ Domain
  .utils.ts          → Funciones puras utilitarias
  .constants.ts      → Constantes
  .spec.ts           → Tests
```

### Selectores de componentes

Prefijo `bk-` para todos:

```typescript
selector: 'bk-button'        // shared/ui
selector: 'bk-data-table'    // widgets
selector: 'bk-login-form'    // features
selector: 'bk-login-page'    // pages (sufijo -page)
```

### Clases CSS

Prefijo `bk-` con variantes usando `--`:

```css
.bk-btn { }
.bk-btn--primary { }
.bk-btn--sm { }
.bk-btn--loading { }
.bk-input { }
.bk-input--error { }
.bk-input--disabled { }
```

### Variables TypeScript

```typescript
// Signals: nombre descriptivo sin prefijo
const users = signal<User[]>([]);
const isLoading = signal(false);
const filteredUsers = computed(() => ...);

// Signals privados en stores: prefijo _
private _users = signal<User[]>([]);
users = this._users.asReadonly();

// Observables: sufijo $
const users$ = this.http.get<User[]>('/api/users');

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = '/api/v1';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Interfaces: PascalCase sin prefijo I
interface User { }          // ✅
interface IUser { }         // ❌

// Enums: PascalCase
enum ContractStatus {
  Draft = 'DRAFT',
  Active = 'ACTIVE',
  Finished = 'FINISHED',
}

// Type aliases: PascalCase
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type SizeOption = 'sm' | 'md' | 'lg';
```

---

## Patrones de componentes

### Componente presentacional (plantilla)

```typescript
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  standalone: true,
  selector: 'bk-nombre',
  imports: [/* solo lo necesario */],
  template: `
    <div [class]="containerClass()">
      <ng-content />
    </div>
  `,
  styles: [`
    :host {
      display: block;  /* o inline-flex según el componente */
    }
    .bk-nombre {
      font-family: var(--bk-font-family);
      /* usar siempre CSS variables del tema */
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NombreComponent {
  // Inputs (signal-based)
  variant = input<'primary' | 'secondary'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input(false);

  // Outputs (signal-based)
  clicked = output<void>();

  // Computed
  containerClass = computed(() =>
    `bk-nombre bk-nombre--${this.variant()} bk-nombre--${this.size()}`
  );
}
```

### Componente container (plantilla)

```typescript
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';

@Component({
  standalone: true,
  selector: 'bk-nombre-page',
  imports: [/* componentes hijos */],
  template: `
    @if (loading()) {
      <bk-spinner />
    } @else {
      <bk-child-component
        [data]="processedData()"
        (action)="onAction($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NombrePageComponent {
  // Inyección de dependencias
  private someStore = inject(SomeStore);
  private someService = inject(SomeService);

  // Estado local
  loading = this.someStore.loading;
  data = this.someStore.data;

  // Transformaciones
  processedData = computed(() =>
    this.data()?.filter(item => item.active)
  );

  // Acciones
  onAction(event: ActionEvent): void {
    this.someStore.doSomething(event);
  }
}
```

### Signal Store (plantilla)

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NombreStore {
  // Estado privado (mutable)
  private _items = signal<Item[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Selectors públicos (readonly)
  items = this._items.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  
  // Computed derivados
  count = computed(() => this._items().length);
  hasError = computed(() => this._error() !== null);
  isEmpty = computed(() => this._items().length === 0);

  // Mutaciones (métodos públicos)
  setItems(items: Item[]): void {
    this._items.set(items);
    this._error.set(null);
  }

  addItem(item: Item): void {
    this._items.update(list => [...list, item]);
  }

  removeItem(id: string): void {
    this._items.update(list => list.filter(i => i.id !== id));
  }

  setLoading(v: boolean): void {
    this._loading.set(v);
  }

  setError(msg: string): void {
    this._error.set(msg);
    this._loading.set(false);
  }
}
```

### Servicio API (plantilla)

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { APP_CONSTANTS } from '@shared/config';

@Injectable({ providedIn: 'root' })
export class NombreService {
  private http = inject(HttpClient);
  private baseUrl = `${APP_CONSTANTS.apiBaseUrl}/nombre`;

  getAll(): Observable<Nombre[]> {
    return this.http.get<NombreDto[]>(this.baseUrl).pipe(
      map(dtos => dtos.map(toNombreDomain))  // DTO → Domain
    );
  }

  getById(id: string): Observable<Nombre> {
    return this.http.get<NombreDto>(`${this.baseUrl}/${id}`).pipe(
      map(toNombreDomain)
    );
  }

  create(data: CreateNombreRequest): Observable<Nombre> {
    return this.http.post<NombreDto>(this.baseUrl, data).pipe(
      map(toNombreDomain)
    );
  }

  update(id: string, data: UpdateNombreRequest): Observable<Nombre> {
    return this.http.put<NombreDto>(`${this.baseUrl}/${id}`, data).pipe(
      map(toNombreDomain)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

### Mapper DTO → Domain (plantilla)

```typescript
// Funciones puras, no clase
export function toNombreDomain(dto: NombreDto): Nombre {
  return {
    id: dto.id,
    name: dto.nombre_completo,       // Adaptar naming del backend
    createdAt: new Date(dto.fecha_creacion),
    status: mapStatus(dto.estado),
  };
}

export function toNombreDto(domain: Nombre): Partial<NombreDto> {
  return {
    nombre_completo: domain.name,
    estado: domain.status,
  };
}

function mapStatus(raw: string): NombreStatus {
  const map: Record<string, NombreStatus> = {
    'ACTIVO': NombreStatus.Active,
    'INACTIVO': NombreStatus.Inactive,
  };
  return map[raw] ?? NombreStatus.Unknown;
}
```

---

## Control flow (Angular 17+ syntax)

Usar SIEMPRE la nueva sintaxis de control flow:

```html
<!-- ✅ CORRECTO: nueva sintaxis -->
@if (loading()) {
  <bk-spinner />
} @else if (error()) {
  <bk-alert variant="danger">{{ error() }}</bk-alert>
} @else {
  <div>Contenido</div>
}

@for (item of items(); track item.id) {
  <bk-card>{{ item.name }}</bk-card>
} @empty {
  <p>No hay resultados</p>
}

@switch (status()) {
  @case ('active') { <bk-badge variant="success">Activo</bk-badge> }
  @case ('draft')  { <bk-badge variant="warning">Borrador</bk-badge> }
  @default         { <bk-badge>Desconocido</bk-badge> }
}

<!-- ❌ PROHIBIDO: sintaxis vieja -->
<div *ngIf="loading">...</div>
<div *ngFor="let item of items">...</div>
<div [ngSwitch]="status">...</div>
```

---

## Imports

### Orden de imports

```typescript
// 1. Angular core
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 2. Angular forms/router
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

// 3. Terceros (rxjs, etc.)
import { Observable, map, catchError } from 'rxjs';

// 4. Capas FSD (de menor a mayor: shared → entities → features → widgets)
import { ButtonComponent, InputComponent } from '@shared/ui';
import { ThemeService } from '@shared/tokens';
import { User, UserStore } from '@entities/user';
import { AuthStore } from '@features/auth';
import { DataTableComponent } from '@widgets/data-table';

// 5. Imports locales (mismo slice)
import { SomeLocalHelper } from './helpers';
```

---

## RxJS vs Signals

- **Signals** (`signal()`, `computed()`, `effect()`): para estado de componentes y stores
- **RxJS**: para `HttpClient`, `Router` events, y streams asíncronos que requieren operadores de transformación
- **NO usar** `BehaviorSubject` / `ReplaySubject` para estado local de componentes — usar signals
- Observable → Signal: usar `toSignal()` para convertir observables del HttpClient a signals en stores

### Tailwind CSS

Tailwind CSS es permitido para layout utilities (flex, grid, spacing, responsive) junto con CSS variables para colores y theming:

```html
<!-- ✅ Tailwind para layout + CSS vars para colores -->
<div class="flex items-center gap-4 p-4" style="color: var(--bk-color-text-primary)">

<!-- ✅ Tailwind para layout, CSS custom para theming en el .css del componente -->
<div class="grid grid-cols-3 gap-6">

<!-- ❌ NO usar clases de color de Tailwind — usar CSS variables -->
<div class="text-blue-500 bg-white">
```

---

## ESLint boundaries

Usar `eslint-plugin-boundaries` para enforcement de la regla de dependencia FSD:

```bash
npm install -D eslint-plugin-boundaries
```

Esto reemplaza el uso manual de `no-restricted-imports` con reglas semánticas que entienden las capas FSD.

---

## Reglas de CSS

### Variables obligatorias

```css
/* ✅ SIEMPRE usar variables del tema */
.bk-card {
  background: var(--bk-bg-surface);
  color: var(--bk-color-text-primary);
  border: var(--bk-border-width-default) solid var(--bk-border-color-default);
  border-radius: var(--bk-border-radius-lg);
  font-family: var(--bk-font-family);
  font-size: var(--bk-font-size-base);
}

/* ❌ NUNCA hardcodear */
.bk-card {
  background: #ffffff;
  color: #333333;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-family: Inter, sans-serif;
  font-size: 16px;
}
```

### Variantes de color con color-mix()

```css
/* Hover: 10% del primary sobre transparente */
.bk-btn:hover {
  background: color-mix(in srgb, var(--bk-color-primary) 10%, transparent);
}

/* Active: 20% */
.bk-btn:active {
  background: color-mix(in srgb, var(--bk-color-primary) 20%, transparent);
}

/* Disabled: opacidad */
.bk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Encapsulación

- Cada componente usa View Encapsulation por defecto (Emulated)
- NO usar `::ng-deep` — si necesitas estilos cross-component, usa CSS variables
- NO usar `!important` — si hay conflictos, revisar la especificidad

---

## Testing

### Componentes presentacionales

```typescript
describe('ButtonComponent', () => {
  it('should render with primary variant by default', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('button');
    expect(el.classList).toContain('bk-btn--primary');
  });

  it('should emit clicked on button click', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    const spy = jest.spyOn(fixture.componentInstance.clicked, 'emit');
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalled();
  });

  it('should be disabled when disabled input is true', () => {
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });
});
```

### Stores

```typescript
describe('UserStore', () => {
  let store: UserStore;

  beforeEach(() => {
    store = new UserStore();
  });

  it('should start with null user', () => {
    expect(store.currentUser()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should update user and derived signals', () => {
    const user: User = { id: '1', fullName: 'Camilo', email: 'c@test.com' };
    store.setUser(user);
    expect(store.currentUser()).toEqual(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.displayName()).toBe('Camilo');
  });
});
```

---

## Git conventions

### Branches (Conventional Branch)

```
feature/boki-{scope}-{descripcion}
fix/boki-{scope}-{descripcion}
refactor/boki-{scope}-{descripcion}

Ejemplos:
feature/boki-shared-theme-service
feature/boki-entities-user-store
fix/boki-widgets-datatable-sort
refactor/boki-features-auth-signals
```

### Commits (Conventional Commits en español)

```
feat(shared): crear ThemeService con CSS custom properties
feat(entities): agregar UserStore con signals
feat(features): implementar login-form presentacional
fix(widgets): corregir sort descendente en data-table
refactor(shared): migrar button a signal inputs
docs: agregar ARCHITECTURE.md con ADR
chore: configurar ESLint boundaries FSD
```

---

## Checklist para nuevo componente

- [ ] ¿Está en la capa correcta? (shared/entities/features/widgets/pages)
- [ ] ¿Tiene `standalone: true`?
- [ ] ¿Tiene `ChangeDetectionStrategy.OnPush`?
- [ ] ¿Usa signal inputs (`input()`) en vez de `@Input()`?
- [ ] ¿Usa signal outputs (`output()`) en vez de `@Output()`?
- [ ] ¿Usa CSS variables `var(--bk-*)` para todos los estilos visuales?
- [ ] ¿Tiene selector con prefijo `bk-`?
- [ ] ¿Está exportado en el `index.ts` de su slice?
- [ ] ¿Respeta la regla de dependencia FSD en sus imports?
- [ ] ¿Los imports usan path aliases (`@shared/*`, `@features/*`)?
- [ ] ¿Tiene test básico?

## Checklist para nuevo slice

- [ ] ¿Se crearon los segments necesarios? (ui/, model/, api/)
- [ ] ¿Se creó `index.ts` con public API?
- [ ] ¿La public API expone solo lo estrictamente necesario?
- [ ] ¿Los imports internos son relativos (`./`) y los externos via alias?
- [ ] ¿Se puede eliminar el slice sin romper nada fuera de él?
