interface MapTrail {
  slug: string;
  title: string;
}

type Lines = [number, number][][];

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

  // Start downloading the (small, pre-simplified) track data at the same time
  // as the map library.
  const overviewPromise: Promise<Record<string, Lines>> = fetch('/trails-overview.json').then(
    (response) => {
      if (!response.ok) throw new Error(`Unable to load trails overview: ${response.status}`);
      return response.json();
    },
  );

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

  const overview = await overviewPromise.catch((err) => {
    console.error(err);
    return {} as Record<string, Lines>;
  });

  if (!map.loaded()) {
    await new Promise<void>((resolve) => map.once('load', () => resolve()));
  }

  const bounds = new maplibregl.LngLatBounds();
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: 'trails-map-popup',
  });

  trails.forEach((trail, index) => {
    const lines = overview[trail.slug];
    if (!lines) return;

    const id = `trail-${index}`;
    const color = COLORS[index % COLORS.length];

    for (const line of lines) {
      for (const coord of line) bounds.extend(coord);
    }

    const geojson = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'MultiLineString' as const, coordinates: lines },
    };

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

  container.classList.add('is-ready');
  container.setAttribute('aria-busy', 'false');
}
