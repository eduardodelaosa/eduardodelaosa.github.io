import { Image } from 'lucide-react';
import './PlaceholderImage.css';

interface PlaceholderImageProps {
  label?: string;
  aspectRatio?: string;
  variant?: 'dark' | 'gradient';
}

export default function PlaceholderImage({ label = 'Imagen próximamente', aspectRatio = '16/9', variant = 'gradient' }: PlaceholderImageProps) {
  return (
    <div
      className={`placeholder-image placeholder-image--${variant}`}
      style={{ aspectRatio }}
      role="img"
      aria-label={label}
    >
      <div className="placeholder-image__inner">
        <Image size={32} className="placeholder-image__icon" />
        <span className="placeholder-image__label">{label}</span>
      </div>
    </div>
  );
}
