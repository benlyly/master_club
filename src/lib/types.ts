export type Specialization = 'tea' | 'coffee'
export type CardStyle = 'classic' | 'gold' | 'noir' | 'pearl'

export interface Master {
  id: string; name: string; specialization: Specialization; experience_years: number
  bio: string | null; avatar_url: string | null; card_style: CardStyle; is_demo: boolean
  workplace: string | null; created_at: string; updated_at: string
}
export interface MasterAchievement { id: string; master_id: string; title: string; verified: boolean; date: string | null; created_at: string }
export interface Ingredient { name: string; amount: string }
export interface MasterDrink { id: string; master_id: string; name: string; description: string | null; ingredients: Ingredient[]; created_at: string }
export interface MasterCafe { id: string; master_id: string; name: string; location: string | null; coordinates: { lat: number; lng: number } | null; created_at: string }
export interface GuestReview { id: string; master_id: string; reviewer_id: string | null; rating: number; text: string | null; created_at: string }
export interface PeerEndorsement { id: string; sender_id: string; receiver_id: string; text: string; created_at: string }
export interface Follow { id: string; follower_id: string; master_id: string; created_at: string }

export interface MasterWithStats extends Master {
  achievement_count?: number; review_count?: number; follower_count?: number; avg_rating?: number
}
export interface MasterProfile extends Master {
  achievements: MasterAchievement[]; drinks: MasterDrink[]; cafes: MasterCafe[]
  reviews: GuestReview[]; endorsements: (PeerEndorsement & { sender?: Master | null })[]
  follower_count: number; avg_rating: number
}
