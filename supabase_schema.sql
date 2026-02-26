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

-- Create Index for speed (Compound Index for user's history sort)
create index if not exists idx_saju_history_user_date on saju_history(user_id, created_at desc);

-- Enable vector extension for RAG
create extension if not exists vector;

-- Create Knowledge Table
create table if not exists saju_knowledge (
  id bigint primary key generated always as identity,
  category text not null,
  content text not null,
  embedding vector(1536)
);

-- Create Index for vector search
create index on saju_knowledge using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Vector Search Function
create or replace function match_saju_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    saju_knowledge.id,
    saju_knowledge.content,
    1 - (saju_knowledge.embedding <=> query_embedding) as similarity
  from saju_knowledge
  where 1 - (saju_knowledge.embedding <=> query_embedding) > match_threshold
  order by saju_knowledge.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  payment_key TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('DONE', 'CANCELED', 'ABORTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments FOR
SELECT USING (auth.uid() = user_id);

-- Policy: Service role can manage all payments (for verification API)
CREATE POLICY "Service role can manage all payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_payment_key_unique ON payments(payment_key);

-- =============================================
-- Chat Sessions (채팅 히스토리)
-- =============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shaman_id TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions"
ON chat_sessions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
ON chat_sessions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
ON chat_sessions FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
ON chat_sessions FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
ON chat_sessions(user_id, updated_at DESC);

-- =============================================
-- Referral System (리퍼럴)
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  free_premium_remaining INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
ON user_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
ON referrals FOR SELECT TO authenticated
USING (auth.uid() = referrer_id);

CREATE POLICY "Service role can manage referrals"
ON referrals FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_code ON user_profiles(referral_code);

-- RPC: Increment free premium for a user
CREATE OR REPLACE FUNCTION increment_free_premium(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET free_premium_remaining = free_premium_remaining + 1
  WHERE id = target_user_id;
END;
$$;

-- =============================================
-- Usage Tracking (무료 사용 제한)
-- =============================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('interpret', 'chat')),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INT NOT NULL DEFAULT 1,
  UNIQUE(user_id, usage_type, usage_date)
);

ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON usage_tracking FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
ON usage_tracking FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date
ON usage_tracking(user_id, usage_type, usage_date);

-- RPC: Atomically check and increment usage, returns {allowed, remaining, count}
CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_limit INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INT;
BEGIN
  INSERT INTO usage_tracking (user_id, usage_type, usage_date, count)
  VALUES (p_user_id, p_usage_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1
  RETURNING count INTO current_count;

  IF current_count > p_limit THEN
    UPDATE usage_tracking
    SET count = count - 1
    WHERE user_id = p_user_id AND usage_type = p_usage_type AND usage_date = CURRENT_DATE;
    RETURN jsonb_build_object('allowed', false, 'remaining', 0, 'count', current_count - 1);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - current_count, 'count', current_count);
END;
$$;

-- RPC: Get current usage count without incrementing
CREATE OR REPLACE FUNCTION get_usage_count(
  p_user_id UUID,
  p_usage_type TEXT
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT count INTO current_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND usage_type = p_usage_type AND usage_date = CURRENT_DATE;
  RETURN COALESCE(current_count, 0);
END;
$$;
