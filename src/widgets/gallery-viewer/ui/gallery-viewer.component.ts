import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { BkTabsComponent, BkTabItem } from '@shared/ui';

export interface GalleryImageItem {
  VcImageUrl: string;
  VcCategory: string;
  VcCategoryName?: string;
  ProfessionalId?: number;
  ProfessionalName?: string;
  ProfessionalPhoto?: string;
  VcDescription?: string;
}

interface PortfolioGroup {
  professionalId: number;
  name: string;
  initials: string;
  images: GalleryImageItem[];
}

@Component({
  selector: 'bk-gallery-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BkTabsComponent],
  styles: `
    :host { display: block; }

    .gallery-overlay {
      position: fixed;
      inset: 0;
      z-index: calc(var(--bk-z-modal, 1050) + 100);
      background: var(--bk-bg-surface, #fff);
      overflow-y: auto;
      padding: var(--bk-space-xl, 2rem);
    }

    .close-btn {
      position: fixed;
      top: var(--bk-space-lg);
      right: var(--bk-space-lg);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid var(--bk-border-color-default);
      background: var(--bk-bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      color: var(--bk-color-text-primary);
      box-shadow: var(--bk-shadow-sm);
      transition: background 0.15s;
    }

    .close-btn:hover {
      background: var(--bk-bg-page);
    }

    .gallery-content {
      max-width: 900px;
      margin: 0 auto;
    }

    .gallery-title {
      font-size: var(--bk-font-size-xl);
      font-weight: 700;
      color: var(--bk-color-text-primary);
      margin: 0;
    }

    .gallery-subtitle {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      margin: var(--bk-space-xs) 0 var(--bk-space-lg);
    }

    .sub-tabs {
      display: flex;
      gap: var(--bk-space-md);
      margin: var(--bk-space-md) 0;
      border-bottom: 1px solid var(--bk-border-color-default);
    }

    .sub-tab {
      padding: var(--bk-space-sm) 0;
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }

    .sub-tab:hover {
      color: var(--bk-color-text-primary);
    }

    .sub-tab.active {
      color: var(--bk-color-text-primary);
      border-bottom-color: var(--bk-color-text-primary);
      font-weight: 600;
    }

    .image-list {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-lg);
      margin-top: var(--bk-space-lg);
    }

    .gallery-img {
      width: 100%;
      border-radius: var(--bk-border-radius-lg);
      object-fit: cover;
      display: block;
    }

    .image-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--bk-space-md);
      margin-top: var(--bk-space-md);
    }

    .image-grid-2 .gallery-img {
      aspect-ratio: 1 / 1;
    }

    .professional-group {
      margin-bottom: var(--bk-space-xl);
    }

    .professional-header {
      display: flex;
      align-items: center;
      gap: var(--bk-space-sm);
      margin-bottom: var(--bk-space-md);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--bk-color-primary) 20%, transparent);
      color: var(--bk-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--bk-font-size-sm);
      font-weight: 600;
      flex-shrink: 0;
    }

    .prof-name {
      font-size: var(--bk-font-size-base);
      font-weight: 600;
      color: var(--bk-color-text-primary);
    }

    .prof-count {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      margin-left: var(--bk-space-xs);
    }

    .empty-text {
      text-align: center;
      padding: var(--bk-space-xl);
      color: var(--bk-color-text-muted);
      font-size: var(--bk-font-size-sm);
    }
  `,
  template: `
    @if (open()) {
      <div class="gallery-overlay">
        <!-- Botón cerrar -->
        <button class="close-btn" type="button" (click)="closed.emit()" aria-label="Cerrar galería">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="gallery-content">
          <!-- Encabezado -->
          <h2 class="gallery-title">Galería de imágenes</h2>
          <p class="gallery-subtitle">{{ companyName() }}</p>

          <!-- Tabs de categoría principal -->
          <bk-tabs
            [tabs]="categoryTabs()"
            [activeTab]="activeCategory()"
            (tabChange)="onCategoryChange($event)"
          />

          <!-- Sub-tabs para servicios -->
          @if (activeCategory() === 'service' && subCategoryTabs().length > 0) {
            <div class="sub-tabs">
              <button
                class="sub-tab"
                [class.active]="activeSubCategory() === 'all'"
                type="button"
                (click)="activeSubCategory.set('all')"
              >
                Todos
              </button>
              @for (sub of subCategoryTabs(); track sub.id) {
                <button
                  class="sub-tab"
                  [class.active]="activeSubCategory() === sub.id"
                  type="button"
                  (click)="activeSubCategory.set(sub.id)"
                >
                  {{ sub.label }}
                </button>
              }
            </div>
          }

          <!-- Portfolio: agrupado por profesional -->
          @if (activeCategory() === 'portfolio') {
            @if (portfolioGroups().length > 0) {
              @for (group of portfolioGroups(); track group.professionalId) {
                <div class="professional-group">
                  <div class="professional-header">
                    <div class="avatar">{{ group.initials }}</div>
                    <div>
                      <span class="prof-name">{{ group.name }}</span>
                      <span class="prof-count">{{ group.images.length }} {{ group.images.length === 1 ? 'foto' : 'fotos' }}</span>
                    </div>
                  </div>
                  <div class="image-grid-2">
                    @for (img of group.images; track img.VcImageUrl) {
                      <img
                        [src]="img.VcImageUrl"
                        [alt]="img.VcDescription || group.name"
                        class="gallery-img"
                        loading="lazy"
                      />
                    }
                  </div>
                </div>
              }
            } @else {
              <p class="empty-text">No hay imágenes de portfolio disponibles.</p>
            }
          } @else {
            <!-- Venue o servicios: lista vertical -->
            @if (filteredImages().length > 0) {
              <div class="image-list">
                @for (img of filteredImages(); track img.VcImageUrl) {
                  <img
                    [src]="img.VcImageUrl"
                    [alt]="img.VcDescription || companyName()"
                    class="gallery-img"
                    loading="lazy"
                  />
                }
              </div>
            } @else {
              <p class="empty-text">No hay imágenes en esta categoría.</p>
            }
          }
        </div>
      </div>
    }
  `,
})
export class GalleryViewerComponent {
  readonly open = input<boolean>(false);
  readonly images = input<GalleryImageItem[]>([]);
  readonly companyName = input<string>('');
  readonly initialIndex = input<number>(0);

