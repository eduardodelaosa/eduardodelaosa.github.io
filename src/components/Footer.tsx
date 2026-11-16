import { Heart } from 'lucide-react';
import { profile, socialLinks } from '../data/siteData';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__container">
        <div className="footer__brand">
          <span className="footer__name">{profile.name}</span>
          <span className="footer__tagline">{profile.tagline}</span>
        </div>
        <div className="footer__social">
          {socialLinks.map((s) => (
            <a
              key={s.platform}
              href={s.url || '#'}
              className="footer__social-link"
              aria-label={s.platform}
              target="_blank"
              rel="noopener noreferrer"
            >
              {s.platform}
            </a>
          ))}
        </div>
        <div className="footer__bottom">
          <p>
            Hecho con <Heart size={14} className="footer__heart" /> &copy; {new Date().getFullYear()} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
