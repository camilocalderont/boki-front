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
4. Detecta preferencia de modo (dark/light) desde `localStorage` o `prefers-color-scheme`
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
