# Exploración: Company CRUD Modals

## Estado actual

La página `/dashboard/company` tiene 3 tabs (Datos de Empresa, Sedes, Consultorios) pero:

- Los modales de crear/editar muestran **"Formulario de creación — en desarrollo"**
- Solo el tab "Datos de Empresa" muestra una tabla de datos
- Los tabs "Sedes" y "Consultorios" no tienen contenido
- El botón eliminar solo muestra un toast, no ejecuta la eliminación
- Los servicios API (`CompanyApiService`, `CompanyBranchService`) ya existen con métodos CRUD

## Componentes disponibles

| Componente | Ubicación | Estado |
|-----------|-----------|--------|
| `BkModalComponent` | `shared/ui/modal/` | Funcional |
| `BkInputComponent` | `shared/ui/input/` | Funcional (ControlValueAccessor) |
| `BkTextareaComponent` | `shared/ui/textarea/` | Funcional (ControlValueAccessor) |
| `BkSelectComponent` | `shared/ui/select/` | Funcional (ControlValueAccessor) |
| `BkButtonComponent` | `shared/ui/button/` | Funcional |
| `BkDataTableComponent` | `widgets/data-table/` | Funcional (con edit/delete outputs) |
| `CompanyApiService` | `entities/company/api/` | Tiene create/update/getAll/getById |
| `CompanyBranchService` | `app/services/` | Tiene getAll/getById/getByCompany (legacy, falta create/update/delete) |

## Qué falta

1. **Formularios**: No existe ningún form component para Company, Branch ni Room
2. **Tab content**: Sin lógica `@if (activeTab() === 'sedes')` para renderizar contenido por tab
3. **Branch CRUD API**: Falta create, update, delete en el servicio de branches
4. **Room CRUD API**: No existe servicio dedicado para rooms (solo `getAllRooms()` en branch service)
5. **Store para branches/rooms**: Solo existe `CompanyStore`, no hay stores para branches/rooms

## Patrón a seguir

El `LoginFormComponent` establece el patrón:
- `FormBuilder` + `FormGroup` con `Validators`
- Inputs/outputs con signals: `input<boolean>()`, `output<T>()`
- Template: `[formGroup]`, `formControlName`, `bk-input` con `[error]`
- Submit: `markAllAsTouched()` + `emit(form.value)`

## Enfoque recomendado

Crear form components reutilizables por entidad (company-form, branch-form, room-form) que se montan dentro de los modales existentes. Cada tab tiene su propia tabla + botón crear + modal. El page component orquesta todo.

**Esfuerzo estimado:** Medio — los bloques base (modal, inputs, tabla, API) ya existen.
