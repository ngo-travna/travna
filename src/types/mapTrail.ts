import type { Trail } from './trail';
import { getTrailImageUrl } from '../lib/images';

export function mapSupabaseTrail(
  row: any,
  language: 'bg' | 'en' = 'bg',
): Trail {
  const translation =
    row.trail_translations?.find(
      (tr: { language: string }) => tr.language === language,
    ) ??
    row.trail_translations?.find(
      (tr: { language: string }) => tr.language === 'bg',
    ) ??
    {};

  const sortedImages = [...(row.trail_images ?? [])].sort(
    (a, b) => a.display_order - b.display_order,
  );

  const heroImage = sortedImages[0]
    ? getTrailImageUrl(sortedImages[0].image_path)
    : '';

  const gallery = sortedImages.map((img) => ({
    id: img.id,
    url: getTrailImageUrl(img.image_path),
    caption: img.caption,
  }));

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    lastVisited: row.last_visited,
    title: translation.title,
    description: translation.description,
    distance: row.distance_km,
    elevationGain: row.elevation_gain,
    highestPoint: row.highest_point,
    durationHours: row.duration_hours,
    gpx: row.gpx_file,
    heroImage,
    gallery,
  };
}
