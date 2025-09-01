# Dashboard PNMC - Plataforma Nacional de Músicos Colombianos

Este módulo contiene el dashboard específico para PNMC (Plataforma Nacional de Músicos Colombianos) del Ministerio de Cultura.

## Estructura del Proyecto

```
dashboard-pnmc/
├── components/
│   ├── content-cards/          # Componente reutilizable para mostrar tarjetas
│   └── interactive-map/        # Componente de mapa interactivo con Leaflet
├── interfaces/
│   └── map.interface.ts       # Interfaz para marcadores del mapa
├── pages/
│   └── pnmc-home/             # Página principal con todas las secciones
├── services/
│   └── image.service.ts       # Servicio para obtener imágenes aleatorias
├── pnmc-layout/               # Layout principal sin sidebar
└── pnmc.routes.ts            # Configuración de rutas
```

## Características Principales

### 1. Layout Responsivo
- **Desktop (1920x1080+)**: 4 columnas
- **Tablet (1366x768)**: 3 columnas
- **Móvil (1024x768 o menos)**: 1 columna

### 2. Componente Reutilizable (`ContentCardsComponent`)

El componente `app-content-cards` es completamente reutilizable y acepta cualquier array de objetos:

```typescript
<app-content-cards
  [items]="tuArrayDeObjetos"
  [sectionTitle]="'Título de la Sección'"
  [sectionDescription]="'Descripción opcional'"
  [category]="'artistas'" // Para determinar tipo de imagen
  [viewMoreUrl]="'#enlace'"
  [showSectionButton]="true">
</app-content-cards>
```

#### Propiedades:
- `items`: Array de objetos con cualquier estructura
- `sectionTitle`: Título de la sección
- `sectionDescription`: Descripción opcional
- `category`: Categoría para imágenes ('artistas', 'músicos', 'pintores', etc.)
- `viewMoreUrl`: URL del botón "Ver más"
- `showSectionButton`: Mostrar/ocultar botón de sección

### 3. Servicio de Imágenes (`ImageService`)

#### Configuración de Unsplash API (Recomendado)

1. Regístrate en [Unsplash Developers](https://unsplash.com/developers)
2. Crea una nueva aplicación
3. Copia tu Access Key
4. Reemplaza `YOUR_UNSPLASH_ACCESS_KEY` en `image.service.ts`

```typescript
private readonly UNSPLASH_ACCESS_KEY = 'tu-clave-aqui';
```

#### Categorías Soportadas

El servicio mapea categorías en español a términos de búsqueda en inglés:

- `artistas` → "artist musician performer"
- `músicos` → "musician instrument music"
- `pintores` → "painter art painting"
- `escultores` → "sculptor sculpture art"
- `bailarines` → "dancer dance performance"
- `cantantes` → "singer microphone stage"
- `compositores` → "composer music sheet piano"
- `directores` → "conductor orchestra music"
- `proyectos` → "cultural project community art"
- `eventos` → "cultural event festival concert"
- `noticias` → "news culture art music"
- `calendario` → "calendar event schedule music"

#### Fallback Automático

Si Unsplash falla o no tienes clave API, el servicio usa automáticamente [Picsum Photos](https://picsum.photos) como respaldo.

### 4. Mapa Interactivo (`InteractiveMapComponent`)

El componente `app-interactive-map` utiliza Leaflet con OpenStreetMap para mostrar ubicaciones culturales:

```typescript
<app-interactive-map
  [markers]="tuArrayDeMarcadores"
  [minHeight]="'600px'"
  [initialZoom]="6">
</app-interactive-map>
```

#### Propiedades del Mapa:
- `markers`: Array de objetos `MapMarker`
- `minHeight`: Altura mínima del mapa
- `initialZoom`: Nivel de zoom inicial
- `maxZoom`: Zoom máximo permitido (default: 18)
- `minZoom`: Zoom mínimo permitido (default: 4)

#### Interfaz MapMarker:
```typescript
interface MapMarker {
  nombre: string;
  latitud: number;
  longitud: number;
  descripcion: string;
  id?: string;
  categoria?: string;
  imagen?: string;
}
```

#### Características del Mapa:
- **Carga dinámica de Leaflet**: No requiere instalación previa
- **Marcadores personalizados**: Con numeración y colores del tema PNMC
- **Popups informativos**: Muestran nombre, descripción y categoría
- **Controles personalizados**: Zoom, vista completa, toggle de marcadores
- **Panel de marcadores**: Lista lateral con todos los puntos
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Límites geográficos**: Restringido a Colombia
- **Fallback automático**: Manejo de errores de carga

### 5. Datos de Ejemplo

El componente `PnmcHomeComponent` incluye datos de ejemplo para todas las secciones:

#### Estoy Buscando
```typescript
{
  nombre: "Nombre de lo que se busca",
  descripcion: "Descripción de lo que se busca"
}
```

#### Portafolio
```typescript
{
  nombre: "Elkin Melo",
  descripcion: "Tipo de artista: Guitarrista y compositor",
  genero: "Rock instrumental con influencias del jazz y el blues",
  ciudad: "Bucaramanga, Santander"
}
```

#### Proyectos
```typescript
{
  nombre: "Proyecto 1",
  lugar: "Cali, Valle del Cauca",
  fecha: "2024-01-01",
  descripcion: "Descripción del proyecto 1"
}
```

#### Calendario
```typescript
{
  nombre: "Encuentro de Cuerdas Andinas",
  lugar: "Tunja",
  publico: "Estudiantes de música, docentes y músicos tradicionales",
  costo: "$20.000 por día / $50.000 pase completo"
}
```

#### Noticias
```typescript
{
  fecha: "22 de julio de 2025",
  descripcion: "Título de la noticia",
  contenido: "Contenido completo de la noticia..."
}
```

## Navegación

El dashboard incluye un menú horizontal con navegación por anclas:

- Estoy Buscando (`#EstoyBuscando`)
- Portafolio (`#Portafolio`)
- Proyectos (`#Proyectos`)
- Mapa (`#Mapa`)
- Calendario (`#Calendario`)
- Noticias (`#Noticias`)

## Rutas Disponibles

- `/pnmc` - Página principal
- `/pnmc/estoy-buscando` - Sección específica
- `/pnmc/portafolio` - Sección específica
- `/pnmc/proyectos` - Sección específica
- `/pnmc/mapa` - Sección específica
- `/pnmc/calendario` - Sección específica
- `/pnmc/noticias` - Sección específica

## Personalización

### Colores del Tema PNMC
- Primario: Naranja (`#f97316`) a Rojo (`#dc2626`)
- Secundario: Variaciones de grises
- Acentos: Amarillo (`#fbbf24`) para highlights

### Fuentes y Tipografía
- Utiliza las fuentes del sistema de Tailwind CSS
- Jerarquía clara con tamaños responsivos

## Rendimiento

- Lazy loading de imágenes
- Cache de imágenes para evitar llamadas duplicadas
- Componentes standalone para mejor tree-shaking
- Animaciones optimizadas con CSS

## Accesibilidad

- Navegación por teclado
- Textos alternativos para imágenes
- Contrastes adecuados
- Estados de focus visibles
- Soporte para `prefers-reduced-motion`

## Próximos Pasos

1. **Integración con API real**: Reemplazar datos mock con servicios reales
2. **Páginas específicas**: Crear componentes dedicados para cada sección
3. **Mapa interactivo**: Implementar mapa con geolocalización
4. **Sistema de búsqueda**: Agregar filtros y búsqueda avanzada
5. **Autenticación**: Integrar con sistema de usuarios del Ministerio de Cultura
