-- Enable Row Level Security
alter table auth.users enable row level security;

-- 1. Profiles Table (Public User Info)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Saju Records Table (Saved Fortunes)
create table saju_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null, -- "홍길동" or "나의 사주"
  relation text default 'friend', -- 'self', 'family', 'friend'
  birth_year int not null,
  birth_month int not null,
  birth_day int not null,
  birth_hour text, -- "14:30" or "sajeong"
  gender text, -- 'male', 'female'
  calendar text default 'solar', -- 'solar', 'lunar'
  data jsonb, -- The full calculated SajuData
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table saju_records enable row level security;

create policy "Users can view their own records."
  on saju_records for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own records."
  on saju_records for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own records."
  on saju_records for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own records."
  on saju_records for delete
  using ( auth.uid() = user_id );

-- 3. Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
