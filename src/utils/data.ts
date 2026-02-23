import type { ProjectData, PressItem } from '../types';
import { supabase } from '../lib/supabase';
import projectsJson from '../data/projects.json';
import pressJson from '../data/press.json';
import homeGalleryJson from '../data/home-gallery.json';

export interface HomeGalleryImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_dark: boolean;
}

export async function getHomeGalleryImages(): Promise<HomeGalleryImage[]> {
  if (!supabase) {
    return homeGalleryJson as HomeGalleryImage[];
  }

  const { data, error } = await supabase
    .from('home_gallery')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllProjects(): Promise<ProjectData[]> {
  if (!supabase) {
    return projectsJson.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      date: row.date,
      modified: row.modified,
      status: row.status,
      link: '',
      metadata: {
        info: row.info || '',
        year: row.year || '',
        category: row.category || '',
        status: row.project_status || '',
        photo_credit: row.photo_credit || '',
      },
      images: row.images || [],
    }));
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'publish')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('date', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    date: row.date,
    modified: row.modified,
    status: row.status,
    link: '',
    metadata: {
      info: row.info || '',
      year: row.year || '',
      category: row.category || '',
      status: row.project_status || '',
      photo_credit: row.photo_credit || '',
    },
    images: row.images || [],
  }));
}

export async function getProjectBySlug(slug: string): Promise<ProjectData | null> {
  if (!supabase) {
    const project = projectsJson.find((p: any) => p.slug === slug);
    if (!project) return null;

    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      date: project.date,
      modified: project.modified,
      status: project.status,
      link: '',
      metadata: {
        info: project.info || '',
        year: project.year || '',
        category: project.category || '',
        status: project.project_status || '',
        photo_credit: project.photo_credit || '',
      },
      images: project.images || [],
    };
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    date: data.date,
    modified: data.modified,
    status: data.status,
    link: '',
    metadata: {
      info: data.info || '',
      year: data.year || '',
      category: data.category || '',
      status: data.project_status || '',
      photo_credit: data.photo_credit || '',
    },
    images: data.images || [],
  };
}

export async function getAllPressItems(): Promise<PressItem[]> {
  if (!supabase) {
    return pressJson.map((row: any) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      date: row.date,
      link: row.link,
      info: row.info || '',
      category: row.category || 'Press',
    }));
  }

  const { data, error } = await supabase
    .from('press_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    date: row.date,
    link: row.link,
    info: row.info || '',
    category: row.category || 'Press',
  }));
}
