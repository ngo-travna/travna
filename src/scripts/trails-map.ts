import { loadGpx } from '../lib/gpx';

interface MapTrail {
  slug: string;
  title: string;
  gpx: string;
}

// One distinct colour per trail (cycled when there are more trails than colours).
const COLORS = [
  '#e63946', '#1d4ed8', '#16a34a', '#f59e0b', '#9333ea', '#0891b2',
  '#db2777', '#65a30d', '#ea580c', '#475569', '#0d9488', '#a16207',
];

export async function initTrailsMap() {
  const container = document.getElementById('trails-map');
  if (!container) return;

  const trails: MapTrail[] = JSON.parse(container.dataset.trails ?? '[]');
  const prefix = container.dataset.prefix ?? '';
  if (trails.length === 0) return;

  const [maplibregl] = await Promise.all([
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl.css'),
  ]);
  const { default: maplibreWorkerUrl } = await import(
    'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
  );
  maplibregl.setWorkerUrl(maplibreWorkerUrl);

  const map = new maplibregl.Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [25.5, 42.8667],
    zoom: 10,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  const loaded = await Promise.allSettled(trails.map((trail) => loadGpx(trail.gpx)));

  if (!map.loaded()) {
    await new Promise<void>((resolve) => map.once('load', () => resolve()));
  }

  const bounds = new maplibregl.LngLatBounds();
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'trails-map-popup',
  });
  const layerIds: string[] = [];

  loaded.forEach((result, index) => {
    if (result.status !== 'fulfilled') {
      console.error('Unable to load GPX for', trails[index].slug, result.reason);
      return;
    }

    const geojson = result.value;
    const trail = trails[index];
    const id = `trail-${index}`;
    const color = COLORS[index % COLORS.length];

    for (const feature of geojson.features) {
      const geometry = feature.geometry;
      if (geometry?.type === 'LineString') {
        for (const coord of geometry.coordinates) bounds.extend(coord as [number, number]);
      } else if (geometry?.type === 'MultiLineString') {
        for (const line of geometry.coordinates) {
          for (const coord of line) bounds.extend(coord as [number, number]);
        }
      }
    }

    map.addSource(id, { type: 'geojson', data: geojson });
    map.addLayer({
      id: `${id}-outline`,
      type: 'line',
      source: id,
      filter: ['!=', '$type', 'Point'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.9 },
    });
    map.addLayer({
      id: `${id}-line`,
      type: 'line',
      source: id,
      filter: ['!=', '$type', 'Point'],
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': color, 'line-width': 3.5 },
    });
    // Wide transparent line = easy hover/click target, also on touch screens.
    map.addLayer({
      id: `${id}-hit`,
      type: 'line',
      source: id,
      filter: ['!=', '$type', 'Point'],
      paint: { 'line-color': '#000000', 'line-width': 16, 'line-opacity': 0 },
    });
    layerIds.push(id);

    map.on('mouseenter', `${id}-hit`, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      map.setPaintProperty(`${id}-line`, 'line-width', 6);
      popup.setLngLat(e.lngLat).setText(trail.title).addTo(map);
    });
    map.on('mousemove', `${id}-hit`, (e) => popup.setLngLat(e.lngLat));
    map.on('mouseleave', `${id}-hit`, () => {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty(`${id}-line`, 'line-width', 3.5);
      popup.remove();
    });
    map.on('click', `${id}-hit`, () => {
      window.location.href = `${prefix}/trails/${trail.slug}`;
    });
  });

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, { padding: 40, maxZoom: 14, animate: false });
  }
}
