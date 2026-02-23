import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from './src/lib/database.types.ts';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function verify() {
  const { data, error } = await supabase
    .from('projects')
    .select('slug, title, images')
    .eq('slug', 'mdlgn-pth')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('MD Penthouse images:');
  const images = data.images as string[];
  console.log('First image:', images[0]);
  console.log('Contains supabase?', images[0]?.includes('supabase'));
  console.log('Total images:', images.length);
}

verify();
