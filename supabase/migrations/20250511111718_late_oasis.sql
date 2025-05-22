/*
  # Create appointments table and policies

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `date` (date)
      - `start_time` (time)
      - `duration` (integer, default 90)
      - `status` (text, default 'scheduled')
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on appointments table
    - Add policies for CRUD operations
*/

-- Création de la table appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  date date NOT NULL,
  start_time time NOT NULL,
  duration integer DEFAULT 90,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
DO $$ BEGIN
  CREATE POLICY "Permettre la lecture des rendez-vous aux utilisateurs authentifiés"
    ON appointments
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Permettre la création de rendez-vous aux utilisateurs authentifiés"
    ON appointments
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Permettre la modification des rendez-vous aux utilisateurs authentifiés"
    ON appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Permettre la suppression des rendez-vous aux utilisateurs authentifiés"
    ON appointments
    FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Trigger pour la mise à jour automatique de updated_at
DO $$ BEGIN
  CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;