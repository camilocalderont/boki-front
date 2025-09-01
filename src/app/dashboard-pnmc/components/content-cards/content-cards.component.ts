import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';

interface ObjectProperty {
  key: string;
  value: any;
}

@Component({
  selector: 'app-content-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-cards.component.html',
  styleUrl: './content-cards.component.scss',
})
export class ContentCardsComponent implements OnInit {
  @Input() items: any[] = [];
  @Input() sectionTitle: string = '';
  @Input() sectionDescription: string = '';
  @Input() category: string = 'artistas'; // Para determinar el tipo de imagen
  @Input() viewMoreUrl: string = '#';
  @Input() showSectionButton: boolean = true;
  @Input() loading: boolean = false;

  // Cache de imágenes para evitar múltiples llamadas
  private imageCache = new Map<number, string>();
  private imageErrors = new Set<number>();

  constructor(private imageService: ImageService) {}

  ngOnInit(): void {
    // Pre-cargar algunas imágenes si hay elementos
    if (this.items.length > 0) {
      this.preloadImages();
    }
  }

  /**
   * Obtiene las propiedades de un objeto como array de key-value pairs
   */
  getObjectProperties(item: any): ObjectProperty[] {
    if (!item || typeof item !== 'object') {
      return [];
    }

    return Object.keys(item)
      .filter(key => key !== 'imagen') // Excluir la propiedad imagen del renderizado
      .map(key => ({
        key,
        value: item[key]
      }))
      .sort((a, b) => {
        // Priorizar 'nombre' o 'titulo' al inicio
        const priorityKeys = ['nombre', 'titulo', 'title', 'name'];
        const aPriority = priorityKeys.includes(a.key.toLowerCase()) ? 0 : 1;
        const bPriority = priorityKeys.includes(b.key.toLowerCase()) ? 0 : 1;
        return aPriority - bPriority;
      });
  }

  /**
   * Verifica si una clave es una propiedad de imagen
   */
  isImageProperty(key: string): boolean {
    const imageKeys = ['imagen', 'image', 'foto', 'photo', 'picture'];
    return imageKeys.includes(key.toLowerCase());
  }

  /**
   * Formatea el nombre de la propiedad para mostrar
   */
  formatPropertyName(key: string): string {
    // Mapeo de claves comunes a nombres más legibles
    const keyMap: { [key: string]: string } = {
      'nombre': 'Nombre',
      'descripcion': 'Descripción',
      'lugar': 'Lugar',
      'fecha': 'Fecha',
      'publico': 'Público objetivo',
      'costo': 'Costo',
      'genero': 'Género',
      'ciudad': 'Ciudad',
      'contenido': 'Contenido',
      'tipo': 'Tipo'
    };

    const lowerKey = key.toLowerCase();
    if (keyMap[lowerKey]) {
      return keyMap[lowerKey];
    }

    // Capitalizar primera letra y reemplazar guiones/underscores
    return key
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Determina si un texto es largo y necesita truncamiento
   */
  isLongText(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return value.length > 100;
  }

  /**
   * Obtiene la URL de la imagen para un elemento
   */
  getImageUrl(item: any, index: number): string {
    // Si ya tenemos la imagen en cache, la devolvemos
    if (this.imageCache.has(index)) {
      return this.imageCache.get(index)!;
    }

    // Si el item tiene una imagen específica, usarla
    if (item.imagen && typeof item.imagen === 'string' && item.imagen.startsWith('http')) {
      this.imageCache.set(index, item.imagen);
      return item.imagen;
    }

    // Si hubo error previo, devolver placeholder
    if (this.imageErrors.has(index)) {
      const placeholder = this.imageService.getPlaceholderImage(400, 300, 'Sin imagen');
      this.imageCache.set(index, placeholder);
      return placeholder;
    }

    // Generar imagen basada en categoría
    this.imageService.getRandomImageByCategory(this.category, 400, 300).subscribe({
      next: (imageUrl) => {
        this.imageCache.set(index, imageUrl);
      },
      error: () => {
        const placeholder = this.imageService.getPlaceholderImage(400, 300, 'Sin imagen');
        this.imageCache.set(index, placeholder);
        this.imageErrors.add(index);
      }
    });

    // Devolver placeholder temporal mientras carga
    return this.imageService.getPlaceholderImage(400, 300, 'Cargando...');
  }

  /**
   * Obtiene el alt text para la imagen
   */
  getImageAlt(item: any): string {
    // Buscar propiedades que puedan servir como alt text
    const altKeys = ['nombre', 'titulo', 'title', 'name', 'descripcion'];

    for (const key of altKeys) {
      if (item[key] && typeof item[key] === 'string') {
        return item[key];
      }
    }

    return `Imagen de ${this.sectionTitle}`;
  }

  /**
   * Maneja errores de carga de imagen
   */
  onImageError(event: any, index: number): void {
    this.imageErrors.add(index);
    const placeholder = this.imageService.getPlaceholderImage(400, 300, 'Error al cargar');
    this.imageCache.set(index, placeholder);
    event.target.src = placeholder;
  }

  /**
   * Pre-carga algunas imágenes para mejor UX
   */
  private preloadImages(): void {
    // Pre-cargar las primeras 4 imágenes
    const itemsToPreload = Math.min(4, this.items.length);

    for (let i = 0; i < itemsToPreload; i++) {
      this.getImageUrl(this.items[i], i);
    }
  }

  /**
   * Limpia el cache de imágenes
   */
  clearImageCache(): void {
    this.imageCache.clear();
    this.imageErrors.clear();
  }
}
