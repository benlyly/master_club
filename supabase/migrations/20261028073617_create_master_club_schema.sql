/*
# master.club — Core Schema

1. Overview
   Full relational schema for the master.club H2H ecosystem: masters, achievements,
   drinks, cafés, reviews, endorsements, follows, user_roles. Includes owns_master()
   RLS helper and strict policies. Public SELECT for SSR/SEO; owner-scoped writes.

2. New Tables
   - masters, master_achievements, master_drinks, master_cafes, guest_reviews,
     peer_endorsements, follows, user_roles (see inline comments).

3. Enums: specialization_type (tea|coffee), card_style_type (classic|gold|noir|pearl)
4. Functions: owns_master(), is_admin()
5. Triggers: protect_achievement_verified (only admin sets verified=true), touch_updated_at
6. RLS: public read on master tables; owner writes via owns_master()
*/

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE specialization_type AS ENUM ('tea', 'coffee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE card_style_type AS ENUM ('classic', 'gold', 'noir', 'pearl');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLES  (created BEFORE functions that reference them)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.masters (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialization specialization_type NOT NULL DEFAULT 'coffee',
  experience_years int NOT NULL DEFAULT 0,
  bio text,
  avatar_url text,
  card_style card_style_type NOT NULL DEFAULT 'classic',
  is_demo boolean NOT NULL DEFAULT false,
  workplace text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.master_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  title text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.master_drinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.master_cafes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  coordinates jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.guest_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  reviewer_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.peer_endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (sender_id <> receiver_id)
);

CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  master_id uuid NOT NULL REFERENCES public.masters(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, master_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- HELPER FUNCTIONS  (tables now exist)
-- ============================================================
CREATE OR REPLACE FUNCTION public.owns_master(p_master_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.masters m
    WHERE m.id = p_master_id AND m.id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_achievement_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.verified = true AND (TG_OP = 'INSERT' OR OLD.verified = false OR OLD.verified IS NULL) THEN
    IF NOT public.is_admin() THEN
      NEW.verified := false;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.verified = true AND NEW.verified = false AND NOT public.is_admin() THEN
    NEW.verified := OLD.verified;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_achievement_verified_ins ON public.master_achievements;
CREATE TRIGGER trg_protect_achievement_verified_ins
  BEFORE INSERT ON public.master_achievements
  FOR EACH ROW EXECUTE FUNCTION public.protect_achievement_verified();

DROP TRIGGER IF EXISTS trg_protect_achievement_verified_upd ON public.master_achievements;
CREATE TRIGGER trg_protect_achievement_verified_upd
  BEFORE UPDATE ON public.master_achievements
  FOR EACH ROW EXECUTE FUNCTION public.protect_achievement_verified();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_masters ON public.masters;
CREATE TRIGGER trg_touch_masters
  BEFORE UPDATE ON public.masters
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- GRANTS
-- ============================================================
GRANT SELECT ON public.masters TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.masters TO authenticated;

GRANT SELECT ON public.master_achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_achievements TO authenticated;

GRANT SELECT ON public.master_drinks TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_drinks TO authenticated;

GRANT SELECT ON public.master_cafes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.master_cafes TO authenticated;

GRANT SELECT ON public.guest_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.guest_reviews TO authenticated;

GRANT SELECT ON public.peer_endorsements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.peer_endorsements TO authenticated;

GRANT SELECT ON public.follows TO anon, authenticated;
GRANT INSERT, DELETE ON public.follows TO authenticated;

GRANT SELECT ON public.user_roles TO authenticated;

-- ============================================================
-- POLICIES: masters
-- ============================================================
DROP POLICY IF EXISTS "select_masters" ON public.masters;
CREATE POLICY "select_masters" ON public.masters
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_master" ON public.masters;
CREATE POLICY "insert_own_master" ON public.masters
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_master" ON public.masters;
CREATE POLICY "update_own_master" ON public.masters
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_master" ON public.masters;
CREATE POLICY "delete_own_master" ON public.masters
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- POLICIES: master_achievements
-- ============================================================
DROP POLICY IF EXISTS "select_achievements" ON public.master_achievements;
CREATE POLICY "select_achievements" ON public.master_achievements
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_achievement" ON public.master_achievements;
CREATE POLICY "insert_own_achievement" ON public.master_achievements
  FOR INSERT TO authenticated WITH CHECK (public.owns_master(master_id));

DROP POLICY IF EXISTS "update_own_achievement" ON public.master_achievements;
CREATE POLICY "update_own_achievement" ON public.master_achievements
  FOR UPDATE TO authenticated
  USING (public.owns_master(master_id) OR public.is_admin())
  WITH CHECK (public.owns_master(master_id) OR public.is_admin());

DROP POLICY IF EXISTS "delete_own_achievement" ON public.master_achievements;
CREATE POLICY "delete_own_achievement" ON public.master_achievements
  FOR DELETE TO authenticated
  USING (public.owns_master(master_id) OR public.is_admin());

-- ============================================================
-- POLICIES: master_drinks
-- ============================================================
DROP POLICY IF EXISTS "select_drinks" ON public.master_drinks;
CREATE POLICY "select_drinks" ON public.master_drinks
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_drink" ON public.master_drinks;
CREATE POLICY "insert_own_drink" ON public.master_drinks
  FOR INSERT TO authenticated WITH CHECK (public.owns_master(master_id));

DROP POLICY IF EXISTS "update_own_drink" ON public.master_drinks;
CREATE POLICY "update_own_drink" ON public.master_drinks
  FOR UPDATE TO authenticated
  USING (public.owns_master(master_id)) WITH CHECK (public.owns_master(master_id));

DROP POLICY IF EXISTS "delete_own_drink" ON public.master_drinks;
CREATE POLICY "delete_own_drink" ON public.master_drinks
  FOR DELETE TO authenticated USING (public.owns_master(master_id));

-- ============================================================
-- POLICIES: master_cafes
-- ============================================================
DROP POLICY IF EXISTS "select_cafes" ON public.master_cafes;
CREATE POLICY "select_cafes" ON public.master_cafes
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_cafe" ON public.master_cafes;
CREATE POLICY "insert_own_cafe" ON public.master_cafes
  FOR INSERT TO authenticated WITH CHECK (public.owns_master(master_id));

DROP POLICY IF EXISTS "update_own_cafe" ON public.master_cafes;
CREATE POLICY "update_own_cafe" ON public.master_cafes
  FOR UPDATE TO authenticated
  USING (public.owns_master(master_id)) WITH CHECK (public.owns_master(master_id));

DROP POLICY IF EXISTS "delete_own_cafe" ON public.master_cafes;
CREATE POLICY "delete_own_cafe" ON public.master_cafes
  FOR DELETE TO authenticated USING (public.owns_master(master_id));

-- ============================================================
-- POLICIES: guest_reviews
-- ============================================================
DROP POLICY IF EXISTS "select_reviews" ON public.guest_reviews;
CREATE POLICY "select_reviews" ON public.guest_reviews
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_review" ON public.guest_reviews;
CREATE POLICY "insert_review" ON public.guest_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "update_own_review" ON public.guest_reviews;
CREATE POLICY "update_own_review" ON public.guest_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

DROP POLICY IF EXISTS "delete_own_review" ON public.guest_reviews;
CREATE POLICY "delete_own_review" ON public.guest_reviews
  FOR DELETE TO authenticated USING (auth.uid() = reviewer_id);

-- ============================================================
-- POLICIES: peer_endorsements
-- ============================================================
DROP POLICY IF EXISTS "select_endorsements" ON public.peer_endorsements;
CREATE POLICY "select_endorsements" ON public.peer_endorsements
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_endorsement" ON public.peer_endorsements;
CREATE POLICY "insert_own_endorsement" ON public.peer_endorsements
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "update_own_endorsement" ON public.peer_endorsements;
CREATE POLICY "update_own_endorsement" ON public.peer_endorsements
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete_own_endorsement" ON public.peer_endorsements;
CREATE POLICY "delete_own_endorsement" ON public.peer_endorsements
  FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ============================================================
-- POLICIES: follows
-- ============================================================
DROP POLICY IF EXISTS "select_follows" ON public.follows;
CREATE POLICY "select_follows" ON public.follows
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_follow" ON public.follows;
CREATE POLICY "insert_own_follow" ON public.follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "delete_own_follow" ON public.follows;
CREATE POLICY "delete_own_follow" ON public.follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- ============================================================
-- POLICIES: user_roles
-- ============================================================
DROP POLICY IF EXISTS "select_own_role" ON public.user_roles;
CREATE POLICY "select_own_role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_masters_specialization ON public.masters(specialization);
CREATE INDEX IF NOT EXISTS idx_masters_is_demo ON public.masters(is_demo);
CREATE INDEX IF NOT EXISTS idx_achievements_master ON public.master_achievements(master_id);
CREATE INDEX IF NOT EXISTS idx_drinks_master ON public.master_drinks(master_id);
CREATE INDEX IF NOT EXISTS idx_cafes_master ON public.master_cafes(master_id);
CREATE INDEX IF NOT EXISTS idx_reviews_master ON public.guest_reviews(master_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_receiver ON public.peer_endorsements(receiver_id);
CREATE INDEX IF NOT EXISTS idx_follows_master ON public.follows(master_id);
