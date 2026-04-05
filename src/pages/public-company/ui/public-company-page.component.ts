import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  BkSpinnerComponent,
  BkSearchInputComponent,
  BkIconComponent,
  BkSkeletonComponent,
} from '@shared/ui';
import { ThemeToggleComponent } from '@features/theme-toggle';
import { PublicBookingApiService } from '@entities/public-booking';
import type {
  PublicCompany,
  PublicService,
  PublicCategory,
  PublicProfessional,
  GalleryImage,
} from '@entities/public-booking';
import { ImageGalleryHeroComponent } from '@widgets/image-gallery-hero';
import { ServiceListItemComponent } from '@widgets/service-list-item';
import { CompanyBookingCardComponent } from '@widgets/company-booking-card';
import { GalleryViewerComponent } from '@widgets/gallery-viewer';
import type { GalleryImageItem } from '@widgets/gallery-viewer';

@Component({
  standalone: true,
  selector: 'bk-public-company-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BkSpinnerComponent,
    BkSearchInputComponent,
    BkIconComponent,
    BkSkeletonComponent,
    ThemeToggleComponent,
    ImageGalleryHeroComponent,
    ServiceListItemComponent,
    CompanyBookingCardComponent,
    GalleryViewerComponent,
  ],
  styles: `
    :host {
      display: block;
    }

    /* ── Breadcrumbs ── */
    .breadcrumbs {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    .breadcrumbs a {
      color: var(--bk-color-text-muted);
      text-decoration: none;
    }

    .breadcrumbs a:hover {
      color: var(--bk-color-primary);
      text-decoration: underline;
    }

    .breadcrumbs .sep {
      opacity: 0.5;
    }

    /* ── Company header ── */
    .company-header {
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    .company-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--bk-color-text-primary);
      margin: 0 0 var(--bk-space-sm, 0.5rem);
      line-height: 1.2;
    }

    .company-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--bk-space-md, 1rem);
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-secondary);
    }

    .meta-rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }

    .stars {
      color: #F59E0B;
    }

    .meta-reviews {
      color: var(--bk-color-primary);
    }

    .meta-dot {
      color: var(--bk-color-text-muted);
    }

    .meta-address {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-link {
      color: var(--bk-color-primary);
      text-decoration: none;
      font-weight: 500;
    }

    .meta-link:hover {
      text-decoration: underline;
    }

    /* ── Gallery ── */
    .gallery-wrapper {
      margin-bottom: var(--bk-space-xl, 2rem);
    }

    /* ── Sticky tabs bar ── */
    .tabs-bar {
      position: sticky;
      top: var(--bk-size-header-height, 56px);
      z-index: 40;
      background-color: var(--bk-bg-surface);
      border-bottom: 1px solid var(--bk-border-color-default);
      margin-bottom: var(--bk-space-xl, 2rem);
      transition: top 0.25s ease;
    }

    :host-context(.header-hidden) .tabs-bar {
      top: 0;
    }

    .tabs-toggle {
      opacity: 0;
      transition: opacity 0.25s ease;
      pointer-events: none;
    }

    .tabs-toggle.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .tabs-bar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--bk-space-lg, 1.5rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* ── Page container ── */
    .page-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--bk-space-lg, 1.5rem) var(--bk-space-xl, 2rem);
    }

    /* ── Split layout 70/30 ── */
    .split-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: var(--bk-space-sm, 8px);
      align-items: start;
    }

    .split-left {
      min-width: 0;
    }

    .split-right {
      position: sticky;
      top: calc(var(--bk-size-header-height, 56px) + 57px + var(--bk-space-lg, 1.5rem));
      transition: top 0.25s ease;
    }

    /* ── Section headings ── */
    .section-title {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      color: var(--bk-color-text-primary);
      margin: 0 0 var(--bk-space-lg, 1.5rem);
    }

    .section {
      margin-bottom: calc(var(--bk-space-xl, 2rem) * 2);
    }

    /* ── Category filter pills ── */
    .category-pills {
      display: flex;
      gap: var(--bk-space-sm, 0.5rem);
      overflow-x: auto;
      padding-bottom: var(--bk-space-sm, 0.5rem);
      margin-bottom: var(--bk-space-lg, 1.5rem);
      scrollbar-width: none;
    }

    .category-pills::-webkit-scrollbar {
      display: none;
    }

    .pill {
      padding: 6px var(--bk-space-md, 1rem);
      border-radius: 999px;
      font-size: var(--bk-font-size-sm);
      font-weight: 500;
      white-space: nowrap;
      border: 1px solid var(--bk-border-color-default);
      background-color: var(--bk-bg-surface);
      color: var(--bk-color-text-primary);
      cursor: pointer;
      transition: background-color 0.15s, border-color 0.15s, color 0.15s;
    }

    .pill:hover {
      border-color: var(--bk-color-primary);
      color: var(--bk-color-primary);
    }

    .pill.active {
      background-color: var(--bk-color-primary);
      border-color: var(--bk-color-primary);
      color: #fff;
    }

    /* ── Service search ── */
    .search-wrapper {
      max-width: 420px;
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    /* ── Services list ── */
    .services-list {
      /* ServiceListItem already has border-bottom on each row */
    }

    /* ── Empty state ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--bk-space-xl, 2rem) 0 calc(var(--bk-space-xl, 2rem) * 2);
      color: var(--bk-color-text-muted);
      text-align: center;
    }

    .empty-state p {
      margin: var(--bk-space-sm, 0.5rem) 0 0;
      font-size: var(--bk-font-size-sm);
    }

    /* ── Team grid ── */
    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--bk-space-lg, 1.5rem);
    }

    .team-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--bk-space-sm, 0.5rem);
    }

    .team-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      overflow: hidden;
      background-color: var(--bk-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.25rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .team-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .team-name {
      font-size: var(--bk-font-size-sm);
      font-weight: 600;
      color: var(--bk-color-text-primary);
      line-height: 1.3;
    }

    .team-profession {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      margin-top: -4px;
    }

    /* ── Reviews placeholder ── */
    .reviews-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: calc(var(--bk-space-xl, 2rem) * 2) 0;
      color: var(--bk-color-text-muted);
      text-align: center;
    }

    .reviews-placeholder .stars-big {
      font-size: 3rem;
      color: #F59E0B;
      opacity: 0.4;
      margin-bottom: var(--bk-space-md, 1rem);
    }

    .reviews-placeholder h3 {
      font-size: var(--bk-font-size-lg, 1.125rem);
      font-weight: 600;
      color: var(--bk-color-text-secondary);
      margin: 0 0 var(--bk-space-xs, 0.25rem);
    }

    .reviews-placeholder p {
      font-size: var(--bk-font-size-sm);
      margin: 0;
    }

    /* ── About section ── */
    .about-description {
      font-size: var(--bk-font-size-base);
      color: var(--bk-color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--bk-space-lg, 1.5rem);
    }

    .about-info-block {
      display: flex;
      flex-direction: column;
      gap: var(--bk-space-md, 1rem);
    }

    .about-info-row {
      display: flex;
      align-items: flex-start;
      gap: var(--bk-space-sm, 0.5rem);
    }

    .about-info-label {
      font-size: var(--bk-font-size-sm);
      font-weight: 600;
      color: var(--bk-color-text-muted);
      min-width: 100px;
    }

    .about-info-value {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-primary);
    }

    .schedule-placeholder {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      font-style: italic;
      margin-top: var(--bk-space-sm, 0.5rem);
    }

    /* ── Anchor nav links ── */
    .anchor-nav {
      display: flex;
      gap: var(--bk-space-md, 1rem);
    }

    .anchor-link {
      padding: var(--bk-space-sm, 0.5rem) var(--bk-space-xs, 0.25rem);
      font-size: var(--bk-font-size-sm);
      font-weight: 500;
      color: var(--bk-color-text-secondary);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap;
    }

    .anchor-link:hover {
      color: var(--bk-color-text-primary);
    }

    .anchor-link.active {
      color: var(--bk-color-primary);
      border-bottom-color: var(--bk-color-primary);
      font-weight: 600;
    }

    /* ── Loading / Error ── */
    .loading-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }

    .error-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--bk-space-xl, 2rem) var(--bk-space-lg, 1.5rem);
      text-align: center;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: var(--bk-space-md, 1rem);
    }

    .error-title {
      font-size: var(--bk-font-size-xl, 1.25rem);
      font-weight: 700;
      color: var(--bk-color-text-primary);
      margin: 0 0 var(--bk-space-xs, 0.25rem);
    }

    .error-message {
      font-size: var(--bk-font-size-sm);
      color: var(--bk-color-text-muted);
      margin: 0;
    }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .split-content {
        grid-template-columns: 1fr;
      }

      .split-right {
        position: static;
      }

      .team-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }
    }

    @media (max-width: 640px) {
      .company-title {
        font-size: 1.5rem;
      }

      .company-meta {
        gap: var(--bk-space-sm, 0.5rem);
      }
    }
  `,
  template: `
    @if (loading()) {
      <div class="loading-wrapper">
        <bk-spinner size="lg" />
      </div>
    } @else if (error()) {
      <div class="error-wrapper">
        <div class="error-icon">🔍</div>
        <h2 class="error-title">Empresa no encontrada</h2>
        <p class="error-message">{{ error() }}</p>
      </div>
    } @else if (company(); as comp) {

      <!-- ══ STICKY TABS BAR ══ -->
      <nav class="tabs-bar">
        <div class="tabs-bar-inner">
          <div class="anchor-nav">
            @for (tab of tabItems; track tab.id) {
              <button
                type="button"
                class="anchor-link"
                [class.active]="activeSection() === tab.id"
                (click)="scrollToSection(tab.id)">
                {{ tab.label }}
              </button>
            }
          </div>
          <div class="tabs-toggle" [class.visible]="isScrolledPastGallery()">
            <bk-theme-toggle />
          </div>
        </div>
      </nav>

      <!-- ══ PAGE CONTAINER ══ -->
      <div class="page-container">

        <!-- 1. BREADCRUMBS -->
        <nav class="breadcrumbs" aria-label="Navegación de ruta">
          <a href="/">Inicio</a>
          <span class="sep">·</span>
          <a href="/servicios">Servicios</a>
          <span class="sep">·</span>
          <span>Bogotá</span>
          <span class="sep">·</span>
          <span style="color: var(--bk-color-text-primary); font-weight: 500">{{ comp.VcName }}</span>
        </nav>

        <!-- 2. COMPANY HEADER -->
        <header class="company-header">
          <h1 class="company-title">{{ comp.VcName }}</h1>
          <div class="company-meta">
            <div class="meta-rating">
              <span class="stars">★</span>
              <span>0</span>
              <span class="meta-reviews">(0 reseñas)</span>
            </div>

            @if (comp.BranchAddress || comp.VcPrincipalAddress) {
              <span class="meta-dot">·</span>
              <span class="meta-address">
                <bk-icon name="building" size="sm" />
                {{ comp.BranchAddress || comp.VcPrincipalAddress }}
              </span>
              <span class="meta-dot">·</span>
              <a
                class="meta-link"
                [href]="'https://maps.google.com/?q=' + (comp.BranchAddress || comp.VcPrincipalAddress)"
                target="_blank"
                rel="noopener"
              >Cómo llegar</a>
            }
          </div>
        </header>

        <!-- 3. IMAGE GALLERY HERO -->
        <div class="gallery-wrapper">
          <bk-image-gallery-hero
            [images]="companyImages()"
            [companyName]="comp.VcName"
            [loading]="loading()"
            (viewAll)="openGallery()"
            (imageClick)="openGalleryAt($event)" />
          <!-- Sentinel para IntersectionObserver: cuando este div sale del viewport, activar sticky mode -->
          <div #galleryEnd style="height: 1px"></div>
        </div>

        <!-- 4. SPLIT LAYOUT 70/30 -->
        <div class="split-content">

          <!-- LEFT COLUMN -->
          <main class="split-left">

            <!-- ── SECTION: SERVICIOS ── -->
            <section class="section" id="section-services">
              <h2 class="section-title">Servicios</h2>

              <!-- Búsqueda -->
              <div class="search-wrapper">
                <bk-search-input
                  placeholder="Buscar servicios..."
                  (searchChange)="searchTerm.set($event)" />
              </div>

              <!-- Filtro por categoría -->
              <div class="category-pills">
                <button
                  type="button"
                  class="pill"
                  [class.active]="selectedCategoryId() === null"
                  (click)="selectedCategoryId.set(null)">
                  Todos ({{ totalServices() }})
                </button>
                @for (cat of categories(); track cat.Id) {
                  <button
                    type="button"
                    class="pill"
                    [class.active]="selectedCategoryId() === cat.Id"
                    (click)="selectedCategoryId.set(cat.Id)">
                    {{ cat.VcName }} ({{ cat.ServiceCount }})
                  </button>
                }
              </div>

              <!-- Lista de servicios -->
              <div class="services-list">
                @for (service of filteredServices(); track service.Id) {
                  <bk-service-list-item
                    [name]="service.VcName"
                    [duration]="service.VcTime"
                    [price]="service.IMinimalPrice"
                    (book)="onBookService(service)" />
                }
              </div>

              @if (filteredServices().length === 0) {
                <div class="empty-state">
                  <bk-icon name="search" size="lg" />
                  <p>No se encontraron servicios.</p>
                </div>
              }
            </section>

            <!-- ── SECTION: EQUIPO ── -->
            <section class="section" id="section-team">
              <h2 class="section-title">Equipo</h2>

              @if (loading()) {
                <!-- Skeleton loaders para equipo -->
                <div class="team-grid">
                  @for (i of [1,2,3,4]; track i) {
                    <div class="team-card">
                      <bk-skeleton variant="circle" width="72px" height="72px" />
                      <bk-skeleton variant="text" width="80px" height="14px" />
                      <bk-skeleton variant="text" width="60px" height="12px" />
                    </div>
                  }
                </div>
              } @else if (professionals().length > 0) {
                <div class="team-grid">
                  @for (prof of professionals(); track prof.Id) {
                    <div class="team-card">
                      <div class="team-avatar">
                        @if (prof.TxPhoto) {
                          <img [src]="prof.TxPhoto" [alt]="prof.VcFirstName + ' ' + prof.VcFirstLastName" loading="lazy" />
                        } @else {
                          {{ prof.VcFirstName.charAt(0) }}{{ prof.VcFirstLastName.charAt(0) }}
                        }
                      </div>
                      <span class="team-name">{{ prof.VcFirstName }} {{ prof.VcFirstLastName }}</span>
                      @if (prof.VcProfession) {
                        <span class="team-profession">{{ prof.VcProfession }}</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">
                  <bk-icon name="users" size="lg" />
                  <p>No hay profesionales registrados.</p>
                </div>
              }
            </section>

            <!-- ── SECTION: RESEÑAS ── -->
            <section class="section" id="section-reviews">
              <h2 class="section-title">Reseñas</h2>
              <div class="reviews-placeholder">
                <div class="stars-big">★★★★★</div>
                <h3>Aún no hay reseñas</h3>
                <p>Esta funcionalidad estará disponible próximamente.</p>
              </div>
            </section>

            <!-- ── SECTION: ACERCA DE ── -->
            <section class="section" id="section-about">
              <h2 class="section-title">Acerca de</h2>

              @if (comp.VcDescription) {
                <p class="about-description">{{ comp.VcDescription }}</p>
              }

              <div class="about-info-block">
                @if (comp.BranchAddress || comp.VcPrincipalAddress) {
                  <div class="about-info-row">
                    <bk-icon name="building" size="sm" />
                    <div>
                      <div class="about-info-value">{{ comp.BranchAddress || comp.VcPrincipalAddress }}</div>
                      <a
                        class="meta-link"
                        [href]="'https://maps.google.com/?q=' + (comp.BranchAddress || comp.VcPrincipalAddress)"
                        target="_blank"
                        rel="noopener"
                        style="font-size: var(--bk-font-size-sm); margin-top: 4px; display: inline-block"
                      >Ver en Google Maps →</a>
                    </div>
                  </div>
                }

                @if (comp.VcPhone) {
                  <div class="about-info-row">
                    <bk-icon name="phone" size="sm" />
                    <span class="about-info-value">{{ comp.VcPhone }}</span>
                  </div>
                }

                @if (comp.VcPrincipalEmail) {
                  <div class="about-info-row">
                    <bk-icon name="mail" size="sm" />
                    <span class="about-info-value">{{ comp.VcPrincipalEmail }}</span>
                  </div>
                }

                <div class="about-info-row">
                  <bk-icon name="calendar" size="sm" />
                  <span class="schedule-placeholder">Horario disponible próximamente</span>
                </div>
              </div>
            </section>

          </main>

          <!-- RIGHT COLUMN — booking card -->
          <aside class="split-right">
            <bk-company-booking-card
              [companyName]="comp.VcName"
              [showName]="isScrolledPastGallery()"
              [rating]="0"
              [reviewCount]="0"
              [isOpen]="true"
              [scheduleText]="''"
              [address]="comp.BranchAddress || comp.VcPrincipalAddress || ''"
              (bookNow)="onBookNow()" />
          </aside>

        </div>
      </div>

      <!-- GALLERY VIEWER -->
      <bk-gallery-viewer
        [open]="galleryOpen()"
        [images]="galleryItems()"
        [companyName]="comp.VcName"
        [initialIndex]="galleryInitialIndex()"
        (closed)="closeGallery()" />

    }
  `,
})
export class PublicCompanyPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PublicBookingApiService);

  @ViewChild('galleryEnd') galleryEndRef!: ElementRef<HTMLDivElement>;
  private observer: IntersectionObserver | null = null;
  private sectionObserver: IntersectionObserver | null = null;

  /** true when gallery sentinel is out of viewport (user scrolled past gallery) */
  isScrolledPastGallery = signal(false);

  company = signal<PublicCompany | null>(null);
  services = signal<PublicService[]>([]);
  categories = signal<PublicCategory[]>([]);
  professionals = signal<PublicProfessional[]>([]);
  galleryData = signal<Record<string, GalleryImage[]>>({});
  loading = signal(true);
  error = signal<string | null>(null);
  activeSection = signal<'services' | 'team' | 'reviews' | 'about'>('services');
  searchTerm = signal('');
  selectedCategoryId = signal<number | null>(null);

  slug = signal('');
  galleryOpen = signal(false);
  galleryInitialIndex = signal(0);

  filteredServices = computed(() => {
    let result = this.services();
    const search = this.searchTerm().toLowerCase().trim();
    const catId = this.selectedCategoryId();
    if (search) {
      result = result.filter(s => s.VcName.toLowerCase().includes(search));
    }
    if (catId !== null) {
      result = result.filter(s => s.CategoryId === catId);
    }
    return result;
  });

  totalServices = computed(() => this.services().length);

  /** Images for the hero gallery (first 3 venue images) */
  companyImages = computed((): string[] => {
    const gallery = this.galleryData();
    const venue = (gallery['venue'] || []).map(g => g.VcImageUrl);

    if (venue.length >= 3) return venue.slice(0, 3);

    // Completar con imágenes de otras categorías si venue no tiene 3
    const service = (gallery['service'] || []).map(g => g.VcImageUrl);
    const portfolio = (gallery['portfolio'] || []).map(g => g.VcImageUrl);
    const combined = [...venue, ...service, ...portfolio];

    if (combined.length > 0) return combined.slice(0, 3);

    // Fallback a TxImages del entity Company
    const comp = this.company();
    if (!comp?.TxImages) return [];
    try {
      const parsed = JSON.parse(comp.TxImages);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  /** All gallery images mapped for the gallery viewer widget */
  galleryItems = computed((): GalleryImageItem[] => {
    const gallery = this.galleryData();
    const items: GalleryImageItem[] = [];
    for (const [category, images] of Object.entries(gallery)) {
      for (const img of images) {
        items.push({
          VcImageUrl: img.VcImageUrl,
          VcCategory: img.VcCategory,
          VcCategoryName: img.VcCategoryName,
          ProfessionalId: img.ProfessionalId,
          ProfessionalName: img.Professional
            ? `${img.Professional.VcFirstName} ${img.Professional.VcFirstLastName}`
            : undefined,
          VcDescription: img.VcDescription,
        });
      }
    }
    return items;
  });

  readonly tabItems: { id: string; label: string }[] = [
    { id: 'services', label: 'Servicios' },
    { id: 'team', label: 'Equipo' },
    { id: 'reviews', label: 'Reseñas' },
    { id: 'about', label: 'Acerca de' },
  ];

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'] as string;
    this.slug.set(slug);

    forkJoin({
      company: this.api.getCompanyBySlug(slug),
      services: this.api.getServices(slug),
      categories: this.api.getCategories(slug),
      professionals: this.api.getProfessionals(slug),
      gallery: this.api.getGallery(slug),
    }).subscribe({
      next: ({ company, services, categories, professionals, gallery }) => {
        this.company.set(company.data);
        this.services.set(services.data);
        this.categories.set(categories.data);
        this.professionals.set(professionals.data);
        this.galleryData.set(gallery.data as Record<string, GalleryImage[]>);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar la información de esta empresa. Verifica el enlace e intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  onBookService(service: PublicService): void {
    this.router.navigate(['/empresa', this.slug(), 'reservar'], {
      queryParams: { serviceId: service.Id },
    });
  }

  onBookNow(): void {
    this.router.navigate(['/empresa', this.slug(), 'reservar']);
  }

  openGallery(): void {
    this.galleryInitialIndex.set(0);
    this.galleryOpen.set(true);
  }

  openGalleryAt(index: number): void {
    this.galleryInitialIndex.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToSection(sectionId: string): void {
    const el = document.getElementById(`section-${sectionId}`);
    if (!el) return;
    const headerOffset = 120; // header + tabs bar height
    const elementPosition = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: elementPosition - headerOffset,
      behavior: 'smooth',
    });
  }

  private observersInitialized = false;

  constructor() {
    // Initialize observers AFTER data loads and template renders
    effect(() => {
      const isLoaded = !this.loading() && this.company() !== null;
      if (!isLoaded || this.observersInitialized) return;

      // Wait one tick for the template to render
      queueMicrotask(() => this.initObservers());
    });
  }

  private initObservers(): void {
    if (this.observersInitialized) return;
    this.observersInitialized = true;

    // Gallery end sentinel — controls header hide + company name in card
    const galleryEnd = this.galleryEndRef?.nativeElement;
    if (galleryEnd) {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          const pastGallery = !entry.isIntersecting;
          this.isScrolledPastGallery.set(pastGallery);

          const header = document.querySelector('.public-header') as HTMLElement;
          if (header) {
            header.style.transform = pastGallery ? 'translateY(-100%)' : 'translateY(0)';
            header.style.transition = 'transform 0.25s ease';
          }

          const tabsBar = document.querySelector('.tabs-bar') as HTMLElement;
          if (tabsBar) {
            tabsBar.style.top = pastGallery ? '0' : 'var(--bk-size-header-height, 56px)';
          }

          const splitRight = document.querySelector('.split-right') as HTMLElement;
          if (splitRight) {
            const tabsHeight = tabsBar?.offsetHeight || 44;
            splitRight.style.top = pastGallery
              ? `${tabsHeight + 16}px`
              : `calc(var(--bk-size-header-height, 56px) + ${tabsHeight}px + var(--bk-space-md, 1rem))`;
          }
        },
        { threshold: 0 },
      );
      this.observer.observe(galleryEnd);
    }

    // Section observer — highlights active anchor link
    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('section-', '') as 'services' | 'team' | 'reviews' | 'about';
            this.activeSection.set(id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    ['section-services', 'section-team', 'section-reviews', 'section-about'].forEach(id => {
      const el = document.getElementById(id);
      if (el) this.sectionObserver!.observe(el);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.sectionObserver?.disconnect();
  }
}
