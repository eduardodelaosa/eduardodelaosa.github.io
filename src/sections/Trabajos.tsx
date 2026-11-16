import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import AnimatedSection from '../components/AnimatedSection';
import SectionFooter from '../components/SectionFooter';
import './Trabajos.css';

type Track = {
  id: number;
  title: string;
  author: string;
  color: string;
  src: string;
  separator?: string;
  desktopSeparator?: string;
};

const tracks: Track[] = [
  {
    id: 1,
    title: 'Reposa y Calma Mi Mente',
    author: 'Manuel Henel',
    color: '#7ce3a0',
    src: '/audio/Manuel Henel - Reposa y Calma Mi Mente..mp3',
  },
  {
    id: 2,
    title: 'Battle Until The End',
    author: 'Eduardo de la Osa',
    color: '#63d7d0',
    src: '/audio/Battle Until The End.wav',
  },
  {
    id: 3,
    title: 'Fantasy Proyect',
    author: 'Eduardo de la Osa',
    color: '#6fb7e6',
    src: '/audio/Fantasy Proyect.mp3',
  },
  {
    id: 4,
    title: 'Universo',
    author: 'José Espi',
    color: '#a493e8',
    src: '/audio/José Espi - Universo.mp3',
  },
  {
    id: 5,
    title: 'Vivo En Ti',
    author: 'José Espi',
    color: '#e08fc0',
    src: '/audio/José Espi -Vivo-En-Ti.mp3',
  },
  {
    id: 6,
    title: 'Waiting For War',
    author: 'Eduardo de la Osa',
    color: '#e0b56a',
    src: '/audio/Waiting For War.mp3',
  },
  {
    id: 7,
    title: 'Madera De Encina (Orquestación)',
    author: 'Javi Osorio y María Peláe',
    color: '#7fc4ff',
    src: '/audio/Javi Osorio y María Peláe - Madera De Encina - (solo-orquestación).mp3',
    separator: ' - ',
    desktopSeparator: ' — ',
  },
];

const produccionImage = encodeURI('/images/Selfi en estudio musical con camiseta negra.png');

function formatTrackNumber(number: number) {
  return String(number).padStart(2, '0');
}

let sharedAudioContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const Ctor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    sharedAudioContext = new Ctor();
  }
  return sharedAudioContext;
}

function idleBarHeight(index: number, count: number) {
  const t = count > 1 ? index / (count - 1) : 0.5;
  const bell = Math.exp(-Math.pow((t - 0.5) / 0.24, 2));
  const ripple = 0.5 + 0.5 * Math.sin(t * Math.PI * 7 + 0.6);
  return 12 + bell * 44 + ripple * 12;
}

type TrackRowProps = {
  track: Track;
  isCurrent: boolean;
  onPlay: (id: number) => void;
};

