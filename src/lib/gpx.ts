import { gpx } from '@tmcw/togeojson';

export async function loadGpx(path: string) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load GPX: ${path}`);
  }

  const xml = await response.text();

  const document = new DOMParser().parseFromString(xml, 'application/xml');

  return gpx(document);
}
