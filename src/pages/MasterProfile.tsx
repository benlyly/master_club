import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { MasterProfile as P, Master, MasterAchievement, MasterDrink, MasterCafe, GuestReview, PeerEndorsement } from '../lib/types'
import { DiamondMark } from '../components/Layout'
import { WalletWidget } from '../components/WalletWidget'
import { cn, formatDate, specializationLabel, cardStyleGradient } from '../lib/utils'
import { Coffee, Leaf, MapPin, Award, Star, ChevronDown, Quote, Heart } from 'lucide-react'

export default function MasterProfile() {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<P | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    loadProfile(id).then((r) => { if (r) setProfile(r); else setError(true); setLoading(false) })
  }, [id])

  if (loading) return <div className="min-h-screen bg-onyx-950 flex items-center justify-center"><DiamondMark className="h-10 w-10 animate-spin-slow" /></div>
  if (error || !profile) return (
    <div className="min-h-screen bg-onyx-950 flex flex-col items-center justify-center px-6">
      <DiamondMark className="h-12 w-12 mb-6 opacity-50" />
      <h2 className="font-serif text-2xl text-pearl-100 mb-2">Master not found</h2>
      <p className="text-pearl-500 mb-6">This profile may not exist or has been removed.</p>
      <Link to="/masters" className="rounded-full border border-onyx-600 px-6 py-2.5 text-sm text-pearl-100 hover:border-jade-500/50 transition-all">Browse all masters</Link>
    </div>
  )

  const isTea = profile.specialization === 'tea'
  const accent = isTea ? 'jade' : 'caramel'

  return (
    <div className="min-h-screen bg-onyx-950 plenefilm-noise">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={cn('absolute -top-20 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-[120px] animate-breathe', isTea ? 'bg-jade-600/15' : 'bg-caramel-600/15')} />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        <Link to="/masters" className="inline-flex items-center gap-2 text-sm text-pearl-500 hover:text-pearl-300 transition-colors mb-10"><ChevronDown className="h-4 w-4 rotate-90" />All masters</Link>
        <LuxuryCard profile={profile} />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Verified Cups" value={profile.achievements.filter((a) => a.verified).length} icon={<Award className="h-4 w-4" />} accent={accent} />
          <StatCard label="Signature Drinks" value={profile.drinks.length} icon={<Coffee className="h-4 w-4" />} accent={accent} />
          <StatCard label="Reviews" value={profile.reviews.length} icon={<Star className="h-4 w-4" />} accent={accent} />
          <StatCard label="Followers" value={profile.follower_count} icon={<Heart className="h-4 w-4" />} accent={accent} />
        </div>
        {profile.bio && <div className="mt-8 glass rounded-2xl border border-onyx-700/60 p-8"><h3 className="font-serif text-lg text-pearl-100 mb-3">About</h3><p className="text-pearl-300 leading-relaxed">{profile.bio}</p></div>}
        <div className="mt-8"><WalletWidget masterId={profile.id} masterName={profile.name} cafes={profile.cafes} /></div>
        {profile.achievements.length > 0 && (
          <Section title="Achievements" icon={<Award className="h-5 w-5" />}>
            <div className="space-y-3">{profile.achievements.map((a) => (
              <div key={a.id} className="flex items-start gap-4 rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4">
                <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', a.verified ? 'bg-jade-900/40 text-jade-400' : 'bg-onyx-700 text-pearl-500')}><Award className="h-4 w-4" /></div>
                <div className="flex-1"><div className="flex items-center gap-2"><p className="font-medium text-pearl-100">{a.title}</p>{a.verified && <span className="rounded-full bg-jade-900/40 px-2 py-0.5 text-xs text-jade-400">Verified</span>}</div>{a.date && <p className="text-xs text-pearl-500 mt-0.5">{formatDate(a.date)}</p>}</div>
              </div>
            ))}</div>
          </Section>
        )}
        {profile.drinks.length > 0 && (
          <Section title="Signature Craft" icon={<Coffee className="h-5 w-5" />}>
            <div className="grid gap-4 sm:grid-cols-2">{profile.drinks.map((d) => (
              <div key={d.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
                <h4 className="font-serif text-lg text-pearl-100 mb-1">{d.name}</h4>
                {d.description && <p className="text-sm text-pearl-400 mb-3">{d.description}</p>}
                {d.ingredients?.length > 0 && <div className="flex flex-wrap gap-2">{d.ingredients.map((ing, i) => <span key={i} className={cn('rounded-full px-3 py-1 text-xs', isTea ? 'bg-jade-900/30 text-jade-300' : 'bg-caramel-900/30 text-caramel-300')}>{ing.name}{ing.amount ? ` · ${ing.amount}` : ''}</span>)}</div>}
              </div>
            ))}</div>
          </Section>
        )}
        {profile.endorsements.length > 0 && (
          <Section title="Peer Endorsements" icon={<Quote className="h-5 w-5" />}>
            <div className="space-y-3">{profile.endorsements.map((e) => (
              <div key={e.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
                <Quote className={cn('h-5 w-5 mb-2', isTea ? 'text-jade-500/40' : 'text-caramel-500/40')} />
                <p className="font-serif italic text-pearl-200">"{e.text}"</p>
                {e.sender && <Link to={`/m/${e.sender.id}`} className="mt-3 inline-block text-sm text-pearl-500 hover:text-pearl-300">— {e.sender.name}</Link>}
              </div>
            ))}</div>
          </Section>
        )}
        {profile.reviews.length > 0 && (
          <Section title="Guest Reviews" icon={<Star className="h-5 w-5" />}>
            <div className="space-y-3">{profile.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
                <div className="flex items-center gap-1 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'text-caramel-400 fill-caramel-400' : 'text-onyx-600')} />)}</div>
                {r.text && <p className="text-pearl-300">{r.text}</p>}
                <p className="text-xs text-pearl-500 mt-2">{formatDate(r.created_at)}</p>
              </div>
            ))}</div>
          </Section>
        )}
        <div className="mt-12 text-center"><Link to="/card" className="inline-flex items-center gap-2 rounded-full border border-onyx-600 px-6 py-3 text-sm text-pearl-100 hover:border-jade-500/50 transition-all">Generate physical business card</Link></div>
      </div>
    </div>
  )
}

