import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BkSkeletonComponent } from '@shared/ui';

@Component({
  selector: 'bk-image-gallery-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkSkeletonComponent],
  styles: `
    :host { display: block; }

    .gallery-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: var(--bk-space-sm, 8px);
      height: 420px;
      border-radius: var(--bk-border-radius-lg, 12px);
      overflow: hidden;
    }

    .gallery-main {
      grid-row: 1 / 3;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .gallery-secondary {
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: filter 0.2s ease, opacity 0.3s ease;
      display: block;
    }

    .gallery-img:hover {
      filter: brightness(0.9);
    }

    /* Skeleton ocupa el espacio completo de su celda */
    .gallery-main bk-skeleton,
    .gallery-secondary bk-skeleton {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Forzar que el skeleton interno ocupe 100% */
    .gallery-main ::ng-deep .skeleton,
    .gallery-secondary ::ng-deep .skeleton {
      width: 100% !important;
      height: 100% !important;
      border-radius: 0;
    }

    .view-all-btn {
      position: absolute;
      bottom: var(--bk-space-md, 16px);
      right: var(--bk-space-md, 16px);
      background: var(--bk-bg-surface, #fff);
      color: var(--bk-color-text-primary);
      border: 1px solid var(--bk-border-color-default);
      padding: var(--bk-space-xs, 4px) var(--bk-space-md, 16px);
      border-radius: var(--bk-border-radius-full, 9999px);
      font-size: var(--bk-font-size-sm);
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--bk-shadow-md);
      white-space: nowrap;
      transition: background 0.15s;
    }

    .view-all-btn:hover {
      background: var(--bk-bg-page, #f8fafc);
    }
  `,
  template: `
    <div class="gallery-grid">
      <!-- Imagen principal -->
      <div class="gallery-main" (click)="imageClick.emit(0)">
        @if (loading()) {
          <bk-skeleton variant="square" width="100%" height="100%" />
        } @else if (images()[0]) {
          <img class="gallery-img" [src]="images()[0]" [alt]="companyName() + ' - imagen principal'" loading="lazy" />
        } @else {
          <bk-skeleton variant="square" width="100%" height="100%" />
        }
      </div>

      <!-- Secundaria superior derecha -->
      <div class="gallery-secondary" (click)="imageClick.emit(1)">
        @if (loading()) {
          <bk-skeleton variant="square" width="100%" height="100%" />
        } @else if (images()[1]) {
          <img class="gallery-img" [src]="images()[1]" [alt]="companyName() + ' - imagen 2'" loading="lazy" />
        } @else {
          <bk-skeleton variant="square" width="100%" height="100%" />
        }
      </div>

      <!-- Secundaria inferior derecha + "Ver todas las imágenes" -->
      <div class="gallery-secondary" (click)="imageClick.emit(2)">
        @if (loading()) {
          <bk-skeleton variant="square" width="100%" height="100%" />
        } @else if (images()[2]) {
          <img class="gallery-img" [src]="images()[2]" [alt]="companyName() + ' - imagen 3'" loading="lazy" />
        } @else {
          <bk-skeleton variant="square" width="100%" height="100%" />
        }

        @if (!loading()) {
          <button
            class="view-all-btn"
            (click)="$event.stopPropagation(); viewAll.emit()"
            type="button"
          >
            Ver todas las imágenes
          </button>
        }
      </div>
    </div>
  `,
})
export class ImageGalleryHeroComponent {
  readonly images = input<string[]>([]);
  readonly companyName = input<string>('');
  readonly loading = input<boolean>(false);

  readonly viewAll = output<void>();
  readonly imageClick = output<number>();
}
