-- Add customer_name column to purchases table
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS customer_name text;
