# PROMPT CLAUDE CODE — Corrección de bugs funcionales post-reestructuración

## CONTEXTO

La reestructuración visual de boki-front se completó. El diseño mejoró significativamente pero se introdujeron bugs funcionales críticos. Este prompt se enfoca EXCLUSIVAMENTE en corregir errores — NO cambiar el diseño.

Lee CLAUDE.md para contexto de la arquitectura. Luego ejecuta las correcciones en orden.

---

## BUG 1 (CRÍTICO): NG0955 — Duplicated keys en data-table

### Síntoma
```
NG0955: The provided track expression resulted in duplicated keys for a given collection.
Duplicated keys were: key "" at index "0" and "1", key "" at index "1" and "2"...
```
El error está en `data-table.component.ts:64`. Las keys están vacías ("") porque el `trackBy` está intentando acceder a una propiedad que no existe en los objetos de datos.

### Causa probable
El data-table usa algo como `track row[trackKey()]` o `track row.id` pero los objetos que llegan de la API no tienen la propiedad `id` o la propiedad configurada como trackKey. Cada entidad del backend puede usar un campo diferente como identificador (`_id`, `id`, `companyId`, `uuid`, etc.).

### Solución
En `data-table.component.ts`, cambiar el track expression para que use el índice como fallback cuando la key está vacía:

```typescript
// En el template, donde está el @for:
// ANTES (probablemente):
@for (row of store.pageData(); track row[trackKey()]) {

// DESPUÉS — fallback a $index si la key no existe:
@for (row of store.pageData(); track trackByFn($index, row)) {
```

```typescript
// En el componente TypeScript:
trackByFn(index: number, row: any): string | number {
  const key = this.trackKey();
  const value = row?.[key];
  // Si la key existe y no está vacía, úsala. Si no, usa el índice.
  if (value !== undefined && value !== null && value !== '') {
    return value;
  }
  return index;
}
```

**ADEMÁS**: Verificar qué campo usan las entidades del backend como ID. Revisa las respuestas de la API en cada page y ajusta el `trackKey` input en cada uso del data-table:

```typescript
// Si la API retorna objetos con _id en vez de id:
<bk-data-table [data]="items()" [columns]="columns" trackKey="_id" />

// Si la API retorna objetos con un campo personalizado:
<bk-data-table [data]="items()" [columns]="columns" trackKey="companyId" />
```

Revisa CADA page que use `bk-data-table` y verifica que el `trackKey` corresponda al campo ID real de los datos. Si no estás seguro, inspecciona la respuesta de la API con `console.log` temporal.

---

## BUG 2 (CRÍTICO): Endpoint /api/v1/professionals retorna 404

### Síntoma
```
GET http://localhost:3000/api/v1/professionals 404 (Not Found)
```
Se repite múltiples veces, causando errores en la página de Profesionales.

### Causa probable
El endpoint no existe en el backend NestJS. El nombre del recurso puede ser diferente (`professional`, `staff`, `workers`, etc.) o la ruta base puede variar.

### Solución

1. **Verificar el endpoint correcto del backend**:
```bash
# Buscar las rutas disponibles en el backend NestJS
# Si tienes acceso al código del backend:
grep -r "Controller" --include="*.ts" -l
grep -r "@Get\|@Post\|@Put\|@Delete\|@Patch" --include="*.ts" | grep -i "profes\|staff\|worker"

# O verificar Swagger/OpenAPI si está disponible:
# Abrir http://localhost:3000/api o http://localhost:3000/swagger
```

2. **Si el endpoint NO existe en el backend**: El frontend no debe llamar a un endpoint que no existe. En la página de profesionales, agregar manejo de error graceful:

```typescript
// En el servicio o en la page de profesionales:
loadProfessionals(): void {
  this.loading.set(true);
  this.http.get<any[]>(`${this.apiUrl}/professionals`).pipe(
    catchError(err => {
      if (err.status === 404) {
        console.warn('Endpoint /professionals no disponible en el backend');
        // Mostrar mensaje al usuario en vez de error silencioso
        return of([]);
      }
      return throwError(() => err);
    }),
    finalize(() => this.loading.set(false))
  ).subscribe(data => {
    this.professionals.set(data);
  });
}
```

3. **En la UI**, si no hay datos y el endpoint falló, mostrar un estado informativo:
```html
@if (endpointNotAvailable()) {
  <div class="bk-empty-state">
    <p>El módulo de profesionales no está configurado en el servidor.</p>
    <p class="text-muted">Contacte al administrador para habilitar este endpoint.</p>
  </div>
}
```

4. **Documentar en PHASE2_BACKLOG.md** que el endpoint de profesionales necesita ser creado en el backend NestJS.

---

## BUG 3 (MEDIO): XSS Sanitization Warning

