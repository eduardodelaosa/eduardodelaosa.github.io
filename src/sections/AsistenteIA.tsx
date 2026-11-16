import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MessagesSquare, MessageCircle, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import SocialIcon from '../components/SocialIcon';
import { assistantQuestions, socialLinks } from '../data/siteData';
import './AsistenteIA.css';

export default function AsistenteIA() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const answerBodyRef = useRef<HTMLDivElement>(null);
  const answerPanelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedQuestion = assistantQuestions.find((q) => q.id === selectedId) ?? null;
  const isSelected = (id: string) => isPanelOpen && selectedId === id;

  const openQuestion = (id: string, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;

    if (isPanelOpen && selectedId === id) {
      setIsPanelOpen(false);
      return;
    }

    setSelectedId(id);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const applyPanelLayout = () => {
    const panel = answerPanelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;

    const isDesktop = window.matchMedia('(min-width: 1200px) and (min-height: 501px)').matches;
    if (!isDesktop) {
      panel.style.removeProperty('--asistente-answer-top');
      panel.style.removeProperty('--asistente-answer-max-height');
      return;
    }

    const head = panel.querySelector<HTMLElement>('.asistente__answer-head');
    const body = panel.querySelector<HTMLElement>('.asistente__answer-body');
    const intrinsicHeight = (head?.offsetHeight ?? 0) + (body?.scrollHeight ?? 0) + 2;
    const triggerTop = trigger.getBoundingClientRect().top;

    let top: number;
    let maxHeight: number;

    if (window.matchMedia('(min-width: 1850px)').matches) {
      const card = trigger.closest('.asistente__card') as HTMLElement | null;
      const cardRect = card?.getBoundingClientRect();
      const minTop = cardRect ? cardRect.top : 80;
      const bottomLimit = (cardRect ? cardRect.bottom : window.innerHeight) - 12;
      top = Math.min(Math.max(minTop, triggerTop), Math.max(minTop, bottomLimit - intrinsicHeight));
      maxHeight = Math.max(180, bottomLimit - top);
    } else {
      const inner = trigger.closest('.final-section__inner') as HTMLElement | null;
      if (!inner) return;

      const innerRect = inner.getBoundingClientRect();
      const bottomLimit = innerRect.height - 12;
      const desiredTop = Math.max(0, triggerTop - innerRect.top);
      top = Math.min(desiredTop, Math.max(0, bottomLimit - intrinsicHeight));
      maxHeight = Math.max(180, bottomLimit - top);
    }

    panel.style.setProperty('--asistente-answer-top', `${Math.round(top)}px`);
    panel.style.setProperty('--asistente-answer-max-height', `${Math.round(maxHeight)}px`);
  };

  const handlePanelTransitionEnd = () => {
    if (!isPanelOpen) setSelectedId(null);
  };

  useLayoutEffect(() => {
    if (!isPanelOpen) return;
    applyPanelLayout();
  }, [isPanelOpen, selectedId]);

  useEffect(() => {
    if (!isPanelOpen) return;

    const handleViewportChange = () => applyPanelLayout();

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isPanelOpen, selectedId]);

  useEffect(() => {
    if (!isPanelOpen) return;

    closeButtonRef.current?.focus({ preventScroll: true });
    if (answerBodyRef.current) answerBodyRef.current.scrollTop = 0;
  }, [isPanelOpen, selectedId]);

  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsPanelOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen]);

  return (
    <div className="asistente-block">
      <AnimatedSection>
        <div className="asistente__card glass-card">
          <div className="asistente__card-glow" />
          <div className="asistente__card-inner">
            <div className="asistente__header">
              <div className="asistente__icon">
                <MessagesSquare size={32} />
              </div>
              <div className="asistente__title-group">
                <h2 className="asistente__title">Centro de información</h2>
                <p className="asistente__subtitle">
                  <Sparkles size={14} />
                  <span>Consulta información sobre mi trayectoria y proyectos</span>
                </p>
              </div>
            </div>

            <p className="asistente__description">
              Selecciona una de las siguientes consultas para acceder rápidamente a la información.
            </p>

            <div className="asistente__questions">
              {assistantQuestions.map((q) => (
                <div key={q.id} className="asistente__question">
                  <button
                    className={`asistente__question-btn${isSelected(q.id) ? ' is-active' : ''}`}
                    onClick={(event) => openQuestion(q.id, event.currentTarget)}
                    aria-expanded={isSelected(q.id)}
                    aria-controls="asistente-answer-panel"
                  >
                    <MessageCircle size={16} />
                    <span>{q.question}</span>
                    {isSelected(q.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {selectedQuestion && (
        <div className={`asistente__panel${isPanelOpen ? ' is-open' : ''}`}>
          <div
            className="asistente__panel-scrim"
            onClick={closePanel}
            aria-hidden="true"
          />
          <aside
            ref={answerPanelRef}
            id="asistente-answer-panel"
            className="asistente__answer-panel"
            role="dialog"
            aria-labelledby="asistente-answer-title"
            onTransitionEnd={handlePanelTransitionEnd}
          >
            <button
              ref={closeButtonRef}
              type="button"
              className="asistente__answer-close"
              onClick={closePanel}
              aria-label="Cerrar respuesta"
            >
              <X size={18} />
            </button>

            <div className="asistente__answer-head">
              <div className="asistente__answer-icon">
                <MessageCircle size={18} />
              </div>
              <h3 id="asistente-answer-title" className="asistente__answer-title">
                {selectedQuestion.question}
              </h3>
            </div>

            <div ref={answerBodyRef} className="asistente__answer-body">
              {selectedQuestion.answer
                .split('\n\n')
                .filter(Boolean)
                .map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

              {selectedQuestion.showSocial && (
                <div className="asistente__answer-social" aria-label="Redes sociales de Eduardo">
                  {socialLinks.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      className="asistente__answer-social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      title={social.platform}
                    >
                      <SocialIcon icon={social.icon} size={18} monochrome />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
