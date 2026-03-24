# PROMPT PARA CLAUDE CODE — Reestructuración UI boki-front

## CONTEXTO

Eres un desarrollador senior Angular + diseñador UX/UI experto trabajando en boki-front, una plataforma multi-empresa en Angular 19+ standalone. Lee primero CLAUDE.md y todos los archivos en docs/ para entender la arquitectura FSD completa.

El proyecto ya tiene una migración inicial de arquitectura pero la UI tiene problemas graves de diseño, espaciado, tipografía y componentes. Tu trabajo es reestructurar TODA la capa visual aplicando fielmente la arquitectura FSD + el sistema de theming + componentes atómicos propios.

## PROBLEMAS ACTUALES A RESOLVER

### 1. Tipografía desproporcionada
- Fuentes demasiado grandes en títulos, labels de tabla, y contenido general
- No hay escala tipográfica coherente (parece que todo es del mismo tamaño)
- Los labels de las stat cards del dashboard ("CONVERSACIONES ACTIVAS") están en mayúsculas forzadas sin jerarquía visual

### 2. Espaciado inconsistente
- No hay padding consistente entre el sidebar y el contenido
- Las tablas no tienen padding interno adecuado en celdas
- El espacio entre secciones es arbitrario
- Los tabs están pegados al contenido sin respiración

### 3. Widget de Tabs roto
- Los tabs (Datos de Empresa / Sedes / Consultorios) y (Categorías / Servicios) no tienen diseño cohesivo
- El tab activo solo tiene borde, se ve plano
- No hay transición ni estado hover

### 4. Tablas genéricas sin diseño
- Las tablas parecen HTML nativo sin estilos
- El campo "Buscar..." está flotando centrado de forma extraña
- La paginación (Prev/1/Next) y el selector "Mostrar 10 filas" son básicos
- Los headers de tabla en mayúsculas se ven toscos
- El botón de acciones (icono de refresh) está suelto sin contexto

### 5. Sidebar básico
- El estado activo es solo un cambio de color de texto sin fondo
- No hay hover states
- El icono de hamburguesa y el logo están desalineados
- No tiene borde o separación visual del contenido

### 6. Header plano
- Solo tiene el logo a la izquierda y el toggle de tema a la derecha
- No hay separación visual del contenido
- El botón "Actualizar" del dashboard flota sin contexto

### 7. Cards del Dashboard
- Las stat cards no tienen fondo diferenciado ni sombra sutil
- Los iconos están sueltos sin fondo circular o badge
- No hay separación visual entre cards

### 8. Botones anticuados
- Los botones principales (Editar Empresa, Crear Sede, etc.) tienen un azul oscuro plano
- No hay variantes de tamaño consistentes
- Faltan hover/active states con feedback visual
- Los botones de acción en tablas son círculos con iconos sin tooltip

### 9. Login
- El formulario de login funciona pero el fondo dark es genérico
- La validación en rojo está sin formato (texto plano)

## INSTRUCCIONES DE EJECUCIÓN

### Fase A: Auditoría y preparación (NO saltarte esto)

1. Lee CLAUDE.md y todos los archivos en docs/
2. Examina la estructura actual del proyecto: `find src/ -type f -name "*.ts" -o -name "*.html" -o -name "*.css" -o -name "*.scss" | head -100`
3. Revisa el estado actual del theming: busca archivos de theme, CSS variables existentes, JSON de configuración
4. Lista todos los componentes existentes y clasifícalos según la arquitectura FSD:
   - ¿Qué ya está en shared/ui/?
   - ¿Qué está en widgets/?
   - ¿Qué necesita crearse o migrarse?
5. Identifica qué framework CSS se está usando (si hay Tailwind, Bootstrap, Material, o CSS custom)

### Fase B: Sistema de theming (la base de TODO)

1. Asegúrate de que existe `shared/tokens/theme.model.ts` con TODAS las interfaces
2. Asegúrate de que existe `shared/tokens/theme.service.ts` funcional
3. Crea/actualiza `assets/themes/default.json` con la paleta light + dark
4. Verifica que `APP_INITIALIZER` carga el theme antes del primer render
5. Verifica que `:root` tiene las CSS variables `--bk-*` aplicadas

