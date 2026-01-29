import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { DOMParser } from '@xmldom/xmldom';

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  date: string;
  modified: string;
  status: string;
  link: string;
  metadata: {
    info?: string;
    year?: string;
    category?: string;
    photo_credit?: string;
    status?: string;
    gallery?: string[];
  };
  images: string[];
}

interface PressItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  link: string;
  info?: string;
  category?: string;
  attachment_url?: string;
}

interface AttachmentData {
  id: string;
  title: string;
  url: string;
  filename: string;
}

class WordPressExtractor {
  private doc: Document;
  private attachments: Map<string, AttachmentData> = new Map();
  private projects: ProjectData[] = [];
  private pressItems: PressItem[] = [];

  constructor(xmlFilePath: string) {
    const xmlContent = fs.readFileSync(xmlFilePath, 'utf-8');
    const parser = new DOMParser();
    this.doc = parser.parseFromString(xmlContent, 'text/xml');
  }

  private getTextContent(element: Element | null): string {
    if (!element) return '';
    return element.textContent?.trim() || '';
  }

  private extractCDATA(text: string): string {
    const match = text.match(/!\[CDATA\[(.*?)\]\]/s);
    return match ? match[1] : text;
  }

  async run() {
    console.log('Parsing WordPress dump...');
    this.parseAttachments();
    this.parseProjects();
    this.parsePressItems();
    
    console.log(`Found ${this.projects.length} projects and ${this.pressItems.length} press items`);
    
    await this.createDirectories();
    await this.saveProjects();
    await this.savePressItems();
    
    console.log('Extraction completed successfully!');
  }

  private parseAttachments() {
    const items = this.doc.getElementsByTagName('item');
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const postType = this.getTextContent(item.getElementsByTagName('wp:post_type')[0]);
      
      if (postType === 'attachment') {
        const id = this.getTextContent(item.getElementsByTagName('wp:post_id')[0]);
        const title = this.extractCDATA(this.getTextContent(item.getElementsByTagName('title')[0]));
        const attachmentUrl = this.getTextContent(item.getElementsByTagName('wp:attachment_url')[0]);
        
        if (attachmentUrl) {
          const url = this.extractCDATA(attachmentUrl);
          const filename = path.basename(url);
          
          this.attachments.set(id, {
            id,
            title,
            url,
            filename
          });
        }
      }
    }
    