function TrackRow({ track, isCurrent, onPlay }: TrackRowProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSyncRef = useRef(0);
  const levelsRef = useRef<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barCount, setBarCount] = useState(28);

  const number = formatTrackNumber(track.id);
  const isFeatured = track.id === 1;

  useEffect(() => {
    const wave = waveRef.current;
    if (!wave) return;

    const updateBars = () => {
      const padding = parseFloat(getComputedStyle(wave).paddingLeft) || 0;
      const available = Math.max(0, wave.clientWidth - padding);
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      const barWidth = isMobile ? 2.5 : 3;
      const gap = isMobile ? 3 : 4;
      const maxBars = isMobile ? 34 : 56;
      setBarCount(Math.min(maxBars, Math.max(6, Math.floor((available + gap) / (barWidth + gap)))));
    };

    updateBars();
    const observer = new ResizeObserver(updateBars);
    observer.observe(wave);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || isCurrent) return;
    if (!audio.paused) audio.pause();
  }, [isCurrent]);

  const resetWave = () => {
    const wave = waveRef.current;
    if (!wave) return;
    const bars = wave.querySelectorAll<HTMLElement>('.studio-track__bar');
    bars.forEach((bar, index) => {
      bar.style.height = `${idleBarHeight(index, bars.length).toFixed(1)}%`;
      bar.style.opacity = '';
    });
    levelsRef.current = [];
  };

  const ensureAnalyser = () => {
    if (analyserRef.current) return analyserRef.current;
    const audio = audioRef.current;
    const context = getAudioContext();
    if (!audio || !context || context.state !== 'running') return null;
    try {
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      source.connect(analyser);
      analyser.connect(context.destination);
      sourceRef.current = source;
      analyserRef.current = analyser;
      return analyser;
    } catch {
      return null;
    }
  };

  const resumeAudioGraph = () => {
    const context = getAudioContext();
    if (!context) return;
    if (context.state === 'running') {
      ensureAnalyser();
      return;
    }
    void context
      .resume()
      .then(() => {
        if (context.state === 'running') ensureAnalyser();
      })
      .catch(() => {
        /* reproducción directa del elemento <audio> si el contexto no está disponible */
      });
  };

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible' || !isPlaying) return;
      const context = getAudioContext();
      if (context && context.state === 'suspended') void context.resume().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [isPlaying]);

  useEffect(() => {
    resetWave();
  }, [barCount]);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const wave = waveRef.current;
    if (!wave) return;
    const bars = Array.from(wave.querySelectorAll<HTMLElement>('.studio-track__bar'));
    if (!bars.length) return;

    const analyser = analyserRef.current;
    const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const levels = levelsRef.current;
    const start = performance.now();
    const audio = audioRef.current;

    const tick = (now: number) => {
      if (audio && now - lastSyncRef.current > 200) {
        lastSyncRef.current = now;
        setCurrentTime(audio.currentTime);
      }

      if (analyser && bins) analyser.getByteFrequencyData(bins);

      for (let i = 0; i < bars.length; i += 1) {
        const t = bars.length > 1 ? i / (bars.length - 1) : 0.5;
        let target: number;

        if (analyser && bins) {
          const bin = Math.min(bins.length - 1, Math.round(Math.pow(t, 1.3) * (bins.length - 1) * 0.58));
          target = 0.06 + Math.pow(bins[bin] / 255, 0.62) * 0.94;
        } else {
          const phase = (now - start) / 1000;
          target = 0.2 + 0.55 * Math.abs(Math.sin(phase * 2.4 + i * 0.5) * Math.cos(phase * 0.7 + i * 0.15));
        }

        const previous = levels[i] ?? 0;
        const next = target > previous ? previous + (target - previous) * 0.6 : previous * 0.82 + target * 0.18;
        levels[i] = next;
        bars[i].style.height = `${(8 + next * 88).toFixed(1)}%`;
        bars[i].style.opacity = `${(0.45 + next * 0.55).toFixed(2)}`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, barCount]);

  const toggleTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      onPlay(track.id);
      resumeAudioGraph();
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setIsPlaying(false);
          resetWave();
        });
      }
    } else {
      audio.pause();
    }
  };

  const seekTrack = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const stopTrack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    resetWave();
  };

  const totalDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const progress = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div
      className={`studio-track${isFeatured ? ' studio-track--featured' : ''}${isPlaying ? ' is-playing' : ''}`}
      role="listitem"
      style={{ '--track-color': track.color } as CSSProperties}
    >
      <audio
        ref={audioRef}
        src={encodeURI(track.src)}
        preload="metadata"
        hidden
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value) && value > 0) setDuration(value);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onSeeked={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => {
          setIsPlaying(true);
          resumeAudioGraph();
        }}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          resetWave();
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (audioRef.current) audioRef.current.currentTime = 0;
          resetWave();
        }}
        onError={() => {
          setIsPlaying(false);
          setDuration(0);
          resetWave();
        }}
      />
      <span className="studio-track__number">{number}</span>
      <div className="studio-track__title-slot" aria-label={`${track.author}${track.desktopSeparator ?? track.separator ?? ' — '}${track.title}`}>
        <span className="studio-track__meta">
          <span className="studio-track__author">{track.author}</span>
          <span className="studio-track__separator" aria-hidden="true">
            {track.desktopSeparator ? (
              <>
                <span className="studio-track__separator-mobile">{track.separator ?? ' — '}</span>
                <span className="studio-track__separator-desktop">{track.desktopSeparator}</span>
              </>
            ) : (
              track.separator ?? ' — '
            )}
          </span>
          <span className={`studio-track__title-text${isPlaying ? ' is-playing' : ''}`}>{track.title}</span>
        </span>
        <span
          ref={waveRef}
          className={`studio-track__wave${isPlaying ? ' is-active' : ''}`}
          aria-hidden="true"
        >
          {Array.from({ length: barCount }, (_, index) => (
            <span key={index} className="studio-track__bar" />
          ))}
        </span>
      </div>
      <button
        type="button"
        className="studio-track__play"
        aria-label={`${isPlaying ? 'Pausar' : 'Reproducir'} pista ${number}: ${track.title}`}
        onClick={toggleTrack}
      >
        {isPlaying ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l10-6.5-10-6.5z" />
          </svg>
        )}
      </button>
      <input
        type="range"
        className="studio-track__progress studio-track__progress--active"
        min={0}
        max={totalDuration}
        step={0.1}
        value={Math.min(currentTime, totalDuration)}
        onChange={(event) => seekTrack(Number(event.target.value))}
        aria-label={`Progreso de la pista ${number}`}
        style={{ '--progress': `${progress}%` } as CSSProperties}
      />
      <button
        type="button"
        className="studio-track__stop"
        aria-label={`Detener pista ${number}`}
        onClick={stopTrack}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
        </svg>
      </button>
    </div>
  );
}

