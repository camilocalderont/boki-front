import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ThemeFile, ThemeConfig } from './theme.model';

const THEME_PREF_KEY = 'bk-dark-mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeFile = signal<ThemeFile | null>(null);
  private _isDark = signal(this.loadDarkPreference());

  isDark = this._isDark.asReadonly();

  config = computed<ThemeConfig | null>(() => {
    const file = this.themeFile();
    if (!file) return null;
    return this._isDark() ? file.dark : file.light;
  });

  logo = computed(() => this.config()?.logo ?? null);

  constructor(private http: HttpClient) {
    effect(() => {
      const cfg = this.config();
      if (cfg) {
        this.applyCssVariables(cfg);
      }
    });
  }

  async loadTheme(url: string): Promise<void> {
    try {
      const file = await firstValueFrom(this.http.get<ThemeFile>(url));
      this.themeFile.set(file);
    } catch {
      // Fallback: CSS variables already defined in styles.css :root
      console.warn('ThemeService: Failed to load theme JSON, using CSS fallback.');
    }
  }

  toggleMode(): void {
    const newValue = !this._isDark();
    this._isDark.set(newValue);
    localStorage.setItem(THEME_PREF_KEY, String(newValue));
    this.applyDarkClass(newValue);
  }

  private loadDarkPreference(): boolean {
    const stored = localStorage.getItem(THEME_PREF_KEY);
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyDarkClass(dark: boolean): void {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  private applyCssVariables(cfg: ThemeConfig): void {
    const root = document.documentElement.style;

    // Colors
    root.setProperty('--bk-color-primary', cfg.colors.primary);
    root.setProperty('--bk-color-secondary', cfg.colors.secondary);
    root.setProperty('--bk-color-accent', cfg.colors.accent);
    root.setProperty('--bk-color-success', cfg.colors.success);
    root.setProperty('--bk-color-warning', cfg.colors.warning);
    root.setProperty('--bk-color-danger', cfg.colors.danger);
    root.setProperty('--bk-color-info', cfg.colors.info);
    root.setProperty('--bk-color-text-primary', cfg.colors.textPrimary);
    root.setProperty('--bk-color-text-secondary', cfg.colors.textSecondary);
    root.setProperty('--bk-color-text-muted', cfg.colors.textMuted);

    // Typography
    root.setProperty('--bk-font-family', cfg.typography.fontFamily);
    root.setProperty('--bk-font-family-mono', cfg.typography.fontFamilyMono);
    root.setProperty('--bk-font-size-base', cfg.typography.fontSizeBase);
    root.setProperty('--bk-font-size-sm', cfg.typography.fontSizeSm);
    root.setProperty('--bk-font-size-lg', cfg.typography.fontSizeLg);
    root.setProperty('--bk-font-size-xl', cfg.typography.fontSizeXl);
    root.setProperty('--bk-font-weight-normal', String(cfg.typography.fontWeightNormal));
    root.setProperty('--bk-font-weight-bold', String(cfg.typography.fontWeightBold));
    root.setProperty('--bk-line-height', cfg.typography.lineHeight);

    // Borders
    root.setProperty('--bk-border-radius-sm', cfg.borders.radiusSm);
    root.setProperty('--bk-border-radius-md', cfg.borders.radiusMd);
    root.setProperty('--bk-border-radius-lg', cfg.borders.radiusLg);
    root.setProperty('--bk-border-radius-full', cfg.borders.radiusFull);
    root.setProperty('--bk-border-width-default', cfg.borders.widthDefault);
    root.setProperty('--bk-border-color-default', cfg.borders.colorDefault);

    // Sizing
    root.setProperty('--bk-size-input-height', cfg.sizing.inputHeight);
    root.setProperty('--bk-size-button-height', cfg.sizing.buttonHeight);
    root.setProperty('--bk-size-component-sm', cfg.sizing.componentSm);
    root.setProperty('--bk-size-component-md', cfg.sizing.componentMd);
    root.setProperty('--bk-size-component-lg', cfg.sizing.componentLg);
    root.setProperty('--bk-size-sidebar-width', cfg.sizing.sidebarWidth);
    root.setProperty('--bk-size-header-height', cfg.sizing.headerHeight);

    // Spacing
    root.setProperty('--bk-space-xs', cfg.spacing.xs);
    root.setProperty('--bk-space-sm', cfg.spacing.sm);
    root.setProperty('--bk-space-md', cfg.spacing.md);
    root.setProperty('--bk-space-lg', cfg.spacing.lg);
    root.setProperty('--bk-space-xl', cfg.spacing.xl);

    // Shadows
    root.setProperty('--bk-shadow-sm', cfg.shadows.sm);
    root.setProperty('--bk-shadow-md', cfg.shadows.md);
    root.setProperty('--bk-shadow-lg', cfg.shadows.lg);

    // Z-Index
    root.setProperty('--bk-z-dropdown', String(cfg.zIndex.dropdown));
    root.setProperty('--bk-z-modal', String(cfg.zIndex.modal));
    root.setProperty('--bk-z-tooltip', String(cfg.zIndex.tooltip));

    // Backgrounds
    root.setProperty('--bk-bg-page', cfg.backgrounds.page);
    root.setProperty('--bk-bg-surface', cfg.backgrounds.surface);
    root.setProperty('--bk-bg-overlay', cfg.backgrounds.overlay);

    // Apply dark class
    this.applyDarkClass(this._isDark());
  }
}
