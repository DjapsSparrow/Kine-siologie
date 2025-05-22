/*
  # Update Protocol Categories and Protocols Schema

  1. Changes
    - Create protocol_categories table
    - Add RLS policies for protocol categories
    - Update protocols table with new columns
    - Migrate existing data
    
  2. Security
    - Enable RLS on protocol_categories
    - Add policies for read and create operations
*/

-- Create protocol_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS protocol_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE protocol_categories ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'protocol_categories' 
    AND policyname = 'Anyone can read protocol categories'
  ) THEN
    CREATE POLICY "Anyone can read protocol categories"
      ON protocol_categories FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'protocol_categories' 
    AND policyname = 'Authenticated users can create protocol categories'
  ) THEN
    CREATE POLICY "Authenticated users can create protocol categories"
      ON protocol_categories FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Update protocols table
ALTER TABLE protocols 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES protocol_categories(id),
  ADD COLUMN IF NOT EXISTS file_url text;

-- Copy existing titles to name field
UPDATE protocols SET name = title WHERE name IS NULL AND title IS NOT NULL;

-- Create trigger only if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_protocol_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_protocol_categories_updated_at
      BEFORE UPDATE ON protocol_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;