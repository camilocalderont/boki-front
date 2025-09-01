import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar todos los componentes temáticos
import { SectionThemeComponent } from '../section-theme/section-theme.component';
import { ButtonThemeComponent } from '../button-theme/button-theme.component';
import { H2ThemeComponent } from '../h2-theme/h2-theme.component';

@NgModule({
  imports: [
    CommonModule,
    SectionThemeComponent,
    ButtonThemeComponent,
    H2ThemeComponent
  ],
  exports: [
    SectionThemeComponent,
    ButtonThemeComponent,
    H2ThemeComponent
  ]
})
export class ThemeComponentsModule { }
