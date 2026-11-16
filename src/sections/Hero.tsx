import { useEffect, useRef } from 'react';
import SobreMiGallery from './SobreMi';
import SectionFooter from '../components/SectionFooter';
import './Hero.css';

export default function Hero() {
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const photo = photoRef.current;
    const text = textRef.current;
    if (!photo || !text) return;

    let frame = 0;
    const alignPhoto = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        photo.style.removeProperty('height');
        photo.style.removeProperty('margin-bottom');

        const desktop = window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)').matches;
        if (!desktop) return;

        const naturalHeight = photo.getBoundingClientRect().height;
        const naturalMarginBottom = parseFloat(getComputedStyle(photo).marginBottom) || 0;
        const textHeight = text.getBoundingClientRect().height;

        photo.style.height = `${textHeight}px`;
        photo.style.marginBottom = `${Math.max(0, naturalHeight + naturalMarginBottom - textHeight)}px`;
      });
    };

    alignPhoto();
    const observer = new ResizeObserver(alignPhoto);
    observer.observe(text);
    window.addEventListener('resize', alignPhoto);
    document.fonts?.ready.then(alignPhoto);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', alignPhoto);
      photo.style.removeProperty('height');
      photo.style.removeProperty('margin-bottom');
    };
  }, []);

  return (
    <section id="inicio" className="hero">
      <h2 className="hero__inicio-title">INICIO</h2>
      <span className="hero__portrait-rule hero__portrait-rule--top" aria-hidden="true" />
      <div className="hero__content container">
        <span id="sobre-mi" className="hero__anchor" aria-hidden="true" />

        <div className="hero__bio">
          <div ref={photoRef} className="hero__card hero__card--feature hero__bio-photo">
            <img
              className="hero__card-photo"
              src={encodeURI('/images/Autorretrato junto al piano digital.png')}
              alt="Retrato del músico junto al piano"
            />
          </div>

          <div ref={textRef} className="hero__bio-text">
            <p>
              Eduardo de la Osa es un compositor, pianista y productor musical español cuya
              trayectoria conecta la interpretación, la composición, la docencia y la producción
              musical. Inició su formación pianística de manera autodidacta, avanzando hacia una
              sólida preparación académica que culminó con la obtención del Título Superior de
              Composición Musical y Piano en el{' '}
              <a href="https://csmsevilla.es/" target="_blank" rel="noopener noreferrer">
                Conservatorio Superior de Música Manuel Castillo de Sevilla
              </a>
              . Especializado también en jazz, perfeccionó sus conocimientos con destacados músicos
              como Rafael Garcés y Arturo Serra, entre otros.
            </p>

            <p>
              Como intérprete, ha desarrollado su actividad en los ámbitos de la música clásica y el
              jazz, tanto como solista como integrante de grandes formaciones, entre ellas la{' '}
              <a href="https://www.andaluciabigband.com/" target="_blank" rel="noopener noreferrer">
                Andalucía Big Band
              </a>{' '}
              y las big bands de los conservatorios de Jerez de la Frontera, Granada y Sevilla. Su
              trayectoria incluye participaciones en televisión pública, grabaciones discográficas y
              giras de conciertos junto a diversos artistas del panorama nacional.
            </p>

            <p>
              Paralelamente, ha desarrollado una amplia actividad como compositor, arreglista y
              orquestador, participando en producciones musicales y bandas sonoras para cortometrajes
              y largometrajes. Desde 2008 ejerce la docencia en conservatorios oficiales de la Junta
              de Andalucía y plataformas de formación online, impartiendo materias como armonía,
              improvisación, jazz e informática musical. Su experiencia en tecnología musical ha
              favorecido su evolución hacia el desarrollo digital. Actualmente, compagina su actividad
              artística y docente con algunos proyectos de diseño y desarrollo web, especializado en
              la integración de asistentes de inteligencia artificial y soluciones digitales de
              gestión.
            </p>
          </div>
        </div>
      </div>

      <div className="inicio-stats" aria-label="Estadísticas profesionales">
        <div className="inicio-stat">
          <span className="inicio-stat__value">+30</span>
          <span className="inicio-stat__label">años de experiencia</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat__value">+1000</span>
          <span className="inicio-stat__label">actuaciones en directo</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat__value">+100</span>
          <span className="inicio-stat__label">arreglos musicales</span>
        </div>
        <div className="inicio-stat">
          <span className="inicio-stat__value">+500</span>
          <span className="inicio-stat__label">alumnos online</span>
        </div>
      </div>

      <SobreMiGallery />
      <SectionFooter />
      <span className="hero__portrait-rule hero__portrait-rule--bottom" aria-hidden="true" />
    </section>
  );
}


