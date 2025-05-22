/*
  # Add INSERT policy for protocols table

  1. Security Changes
    - Add policy to allow authenticated users to create protocols
    - Users can only create protocols where they are set as the creator
*/

CREATE POLICY "Allow authenticated users to create protocols"
  ON protocols
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Add UPDATE policy to allow users to modify their own protocols
CREATE POLICY "Allow authenticated users to update their own protocols"
  ON protocols
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Add DELETE policy to allow users to delete their own protocols
CREATE POLICY "Allow authenticated users to delete their own protocols"
  ON protocols
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);