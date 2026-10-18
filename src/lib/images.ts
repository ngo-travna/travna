import { supabase } from './supabase';

export function getTrailImageUrl(imagePath: string): string {
  return supabase.storage.from('trail_images').getPublicUrl(imagePath).data
    .publicUrl;
}
