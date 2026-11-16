export interface SiteProfile {
  name: string;
  title: string;
  roles: string[];
  tagline: string;
  email: string;
  location: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
}

export interface WorkProject {
  id: string;
  title: string;
  description: string;
  category: WorkCategory;
  genre: WorkGenre;
  image?: string;
  audioUrl?: string;
  videoUrl?: string;
  externalUrl?: string;
}

export type WorkCategory = 'produccion' | 'composicion' | 'arreglo' | 'interpretacion';
export type WorkGenre = 'jazz' | 'flamenco-pop' | 'pop' | 'rock' | 'clasico';

export interface WebProject {
  id: string;
  name: string;
  description: string;
  category: WebCategory;
  technologies: string[];
  features: string[];
  image?: string;
  url?: string;
  highlight?: boolean;
}

export type WebCategory = 'web' | 'app' | 'asistente-ia';

export interface Testimonial {
  id: string;
  name: string;
  context: string;
  rating: number;
  comment: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface AssistantQuestion {
  id: string;
  question: string;
  answer: string;
  showSocial?: boolean;
}

export const profile: SiteProfile = {
  name: 'Eduardo de la Osa',
  title: 'Músico & Desarrollador Web',
  roles: ['Productor', 'Profesor', 'Desarrollador web', 'Pianista', 'Compositor'],
  tagline: 'Donde la música se encuentra con la tecnología',
  email: '',
  location: '',
};

export const stats: StatItem[] = [
  { id: 'producciones', label: 'Producciones musicales', value: '—' },
  { id: 'composiciones', label: 'Composiciones', value: '—' },
  { id: 'arreglos', label: 'Arreglos', value: '—' },
  { id: 'proyectos-digitales', label: 'Proyectos digitales', value: '—' },
];

export const workCategories: { key: WorkCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'produccion', label: 'Producciones' },
  { key: 'composicion', label: 'Composiciones' },
  { key: 'arreglo', label: 'Arreglos' },
  { key: 'interpretacion', label: 'Interpretaciones' },
];

export const workGenres: { key: WorkGenre | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'jazz', label: 'Jazz' },
  { key: 'flamenco-pop', label: 'Flamenco Pop' },
  { key: 'pop', label: 'Pop' },
  { key: 'rock', label: 'Rock' },
  { key: 'clasico', label: 'Clásico' },
];

export const workProjects: WorkProject[] = [
  {
    id: 'work-placeholder-1',
    title: 'Proyecto musical (próximamente)',
    description: 'Espacio reservado para tu próximo proyecto musical.',
    category: 'produccion',
    genre: 'jazz',
  },
];

export const webCategories: { key: WebCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'web', label: 'Páginas Web' },
  { key: 'app', label: 'Aplicaciones' },
  { key: 'asistente-ia', label: 'Asistentes IA' },
];

export const webProjects: WebProject[] = [
  {
    id: 'web-placeholder-1',
    name: 'Asistente IA — Información',
    description: 'Asistente de inteligencia artificial orientado a proporcionar información.',
    category: 'asistente-ia',
    technologies: ['React', 'TypeScript', 'IA'],
    features: ['Información automatizada', 'Interfaz conversacional'],
    highlight: true,
  },
  {
    id: 'web-placeholder-2',
    name: 'Asistente IA — Reservas',
    description: 'Asistente de inteligencia artificial orientado a la gestión de reservas.',
    category: 'asistente-ia',
    technologies: ['React', 'TypeScript', 'IA'],
    features: ['Sistema de reservas', 'Atención automatizada'],
    highlight: true,
  },
  {
    id: 'web-placeholder-3',
    name: 'Asistente IA — Chat',
    description: 'Asistente de inteligencia artificial orientado a la atención mediante chat.',
    category: 'asistente-ia',
    technologies: ['React', 'TypeScript', 'IA'],
    features: ['Chat en tiempo real', 'Respuestas inteligentes'],
    highlight: true,
  },
];

export const testimonials: Testimonial[] = [];

