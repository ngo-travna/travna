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

// Browser's global DOMParser isn't available during the Astro build (SSR/
// Node), so build-time GPX parsing (e.g. for a static elevation profile
// chart) goes through this instead, using a Node-compatible DOMParser.
// Keeps the exact same @tmcw/togeojson parsing as the client-side loadGpx
// above, just swapping out where DOMParser comes from.
export async function loadGpxServer(url: string) {
  const { DOMParser: ServerDOMParser } = await import('@xmldom/xmldom');

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unable to load GPX: ${url}`);
  }

  const text = await response.text();

  const xml = new ServerDOMParser().parseFromString(text, 'application/xml');

  return gpx(xml as unknown as Document);
}
