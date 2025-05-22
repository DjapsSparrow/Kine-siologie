/*
  # Storage Setup for Protocol Files

  1. Changes
    - Create protocols storage bucket if it doesn't exist
    - Add RLS policies for protocol file access
    
  2. Security
    - Enable public access to the bucket
    - Add policies for authenticated users to:
      - Read protocol files
      - Upload new files
      - Update their own files
      - Delete their own files
*/

-- Create the protocols bucket if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'protocols'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('protocols', 'protocols', true);
  END IF;
END $$;

-- Set up RLS policies for the protocols bucket
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Authenticated users can read protocol files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Authenticated users can read protocol files"
      ON storage.objects FOR SELECT
      TO authenticated
      USING (bucket_id = 'protocols');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can upload protocol files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can upload protocol files"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'protocols');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own protocol files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can update their own protocol files"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'protocols');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can delete their own protocol files'
    AND tablename = 'objects'
    AND schemaname = 'storage'
  ) THEN
    CREATE POLICY "Users can delete their own protocol files"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'protocols');
  END IF;
END $$;