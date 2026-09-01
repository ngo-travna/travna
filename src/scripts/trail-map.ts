import { loadGpx } from '../lib/gpx';

// maplibre-gl (~1.4MB uncompressed with its worker) is dynamically imported
// so it's only downloaded once initTrailMap() actually runs, not bundled
// eagerly into every trail detail page load. See TrailMapClient.astro,
// which only calls this once the map section scrolls near the viewport.
export async function initTrailMap() {
  const container = document.getElementById('trail-map');

  if (!container) return;

  const gpx = container.dataset.gpx;

  if (!gpx) {
    console.error('No GPX file specified.');
    return;
  }

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
    zoom: 11,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  loadGpx(gpx)
    .then((geojson) => {
      map.on('load', () => {
        map.addSource('trail', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'trail-outline',
          type: 'line',
          source: 'trail',
          paint: {
            'line-color': '#ffffff',
            'line-width': 8,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'trail-line',
          type: 'line',
          source: 'trail',
          paint: {
            'line-color': '#d62828',
            'line-width': 4,
            'line-opacity': 1,
          },
        });
      });
      const bounds = new maplibregl.LngLatBounds();

      for (const feature of geojson.features) {
        if (feature.geometry.type === 'LineString') {
          for (const coord of feature.geometry.coordinates) {
            bounds.extend(coord as [number, number]);
          }
        }

        if (feature.geometry.type === 'MultiLineString') {
          for (const line of feature.geometry.coordinates) {
            for (const coord of line) {
              bounds.extend(coord as [number, number]);
            }
          }
        }
      }

      map.fitBounds(bounds, {
        padding: 40,
        maxZoom: 14,
      });

      const firstFeature = geojson.features[0];

      if (firstFeature.geometry.type === 'LineString') {
        const coordinates = firstFeature.geometry.coordinates;

        const start = coordinates[0];
        const finish = coordinates[coordinates.length - 1];

        new maplibregl.Marker({
          color: '#22c55e',
        })
          .setLngLat(start as [number, number])
          .addTo(map);

        new maplibregl.Marker({
          color: '#ef4444',
        })
          .setLngLat(finish as [number, number])
          .addTo(map);
      }
    })
    .catch(console.error);
}
