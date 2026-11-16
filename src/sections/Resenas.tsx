import { Star, Quote } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { testimonials } from '../data/siteData';
import './Resenas.css';

export default function Resenas() {
  return (
    <div id="resenas" className="resenas-block">
      <AnimatedSection>
        <div className="section-header">
          <h2 className="section-title">Reseñas</h2>
          <p className="section-subtitle">Testimonios profesionales y valoraciones</p>
        </div>
      </AnimatedSection>

      {testimonials.length === 0 ? (
        <AnimatedSection delay={200}>
          <div className="resenas__empty glass-card">
            <Quote size={48} className="resenas__empty-icon" />
            <p className="resenas__empty-text">
              Esta sección se completará próximamente con testimonios de colaboradores y clientes.
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="resenas__grid">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.id} delay={200 + i * 100}>
              <div className="resenas__card glass-card glow-border">
                <div className="resenas__card-stars">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={16}
                      className={idx < t.rating ? 'resenas__star-filled' : 'resenas__star-empty'}
                    />
                  ))}
                </div>
                <p className="resenas__card-comment">&ldquo;{t.comment}&rdquo;</p>
                <div className="resenas__card-author">
                  <strong>{t.name}</strong>
                  <span>{t.context}</span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      )}
    </div>
  );
}
