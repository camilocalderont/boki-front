import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BkAlertCenterComponent } from '@widgets/alert-center';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BkAlertCenterComponent],
  template: `
    <router-outlet />
    <bk-alert-center />
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'boki-front';
}
