# THEMING_SYSTEM.md — Especificación del sistema de theming boki-front

## Resumen

El sistema de theming permite que una misma aplicación Angular se vea diferente por cliente/empresa, cambiando únicamente un archivo JSON de configuración (inicialmente estático, posteriormente cargado desde BD/API).

## Arquitectura del theming

```
JSON (por tenant) → ThemeService → CSS Custom Properties en :root → Componentes consumen var(--bk-*)
```

### Flujo de carga

1. `APP_INITIALIZER` ejecuta `ThemeService.loadTheme()` ANTES del primer render
2. `ThemeService` hace GET del JSON (local o API)
3. Parsea el JSON a la interfaz `ThemeFile` (validando tipos)
4. Detecta preferencia de modo (dark/light) desde `localStorage` (preferencia de tema UI) o `prefers-color-scheme`
   > **Nota**: La preferencia dark/light se guarda en `localStorage` (no `sessionStorage`) porque es una preferencia de UI que debe persistir entre sesiones, a diferencia del auth token que usa `sessionStorage`.
5. Aplica las CSS custom properties correspondientes a `:root`
6. Un `effect()` reactivo re-aplica las properties cuando el usuario cambia de modo

### Reactividad

- `isDark()` — signal booleano: `true` = dark mode activo
- `config()` — computed que retorna `ThemeConfig` del modo activo
- `logo()` — computed con info del logo actual
- `toggleMode()` — cambia dark↔light y persiste en localStorage

---

## Contrato de datos: ThemeFile

```typescript
// shared/tokens/theme.model.ts

/** Archivo completo de theming — contiene light + dark */
export interface ThemeFile {
  light: ThemeConfig;
  dark:  ThemeConfig;
}

/** Configuración completa de un modo visual */
export interface ThemeConfig {
  tenant: string;
  logo: ThemeLogo;
  colors: ThemeColors;
  typography: ThemeTypography;
  borders: ThemeBorders;
  sizing: ThemeSizing;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  zIndex: ThemeZIndex;
  alerts: ThemeAlerts;
  backgrounds: ThemeBackgrounds;
}

export interface ThemeLogo {
  url: string;         // Path al SVG/PNG del logo
  altText: string;
  width: number;       // px — ancho máximo del logo
}

export interface ThemeColors {
  primary: string;       // Color principal de la marca
  secondary: string;     // Color secundario
  accent: string;        // Color de acento / highlight
  success: string;       // Operaciones exitosas
  warning: string;       // Advertencias
  danger: string;        // Errores / destructivo
  info: string;          // Informativo
  textPrimary: string;   // Texto principal
  textSecondary: string; // Texto secundario
  textMuted: string;     // Texto deshabilitado / hints
}

export interface ThemeTypography {
  fontFamily: string;        // 'Inter, system-ui, sans-serif'
  fontFamilyMono: string;    // 'JetBrains Mono, monospace'
  fontSizeBase: string;      // '16px'
  fontSizeSm: string;        // '14px'
  fontSizeLg: string;        // '18px'
  fontSizeXl: string;        // '24px'
  fontWeightNormal: number;  // 400
  fontWeightBold: number;    // 600
  lineHeight: string;        // '1.6'
}

export interface ThemeBorders {
  radiusSm: string;       // '4px'
  radiusMd: string;       // '8px'
  radiusLg: string;       // '12px'
  radiusFull: string;     // '9999px' (pill)
  widthDefault: string;   // '1px'
  colorDefault: string;   // Color del borde por defecto
}

export interface ThemeSizing {
  inputHeight: string;    // '40px'
  buttonHeight: string;   // '40px'
  componentSm: string;    // '32px' — componentes tamaño small
  componentMd: string;    // '40px' — componentes tamaño medium
  componentLg: string;    // '48px' — componentes tamaño large
  sidebarWidth: string;   // '260px'
  headerHeight: string;   // '64px'
}

export interface ThemeAlerts {
  borderRadius: string;   // Radio de las alertas/toasts
  showIcon: boolean;      // Mostrar icono en alertas
  position: 'top-right' | 'top-center' | 'bottom-right';
  duration: number;       // ms antes de auto-dismiss
}

export interface ThemeSpacing {
  xs: string;             // '4px'
  sm: string;             // '8px'
  md: string;             // '16px'
  lg: string;             // '24px'
  xl: string;             // '32px'
}

export interface ThemeShadows {
  sm: string;             // '0 1px 2px rgba(0,0,0,0.05)'
  md: string;             // '0 4px 6px rgba(0,0,0,0.1)'
  lg: string;             // '0 10px 15px rgba(0,0,0,0.1)'
}

export interface ThemeZIndex {
  dropdown: number;       // 1000
  modal: number;          // 1050
  tooltip: number;        // 1100
}

export interface ThemeBackgrounds {
  page: string;           // Fondo de la página
  surface: string;        // Fondo de cards, modales
  overlay: string;        // Fondo del overlay (modal backdrop)
}
```

