import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'bk-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bk-not-found-page">
      <div class="bk-not-found-page__content">
        <span class="bk-not-found-page__code">404</span>
        <h1 class="bk-not-found-page__title">Página no encontrada</h1>
        <p class="bk-not-found-page__message">
          La página que buscas no existe o ha sido movida.
        </p>
        <a routerLink="/dashboard" class="bk-not-found-page__link">
          Volver al Dashboard
        </a>
      </div>
    </div>
  `,
  styles: [`
    .bk-not-found-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bk-bg-page); padding: var(--bk-space-lg); }
    .bk-not-found-page__content { text-align: center; }
    .bk-not-found-page__code { font-size: 6rem; font-weight: var(--bk-font-weight-bold); color: var(--bk-color-primary); line-height: 1; }
    .bk-not-found-page__title { font-size: var(--bk-font-size-xl); font-weight: var(--bk-font-weight-bold); color: var(--bk-color-text-primary); margin-top: var(--bk-space-md); }
    .bk-not-found-page__message { font-size: var(--bk-font-size-md); color: var(--bk-color-text-muted); margin-top: var(--bk-space-sm); margin-bottom: var(--bk-space-lg); }
    .bk-not-found-page__link { display: inline-block; padding: var(--bk-space-sm) var(--bk-space-lg); background: var(--bk-color-primary); color: #fff; border-radius: var(--bk-border-radius-md); text-decoration: none; font-weight: var(--bk-font-weight-medium); transition: opacity 0.2s; }
    .bk-not-found-page__link:hover { opacity: 0.9; }
  `],
})
export class NotFoundPageComponent {}
