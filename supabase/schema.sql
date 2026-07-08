-- ============================================================================
-- LA CASA DEL CAFTAN — SCHEMA SUPABASE COMPLET
-- ============================================================================
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query > coller > Run
-- Puis créer un compte normal sur le site, puis exécuter la requête tout en
-- bas du fichier ("PROMOUVOIR UN COMPTE EN ADMIN") avec ton propre email.
--
-- CONVENTION I18N : tous les champs de texte traduisibles sont stockés en
-- jsonb au format {"fr": "...", "en": "...", "ar": "..."}. C'est ce format
-- que le Dashboard Admin doit lire/écrire pour chaque langue.
--
-- CONVENTION SINGLETON : settings, contact_info et homepage_content n'ont
-- qu'une seule ligne (id = 1) : ce sont des réglages globaux du site, pas des
-- collections d'enregistrements.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. FONCTIONS UTILITAIRES
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. LANGUAGES
-- ----------------------------------------------------------------------------
create table public.languages (
  code text primary key,
  name text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 0
);

-- ----------------------------------------------------------------------------
-- 3. PROFILES (clients — étend auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  city text,
  address text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. ADMINS
-- ----------------------------------------------------------------------------
create table public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('super_admin','admin','editor')),
  created_at timestamptz not null default now()
);

-- security definer + stable : évite la récursion RLS quand une policy
-- appelle is_admin() sur une table qui elle-même dépend de public.admins.
-- Définie ICI (et pas avec les autres fonctions utilitaires plus haut) car
-- une fonction "language sql" est validée contre le catalogue dès sa
-- création : il faut que public.admins existe déjà à ce moment-là.
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ----------------------------------------------------------------------------
-- 5. CATEGORIES
-- ----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  description jsonb default '{}'::jsonb,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_categories_slug on public.categories(slug);
create index idx_categories_parent on public.categories(parent_id);
create trigger trg_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. COLLECTIONS
-- ----------------------------------------------------------------------------
create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  description jsonb default '{}'::jsonb,
  image_url text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_collections_slug on public.collections(slug);
create trigger trg_collections_updated_at before update on public.collections
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. PRODUCTS
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  description jsonb default '{}'::jsonb,
  price numeric(10,2) not null check (price >= 0),
  promo_price numeric(10,2) check (promo_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  collection_id uuid references public.collections(id) on delete set null,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  stock_quantity int not null default 0,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  meta_title jsonb default '{}'::jsonb,
  meta_description jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_slug on public.products(slug);
create index idx_products_category on public.products(category_id);
create index idx_products_collection on public.products(collection_id);
create index idx_products_active on public.products(is_active);
create index idx_products_featured on public.products(is_featured);
create trigger trg_products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 8. PRODUCT_IMAGES
-- ----------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_product_images_product on public.product_images(product_id);

-- ----------------------------------------------------------------------------
-- 9. PRODUCT_VARIANTS (stock par couleur/taille)
-- ----------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  stock_quantity int not null default 0,
  sku_suffix text,
  unique(product_id, color, size)
);
create index idx_product_variants_product on public.product_variants(product_id);

-- ----------------------------------------------------------------------------
-- 10. ORDERS
-- ----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  customer_first_name text not null,
  customer_last_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  shipping_city text not null,
  payment_method text not null default 'cod' check (payment_method in ('cod','bank_transfer','online')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded','not_applicable')),
  payment_provider text,
  payment_reference text,
  subtotal numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_payment_reference on public.orders(payment_reference);
create trigger trg_orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 11. ORDER_ITEMS
-- ----------------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  color text,
  size text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  subtotal numeric(10,2) not null
);
create index idx_order_items_order on public.order_items(order_id);

-- ----------------------------------------------------------------------------
-- 12. CART_ITEMS (panier persistant — utilisateurs connectés uniquement ;
--     le panier invité vit côté client dans localStorage, voir CartContext)
-- ----------------------------------------------------------------------------
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id, color, size)
);
create index idx_cart_items_user on public.cart_items(user_id);

-- ----------------------------------------------------------------------------
-- 13. WISHLIST
-- ----------------------------------------------------------------------------
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);
create index idx_wishlist_user on public.wishlist(user_id);

-- ----------------------------------------------------------------------------
-- 14. REVIEWS
-- ----------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_reviews_product on public.reviews(product_id);

-- ----------------------------------------------------------------------------
-- 15. MESSAGES (formulaire de contact + formulaire "sous chaque article")
-- ----------------------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'contact' check (type in ('contact','product_inquiry')),
  product_id uuid references public.products(id) on delete set null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  email text not null,
  city text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_messages_type on public.messages(type);
create index idx_messages_read on public.messages(is_read);

-- ----------------------------------------------------------------------------
-- 16. NEWSLETTER_SUBSCRIBERS
-- ----------------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 17. HERO_SLIDES
-- ----------------------------------------------------------------------------
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null default '{}'::jsonb,
  subtitle jsonb default '{}'::jsonb,
  image_url text not null,
  cta_text jsonb default '{}'::jsonb,
  cta_link text default '/boutique',
  display_order int not null default 0,
  is_active boolean not null default true
);