    console.log(`Found ${this.attachments.size} attachments`);
  }

  private parseProjects() {
    const items = this.doc.getElementsByTagName('item');
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const postType = this.getTextContent(item.getElementsByTagName('wp:post_type')[0]);
      
      if (postType === 'project') {
        const id = this.getTextContent(item.getElementsByTagName('wp:post_id')[0]);
        const title = this.extractCDATA(this.getTextContent(item.getElementsByTagName('title')[0]));
        const slug = this.extractCDATA(this.getTextContent(item.getElementsByTagName('wp:post_name')[0]));
        const date = this.getTextContent(item.getElementsByTagName('wp:post_date')[0]);
        const modified = this.getTextContent(item.getElementsByTagName('wp:post_modified')[0]);
        const status = this.extractCDATA(this.getTextContent(item.getElementsByTagName('wp:status')[0]));
        const link = this.extractCDATA(this.getTextContent(item.getElementsByTagName('link')[0]));

        // Skip draft, private, or unpublished projects
        if (status !== 'publish') {
          console.log(`Skipping project "${title}" with status: ${status}`);
          continue;
        }

        // Skip projects without proper slugs
        if (!slug || slug.trim() === '') {
          console.log(`Skipping project "${title}" with empty slug`);
          continue;
        }

        // Extract metadata
        const postmetas = item.getElementsByTagName('wp:postmeta');
        const metadata: any = {};
        const galleryImages: string[] = [];

        for (let j = 0; j < postmetas.length; j++) {
          const meta = postmetas[j];
          const key = this.getTextContent(meta.getElementsByTagName('wp:meta_key')[0]);
          const value = this.extractCDATA(this.getTextContent(meta.getElementsByTagName('wp:meta_value')[0]));

          if (key.startsWith('gallery_') && key.endsWith('_image') && !key.startsWith('_')) {
            galleryImages.push(value);
          } else if (['info', 'year', 'category', 'photo_credit', 'status'].includes(key)) {
            metadata[key] = value;
          }
        }

        // Get image URLs for gallery images
        const images: string[] = [];
        for (const imageId of galleryImages) {
          const attachment = this.attachments.get(imageId);
          if (attachment) {
            images.push(attachment.url);
          }
        }

        this.projects.push({
          id,
          title,
          slug,
          date,
          modified,
          status,
          link,
          metadata,
          images
        });
      }
    }
  }

  private parsePressItems() {
    const items = this.doc.getElementsByTagName('item');
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const postType = this.getTextContent(item.getElementsByTagName('wp:post_type')[0]);
      const postName = this.extractCDATA(this.getTextContent(item.getElementsByTagName('wp:post_name')[0]));
      
      // Look for the press page specifically
      if (postType === 'page' && postName === 'press') {
        console.log('Found press page, extracting press items...');
        
        // Extract press items from ACF repeater fields
        const postmetas = item.getElementsByTagName('wp:postmeta');
        const pressItemsData: any = {};
        
        // First, get the count of items
        let itemCount = 0;
        for (let j = 0; j < postmetas.length; j++) {
          const meta = postmetas[j];
          const key = this.getTextContent(meta.getElementsByTagName('wp:meta_key')[0]);
          const value = this.extractCDATA(this.getTextContent(meta.getElementsByTagName('wp:meta_value')[0]));
          
          if (key === 'items') {
            itemCount = parseInt(value);
            break;
          }
        }
        
        console.log(`Found ${itemCount} press items`);
        
        // Extract all press item metadata
        for (let j = 0; j < postmetas.length; j++) {
          const meta = postmetas[j];
          const key = this.getTextContent(meta.getElementsByTagName('wp:meta_key')[0]);
          const value = this.extractCDATA(this.getTextContent(meta.getElementsByTagName('wp:meta_value')[0]));
          
          // Parse items_X_field pattern
          const match = key.match(/^items_(\d+)_(.+)$/);
          if (match) {
            const itemIndex = parseInt(match[1]);
            const fieldName = match[2];
            
            if (!pressItemsData[itemIndex]) {
              pressItemsData[itemIndex] = {};
            }
            pressItemsData[itemIndex][fieldName] = value;
          }
        }
        
        // Convert to press items array
        for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
          const itemData = pressItemsData[itemIndex];
          if (itemData) {
            // Get attachment URL if there's a file reference
            let attachmentUrl = undefined;
            if (itemData.file) {
              const attachment = this.attachments.get(itemData.file);
              if (attachment) {
                attachmentUrl = attachment.url;
              }
            }
            
            this.pressItems.push({
              id: `press_${itemIndex}`,
              title: itemData.title || 'Untitled',
              slug: `press-item-${itemIndex}`,
              date: itemData.year || '',
              link: itemData.url || '',
              info: itemData.info || '',
              category: itemData.category || '',
              attachment_url: attachmentUrl
            });
          }
        }
        
        break; // We found the press page, no need to continue
      }
      
      // Also look for press attachments as fallback
      const link = this.extractCDATA(this.getTextContent(item.getElementsByTagName('link')[0]));
      if (link && link.includes('/press/') && postType === 'attachment') {
        const id = this.getTextContent(item.getElementsByTagName('wp:post_id')[0]);
        const title = this.extractCDATA(this.getTextContent(item.getElementsByTagName('title')[0]));
        const slug = this.extractCDATA(this.getTextContent(item.getElementsByTagName('wp:post_name')[0]));
        const date = this.getTextContent(item.getElementsByTagName('wp:post_date')[0]);
        const attachmentUrl = this.getTextContent(item.getElementsByTagName('wp:attachment_url')[0]);

        this.pressItems.push({
          id,
          title,
          slug,
          date,
          link,
          attachment_url: attachmentUrl ? this.extractCDATA(attachmentUrl) : undefined
        });
      }
    }
  }

  private async createDirectories() {
    const dataDir = path.join(process.cwd(), 'data');
    const projectsDir = path.join(dataDir, 'projects');
    const pressDir = path.join(dataDir, 'press');

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    if (!fs.existsSync(projectsDir)) fs.mkdirSync(projectsDir);
    if (!fs.existsSync(pressDir)) fs.mkdirSync(pressDir);
  }

  private async saveProjects() {
    for (const project of this.projects) {
      const projectDir = path.join(process.cwd(), 'data', 'projects', project.slug);
      if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

      // Save project JSON
      const projectFile = path.join(projectDir, `${project.slug}.json`);
      fs.writeFileSync(projectFile, JSON.stringify(project, null, 2));

      // Download images
      await this.downloadProjectImages(project, projectDir);
      
      console.log(`✓ Saved project: ${project.title}`);
    }
  }

  private async downloadProjectImages(project: ProjectData, projectDir: string) {
    for (let i = 0; i < project.images.length; i++) {
      const imageUrl = project.images[i];
      const imageExtension = path.extname(imageUrl).split('?')[0] || '.png';
      const imagePath = path.join(projectDir, `image${i + 1}${imageExtension}`);
      
      try {
        await this.downloadFile(imageUrl, imagePath);
        console.log(`  Downloaded: image${i + 1}${imageExtension}`);
      } catch (error) {
        console.error(`  Failed to download ${imageUrl}:`, error);
      }
    }
  }

  private async savePressItems() {
    const pressDir = path.join(process.cwd(), 'data', 'press');
    
    for (const pressItem of this.pressItems) {
      const pressFile = path.join(pressDir, `${pressItem.slug || pressItem.id}.json`);
      fs.writeFileSync(pressFile, JSON.stringify(pressItem, null, 2));
      console.log(`✓ Saved press item: ${pressItem.title}`);
    }
  }

  private downloadFile(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      
      const file = fs.createWriteStream(filepath);
      
      client.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          file.close();
          fs.unlinkSync(filepath); // Delete the file on error
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      }).on('error', (error) => {
        file.close();
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath); // Delete the file on error
        }
        reject(error);
      });
    });
  }
}

// Main execution
async function main() {
  const xmlFile = process.argv[2] || 'wordpress-dump.xml';
  
  if (!fs.existsSync(xmlFile)) {
    console.error(`Error: WordPress dump file '${xmlFile}' not found.`);
    process.exit(1);
  }

  try {
    const extractor = new WordPressExtractor(xmlFile);
    await extractor.run();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 