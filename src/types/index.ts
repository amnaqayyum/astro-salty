export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  date: string;
  modified: string;
  status: string;
  link: string;
  metadata: {
    info: string;
    year: string;
    category: string;
    status: string;
    photo_credit: string;
  };
  images: string[];
}

export interface PressItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  link: string;
  info: string;
  category: string;
}

export interface ContactInfo {
  name: string;
  phone?: string;
  email: string;
}