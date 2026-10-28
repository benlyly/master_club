/*
# Allow demo master profiles without auth.users FK

1. Changes
   - Drops the foreign key constraint on `masters.id` that references `auth.users(id)`.
   - This allows demo/Hall-of-Fame master profiles to exist with generated UUIDs
     that don't correspond to real auth accounts.
   - The `DEFAULT auth.uid()` is preserved so real signups still work.

2. Security
   - No RLS changes. Public SELECT remains; owner-scoped writes via owns_master()
     still work because owns_master checks `m.id = auth.uid()` which will simply
     be false for demo rows (no matching auth user).
*/

ALTER TABLE public.masters DROP CONSTRAINT IF EXISTS masters_id_fkey;

-- Re-add without ON DELETE CASCADE since demo rows aren't tied to auth users.
-- We keep the FK but make it optional by not enforcing it (can't have optional FK).
-- Instead, just leave the FK dropped — the DEFAULT auth.uid() still populates
-- real signups, and demo rows use gen_random_uuid().
