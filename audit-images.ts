import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import type { Database } from './src/lib/database.types.ts';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

interface StorageFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: any;
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
      allFiles.push({ ...item, name: itemPath });
    }
  }

  return allFiles;
}

function extractFilename(url: string): string {
  // Extract filename from WordPress URL
  // e.g., https://www.salty-arch.com/wp-content/uploads/2024/10/mod1036903.jpg -> mod1036903.jpg
  const parts = url.split('/');
  return parts[parts.length - 1];
}

async function audit() {
  console.log('🔍 Starting image audit...\n');

  // 1. List all storage files
  console.log('📦 Listing files in Supabase storage bucket "images"...');
  const storageFiles = await listStorageFiles();
  console.log(`   Found ${storageFiles.length} files in storage\n`);

  // 2. Get all projects with their images
  console.log('📊 Fetching projects from database...');
  const { data: projects, error } = await supabase
    .from('projects')
    .select('slug, images, title');

  if (error) {
    console.error('Error fetching projects:', error);
    return;
  }

  console.log(`   Found ${projects?.length} projects\n`);

  // 3. Analyze
  let totalWordPressUrls = 0;
  let matchedCount = 0;
  let missingFiles: string[] = [];
  const storageFileSet = new Set(storageFiles.map(f => f.name));

  console.log('📋 Analysis by project:\n');

  for (const project of projects || []) {
    const images = project.images as string[] || [];
    totalWordPressUrls += images.length;

    let projectMatched = 0;
    let projectMissing: string[] = [];

    for (const wpUrl of images) {
      const filename = extractFilename(wpUrl);

      // Check if filename exists anywhere in storage
      const found = storageFiles.some(sf => sf.name.endsWith(filename));

      if (found) {
        projectMatched++;
        matchedCount++;
      } else {
        projectMissing.push(filename);
        missingFiles.push(filename);
      }
    }

    console.log(`   ${project.title} (${project.slug}):`);
    console.log(`      Images: ${images.length} | Matched: ${projectMatched} | Missing: ${projectMissing.length}`);

    if (projectMissing.length > 0 && projectMissing.length <= 3) {
      console.log(`      Missing files: ${projectMissing.join(', ')}`);
    }
  }

  // 4. Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 SUMMARY:');
  console.log('='.repeat(60));
  console.log(`Total WordPress URLs:        ${totalWordPressUrls}`);
  console.log(`Total files in storage:      ${storageFiles.length}`);
  console.log(`Matched (found in storage):  ${matchedCount}`);
  console.log(`Missing from storage:        ${missingFiles.length}`);
  console.log(`Match percentage:            ${((matchedCount / totalWordPressUrls) * 100).toFixed(1)}%`);

  // Show storage structure sample
  console.log('\n📁 Storage structure sample (first 10 files):');
  storageFiles.slice(0, 10).forEach(f => {
    console.log(`   ${f.name}`);
  });

  if (missingFiles.length > 0) {
    console.log('\n⚠️  Missing files sample (first 10):');
    missingFiles.slice(0, 10).forEach(f => {
      console.log(`   ${f}`);
    });
  }

  // Recommendation
  console.log('\n💡 RECOMMENDATION:');
  const matchPercentage = (matchedCount / totalWordPressUrls) * 100;

  if (matchPercentage >= 90) {
    console.log('   ✅ Most images exist in Supabase storage.');
    console.log('   → Proceed with URL update script for matched files');
    console.log('   → Handle missing files separately');
  } else if (matchPercentage >= 50) {
    console.log('   ⚠️  Partial coverage in Supabase storage.');
    console.log('   → Migrate missing images first');
    console.log('   → Then run URL update script');
  } else {
    console.log('   ❌ Low coverage in Supabase storage.');
    console.log('   → Full migration needed');
    console.log('   → Run migration script to download and upload missing images');
  }

  console.log('\n✨ Audit complete!\n');
}

audit();
