export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;

    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
}
