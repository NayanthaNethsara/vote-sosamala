-- Table: contestants
create table contestants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  category text not null,
  faculty text,
  image_url text,
  active boolean default true,
  vote_count integer default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Table: votes
create table votes (
  id uuid primary key default gen_random_uuid(),
  contestant_id uuid references contestants(id) on delete cascade,
  voter_hash text not null,
  category text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  unique (voter_hash, category)
);

-- Enable Row Level Security
alter table contestants enable row level security;
alter table votes enable row level security;

-- Policy: Anyone can read contestants
create policy "Allow public read" on contestants
for select using (true);

-- Policy: Only admin can write contestants
create policy "Admin write" on contestants
for all to authenticated
using (auth.email() = 'your-admin@email.com')
with check (auth.email() = 'your-admin@email.com');

-- Policy: Anyone logged in can insert vote
create policy "Allow vote insert" on votes
for insert to authenticated
with check (true);

-- Policy: (Optional) Anyone can read votes
create policy "Allow public read votes" on votes
for select using (true);

-- (Optional) Only admin can read all votes
-- create policy "Admin read votes" on votes
-- for select to authenticated
-- using (auth.email() = 'your-admin@email.com');
