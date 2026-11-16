import AnimatedSection from '../components/AnimatedSection';
import SectionFooter from '../components/SectionFooter';
import { useLayoutEffect, useState } from 'react';
import './DesarrolloWeb.css';

const webProjectTitles = [
  'Página web del bar y restaurante Ruta 66 Sevilla',
  'Web con asistente IA para información y reservas',
  'Aplicación - Cuaderno docente con asistente IA',
];

const cuadernoDocenteImage = encodeURI('/images/Cuaderno Docente con asistente IA.png');

const introParagraphs = [
  'Mi trayectoria profesional ha estado siempre vinculada a la música, la creatividad y la tecnología. Mi formación como compositor y productor musical me llevó a profundizar en la informática musical, las herramientas digitales y el desarrollo de soluciones tecnológicas aplicadas a la producción y la creación artística. Esta experiencia permitió ampliar mis conocimientos hacia otros ámbitos del desarrollo digital.',
  'Con el tiempo, ese interés por la tecnología y la innovación fue evolucionando hacia el diseño y desarrollo web, incorporando nuevas herramientas y asistentes inteligentes. Hoy aplico esa experiencia para crear páginas web y desarrollar asistentes conversacionales capaces de ofrecer información, atender consultas y gestionar reservas, combinando creatividad, funcionalidad y tecnología.',
];

export default function DesarrolloWeb() {
  const [cuadernoZoomed, setCuadernoZoomed] = useState(false);

  useLayoutEffect(() => {
    const section = document.getElementById('desarrollo-web');
    const panel = section?.closest<HTMLElement>('.section-panel');
    const footer = section?.querySelector<HTMLElement>('.section-footer');
    const cards = section
      ? Array.from(section.querySelectorAll<HTMLElement>('.desarrollo-web__card'))
      : [];
    const lastCard = cards[cards.length - 1];

    if (!section || !panel || !footer || !lastCard) return;

    const tabletPortrait = window.matchMedia(
      '(min-width: 768px) and (max-width: 1080px) and (orientation: portrait)',
    );
    const container = section.querySelector<HTMLElement>(':scope > .container');
    let frameId = 0;
    let settleTimer = 0;
    let lastDividerLog = '';

    const measure = () => {
      settleTimer = 0;

      if (!tabletPortrait.matches) {
        section.style.removeProperty('--dw-scroll-pad');
        return;
      }

      if (import.meta.env.DEV && container) {
        const divider = getComputedStyle(container, '::after');
        const signature = `${window.innerWidth}x${window.innerHeight}:${divider.content}`;
        if (signature !== lastDividerLog) {
          lastDividerLog = signature;
          console.info('[DesarrolloWeb/tablet-vertical] Línea decorativa eliminada', {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            content: divider.content,
            display: divider.display,
            height: divider.height,
            boxShadow: divider.boxShadow,
          });
        }
      }

      const wrapper = lastCard.closest<HTMLElement>('.animate-fade-up');
      let offsetY = 0;
      if (wrapper) {
        const matrix = /matrix\(([^)]+)\)/.exec(getComputedStyle(wrapper).transform);
        if (matrix) offsetY = Number.parseFloat(matrix[1].split(',')[5]) || 0;
      }

      const panelRect = panel.getBoundingClientRect();
      const stripTop = footer.getBoundingClientRect().top;
      const maxScroll = panel.scrollHeight - panel.clientHeight;
      const cardRect = lastCard.getBoundingClientRect();
      const contentCardBottom = cardRect.bottom - offsetY - panelRect.top + panel.scrollTop;
      const cardBottomAtEnd = panelRect.top + contentCardBottom - maxScroll;
      const gap = stripTop - cardBottomAtEnd;
      const currentPad =
        Number.parseFloat(getComputedStyle(section).getPropertyValue('--dw-scroll-pad')) || 0;
      const nextPad = Math.max(0, currentPad + (20 - gap));

      if (Math.abs(nextPad - currentPad) > 0.05) {
        section.style.setProperty('--dw-scroll-pad', `${nextPad.toFixed(2)}px`);
      }
    };

    const schedule = (delay = 0) => {
      window.clearTimeout(settleTimer);
      window.cancelAnimationFrame(frameId);
      settleTimer = window.setTimeout(() => {
        frameId = window.requestAnimationFrame(measure);
      }, delay);
    };

    const handleViewportChange = () => {
      if (!tabletPortrait.matches) {
        section.style.removeProperty('--dw-scroll-pad');
        return;
      }
      schedule(120);
    };

    window.addEventListener('resize', handleViewportChange);
    tabletPortrait.addEventListener('change', handleViewportChange);
    document.fonts?.ready.then(() => schedule(250)).catch(() => undefined);
    const settle = window.setTimeout(() => schedule(0), 600);
    schedule(0);

    return () => {
      window.clearTimeout(settleTimer);
      window.clearTimeout(settle);
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleViewportChange);
      tabletPortrait.removeEventListener('change', handleViewportChange);
      section.style.removeProperty('--dw-scroll-pad');
    };
  }, []);

  return (
    <section id="desarrollo-web" className="desarrollo-web section">
      <div className="container">
        <AnimatedSection>
          <div className="section-header">
            <h2 className="section-title">Diseño web inteligente</h2>
            <p className="section-subtitle">Diseño, innovación y soluciones inteligentes</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={80} className="desarrollo-web__intro-wrap">
          <div className="desarrollo-web__intro">
            <div className="desarrollo-web__intro-text">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <div className="desarrollo-web__grid">
          {webProjectTitles.map((title, index) => (
            <AnimatedSection key={Array.isArray(title) ? title.join(' ') : title} delay={160 + index * 100}>
              <article className="desarrollo-web__card">
                <div className="desarrollo-web__card-frame" aria-hidden={index === 2 ? true : undefined}>
                  {index === 0 ? (
                    <iframe
                      className="desarrollo-web__card-video"
                      src="https://www.youtube.com/embed/FxlEu3f4t6M"
                      title="Vídeo de la página web del bar y restaurante Ruta 66 Sevilla"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : index === 1 ? (
                    <iframe
                      className="desarrollo-web__card-video"
                      src="https://www.youtube.com/embed/t2m3O05mZ_g"
                      title="Vídeo del chat con asistente IA para información y reservas"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : index === 2 ? (
                    <img
                      className={`desarrollo-web__card-photo${cuadernoZoomed ? ' is-zoomed' : ''}`}
                      src={cuadernoDocenteImage}
                      alt=""
                      onClick={() => setCuadernoZoomed((zoomed) => !zoomed)}
                    />
                  ) : (
                    <span className="desarrollo-web__card-scan" />
                  )}
                </div>
                <h3 className="desarrollo-web__card-title">
                  {Array.isArray(title) ? (
                    <>
                      {title[0]}
                      {' '}
                      <br />
                      {title[1]}
                    </>
                  ) : (
                    title
                  )}
                </h3>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
      <SectionFooter />
    </section>
  );
}
