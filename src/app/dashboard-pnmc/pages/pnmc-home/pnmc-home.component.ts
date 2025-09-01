import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentCardsComponent } from '../../components/content-cards/content-cards.component';
import { InteractiveMapComponent } from '../../components/interactive-map/interactive-map.component';
import { MapMarker } from '../../interfaces/map.interface';

@Component({
  selector: 'app-pnmc-home',
  standalone: true,
  imports: [CommonModule, ContentCardsComponent, InteractiveMapComponent],
  templateUrl: './pnmc-home.component.html',
  styleUrl: './pnmc-home.component.scss',
})
export class PnmcHomeComponent implements OnInit {

  // Datos de ejemplo para "Estoy Buscando"
  estoyBuscandoData = [
    {
      nombre: "Guitarrista para banda de rock",
      descripcion: "Buscamos guitarrista experimentado para banda de rock alternativo. Influencias: Radiohead, Arctic Monkeys, The Strokes."
    },
    {
      nombre: "Cantante de música folclórica",
      descripcion: "Se requiere intérprete de música tradicional colombiana para proyecto de rescate cultural en el Huila."
    },
    {
      nombre: "Productor musical",
      descripcion: "Productor con experiencia en géneros urbanos para álbum debut de artista emergente."
    },
    {
      nombre: "Violinista clásico",
      descripcion: "Músico de cámara para conciertos en teatros de Bogotá y Medellín durante temporada 2024."
    }
  ];

  // Datos de ejemplo para "Portafolio"
  portafolioData = [
    {
      nombre: "Elkin Melo",
      descripcion: "Tipo de artista: Guitarrista y compositor",
      genero: "Rock instrumental con influencias del jazz y el blues",
      ciudad: "Bucaramanga, Santander"
    },
    {
      nombre: "María Fernanda Ochoa",
      descripcion: "Tipo de artista: Cantautora",
      genero: "Folk colombiano contemporáneo",
      ciudad: "Medellín, Antioquia"
    },
    {
      nombre: "Carlos Vives Jr.",
      descripcion: "Tipo de artista: Acordeonista",
      genero: "Vallenato tradicional y fusión",
      ciudad: "Valledupar, Cesar"
    },
    {
      nombre: "Ana Lucía Rodríguez",
      descripcion: "Tipo de artista: Pianista",
      genero: "Música clásica y contemporánea",
      ciudad: "Bogotá, Cundinamarca"
    }
  ];

  // Datos de ejemplo para "Proyectos"
  proyectosData = [
    {
      nombre: "Festival de Música Andina",
      lugar: "Cali, Valle del Cauca",
      fecha: "2024-03-15",
      descripcion: "Festival que reúne a músicos andinos de toda Colombia para celebrar nuestras tradiciones."
    },
    {
      nombre: "Escuela de Rock Juvenil",
      lugar: "Bogotá, Cundinamarca",
      fecha: "2024-02-01",
      descripcion: "Programa de formación musical para jóvenes en situación de vulnerabilidad."
    },
    {
      nombre: "Concierto Sinfónico Popular",
      lugar: "Medellín, Antioquia",
      fecha: "2024-04-20",
      descripcion: "Fusión entre música clásica y géneros populares colombianos."
    },
    {
      nombre: "Laboratorio de Música Electrónica",
      lugar: "Cartagena, Bolívar",
      fecha: "2024-05-10",
      descripcion: "Taller intensivo de producción musical y nuevas tecnologías."
    }
  ];

  // Datos de ejemplo para "Calendario"
  calendarioData = [
    {
      nombre: "Encuentro de Cuerdas Andinas",
      lugar: "Tunja, Boyacá",
      publico: "Estudiantes de música, docentes y músicos tradicionales",
      costo: "$20.000 por día / $50.000 pase completo"
    },
    {
      nombre: "Festival de Jazz Colombiano",
      lugar: "Cali, Valle del Cauca",
      publico: "Amantes del jazz y música experimental",
      costo: "Entrada libre"
    },
    {
      nombre: "Concierto de Música Sacra",
      lugar: "Popayán, Cauca",
      publico: "Comunidad en general",
      costo: "$15.000 entrada general"
    },
    {
      nombre: "Muestra de Nuevos Talentos",
      lugar: "Barranquilla, Atlántico",
      publico: "Industria musical y medios de comunicación",
      costo: "Solo con invitación"
    }
  ];

