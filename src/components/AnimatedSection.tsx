import { useScrollAnimation } from '../hooks/useScrollAnimation';
import './AnimatedSection.css';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation(0.12);

  return (
    <div
      ref={ref}
      className={`animate-fade-up ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
