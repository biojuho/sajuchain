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