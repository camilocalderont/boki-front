# Reporte de Pruebas E2E — Migracion FSD boki-front

**Fecha**: 2026-03-17
**Ambiente**: localhost:4200 (Angular 20 dev server) + localhost:3000 (boki-api)
**Herramienta**: Playwright MCP (browser automation)
**Objetivo**: Validar que todas las funcionalidades existentes siguen operativas despues de la reestructuracion a Feature-Sliced Design.

---

## Resumen ejecutivo

| Categoria | Total | PASS | FAIL | Observaciones |
|-----------|-------|------|------|---------------|
| Autenticacion | 4 | 4 | 0 | Login, error handling, sesion, redirect |
| Navegacion | 7 | 7 | 0 | Todas las rutas cargan correctamente |
| Layout | 3 | 3 | 0 | Sidebar, header, collapse |
| Theming | 2 | 2 | 0 | Dark/light mode toggle |
| Datos | 2 | 2 | 0 | Stats y actividad cargan del API |
| **Total** | **18** | **18** | **0** | |

**Resultado global: PASS (18/18)**

---

## Detalle de pruebas

### 1. Autenticacion

#### TC-01: Login page carga correctamente
- **Estado**: PASS
- **Evidencia**: `screenshots/01-login-page.png`
- **Detalle**: La pagina de login renderiza con el nuevo componente FSD (`LoginPageComponent` + `LoginFormComponent`). Muestra titulo "Iniciar Sesion", campos de email/contrasena, y boton de submit. CSS custom properties (`var(--bk-*)`) se aplican correctamente.

#### TC-02: Validacion de formulario login
- **Estado**: PASS
- **Evidencia**: `screenshots/02-login-filled.png`
- **Detalle**: El boton permanece deshabilitado hasta que ambos campos tienen valor. Al completar email y contrasena, el boton se habilita.

#### TC-03: Error de credenciales invalidas
- **Estado**: PASS
- **Evidencia**: `screenshots/03-login-error.png`
- **Detalle**: Al enviar credenciales incorrectas, se muestra un banner de error rojo con el mensaje "Credenciales invalidas. Verifica tu email y contrasena." El boton de cerrar (x) funciona. La peticion HTTP al backend retorna 401 correctamente.

#### TC-04: Login exitoso y redireccion
- **Estado**: PASS
- **Evidencia**: `screenshots/04-dashboard-main.png`
- **Detalle**: Con credenciales validas (e2e@test.com / E2eTest2025*), el login redirige a `/dashboard`. El token se almacena en sessionStorage. El guard `authGuard` permite acceso. El guard `noAuthGuard` redirige usuarios autenticados desde `/auth/login` al dashboard.

### 2. Dashboard principal

#### TC-05: Dashboard carga con stats y actividad
- **Estado**: PASS
- **Evidencia**: `screenshots/04-dashboard-main.png`, `screenshots/13-dashboard-brand-colors.png`
- **Detalle**: El dashboard muestra 4 tarjetas de estadisticas (Conversaciones activas, Citas programadas, Empresas registradas, Tasa de conversion). Los datos se cargan desde la API: 7 citas, 1 empresa. El feed de actividad reciente muestra 5 citas con detalle de cliente, servicio, profesional y fecha. Las secciones "Acciones Rapidas" y "Estado del Sistema" renderizan correctamente.

### 3. Layout (Header + Sidebar)

#### TC-06: Sidebar navigation completa
- **Estado**: PASS
- **Evidencia**: `screenshots/04-dashboard-main.png`
- **Detalle**: El sidebar muestra 6 items de navegacion cargados desde `navigation.json`: Dashboard, Empresa, Servicios, Profesionales, FAQS, Citas. El item activo se resalta con fondo azul claro y texto azul.

#### TC-07: Sidebar collapse/expand
- **Estado**: PASS
- **Evidencia**: `screenshots/06-sidebar-collapsed.png`
- **Detalle**: El boton "Colapsar menu" reduce el sidebar a iconos. El boton cambia a "Expandir menu". El contenido principal se expande para ocupar el espacio liberado. La transicion es fluida.

#### TC-08: Header con logo y acciones
- **Estado**: PASS
- **Evidencia**: `screenshots/04-dashboard-main.png`
- **Detalle**: El header muestra el logo de BokiBot (cargado desde el JSON de theming), el boton de alternar sidebar, y el boton de dark mode. El boton de logout esta disponible.

### 4. Theming