export default function Trabajos() {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);

  useLayoutEffect(() => {
    const section = document.getElementById('trabajos');
    const panel = section?.closest<HTMLElement>('.section-panel');
    const composition = section?.querySelector<HTMLElement>('.trabajos__composition');
    const footer = section?.querySelector<HTMLElement>('.section-footer');
    const media = section?.querySelector<HTMLElement>('.trabajos__media');
    const textCard = section?.querySelector<HTMLElement>('.trabajos__text-card');
    const textContent = section?.querySelector<HTMLElement>('.trabajos__text-content');
    if (!section || !panel || !composition || !footer || !media || !textCard || !textContent) return;

    const tabletLandscape = window.matchMedia(
      '(orientation: landscape) and (hover: none) and (pointer: coarse) and (min-width: 768px) and (min-height: 600px)',
    );
    const desktopLandscape = window.matchMedia(
      '(orientation: landscape) and (hover: hover) and (pointer: fine) and (min-width: 1025px) and (min-height: 700px)',
    );
    const paragraphs = Array.from(textContent.querySelectorAll<HTMLParagraphElement>('p'));
    const wrapper = composition.closest<HTMLElement>('.animate-fade-up');
    let frameId = 0;
    let settleTimer = 0;
    let lastTabletLog = '';

    const clearDesktopText = () => {
      paragraphs.forEach((paragraph) => {
        paragraph.style.removeProperty('font-size');
        paragraph.style.removeProperty('line-height');
        paragraph.style.removeProperty('margin-bottom');
      });
    };

    const fitDesktopText = () => {
      const target = media.getBoundingClientRect().height;
      if (!target || !paragraphs.length) return;

      clearDesktopText();
      const baseFont = Number.parseFloat(getComputedStyle(paragraphs[0]).fontSize) || 16;
      const paragraphGap = 0.28;
      let factor = 1.08;

      for (let pass = 0; pass < 8; pass += 1) {
        const fontSize = baseFont * factor;
        const gap = fontSize * paragraphGap;

        paragraphs.forEach((paragraph, index) => {
          paragraph.style.fontSize = `${fontSize.toFixed(2)}px`;
          paragraph.style.lineHeight = '1.2';
          paragraph.style.marginBottom = index === paragraphs.length - 1 ? '0' : `${gap.toFixed(2)}px`;
        });

        const totalLines = paragraphs.reduce((sum, paragraph) => {
          const rect = paragraph.getBoundingClientRect();
          const lineHeight = Number.parseFloat(getComputedStyle(paragraph).lineHeight) || fontSize * 1.2;
          return sum + rect.height / lineHeight;
        }, 0);
        const available = target - gap * (paragraphs.length - 1);
        const lineHeight = available / totalLines / fontSize;

        if (Number.isFinite(lineHeight) && lineHeight >= 1.05) {
          paragraphs.forEach((paragraph) => {
            paragraph.style.lineHeight = lineHeight.toFixed(4);
          });

          const firstTop = paragraphs[0].getBoundingClientRect().top;
          const lastBottom = paragraphs[paragraphs.length - 1].getBoundingClientRect().bottom;
          if (lastBottom - firstTop <= target + 0.5) break;
        }

        if (factor <= 1) break;
        factor = Math.max(1, factor * 0.965);
      }
    };

    const fitText = () => {
      const mediaRect = media.getBoundingClientRect();
      if (!mediaRect.height || !paragraphs.length) return;

      textContent.style.removeProperty('--trabajos-line-height');
      const first = paragraphs[0];
      const last = paragraphs[paragraphs.length - 1];
      const baseLine =
        Number.parseFloat(getComputedStyle(first).lineHeight) ||
        (Number.parseFloat(getComputedStyle(first).fontSize) || 16) * 1.5;
      const gapTotal = paragraphs
        .slice(0, -1)
        .reduce((sum, paragraph) => sum + (Number.parseFloat(getComputedStyle(paragraph).marginBottom) || 0), 0);
      const naturalHeight = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
      const lineCount = Math.max(1, Math.round((naturalHeight - gapTotal) / baseLine));
      let lineHeight = Math.max(1, (mediaRect.bottom - first.getBoundingClientRect().top - gapTotal) / lineCount);

      textContent.style.setProperty('--trabajos-line-height', `${lineHeight.toFixed(4)}px`);

      for (let pass = 0; pass < 3; pass += 1) {
        const diff = mediaRect.bottom - last.getBoundingClientRect().bottom;
        if (Math.abs(diff) <= 0.05) break;
        lineHeight += diff / lineCount;
        textContent.style.setProperty('--trabajos-line-height', `${lineHeight.toFixed(4)}px`);
      }

      textCard.style.height = `${mediaRect.height.toFixed(2)}px`;

      if (import.meta.env.DEV) {
        const textRect = {
          top: first.getBoundingClientRect().top,
          bottom: last.getBoundingClientRect().bottom,
        };
        const signature = `${window.innerWidth}x${window.innerHeight}:${mediaRect.width.toFixed(2)}x${mediaRect.height.toFixed(2)}:${textRect.bottom.toFixed(2)}`;
        if (signature !== lastTabletLog) {
          lastTabletLog = signature;
          console.info('[Trabajos/tablet-horizontal] Texto ajustado a la altura de la imagen', {
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            image: {
              top: Number(mediaRect.top.toFixed(2)),
              bottom: Number(mediaRect.bottom.toFixed(2)),
              height: Number(mediaRect.height.toFixed(2)),
            },
            text: {
              top: Number(textRect.top.toFixed(2)),
              bottom: Number(textRect.bottom.toFixed(2)),
              height: Number((textRect.bottom - textRect.top).toFixed(2)),
              bottomDiff: Number((textRect.bottom - mediaRect.bottom).toFixed(2)),
            },
            fontSize: getComputedStyle(first).fontSize,
            lineHeight: getComputedStyle(first).lineHeight,
            paragraphGap: getComputedStyle(first).marginBottom,
            lineCount,
          });
        }
      }
    };

    const apply = () => {
      if (desktopLandscape.matches) {
        fitDesktopText();
      } else {
        clearDesktopText();
      }

      if (!tabletLandscape.matches) {
        section.style.removeProperty('--trabajos-bottom-reserve');
        textContent.style.removeProperty('--trabajos-line-height');
        textCard.style.removeProperty('height');
        return;
      }

      fitText();

      if (getComputedStyle(footer).position !== 'fixed') {
        section.style.removeProperty('--trabajos-bottom-reserve');
        return;
      }

      const initialScroll = panel.scrollTop;

      const measureGap = () => {
        panel.scrollTop = panel.scrollHeight;
        const compositionRect = composition.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        return footerRect.top - compositionRect.bottom;
      };

      const adjust = () => {
        const gap = measureGap();
        const after = getComputedStyle(section, '::after');
        const currentReserve = (Number.parseFloat(after.height) || 0) + (Number.parseFloat(after.marginTop) || 0);
        return { gap, currentReserve };
      };

      let { gap, currentReserve } = adjust();
      if (Math.abs(gap - 30) > 0.5) {
        let target = Math.max(0, currentReserve - (gap - 30));
        for (let pass = 0; pass < 2; pass += 1) {
          section.style.setProperty('--trabajos-bottom-reserve', `${target.toFixed(2)}px`);
          ({ gap, currentReserve } = adjust());
          if (Math.abs(gap - 30) <= 0.5) break;
          target = Math.max(0, currentReserve - (gap - 30));
        }
        section.style.setProperty('--trabajos-bottom-reserve', `${target.toFixed(2)}px`);
      }
      panel.scrollTop = initialScroll;

      frameId = window.requestAnimationFrame(() => {
        if (!tabletLandscape.matches || getComputedStyle(footer).position !== 'fixed') return;
        const currentScroll = panel.scrollTop;
        ({ gap, currentReserve } = adjust());
        if (Math.abs(gap - 30) > 0.5) {
          const corrected = Math.max(0, currentReserve - (gap - 30));
          section.style.setProperty('--trabajos-bottom-reserve', `${corrected.toFixed(2)}px`);
        }
        panel.scrollTop = currentScroll;
      });
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
      if (event.target === wrapper && event.propertyName === 'transform') schedule(50);
    };

    const stateObserver = new MutationObserver(() => schedule(120));
    stateObserver.observe(panel, { attributes: true, attributeFilter: ['class'] });
    if (wrapper) {
      stateObserver.observe(wrapper, { attributes: true, attributeFilter: ['class'] });
      wrapper.addEventListener('transitionend', handleTransitionEnd);
    }

    window.addEventListener('resize', handleResize);
    tabletLandscape.addEventListener('change', handleResize);
    desktopLandscape.addEventListener('change', handleResize);
    document.fonts?.ready
      .then(() => schedule(120))
      .catch(() => undefined);
    schedule(750);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(settleTimer);
      stateObserver.disconnect();
      if (wrapper) wrapper.removeEventListener('transitionend', handleTransitionEnd);
      window.removeEventListener('resize', handleResize);
      tabletLandscape.removeEventListener('change', handleResize);
      desktopLandscape.removeEventListener('change', handleResize);
      clearDesktopText();
      section.style.removeProperty('--trabajos-bottom-reserve');
      textContent.style.removeProperty('--trabajos-line-height');
      textCard.style.removeProperty('height');
    };
  }, []);

  return (
    <section id="trabajos" className="trabajos section">
      <div className="container trabajos__container">
        <div className="section-header trabajos__header">
          <div className="trabajos__title-row">
            <h2 className="section-title">Producciones</h2>
          </div>
          <div className="trabajos__subtitle-row">
            <p className="section-subtitle trabajos__subtitle">Producciones, composiciones y arreglos</p>
          </div>
        </div>

        <AnimatedSection>
          <section className="studio-card" aria-label="Reproductor de producciones">
            <div className="studio-card__console" aria-hidden="true">
              <div className="studio-card__lights">
                <span />
                <span />
                <span />
              </div>
              <div className="studio-card__meters">
                {Array.from({ length: 18 }, (_, index) => (
                  <span key={index} style={{ '--meter-height': `${20 + ((index * 17) % 65)}%` } as CSSProperties} />
                ))}
              </div>
              <div className="studio-card__console-mark" />
            </div>

            <div className="studio-card__tracks" role="list" aria-label="7 pistas musicales">
              {tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isCurrent={activeTrack === track.id}
                  onPlay={setActiveTrack}
                />
              ))}
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <div className="trabajos__composition">
            <figure className="trabajos__media">
              <img
                src={produccionImage}
                alt="Eduardo de la Osa en el estudio musical con camiseta negra"
                loading="lazy"
              />
            </figure>
            <div className="trabajos__text-card">
              <div className="trabajos__text-content">
                <p>
                  A lo largo de los años he ido creando música en distintos estilos y para diferentes proyectos, trabajando tanto en composiciones propias como en arreglos y producciones para otros artistas.
                </p>
                <p>
                  Realizo canciones completas, grabando y produciendo todos los instrumentos, así como orquestaciones y adaptaciones de temas ya existentes. También colaboro en proyectos concretos grabando pistas sueltas de piano, de otros instrumentos o solos de piano y Hammond, entre otros.
                </p>
                <p>
                  Trabajo con una amplia variedad de estilos, entre ellos pop, rock, jazz, soul, funk y música clásica, con especial dedicación a la música para bandas sonoras.
                </p>
                <p>
                  ¿Tienes algún proyecto en mente? Estaré encantado de escucharte, conocer tu propuesta y estudiar cómo puedo ayudarte a darle forma. Aquí te dejo una selección de algunos de esos trabajos como compositor y arreglista.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
      <SectionFooter />
    </section>
  );
}






