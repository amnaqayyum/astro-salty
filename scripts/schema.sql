-- Supabase Schema for Salty Architects CMS
-- Run this in Supabase SQL Editor

-- IMPORTANT: Create a storage bucket named 'images' in Supabase Dashboard > Storage
-- Then run these policies:

-- Storage bucket policies (run after creating 'images' bucket)
-- INSERT POLICY "Anyone can upload images"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'images');

-- SELECT POLICY "Public read access"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'images');

-- Settings table (for deploy tracking, etc.)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated write for settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Initialize last_deployed_at
INSERT INTO settings (key, value) VALUES ('last_deployed_at', '"2024-01-01T00:00:00Z"');

-- Home gallery table
CREATE TABLE home_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_dark BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_home_gallery_sort ON home_gallery(sort_order);

ALTER TABLE home_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for home_gallery"
  ON home_gallery FOR SELECT
  USING (true);

CREATE POLICY "Authenticated insert for home_gallery"
  ON home_gallery FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update for home_gallery"
  ON home_gallery FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete for home_gallery"
  ON home_gallery FOR DELETE
  TO authenticated
  USING (true);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'publish',
  link TEXT,
  info TEXT,
  year TEXT,
  category TEXT,
  project_status TEXT,
  photo_credit TEXT,
  images TEXT[],
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Press items table
CREATE TABLE press_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  date TEXT NOT NULL,
  link TEXT NOT NULL,
  info TEXT,
  category TEXT DEFAULT 'Press',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_sort_order ON projects(sort_order);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_press_items_slug ON press_items(slug);

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_items ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Public read access for press_items"
  ON press_items FOR SELECT
  USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated insert for projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update for projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete for projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated insert for press_items"
  ON press_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update for press_items"
  ON press_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated delete for press_items"
  ON press_items FOR DELETE
  TO authenticated
  USING (true);
