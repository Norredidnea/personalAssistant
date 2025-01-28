/*
  # Ajout du statut des tâches pour le Kanban

  1. Modifications
    - Ajout de la colonne `status` à la table `tasks`
    - Valeurs possibles : 'TODO', 'IN_PROGRESS', 'DONE'
    - Valeur par défaut : 'TODO'

  2. Sécurité
    - Mise à jour des politiques existantes pour inclure le nouveau champ
*/

DO $$ BEGIN
  -- Ajout de l'enum pour le statut des tâches
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
  END IF;
END $$;

-- Ajout de la colonne status
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'status'
  ) THEN
    ALTER TABLE tasks ADD COLUMN status task_status DEFAULT 'TODO';
  END IF;
END $$;