**Paleta de referencia para light mode** (moderna, limpia, profesional):
```
primary: #2563EB (azul moderno, no el azul oscuro actual)
secondary: #7C3AED
surface: #FFFFFF
page background: #F8FAFC (gris muy sutil, no blanco puro)
border: #E2E8F0 (gris claro sutil)
text primary: #0F172A (casi negro pero no negro puro)
text secondary: #64748B
text muted: #94A3B8
font-size base: 14px (NO 16px — para apps empresariales 14px es estándar)
font-size sm: 12px
font-size lg: 16px
font-size xl: 20px
font-family: 'Inter', system-ui, -apple-system, sans-serif
border-radius-sm: 6px
border-radius-md: 8px  
border-radius-lg: 12px
```

### Fase C: Componentes atómicos en shared/ui/

Crea o reestructura CADA componente siguiendo el patrón de CODING_STANDARDS.md. Cada uno DEBE:
- Ser `standalone: true`
- Usar `ChangeDetectionStrategy.OnPush`
- Usar signal inputs/outputs
- Consumir SOLO variables `var(--bk-*)`
- Tener selector `bk-*`

**Orden de creación/refactor**:

1. **bk-button** — variantes: primary, secondary, ghost, danger. Tamaños: sm (32px), md (36px), lg (40px). Con hover: `brightness(1.05)` + sutil `box-shadow`. Active: `scale(0.98)`. Focus-visible: ring de 2px.

2. **bk-input** — con states: default, focus (ring azul sutil), error (ring rojo + texto error), disabled. Altura consistente con buttons.

3. **bk-badge** — variantes: success (verde), warning (amarillo), danger (rojo), info (azul), neutral (gris). Píldora pequeña con fondo suave y texto del mismo tono.

4. **bk-card** — fondo `var(--bk-bg-surface)`, border `1px solid var(--bk-border-color-default)`, `border-radius: var(--bk-border-radius-lg)`, padding 20px-24px. Sin sombra agresiva — máximo `box-shadow: 0 1px 2px rgba(0,0,0,0.05)`.

5. **bk-tabs** — CRÍTICO. Tab container horizontal. Tab activo: texto primary + border-bottom 2px primary + fondo sutil `color-mix(in srgb, var(--bk-color-primary) 5%, transparent)`. Tab inactivo: texto secondary. Hover: fondo sutil. Transición suave de 200ms.

6. **bk-form-field** — wrapper: Label (12px, uppercase tracking-wide, text-secondary, font-weight 500) + Input/Select + Error message (12px, danger color). Gap de 6px entre elementos.

7. **bk-select** — dropdown nativo estilizado consistente con bk-input.

8. **bk-spinner** — loader circular simple con color primary.

9. **bk-icon** — wrapper para SVG icons inline (NO icon fonts). Tamaños: sm (16px), md (20px), lg (24px).

10. **bk-tooltip** — texto informativo al hover, fondo dark, border-radius-sm.

11. **bk-modal** — overlay + card centrada. Con header, body, footer slots.

12. **bk-alert** / **bk-toast** — notificaciones con variantes success/error/warning/info.

13. **bk-pagination** — controles: Prev/Next + números de página + selector de page size. Estilo consistente con buttons ghost.

14. **bk-search-input** — input con icono de búsqueda integrado a la izquierda, border-radius-full, ancho flexible.

### Fase D: Widgets

