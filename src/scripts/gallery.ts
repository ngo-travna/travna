export function initGallery() {
  const images = Array.from(
    document.querySelectorAll('.gallery-image'),
  ) as HTMLImageElement[];

  const lightbox = document.getElementById('gallery-lightbox')!;
  const preview = lightbox.querySelector('.lightbox-image') as HTMLImageElement;

  const close = lightbox.querySelector('.lightbox-close')!;
  const prev = lightbox.querySelector('.lightbox-prev')!;
  const next = lightbox.querySelector('.lightbox-next')!;

  let index = 0;

  function show(i: number) {
    index = i;

    preview.src = images[index].dataset.fullSrc || images[index].src;

    lightbox.classList.remove('hidden');
  }

  images.forEach((img, i) => {
    img.addEventListener('click', () => show(i));
  });

  close.addEventListener('click', () => {
    lightbox.classList.add('hidden');
  });

  prev.addEventListener('click', () => {
    show((index - 1 + images.length) % images.length);
  });

  next.addEventListener('click', () => {
    show((index + 1) % images.length);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.add('hidden');
  });
}
