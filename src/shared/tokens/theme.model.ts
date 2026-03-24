/** Archivo completo de theming — contiene light + dark */
export interface ThemeFile {
  light: ThemeConfig;
  dark: ThemeConfig;
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
  url: string;
  altText: string;
  width: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontWeightNormal: number;
  fontWeightBold: number;
  lineHeight: string;
}

export interface ThemeBorders {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusFull: string;
  widthDefault: string;
  colorDefault: string;
}

export interface ThemeSizing {
  inputHeight: string;
  buttonHeight: string;
  componentSm: string;
  componentMd: string;
  componentLg: string;
  sidebarWidth: string;
  headerHeight: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
}

export interface ThemeZIndex {
  dropdown: number;
  modal: number;
  tooltip: number;
}

export interface ThemeAlerts {
  borderRadius: string;
  showIcon: boolean;
  position: 'top-right' | 'top-center' | 'bottom-right';
  duration: number;
}

export interface ThemeBackgrounds {
  page: string;
  surface: string;
  overlay: string;
}
