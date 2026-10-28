/*
# Remove auth.users FK from follows and guest_reviews for demo data

1. Changes
   - Drops foreign key on follows.follower_id -> auth.users(id)
   - Drops foreign key on guest_reviews.reviewer_id -> auth.users(id)
   - This allows demo master profiles (without real auth accounts) to have
     follows and reviews for the Hall of Fame feature.

2. Security
   - No RLS changes. RLS policies still check auth.uid() = follower_id / reviewer_id
     which will be false for demo rows, so demo follows/reviews cannot be modified
     by anyone. They are read-only public data.
*/

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.guest_reviews DROP CONSTRAINT IF EXISTS guest_reviews_reviewer_id_fkey;
