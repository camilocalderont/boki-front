import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiBrandComponent } from '../ui-brand/brand.component';


@Component({
  selector: 'app-ui-header',
  standalone: true,
  imports: [UiBrandComponent, RouterLink],
  templateUrl: './ui-header.component.html',
  styleUrl: './ui-header.component.scss'
})
export class UiHeaderComponent {
}