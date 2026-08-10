// export interface Trail {
//   id: string;
//   title: string;
//   description: string;
//   distance: string;
//   elevationGain: string;
//   highestPoint: string;
//   estimatedTime: string;
//   activities: string;
//   difficulty: string;
//   gpx: string;
//   heroImage: string;
//   gallery: string[];
// }
export interface Trail {
  id: string;
  slug: string;
  status: string;
  lastVisited: string | null;
  title: string;
  description: string;
  distance: number; // was distance_km
  elevationGain: number; // was elevation_gain
  highestPoint: number; // was highest_point
  durationHours: number; // was duration_hours
  activities?: string; // not yet in DB schema
  difficulty?: string; // not yet in DB schema
  gpx: string; // was gpx_file
  heroImage: string;
  gallery: { id: string; url: string; caption: string | null }[];
}