async function loadProfile(id: string): Promise<P | null> {
  const { data: master, error } = await supabase.from('masters').select('*').eq('id', id).maybeSingle()
  if (error || !master) return null
  const m = master as Master
  const [ach, drk, caf, rev, end, fol, revAgg] = await Promise.all([
    supabase.from('master_achievements').select('*').eq('master_id', id).order('date', { ascending: false }),
    supabase.from('master_drinks').select('*').eq('master_id', id),
    supabase.from('master_cafes').select('*').eq('master_id', id),
    supabase.from('guest_reviews').select('*').eq('master_id', id).order('created_at', { ascending: false }),
    supabase.from('peer_endorsements').select('*').eq('receiver_id', id).order('created_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('master_id', id),
    supabase.from('guest_reviews').select('rating').eq('master_id', id),
  ])
  const endList = (end.data ?? []) as PeerEndorsement[]
  const sIds = [...new Set(endList.map((e) => e.sender_id))]
  const senders = sIds.length > 0 ? await supabase.from('masters').select('*').in('id', sIds) : { data: [] as Master[] | null }
  const sMap = new Map<string, Master>()
  for (const s of (senders.data ?? []) as Master[]) sMap.set(s.id, s)
  const ratings = (revAgg.data ?? []) as { rating: number }[]
  const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0
  return { ...m, achievements: (ach.data ?? []) as MasterAchievement[], drinks: (drk.data ?? []) as MasterDrink[], cafes: (caf.data ?? []) as MasterCafe[], reviews: (rev.data ?? []) as GuestReview[], endorsements: endList.map((e) => ({ ...e, sender: sMap.get(e.sender_id) ?? null })), follower_count: fol.count ?? 0, avg_rating: avg }
}

function LuxuryCard({ profile }: { profile: P }) {
  const isTea = profile.specialization === 'tea'
  const isGold = profile.card_style === 'gold'
  return (
    <div className={cn('relative rounded-2xl border shadow-card-luxe overflow-hidden', isGold ? 'border-caramel-400/30' : 'border-onyx-600/40')}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', cardStyleGradient(profile.card_style))} />
      {isGold && <div className="absolute inset-0 card-foil-border opacity-20" style={{ maskImage: 'linear-gradient(to bottom, black, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)' }} />}
      <div className="absolute inset-0 plenefilm-noise opacity-30" />
      <div className="relative z-10 p-8 sm:p-10">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3"><DiamondMark className="h-8 w-8" /><div><p className="text-xs tracking-[0.2em] uppercase text-pearl-500">master.club</p><p className="text-xs text-onyx-400">Digital ID Card</p></div></div>
          <div className="flex items-center gap-2">{isTea ? <Leaf className="h-4 w-4 text-jade-400" /> : <Coffee className="h-4 w-4 text-caramel-400" />}<span className={cn('text-xs uppercase tracking-wider', isTea ? 'text-jade-400' : 'text-caramel-400')}>{specializationLabel(profile.specialization)}</span></div>
        </div>
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} className="h-20 w-20 rounded-full object-cover border-2 border-onyx-600" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-onyx-800 border-2 border-onyx-600"><span className="font-serif text-2xl text-pearl-300">{profile.name.charAt(0)}</span></div>}
            {profile.achievements.some((a) => a.verified) && <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-jade-600 border-2 border-onyx-900"><Award className="h-3 w-3 text-white" /></div>}
          </div>
          <div><h1 className="font-serif text-3xl sm:text-4xl text-pearl-100 debossed">{profile.name}</h1>{profile.workplace && <p className="flex items-center gap-1.5 text-sm text-pearl-500 mt-1"><MapPin className="h-3.5 w-3.5" />{profile.workplace}</p>}</div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-onyx-700/40">
          <div className="grid grid-cols-3 gap-8"><div><p className="text-xs text-onyx-400 uppercase tracking-wider">Experience</p><p className="font-serif text-xl text-pearl-100 mt-0.5">{profile.experience_years}y</p></div><div><p className="text-xs text-onyx-400 uppercase tracking-wider">Cups</p><p className="font-serif text-xl text-pearl-100 mt-0.5">{profile.achievements.filter((a) => a.verified).length}</p></div><div><p className="text-xs text-onyx-400 uppercase tracking-wider">Rating</p><p className="font-serif text-xl text-pearl-100 mt-0.5">{profile.avg_rating > 0 ? profile.avg_rating.toFixed(1) : '—'}</p></div></div>
          <div className="text-right"><p className="text-xs text-onyx-400 uppercase tracking-wider">Member since</p><p className="font-mono text-sm text-pearl-400">{formatDate(profile.created_at)}</p></div>
        </div>
        <div className="mt-6 flex items-center justify-between"><p className="font-mono text-xs text-onyx-400 tracking-widest">ID · {profile.id.slice(0, 8).toUpperCase()}</p><p className={cn('font-serif italic text-xs', isGold ? 'gold-foil' : 'text-pearl-500')}>...find the one whose love you drink...</p></div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) {
  return <div className="glass rounded-xl border border-onyx-700/60 p-4 text-center"><div className={cn('mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full', accent === 'jade' ? 'bg-jade-900/40 text-jade-400' : 'bg-caramel-900/40 text-caramel-400')}>{icon}</div><p className="font-serif text-2xl text-pearl-100">{value}</p><p className="text-xs text-pearl-500 mt-0.5">{label}</p></div>
}
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="mt-10"><div className="flex items-center gap-3 mb-5"><div className="text-pearl-500">{icon}</div><h3 className="font-serif text-xl text-pearl-100">{title}</h3></div>{children}</div>
}
