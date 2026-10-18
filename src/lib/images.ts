import { supabase } from './supabase';

export function getTrailImageUrl(imagePath: string): string {
  return supabase.storage.from('trail_images').getPublicUrl(imagePath).data
    .publicUrl;
}

export function getTryavnaTourImageUrl(imagePath: string): string {
  return supabase.storage.from('tryavna-tour').getPublicUrl(imagePath).data
    .publicUrl;
}