1. **widgets/data-table/** — Reestructurar la tabla genérica:
   - Header de tabla: font-size 12px, uppercase, letter-spacing 0.05em, color text-secondary, font-weight 600, background page-bg sutil, padding 12px 16px
   - Celdas: font-size 14px, padding 12px 16px, border-bottom 1px sutil
   - Hover en fila: background sutil
   - Search input alineado a la derecha del header (no centrado flotando)
   - Paginación debajo, justificada: page size a la izquierda, números a la derecha
   - Botón de acciones por fila: usar bk-button variant="ghost" size="sm" con bk-icon, NO un círculo suelto

2. **widgets/tabs/** — Crear widget de tabs reutilizable:
   - Input: `tabs: TabItem[]` con `{ id, label, icon? }`
   - Output: `tabChange: string` (id del tab activo)
   - Content via ng-content o template projection
   - Animación: indicador que se desliza debajo del tab activo

3. **widgets/sidebar/** — Rediseñar:
   - Ancho: 240px expandido, colapsable
   - Item activo: fondo `color-mix(in srgb, var(--bk-color-primary) 10%, transparent)` + texto primary + border-left 3px primary
   - Item hover: fondo `color-mix(in srgb, var(--bk-color-primary) 5%, transparent)`
   - Separación del contenido: border-right sutil o shadow muy leve
   - Logo con padding correcto arriba, alineado con items

4. **widgets/header/** — Rediseñar:
   - Altura fija: 56px
   - Border-bottom sutil
   - Logo a la izquierda (después del hamburger)
   - Espacio flexible en el medio
   - Acciones a la derecha: theme toggle + user avatar/menu
   - El botón "Actualizar" del dashboard NO va en el header — va en el contenido de la page

5. **widgets/stat-card/** — Nuevo widget para las cards del dashboard:
   - Icono en badge circular (fondo sutil del color correspondiente)
   - Label: 12px uppercase text-secondary
   - Valor: 24px font-weight 600
   - Comparación: "vs último mes" en 12px text-muted
   - Layout: vertical, padding 20px

6. **widgets/layout-shell/** — Shell principal:
   - Sidebar fijo a la izquierda
   - Header fijo arriba
   - Content area con scroll independiente
   - Padding del content: 24px

### Fase E: Pages — Reestructurar cada vista

Reestructura cada page como container que compone widgets:

1. **pages/login/** — Centrado vertical + horizontal. Card con shadow sutil. Logo del tenant arriba del form. Error de validación con bk-form-field (no texto rojo suelto). Botón full-width.

2. **pages/dashboard/** — Grid de stat-cards (4 columnas en desktop, 2 en tablet, 1 en mobile). Sección "Actividad Reciente" en bk-card con lista estilizada. "Acciones Rápidas" en bk-card con items clickeables.

3. **pages/empresa/** — bk-tabs para (Datos / Sedes / Consultorios). Cada tab muestra bk-data-table configurado. Botón "Editar Empresa" / "Crear Sede" arriba a la izquierda, alineado con el contenido.

4. **pages/servicios/** — bk-tabs para (Categorías / Servicios). Misma estructura con data-table.

5. **pages/profesionales/**, **pages/faqs/**, **pages/citas/** — Misma estructura consistente.

### Fase F: Estilos globales

Crea/actualiza `src/styles.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  font-family: var(--bk-font-family);
  font-size: var(--bk-font-size-base);
  line-height: var(--bk-line-height);
  color: var(--bk-color-text-primary);
  background: var(--bk-bg-page);
  -webkit-font-smoothing: antialiased;
}

body { min-height: 100vh; }

/* Eliminar TODA traza de estilos legacy, Bootstrap, Material, o CSS genérico anterior */
```

## LOOP DE AUTO-EVALUACIÓN (CRÍTICO)

Después de cada fase completada, DEBES ejecutar este loop:

### Paso 1: Build check
```bash
ng build --configuration=development 2>&1 | tail -20
```
Si hay errores, corrígelos antes de avanzar.

### Paso 2: Serve y captura visual
```bash
# Iniciar el servidor en background
ng serve --port 4200 &
sleep 10
```

### Paso 3: Evaluación con MCP Chrome DevTools (si disponible)
Usa el MCP de Chrome DevTools para:
- Navegar a http://localhost:4200/auth/login
- Tomar screenshot
- Medir tiempos de carga (Performance.getMetrics)
- Navegar a http://localhost:4200/dashboard (si hay auth, primero hacer login)
- Tomar screenshot
- Navegar a cada page y tomar screenshots

Si el MCP de Chrome DevTools no está disponible, usa Playwright directamente.

### Paso 4: Evaluación con Playwright
```bash
# Instalar si no está
npx playwright install chromium

