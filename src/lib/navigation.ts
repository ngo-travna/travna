import type { NavigationItem } from '../types/navigation';

export function getNavigation(isEnglish: boolean): NavigationItem[] {
  return [
    {
      label: isEnglish ? 'Home' : 'Начало',
      href: isEnglish ? '/en/' : '/',
    },
    {
      label: isEnglish ? 'Mission' : 'Мисия',
      href: isEnglish ? '/en/mission' : '/mission',
    },
    {
      label: isEnglish ? 'Trails' : 'Пътеки',
      href: isEnglish ? '/en/trails' : '/trails',
    },
    {
      label: isEnglish ? 'Events' : 'Събития',
      href: isEnglish ? '/en/events' : '/events',
    },
  ];
}