### Síntoma
```
WARNING: sanitizing HTML stripped some content
See https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss
```
Aparece al cargar el dashboard y la página de FAQs.

### Causa probable
Algún componente está usando `[innerHTML]` para renderizar contenido que viene de la API (probablemente las respuestas de FAQs o el contenido del dashboard). Angular sanitiza el HTML por seguridad, eliminando scripts y atributos peligrosos.

### Solución

1. **Buscar todos los usos de innerHTML en el proyecto**:
```bash
grep -r "innerHTML\|bypassSecurity\|DomSanitizer" --include="*.ts" --include="*.html" src/
```

2. **Para las FAQs** — las respuestas probablemente contienen HTML formateado. Hay dos opciones:

**Opción A (recomendada)**: Si el contenido viene de una fuente confiable (tu propio backend), usar `DomSanitizer` de forma controlada:
```typescript
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// En el componente:
private sanitizer = inject(DomSanitizer);

sanitizeHtml(html: string): SafeHtml {
  // SOLO si confías en la fuente (tu propio backend)
  return this.sanitizer.bypassSecurityTrustHtml(html);
}
```

```html
<div [innerHTML]="sanitizeHtml(faq.answer)"></div>
```

**Opción B (más segura)**: Usar un pipe que sanitice selectivamente:
```typescript
// shared/lib/pipes/safe-html.pipe.ts
@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);
  
  transform(value: string): SafeHtml {
    // Primero limpia con un sanitizer básico, luego marca como seguro
    const cleaned = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }
}
```

```html
<div [innerHTML]="faq.answer | safeHtml"></div>
```

**Opción C (más simple)**: Si las FAQs no necesitan HTML formateado, simplemente mostrar como texto plano:
```html
<p>{{ faq.answer }}</p>
<!-- En vez de -->
<div [innerHTML]="faq.answer"></div>
```

3. **Para el dashboard** — verificar qué contenido se está inyectando con innerHTML. Probablemente los stat cards o el activity feed. Si es texto simple, quitar innerHTML y usar interpolación `{{ }}`.

---

## BUG 4 (CRÍTICO): Botones de "Crear" no funcionan en ninguna page

### Síntoma
Los botones "+ Crear Empresa", "+ Crear Categoría", "+ Crear Servicio", etc. no hacen nada al hacer clic.

### Causa probable
Los botones están renderizados pero no tienen event handler conectado, o el handler existe pero no abre un modal/formulario/ruta.

### Solución

1. **Auditar cada page para verificar los handlers de los botones de crear**:

```bash
# Buscar los botones de crear en todas las pages
grep -rn "Crear\|crear\|create\|Create" --include="*.html" --include="*.ts" src/pages/ src/features/
```

2. **Para cada page, verificar que**:

a) El botón tiene un `(click)` handler:
```html
<!-- ❌ Botón sin handler -->
<bk-button variant="primary">+ Crear Empresa</bk-button>

<!-- ✅ Botón con handler -->
<bk-button variant="primary" (click)="openCreateModal()">+ Crear Empresa</bk-button>
```

b) El handler existe en el componente TypeScript:
```typescript
// Verificar que el método existe y hace algo
openCreateModal(): void {
  this.showCreateForm.set(true);
  // o navegar a una ruta de creación:
  // this.router.navigate(['/empresa/crear']);
}
```

c) Si se usa un modal para crear, verificar que el modal existe y se muestra condicionalmente:
```html
@if (showCreateForm()) {
  <bk-modal (close)="showCreateForm.set(false)">
    <!-- formulario de creación -->
  </bk-modal>
}
```

3. **Si los formularios de creación existían ANTES de la reestructuración** pero se perdieron durante la migración, buscar en el historial de git:
```bash
git log --oneline --all --diff-filter=D -- "*.component.ts" | head -20
git diff HEAD~5 -- src/ | grep -A5 -B5 "create\|modal\|form"
```

4. **Si los formularios nunca existieron**, crear stubs mínimos para que los botones hagan algo visible:

```typescript
// Patrón mínimo para cada page con botón crear:
showCreateForm = signal(false);

openCreate(): void {
  this.showCreateForm.set(true);
}

closeCreate(): void {
  this.showCreateForm.set(false);
}
```

```html
<bk-button variant="primary" (click)="openCreate()">+ Crear</bk-button>

@if (showCreateForm()) {
  <bk-modal [title]="'Crear nuevo registro'" (close)="closeCreate()">
    <p>Formulario de creación — en desarrollo</p>
    <bk-button variant="secondary" (click)="closeCreate()">Cerrar</bk-button>
  </bk-modal>
}
```

---

## BUG 5 (MEDIO): Botones Editar/Eliminar en tablas no funcionan

