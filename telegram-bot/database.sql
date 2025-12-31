-- Telegram Bot Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create telegram_bindings table
CREATE TABLE IF NOT EXISTS telegram_bindings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    telegram_username VARCHAR(255),
    wallet_address VARCHAR(42) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_telegram_bindings_telegram_id ON telegram_bindings(telegram_id);
CREATE INDEX IF NOT EXISTS idx_telegram_bindings_wallet ON telegram_bindings(wallet_address);
CREATE INDEX IF NOT EXISTS idx_telegram_bindings_active ON telegram_bindings(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_telegram_bindings_updated_at ON telegram_bindings;
CREATE TRIGGER update_telegram_bindings_updated_at
    BEFORE UPDATE ON telegram_bindings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE telegram_bindings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage telegram_bindings"
    ON telegram_bindings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON telegram_bindings TO service_role;
GRANT SELECT, INSERT, UPDATE ON telegram_bindings TO authenticated;

-- Create bot_notifications table for storing notification history
CREATE TABLE IF NOT EXISTS bot_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    wallet_address VARCHAR(42),
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_notifications_telegram_id ON bot_notifications(telegram_id);
CREATE INDEX IF NOT EXISTS idx_bot_notifications_type ON bot_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_bot_notifications_created ON bot_notifications(created_at);

-- Enable RLS for bot_notifications
ALTER TABLE bot_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage bot_notifications"
    ON bot_notifications
    FOR ALL
    USING (true)
    WITH CHECK (true);

GRANT ALL ON bot_notifications TO service_role;

COMMENT ON TABLE telegram_bindings IS 'Stores Telegram user to wallet address bindings';
COMMENT ON TABLE bot_notifications IS 'Stores notification history sent via Telegram bot';