  readonly closed = output<void>();

  readonly activeCategory = signal<string>('venue');
  readonly activeSubCategory = signal<string>('all');

  readonly categoryTabs = computed<BkTabItem[]>(() => {
    const imgs = this.images();
    const venueCount = imgs.filter(i => i.VcCategory === 'venue').length;
    const serviceCount = imgs.filter(i => i.VcCategory === 'service').length;
    const portfolioCount = imgs.filter(i => i.VcCategory === 'portfolio').length;

    const tabs: BkTabItem[] = [];
    if (venueCount > 0) tabs.push({ id: 'venue', label: `Establecimiento ${venueCount}` });
    if (serviceCount > 0) tabs.push({ id: 'service', label: `Servicios ${serviceCount}` });
    if (portfolioCount > 0) tabs.push({ id: 'portfolio', label: `Portfolio del equipo ${portfolioCount}` });
    if (tabs.length === 0) tabs.push({ id: 'venue', label: 'Establecimiento 0' });

    return tabs;
  });

  readonly subCategoryTabs = computed<BkTabItem[]>(() => {
    const imgs = this.images().filter(i => i.VcCategory === 'service');
    const names = [...new Set(imgs.map(i => i.VcCategoryName).filter((n): n is string => Boolean(n)))];
    return names.map(n => ({ id: n, label: n }));
  });

  readonly filteredImages = computed<GalleryImageItem[]>(() => {
    const cat = this.activeCategory();
    let imgs = this.images().filter(i => i.VcCategory === cat);
    if (cat === 'service' && this.activeSubCategory() !== 'all') {
      imgs = imgs.filter(i => i.VcCategoryName === this.activeSubCategory());
    }
    return imgs;
  });

  readonly portfolioGroups = computed<PortfolioGroup[]>(() => {
    const imgs = this.images().filter(i => i.VcCategory === 'portfolio');
    const groups = new Map<number, PortfolioGroup>();

    for (const img of imgs) {
      const pid = img.ProfessionalId ?? 0;
      if (!groups.has(pid)) {
        const name = img.ProfessionalName || 'Sin nombre';
        const parts = name.trim().split(/\s+/);
        const initials = parts.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2);
        groups.set(pid, { professionalId: pid, name, initials, images: [] });
      }
      groups.get(pid)!.images.push(img);
    }

    return Array.from(groups.values());
  });

  onCategoryChange(categoryId: string): void {
    this.activeCategory.set(categoryId);
    this.activeSubCategory.set('all');
  }
}
