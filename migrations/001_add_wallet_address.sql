-- Add wallet_address column to farmer_profiles table
ALTER TABLE farmer_profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE;

-- Update transactions table status enum
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS blockchain_submitted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS blockchain_confirmed_at TIMESTAMP;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wallet_address ON farmer_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_blockchain_tx_id ON transactions(blockchain_tx_id);