export const socialLinks: SocialLink[] = [
  { platform: 'Instagram', url: 'https://www.instagram.com/eduteclas81?cplk=MTltYjA5Y3h1Yjd1Ng==', icon: 'instagram' },
  { platform: 'Facebook', url: 'https://www.facebook.com/share/1CpYnwqKVP/', icon: 'facebook' },
  { platform: 'YouTube', url: 'https://youtube.com/@edudelaosa7469?si=-vKhddi-Ssxtjq-e', icon: 'youtube' },
  { platform: 'WhatsApp', url: 'https://wa.me/34635362694', icon: 'whatsapp' },
];

export const assistantQuestions: AssistantQuestion[] = [
  {
    id: 'q1',
    question: '¿Qué arreglos realiza Eduardo?',
    answer:
      'Eduardo realiza arreglos musicales personalizados, adaptados a las características y necesidades de cada proyecto. Estos trabajos pueden incluir mejoras en la estructura de las canciones, rearmonizaciones, cambios de instrumentación, orquestaciones y arreglos para piano solo. El objetivo es aportar nuevas posibilidades musicales a cada composición, respetando siempre su esencia y estilo original.',
  },
  {
    id: 'q2',
    question: '¿Qué estilos musicales trabaja?',
    answer:
      'Eduardo trabaja con una amplia variedad de estilos musicales, entre ellos pop, flamenco, música clásica, rock, jazz, soul, blues y latin jazz. También realiza trabajos relacionados con bandas sonoras y música para diferentes formatos audiovisuales, adaptándose siempre a las características y necesidades de cada proyecto.',
  },
  {
    id: 'q3',
    question: '¿Utiliza instrumentos reales o virtuales?',
    answer:
      'Depende de las características y del presupuesto de cada proyecto. Eduardo puede contar con músicos profesionales para realizar grabaciones con instrumentos reales o encargarse personalmente de toda la producción utilizando instrumentos virtuales y librerías de sonido profesionales de gran realismo.\n\nPuedes contactar con Eduardo para escuchar ejemplos de sus producciones realizadas con ambas opciones.',
  },
  {
    id: 'q4',
    question: '¿Qué precio tienen los arreglos?',
    answer:
      'El precio depende de la duración, la complejidad y la instrumentación necesaria. No requiere el mismo trabajo un arreglo para tres instrumentos que una producción grande con banda base y orquesta sinfónica. Eduardo ofrece presupuestos personalizados según las características y necesidades de cada proyecto.',
  },
  {
    id: 'q5',
    question: '¿Cómo son los cursos y clases online?',
    answer:
      'Las clases se realizan mediante Zoom y plataformas especializadas como Lessonspace. Se utilizan herramientas de audio, vídeo y visualización musical que permiten mostrar el piano y representar gráficamente las notas y acordes interpretados, resaltando las teclas en pantalla en tiempo real. Eduardo proporciona todos los materiales didácticos, partituras y ejercicios necesarios.\n\nLa programación de los cursos varía durante el año según la temática, el estilo musical y la duración de cada formación. Para conocer las próximas convocatorias y fechas de inicio, puedes seguir a Eduardo en sus redes sociales, donde se publicarán las novedades.',
    showSocial: true,
  },
  {
    id: 'q6',
    question: '¿Puede Eduardo diseñar mi web?',
    answer:
      '¡Por supuesto! Eduardo diseña páginas web personalizadas para artistas, músicos, empresas, profesionales y todo tipo de entidades. Tanto si necesitas crear una web desde cero como renovar una que se ha quedado desactualizada, cada proyecto se adapta a tus necesidades, identidad y preferencias, buscando un diseño atractivo, funcional y adaptado a todos los dispositivos.',
  },
  {
    id: 'q7',
    question: '¿Qué precio tiene una web con asistente IA?',
    answer:
      'El precio depende de las características de cada proyecto: número de secciones, diseño de la web y funcionalidades del asistente IA. Estos asistentes pueden ofrecer información sobre servicios, precios, tratamientos y horarios, resolver dudas o incorporar funciones específicas como la gestión de reservas y citas.\n\nPara ofrecerte un presupuesto ajustado, lo mejor es contactar con Eduardo y estudiar las necesidades de tu negocio o proyecto.',
  },
];

export const navLinks = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'trabajos', label: 'Trabajos' },
  { id: 'desarrollo-web', label: 'Diseño web inteligente' },
  { id: 'resenas', label: 'Reseñas' },
  { id: 'contacto', label: 'Contacto' },
];