  // Datos de ejemplo para "Noticias"
  noticiasData = [
    {
      fecha: "22 de julio de 2024",
      descripcion: "BitLab Comuna 13 inicia en Medellín",
      contenido: "El programa 'BitLab Comuna 13' inició esta semana en Medellín con la participación de 20 jóvenes artistas entre 16 y 24 años, quienes durante dos meses recibirán formación en producción, lírica y performance para crear un EP colectivo de hip hop. La iniciativa es liderada por la Secretaría de Cultura y colectivos locales."
    },
    {
      fecha: "18 de julio de 2024",
      descripcion: "Festival Petronio Álvarez anuncia artistas invitados",
      contenido: "El Festival de Música del Pacífico Petronio Álvarez reveló la lista de artistas internacionales que acompañarán las agrupaciones nacionales en su edición 2024. El evento se realizará del 16 al 19 de agosto en Cali."
    },
    {
      fecha: "15 de julio de 2024",
      descripcion: "Nueva convocatoria para músicos emergentes",
      contenido: "El Ministerio de Cultura abrió la convocatoria 'Nuevas Voces 2024' que beneficiará a 50 músicos emergentes de todo el país con recursos para la producción de su primer álbum profesional."
    },
    {
      fecha: "12 de julio de 2024",
      descripcion: "Concierto benéfico en el Teatro Colón",
      contenido: "La Orquesta Sinfónica Nacional realizará un concierto benéfico el próximo 25 de julio en el Teatro Colón de Bogotá. Los recursos recaudados irán destinados a la restauración de instrumentos musicales en escuelas rurales."
    }
  ];

  // Datos de ejemplo para el mapa de Colombia
  mapaMarkers: MapMarker[] = [
    {
      nombre: "Festival Vallenato de Valledupar",
      latitud: 10.4631,
      longitud: -73.2532,
      descripcion: "El festival más importante de música vallenata en Colombia, celebrado anualmente en abril.",
      categoria: "Festival"
    },
    {
      nombre: "Teatro Colón - Bogotá",
      latitud: 4.5981,
      longitud: -74.0758,
      descripcion: "Teatro nacional de Colombia, sede de importantes presentaciones de música clásica y ópera.",
      categoria: "Teatro"
    },
    {
      nombre: "Festival de Jazz de Mompox",
      latitud: 9.2372,
      longitud: -74.4274,
      descripcion: "Festival anual que combina jazz internacional con ritmos tradicionales del Caribe colombiano.",
      categoria: "Festival"
    },
    {
      nombre: "Casa de la Música - Medellín",
      latitud: 6.2442,
      longitud: -75.5812,
      descripcion: "Centro cultural dedicado a la promoción y formación musical en Antioquia.",
      categoria: "Centro Cultural"
    },
    {
      nombre: "Festival Petronio Álvarez - Cali",
      latitud: 3.4516,
      longitud: -76.5320,
      descripcion: "El festival de música del Pacífico más importante de Colombia.",
      categoria: "Festival"
    },
    {
      nombre: "Conservatorio del Tolima",
      latitud: 4.4389,
      longitud: -75.2322,
      descripcion: "Institución de educación superior especializada en música, con sede en Ibagué.",
      categoria: "Conservatorio"
    },
    {
      nombre: "Festival de la Leyenda Vallenata",
      latitud: 10.4631,
      longitud: -73.2532,
      descripcion: "Competencia nacional de acordeoneros y compositores vallenatos.",
      categoria: "Festival"
    },
    {
      nombre: "Teatro Municipal de Popayán",
      latitud: 2.4448,
      longitud: -76.6147,
      descripcion: "Teatro histórico que alberga el Festival de Música Religiosa de Popayán.",
      categoria: "Teatro"
    },
    {
      nombre: "Festival de Música de Cartagena",
      latitud: 10.3910,
      longitud: -75.4794,
      descripcion: "Festival internacional de música clásica en el marco histórico de Cartagena.",
      categoria: "Festival"
    },
    {
      nombre: "Fundación Nacional Batuta - Sede Principal",
      latitud: 4.6097,
      longitud: -74.0817,
      descripcion: "Organización que promueve la formación musical infantil y juvenil en Colombia.",
      categoria: "Fundación"
    },
    {
      nombre: "Festival de Música Andina de Tunja",
      latitud: 5.5353,
      longitud: -73.3678,
      descripcion: "Encuentro de músicos tradicionales andinos y folcloristas.",
      categoria: "Festival"
    },
    {
      nombre: "Casa de la Cultura - Barranquilla",
      latitud: 10.9639,
      longitud: -74.7964,
      descripcion: "Centro cultural que promueve las artes y la música caribeña.",
      categoria: "Centro Cultural"
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
    this.setupScrollAnimations();
  }

  /**
   * Configura animaciones al hacer scroll
   */
  private setupScrollAnimations(): void {
    if (typeof window !== 'undefined') {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-animate');
          }
        });
      }, observerOptions);

      // Observar todas las secciones
      setTimeout(() => {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
          observer.observe(section);
        });
      }, 100);
    }
  }

  /**
   * Navega suavemente a una sección
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