# Crear script de evaluación
```

Crea el archivo `e2e/visual-audit.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:4200';
const pages = [
  { name: 'login', path: '/auth/login', needsAuth: false },
  { name: 'dashboard', path: '/dashboard', needsAuth: true },
  { name: 'empresa-datos', path: '/empresa', needsAuth: true },
  { name: 'servicios-categorias', path: '/servicios', needsAuth: true },
];

async function login(page) {
  await page.goto(`${BASE}/auth/login`);
  await page.fill('input[type="email"]', 'admin@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

for (const route of pages) {
  test(`Visual audit: ${route.name}`, async ({ page }) => {
    const startTime = Date.now();
    
    if (route.needsAuth) {
      await login(page);
    }
    
    await page.goto(`${BASE}${route.path}`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`[TIMING] ${route.name}: ${loadTime}ms`);
    
    // Screenshot
    await page.screenshot({ 
      path: `e2e/screenshots/${route.name}.png`,
      fullPage: true 
    });
    
    // Basic design checks
    // 1. No hay texto con font-size > 24px (excepto h1)
    const oversizedText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const issues = [];
      elements.forEach(el => {
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        if (size > 24 && el.tagName !== 'H1' && !el.closest('h1')) {
          issues.push(`${el.tagName}.${el.className}: ${size}px`);
        }
      });
      return issues;
    });
    if (oversizedText.length > 0) {
      console.log(`[ISSUE] Oversized text in ${route.name}:`, oversizedText);
    }
    
    // 2. CSS variables están aplicadas
    const hasTheme = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        primary: root.getPropertyValue('--bk-color-primary').trim(),
        fontFamily: root.getPropertyValue('--bk-font-family').trim(),
        bgPage: root.getPropertyValue('--bk-bg-page').trim(),
      };
    });
    console.log(`[THEME] ${route.name}:`, hasTheme);
    expect(hasTheme.primary).not.toBe('');
    
    // 3. No hay elementos desbordando horizontalmente
    const overflow = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const issues = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > vw + 5) {
          issues.push(`${el.tagName}.${el.className}: overflows by ${Math.round(rect.right - vw)}px`);
        }
      });
      return issues.slice(0, 10);
    });
    if (overflow.length > 0) {
      console.log(`[OVERFLOW] ${route.name}:`, overflow);
    }
    
    // 4. Todos los botones tienen hover state
    const buttons = await page.locator('button, .bk-btn').count();
    console.log(`[BUTTONS] ${route.name}: ${buttons} buttons found`);
    
    // 5. Tablas tienen headers estilizados
    const tableHeaders = await page.locator('th, .bk-table th').count();
    if (tableHeaders > 0) {
      const headerStyle = await page.evaluate(() => {
        const th = document.querySelector('th');
        if (!th) return null;
        const style = getComputedStyle(th);
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          textTransform: style.textTransform,
          padding: style.padding,
        };
      });
      console.log(`[TABLE] ${route.name} header style:`, headerStyle);
    }
  });
}

