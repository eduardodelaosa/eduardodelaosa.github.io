import { useCallback, useEffect } from 'react';
import type { ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Trabajos from './sections/Trabajos';
import CursosOnline from './sections/CursosOnline';
import DesarrolloWeb from './sections/DesarrolloWeb';
import ResenasContacto from './sections/ResenasContacto';

type SectionId = 'inicio' | 'trabajos' | 'cursos-online' | 'desarrollo-web' | 'contacto-seccion';

const SECTIONS: Array<{ id: SectionId; Component: ComponentType }> = [
  { id: 'inicio', Component: Hero },
  { id: 'trabajos', Component: Trabajos },
  { id: 'cursos-online', Component: CursosOnline },
  { id: 'desarrollo-web', Component: DesarrolloWeb },
  { id: 'contacto-seccion', Component: ResenasContacto },
];

const SECTION_ROUTES: Record<SectionId, string> = {
  inicio: '/inicio',
  trabajos: '/producciones',
  'cursos-online': '/cursos-online',
  'desarrollo-web': '/diseno-web-inteligente',
  'contacto-seccion': '/contacto',
};

const ROUTE_TO_SECTION: Record<string, SectionId> = {
  '/inicio': 'inicio',
  '/producciones': 'trabajos',
  '/cursos-online': 'cursos-online',
  '/diseno-web-inteligente': 'desarrollo-web',
  '/contacto': 'contacto-seccion',
};

const LEGACY_ROUTES: Record<string, string> = {
  '/': SECTION_ROUTES.inicio,
  '/sobre-mi': SECTION_ROUTES.inicio,
  '/trabajos': SECTION_ROUTES.trabajos,
  '/barra': SECTION_ROUTES.trabajos,
  '/desarrollo-web': SECTION_ROUTES['desarrollo-web'],
  '/contacto-seccion': SECTION_ROUTES['contacto-seccion'],
};

function normalizedRoute(pathname: string) {
  const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return LEGACY_ROUTES[cleanPath] ?? (ROUTE_TO_SECTION[cleanPath] ? cleanPath : SECTION_ROUTES.inicio);
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = normalizedRoute(location.pathname);
  const active = ROUTE_TO_SECTION[route] ?? 'inicio';

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const rawHash = window.location.hash;
    if (rawHash && !rawHash.startsWith('#/')) {
      navigate(normalizedRoute(`/${rawHash.slice(1)}`), { replace: true });
      return;
    }

    if (location.pathname !== route) {
      navigate(route, { replace: true });
    }
  }, [location, navigate, route]);

  useEffect(() => {
    const panel = document.querySelector<HTMLElement>(`.section-panel[data-section="${active}"]`);
    if (panel) panel.scrollTop = 0;
  }, [active]);

  const navigateSection = useCallback(
    (target: string) => {
      const nextRoute = target.startsWith('/')
        ? normalizedRoute(target)
        : SECTION_ROUTES[target as SectionId] ?? SECTION_ROUTES.inicio;

      navigate(nextRoute);
    },
    [navigate],
  );

  return (
    <>
      <Navbar onNavigate={navigateSection} />
      <main className="section-stack">
        {SECTIONS.map(({ id, Component }) => {
          const isActive = active === id;
          return (
            <div
              key={id}
              className={`section-panel${isActive ? ' is-active' : ''}`}
              data-section={id}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <Component />
            </div>
          );
        })}
      </main>
    </>
  );
}

