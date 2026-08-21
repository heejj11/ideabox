import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { IdeaImageOpenPayload } from './IdeaImage';

interface ImageLightboxProps {
  image: IdeaImageOpenPayload;
  onClose: () => void;
  returnFocusTo: HTMLButtonElement | null;
}

export function ImageLightbox({ image, onClose, returnFocusTo }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    return () => returnFocusTo?.focus();
  }, [returnFocusTo]);

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return createPortal(
    <div className="image-lightbox" onMouseDown={handleBackdropMouseDown}>
      <section
        className="image-lightbox__paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-lightbox-title"
        onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
          if (event.key !== 'Tab') return;
          event.preventDefault();
          closeRef.current?.focus();
        }}
      >
        <header className="image-lightbox__header">
          <div>
            <h2 id="image-lightbox-title">이미지 크게 보기</h2>
            <p>{image.alt}</p>
          </div>
          <button ref={closeRef} type="button" className="text-button" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="image-lightbox__stage">
          <img src={image.src} alt={image.alt} />
        </div>
        <p className="image-lightbox__hint">바깥을 누르거나 Esc 키를 누르면 닫혀요.</p>
      </section>
    </div>,
    document.body
  );
}
