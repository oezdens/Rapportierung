-- Supabase initial schema and policies

-- Extensions (UUID generator)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (Nutzerprofile)
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

-- Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT profiles (useful to display names/avatars in the app)
DROP POLICY IF EXISTS "Public select profiles" ON public.profiles;
CREATE POLICY "Public select profiles" ON public.profiles
FOR SELECT
USING (true);

-- Allow a user to INSERT their own profile (user_id must equal auth.uid())
DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
CREATE POLICY "Insert own profile" ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Allow a user to UPDATE their own profile
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" ON public.profiles
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own profile" ON public.profiles;
CREATE POLICY "Delete own profile" ON public.profiles
FOR DELETE
USING (user_id = auth.uid());

-- Reports table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports (created_at);

-- Add assigned_to_id referencing profiles
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS assigned_to_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reports_assigned_to_id_idx ON public.reports (assigned_to_id);

-- Backfill assigned_to_id from existing assigned_to text if display_name matches
-- (Best-effort; adjust as needed)
UPDATE public.reports AS r
SET assigned_to_id = p.id
FROM public.profiles AS p
WHERE r.assigned_to IS NOT NULL
  AND p.display_name = r.assigned_to;

-- Row Level Security for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select reports" ON public.reports;
CREATE POLICY "Public select reports" ON public.reports
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Insert own reports" ON public.reports;
CREATE POLICY "Insert own reports" ON public.reports
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Update own reports" ON public.reports;
CREATE POLICY "Update own reports" ON public.reports
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Delete own reports" ON public.reports;
CREATE POLICY "Delete own reports" ON public.reports
FOR DELETE
USING (user_id = auth.uid());

-- Example seed data (replace user_id values as needed)
INSERT INTO public.profiles (user_id, display_name, avatar_url, phone, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'Max Müller', 'https://example.com/avatar-max.jpg', '+49-170-0000000', 'techniker')
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
  '00000000-0000-0000-0000-000000000000'
)
ON CONFLICT DO NOTHING;

-- Helpful queries
-- Select reports with assigned profile info
SELECT r.*, p.display_name AS assigned_to_name, p.avatar_url AS assigned_to_avatar
FROM public.reports r
LEFT JOIN public.profiles p ON r.assigned_to_id = p.id
ORDER BY r.created_at DESC;
