/*
  # Ajout des fonctionnalités de rappels et calendrier

  1. Nouvelles Tables
    - `reminders`
      - `id` (uuid, primary key)
      - `task_id` (uuid, référence vers tasks)
      - `user_id` (uuid, référence vers auth.users)
      - `remind_at` (timestamptz)
      - `status` (enum: 'PENDING', 'SENT', 'CANCELLED')
      - `created_at` (timestamptz)

    - `calendar_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, référence vers auth.users)
      - `title` (text)
      - `description` (text)
      - `start_at` (timestamptz)
      - `end_at` (timestamptz)
      - `all_day` (boolean)
      - `recurrence` (text, pour les événements récurrents)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les nouvelles tables
    - Ajout des politiques de sécurité appropriées
*/

-- Type pour le statut des rappels
CREATE TYPE reminder_status AS ENUM ('PENDING', 'SENT', 'CANCELLED');

-- Table des rappels
CREATE TABLE reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  remind_at timestamptz NOT NULL,
  status reminder_status DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

-- Table des événements du calendrier
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  all_day boolean DEFAULT false,
  recurrence text,
  created_at timestamptz DEFAULT now()
);

-- Activation de la sécurité niveau ligne
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Politiques pour les rappels
CREATE POLICY "Les utilisateurs peuvent lire leurs rappels"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs rappels"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs rappels"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs rappels"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour les événements du calendrier
CREATE POLICY "Les utilisateurs peuvent lire leurs événements"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs événements"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs événements"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs événements"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ajout de l'heure à la table des tâches
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time time;