export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
}

export function toggleTheme() {
  const current = document.documentElement.dataset.theme;

  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset.theme = next;

  localStorage.setItem('theme', next);
}
