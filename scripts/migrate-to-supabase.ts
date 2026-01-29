import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateProjects() {
  const projectsDir = path.join(process.cwd(), 'data', 'projects');
  const folders = fs.readdirSync(projectsDir);

  let sortOrder = 1;
  let migrated = 0;

  for (const folder of folders) {
    const folderPath = path.join(projectsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const jsonPath = path.join(folderPath, `${folder}.json`);
    if (!fs.existsSync(jsonPath)) continue;

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // MD Penthouse gets sort_order 0
    const isMDPenthouse = data.title?.includes('MD Penthouse');

    const { error } = await supabase.from('projects').insert({
      title: data.title,
      slug: data.slug,
      date: data.date,
      modified: data.modified,
      status: data.status || 'publish',
      link: data.link || null,
      info: data.metadata?.info || null,
      year: data.metadata?.year || null,
      category: data.metadata?.category || null,
      project_status: data.metadata?.status || null,
      photo_credit: data.metadata?.photo_credit || null,
      images: data.images || [],
      sort_order: isMDPenthouse ? 0 : sortOrder++,
    });

    if (error) {
      console.error(`Failed: ${folder}`, error.message);
    } else {
      console.log(`Migrated project: ${data.title}`);
      migrated++;
    }
  }

  console.log(`\nProjects migrated: ${migrated}`);
}

async function migratePressItems() {
  const pressDir = path.join(process.cwd(), 'data', 'press');
  const files = fs.readdirSync(pressDir).filter((f) => f.endsWith('.json'));

  let migrated = 0;

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(pressDir, file), 'utf-8'));

    const { error } = await supabase.from('press_items').insert({
      title: data.title,
      slug: data.slug,
      date: data.date,
      link: data.link,
      info: data.info || null,
      category: data.category || 'Press',
    });

    if (error) {
      console.error(`Failed: ${file}`, error.message);
    } else {
      console.log(`Migrated press: ${data.title}`);
      migrated++;
    }
  }

  console.log(`\nPress items migrated: ${migrated}`);
}

async function migrateHomeGallery() {
  const homeDir = path.join(process.cwd(), 'assets', 'home');

  if (!fs.existsSync(homeDir)) {
    console.log('No assets/home directory found, skipping home gallery');
    return;
  }

  const files = fs.readdirSync(homeDir)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .sort();

  let migrated = 0;
  const darkImages = ['image5.png']; // Images that need white text

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(homeDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    const ext = path.extname(file);
    const storagePath = `home-gallery/${Date.now()}-${i}${ext}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(storagePath, fileBuffer, {
        contentType: `image/${ext.slice(1)}`,
        upsert: false,
      });

    if (uploadError) {
      console.error(`Failed to upload ${file}:`, uploadError.message);
      continue;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(storagePath);

    // Insert into home_gallery table
    const { error: insertError } = await supabase.from('home_gallery').insert({
      image_url: urlData.publicUrl,
      sort_order: i,
      is_dark: darkImages.includes(file),
    });

    if (insertError) {
      console.error(`Failed to insert ${file}:`, insertError.message);
    } else {
      console.log(`Migrated home gallery: ${file}`);
      migrated++;
    }
  }

  console.log(`\nHome gallery images migrated: ${migrated}`);
}

async function main() {
  console.log('Starting migration to Supabase...\n');

  console.log('--- Migrating Home Gallery ---');
  await migrateHomeGallery();

  console.log('\n--- Migrating Projects ---');
  await migrateProjects();

  console.log('\n--- Migrating Press Items ---');
  await migratePressItems();

  console.log('\nMigration complete!');
}

main().catch(console.error);
