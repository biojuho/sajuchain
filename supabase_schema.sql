-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Table: saju_history
create table if not exists saju_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  birth_date date not null,
  birth_time time,
  gender text check (gender in ('male', 'female')),
  calendar_type text default 'solar',
  birth_place text,
  
  -- Saju Result JSONB for flexibility
  saju_data jsonb not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table saju_history enable row level security;

-- Policy: Users can insert their own data
create policy "Users can insert their own history"
on saju_history for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy: Users can view their own data
create policy "Users can view their own history"
on saju_history for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Users can delete their own data
create policy "Users can delete their own history"
on saju_history for delete
to authenticated
using (auth.uid() = user_id);

-- Create Index for speed
create index idx_saju_history_user_id on saju_history(user_id);
create index idx_saju_history_created_at on saju_history(created_at desc);