#### TC-09: Dark mode
- **Estado**: PASS
- **Evidencia**: `screenshots/05-dashboard-dark-mode.png`
- **Detalle**: Al hacer clic en el toggle de modo oscuro, toda la interfaz cambia a tema oscuro: fondo gris oscuro (#111827), superficie de cards (#1F2937), texto blanco, bordes oscuros. El icono cambia de luna a sol. Los datos se mantienen visibles y legibles.

#### TC-10: Light mode (regreso)
- **Estado**: PASS
- **Evidencia**: `screenshots/13-dashboard-brand-colors.png`
- **Detalle**: Al hacer clic de nuevo en el toggle, la interfaz regresa al tema claro con los colores correctos de marca BokiBot (azul navy #1E3A8A como primario).

### 5. Modulos de gestion (vistas legacy)

#### TC-11: Modulo Empresa
- **Estado**: PASS
- **Evidencia**: `screenshots/07-company-module.png`
- **Detalle**: La ruta `/dashboard/company` carga el `CompanyModuleComponent` correctamente dentro del layout shell. Muestra 3 tabs: "Datos de Empresa", "Sedes", "Consultorios". El data grid tiene search, paginacion (Prev/1/Next), y selector de filas por pagina (5/10/20/50). Las columnas: Nombre, Telefono, Correo, Direccion, Representante, Acciones.

#### TC-12: Modulo Catalogo de Servicios
- **Estado**: PASS
- **Evidencia**: `screenshots/08-catalog-module.png`
- **Detalle**: La ruta `/dashboard/catalog` carga correctamente con 2 tabs: "Categorias" y "Servicios". Boton "Crear Categoria" visible. Data grid con columnas: Nombre, Empresa, Fecha de Creacion, Acciones. El servicio CategoryService se inicializa y hace peticiones al API.

#### TC-13: Modulo Profesionales
- **Estado**: PASS
- **Evidencia**: `screenshots/09-professionals-module.png`
- **Detalle**: La ruta `/dashboard/professionals` muestra 3 tabs: "Profesionales", "Horarios", "Servicios Asociados". Boton "Crear Profesional". Data grid con columnas: Nombre, Apellido, Correo, Telefono, Profesion, Especialidad, Acciones.

#### TC-14: Modulo FAQS
- **Estado**: PASS
- **Evidencia**: `screenshots/10-faqs-page.png`
- **Detalle**: La ruta `/dashboard/faqs` carga con boton "Crear FAQS". Data grid con columnas: Pregunta, Respuesta, Empresa, Categoria, Fecha de Creacion, Acciones. Los servicios FaqsService y CategoryService se inicializan.

#### TC-15: Modulo Citas
- **Estado**: PASS
- **Evidencia**: `screenshots/11-appointments-page.png`
- **Detalle**: La ruta `/dashboard/appointments` muestra boton "Nueva Cita". Data grid con columnas: Cliente, Servicio, Profesional, Fecha, Hora, Estado, Acciones.

#### TC-16: Booking Wizard (Nueva Cita)
- **Estado**: PASS
- **Evidencia**: `screenshots/12-booking-wizard.png`
- **Detalle**: La ruta `/dashboard/appointments/new` carga el wizard de 3 pasos: 1.Servicio, 2.Detalles, 3.Confirmar. El indicador de progreso muestra el paso activo. El componente renderiza dentro del layout shell correctamente.

### 6. Routing y Guards

#### TC-17: Auth guard redirige a login
- **Estado**: PASS
- **Detalle**: Al navegar a `/dashboard` sin autenticacion, se redirige a `/auth/login`. Verificado al inicio de la sesion de pruebas.

#### TC-18: noAuth guard redirige a dashboard
- **Estado**: PASS
- **Detalle**: Con sesion activa, navegar a `/auth/login` redirige automaticamente a `/dashboard`. Verificado con la segunda navegacion a `/auth/login` despues del login.

---

## Colores de marca actualizados

Se actualizo `assets/themes/default.json` para coincidir con los colores de marca existentes de BokiBot:

| Token | Light Mode | Dark Mode | Origen |
|-------|-----------|-----------|--------|
| primary | `#1E3A8A` (navy blue) | `#60A5FA` (light blue) | `tailwind.config.js` brand-blue |
| secondary | `#3B82F6` (blue 500) | `#93C5FD` (blue 300) | Complemento del primario |
| accent | `#F59E0B` (amber) | `#FBBF24` (amber light) | Mantenido |
| success | `#10B981` (emerald) | `#34D399` (emerald light) | Mantenido |
| danger | `#EF4444` (red) | `#F87171` (red light) | Mantenido |
| fontFamily | Google Sans, Inter | Google Sans, Inter | CSS import existente |

---

## Hallazgos y observaciones

### Warnings (no bloqueantes)
1. **NG8107** (2 instancias): Operador `?.` innecesario en `booking-wizard.component.html:82`. Campos `VcFirstName` y `VcFirstLastName` no son nullable pero usan optional chaining.
2. **HTML sanitization warnings** (6 instancias): Angular sanitiza SVG icons inline en el template del dashboard `main.component.html`. No afecta funcionalidad.

### Errores de consola
- **0 errores JavaScript** en la sesion de pruebas (despues del login).
- **0 errores de red** (excepto 401 esperado en login con credenciales invalidas).

### Componentes FSD nuevos verificados
- `BkLayoutShellComponent` — Layout principal con header + sidebar + router-outlet
- `BkHeaderComponent` — Header con logo dinamico desde ThemeService
- `BkSidebarComponent` — Sidebar con items de navegacion.json
- `BkAlertCenterComponent` — Sistema de notificaciones (presente en app.component)
- `LoginFormComponent` — Formulario de login con signal inputs/outputs
- `ThemeToggleComponent` — Toggle dark/light mode
- `ThemeService` — Carga JSON, aplica CSS custom properties en :root

### Componentes legacy verificados (coexistencia)
Todos los view components legacy renderizan correctamente dentro del nuevo layout shell:
- `MainComponent` (dashboard)
- `CompanyModuleComponent` (empresa)
- `CatalogModuleComponent` (servicios)
- `ProfessionalModuleComponent` (profesionales)
- `FaqsComponent` (faqs)
- `AppointmentsComponent` (citas)
- `BookingWizardComponent` (nueva cita)

---

## Estructura de archivos de prueba

```
tests/e2e/
├── screenshots/
│   ├── 01-login-page.png
│   ├── 02-login-filled.png
│   ├── 03-login-error.png
│   ├── 04-dashboard-main.png
│   ├── 05-dashboard-dark-mode.png
│   ├── 06-sidebar-collapsed.png
│   ├── 07-company-module.png
│   ├── 08-catalog-module.png
│   ├── 09-professionals-module.png
│   ├── 10-faqs-page.png
│   ├── 11-appointments-page.png
│   ├── 12-booking-wizard.png
│   └── 13-dashboard-brand-colors.png
└── reports/
    └── TEST_REPORT.md
```
