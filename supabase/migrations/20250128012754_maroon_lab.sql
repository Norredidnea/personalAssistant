/*
  # Ajout des colonnes location et participants à la table calendar_events

  1. Changements
    - Ajout de la colonne `location` (text, nullable)
    - Ajout de la colonne `participants` (text[], nullable)

  2. Notes
    - Les colonnes sont ajoutées de manière sûre avec IF NOT EXISTS
    - Les colonnes sont nullables pour maintenir la compatibilité avec les données existantes
*/

DO $$ BEGIN
  -- Ajout de la colonne location si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'location'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN location text;
  END IF;

  -- Ajout de la colonne participants si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'participants'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN participants text[];
  END IF;
END $$;