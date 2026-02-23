import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from './src/lib/database.types.ts';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface StorageFile {
  name: string;
}

async function listStorageFiles(path: string = ''): Promise<StorageFile[]> {
  const { data, error } = await supabase.storage.from('images').list(path);

  if (error) {
    console.error(`Error listing files in "${path}":`, error);
    return [];
  }

  let allFiles: StorageFile[] = [];

  for (const item of data || []) {
    const itemPath = path ? `${path}/${item.name}` : item.name;

    // If it's a folder, recurse into it
    if (item.id === null) {
      const subFiles = await listStorageFiles(itemPath);
      allFiles = allFiles.concat(subFiles);
    } else {
      allFiles.push({ name: itemPath });
    }
  }

  return allFiles;
}

function extractFilename(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

function buildSupabaseUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/images/${storagePath}`;
}

async function updateImageUrls() {
  console.log('🔄 Starting image URL update...\n');

  // 1. List all storage files and create a filename -> path map
  console.log('📦 Building storage file map...');
  const storageFiles = await listStorageFiles();
  const filenameMap = new Map<string, string>();

  for (const file of storageFiles) {
    const filename = file.name.split('/').pop()!;
    filenameMap.set(filename, file.name);
  }
  console.log(`   Mapped ${filenameMap.size} files\n`);

  // 2. Get all projects
  console.log('📊 Fetching projects from database...');
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, slug, images, title');

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }
  console.log(`   Found ${projects?.length} projects\n`);

  // 3. Update each project
  console.log('🔧 Updating project image URLs:\n');
  let updatedCount = 0;
  let skippedCount = 0;

  for (const project of projects || []) {
    const images = project.images as string[] || [];

    if (images.length === 0) {
      console.log(`   ⏭️  ${project.title} - No images, skipping`);
      skippedCount++;
      continue;
    }

    // Check if already using Supabase URLs
    if (images[0]?.includes('supabase.co')) {
      console.log(`   ✓  ${project.title} - Already using Supabase URLs`);
      skippedCount++;
      continue;
    }

    // Map WordPress URLs to Supabase URLs
    const newImages: string[] = [];
    let allFound = true;

    for (const wpUrl of images) {
      const filename = extractFilename(wpUrl);
      const storagePath = filenameMap.get(filename);

      if (storagePath) {
        newImages.push(buildSupabaseUrl(storagePath));
      } else {
        console.log(`   ⚠️  ${project.title} - Missing: ${filename}`);
        allFound = false;
      }
    }

    if (!allFound) {
      console.log(`   ❌ ${project.title} - Some images missing, skipping update`);
      skippedCount++;
      continue;
    }

    // Update the project
    const { error: updateError } = await supabase
      .from('projects')
      .update({ images: newImages })
      .eq('id', project.id);

    if (updateError) {
      console.log(`   ❌ ${project.title} - Error updating: ${updateError.message}`);
      skippedCount++;
    } else {
      console.log(`   ✅ ${project.title} - Updated ${newImages.length} images`);
      updatedCount++;
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 UPDATE SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total projects:              ${projects?.length}`);
  console.log(`Updated:                     ${updatedCount}`);
  console.log(`Skipped:                     ${skippedCount}`);

  console.log('\n✨ Update complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: npx tsx export-data.ts');
  console.log('   2. Verify: Check src/data/projects.json for Supabase URLs');
  console.log('   3. Test: npm run dev and check /projects page');
  console.log('   4. Commit: git add src/data/projects.json');
  console.log('');
}

updateImageUrls();