-- ----------------------------------------------------------------------------
-- 18. HOMEPAGE_CONTENT (singleton)
-- ----------------------------------------------------------------------------
create table public.homepage_content (
  id int primary key default 1 check (id = 1),
  why_us_title jsonb default '{}'::jsonb,
  why_us_items jsonb default '[]'::jsonb,
  about_preview_text jsonb default '{}'::jsonb,
  sections_order jsonb default
    '["hero","nouveautes","collections","pourquoi","galerie","avis","newsletter"]'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_homepage_updated_at before update on public.homepage_content
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 19. SETTINGS (singleton)
-- ----------------------------------------------------------------------------
create table public.settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'La Casa Del Caftan',
  logo_url text,
  favicon_url text,
  primary_color text not null default '#0A0A0A',
  secondary_color text not null default '#FAF9F6',
  accent_color text not null default '#D4AF37',
  currency text not null default 'DZD',
  whatsapp_number text,
  social_links jsonb default '{}'::jsonb,
  ga_measurement_id text,
  meta_pixel_id text,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 20. CONTACT_INFO (singleton)
-- ----------------------------------------------------------------------------
create table public.contact_info (
  id int primary key default 1 check (id = 1),
  phone text,
  whatsapp_number text,
  email text,
  address jsonb default '{}'::jsonb,
  google_maps_query text,
  opening_hours jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_contact_updated_at before update on public.contact_info
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 21. SEO (par page)
-- ----------------------------------------------------------------------------
create table public.seo (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  meta_title jsonb default '{}'::jsonb,
  meta_description jsonb default '{}'::jsonb,
  meta_keywords jsonb default '{}'::jsonb,
  og_image text,
  canonical_url text
);

-- ----------------------------------------------------------------------------
-- 22. GALLERY
-- ----------------------------------------------------------------------------
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption jsonb default '{}'::jsonb,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 23. FAQ
-- ----------------------------------------------------------------------------
create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question jsonb not null default '{}'::jsonb,
  answer jsonb not null default '{}'::jsonb,
  category text default 'general',
  display_order int not null default 0,
  is_active boolean not null default true
);

-- ----------------------------------------------------------------------------
-- 24. BANNERS
-- ----------------------------------------------------------------------------
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title jsonb default '{}'::jsonb,
  subtitle jsonb default '{}'::jsonb,
  link_url text,
  position text not null default 'home_top',
  display_order int not null default 0,
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz
);

-- ----------------------------------------------------------------------------
-- 25. TESTIMONIALS
-- ----------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating int not null default 5 check (rating between 1 and 5),
  comment jsonb not null default '{}'::jsonb,
  avatar_url text,
  is_approved boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 26. SITE_CONTENT (textes libres éditables — clé/valeur multilingue)
-- ----------------------------------------------------------------------------
create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  content_key text not null unique,
  content_value jsonb not null default '{}'::jsonb,
  content_type text not null default 'text' check (content_type in ('text','richtext','image','url')),
  description text
);

-- ----------------------------------------------------------------------------
-- 26bis. PAYMENT_EVENTS (journal brut des webhooks — idempotence + debug)
-- ----------------------------------------------------------------------------
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  order_id uuid references public.orders(id) on delete set null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

-- ============================================================================
-- 27. STORAGE BUCKETS
-- ============================================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true),
  ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

-- ============================================================================
-- 28. ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.hero_slides enable row level security;
alter table public.homepage_content enable row level security;
alter table public.settings enable row level security;
alter table public.contact_info enable row level security;
alter table public.seo enable row level security;
alter table public.gallery enable row level security;
alter table public.faq enable row level security;
alter table public.banners enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_content enable row level security;
alter table public.languages enable row level security;
alter table public.payment_events enable row level security;

-- ---- Lecture publique (contenu vitrine) ----
create policy public_read on public.languages for select using (true);
create policy public_read_active on public.categories for select using (is_active = true or is_admin());
create policy public_read_active on public.collections for select using (is_active = true or is_admin());
create policy public_read_active on public.products for select using (is_active = true or is_admin());
create policy public_read on public.product_images for select using (true);
create policy public_read on public.product_variants for select using (true);
create policy public_read_active on public.hero_slides for select using (is_active = true or is_admin());
create policy public_read on public.homepage_content for select using (true);
create policy public_read on public.settings for select using (true);
create policy public_read on public.contact_info for select using (true);
create policy public_read on public.seo for select using (true);
create policy public_read_active on public.gallery for select using (is_active = true or is_admin());
create policy public_read_active on public.faq for select using (is_active = true or is_admin());
create policy public_read_active on public.banners for select using (is_active = true or is_admin());
create policy public_read_approved on public.testimonials for select using (is_approved = true or is_admin());
create policy public_read_approved on public.reviews for select using (is_approved = true or is_admin());
create policy public_read on public.site_content for select using (true);

