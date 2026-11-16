# Eduardo de la Osa - Web Personal

Web personal profesional que combina las facetas de música y tecnología.

## Instalación

```bash
npm install
```

## Ejecución

### Desarrollo
```bash
npm run dev
```
Abre `http://localhost:5173/` en el navegador.

### Compilación
```bash
npm run build
```

### Vista previa de producción
```bash
npm run preview
```

## Estructura del proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── Navbar.tsx     # Navegación fija con menú móvil
│   ├── Footer.tsx     # Pie de página
│   ├── AnimatedSection.tsx  # Wrapper de animación al scroll
│   └── PlaceholderImage.tsx # Placeholder para imágenes
├── sections/          # Secciones de la landing page
│   ├── Hero.tsx       # Inicio / portada
│   ├── SobreMi.tsx    # Biografía y trayectoria
│   ├── Trabajos.tsx   # Trabajos musicales con filtros
│   ├── DesarrolloWeb.tsx  # Proyectos digitales
│   ├── Resenas.tsx    # Testimonios
│   ├── Contacto.tsx   # Formulario de contacto
│   ├── AsistenteIA.tsx    # Asistente virtual
│   └── RedesSociales.tsx  # Iconos de redes
├── data/
│   └── siteData.ts    # TODOS los textos, proyectos, enlaces y datos configurables
├── hooks/
│   └── useScrollAnimation.ts  # Hook de animación por IntersectionObserver
├── styles/
│   └── global.css     # Variables CSS, colores, animaciones, utilidades
├── App.tsx            # Composición principal
└── main.tsx           # Punto de entrada
```

## Dónde colocar las fotografías

Todas las imágenes van en `public/images/`:

| Carpeta | Contenido |
|---------|-----------|
| `public/images/perfil/` | Fotografía principal (hero) |
| `public/images/sobre-mi/` | Fotografía personal y de biografía |
| `public/images/trabajos/jazz/` | Portadas de proyectos de jazz |
| `public/images/trabajos/flamenco-pop/` | Portadas de flamenco pop |
| `public/images/trabajos/pop/` | Portadas de pop |
| `public/images/trabajos/rock/` | Portadas de rock |
| `public/images/trabajos/clasico/` | Portadas de clásico |
| `public/images/desarrollo-web/` | Capturas de proyectos web |
| `public/images/redes-sociales/` | Imágenes para redes |

Archivos de audio y vídeo:
- `public/audio/` — Archivos de audio
- `public/video/` — Archivos de vídeo

## Dónde modificar textos, proyectos y enlaces

**Todo el contenido configurable se centraliza en `src/data/siteData.ts`.**

### Datos personales
Edita el objeto `profile`:
```ts
export const profile: SiteProfile = {
  name: 'Eduardo de la Osa',
  email: 'tu@email.com',
  location: 'Tu ciudad',
  // ...
};
```

### Estadísticas
Edita el array `stats`:
```ts
export const stats: StatItem[] = [
  { id: 'producciones', label: 'Producciones musicales', value: '50+' },
];
```

### Proyectos musicales
Añade entradas al array `workProjects`:
```ts
{
  id: 'mi-proyecto',
  title: 'Título del proyecto',
  description: 'Descripción breve',
  category: 'produccion', // produccion | composicion | arreglo | interpretacion
  genre: 'jazz',         // jazz | flamenco-pop | pop | rock | clasico
  image: '/images/trabajos/jazz/mi-proyecto.jpg',
  audioUrl: '/audio/mi-proyecto.mp3',
  externalUrl: 'https://...',
}
```

### Proyectos web
Añade entradas al array `webProjects`:
```ts
{
  id: 'mi-proyecto-web',
  name: 'Nombre del proyecto',
  description: 'Descripción',
  category: 'web',       // web | app | asistente-ia
  technologies: ['React', 'TypeScript'],
  features: ['Funcionalidad 1', 'Funcionalidad 2'],
  image: '/images/desarrollo-web/mi-proyecto.png',
  url: 'https://...',
}
```

### Testimonios
Añade entradas al array `testimonials`:
```ts
{
  id: 'testimonio-1',
  name: 'Nombre del autor',
  context: 'Proyecto o contexto',
  rating: 5,
  comment: 'Texto del testimonio',
}
```

### Redes sociales
Edita el array `socialLinks` con tus URLs reales:
```ts
{ platform: 'Instagram', url: 'https://instagram.com/tu-usuario', icon: 'instagram' }
```

### Preguntas del asistente
Edita el array `assistantQuestions`:
```ts
{
  id: 'q1',
  question: '¿Pregunta?',
  answer: 'Respuesta de demostración',
}
```

## Funcionalidades implementadas

- Navegación fija con menú hamburguesa en móvil/tablet
- Animaciones de aparición al scroll (IntersectionObserver)
- Portada con fotografía, nombre, roles, estadísticas y enlaces
- Sección "Sobre mí" con bloques de biografía, formación, experiencia
- Sección "Trabajos" con filtros por categoría y estilo musical
- Sección "Desarrollo Web" con filtros por categoría de proyecto
- Sección "Reseñas" preparada para testimonios
- Formulario de contacto (preparado para conexión funcional)
- Asistente virtual con preguntas expandibles
- Iconos de redes sociales con enlaces configurables
- Fondo con orbes luminosos animados
- Glassmorphism y efectos glow
- Responsive completo (móvil, tablet, escritorio)
- `prefers-reduced-motion` respetado

## Funcionalidades pendientes de conectar

- Envío real del formulario de contacto (backend o servicio)
- Conexión del asistente virtual con servicio de IA
- Sistema real de reservas
- Reproducción de audio y vídeo
- Almacenamiento de imágenes (CDN o similar)
- Pasarelas de pago si fueran necesarias

## Dependencias

- **react** / **react-dom** — UI
- **typescript** — Tipado
- **vite** — Build tool
- **lucide-react** — Iconografía
- **react-router-dom** — Instalado, disponible para futuras rutas
