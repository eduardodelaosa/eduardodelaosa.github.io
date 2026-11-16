import { useEffect } from 'react';
import AnimatedSection from '../components/AnimatedSection';
import SectionFooter from '../components/SectionFooter';
import Contacto from './Contacto';
import AsistenteIA from './AsistenteIA';
import './ResenasContacto.css';

export default function ResenasContacto() {
  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 768px) and (max-width: 1080px) and (min-height: 1000px) and (orientation: portrait)',
    );
    const log = () => {
      if (!media.matches || !import.meta.env.DEV) return;
      const intro = document.querySelector<HTMLElement>('#contacto-seccion .final-section__intro');
      if (!intro) return;
      const paragraphs = Array.from(intro.querySelectorAll<HTMLElement>('p'));
      const first = paragraphs[0]?.getBoundingClientRect();
      const last = paragraphs[paragraphs.length - 1]?.getBoundingClientRect();
      console.info('[Contacto/tablet-vertical] Tarjeta visual eliminada y texto ampliado', {
        intro: intro.getBoundingClientRect(),
        textHeight: last && first ? last.bottom - first.top : 0,
        fontSize: getComputedStyle(intro).fontSize,
        lineHeight: getComputedStyle(intro).lineHeight,
        background: getComputedStyle(intro).backgroundImage,
        border: getComputedStyle(intro).borderTopWidth,
        boxShadow: getComputedStyle(intro).boxShadow,
      });
    };
    const timer = window.setTimeout(log, 950);
    window.addEventListener('resize', log);
    media.addEventListener('change', log);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', log);
      media.removeEventListener('change', log);
    };
  }, []);

  return (
    <section id="contacto-seccion" className="final-section section">
      <div className="container">
        <AnimatedSection>
          <div className="section-header final-section__header">
            <h2 className="section-title">Contacto</h2>
            <p className="section-subtitle">¿Tienes un proyecto en mente? Hablemos.</p>
          </div>
          <div className="final-section__intro">
            <p>
              Este espacio está abierto a nuevas ideas, proyectos y colaboraciones, tanto en el ámbito
              musical como en el educativo y tecnológico. Cada propuesta representa una oportunidad para
              desarrollar algo único, aportar experiencia y encontrar soluciones adaptadas a cada
              necesidad.
            </p>
            <p>
              Puedes ponerte en contacto conmigo para encargos de composición, arreglos y orquestaciones,
              así como para la creación de piezas y proyectos musicales personalizados y trabajos por
              encargo. También atiendo solicitudes relacionadas con clases particulares, formación musical
              e información sobre cursos online.
            </p>
            <p>
              En el ámbito digital, estoy abierto a colaborar en proyectos de diseño y desarrollo de
              páginas web, creación de asistentes inteligentes y soluciones tecnológicas orientadas a
              facilitar la comunicación, la gestión y la atención al cliente.
            </p>
            <p>
              Será un placer conocer nuevas propuestas, estudiar cada proyecto y aportar mi experiencia,
              creatividad y conocimientos para convertir las ideas en resultados.
            </p>
            <p>
              <strong>
                Para cualquier consulta, propuesta profesional o colaboración, puedes contactar conmigo a
                través de los medios disponibles en esta página.
              </strong>
            </p>
          </div>
        </AnimatedSection>

        <div className="final-section__inner">
          <div className="final-section__col">
            <Contacto />
          </div>
          <div className="final-section__col">
            <AsistenteIA />
          </div>
        </div>

        <div className="contacto-stats" aria-label="Estadísticas profesionales">
          <div className="contacto-stat">
            <span className="contacto-stat__value">+30</span>
            <span className="contacto-stat__label">años de experiencia</span>
          </div>
          <div className="contacto-stat">
            <span className="contacto-stat__value">+1000</span>
            <span className="contacto-stat__label">actuaciones en directo</span>
          </div>
          <div className="contacto-stat">
            <span className="contacto-stat__value">+100</span>
            <span className="contacto-stat__label">arreglos musicales</span>
          </div>
          <div className="contacto-stat">
            <span className="contacto-stat__value">+500</span>
            <span className="contacto-stat__label">alumnos online</span>
          </div>
        </div>
      </div>
      <SectionFooter />
    </section>
  );
}
