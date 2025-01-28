/*
  # Ajout de la gestion des documents et des priorités

  1. Nouvelles Tables
    - `documents`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key)
      - `name` (text)
      - `type` (text)
      - `size` (bigint)
      - `url` (text)
      - `version` (integer)
      - `created_at` (timestamptz)

  2. Modifications
    - Ajout de la colonne `priority` à la table `tasks`

  3. Sécurité
    - Enable RLS sur la table `documents`
    - Politiques pour les documents
*/

-- Création du bucket Storage pour les documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'documents'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('documents', 'documents');
  END IF;
END $$;

-- Table des documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks NOT NULL,
  name text NOT NULL,
  type text,
  size bigint,
  url text NOT NULL,
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Ajout de la priorité aux tâches
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'task_priority'
  ) THEN
    CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
  END IF;
END $$;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority task_priority;

-- Activation de la sécurité niveau ligne
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Politiques pour les documents
CREATE POLICY "Les utilisateurs peuvent lire leurs documents"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = documents.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer leurs documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = documents.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = documents.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Politique de stockage pour les documents
CREATE POLICY "Accès aux documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'documents')
  WITH CHECK (bucket_id = 'documents');