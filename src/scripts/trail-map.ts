import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const container = document.getElementById('trail-map');

if (container) {
  new maplibregl.Map({
    container,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [25.5, 42.8667],
    zoom: 10,
  });
}
