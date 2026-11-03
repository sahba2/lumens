-- ============================================================================
-- LUMENS · 02 · Articles, categories and full-text search
-- ----------------------------------------------------------------------------
-- Blog schema: `article_categories` (seeded from lib/data.ts) + `articles`
-- with SEO fields, a generated `search_vector` for Persian-aware search and
-- editorial RLS (authors manage their own drafts, editors/admins publish).
-- Depends on 20261021090000_profiles.sql (enums, profiles, is_staff()).
-- ============================================================================

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Persian text normalization (ی/ك, ZWNJ, diacritics, Arabic digits)
-- ---------------------------------------------------------------------------
create or replace function public.lumens_normalize_fa(input text)
returns text
language sql
immutable
parallel safe
as $function$
  select btrim(
    regexp_replace(
      translate(
        lower(coalesce(input, '')),
        'يﻯﻰكﻙۀةأإآ٠١٢٣٤٥٦٧٨٩',
        'یییککههااا0123456789'
      ),
      U&'[\064B-\0652\200C\200E\200F]+',
      ' ',
      'g'
    )
  );
$function$;

create or replace function public.lumens_tags_text(tags text[])
returns text
language sql
immutable
parallel safe
as $function$
  select coalesce(array_to_string(tags, ' '), '');
$function$;

comment on function public.lumens_normalize_fa(text) is
  'Normalizes Persian/Arabic characters and digits so search matches ی/ك variants.';

-- ---------------------------------------------------------------------------
-- Categories (labels mirror lib/data.ts `articleCategories`)
-- ---------------------------------------------------------------------------
create table if not exists public.article_categories (
  slug text primary key,
  label text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint article_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.article_categories is
  'Editorial categories for the LUMENS blog; slugs are stable URL segments.';

insert into public.article_categories (slug, label, description, sort_order)
values
  ('ai-architecture', 'هوش مصنوعی و معماری',
   'تأثیر مدل‌های مولد بر فرایند طراحی و ایده‌پردازی معمارانه.', 1),
  ('prompting', 'پرامپت‌نویسی',
   'ساختار و تکنیک‌های نوشتن پرامپت دقیق برای ابزارهای تصویری.', 2),
  ('rendering', 'رندرینگ',
   'رندر معماری، نورپردازی، متریال و ویرایش تصویر نهایی.', 3),
  ('workflow', 'گردش کار',
   'اتصال ابزارها به یک زنجیره کاری منسجم از کانسپت تا ارائه.', 4),
  ('tools', 'ابزارها',
   'معرفی و مقایسه نرم‌افزارها و افزونه‌های تخصصی معماری.', 5),
  ('future-seo', 'آینده و سئو',
   'روندهای آینده، سئوی بصری و دیده‌شدن آثار معماری.', 6)
on conflict (slug) do update
  set label = excluded.label,
      description = excluded.description,
      sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text not null,
  content text not null default '',
  cover_image text,
  category_slug text not null
    references public.article_categories (slug) on update cascade on delete restrict,
  tags text[] not null default '{}'::text[],
  palette text[] not null default '{}'::text[],
  author_id uuid references public.profiles (id) on delete set null,
  author_name text not null default '',
  status public.content_status not null default 'draft',
  featured boolean not null default false,
  read_time integer not null default 5,
  locale text not null default 'fa-IR',
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}'::text[],
  canonical_url text,
  og_image text,
  robots_index boolean not null default true,
  robots_follow boolean not null default true,
  view_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', public.lumens_normalize_fa(title)), 'A') ||
    setweight(to_tsvector('simple', public.lumens_normalize_fa(excerpt)), 'B') ||
    setweight(to_tsvector('simple', public.lumens_normalize_fa(public.lumens_tags_text(tags))), 'B') ||
    setweight(
      to_tsvector('simple', left(public.lumens_normalize_fa(content), 20000)),
      'C'
    )
  ) stored,
  constraint articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint articles_slug_unique unique (slug),
  constraint articles_title_length check (char_length(title) between 3 and 160),
  constraint articles_excerpt_length check (char_length(excerpt) between 10 and 400),
  constraint articles_read_time_positive check (read_time between 1 and 120),
  constraint articles_view_count_non_negative check (view_count >= 0),
  constraint articles_palette_size check (cardinality(palette) = 0 or cardinality(palette) = 2),
  constraint articles_published_requires_date check (status <> 'published' or published_at is not null)
);

-- ---------------------------------------------------------------------------
-- Editorial guards: published rows are owned by editors/admins
-- ---------------------------------------------------------------------------
create or replace function public.guard_publish_permission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if new.status = 'published' then
    if new.published_at is null then
      new.published_at := now();
    end if;

    if auth.uid() is not null and not public.is_staff(auth.uid()) then
      if tg_op = 'INSERT' then
        raise exception 'PUBLISH_FORBIDDEN'
          using hint = 'Only editors and admins can publish content.';
      elsif old.status is distinct from 'published' then
        raise exception 'PUBLISH_FORBIDDEN'
          using hint = 'Only editors and admins can publish content.';
      end if;
    end if;
  end if;

  return new;
end;
$function$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists articles_guard_publish on public.articles;
create trigger articles_guard_publish
  before insert or update on public.articles
  for each row execute function public.guard_publish_permission();

-- ---------------------------------------------------------------------------
-- Search & listing indexes
-- ---------------------------------------------------------------------------
create index if not exists articles_search_vector_idx
  on public.articles using gin (search_vector);
create index if not exists articles_tags_idx
  on public.articles using gin (tags);
create index if not exists articles_title_trgm_idx
  on public.articles using gin (title gin_trgm_ops);
create index if not exists articles_category_slug_idx
  on public.articles (category_slug);
create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);
create index if not exists articles_featured_idx
  on public.articles (featured) where featured;
create index if not exists articles_author_id_idx
  on public.articles (author_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;

drop policy if exists "Article categories are public" on public.article_categories;
create policy "Article categories are public"
  on public.article_categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Staff manage article categories" on public.article_categories;
create policy "Staff manage article categories"
  on public.article_categories for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Published articles are public" on public.articles;
create policy "Published articles are public"
  on public.articles for select
  to anon, authenticated
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_staff()
  );

drop policy if exists "Authors create their own drafts" on public.articles;
create policy "Authors create their own drafts"
  on public.articles for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and status in ('draft', 'review')
  );

drop policy if exists "Authors edit their own drafts" on public.articles;
create policy "Authors edit their own drafts"
  on public.articles for update
  to authenticated
  using (
    author_id = auth.uid()
    and status in ('draft', 'review')
  )
  with check (
    author_id = auth.uid()
    and status in ('draft', 'review')
  );

drop policy if exists "Staff manage all articles" on public.articles;
create policy "Staff manage all articles"
  on public.articles for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "Authors delete their own drafts" on public.articles;
create policy "Authors delete their own drafts"
  on public.articles for delete
  to authenticated
  using (author_id = auth.uid() and status in ('draft', 'review'));

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------
grant select on public.article_categories, public.articles to anon, authenticated;
grant insert, update, delete on public.article_categories, public.articles to authenticated;
grant all on public.article_categories, public.articles to service_role;
