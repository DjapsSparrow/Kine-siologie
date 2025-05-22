/*
  # Add client management policies

  This migration adds the necessary policies for client management:
  
  1. Policies
    - Allow authenticated users to insert new clients
    - Allow authenticated users to update their own clients
    - Allow authenticated users to delete their own clients
    
  2. Security
    - All policies are restricted to authenticated users
    - Users can only modify clients they created
*/

-- Allow authenticated users to insert new clients
CREATE POLICY "Allow authenticated users to insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to update their own clients
CREATE POLICY "Allow authenticated users to update their own clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to delete their own clients
CREATE POLICY "Allow authenticated users to delete their own clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);