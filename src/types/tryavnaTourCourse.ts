export interface TryavnaTourCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  distanceKm: number;
  elevationGain: number;
  gpx: string | null;
}

export function mapSupabaseCourse(
  row: any,
  language: 'bg' | 'en' = 'bg',
): TryavnaTourCourse {
  const translation =
    row.tryavna_tour_course_translations?.find(
      (tr: { language: string }) => tr.language === language,
    ) ??
    row.tryavna_tour_course_translations?.find(
      (tr: { language: string }) => tr.language === 'bg',
    ) ??
    {};

  return {
    id: row.id,
    slug: row.slug,
    title: translation.title ?? row.slug,
    description: translation.description ?? '',
    distanceKm: row.distance_km,
    elevationGain: row.elevation_gain,
    gpx: row.gpx_file,
  };
}