test('Performance metrics', async ({ page }) => {
  await page.goto(`${BASE}/auth/login`);
  
  // Measure LCP, FCP, CLS
  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      const results = {};
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          results[entry.entryType] = entry.startTime;
        }
      }).observe({ entryTypes: ['largest-contentful-paint', 'first-contentful-paint'] });
      
      setTimeout(() => resolve(results), 3000);
    });
  });
  console.log('[PERFORMANCE] Login page metrics:', metrics);
});
```

Ejecutar:
```bash
mkdir -p e2e/screenshots
npx playwright test e2e/visual-audit.spec.ts --reporter=list 2>&1 | tee e2e/audit-log.txt
```

### Paso 5: Auto-evaluación del diseño

Después de tomar los screenshots, analiza cada uno con estos criterios:

**Checklist de calidad visual (pasa/falla por cada page)**:

- [ ] ¿El font-size base es ~14px (no 16px ni mayor)?
- [ ] ¿Los headers de tabla son 12px uppercase con letter-spacing?
- [ ] ¿Hay jerarquía tipográfica clara? (h1 > h2 > body > caption)
- [ ] ¿El espaciado entre secciones es consistente? (24px entre bloques)
- [ ] ¿El sidebar tiene item activo con fondo + borde?
- [ ] ¿Las tablas tienen hover en filas?
- [ ] ¿Los tabs tienen indicador visual claro del activo?
- [ ] ¿Los botones tienen variantes coherentes? (primary, ghost, etc.)
- [ ] ¿El search input está posicionado correctamente? (no centrado flotando)
- [ ] ¿Las cards tienen borde sutil y fondo surface?
- [ ] ¿Hay overflow horizontal? Si sí → FALLA
- [ ] ¿El tema CSS variables está activo? (`--bk-color-primary` no vacío)
- [ ] ¿El login se ve moderno? (card centrada, validación formateada)
- [ ] ¿El dark mode funciona correctamente?

**Si CUALQUIER check falla**, identifica el componente responsable, corrígelo, y vuelve a ejecutar el loop desde el Paso 1.

### Paso 6: Log de tiempos

Registra en `e2e/timing-log.md`:
```markdown
# Timing Log — boki-front visual audit

## Iteración 1 — [fecha/hora]
### Chrome DevTools (si aplica)
- Login page load: Xms
- Dashboard load: Xms
- FCP: Xms
- LCP: Xms

### Playwright
- Login navigation: Xms
- Dashboard navigation: Xms
- Empresa page: Xms
- Servicios page: Xms

### Issues encontrados
- [lista de issues]

### Correcciones aplicadas
- [lista de correcciones]

---
## Iteración 2 — [fecha/hora]
...
```

## CRITERIOS DE TERMINACIÓN

El loop termina cuando:

1. **Build exitoso** sin warnings
2. **Todos los checks visuales pasan** en el Paso 5
3. **Todas las pages tienen screenshot** sin overflow ni problemas tipográficos
4. **El theme CSS variables está activo** y aplicado en todos los componentes
5. **Los tests de Playwright pasan** sin issues de oversized text ni overflow
6. **El dark mode funciona** (toggle y ambas paletas se aplican)
7. **Los tiempos de carga son razonables** (< 3s para cada page)

Si después de 5 iteraciones del loop aún hay issues, crea un archivo `e2e/remaining-issues.md` con los problemas pendientes y las screenshots de referencia, y detente.

## NOTAS IMPORTANTES

- NO instales librerías UI externas (NO Material, NO PrimeNG, NO Bootstrap, NO Tailwind)
- TODO debe ser CSS custom con variables del tema
- Cada componente atómico en shared/ui/ debe ser standalone y reutilizable
- Respeta la regla de dependencia FSD en CADA import
- Los componentes existentes que funcionan bien no deben eliminarse — solo reestructurase
- Si un componente ya existe pero no sigue la arquitectura, migralo en lugar de crear uno nuevo
- Prioriza: theming funcional → componentes atómicos → widgets → pages
- Si encuentras seeders o datos de prueba que mezclan empresas (Carlos Enciso + sala de uñas), eso es un problema de backend — NO lo resuelvas ahora, solo documéntalo en remaining-issues.md
- El filtro por empresa en las vistas (servicios, profesionales, etc.) es Fase 2 — documéntalo pero NO lo implementes ahora

## RESUMEN DEL FLUJO

```
1. Lee docs/ completos
2. Audita estado actual del código
3. Implementa/verifica theming (Fase B)
4. Crea componentes atómicos (Fase C)
5. Reestructura widgets (Fase D)
6. Reestructura pages (Fase E)
7. Aplica estilos globales (Fase F)
8. Ejecuta loop de auto-evaluación
9. Corrige issues encontrados
10. Re-ejecuta loop
11. Repite hasta que todos los checks pasen
12. Genera timing-log.md con resultados finales
```

Empieza ahora. No preguntes — ejecuta.
