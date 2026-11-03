-- ============================================================================
-- LUMENS · 03 · 3D objects library, downloads and storage buckets
-- ----------------------------------------------------------------------------
-- Catalogue schema for downloadable models: `object_categories`,
-- `objects` (pricing, license, previews, search vector) and
-- `object_downloads` (per-user download log that feeds the counter).
-- Depends on 20261021090000_profiles.sql (enums, profiles, is_staff(), set_updated_at)
-- and 20261021091000_articles.sql (guard_publish_permission).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Categories (mirror `objectCategories` in lib/data.ts)
-- ---------------------------------------------------------------------------
create table if not exists public.object_categories (
  slug text primary key,
  label text not null,
  label_en text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint object_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.object_categories is
  'Categories of the LUMENS 3D library; slugs mirror lib/data.ts.';

insert into public.object_categories (slug, label, label_en, description, sort_order)
values
  ('interior', 'مدل‌های داخلی', 'Interior',
   'اجزای فضای داخلی: دیوار، کف، نورپردازی و عناصر دکوراتیو.', 1),
  ('exterior', 'مدل‌های خارجی', 'Exterior',
   'حجم‌های بیرونی، نما، محوطه و عناصر شهری.', 2),
  ('furniture', 'مبلمان', 'Furniture',
   'مبلمان و اشیای صحنه با جزئیات مناسب رندر نزدیک.', 3)
on conflict (slug) do update
  set label = excluded.label,
      label_en = excluded.label_en,
      description = excluded.description,
      sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Objects
-- ---------------------------------------------------------------------------
create table if not exists public.objects (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text not null default '',
  category_slug text not null
    references public.object_categories (slug) on update cascade on delete restrict,
  format text not null default 'FBX',
  polygons integer not null default 0,
  file_size_bytes bigint not null default 0,
  software text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  palette text[] not null default '{}'::text[],
  price numeric(12, 0) not null default 0,
  is_free boolean generated always as ((price = 0)) stored,
  rating numeric(2, 1) not null default 0,
  downloads integer not null default 0,
  thumbnail_url text,
  preview_urls text[] not null default '{}'::text[],
  model_path text,
  license public.object_license not null default 'personal',
  attribution text,
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  author_id uuid references public.profiles (id) on delete set null,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', public.lumens_normalize_fa(title)), 'A') ||
    setweight(to_tsvector('simple', public.lumens_normalize_fa(description)), 'B') ||
    setweight(to_tsvector('simple', public.lumens_normalize_fa(public.lumens_tags_text(tags))), 'B') ||
    setweight(to_tsvector('simple', public.lumens_normalize_fa(public.lumens_tags_text(software))), 'C')
  ) stored,
  constraint objects_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint objects_slug_unique unique (slug),
  constraint objects_title_length check (char_length(title) between 3 and 160),
  constraint objects_price_non_negative check (price >= 0),
  constraint objects_rating_range check (rating >= 0 and rating <= 5),
  constraint objects_downloads_non_negative check (downloads >= 0),
  constraint objects_polygons_non_negative check (polygons >= 0),
  constraint objects_file_size_non_negative check (file_size_bytes >= 0),
  constraint objects_palette_size check (cardinality(palette) = 0 or cardinality(palette) = 2),
  constraint objects_published_requires_date check (status <> 'published' or published_at is not null)
);

comment on table public.objects is
  'Downloadable 3D models of the LUMENS library with pricing and license metadata.';
comment on column public.objects.is_free is
  'Generated from price; always keep price = 0 for free assets.';
comment on column public.objects.model_path is
  'Path inside the private `lumens-objects` storage bucket, never a public URL.';

