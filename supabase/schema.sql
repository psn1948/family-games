create table if not exists members (
  id uuid primary key,
  name text not null,
  color text not null
);

create table if not exists games (
  id uuid primary key,
  name text not null,
  description text not null default ''
);

create table if not exists sessions (
  id uuid primary key,
  game_id uuid,
  participant_ids uuid[] not null default array[]::uuid[],
  rounds jsonb not null default '[]'::jsonb,
  started_at timestamptz not null,
  ended_at timestamptz,
  status text not null default 'active'
);

alter table members disable row level security;
alter table games disable row level security;
alter table sessions disable row level security;
