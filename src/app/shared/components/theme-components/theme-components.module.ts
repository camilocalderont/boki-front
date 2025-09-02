import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importar todos los componentes temáticos
import { SectionThemeComponent } from '../section-theme/section-theme.component';
import { ButtonThemeComponent } from '../button-theme/button-theme.component';
import { H2ThemeComponent } from '../h2-theme/h2-theme.component';
import { H1ThemeComponent } from '../h1-theme/h1-theme.component';
import { SidebarThemeComponent } from '../sidebar-theme/sidebar-theme.component';
import { NavItemThemeComponent } from '../nav-item-theme/nav-item-theme.component';
import { HeaderThemeComponent } from '../header-theme/header-theme.component';
import { ToggleButtonThemeComponent } from '../toggle-button-theme/toggle-button-theme.component';
import { BrandThemeComponent } from '../brand-theme/brand-theme.component';
import { IconButtonThemeComponent } from '../icon-button-theme/icon-button-theme.component';
import { SolerciaCreditThemeComponent } from '../solercia-credit-theme/solercia-credit-theme.component';
import { FormContainerThemeComponent } from '../form-container-theme/form-container-theme.component';
import { FormInputThemeComponent } from '../form-input-theme/form-input-theme.component';
import { FormTextareaThemeComponent } from '../form-textarea-theme/form-textarea-theme.component';
import { FormSelectThemeComponent } from '../form-select-theme/form-select-theme.component';
import { FormToggleThemeComponent } from '../form-toggle-theme/form-toggle-theme.component';



@NgModule({
  imports: [
    CommonModule,
    SectionThemeComponent,
    ButtonThemeComponent,
    H2ThemeComponent,
    H1ThemeComponent,
    SidebarThemeComponent,
    NavItemThemeComponent,
    HeaderThemeComponent,
    ToggleButtonThemeComponent,
    BrandThemeComponent,
    IconButtonThemeComponent,
    SolerciaCreditThemeComponent,
    FormContainerThemeComponent,
    FormInputThemeComponent,
    FormTextareaThemeComponent,
    FormSelectThemeComponent,
    FormToggleThemeComponent,
    ButtonThemeComponent
  ],
  exports: [
    SectionThemeComponent,
    ButtonThemeComponent,
    H2ThemeComponent,
    H1ThemeComponent,
    SidebarThemeComponent,
    NavItemThemeComponent,
    HeaderThemeComponent,
    ToggleButtonThemeComponent,
    BrandThemeComponent,
    IconButtonThemeComponent,
    SolerciaCreditThemeComponent,
    FormContainerThemeComponent,
    FormInputThemeComponent,
    FormTextareaThemeComponent,
    FormSelectThemeComponent,
    FormToggleThemeComponent
  ]
})
export class ThemeComponentsModule { }