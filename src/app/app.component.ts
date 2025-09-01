import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeConfigService } from './services/theme-config.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'boki-front';
  themeConfig: any = null;

  constructor(private themeConfigService: ThemeConfigService) {}

  ngOnInit(): void {
    this.loadThemeConfig();
  }

  private loadThemeConfig(): void {
    this.themeConfigService.getThemeConfig().subscribe({
      next: (response) => {
        this.themeConfig = response.data;

      },
      error: (error) => {
        console.error('❌ Error cargando configuración de tema:', error);
      }
    });
  }


}