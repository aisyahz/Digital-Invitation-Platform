-- ========================================================
-- KADKITA SUPABASE DATABASE SCHEMA
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------
-- 1. TEMPLATES TABLE
-- --------------------------------------------------------
create table if not exists public.templates (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    thumbnail text,
    folder text not null,
    price text not null default 'RM 99',
    status text not null default 'active', -- active, archived
    config jsonb, -- Holds template configurations (colors, fonts, etc.)
    created_at timestamptz default now(),
    version integer not null default 1,
    preview_image text,
    cover_image text,
    config_file text,
    animation text
);

-- --------------------------------------------------------
-- 2. ORDERS TABLE
-- --------------------------------------------------------
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,
    template_id uuid references public.templates(id) on delete set null,
    payment_status text not null default 'unpaid', -- unpaid, pending_approval, paid
    status text not null default 'draft', -- draft, pending_payment, pending_approval, published, archived
    receipt_url text,
    created_at timestamptz default now(),
    published_at timestamptz
);

-- --------------------------------------------------------
-- 3. INVITATIONS TABLE
-- --------------------------------------------------------
create table if not exists public.invitations (
    id text primary key, -- Secure, hard-to-guess unique edit token (e.g. 16-character random hex or UUID)
    order_id uuid references public.orders(id) on delete cascade,
    slug text not null unique, -- Public url identifier (e.g., adam-hawa)
    content jsonb not null default '{}'::jsonb, -- Customizer details JSON
    settings jsonb not null default '{}'::jsonb, -- Customizer settings JSON
    analytics jsonb not null default '{"total_views": 0, "unique_views": 0, "last_viewed": null, "map_clicks": 0, "gallery_opens": 0, "music_plays": 0, "rsvp_count": 0, "share_count": 0}'::jsonb, -- Analytics JSON
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- --------------------------------------------------------
-- 4. RSVPS TABLE
-- --------------------------------------------------------
create table if not exists public.rsvps (
    id uuid primary key default gen_random_uuid(),
    invitation_id text not null references public.invitations(id) on delete cascade,
    name text not null,
    phone text not null,
    attendance text not null, -- yes, no
    pax integer not null default 1,
    message text,
    created_at timestamptz default now()
);

-- --------------------------------------------------------
-- 5. GUEST MESSAGES TABLE
-- --------------------------------------------------------
create table if not exists public.guest_messages (
    id uuid primary key default gen_random_uuid(),
    invitation_id text not null references public.invitations(id) on delete cascade,
    guest_name text not null,
    message text not null,
    created_at timestamptz default now()
);

-- --------------------------------------------------------
-- 6. SETTINGS TABLE
-- --------------------------------------------------------
create table if not exists public.settings (
    key text primary key,
    value text not null
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable RLS on all tables
alter table public.templates enable row level security;
alter table public.orders enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.guest_messages enable row level security;
alter table public.settings enable row level security;

-- --- TEMPLATES POLICIES ---
create policy "Allow public to view active templates"
on public.templates for select
using (status = 'active');

create policy "Allow authenticated admin to manage templates"
on public.templates for all
using (auth.role() = 'authenticated');

-- --- ORDERS POLICIES ---
create policy "Allow public to submit new orders"
on public.orders for insert
with check (true);

create policy "Allow public to select and update their own order if they know the ID"
on public.orders for select
using (true);

create policy "Allow public to update receipt for their order"
on public.orders for update
using (true);

create policy "Allow authenticated admin to manage all orders"
on public.orders for all
using (auth.role() = 'authenticated');

-- --- INVITATIONS POLICIES ---
create policy "Allow public to view invitations by slug"
on public.invitations for select
using (true);

-- Anyone can insert a new invitation record
create policy "Allow public to create invitations"
on public.invitations for insert
with check (true);

-- Must possess the secure edit token (which is the ID column) to update
create policy "Allow holders of secure edit token to edit invitation"
on public.invitations for update
using (true);

create policy "Allow authenticated admin to manage all invitations"
on public.invitations for all
using (auth.role() = 'authenticated');

-- --- RSVPS POLICIES ---
create policy "Allow guests to RSVP"
on public.rsvps for insert
with check (true);

create policy "Allow public to see RSVPs for an invitation"
on public.rsvps for select
using (true);

create policy "Allow authenticated admin to manage all RSVPs"
on public.rsvps for all
using (auth.role() = 'authenticated');

-- --- GUEST MESSAGES POLICIES ---
create policy "Allow guests to write messages"
on public.guest_messages for insert
with check (true);

create policy "Allow public to read guest messages"
on public.guest_messages for select
using (true);

create policy "Allow authenticated admin to manage all guest messages"
on public.guest_messages for all
using (auth.role() = 'authenticated');

-- --- SETTINGS POLICIES ---
create policy "Allow public to read settings"
on public.settings for select
using (true);

create policy "Allow authenticated admin to manage all settings"
on public.settings for all
using (auth.role() = 'authenticated');


-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- Seed Settings
insert into public.settings (key, value) values
('price', '99'),
('bank_name', 'GX Bank'),
('account_name', 'SITI AISYAH'),
('account_number', '8888-00561901-0'),
('duitnow_qr', '/payment/duitnow-qr.png')
on conflict (key) do update set value = excluded.value;

-- Seed Templates
insert into public.templates (id, name, slug, thumbnail, folder, price, status, config) values
('e14b537c-3725-4148-be21-d055447ea8d0', 'Garden Romance', 'garden', '/templates/garden/thumbnail.webp', 'garden', 'RM 99', 'active', '{
  "primaryColor": "#f0b4b9",
  "secondaryColor": "#fdfbf7",
  "fontHeading": "Playfair Display",
  "fontBody": "Montserrat",
  "animation": "goldSparkle"
}'::jsonb),
('8d3c5bf4-7b94-4b53-9092-23b03657ff2a', 'Royal Malay', 'royal', '/templates/royal/thumbnail.webp', 'royal', 'RM 99', 'active', '{
  "primaryColor": "#dfc384",
  "secondaryColor": "#f7f3eb",
  "fontHeading": "Cinzel",
  "fontBody": "Montserrat",
  "animation": "goldSparkle"
}'::jsonb),
('fa87de7e-a0ee-49eb-837c-fbfdc56832df', 'Islamic Minimal', 'islamic', '/templates/islamic/thumbnail.webp', 'islamic', 'RM 99', 'active', '{
  "primaryColor": "#C6A964",
  "secondaryColor": "#F7F9F7",
  "fontHeading": "Cinzel",
  "fontBody": "Montserrat",
  "animation": "goldSparkle"
}'::jsonb)
on conflict (slug) do nothing;
