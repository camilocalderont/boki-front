import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly base = 'boki-ai';

  constructor(private titleService: Title) {}

  /**
   * Establece el título de la página
   * @param pageTitle El título específico de la página
   */
  setTitle(pageTitle?: string): void {
    if (pageTitle) {
      this.titleService.setTitle(`${this.base} | ${pageTitle}`);
    } else {
      this.titleService.setTitle(`${this.base} | Tu asistente inteligente`);
    }
  }
} 