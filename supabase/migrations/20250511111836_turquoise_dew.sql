/*
  # Add notes column to appointments table

  1. Changes
    - Add 'notes' column to appointments table
      - Type: text
      - Nullable: true
      - No default value

  2. Security
    - No changes to RLS policies needed as the existing policies cover the new column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE appointments ADD COLUMN notes text;
  END IF;
END $$;