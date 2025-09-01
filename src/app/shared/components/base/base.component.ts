import { Component, OnInit, inject } from '@angular/core';
import { ThemeConfigService } from '../../../services/theme-config.service';

@Component({
  template: '', // Componente base sin template
})
export abstract class BaseComponent implements OnInit {
  protected themeConfigService = inject(ThemeConfigService);
  theme: any = null;

  ngOnInit(): void {
    this.initializeTheme();
    this.onComponentInit();
  }

  private initializeTheme(): void {
    this.theme = this.themeConfigService.getCurrentTheme();
  }

  // Método abstracto que los componentes hijos deben implementar
  // para su lógica de inicialización específica
  protected abstract onComponentInit(): void;
}
