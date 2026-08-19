import bg from './bg';
import en from './en';

export type Lang = 'bg' | 'en';

export const translations = { bg, en };

export function getTranslations(lang: Lang) {
  return translations[lang];
}

export function isEnglish(lang: Lang): boolean {
  return lang === 'en';
}
