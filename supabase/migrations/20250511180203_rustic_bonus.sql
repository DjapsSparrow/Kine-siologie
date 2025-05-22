/*
  # Add dynamic protocol support
  
  1. Changes
    - Add is_dynamic column to protocols table
    - Add dynamic_content column to protocols table
    - Add analyzed_at column to protocols table
    
  2. Security
    - No changes to RLS policies needed as existing policies cover the new columns
*/

ALTER TABLE protocols
  ADD COLUMN IF NOT EXISTS is_dynamic boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS dynamic_content text,
  ADD COLUMN IF NOT EXISTS analyzed_at timestamptz;