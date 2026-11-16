import AnimatedSection from '../components/AnimatedSection';
import SectionFooter from '../components/SectionFooter';
import { useLayoutEffect } from 'react';
import { socialLinks } from '../data/siteData';
import './CursosOnline.css';

const cursosImage = encodeURI('/images/Clase de piano_ progresión II–V–I.png');
const cursosVideo1 = 'https://www.youtube.com/embed/p12kDKKSa4w';
const cursosVideo2 = 'https://www.youtube.com/embed/1ktDlchLVZM';
const youtubeChannelUrl =
  socialLinks.find((link) => link.platform === 'YouTube')?.url ??
  'https://www.youtube.com/@edudelaosa7469';

export default function CursosOnline() {
  useLayoutEffect(() => {
    const section = document.getElementById('cursos-online');
    const feature = section?.querySelector<HTMLElement>('.cursos__feature');
    const media = feature?.querySelector<HTMLElement>('.cursos__feature-left');
    const button = feature?.querySelector<HTMLElement>('.cursos__channel');
    const objective = feature?.querySelector<HTMLElement>('.cursos__topic:nth-child(4)');
    const footer = section?.querySelector<HTMLElement>('.section-footer');
    const panel = section?.closest<HTMLElement>('.section-panel');
    const animationWrapper = feature?.closest<HTMLElement>('.animate-fade-up');
    const topics = Array.from(feature?.querySelectorAll<HTMLElement>('.cursos__topic') ?? []);
    const mediaBlocks = Array.from(media?.children ?? []).filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );

    if (!feature || !media || !button || !objective || !footer || !panel || !animationWrapper) return;
    if (topics.length < 4 || mediaBlocks.length < 3) return;

    const tabletPortrait = window.matchMedia(
      '(min-width: 768px) and (max-width: 1080px) and (orientation: portrait)',
    );
    let frameId = 0;
    let settleTimer = 0;
    let appliedKey = '';

    const resetWidth = () => {
      media.style.removeProperty('width');
    };

    const resetTypography = () => {
      topics.slice(0, 3).forEach((topic) => {
        topic.style.removeProperty('font-size');
        topic.style.removeProperty('margin-top');
        topic.querySelectorAll<HTMLElement>('h3').forEach((title) => {
          title.style.removeProperty('margin-bottom');
        });
        topic.querySelectorAll<HTMLElement>('.cursos__text').forEach((text) => {
          text.style.removeProperty('line-height');
          text.style.removeProperty('transform');
        });
      });
      objective.style.removeProperty('margin-top');
    };

    const reset = () => {
      resetWidth();
      resetTypography();
      button.style.removeProperty('bottom');
    };

    const isReady = () =>
      tabletPortrait.matches &&
      panel.classList.contains('is-active') &&
      animationWrapper.classList.contains('visible');

    const apply = () => {
      if (!tabletPortrait.matches) {
        reset();
        appliedKey = '';
        return;
      }
      if (!isReady()) return;

      const key = `${window.innerWidth}x${window.innerHeight}`;
      if (key === appliedKey) return;

      reset();

      for (let pass = 0; pass < 4; pass += 1) {
        const stripTop = footer.getBoundingClientRect().top;
        const buttonRect = button.getBoundingClientRect();
        const delta = buttonRect.bottom - (stripTop - 30);
        if (Math.abs(delta) < 0.05) break;
        const bottom = Number.parseFloat(getComputedStyle(button).bottom) || 0;
        button.style.bottom = `${bottom + delta}px`;
      }

      const minimumGap = 20;
      const overlaps = () =>
        objective.getBoundingClientRect().bottom >
        button.getBoundingClientRect().top - minimumGap;

      if (overlaps()) {
        const featureWidth = feature.getBoundingClientRect().width;
        let low = featureWidth * 0.36;
        let high = media.getBoundingClientRect().width;

        media.style.width = `${low}px`;
        if (!overlaps()) {
          media.style.width = `${high}px`;
          for (let pass = 0; pass < 12; pass += 1) {
            const mid = (low + high) / 2;
            media.style.width = `${mid}px`;
            if (overlaps()) high = mid;
            else low = mid;
          }
          media.style.width = `${low}px`;
        } else {
          media.style.width = `${high}px`;
        }
      }

      const baseObjectiveTop = objective.getBoundingClientRect().top;
      const group = topics.slice(0, 3);
      const titles = group.map((topic) => topic.querySelector<HTMLElement>('h3')!);
      const texts = group.map((topic) => topic.querySelector<HTMLElement>('.cursos__text')!);
      const textTop = titles[0].getBoundingClientRect().top;
      const textBottomTarget = mediaBlocks[mediaBlocks.length - 1].getBoundingClientRect().bottom;
      const available = textBottomTarget - textTop;
      const baseTitleGaps = titles.map(
        (title) => Number.parseFloat(getComputedStyle(title).marginBottom) || 0,
      );
      const baseTopicGaps = [0, ...group.slice(1).map(
        (topic) => Number.parseFloat(getComputedStyle(topic).marginTop) || 0,
      )];

      const setLineHeight = (value: number) => {
        texts.forEach((text) => {
          text.style.lineHeight = `${value}`;
        });
      };

      const setMargins = (extra: number) => {
        const titleWeight = 0.5;
        const topicWeight = 1.5;
        const totalWeight = titles.length * titleWeight + (group.length - 1) * topicWeight;
        titles.forEach((title, index) => {
          title.style.marginBottom = `${(baseTitleGaps[index] + (extra * titleWeight) / totalWeight).toFixed(2)}px`;
        });
        group.slice(1).forEach((topic, index) => {
          topic.style.marginTop = `${(baseTopicGaps[index + 1] + (extra * topicWeight) / totalWeight).toFixed(2)}px`;
        });
      };

      const measure = () =>
        texts[texts.length - 1].getBoundingClientRect().bottom -
        titles[0].getBoundingClientRect().top;

      const maxLineHeight = 1.6;
      let lineHeight = maxLineHeight;
      setLineHeight(lineHeight);

      if (measure() > available) {
        let lineLow = 1;
        let lineHigh = maxLineHeight;
        for (let pass = 0; pass < 20; pass += 1) {
          const mid = (lineLow + lineHigh) / 2;
          setLineHeight(mid);
          if (measure() < available) lineLow = mid;
          else lineHigh = mid;
        }
        lineHeight = (lineLow + lineHigh) / 2;
        setLineHeight(lineHeight);
      }

      const extra = Math.max(0, available - measure());
      if (extra > 0) setMargins(extra);

      for (let pass = 0; pass < 3; pass += 1) {
        const residual = available - measure();
        if (Math.abs(residual) <= 0.005) break;
        const lastTopic = group[group.length - 1];
        const currentGap = Number.parseFloat(getComputedStyle(lastTopic).marginTop) || 0;
        lastTopic.style.marginTop = `${Math.max(0, currentGap + residual)}px`;
      }

      const referenceGap = texts[1].getBoundingClientRect().top - titles[1].getBoundingClientRect().bottom;
      const improvedGapBefore = titles[2].getBoundingClientRect().top - texts[1].getBoundingClientRect().bottom;
      for (let pass = 0; pass < 4; pass += 1) {
        const currentGap = titles[2].getBoundingClientRect().top - texts[1].getBoundingClientRect().bottom;
        const delta = currentGap - referenceGap;
        if (Math.abs(delta) <= 0.01) break;
        const currentMargin = Number.parseFloat(getComputedStyle(group[2]).marginTop) || 0;
        group[2].style.marginTop = `${Math.max(0, currentMargin - delta)}px`;
      }

      objective.style.marginTop = '0px';
      for (let pass = 0; pass < 3; pass += 1) {
        const top = objective.getBoundingClientRect().top;
        const current = Number.parseFloat(getComputedStyle(objective).marginTop) || 0;
        const delta = baseObjectiveTop - top;
        if (Math.abs(delta) < 0.1) break;
        objective.style.marginTop = `${Math.max(0, current + delta)}px`;
      }

      if (import.meta.env.DEV) {
        console.info(
          '[CursosOnline/tablet-vertical] Diagnóstico: el bucle requestAnimationFrame y ResizeObserver reescribían estilos de texto durante el render. Solución: cálculo único tras la transición y solo al cambiar viewport/orientación.',
          {
            key,
            fontSize: getComputedStyle(topics[0]).fontSize,
            lineHeight: getComputedStyle(topics[0].querySelector('.cursos__text')!).lineHeight,
            leftTop: textTop,
            leftBottom: textBottomTarget,
            leftHeight: available,
            textHeight: measure(),
            textBottom: topics[2].querySelector('.cursos__text')!.getBoundingClientRect().bottom,
            thirdMediaBottom: mediaBlocks[mediaBlocks.length - 1].getBoundingClientRect().bottom,
            topDelta: Number((titles[0].getBoundingClientRect().top - mediaBlocks[0].getBoundingClientRect().top).toFixed(3)),
            bottomDelta: Number((topics[2].querySelector('.cursos__text')!.getBoundingClientRect().bottom - textBottomTarget).toFixed(3)),
            objectiveTop: objective.getBoundingClientRect().top,
          },
        );
        const finalGap = titles[2].getBoundingClientRect().top - texts[1].getBoundingClientRect().bottom;
        console.info('[CursosOnline/tablet-vertical] IMPROVISACIÓN Y ACOMPAÑAMIENTO desplazado', {
          key,
          referenceGap: Number(referenceGap.toFixed(3)),
          gapBefore: Number(improvedGapBefore.toFixed(3)),
          finalGap: Number(finalGap.toFixed(3)),
          movedUp: Number((improvedGapBefore - finalGap).toFixed(3)),
          objectiveTopDelta: Number((objective.getBoundingClientRect().top - baseObjectiveTop).toFixed(3)),
        });
      }
      appliedKey = key;
    };

    const schedule = (delay = 700) => {
      window.clearTimeout(settleTimer);
      window.cancelAnimationFrame(frameId);
      settleTimer = window.setTimeout(() => {
        if (!isReady()) return;
        frameId = window.requestAnimationFrame(() => {
          frameId = window.requestAnimationFrame(apply);
        });
      }, delay);
    };

    const handleViewportChange = () => {
      if (!tabletPortrait.matches) {
        reset();
        appliedKey = '';
        window.clearTimeout(settleTimer);
        window.cancelAnimationFrame(frameId);
        return;
      }
      const viewportKey = `${window.innerWidth}x${window.innerHeight}`;
      if (viewportKey !== appliedKey) {
        appliedKey = '';
        schedule(120);
      }
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target === animationWrapper && event.propertyName === 'transform') schedule(0);
    };

    const stateObserver = new MutationObserver(() => {
      if (isReady()) schedule();
    });
    stateObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
    stateObserver.observe(animationWrapper, { attributes: true, attributeFilter: ['class'] });
    animationWrapper.addEventListener('transitionend', handleTransitionEnd);

    window.addEventListener('resize', handleViewportChange);
    tabletPortrait.addEventListener('change', handleViewportChange);
    document.fonts?.ready.then(() => {
      if (isReady()) schedule();
    }).catch(() => undefined);
    if (isReady()) schedule();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimer);
      stateObserver.disconnect();
      animationWrapper.removeEventListener('transitionend', handleTransitionEnd);
      window.removeEventListener('resize', handleViewportChange);
      tabletPortrait.removeEventListener('change', handleViewportChange);
      reset();
    };
  }, []);

  return (
    <section id="cursos-online" className="cursos section">
      <div className="container">
        <AnimatedSection>
          <div className="section-header">
            <h2 className="section-title">CURSOS Y CLASES ONLINE</h2>
            <p className="section-subtitle">Formación musical especializada</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <article className="cursos__feature">
            <div className="cursos__feature-left">
              <div className="cursos__feature-video">
                <iframe
                  src={cursosVideo1}
                  title="Vídeo de clase online de piano y armonía"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <figure className="cursos__feature-media">
                <img
                  src={cursosImage}
                  alt="Clase online de piano, armonía y repertorio: progresión II–V–I"
                />
              </figure>

              <div className="cursos__feature-video">
                <iframe
                  src={cursosVideo2}
                  title="Vídeo de clase online de piano y armonía"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="cursos__feature-copy">
              <div className="cursos__feature-inner">
                <section className="cursos__topic">
                  <h3>Formación musical</h3>
                  <p className="cursos__text">
                    En ocasiones, imparto clases y cursos online adaptados a diferentes niveles, intereses y objetivos. La metodología combina el conocimiento teórico con su aplicación práctica, buscando que cada concepto pueda comprenderse, interiorizarse y trasladarse a la interpretación, a la composición y a la improvisación.
                  </p>
                </section>

                <section className="cursos__topic">
                  <h3>Armonía tradicional y moderna</h3>
                  <p className="cursos__text">
                    En nuestras formaciones abordamos la armonía integrando los fundamentos tradicionales con los recursos del lenguaje moderno. Según el nivel, trabajamos la construcción y el enlace de acordes, funciones tonales, progresiones armónicas, dominantes secundarios, modulaciones y el análisis de estructuras musicales. El programa abarca desde los conceptos diatónicos y el cifrado americano hasta el cromatismo mediante tensiones e intercambio modal, concluyendo con técnicas avanzadas como armonía modal, sustitución tritonal, armonía cuartal y escalas simétricas.
                  </p>
                </section>

                <section className="cursos__topic">
                  <h3>Improvisación y acompañamiento</h3>
                  <p className="cursos__text">
                    La improvisación se trabaja como herramienta de expresión musical para crear melodías y discursos coherentes sobre diferentes estructuras mediante el estudio de escalas, modos, patrones rítmicos y recursos estilísticos. En el acompañamiento, abordamos géneros como swing, blues, bossa nova, funk y latin jazz con diversas disposiciones de acordes y patrones rítmicos adaptados a cada contexto musical.
                  </p>
                </section>

                <section className="cursos__topic">
                  <h3>Objetivo</h3>
                  <p className="cursos__text">
                    El propósito es desarrollar una comprensión musical integral para que el alumno se desenvuelva con autonomía, conectando la teoría con la práctica real. La formación potencia el análisis, la interpretación, la composición y la improvisación, aportando recursos aplicables al trabajo individual, grupal y a proyectos propios.
                  </p>
                </section>
              </div>

              <a
                className="bio-youtube cursos__channel"
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27z" />
                </svg>
                Ver más vídeos en mi canal de YouTube
              </a>
            </div>
          </article>
        </AnimatedSection>
      </div>
      <SectionFooter />
    </section>
  );
}
