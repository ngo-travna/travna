// Turns a GPX-derived GeoJSON (LineString/MultiLineString, coordinates as
// [lon, lat, elevation]) into a lightweight elevation-over-distance profile,
// rendered as a static SVG path at build time - no client-side charting
// library needed.

export interface ElevationPoint {
  distanceKm: number;
  elevationM: number;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const earthRadiusKm = 6371;

  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.asin(Math.sqrt(h));
}

export function buildElevationProfile(geojson: any): ElevationPoint[] {
  const coordinates: number[][] = [];

  for (const feature of geojson.features ?? []) {
    if (feature.geometry?.type === 'LineString') {
      coordinates.push(...feature.geometry.coordinates);
    } else if (feature.geometry?.type === 'MultiLineString') {
      for (const line of feature.geometry.coordinates) {
        coordinates.push(...line);
      }
    }
  }

  const points: ElevationPoint[] = [];
  let distanceKm = 0;

  coordinates.forEach((coord, i) => {
    if (i > 0) {
      const prev = coordinates[i - 1];
      distanceKm += haversineKm(
        [prev[0], prev[1]],
        [coord[0], coord[1]],
      );
    }

    points.push({
      distanceKm,
      elevationM: coord[2] ?? 0,
    });
  });

  return points;
}

// Keeps the SVG light - a raw GPX track can have thousands of points, far
// more detail than a small chart needs.
export function downsampleProfile(
  points: ElevationPoint[],
  maxPoints = 150,
): ElevationPoint[] {
  if (points.length <= maxPoints) return points;

  const step = points.length / maxPoints;
  const sampled: ElevationPoint[] = [];

  for (let i = 0; i < maxPoints; i++) {
    sampled.push(points[Math.floor(i * step)]);
  }

  sampled.push(points[points.length - 1]);

  return sampled;
}

export interface ElevationProfileSvg {
  areaPath: string;
  linePath: string;
  minElevationM: number;
  maxElevationM: number;
  totalDistanceKm: number;
}

export function buildElevationProfileSvg(
  points: ElevationPoint[],
  width: number,
  height: number,
  padding = 6,
): ElevationProfileSvg {
  const elevations = points.map((p) => p.elevationM);
  const minElevationM = Math.min(...elevations);
  const maxElevationM = Math.max(...elevations);
  const totalDistanceKm = points[points.length - 1]?.distanceKm ?? 0;

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const elevationRange = maxElevationM - minElevationM || 1;
  const distanceRange = totalDistanceKm || 1;

  const toX = (d: number) => padding + (d / distanceRange) * innerWidth;
  const toY = (e: number) =>
    padding + innerHeight - ((e - minElevationM) / elevationRange) * innerHeight;

  const coords = points.map(
    (p) => `${toX(p.distanceKm).toFixed(1)},${toY(p.elevationM).toFixed(1)}`,
  );

  const linePath = `M${coords.join(' L')}`;
  const baselineY = (height - padding).toFixed(1);
  const areaPath = `${linePath} L${toX(totalDistanceKm).toFixed(1)},${baselineY} L${toX(0).toFixed(1)},${baselineY} Z`;

  return { areaPath, linePath, minElevationM, maxElevationM, totalDistanceKm };
}
