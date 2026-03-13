-- PostgreSQL schema reference for the rewritten Node/HTML/CSS/JS stack
create table if not exists users (
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  role text not null,
  email_verified boolean default false,
  created_at timestamptz not null default now()
);

create table if not exists patient_profiles (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  date_of_birth date
);

create table if not exists appointments (
  id uuid primary key,
  patient_id uuid not null references patient_profiles(id) on delete cascade,
  service_id text not null,
  start_at timestamptz not null,
  status text not null,
  denial_reason text
);
