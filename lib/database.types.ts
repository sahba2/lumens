/**
 * LUMENS - Supabase database types
 * --------------------------------
 * Hand-maintained mirror of `supabase/migrations/*.sql`.
 * Regenerate with `supabase gen types typescript --project-id <ref>` whenever
 * the SQL schema changes, keeping this file as the single typed contract used
 * by `lib/supabase.ts`, `lib/auth.ts` and the query helpers.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "instructor" | "editor" | "admin";
export type ContentStatus = "draft" | "review" | "published" | "archived";
export type ObjectLicense = "personal" | "commercial" | "extended";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          role: UserRole;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          role?: UserRole;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          website?: string | null;
          role?: UserRole;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      article_categories: {
        Row: {
          slug: string;
          label: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          slug: string;
          label: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          label?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          content: string;
          cover_image: string | null;
          category_slug: string;
          tags: string[];
          palette: string[];
          author_id: string | null;
          author_name: string;
          status: ContentStatus;
          featured: boolean;
          read_time: number;
          locale: string;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string[];
          canonical_url: string | null;
          og_image: string | null;
          robots_index: boolean;
          robots_follow: boolean;
          view_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          content?: string;
          cover_image?: string | null;
          category_slug: string;
          tags?: string[];
          palette?: string[];
          author_id?: string | null;
          author_name: string;
          status?: ContentStatus;
          featured?: boolean;
          read_time?: number;
          locale?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          canonical_url?: string | null;
          og_image?: string | null;
          robots_index?: boolean;
          robots_follow?: boolean;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          content?: string;
          cover_image?: string | null;
          category_slug?: string;
          tags?: string[];
          palette?: string[];
          author_id?: string | null;
          author_name?: string;
          status?: ContentStatus;
          featured?: boolean;
          read_time?: number;
          locale?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string[];
          canonical_url?: string | null;
          og_image?: string | null;
          robots_index?: boolean;
          robots_follow?: boolean;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_category_slug_fkey";
            columns: ["category_slug"];
            isOneToOne: false;
            referencedRelation: "article_categories";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "articles_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      object_categories: {
        Row: {
          slug: string;
          label: string;
          label_en: string | null;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          slug: string;
          label: string;
          label_en?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          slug?: string;
          label?: string;
          label_en?: string | null;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          category_slug: string;
          format: string;
          polygons: number;
          file_size_bytes: number;
          software: string[];
          tags: string[];
          palette: string[];
          price: number;
          is_free: boolean;
          rating: number;
          downloads: number;
          thumbnail_url: string | null;
          preview_urls: string[];
          model_path: string | null;
          license: ObjectLicense;
          attribution: string | null;
          status: ContentStatus;
          featured: boolean;
          author_id: string | null;
          seo_title: string | null;
          seo_description: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          search_vector: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string;
          category_slug: string;
          format?: string;
          polygons?: number;
          file_size_bytes?: number;
          software?: string[];
          tags?: string[];
          palette?: string[];
          price?: number;
          rating?: number;
          downloads?: number;
          thumbnail_url?: string | null;
          preview_urls?: string[];
          model_path?: string | null;
          license?: ObjectLicense;
          attribution?: string | null;
          status?: ContentStatus;
          featured?: boolean;
          author_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string;
          category_slug?: string;
          format?: string;
          polygons?: number;
          file_size_bytes?: number;
          software?: string[];
          tags?: string[];
          palette?: string[];
          price?: number;
          rating?: number;
          downloads?: number;
          thumbnail_url?: string | null;
          preview_urls?: string[];
          model_path?: string | null;
          license?: ObjectLicense;
          attribution?: string | null;
          status?: ContentStatus;
          featured?: boolean;
          author_id?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "objects_category_slug_fkey";
            columns: ["category_slug"];
            isOneToOne: false;
            referencedRelation: "object_categories";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "objects_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      object_downloads: {
        Row: {
          id: number;
          object_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          object_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          object_id?: string;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "object_downloads_object_id_fkey";
            columns: ["object_id"];
            isOneToOne: false;
            referencedRelation: "objects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "object_downloads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: { p_roles: UserRole[]; p_user_id?: string | null };
        Returns: boolean;
      };
      is_staff: {
        Args: { p_user_id?: string | null };
        Returns: boolean;
      };
      lumens_normalize_fa: {
        Args: { input: string };
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      content_status: ContentStatus;
      object_license: ObjectLicense;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/** Convenience aliases used by the data-access helpers. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type ProfileRow = Tables<"profiles">;
export type ArticleRow = Tables<"articles">;
export type ArticleCategoryRow = Tables<"article_categories">;
export type ObjectRow = Tables<"objects">;
export type ObjectCategoryRow = Tables<"object_categories">;
export type ObjectDownloadRow = Tables<"object_downloads">;
