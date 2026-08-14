export interface Trail {
  id: string;
  slug: string;
  status: 'maintained' | 'partly_maintained' | 'passed_by_travna';
  lastVisited: string | Date;
  title: string;
  description: string;
  distance: number; // was distance_km
  elevationGain: number; // was elevation_gain
  highestPoint: number; // was highest_point
  durationHours: number; // was duration_hours
  gpx: string; // was gpx_file
  heroImage: string;
  gallery: { id: string; url: string; caption: string | null }[];
}
