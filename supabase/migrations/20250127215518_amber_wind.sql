/*
  # Ajout du système de tags pour les tâches

  1. Nouvelles Tables
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamptz)
    - `task_tags`
      - `task_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS sur les tables `tags` et `task_tags`
    - Ajout des politiques pour la lecture et l'écriture
*/

-- Table des tags
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table de liaison entre tâches et tags
CREATE TABLE task_tags (
  task_id uuid REFERENCES tasks NOT NULL,
  tag_id uuid REFERENCES tags NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (task_id, tag_id)
);

-- Activation de la sécurité niveau ligne
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

-- Insertion des tags prédéfinis
INSERT INTO tags (name) VALUES
  ('personnel'),
  ('travail'),
  ('urgent'),
  ('avocat'),
  ('huissier'),
  ('toulouse'),
  ('enfants'),
  ('golfech');

-- Politiques pour les tags
CREATE POLICY "Tout le monde peut lire les tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

-- Politiques pour task_tags
CREATE POLICY "Les utilisateurs peuvent lire leurs associations task_tags"
  ON task_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent créer leurs associations task_tags"
  ON task_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs associations task_tags"
  ON task_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_tags.task_id
      AND tasks.user_id = auth.uid()
    )
  );