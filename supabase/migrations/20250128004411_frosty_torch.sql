/*
  # Ajout de la colonne subject à la table appointments

  1. Changements
    - Ajout de la colonne `subject` à la table `appointments`
    - La colonne est de type text et ne peut pas être nulle
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'subject'
  ) THEN
    ALTER TABLE appointments ADD COLUMN subject text NOT NULL DEFAULT '';
  END IF;
END $$;