-- ---- Écriture réservée aux admins (contenu vitrine) ----
create policy admin_write on public.categories for all using (is_admin()) with check (is_admin());
create policy admin_write on public.collections for all using (is_admin()) with check (is_admin());
create policy admin_write on public.products for all using (is_admin()) with check (is_admin());
create policy admin_write on public.product_images for all using (is_admin()) with check (is_admin());
create policy admin_write on public.product_variants for all using (is_admin()) with check (is_admin());
create policy admin_write on public.hero_slides for all using (is_admin()) with check (is_admin());
create policy admin_write on public.homepage_content for all using (is_admin()) with check (is_admin());
create policy admin_write on public.settings for all using (is_admin()) with check (is_admin());
create policy admin_write on public.contact_info for all using (is_admin()) with check (is_admin());
create policy admin_write on public.seo for all using (is_admin()) with check (is_admin());
create policy admin_write on public.gallery for all using (is_admin()) with check (is_admin());
create policy admin_write on public.faq for all using (is_admin()) with check (is_admin());
create policy admin_write on public.banners for all using (is_admin()) with check (is_admin());
create policy admin_write on public.testimonials for all using (is_admin()) with check (is_admin());
create policy admin_write on public.site_content for all using (is_admin()) with check (is_admin());
create policy admin_write on public.languages for all using (is_admin()) with check (is_admin());

-- ---- admins ----
create policy admins_self_read on public.admins for select using (is_admin());
create policy admins_manage on public.admins for all using (is_admin()) with check (is_admin());

-- ---- profiles ----
create policy profile_self_select on public.profiles for select using (auth.uid() = id or is_admin());
create policy profile_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---- orders / order_items (checkout invité autorisé en insert) ----
create policy orders_insert_anyone on public.orders for insert with check (true);
create policy orders_select_own_or_admin on public.orders for select using (auth.uid() = user_id or is_admin());
create policy orders_update_admin on public.orders for update using (is_admin());
create policy order_items_insert_anyone on public.order_items for insert with check (true);
create policy order_items_select on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin()))
);

-- ---- cart_items / wishlist : uniquement ses propres lignes ----
create policy cart_own on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy wishlist_own on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- reviews ----
create policy reviews_insert_authenticated on public.reviews for insert with check (auth.uid() is not null);
create policy reviews_admin_update on public.reviews for update using (is_admin());
create policy reviews_admin_delete on public.reviews for delete using (is_admin());

-- ---- messages (formulaires publics) ----
create policy messages_insert_anyone on public.messages for insert with check (true);
create policy messages_admin_select on public.messages for select using (is_admin());
create policy messages_admin_update on public.messages for update using (is_admin());
create policy messages_admin_delete on public.messages for delete using (is_admin());

-- ---- newsletter ----
create policy newsletter_insert_anyone on public.newsletter_subscribers for insert with check (true);
create policy newsletter_admin_select on public.newsletter_subscribers for select using (is_admin());

