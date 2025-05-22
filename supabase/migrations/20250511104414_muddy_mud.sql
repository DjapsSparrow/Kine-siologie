/*
  # Initial Schema Setup for Kinesiology Practice Management

  1. New Tables
    - `clients`
      - Basic client information
      - Contact details
      - Medical history
    - `appointments`
      - Scheduling information
      - Client references
      - Status tracking
    - `protocols`
      - Treatment protocols
      - Categories and objectives
    - `protocol_categories`
      - Protocol classification
    - `sessions`
      - Treatment session records
      - Links to clients and protocols
    - `documents`
      - File management
      - Categorization
    - `journal_entries`
      - Practitioner's private notes
    - `availability_slots`
      - Scheduling management
    - `settings`
      - Practice configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Protocol Categories
CREATE TABLE protocol_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE protocol_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read protocol categories"
  ON protocol_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Protocols
CREATE TABLE protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  therapeutic_objective text,
  category_id uuid REFERENCES protocol_categories(id),
  original_file_url text,
  is_dynamic boolean DEFAULT false,
  dynamic_content text,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read protocols"
  ON protocols
  FOR SELECT
  TO authenticated
  USING (true);

-- Clients
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  date_of_birth date,
  global_summary text,
  personal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

-- Availability Slots
CREATE TABLE availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  duration integer DEFAULT 90,
  is_recurring boolean DEFAULT true,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read availability slots"
  ON availability_slots
  FOR SELECT
  TO authenticated
  USING (true);

-- Appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  date date NOT NULL,
  start_time time NOT NULL,
  duration integer DEFAULT 90,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  booked_by_client boolean DEFAULT false,
  client_message text,
  confirmation_link text,
  confirmed_by_client boolean DEFAULT false,
  availability_slot_id uuid REFERENCES availability_slots(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id),
  appointment_id uuid REFERENCES appointments(id),
  protocol_id uuid REFERENCES protocols(id),
  client_feedback text,
  practitioner_observations text,
  practitioner_notes text,
  synthetic_summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Documents
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  file_url text NOT NULL,
  file_type text,
  tags text[],
  client_id uuid REFERENCES clients(id),
  protocol_id uuid REFERENCES protocols(id),
  session_id uuid REFERENCES sessions(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Journal Entries
CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  category text,
  is_private boolean DEFAULT true,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read their own journal entries"
  ON journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Settings
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_name text,
  logo_url text,
  modules jsonb DEFAULT '{"journal": true, "dynamic_protocols": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings"
  ON settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protocol_categories_updated_at
  BEFORE UPDATE ON protocol_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_protocols_updated_at
  BEFORE UPDATE ON protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();