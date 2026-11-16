import { useLayoutEffect, useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import './Contacto.css';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: '',
  });

  useLayoutEffect(() => {
    const section = document.getElementById('contacto-seccion');
    const form = section?.querySelector<HTMLFormElement>('.contacto__form');
    const assistant = section?.querySelector<HTMLElement>('.asistente__card');
    if (!section || !form || !assistant) return;

    const tabletLandscape = window.matchMedia(
      '(orientation: landscape) and (hover: none) and (pointer: coarse) and (min-width: 768px) and (max-width: 1080px) and (min-height: 768px) and (max-height: 800px)',
    );
    const panel = section.closest<HTMLElement>('.section-panel');
    const formWrapper = form.closest<HTMLElement>('.animate-fade-up');
    const assistantWrapper = assistant.closest<HTMLElement>('.animate-fade-up');
    let frameId = 0;
    let settleTimer = 0;

    const apply = () => {
      if (!tabletLandscape.matches) {
        form.style.removeProperty('height');
        form.style.removeProperty('justify-content');
        return;
      }

      const formRect = form.getBoundingClientRect();
      const assistantRect = assistant.getBoundingClientRect();
      const height = assistantRect.bottom - formRect.top;
      if (!(height > 0)) return;

      form.style.height = `${height.toFixed(2)}px`;
      form.style.justifyContent = 'space-between';
    };

    const schedule = (delay = 0) => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(() => {
          frameId = window.requestAnimationFrame(apply);
        });
      }, delay);
    };

    const handleResize = () => schedule(120);
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'transform') schedule(30);
    };

    const stateObserver = new MutationObserver(() => schedule(120));
    if (panel) stateObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
    [formWrapper, assistantWrapper].forEach((wrapper) => {
      if (!wrapper) return;
      stateObserver.observe(wrapper, { attributes: true, attributeFilter: ['class'] });
      wrapper.addEventListener('transitionend', handleTransitionEnd);
    });

    window.addEventListener('resize', handleResize);
    tabletLandscape.addEventListener('change', handleResize);
    document.fonts?.ready.then(() => schedule(120)).catch(() => undefined);
    schedule(750);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimer);
      stateObserver.disconnect();
      [formWrapper, assistantWrapper].forEach((wrapper) => {
        wrapper?.removeEventListener('transitionend', handleTransitionEnd);
      });
      window.removeEventListener('resize', handleResize);
      tabletLandscape.removeEventListener('change', handleResize);
      form.style.removeProperty('height');
      form.style.removeProperty('justify-content');
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div id="contacto" className="contacto-block">
      <div className="contacto__layout">
        <AnimatedSection delay={100}>
          <div className="contacto__info">
            <div className="contacto__info-card glass-card">
              <Mail size={24} />
              <h3>Email</h3>
              <p>
                <a href="mailto:edu_teclistaa@gmail.com">edu_teclistaa@gmail.com</a>
              </p>
            </div>
            <div className="contacto__info-card glass-card">
              <Phone size={24} />
              <h3>Teléfono</h3>
              <p>
                <a href="tel:+34635362694">+34 635362694</a>
              </p>
            </div>
          </div>
        </AnimatedSection>

        <address className="contacto__address glass-card">
          <MapPin className="contacto__address-icon" size={16} aria-hidden="true" />
          <p className="contacto__address-text">
            29680 Avenida de los Frutales
            <span className="contacto__address-sep" aria-hidden="true"> · </span>
            <strong>Estepona · Málaga.</strong>
          </p>
        </address>

        <AnimatedSection delay={200}>
          <form className="contacto__form glass-card" onSubmit={handleSubmit}>
            <div className="contacto__form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="contacto__form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="contacto__form-group">
              <label htmlFor="asunto">Asunto</label>
              <input
                type="text"
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                placeholder="Asunto de tu mensaje"
                required
              />
            </div>
            <div className="contacto__form-group">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe tu mensaje..."
                rows={5}
                required
              />
            </div>
            <button type="submit" className="contacto__submit">
              <Send size={18} />
              Enviar mensaje
            </button>
          </form>
        </AnimatedSection>
      </div>
    </div>
  );
}