-- ---- payment_events (aucun accès client — uniquement le service role côté serveur, ou l'admin en lecture) ----
create policy payment_events_admin_read on public.payment_events for select using (is_admin());

-- ============================================================================
-- 29. STORAGE POLICIES
-- ============================================================================
create policy public_read_product_images on storage.objects for select using (bucket_id = 'product-images');
create policy admin_write_product_images on storage.objects for insert with check (bucket_id = 'product-images' and is_admin());
create policy admin_update_product_images on storage.objects for update using (bucket_id = 'product-images' and is_admin());
create policy admin_delete_product_images on storage.objects for delete using (bucket_id = 'product-images' and is_admin());

create policy public_read_gallery_images on storage.objects for select using (bucket_id = 'gallery-images');
create policy admin_write_gallery_images on storage.objects for insert with check (bucket_id = 'gallery-images' and is_admin());
create policy admin_update_gallery_images on storage.objects for update using (bucket_id = 'gallery-images' and is_admin());
create policy admin_delete_gallery_images on storage.objects for delete using (bucket_id = 'gallery-images' and is_admin());

create policy public_read_site_assets on storage.objects for select using (bucket_id = 'site-assets');
create policy admin_write_site_assets on storage.objects for insert with check (bucket_id = 'site-assets' and is_admin());
create policy admin_update_site_assets on storage.objects for update using (bucket_id = 'site-assets' and is_admin());
create policy admin_delete_site_assets on storage.objects for delete using (bucket_id = 'site-assets' and is_admin());

-- ============================================================================
-- 30. SEED DATA
-- ============================================================================

insert into public.languages (code, name, is_default, is_active, display_order) values
  ('fr','Français', true, true, 1),
  ('en','English', false, true, 2),
  ('ar','العربية', false, true, 3);

insert into public.settings (id, site_name, primary_color, secondary_color, accent_color, currency, whatsapp_number, social_links)
values (1, 'La Casa Del Caftan', '#0A0A0A', '#FFFFFF', '#D4AF37', 'DZD', '213540984852',
  '{"instagram":"","facebook":"","tiktok":""}')
on conflict (id) do nothing;

insert into public.contact_info (id, phone, whatsapp_number, email, address, google_maps_query)
values (
  1, '0540984852', '213540984852', 'casacaftan16@gmail.com',
  '{"fr":"RN24, Alger Plage, Algérie, 16000","en":"RN24, Alger Plage, Algeria, 16000","ar":"الطريق الوطني 24، الجزائر بلاج، الجزائر 16000"}',
  'RN24, Alger Plage, Algeria, 16000'
) on conflict (id) do nothing;

insert into public.homepage_content (id, why_us_title, why_us_items, about_preview_text)
values (
  1,
  '{"fr":"Pourquoi nous choisir","en":"Why choose us","ar":"لماذا تختاروننا"}',
  '[
    {"icon":"gem","title":{"fr":"Qualité premium","en":"Premium quality","ar":"جودة فاخرة"},"text":{"fr":"Des matières nobles sélectionnées avec exigence.","en":"Fine materials selected with care.","ar":"مواد فاخرة مختارة بعناية."}},
    {"icon":"truck","title":{"fr":"Livraison soignée","en":"Careful delivery","ar":"توصيل بعناية"},"text":{"fr":"Chaque commande est emballée avec soin.","en":"Every order is carefully packaged.","ar":"كل طلبية تُغلف بعناية فائقة."}},
    {"icon":"heart","title":{"fr":"Fait avec passion","en":"Made with passion","ar":"صُنع بشغف"},"text":{"fr":"Un savoir-faire transmis avec amour du détail.","en":"Craftsmanship made with love for detail.","ar":"حرفية صُنعت بحب للتفاصيل."}}
  ]'::jsonb,
  '{"fr":"La Casa Del Caftan est une maison dédiée à l\u2019élégance féminine, où chaque pièce raconte une histoire d\u2019héritage et de raffinement.","en":"La Casa Del Caftan is a house dedicated to feminine elegance, where every piece tells a story of heritage and refinement.","ar":"لا كازا ديل قفطان هي دار مكرسة للأناقة النسائية، حيث تروي كل قطعة قصة تراث ورقي."}'::jsonb
) on conflict (id) do nothing;

insert into public.site_content (content_key, content_value, content_type, description) values
  ('about_page_body',
   '{"fr":"La Casa Del Caftan est née d\u2019une passion pour l\u2019élégance et le raffinement du caftan traditionnel, réinventé pour la femme d\u2019aujourd\u2019hui. Chaque pièce est pensée pour sublimer, avec des matières nobles et une attention portée aux moindres détails. Notre maison incarne un luxe accessible, entre héritage et modernité.","en":"La Casa Del Caftan was born from a passion for the elegance and refinement of the traditional caftan, reinvented for today\u2019s woman. Every piece is designed to enhance, with fine materials and meticulous attention to detail. Our house embodies accessible luxury, between heritage and modernity.","ar":"وُلدت لا كازا ديل قفطان من شغف بأناقة ورقي القفطان التقليدي، الذي أُعيد ابتكاره لتناسب المرأة العصرية. كل قطعة صُممت لتُبرز جمالها، بمواد فاخرة واهتمام دقيق بأصغر التفاصيل. تجسد دارنا فخامة في متناول الجميع، بين الإرث والحداثة."}',
   'richtext', 'Texte principal affiché sur la page À propos'),
  ('footer_tagline',
   '{"fr":"L\u2019élégance du caftan, réinventée.","en":"The elegance of the caftan, reinvented.","ar":"أناقة القفطان، بروح عصرية."}',
   'text', 'Phrase courte affichée dans le footer sous le logo');

insert into public.categories (slug, name, display_order) values
  ('caftans', '{"fr":"Caftans","en":"Caftans","ar":"قفاطين"}', 1),
  ('robes-de-soiree', '{"fr":"Robes de soirée","en":"Evening Dresses","ar":"فساتين سهرة"}', 2),
  ('accessoires', '{"fr":"Accessoires","en":"Accessories","ar":"إكسسوارات"}', 3);