### Síntoma
Al hacer clic en los iconos de editar (lápiz) o eliminar (basura) en las filas de las tablas, no pasa nada o salta el error NG0955.

### Causa probable
Relacionado con BUG 1 — cuando las keys están vacías, Angular no puede identificar correctamente la fila. Además, los handlers de editar/eliminar pueden no estar conectados.

### Solución

1. Primero resolver BUG 1 (trackKey). Una vez que las keys están correctas, los handlers de cada fila deberían funcionar.

2. Verificar en cada page que los botones de acción de las tablas tienen handlers:

```bash
grep -rn "edit\|delete\|remove\|editar\|eliminar" --include="*.html" --include="*.ts" src/pages/
```

3. Para el data-table, verificar cómo se pasan las acciones. Hay dos patrones posibles:

**Patrón A — Acciones via template custom**:
```html
<bk-data-table [data]="items()" [columns]="columns" [templates]="{ actions: actionsTpl }">
</bk-data-table>

<ng-template #actionsTpl let-row="row">
  <div class="action-buttons">
    <bk-button variant="ghost" size="sm" (click)="onEdit(row)">
      <bk-icon name="edit" />
    </bk-button>
    <bk-button variant="ghost" size="sm" (click)="onDelete(row)">
      <bk-icon name="trash" />
    </bk-button>
  </div>
</ng-template>
```

**Patrón B — Acciones via output del data-table**:
```html
<bk-data-table 
  [data]="items()" 
  [columns]="columns"
  (rowAction)="onRowAction($event)"
/>
```

Verificar cuál patrón se está usando y que los handlers están conectados correctamente.

---

## BUG 6 (BAJO): Mejoras visuales menores

### 6.1 — FAQs page: no tiene título ni header de page
La página de FAQs muestra directamente la tabla sin título "FAQs" ni subtítulo. Agregar header consistente con las otras pages:
```html
<div class="page-header">
  <div>
    <h1>Preguntas Frecuentes</h1>
    <p class="page-subtitle">Gestión de FAQs del chatbot</p>
  </div>
  <bk-button variant="primary" (click)="openCreate()">+ Crear FAQ</bk-button>
</div>
```

### 6.2 — Stat cards del dashboard: los cuadrados de color son muy básicos
Los iconos de las stat cards son rectángulos sólidos de color. Reemplazar por iconos SVG inline dentro de un contenedor circular con fondo suave:
```html
<div class="stat-icon" [style.background]="'color-mix(in srgb, ' + iconColor + ' 15%, transparent)'">
  <bk-icon [name]="iconName" [style.color]="iconColor" size="md" />
</div>
```

### 6.3 — Verificar que el toggle dark/light funciona correctamente
En los screenshots se ve que dark mode está activo. Verificar que:
- El toggle en el header cambia entre dark y light
- Ambos modos se ven correctamente
- La preferencia se persiste en localStorage

---

## ORDEN DE EJECUCIÓN

```
1. Corregir BUG 1 (trackKey en data-table) — PRIMERO porque afecta todo
2. Corregir BUG 4 (botones crear)
3. Corregir BUG 5 (botones editar/eliminar)  
4. Corregir BUG 2 (endpoint professionals)
5. Corregir BUG 3 (XSS sanitization)
6. Aplicar BUG 6 (mejoras menores)
7. Verificar que `ng build` compila sin warnings
8. Probar manualmente cada page:
   - Dashboard: cards muestran datos, acciones rápidas clickeables
   - Empresa: tabs funcionan, tabla muestra datos, editar funciona, crear abre algo
   - Servicios > Categorías: tabla con datos, crear/editar/eliminar funcionan
   - Servicios > Servicios: tabla con datos, crear/editar/eliminar funcionan
   - Profesionales: muestra estado empty o datos si endpoint existe
   - FAQs: tabla con datos, paginación funciona, crear/editar/eliminar funcionan
   - Citas: funcional
```

## VERIFICACIÓN FINAL

Después de corregir todos los bugs, abre la consola del navegador y navega por TODAS las pages. El resultado esperado es:

- **CERO errores NG0955** (duplicated keys)
- **CERO errores 404** (o si hay 404 de professionals, hay un manejo graceful)
- **CERO warnings de XSS** (o warnings aceptados con sanitización controlada)
- **Todos los botones "Crear" abren un modal o navegan a una ruta**
- **Todos los botones "Editar/Eliminar" en tablas ejecutan su acción**

Si algún error persiste después de la corrección, documenta en `e2e/remaining-issues.md` con:
- El error exacto de consola
- El archivo/línea donde ocurre
- Qué intentaste para corregirlo
- Por qué no se pudo resolver (ej: requiere cambio en backend)

Empieza ahora. No preguntes — ejecuta.
