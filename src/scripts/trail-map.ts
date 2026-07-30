import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { loadGpx } from '../lib/gpx';

export function initTrailMap() {
  const container = document.getElementById('trail-map');

  if (!container) return;

  const map = new maplibregl.Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [25.5, 42.8667],
    zoom: 11,
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  loadGpx('/gpx/zelenika-path.gpx')
    .then((geojson) => {
      console.log('GPX loaded:', geojson);

      map.on('load', () => {
        map.addSource('trail', {
          type: 'geojson',
          data: geojson,
        });

        map.addLayer({
          id: 'trail-line',
          type: 'line',
          source: 'trail',
          paint: {
            'line-color': '#d62828',
            'line-width': 4,
            'line-opacity': 0.9,
          },
        });
      });
    })
    .catch(console.error);
}