insert into public.faq (question, answer, display_order) values
  ('{"fr":"Quels sont les délais de livraison ?","en":"What are the delivery times?","ar":"ما هي مدة التوصيل؟"}',
   '{"fr":"Les délais sont indiqués lors de la commande et peuvent être modifiés depuis le tableau de bord.","en":"Delivery times are shown at checkout and can be edited from the dashboard.","ar":"يتم عرض مدة التوصيل عند الطلب ويمكن تعديلها من لوحة التحكم."}', 1),
  ('{"fr":"Quels moyens de paiement acceptez-vous ?","en":"What payment methods do you accept?","ar":"ما هي وسائل الدفع المقبولة؟"}',
   '{"fr":"Paiement à la livraison et virement bancaire pour le moment. Modifiable depuis le tableau de bord.","en":"Cash on delivery and bank transfer for now. Editable from the dashboard.","ar":"الدفع عند الاستلام أو التحويل البنكي حاليًا. قابل للتعديل من لوحة التحكم."}', 2),
  ('{"fr":"Puis-je retourner un article ?","en":"Can I return an item?","ar":"هل يمكنني إرجاع منتج؟"}',
   '{"fr":"Notre politique de retour est à définir et à publier ici depuis le tableau de bord.","en":"Our return policy is to be defined and published here from the dashboard.","ar":"سياسة الإرجاع الخاصة بنا سيتم تحديدها ونشرها هنا من لوحة التحكم."}', 3);

-- Produits d'exemple — À REMPLACER depuis le Dashboard Admin par le vrai catalogue
insert into public.products (sku, slug, name, description, price, promo_price, category_id, colors, sizes, stock_quantity, is_featured, is_new)
values
(
  'DEMO-001','caftan-exemple-noir-dore',
  '{"fr":"Caftan Exemple Noir & Doré","en":"Sample Black & Gold Caftan","ar":"قفطان تجريبي أسود وذهبي"}',
  '{"fr":"Produit d\u2019exemple à remplacer depuis le Dashboard Admin par vos vraies photos et description.","en":"Sample product — replace via the Admin Dashboard with your real photos and description.","ar":"منتج تجريبي — استبدله من لوحة التحكم بصوركم ووصفكم الحقيقي."}',
  19900.00, 16900.00,
  (select id from public.categories where slug='caftans'),
  '["Noir","Doré"]', '["S","M","L","XL"]', 12, true, true
),
(
  'DEMO-002','robe-soiree-exemple',
  '{"fr":"Robe de Soirée Exemple","en":"Sample Evening Dress","ar":"فستان سهرة تجريبي"}',
  '{"fr":"Produit d\u2019exemple à remplacer depuis le Dashboard Admin.","en":"Sample product — replace via the Admin Dashboard.","ar":"منتج تجريبي — استبدله من لوحة التحكم."}',
  24900.00, null,
  (select id from public.categories where slug='robes-de-soiree'),
  '["Blanc","Noir"]', '["S","M","L"]', 8, true, false
),
(
  'DEMO-003','accessoire-exemple',
  '{"fr":"Ceinture Dorée Exemple","en":"Sample Gold Belt","ar":"حزام ذهبي تجريبي"}',
  '{"fr":"Produit d\u2019exemple à remplacer depuis le Dashboard Admin.","en":"Sample product — replace via the Admin Dashboard.","ar":"منتج تجريبي — استبدله من لوحة التحكم."}',
  4900.00, null,
  (select id from public.categories where slug='accessoires'),
  '["Doré"]', '["Taille unique"]', 20, false, true
);

insert into public.seo (page_slug, meta_title, meta_description) values
  ('global',
   '{"fr":"La Casa Del Caftan","en":"La Casa Del Caftan","ar":"لا كازا ديل قفطان"}',
   '{"fr":"L\u2019élégance du caftan, réinventée. Maison de mode féminine haut de gamme à Alger.","en":"The elegance of the caftan, reinvented. Premium women\u2019s fashion house in Algiers.","ar":"أناقة القفطان بروح عصرية. دار أزياء نسائية راقية في الجزائر."}');

insert into public.hero_slides (title, subtitle, image_url, cta_text, cta_link, display_order, is_active) values (
  '{"fr":"L\u2019élégance du caftan, réinventée","en":"The elegance of the caftan, reinvented","ar":"أناقة القفطان، بروح عصرية"}',
  '{"fr":"Des pièces d\u2019exception pensées pour la femme d\u2019aujourd\u2019hui, entre héritage et modernité.","en":"Exceptional pieces designed for today\u2019s woman, between heritage and modernity.","ar":"قطع استثنائية صُممت للمرأة العصرية، بين الإرث والحداثة."}',
  '/images/boutique-interieur-1.png',
  '{"fr":"Découvrir la collection","en":"Discover the collection","ar":"اكتشفي المجموعة"}',
  '/boutique', 1, true
);

insert into public.gallery (image_url, caption, display_order, is_active) values
  ('/images/boutique-interieur-1.png', '{"fr":"Notre boutique","en":"Our boutique","ar":"متجرنا"}', 1, true),
  ('/images/boutique-interieur-2.png', '{"fr":"L\u2019intérieur La Casa Del Caftan","en":"Inside La Casa Del Caftan","ar":"داخل لا كازا ديل قفطان"}', 2, true);

