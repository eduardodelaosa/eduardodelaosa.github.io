import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { profile, socialLinks } from '../data/siteData';
import SocialIcon from './SocialIcon';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Inicio', target: '/inicio' },
  { label: 'Producciones', target: '/producciones' },
  { label: 'Cursos online', target: '/cursos-online' },
  { label: 'Diseño web inteligente', target: '/diseno-web-inteligente' },
  { label: 'Contacto', target: '/contacto' },
];

type NavbarProps = {
  onNavigate?: (target: string) => void;
};

export default function Navbar({ onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (event: Event) => {
      const target = event.target;
      const offset =
        target instanceof HTMLElement && target.classList.contains('section-panel')
          ? target.scrollTop
          : window.scrollY;
      setScrolled(offset > 40);
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  useEffect(() => {
    const resetScrolled = () => setScrolled(false);
    window.addEventListener('hashchange', resetScrolled);
    window.addEventListener('popstate', resetScrolled);
    return () => {
      window.removeEventListener('hashchange', resetScrolled);
      window.removeEventListener('popstate', resetScrolled);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    setScrolled(false);
    if (onNavigate) {
      onNavigate(id);
      return;
    }
    const sectionId: Record<string, string> = {
      '/inicio': 'inicio',
      '/producciones': 'trabajos',
      '/cursos-online': 'cursos-online',
      '/diseno-web-inteligente': 'desarrollo-web',
      '/contacto': 'contacto-seccion',
    };
    const el = document.getElementById(sectionId[id] ?? id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="navigation" aria-label="NavegaciÃ³n principal">
      <div className="navbar__container container">
        <a
          href="#/inicio"
          className="navbar__logo"
          onClick={(e) => { e.preventDefault(); handleNavClick('/inicio'); }}
        >
          <span className="navbar__logo-mark">{profile.name.charAt(0)}</span>
          <span className="navbar__logo-text">{profile.name}</span>
        </a>

        <ul className="navbar__links" role="menubar">
          {NAV_ITEMS.map((item) => (
            <li key={item.label} role="none">
              <a
                href={`#${item.target}`}
                role="menuitem"
                onClick={(e) => { e.preventDefault(); handleNavClick(item.target); }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__social">
          {socialLinks.map((s) => (
            <a
              key={s.platform}
              href={s.url || '#'}
              className={`navbar__social-link navbar__social-link--${s.icon}`}
              aria-label={s.platform}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon icon={s.icon} />
            </a>
          ))}
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Cerrar menÃº' : 'Abrir menÃº'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`navbar__mobile ${isOpen ? 'navbar__mobile--open' : ''}`}>
        <ul className="navbar__mobile-links">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={`#${item.target}`}
                onClick={(e) => { e.preventDefault(); handleNavClick(item.target); }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="navbar__mobile-social">
          {socialLinks.map((s) => (
            <a
              key={s.platform}
              href={s.url || '#'}
              className={`navbar__mobile-social-link navbar__mobile-social-link--${s.icon}`}
              aria-label={s.platform}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialIcon icon={s.icon} />
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}


