// src/types/navigation.ts

export interface NavigationItem {
  label: string;
  href: string;
  /** When set, the item is shown as an icon only; `label` becomes its accessible name. */
  icon?: "runner";
}
