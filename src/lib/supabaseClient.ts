import { supabase } from './supabase';

export async function testConnection() {
  const { data, error } = await supabase
    .from('trails') // replace with your actual table name
    .select('*');

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  console.log('Data from Supabase:', data);
}

testConnection();
