import { profile, socialLinks } from '../data/siteData';
import SocialIcon from './SocialIcon';
import './SectionFooter.css';

const SECONDARY_NAV = [
  { label: 'Inicio', href: '#/inicio' },
  { label: 'Producciones', href: '#/producciones' },
  { label: 'Cursos', href: '#/cursos-online' },
  { label: 'Web', href: '#/diseno-web-inteligente' },
  { label: 'Contacto', href: '#/contacto' },
];

export default function SectionFooter() {
  return (
    <footer className="section-footer">
      <div className="section-footer__inner">
        <p className="section-footer__copyright">&copy; 2026 {profile.name}</p>

        <ul className="section-footer__social" aria-label="Redes sociales">
          {socialLinks.map((social) => (
            <li key={social.platform}>
              <a
                href={social.url || '#'}
                className="section-footer__social-link"
                aria-label={social.platform}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon icon={social.icon} size={16} monochrome />
              </a>
            </li>
          ))}
        </ul>

        <nav className="section-footer__nav" aria-label="NavegaciÃ³n secundaria">
          {SECONDARY_NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <p className="section-footer__rights">Todos los derechos reservados</p>

        <p className="section-footer__credit">
          Diseñado por <a href="#/inicio">{profile.name}</a>
        </p>
      </div>
    </footer>
  );
}

