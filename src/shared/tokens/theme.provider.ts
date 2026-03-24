import { APP_INITIALIZER, Provider } from '@angular/core';
import { ThemeService } from './theme.service';

const DEFAULT_THEME_URL = 'assets/themes/default.json';

function initializeTheme(themeService: ThemeService): () => Promise<void> {
  return () => themeService.loadTheme(DEFAULT_THEME_URL);
}

export function provideTheme(): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTheme,
      deps: [ThemeService],
      multi: true,
    },
  ];
}
