export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          key: string
          value: any
          updated_at: string
        }
        Insert: {
          key: string
          value: any
          updated_at?: string
        }
        Update: {
          key?: string
          value?: any
          updated_at?: string
        }
      }
      home_gallery: {
        Row: {
          id: string
          image_url: string
          sort_order: number
          is_dark: boolean
          created_at: string
        }
        Insert: {
          id?: string
          image_url: string
          sort_order?: number
          is_dark?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          image_url?: string
          sort_order?: number
          is_dark?: boolean
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          date: string
          modified: string
          status: string
          info: string | null
          year: string | null
          category: string | null
          project_status: string | null
          photo_credit: string | null
          images: string[] | null
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          date?: string
          modified?: string
          status?: string
          info?: string | null
          year?: string | null
          category?: string | null
          project_status?: string | null
          photo_credit?: string | null
          images?: string[] | null
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          date?: string
          modified?: string
          status?: string
          info?: string | null
          year?: string | null
          category?: string | null
          project_status?: string | null
          photo_credit?: string | null
          images?: string[] | null
          sort_order?: number | null
          created_at?: string
        }
      }
      press_items: {
        Row: {
          id: string
          title: string
          slug: string
          date: string
          link: string
          info: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          date: string
          link: string
          info?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          date?: string
          link?: string
          info?: string | null
          category?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
