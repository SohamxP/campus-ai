create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  location text not null,
  event_date timestamptz not null,
  category text not null,
  organizer text default 'CampusAI',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price numeric(10,2) not null check (price > 0),
  category text not null,
  seller_name text default 'CampusAI Student',
  created_by uuid references public.users(id) on delete set null,
  status text not null default 'available',
  created_at timestamptz not null default now()
);