---

## Mapeo JSON → CSS Custom Properties

El `ThemeService` aplana cada sección del JSON a CSS variables con prefijo `--bk-`:

### Colors → `--bk-color-*`

| JSON path | CSS variable |
|-----------|-------------|
| `colors.primary` | `--bk-color-primary` |
| `colors.secondary` | `--bk-color-secondary` |
| `colors.accent` | `--bk-color-accent` |
| `colors.success` | `--bk-color-success` |
| `colors.warning` | `--bk-color-warning` |
| `colors.danger` | `--bk-color-danger` |
| `colors.info` | `--bk-color-info` |
| `colors.textPrimary` | `--bk-color-text-primary` |
| `colors.textSecondary` | `--bk-color-text-secondary` |
| `colors.textMuted` | `--bk-color-text-muted` |

### Typography → `--bk-font-*`

| JSON path | CSS variable |
|-----------|-------------|
| `typography.fontFamily` | `--bk-font-family` |
| `typography.fontFamilyMono` | `--bk-font-family-mono` |
| `typography.fontSizeBase` | `--bk-font-size-base` |
| `typography.fontSizeSm` | `--bk-font-size-sm` |
| `typography.fontSizeLg` | `--bk-font-size-lg` |
| `typography.fontSizeXl` | `--bk-font-size-xl` |
| `typography.fontWeightNormal` | `--bk-font-weight-normal` |
| `typography.fontWeightBold` | `--bk-font-weight-bold` |
| `typography.lineHeight` | `--bk-line-height` |

### Borders → `--bk-border-*`

| JSON path | CSS variable |
|-----------|-------------|
| `borders.radiusSm` | `--bk-border-radius-sm` |
| `borders.radiusMd` | `--bk-border-radius-md` |
| `borders.radiusLg` | `--bk-border-radius-lg` |
| `borders.radiusFull` | `--bk-border-radius-full` |
| `borders.widthDefault` | `--bk-border-width-default` |
| `borders.colorDefault` | `--bk-border-color-default` |

### Sizing → `--bk-size-*`

| JSON path | CSS variable |
|-----------|-------------|
| `sizing.inputHeight` | `--bk-size-input-height` |
| `sizing.buttonHeight` | `--bk-size-button-height` |
| `sizing.componentSm` | `--bk-size-component-sm` |
| `sizing.componentMd` | `--bk-size-component-md` |
| `sizing.componentLg` | `--bk-size-component-lg` |
| `sizing.sidebarWidth` | `--bk-size-sidebar-width` |
| `sizing.headerHeight` | `--bk-size-header-height` |

### Spacing → `--bk-space-*`

| JSON path | CSS variable |
|-----------|-------------|
| `spacing.xs` | `--bk-space-xs` |
| `spacing.sm` | `--bk-space-sm` |
| `spacing.md` | `--bk-space-md` |
| `spacing.lg` | `--bk-space-lg` |
| `spacing.xl` | `--bk-space-xl` |

### Shadows → `--bk-shadow-*`

| JSON path | CSS variable |
|-----------|-------------|
| `shadows.sm` | `--bk-shadow-sm` |
| `shadows.md` | `--bk-shadow-md` |
| `shadows.lg` | `--bk-shadow-lg` |

### Z-Index → `--bk-z-*`

| JSON path | CSS variable |
|-----------|-------------|
| `zIndex.dropdown` | `--bk-z-dropdown` |
| `zIndex.modal` | `--bk-z-modal` |
| `zIndex.tooltip` | `--bk-z-tooltip` |

### Backgrounds → `--bk-bg-*`

| JSON path | CSS variable |
|-----------|-------------|
| `backgrounds.page` | `--bk-bg-page` |
| `backgrounds.surface` | `--bk-bg-surface` |
| `backgrounds.overlay` | `--bk-bg-overlay` |

---

## JSON de ejemplo completo

