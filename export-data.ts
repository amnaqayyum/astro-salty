import { writeFileSync, mkdirSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from './src/lib/database.types.ts';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function exportData() {
  console.log('Exporting data from Supabase...');

  // Export projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'publish')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('date', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  } else {
    mkdirSync('src/data', { recursive: true });
    writeFileSync('src/data/projects.json', JSON.stringify(projects, null, 2));
    console.log(`✓ Exported ${projects?.length} projects`);
  }

  // Export press items
  const { data: press, error: pressError } = await supabase
    .from('press_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (pressError) {
    console.error('Error fetching press:', pressError);
  } else {
    writeFileSync('src/data/press.json', JSON.stringify(press, null, 2));
    console.log(`✓ Exported ${press?.length} press items`);
  }

  // Export home gallery
  const { data: gallery, error: galleryError } = await supabase
    .from('home_gallery')
    .select('*')
    .order('sort_order', { ascending: true });

  if (galleryError) {
    console.error('Error fetching gallery:', galleryError);
  } else {
    writeFileSync('src/data/home-gallery.json', JSON.stringify(gallery, null, 2));
    console.log(`✓ Exported ${gallery?.length} home gallery images`);
  }

  console.log('Export complete!');
}

exportData();
