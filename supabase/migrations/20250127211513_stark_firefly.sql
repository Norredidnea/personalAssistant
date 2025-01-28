/*
  # Schéma initial pour l'assistant personnel

  1. Nouvelles Tables
    - `tasks`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `title` (text)
      - `due_date` (date)
      - `completed` (boolean)
      - `created_at` (timestamp)
    
    - `appointments`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `title` (text)
      - `date` (date)
      - `time` (time)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur les deux tables
    - Politiques pour permettre aux utilisateurs de gérer leurs propres données
*/

-- Table des tâches
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  due_date date,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Table des rendez-vous
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation de la sécurité niveau ligne
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Politiques pour les tâches
CREATE POLICY "Les utilisateurs peuvent lire leurs propres tâches"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres tâches"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres tâches"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour les rendez-vous
CREATE POLICY "Les utilisateurs peuvent lire leurs propres rendez-vous"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres rendez-vous"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres rendez-vous"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);