-- ---------------------------------------------------------------------------
-- Download log (one row per download, feeds objects.downloads)
-- ---------------------------------------------------------------------------
create table if not exists public.object_downloads (
  id bigint generated by default as identity primary key,
  object_id uuid not null references public.objects (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.object_downloads is
  'Append-only download log used for statistics and the objects.downloads counter.';

create index if not exists object_downloads_object_id_idx
  on public.object_downloads (object_id, created_at desc);
create index if not exists object_downloads_user_id_idx
  on public.object_downloads (user_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
-- `downloads` is deliberately excluded so a download never touches updated_at.
drop trigger if exists objects_set_updated_at on public.objects;
create trigger objects_set_updated_at
  before update of
    slug, title, description, category_slug, format, polygons, file_size_bytes,
    software, tags, palette, price, rating, thumbnail_url, preview_urls,
    model_path, license, attribution, status, featured, author_id,
    seo_title, seo_description, published_at
  on public.objects
  for each row execute function public.set_updated_at();

drop trigger if exists objects_guard_publish on public.objects;
create trigger objects_guard_publish
  before insert or update on public.objects
  for each row execute function public.guard_publish_permission();

create or replace function public.record_object_download()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  update public.objects
     set downloads = downloads + 1
   where objects.id = new.object_id;

  return new;
end;
$function$;

drop trigger if exists object_downloads_increment_counter on public.object_downloads;
create trigger object_downloads_increment_counter
  after insert on public.object_downloads
  for each row execute function public.record_object_download();

-- ---------------------------------------------------------------------------
-- Search & listing indexes
-- ---------------------------------------------------------------------------
create index if not exists objects_search_vector_idx
  on public.objects using gin (search_vector);
create index if not exists objects_tags_idx
  on public.objects using gin (tags);
create index if not exists objects_title_trgm_idx
  on public.objects using gin (title gin_trgm_ops);
create index if not exists objects_category_slug_idx
  on public.objects (category_slug);
create index if not exists objects_status_published_at_idx
  on public.objects (status, published_at desc);
create index if not exists objects_price_idx
  on public.objects (price);
create index if not exists objects_downloads_idx
  on public.objects (downloads desc);
create index if not exists objects_featured_idx
  on public.objects (featured) where featured;
create index if not exists objects_author_id_idx
  on public.objects (author_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.object_categories enable row level security;
alter table public.objects enable row level security;
alter table public.object_downloads enable row level security;

drop policy if exists "Object categories are public" on public.object_categories;
create policy "Object categories are public"
  on public.object_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Staff manage object categories" on public.object_categories;
create policy "Staff manage object categories"
  on public.object_categories for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Published objects are public" on public.objects;
create policy "Published objects are public"
  on public.objects for select
  to anon, authenticated
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_staff()
  );

drop policy if exists "Authors create their own objects" on public.objects;
create policy "Authors create their own objects"
  on public.objects for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status in ('draft', 'review')
  );

drop policy if exists "Authors edit their own drafts" on public.objects;
create policy "Authors edit their own drafts"
  on public.objects for update
  to authenticated
  using (
    author_id = auth.uid()
    and status in ('draft', 'review')
  )
  with check (
    author_id = auth.uid()
    and status in ('draft', 'review')
  );

drop policy if exists "Staff manage all objects" on public.objects;
create policy "Staff manage all objects"
  on public.objects for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Authors delete their own drafts" on public.objects;
create policy "Authors delete their own drafts"
  on public.objects for delete
  to authenticated
  using (author_id = auth.uid() and status in ('draft', 'review'));

drop policy if exists "Visitors can log their downloads" on public.object_downloads;
create policy "Visitors can log their downloads"
  on public.object_downloads for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Users read their own downloads" on public.object_downloads;
create policy "Users read their own downloads"
  on public.object_downloads for select
  to authenticated
  using (user_id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
grant select on public.object_categories, public.objects to anon, authenticated;
grant insert, update, delete on public.object_categories, public.objects to authenticated;
grant select, insert on public.object_downloads to anon, authenticated;
grant usage, select on sequence public.object_downloads_id_seq to anon, authenticated;
grant all on public.object_categories, public.objects, public.object_downloads to service_role;
grant all on sequence public.object_downloads_id_seq to service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets (public previews + private model files)
-- ---------------------------------------------------------------------------
do $do$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage' and table_name = 'objects'
  ) then
    insert into storage.buckets (id, name, public)
    values
      ('lumens-articles', 'lumens-articles', true),
      ('lumens-objects', 'lumens-objects', true)
    on conflict (id) do nothing;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
        and policyname = 'LUMENS public media read'
    ) then
      create policy "LUMENS public media read"
        on storage.objects for select
        to anon, authenticated
        using (bucket_id in ('lumens-articles', 'lumens-objects'));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
        and policyname = 'LUMENS staff media write'
    ) then
      create policy "LUMENS staff media write"
        on storage.objects for insert
        to authenticated
        with check (
          bucket_id in ('lumens-articles', 'lumens-objects')
          and public.is_staff()
        );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
        and policyname = 'LUMENS staff media update'
    ) then
      create policy "LUMENS staff media update"
        on storage.objects for update
        to authenticated
        using (
          bucket_id in ('lumens-articles', 'lumens-objects')
          and public.is_staff()
        )
        with check (
          bucket_id in ('lumens-articles', 'lumens-objects')
          and public.is_staff()
        );
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'storage' and tablename = 'objects'
        and policyname = 'LUMENS staff media delete'
    ) then
      create policy "LUMENS staff media delete"
        on storage.objects for delete
        to authenticated
        using (
          bucket_id in ('lumens-articles', 'lumens-objects')
          and public.is_staff()
        );
    end if;
  end if;
end
$do$;
