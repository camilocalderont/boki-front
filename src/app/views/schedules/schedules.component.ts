import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../shared/components/base/base.component';
import { ThemeComponentsModule } from '../../shared/components/theme-components';

@Component({
  selector: 'app-schedules',
  imports: [
    CommonModule,
    ThemeComponentsModule,
  ],
  templateUrl: './schedules.component.html',
})
export class SchedulesComponent extends BaseComponent {
  constructor() {
    super();
  }

  protected onComponentInit(): void {
    // Placeholder - will be implemented with professional schedule management
  }
}
