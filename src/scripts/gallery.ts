export function initGallery() {
  const images = Array.from(
    document.querySelectorAll('.gallery-image'),
  ) as HTMLImageElement[];

  const lightbox = document.getElementById('gallery-lightbox');

  if (!lightbox) return;

  const preview = lightbox.querySelector('.lightbox-image') as HTMLImageElement;

  const close = lightbox.querySelector('.lightbox-close');
  const prev = lightbox.querySelector('.lightbox-prev');
  const next = lightbox.querySelector('.lightbox-next');

  if (!preview || !close || !prev || !next) return;

  let index = 0;

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let pinchStartDistance = 0;
  let pinchStartScale = 1;

  function updateTransform() {
    preview.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

    preview.classList.toggle('zoomed', scale > 1);
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  function setZoom(newScale: number) {
    scale = Math.min(Math.max(newScale, 1), 4);

    // When returning to 1x, remove any previous pan.
    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }

    updateTransform();
  }

  function show(i: number) {
    index = i;

    resetZoom();

    preview.src = images[index].dataset.fullSrc || images[index].src;

    lightbox.classList.remove('hidden');
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    resetZoom();
  }

  images.forEach((img, i) => {
    img.addEventListener('click', () => show(i));
  });

  close.addEventListener('click', closeLightbox);

  prev.addEventListener('click', () => {
    show((index - 1 + images.length) % images.length);
  });

  next.addEventListener('click', () => {
    show((index + 1) % images.length);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // ------------------------------------------------------------
  // Mouse wheel zoom
  // ------------------------------------------------------------

  preview.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();

      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom(scale + delta);
    },
    { passive: false },
  );

  // ------------------------------------------------------------
  // Double-click zoom
  // ------------------------------------------------------------

  preview.addEventListener('dblclick', (e) => {
    e.preventDefault();

    if (scale === 1) {
      setZoom(2.5);
    } else {
      resetZoom();
    }
  });

  // ------------------------------------------------------------
  // Mouse / pointer dragging
  // ------------------------------------------------------------

  preview.addEventListener('pointerdown', (e) => {
    if (scale <= 1) return;

    isDragging = true;

    startX = e.clientX - translateX;
    startY = e.clientY - translateY;

    preview.setPointerCapture(e.pointerId);
  });

  preview.addEventListener('pointermove', (e) => {
    if (!isDragging || scale <= 1) return;

    translateX = e.clientX - startX;
    translateY = e.clientY - startY;

    updateTransform();
  });

  preview.addEventListener('pointerup', (e) => {
    isDragging = false;
    preview.releasePointerCapture(e.pointerId);
  });

  preview.addEventListener('pointercancel', () => {
    isDragging = false;
  });

  // ------------------------------------------------------------
  // Touch pinch-to-zoom
  // ------------------------------------------------------------

  preview.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 2) {
        pinchStartDistance = getTouchDistance(e.touches[0], e.touches[1]);

        pinchStartScale = scale;
      }
    },
    { passive: false },
  );

  preview.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length !== 2) return;

      e.preventDefault();

      const distance = getTouchDistance(e.touches[0], e.touches[1]);

      if (!pinchStartDistance) return;

      const ratio = distance / pinchStartDistance;

      setZoom(pinchStartScale * ratio);
    },
    { passive: false },
  );

  preview.addEventListener('touchend', () => {
    if (scale < 1.05) {
      resetZoom();
    }

    pinchStartDistance = 0;
  });

  // ------------------------------------------------------------
  // Escape closes lightbox
  // ------------------------------------------------------------

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
      closeLightbox();
    }
  });

  function getTouchDistance(a: Touch, b: Touch): number {
    const dx = a.clientX - b.clientX;
    const dy = a.clientY - b.clientY;

    return Math.sqrt(dx * dx + dy * dy);
  }
}
