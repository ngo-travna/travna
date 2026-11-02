// Build-time helpers: turn a (possibly huge) GPX file into a few compact,
// simplified lines that are enough to draw an overview map.

export type Line = [number, number][]; // [lon, lat] pairs

const TOLERANCE_METERS = 15;
const METERS_PER_DEGREE = 111_320;

function attr(tag: string, name: string): number | null {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([-+\\d.eE]+)["']`));
  return match ? Number(match[1]) : null;
}

function extractLines(gpx: string): Line[] {
  const segments = gpx.match(/<trkseg\b[\s\S]*?<\/trkseg>/g) ?? [];
  const sources = segments.length > 0 ? segments : gpx.match(/<rte\b[\s\S]*?<\/rte>/g) ?? [];
  const pointTag = segments.length > 0 ? /<trkpt\b[^>]*>/g : /<rtept\b[^>]*>/g;

  const lines: Line[] = [];
  for (const source of sources) {
    const line: Line = [];
    for (const tag of source.match(pointTag) ?? []) {
      const lat = attr(tag, 'lat');
      const lon = attr(tag, 'lon');
      if (lat !== null && lon !== null) line.push([lon, lat]);
    }
    if (line.length > 1) lines.push(line);
  }
  return lines;
}

// Iterative Douglas-Peucker on locally projected (metric) coordinates.
function simplify(line: Line, toleranceMeters: number): Line {
  if (line.length < 3) return line;

  const midLat = line[Math.floor(line.length / 2)][1];
  const kx = METERS_PER_DEGREE * Math.cos((midLat * Math.PI) / 180);
  const ky = METERS_PER_DEGREE;
  const xs = line.map((p) => p[0] * kx);
  const ys = line.map((p) => p[1] * ky);

  const keep = new Uint8Array(line.length);
  keep[0] = 1;
  keep[line.length - 1] = 1;
  const stack: [number, number][] = [[0, line.length - 1]];

  while (stack.length > 0) {
    const [first, last] = stack.pop()!;
    const dx = xs[last] - xs[first];
    const dy = ys[last] - ys[first];
    const lengthSq = dx * dx + dy * dy;
    let maxDist = 0;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      let dist: number;
      if (lengthSq === 0) {
        dist = Math.hypot(xs[i] - xs[first], ys[i] - ys[first]);
      } else {
        const t = Math.max(0, Math.min(1, ((xs[i] - xs[first]) * dx + (ys[i] - ys[first]) * dy) / lengthSq));
        dist = Math.hypot(xs[i] - (xs[first] + t * dx), ys[i] - (ys[first] + t * dy));
      }
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }

    if (index !== -1 && maxDist > toleranceMeters) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }

  return line.filter((_, i) => keep[i] === 1);
}

export function gpxToSimplifiedLines(gpx: string): Line[] {
  return extractLines(gpx).map((line) =>
    simplify(line, TOLERANCE_METERS).map(
      ([lon, lat]) => [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5] as [number, number],
    ),
  );
}