```json
{
  "light": {
    "tenant": "default",
    "logo": {
      "url": "/assets/logos/default-logo.svg",
      "altText": "Boki Platform",
      "width": 140
    },
    "colors": {
      "primary": "#2563EB",
      "secondary": "#7C3AED",
      "accent": "#F59E0B",
      "success": "#10B981",
      "warning": "#F59E0B",
      "danger": "#EF4444",
      "info": "#3B82F6",
      "textPrimary": "#111827",
      "textSecondary": "#4B5563",
      "textMuted": "#9CA3AF"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "fontFamilyMono": "JetBrains Mono, monospace",
      "fontSizeBase": "16px",
      "fontSizeSm": "14px",
      "fontSizeLg": "18px",
      "fontSizeXl": "24px",
      "fontWeightNormal": 400,
      "fontWeightBold": 600,
      "lineHeight": "1.6"
    },
    "borders": {
      "radiusSm": "4px",
      "radiusMd": "8px",
      "radiusLg": "12px",
      "radiusFull": "9999px",
      "widthDefault": "1px",
      "colorDefault": "#E5E7EB"
    },
    "sizing": {
      "inputHeight": "40px",
      "buttonHeight": "40px",
      "componentSm": "32px",
      "componentMd": "40px",
      "componentLg": "48px",
      "sidebarWidth": "260px",
      "headerHeight": "64px"
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px"
    },
    "shadows": {
      "sm": "0 1px 2px rgba(0, 0, 0, 0.05)",
      "md": "0 4px 6px rgba(0, 0, 0, 0.1)",
      "lg": "0 10px 15px rgba(0, 0, 0, 0.1)"
    },
    "zIndex": {
      "dropdown": 1000,
      "modal": 1050,
      "tooltip": 1100
    },
    "alerts": {
      "borderRadius": "8px",
      "showIcon": true,
      "position": "top-right",
      "duration": 5000
    },
    "backgrounds": {
      "page": "#F9FAFB",
      "surface": "#FFFFFF",
      "overlay": "rgba(0, 0, 0, 0.5)"
    }
  },
  "dark": {
    "tenant": "default",
    "logo": {
      "url": "/assets/logos/default-logo-white.svg",
      "altText": "Boki Platform",
      "width": 140
    },
    "colors": {
      "primary": "#60A5FA",
      "secondary": "#A78BFA",
      "accent": "#FBBF24",
      "success": "#34D399",
      "warning": "#FBBF24",
      "danger": "#F87171",
      "info": "#60A5FA",
      "textPrimary": "#F9FAFB",
      "textSecondary": "#D1D5DB",
      "textMuted": "#6B7280"
    },
    "typography": {
      "fontFamily": "Inter, system-ui, sans-serif",
      "fontFamilyMono": "JetBrains Mono, monospace",
      "fontSizeBase": "16px",
      "fontSizeSm": "14px",
      "fontSizeLg": "18px",
      "fontSizeXl": "24px",
      "fontWeightNormal": 400,
      "fontWeightBold": 600,
      "lineHeight": "1.6"
    },
    "borders": {
      "radiusSm": "4px",
      "radiusMd": "8px",
      "radiusLg": "12px",
      "radiusFull": "9999px",
      "widthDefault": "1px",
      "colorDefault": "#374151"
    },
    "sizing": {
      "inputHeight": "40px",
      "buttonHeight": "40px",
      "componentSm": "32px",
      "componentMd": "40px",
      "componentLg": "48px",
      "sidebarWidth": "260px",
      "headerHeight": "64px"
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px"
    },
    "shadows": {
      "sm": "0 1px 2px rgba(0, 0, 0, 0.1)",
      "md": "0 4px 6px rgba(0, 0, 0, 0.2)",
      "lg": "0 10px 15px rgba(0, 0, 0, 0.25)"
    },
    "zIndex": {
      "dropdown": 1000,
      "modal": 1050,
      "tooltip": 1100
    },
    "alerts": {
      "borderRadius": "8px",
      "showIcon": true,
      "position": "top-right",
      "duration": 5000
    },
    "backgrounds": {
      "page": "#111827",
      "surface": "#1F2937",
      "overlay": "rgba(0, 0, 0, 0.7)"
    }
  }
}
```

---

## Estilos globales base

