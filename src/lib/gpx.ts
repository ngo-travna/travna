import { gpx } from '@tmcw/togeojson';

export async function loadGpx(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to load GPX: ${url}`);
  }

  const text = await response.text();

  const xml = new DOMParser().parseFromString(text, 'application/xml');

  return gpx(xml);
}
