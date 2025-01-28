/*
  # Mise à jour de la table calendar_events

  1. Modifications
    - Suppression de la colonne participants
    - Ajout de la colonne location si elle n'existe pas
    - Suppression de la colonne recurrence
*/

DO $$ BEGIN
  -- Suppression de la colonne participants si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'participants'
  ) THEN
    ALTER TABLE calendar_events DROP COLUMN participants;
  END IF;

  -- Suppression de la colonne recurrence si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'recurrence'
  ) THEN
    ALTER TABLE calendar_events DROP COLUMN recurrence;
  END IF;

  -- Ajout de la colonne location si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_events' AND column_name = 'location'
  ) THEN
    ALTER TABLE calendar_events ADD COLUMN location text;
  END IF;
END $$;