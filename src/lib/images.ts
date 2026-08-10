import { supabase } from './supabase';

export function getTrailImageUrl(imagePath: string): string {
  return supabase.storage
    .from('trail_images') // confirm this matches your actual bucket name
    .getPublicUrl(imagePath).data.publicUrl;
}