```css
/* src/styles.css — estilos globales mínimos */

/* Reset base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Root: consumir variables del theming */
:root {
  font-family: var(--bk-font-family, 'Inter, system-ui, sans-serif');
  font-size: var(--bk-font-size-base, 16px);
  line-height: var(--bk-line-height, 1.6);
  color: var(--bk-color-text-primary, #111827);
  background-color: var(--bk-bg-page, #F9FAFB);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Transitions suaves al cambiar tema */
:root {
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Scrollbar personalizada (opcional) */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bk-bg-page);
}
::-webkit-scrollbar-thumb {
  background: var(--bk-color-text-muted);
  border-radius: var(--bk-border-radius-full);
}

/* Focus visible accesible */
:focus-visible {
  outline: 2px solid var(--bk-color-primary);
  outline-offset: 2px;
}

/* Helpers globales */
.bk-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## Cómo agregar un nuevo tenant

1. Duplicar `assets/themes/default.json` → `assets/themes/idartes.json`
2. Cambiar colores, logo, bordes, tipografía según el cliente
3. En producción: el endpoint `/api/tenant/theme` retorna el JSON correspondiente
4. El `ThemeService` aplica automáticamente

### Ejemplo: tenant IDARTES

```json
{
  "light": {
    "tenant": "idartes",
    "logo": {
      "url": "/assets/logos/idartes-logo.svg",
      "altText": "IDARTES - Instituto de las Artes",
      "width": 180
    },
    "colors": {
      "primary": "#E91E63",
      "secondary": "#9C27B0",
      "accent": "#FF9800",
      "...": "..."
    }
  }
}
```

---

## Fallback strategy

Si la carga del JSON de tema falla (red, parse error, etc.), `ThemeService` aplica un tema por defecto hardcodeado inline en `styles.css`:

```css
/* src/styles.css — fallback theme (se sobreescribe cuando el JSON carga) */
:root {
  --bk-color-primary: #2563EB;
  --bk-color-secondary: #7C3AED;
  --bk-color-accent: #F59E0B;
  --bk-color-success: #10B981;
  --bk-color-warning: #F59E0B;
  --bk-color-danger: #EF4444;
  --bk-color-info: #3B82F6;
  --bk-color-text-primary: #111827;
  --bk-color-text-secondary: #4B5563;
  --bk-color-text-muted: #9CA3AF;
  --bk-font-family: Inter, system-ui, sans-serif;
  --bk-font-size-base: 16px;
  --bk-font-size-sm: 14px;
  --bk-font-size-lg: 18px;
  --bk-border-radius-md: 8px;
  --bk-bg-page: #F9FAFB;
  --bk-bg-surface: #FFFFFF;
  --bk-space-xs: 4px;
  --bk-space-sm: 8px;
  --bk-space-md: 16px;
  --bk-space-lg: 24px;
  --bk-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --bk-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --bk-z-dropdown: 1000;
  --bk-z-modal: 1050;
  --bk-z-tooltip: 1100;
}
```

Esto garantiza que la app renderice correctamente incluso si el JSON no carga.

---

## Compatibilidad: `color-mix()`

`color-mix(in srgb, ...)` tiene soporte en 95%+ de browsers modernos (Chrome 111+, Firefox 113+, Safari 16.2+). No se necesita polyfill para los targets del proyecto. Ver [Can I Use](https://caniuse.com/mdn-css_types_color_color-mix).

---

## Reglas para componentes

1. **NUNCA** escribir colores directamente: `color: #333` → `color: var(--bk-color-text-primary)`
2. **NUNCA** escribir tamaños de fuente fijos: `font-size: 14px` → `font-size: var(--bk-font-size-sm)`
3. **NUNCA** escribir border-radius fijos: `border-radius: 8px` → `border-radius: var(--bk-border-radius-md)`
4. **SIEMPRE** usar `color-mix()` para variantes: `background: color-mix(in srgb, var(--bk-color-primary) 10%, transparent)`
5. **SIEMPRE** testear componentes en ambos modos (dark + light)

## Evolución futura

### Fase 1 (actual): JSON estático
- Archivo JSON por tenant en `assets/themes/`
- Se elige al build time o por environment variable

### Fase 2: API endpoint
- Backend retorna JSON por tenant según dominio/subdomain
- `ThemeService.loadTheme('/api/tenant/theme')` 

### Fase 3: BD + Admin panel
- Tabla `tenant_theme` en BD con el JSON completo
- Panel admin para editar colores/logo en vivo
- Preview en tiempo real antes de guardar
