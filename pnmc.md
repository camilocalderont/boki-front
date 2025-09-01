# PNMC Contexto

## Descripción

Estoy maquetando en angular 20 este prototipo del sistema llamado PNMC que es del ministerio de cultura y no tengo imágenes para maquetar los diferentes componentes del sistema, por ejemplo en la sección "Estoy Buscando" se puede ver que se requieren imagenes de artistas, músicos, etc. Igual en portafolio. Entonces quiero que me ayudes a encontrar un servicio gratuito que sirva imagenes aleatorias por categorías "que yo pueda elegir, por ejemplo: artistas, músicos, pintores" y que le pueda dar la resolución que necesito y simplemente sepueda maquetar de forma simple. He usado alguna vez servicios de ese estilo pero no lo recuerdo en el momento.


Para todas las secciones se puede ver que se necesita un arreglo de objetos con propiedades diferentes, que siempre tiene una imagen para mostrar en una tarjeta.

## Secciones

Por ejemplo para la sección "Estoy Buscando" el objeto sería:

[
  {
    "imagen": "https://laurl.de.la.imagen",
    "nombre": "Nombre de lo que se busca",
    "descripcion": "Descripción de lo que se busca"
  }
]

Para la sección "Portafolio" el objeto sería:

[
  {
    "imagen": "https://laurl.de.la.imagen",
    "nombre": "Elkin Melo",
    "descripcion": "Tipo de artista: Guitarrista y compositor",
    "Genero": "Rock instrumental con influencias del jazz y el blues",
    "Ciudad": "Bucaramanga, Santander"
  }
]

Para la sección "Proyectos" el objeto sería:

[
  {
    "imagen": "https://laurl.de.la.imagen",
    "nombre": "Proyecto 1",
    "lugar": "Cali, Valle del Cauca",
    "Fecha": "2024-01-01",
    "descripcion": "Descripción del proyecto 1"
  }
]

Para la sección "Calendario" el objeto sería:

[
  {
    "imagen": "https://laurl.de.la.imagen",
    "nombre": "Encuentro de Cuerdas Andinas",
    "lugar": "Tunja",
    "publico": "Estudiantes de música, docentes y músicos tradicionales",
    "costo": "$20.000 por día / $50.000 pase completo",
  }
]


Para la sección "Noticias" el objeto sería:


[
  {
    "imagen": "https://laurl.de.la.imagen",
    "fecha": "22 de julio de 2025",
    "descripcion": "Título de la noticia",
    "contenido": "El programa “BitLab Comuna 13” inició esta semana en Medellín con la participación de 20 jóvenes artistas entre 16 y 24 años, quienes durante dos meses recibirán formación en producción, lírica y performance para crear un EP colectivo de hip hop. La iniciativa es liderada por la Secretaría de Cultura y colectivos locales."
  }
]


Como ves la necesidad es crear un compomente en angular 20, que use tailwindcss para maquetar esas secciones de contenedores y nosotros en cada "sección" lo unico que hacemos es llamar el arreglo de objetos y maquetarlo de forma simple, el componente debe recibir el arreglo objetos e independientemente de los atributos de los objetos, debe desplegarlo en clave y valor, siendo la clave en negrita y el valor en un parrafo.

El objetivo es que me apoyes con el servicio gratuito para obtener imagenes aleatorias por categorias y que desarrolles el compomente de forma simple, incluso si lo puedes maquetar y lo puedo visualizar mucho mejor.

## Tareas

1. Crear un nuevo Dashboard para pnmc, que se base en /Users/camilocalderont/Proyectos/PERSONAL/boki-proxy/boki-front/src/app/dashboard/dashboard-layout pero con los siguientes detalles:

1.1. No debe tener sidebar lateral izquierdo.
1.2. El header tiene 3 secciones: logo en la parte superior izquierda, luego menú y luego botón de ingresar en la parte derecha.
1.3 El menú es horizontal, es un navbar los enlaces son de tipo anlca y tiene las siguientes opciones:
- Estoy Buscando #EstoyBuscando
- Portafolio #Portafolio
- Proyectos #Proyectos
- Mapa #Mapa
- Calendario #Calendario
- Noticias #Noticias

2. Crear un componente para mostrar los datos de las secciones mencionadas en el contexto, este componente debe ser reusable y debe recibir el arreglo objetos e independientemente de los atributos de los objetos, debe desplegarlo en clave y valor, siendo la clave en negrita y el valor en un parrafo.
2.1 Dependiendo de la pantalla debe mostrar el número de items por fila, si es grande (1920x1080) mostrar 4, si es mediano (1366x768) mostrar 3, si es pequeño (1024x768 o menos) mostrar 1.
2.2 El componente debe tener un botón de "Ver más" que me redirecciona a la página correspondiente, por el momento un ancla "#".
2.3 El componente debe tener mostrar o armar la imagen del objeto de forma dinámica por medio de un servicio como https://picsum.photos pero que permita poner categorias en este caso "artistas", "músicos", "pintores", en general temas artísticos, si no hay imagen, se debe mostrar una imagen de placeholder.

La carpeta principal debe ser /Users/camilocalderont/Proyectos/PERSONAL/boki-proxy/boki-front/src/app/dashboard-pnmc.
Los componentes deben ser ubicados en la carpeta: /Users/camilocalderont/Proyectos/PERSONAL/boki-proxy/boki-front/src/app/dashboard-pnmc/components.


3. Sección Mapa ✅ COMPLETADO
- ✅ Mapa interactivo con OpenStreetMap
- ✅ Zoom configurado para ver Colombia completa
- ✅ 12 marcadores de ejemplo con ubicaciones culturales reales
- ✅ Popups que muestran nombre, descripción y categoría
- ✅ Leaflet cargado dinámicamente (sin necesidad de instalación)
- ✅ Controles personalizados (zoom, vista completa, toggle marcadores)
- ✅ Panel lateral con lista de marcadores
- ✅ Diseño responsivo y accesible

Estructura de marcadores implementada:
[
  {
    "nombre": "Festival Vallenato de Valledupar",
    "latitud": 10.4631,
    "longitud": -73.2532,
    "descripcion": "El festival más importante de música vallenata en Colombia",
    "categoria": "Festival"
  }
]