-- Textes légaux — modèle générique professionnel structuré en sections
-- "Titre\nParagraphe" séparées par une ligne vide (voir PrivacyBodyClient.tsx /
-- TermsBodyClient.tsx pour le rendu). À PERSONNALISER PUIS FAIRE VALIDER PAR
-- UN PROFESSIONNEL avant mise en production réelle — voir le bandeau
-- d'avertissement affiché sur les pages correspondantes.
insert into public.site_content (content_key, content_value, content_type, description)
values ('privacy_policy_body',
'{"fr": "1. Préambule\nLa Casa Del Caftan («nous») accorde une grande importance à la protection de vos données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits.\n\n2. Responsable du traitement\nLe responsable du traitement des données est La Casa Del Caftan, RN24, Alger Plage, Algérie, 16000, joignable à casacaftan16@gmail.com.\n\n3. Donnée'
's collectées\nNous collectons les données que vous nous fournissez directement : nom, prénom, adresse e-mail, numéro de téléphone, adresse de livraison et ville, ainsi que l’historique de vos commandes et, si vous créez un compte, vos identifiants de connexion.\n\n4. Finalités du traitement\nCes données sont utilisées pour traiter et livrer vos commandes, répondre à vos demandes, gérer votre compt'
'e client, vous envoyer notre newsletter si vous y êtes inscrit·e, et améliorer nos services.\n\n5. Base légale\nLe traitement de vos données repose sur l’exécution du contrat de vente, votre consentement (newsletter) ou notre intérêt légitime à améliorer notre service client.\n\n6. Partage des données\nVos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec nos prestatair'
'es techniques (hébergement, paiement, livraison) dans la stricte mesure nécessaire au traitement de votre commande, sous des engagements de confidentialité appropriés.\n\n7. Durée de conservation\nVos données sont conservées le temps nécessaire aux finalités décrites ci-dessus, et conformément aux durées légales de conservation applicables en matière commerciale et comptable.\n\n8. Cookies\nLe sit'
'e utilise des cookies techniques nécessaires à son fonctionnement (panier, préférence de langue) et peut utiliser des cookies de mesure d’audience. Vous pouvez configurer votre navigateur pour refuser les cookies non essentiels.\n\n9. Sécurité\nNous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger vos données contre l’accès non autorisé, la perte ou l’altéra'
'tion.\n\n10. Vos droits\nVous disposez d’un droit d’accès, de rectification, de suppression et d’opposition concernant vos données. Pour l’exercer, contactez-nous à l’adresse indiquée dans la section Contact.\n\n11. Modifications\nCette politique peut être mise à jour. La date de dernière modification figure en bas de cette page ; nous vous invitons à la consulter régulièrement.", "en": "1. Introd'
'uction\nLa Casa Del Caftan (“we”) takes the protection of your personal data seriously. This policy explains what data we collect, why, and what rights you have.\n\n2. Data controller\nThe data controller is La Casa Del Caftan, RN24, Alger Plage, Algeria, 16000, reachable at casacaftan16@gmail.com.\n\n3. Data we collect\nWe collect the data you provide directly: first name, last name, email addres'
's, phone number, delivery address and city, your order history, and, if you create an account, your login credentials.\n\n4. Purpose of processing\nThis data is used to process and deliver your orders, respond to your requests, manage your customer account, send our newsletter if you are subscribed, and improve our services.\n\n5. Legal basis\nProcessing is based on the performance of the sales co'
'ntract, your consent (newsletter), or our legitimate interest in improving customer service.\n\n6. Data sharing\nYour data is never sold to third parties. It may be shared with our technical providers (hosting, payment, delivery) strictly as needed to process your order, under appropriate confidentiality commitments.\n\n7. Retention period\nYour data is kept for as long as necessary for the purpos'
'es described above, and in line with applicable legal retention periods for commercial and accounting matters.\n\n8. Cookies\nThe site uses technical cookies necessary for its operation (cart, language preference) and may use audience-measurement cookies. You can configure your browser to reject non-essential cookies.\n\n9. Security\nWe implement reasonable technical and organizational measures to'
' protect your data against unauthorized access, loss, or alteration.\n\n10. Your rights\nYou have the right to access, rectify, delete, and object to the processing of your data. To exercise these rights, contact us at the address listed in the Contact section.\n\n11. Changes\nThis policy may be updated. The last modification date appears at the bottom of this page; we encourage you to review it p'
'eriodically.", "ar": "1. مقدمة\nتولي لا كازا ديل قفطان («نحن») أهمية كبيرة لحماية بياناتكم الشخصية. توضح هذه السياسة البيانات التي نجمعها، ولماذا، وما هي حقوقكم.\n\n2. الجهة المسؤولة عن المعالجة\nالجهة المسؤولة عن معالجة البيانات هي لا كازا ديل قفطان، الطريق الوطني 24، الجزائر بلاج، الجزائر، 16000، ويمكن التواصل معها عبر casacaftan16@gmail.com.\n\n3. البيانات التي نجمعها\nنجمع البيانات التي تقدمين'
'ها لنا مباشرة: الاسم، اللقب، البريد الإلكتروني، رقم الهاتف، عنوان التوصيل والمدينة، بالإضافة إلى سجل طلباتكم، وفي حال إنشاء حساب، بيانات تسجيل الدخول.\n\n4. أغراض المعالجة\nتُستخدم هذه البيانات لمعالجة طلباتكم وتوصيلها، والرد على استفساراتكم، وإدارة حسابكم، وإرسال نشرتنا الإخبارية إذا كنتم مشتركين فيها، وتحسين خدماتنا.\n\n5. الأساس القانوني\nتستند معالجة بياناتكم إلى تنفيذ عقد البيع، أو موافقتكم ('
'النشرة الإخبارية)، أو مصلحتنا المشروعة في تحسين خدمة العملاء.\n\n6. مشاركة البيانات\nلا تُباع بياناتكم أبدًا لأطراف ثالثة. يمكن مشاركتها مع مزوّدينا التقنيين (الاستضافة، الدفع، التوصيل) في الحدود الضرورية فقط لمعالجة طلبكم، وبموجب التزامات سرية مناسبة.\n\n7. مدة الاحتفاظ بالبيانات\nيتم الاحتفاظ ببياناتكم للمدة اللازمة تحقيقًا للأغراض المذكورة أعلاه، ووفقًا للمدد القانونية المعمول بها في المجالين ا'
'لتجاري والمحاسبي.\n\n8. ملفات تعريف الارتباط (Cookies)\nيستخدم الموقع ملفات تعريف ارتباط تقنية ضرورية لتشغيله (سلة التسوق، تفضيل اللغة) وقد يستخدم ملفات لقياس الجمهور. يمكنكم ضبط متصفحكم لرفض ملفات تعريف الارتباط غير الضرورية.\n\n9. الأمان\nنطبق تدابير تقنية وتنظيمية معقولة لحماية بياناتكم من الوصول غير المصرح به أو الفقدان أو التغيير.\n\n10. حقوقكم\nلكم الحق في الوصول إلى بياناتكم وتصحيحها وحذفها'
' والاعتراض على معالجتها. لممارسة هذه الحقوق، تواصلوا معنا عبر العنوان المذكور في قسم الاتصال.\n\n11. التعديلات\nيمكن تحديث هذه السياسة. يظهر تاريخ آخر تعديل أسفل هذه الصفحة؛ ندعوكم لمراجعتها بانتظام."}'
::jsonb, 'richtext', 'Politique de confidentialité — modèle générique, à faire valider par un professionnel avant mise en production');

