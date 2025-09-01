import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Inject, OnChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MapMarker } from '../../interfaces/map.interface';

// Declaraciones para Leaflet (se cargarán dinámicamente)
declare var L: any;

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interactive-map.component.html',
  styleUrl: './interactive-map.component.scss',
})
export class InteractiveMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  @Input() markers: MapMarker[] = [];
  @Input() minHeight: string = '500px';
  @Input() initialZoom: number = 6;
  @Input() maxZoom: number = 18;
  @Input() minZoom: number = 4;

  // Configuración por defecto para Colombia
  private readonly COLOMBIA_CENTER: [number, number] = [4.570868, -74.297333]; // Bogotá
  private readonly COLOMBIA_BOUNDS: [[number, number], [number, number]] = [
    [-4.227, -81.735], // Suroeste
    [15.5, -66.87]     // Noreste
  ];

  // Estado del componente
  loading = true;
  error: string | null = null;
  markersVisible = true;
  showMarkersPanel = false;

  // Instancias de Leaflet
  private map: any = null;
  private markerLayer: any = null;
  private leafletLoaded = false;

  // ID único para el mapa
  mapId = `map-${Math.random().toString(36).substr(2, 9)}`;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadLeaflet();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Esperar un poco para que el DOM esté completamente renderizado
      setTimeout(() => {
        if (this.leafletLoaded) {
          this.initializeMap();
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Carga dinámicamente Leaflet
   */
  private async loadLeaflet(): Promise<void> {
    try {
      // Cargar CSS de Leaflet
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Cargar JS de Leaflet
      if (typeof L === 'undefined') {
        await this.loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      }

      this.leafletLoaded = true;
      this.loading = false;
    } catch (error) {
      console.error('Error cargando Leaflet:', error);
      this.error = 'Error al cargar el mapa. Verifique su conexión a internet.';
      this.loading = false;
    }
  }

  /**
   * Carga un script dinámicamente
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Error loading script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Inicializa el mapa
   */
  initializeMap(): void {
    if (!this.leafletLoaded || typeof L === 'undefined') {
      this.error = 'Leaflet no está disponible';
      return;
    }

    try {
      this.error = null;
      this.loading = true;

      // Limpiar mapa existente
      if (this.map) {
        this.map.remove();
      }

      // Crear el mapa
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.COLOMBIA_CENTER,
        zoom: this.initialZoom,
        maxZoom: this.maxZoom,
        minZoom: this.minZoom,
        zoomControl: true,
        attributionControl: true
      });

      // Configurar límites para Colombia
      this.map.setMaxBounds(this.COLOMBIA_BOUNDS);

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: this.maxZoom
      }).addTo(this.map);

      // Crear capa para marcadores
      this.markerLayer = L.layerGroup().addTo(this.map);

      // Agregar marcadores si existen
      if (this.markers.length > 0) {
        this.addMarkers();
        this.fitMapToMarkers();
      }

      this.loading = false;

      // Evento cuando el mapa está listo
      this.map.whenReady(() => {
        this.map.invalidateSize();
      });

    } catch (error) {
      console.error('Error inicializando mapa:', error);
      this.error = 'Error al inicializar el mapa';
      this.loading = false;
    }
  }

  /**
   * Agrega marcadores al mapa
   */
  private addMarkers(): void {
    if (!this.map || !this.markerLayer) return;

    // Limpiar marcadores existentes
    this.markerLayer.clearLayers();

    this.markers.forEach((marker, index) => {
      try {
        // Crear icono personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 25px;
            height: 25px;
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${index + 1}</div>`,
          iconSize: [31, 31],
          iconAnchor: [15, 15],
          popupAnchor: [0, -15]
        });

        // Crear marcador
        const leafletMarker = L.marker([marker.latitud, marker.longitud], {
          icon: customIcon,
          title: marker.nombre
        });

        // Crear contenido del popup
        const popupContent = this.createPopupContent(marker);
        leafletMarker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        // Agregar eventos
        leafletMarker.on('mouseover', () => {
          leafletMarker.openPopup();
        });

        // Agregar a la capa
        this.markerLayer.addLayer(leafletMarker);

      } catch (error) {
        console.error('Error agregando marcador:', marker, error);
      }
    });
  }

  /**
   * Crea el contenido HTML para el popup
   */
  private createPopupContent(marker: MapMarker): string {
    return `
      <div class="popup-content">
        <div class="popup-header">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">
            ${marker.nombre}
          </h3>
        </div>
        <div class="popup-body">
          <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.4;">
            ${marker.descripcion}
          </p>
          ${marker.categoria ? `
            <div style="margin-top: 8px; padding: 4px 8px; background: #fef3c7; border-radius: 6px; display: inline-block;">
              <span style="color: #92400e; font-size: 12px; font-weight: 500;">
                ${marker.categoria}
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Ajusta el mapa para mostrar todos los marcadores
   */
  private fitMapToMarkers(): void {
    if (!this.map || this.markers.length === 0) return;

    const group = new L.featureGroup(this.markerLayer.getLayers());
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  /**
   * Controles del mapa
   */
  zoomIn(): void {
    if (this.map) {
      this.map.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.map) {
      this.map.zoomOut();
    }
  }

  resetView(): void {
    if (this.map) {
      if (this.markers.length > 0) {
        this.fitMapToMarkers();
      } else {
        this.map.setView(this.COLOMBIA_CENTER, this.initialZoom);
      }
    }
  }

  toggleMarkers(): void {
    if (!this.map || !this.markerLayer) return;

    this.markersVisible = !this.markersVisible;

    if (this.markersVisible) {
      this.map.addLayer(this.markerLayer);
    } else {
      this.map.removeLayer(this.markerLayer);
    }
  }

  /**
   * Enfoca un marcador específico
   */
  focusMarker(marker: MapMarker): void {
    if (!this.map) return;

    this.map.setView([marker.latitud, marker.longitud], Math.max(this.map.getZoom(), 12));

    // Encontrar y abrir el popup del marcador
    this.markerLayer.eachLayer((layer: any) => {
      const latLng = layer.getLatLng();
      if (latLng.lat === marker.latitud && latLng.lng === marker.longitud) {
        layer.openPopup();
      }
    });

    this.showMarkersPanel = false;
  }

  /**
   * TrackBy function para la lista de marcadores
   */
  trackByMarkerId(index: number, marker: MapMarker): string {
    return marker.id || `${marker.latitud}-${marker.longitud}`;
  }

  /**
   * Actualiza los marcadores cuando cambia el input
   */
  ngOnChanges(): void {
    if (this.map && this.leafletLoaded) {
      setTimeout(() => {
        this.addMarkers();
        if (this.markers.length > 0) {
          this.fitMapToMarkers();
        }
      }, 100);
    }
  }
}
