import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    thumb: string;
  };
  alt_description?: string;
}

export interface UnsplashResponse {
  results: UnsplashImage[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private readonly UNSPLASH_ACCESS_KEY = 'DSBcZsiDwoSZftq3KRFZ3UsHdxxhP4Wczqcb2WXscas'; // Reemplazar con tu clave real
  private readonly UNSPLASH_API_URL = 'https://api.unsplash.com';
  private readonly PICSUM_API_URL = 'https://picsum.photos';

  // Cache simple para evitar múltiples llamadas
  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una imagen aleatoria por categoría usando Unsplash
   * Si falla, usa Picsum como fallback
   */
  getRandomImageByCategory(category: string, width: number = 400, height: number = 300): Observable<string> {
    const cacheKey = `${category}-${width}x${height}`;

    // Verificar cache
    if (this.imageCache.has(cacheKey)) {
      return of(this.imageCache.get(cacheKey)!);
    }

    // Mapeo de categorías a términos de búsqueda en inglés
    const categoryMap: { [key: string]: string } = {
      'artistas': 'artist musician performer',
      'músicos': 'musician instrument music',
      'pintores': 'painter art painting',
      'escultores': 'sculptor sculpture art',
      'bailarines': 'dancer dance performance',
      'cantantes': 'singer microphone stage',
      'compositores': 'composer music sheet piano',
      'directores': 'conductor orchestra music',
      'proyectos': 'cultural project community art',
      'eventos': 'cultural event festival concert',
      'noticias': 'news culture art music',
      'calendario': 'calendar event schedule music'
    };

    const searchTerm = categoryMap[category.toLowerCase()] || 'music art culture';

    // Intentar con Unsplash primero (si tienes clave API)
    if (this.UNSPLASH_ACCESS_KEY) {
      return this.getUnsplashImage(searchTerm, width, height).pipe(
        catchError(() => this.getPicsumImage(width, height, category))
      );
    } else {
      // Usar Picsum directamente con seed basado en categoría
      return this.getPicsumImage(width, height, category);
    }
  }

  /**
   * Obtiene imagen de Unsplash
   */
  private getUnsplashImage(query: string, width: number, height: number): Observable<string> {
    const url = `${this.UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`;

    return this.http.get<UnsplashResponse>(url, {
      headers: {
        'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
      }
    }).pipe(
      map(response => {
        if (response.results && response.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * response.results.length);
          const imageUrl = response.results[randomIndex].urls.regular;

          // Guardar en cache
          const cacheKey = `${query}-${width}x${height}`;
          this.imageCache.set(cacheKey, imageUrl);

          return imageUrl;
        }
        throw new Error('No images found');
      }),
      catchError(() => this.getPicsumImage(width, height, query))
    );
  }

  /**
   * Obtiene imagen de Picsum (fallback)
   */
  private getPicsumImage(width: number, height: number, seed: string): Observable<string> {
    // Crear un seed numérico basado en la categoría para consistencia
    const numericSeed = this.stringToNumber(seed);
    const imageUrl = `${this.PICSUM_API_URL}/${width}/${height}?random=${numericSeed}`;

    // Guardar en cache
    const cacheKey = `${seed}-${width}x${height}`;
    this.imageCache.set(cacheKey, imageUrl);

    return of(imageUrl);
  }

  /**
   * Convierte string a número para usar como seed
   */
  private stringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Obtiene imagen placeholder cuando no hay imagen disponible
   */
  getPlaceholderImage(width: number = 400, height: number = 300, text: string = 'Sin imagen'): string {
    const backgroundColor = '6B7280'; // gray-500
    const textColor = 'FFFFFF';
    return `https://via.placeholder.com/${width}x${height}/${backgroundColor}/${textColor}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Limpia el cache de imágenes
   */
  clearCache(): void {
    this.imageCache.clear();
  }
}