insert into public.site_content (content_key, content_value, content_type, description)
values ('terms_of_sale_body',
'{"fr": "1. Objet\nLes présentes conditions générales régissent les ventes réalisées sur le site La Casa Del Caftan entre la boutique et ses client·es, à l’exclusion de toute autre condition.\n\n2. Produits et prix\nLes prix sont indiqués en dinars algériens (DZD), toutes taxes applicables comprises. La Casa Del Caftan se réserve le droit de modifier ses prix à tout moment, les commandes déjà confi'
'rmées n’étant pas affectées.\n\n3. Commande\nToute commande passée sur le site fait l’objet d’une confirmation par notre équipe (téléphone, e-mail ou WhatsApp) avant expédition. La Casa Del Caftan se réserve le droit de refuser ou d’annuler toute commande en cas de doute raisonnable (coordonnées incomplètes, litige antérieur, rupture de stock).\n\n4. Paiement\nLe paiement s’effectue à la livraison'
', par virement bancaire, ou en ligne lorsque cette option est proposée sur le site. Les paiements en ligne sont traités par un prestataire tiers spécialisé ; La Casa Del Caftan n’a à aucun moment accès à vos données bancaires complètes.\n\n5. Livraison\nLes délais et frais de livraison sont précisés lors du passage de commande et peuvent varier selon la wilaya de livraison. La Casa Del Caftan met '
'tout en œuvre pour respecter les délais annoncés, sans garantie absolue en cas de circonstances indépendantes de sa volonté.\n\n6. Retours et échanges\nSauf mention contraire communiquée au moment de la commande, tout retour ou échange doit être signalé dans un délai raisonnable après réception, l’article devant être retourné dans son état d’origine. Les modalités précises seront confirmées par no'
'tre équipe.\n\n7. Responsabilité\nLa Casa Del Caftan ne saurait être tenue responsable des retards ou inexécutions dus à un cas de force majeure, ni des dommages indirects liés à l’usage du site.\n\n8. Propriété intellectuelle\nL’ensemble des contenus du site (textes, photographies, logo) est la propriété de La Casa Del Caftan et ne peut être reproduit sans autorisation préalable.\n\n9. Droit appl'
'icable et litiges\nLes présentes conditions sont soumises au droit algérien. En cas de litige, une solution amiable sera recherchée en priorité avant toute action judiciaire.", "en": "1. Purpose\nThese terms and conditions govern sales made on the La Casa Del Caftan website between the boutique and its customers, to the exclusion of any other terms.\n\n2. Products and prices\nPrices are shown in A'
'lgerian dinars (DZD), inclusive of all applicable taxes. La Casa Del Caftan reserves the right to change its prices at any time; confirmed orders are not affected.\n\n3. Orders\nEvery order placed on the site is confirmed by our team (phone, email, or WhatsApp) before shipping. La Casa Del Caftan reserves the right to refuse or cancel any order in case of reasonable doubt (incomplete details, prio'
'r dispute, out of stock).\n\n4. Payment\nPayment is made on delivery, by bank transfer, or online where this option is offered on the site. Online payments are processed by a specialized third-party provider; La Casa Del Caftan never has access to your full banking details.\n\n5. Delivery\nDelivery times and fees are specified when placing an order and may vary by wilaya. La Casa Del Caftan does i'
'ts best to meet announced timeframes, without absolute guarantee in case of circumstances beyond its control.\n\n6. Returns and exchanges\nUnless stated otherwise at the time of order, any return or exchange must be reported within a reasonable time after receipt, with the item returned in its original condition. Exact terms will be confirmed by our team.\n\n7. Liability\nLa Casa Del Caftan cannot'
' be held responsible for delays or failures due to force majeure, nor for indirect damages related to use of the site.\n\n8. Intellectual property\nAll content on the site (text, photographs, logo) is the property of La Casa Del Caftan and may not be reproduced without prior authorization.\n\n9. Governing law and disputes\nThese terms are governed by Algerian law. In the event of a dispute, an ami'
'cable solution will be sought first, before any legal action.", "ar": "1. الموضوع\nتحكم هذه الشروط والأحكام عمليات البيع التي تتم عبر موقع لا كازا ديل قفطان بين المتجر وعملائه، باستثناء أي شروط أخرى.\n\n2. المنتجات والأسعار\nالأسعار معروضة بالدينار الجزائري (DZD)، شاملة جميع الضرائب المطبقة. تحتفظ لا كازا ديل قفطان بحق تعديل أسعارها في أي وقت، دون أن يؤثر ذلك على الطلبات المؤكدة مسبقًا.\n\n3. الطل'
'ب\nيخضع كل طلب على الموقع لتأكيد من فريقنا (هاتفيًا أو عبر البريد الإلكتروني أو واتساب) قبل الشحن. تحتفظ لا كازا ديل قفطان بحق رفض أو إلغاء أي طلب في حال وجود شك معقول (معلومات ناقصة، نزاع سابق، نفاد المخزون).\n\n4. الدفع\nيتم الدفع عند الاستلام، أو عبر التحويل البنكي، أو إلكترونيًا عند توفر هذا الخيار على الموقع. تتم معالجة المدفوعات الإلكترونية من قبل مزوّد خارجي متخصص؛ ولا تصل لا كازا ديل قفطان'
' في أي وقت إلى بياناتكم البنكية الكاملة.\n\n5. التوصيل\nتُحدَّد مدة وتكلفة التوصيل عند إتمام الطلب وقد تختلف حسب الولاية. تبذل لا كازا ديل قفطان قصارى جهدها لاحترام المواعيد المعلنة، دون ضمان مطلق في حال ظروف خارجة عن إرادتها.\n\n6. الإرجاع والاستبدال\nما لم يُذكر خلاف ذلك عند الطلب، يجب الإبلاغ عن أي إرجاع أو استبدال خلال مدة معقولة بعد الاستلام، مع إعادة المنتج بحالته الأصلية. سيتم تأكيد التفاصي'
'ل الدقيقة من قبل فريقنا.\n\n7. المسؤولية\nلا تتحمل لا كازا ديل قفطان مسؤولية التأخير أو عدم التنفيذ الناتج عن قوة قاهرة، ولا الأضرار غير المباشرة المرتبطة باستخدام الموقع.\n\n8. الملكية الفكرية\nجميع محتويات الموقع (النصوص، الصور، الشعار) ملك لـ لا كازا ديل قفطان ولا يجوز نسخها دون إذن مسبق.\n\n9. القانون المطبق والنزاعات\nتخضع هذه الشروط للقانون الجزائري. في حال وجود نزاع، سيتم البحث عن حل ودي أو'
'لاً قبل أي إجراء قضائي."}'
::jsonb, 'richtext', 'Conditions générales de vente — modèle générique, à faire valider par un professionnel avant mise en production');


-- ============================================================================
-- 31. PROMOUVOIR UN COMPTE EN ADMIN
-- ============================================================================
-- 1) Crée un compte normal sur le site via /inscription avec ton email.
-- 2) Remplace 'ton-email@example.com' ci-dessous par cet email, puis exécute
--    uniquement cette requête (décommente la ligne insert) dans le SQL Editor.
--
-- insert into public.admins (user_id, role)
-- select id, 'super_admin' from auth.users where email = 'ton-email@example.com';

-- ============================================================================
-- FIN DU SCRIPT
-- ============================================================================
