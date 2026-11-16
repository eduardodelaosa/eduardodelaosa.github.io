import { useEffect, useState } from 'react';
import './SobreMi.css';

const galleryImages = [
  { src: '/images/piano.jpeg', alt: 'Piano' },
  { src: '/images/bigband.jpeg', alt: 'Big Band' },
  { src: '/images/cuarteto.jpeg', alt: 'Cuarteto' },
  { src: '/images/tele.jpeg', alt: 'Eduardo de la Osa' },
  { src: '/images/premio.jpeg', alt: 'Premio' },
];

export default function SobreMiGallery() {
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(null);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('gallery-lightbox-open');
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove('gallery-lightbox-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox]);

  const handleGalleryClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'IMG') return;
    const image = target as HTMLImageElement;
    setLightbox({ src: image.currentSrc || image.src, alt: image.alt });
  };

  return (
    <>
      <div className="sobre-mi__gallery" role="group" aria-label="Galería de imágenes">
        <div
          className="sobre-mi__gallery-track"
          onClick={handleGalleryClick}
        >
          {galleryImages.map((image) => (
            <img
              className="sobre-mi__gallery-image"
              key={image.src}
              src={image.src}
              alt={image.alt}
              draggable={false}
              loading="lazy"
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="bio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="bio-lightbox__close"
            aria-label="Cerrar imagen ampliada"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox(null);
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <img
            className="bio-lightbox__img"
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
