-- Safe Supabase migration: creates tables and policies only when appropriate.
-- Use this if you want the SQL to be robust when re-running or when tables may be missing.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone text,
  role text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);

-- Create reports table if not exists
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text,
  description text,
  nfc_tag text,
  photos text[] DEFAULT ARRAY[]::text[],
  status text NOT NULL CHECK (status IN ('offen','in-bearbeitung','abgeschlossen')) DEFAULT 'offen',
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_to text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports (created_at);

-- Add assigned_to_id if missing
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS assigned_to_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reports_assigned_to_id_idx ON public.reports (assigned_to_id);

-- Backfill assigned_to_id (best-effort)
UPDATE public.reports AS r
SET assigned_to_id = p.id
FROM public.profiles AS p
WHERE r.assigned_to IS NOT NULL
  AND p.display_name = r.assigned_to;

-- Helper function to create policies safely for a given table
DO $$
BEGIN
  -- Profiles policies
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
             WHERE n.nspname = 'public' AND c.relname = 'profiles') THEN

    -- Enable RLS
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- Create/replace policies via DROP THEN CREATE
    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public select profiles" ON public.profiles';
      EXECUTE 'CREATE POLICY "Public select profiles" ON public.profiles FOR SELECT USING (true)';

      EXECUTE 'DROP POLICY IF EXISTS "Insert own profile" ON public.profiles';
      EXECUTE 'CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid())';

      EXECUTE 'DROP POLICY IF EXISTS "Update own profile" ON public.profiles';
      EXECUTE 'CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';

      EXECUTE 'DROP POLICY IF EXISTS "Delete own profile" ON public.profiles';
      EXECUTE 'CREATE POLICY "Delete own profile" ON public.profiles FOR DELETE USING (user_id = auth.uid())';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create/replace profiles policies: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Table public.profiles does not exist, skipping profiles policies.';
  END IF;

  -- Reports policies
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid
             WHERE n.nspname = 'public' AND c.relname = 'reports') THEN

    EXECUTE 'ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY';

    BEGIN
      EXECUTE 'DROP POLICY IF EXISTS "Public select reports" ON public.reports';
      EXECUTE 'CREATE POLICY "Public select reports" ON public.reports FOR SELECT USING (true)';

      EXECUTE 'DROP POLICY IF EXISTS "Insert own reports" ON public.reports';
      EXECUTE 'CREATE POLICY "Insert own reports" ON public.reports FOR INSERT WITH CHECK (user_id = auth.uid())';

      EXECUTE 'DROP POLICY IF EXISTS "Update own reports" ON public.reports';
      EXECUTE 'CREATE POLICY "Update own reports" ON public.reports FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';

      EXECUTE 'DROP POLICY IF EXISTS "Delete own reports" ON public.reports';
      EXECUTE 'CREATE POLICY "Delete own reports" ON public.reports FOR DELETE USING (user_id = auth.uid())';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not create/replace reports policies: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Table public.reports does not exist, skipping reports policies.';
  END IF;
END$$;

-- Example seed (id placeholders)
-- Example seed (without referencing auth.users directly)
-- Avoid inserting a specific user_id that doesn't exist in auth.users (causes FK violations).
INSERT INTO public.profiles (display_name, avatar_url, phone, role)
VALUES ('Max Müller', 'https://example.com/avatar-max.jpg', '+49-170-0000000', 'techniker')
ON CONFLICT DO NOTHING;

INSERT INTO public.reports (title, location, description, nfc_tag, photos, status, category, assigned_to, user_id)
VALUES (
  'Wartung Pumpe A-23',
  'Gebäude A, Untergeschoss',
  'Regelmäßige Wartung der Hauptpumpe durchgeführt.',
  'NFC-A23-PUMP',
  ARRAY['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop'],
  'abgeschlossen',
  'Wartung',
  'Max Müller',
  NULL
)
ON CONFLICT DO NOTHING;

-- Helpful query
SELECT r.*, p.display_name AS assigned_to_name, p.avatar_url AS assigned_to_avatar
FROM public.reports r
LEFT JOIN public.profiles p ON r.assigned_to_id = p.id
ORDER BY r.created_at DESC;
