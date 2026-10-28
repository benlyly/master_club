import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { MasterWithStats, Specialization } from '../lib/types'
import { DiamondMark } from '../components/Layout'
import { cn, specializationLabel } from '../lib/utils'
import { Coffee, Leaf, Award, Star, Search, Trophy } from 'lucide-react'

export default function MastersDirectory() {
  const [masters, setMasters] = useState<MasterWithStats[]>([])
  const [hallOfFame, setHallOfFame] = useState<MasterWithStats[]>([])
  const [filter, setFilter] = useState<Specialization | 'all'>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMasters().then((result) => {
      setMasters(result.active)
      setHallOfFame(result.demos)
      setLoading(false)
    })
  }, [])

  const filtered = masters.filter((m) => {
    if (filter !== 'all' && m.specialization !== filter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <DiamondMark className="h-10 w-10 mx-auto mb-4 opacity-80" />
        <h1 className="font-serif text-4xl sm:text-5xl text-pearl-100">The Masters</h1>
        <p className="font-serif italic text-pearl-500 mt-3">A catalogue of verified craft creators</p>
      </div>

      {/* Hall of Fame */}
      {hallOfFame.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="h-6 w-6 text-caramel-400" />
            <h2 className="font-serif text-2xl text-pearl-100">Hall of Fame</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-caramel-400/30 to-transparent" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hallOfFame.map((m) => (
              <MasterCard key={m.id} master={m} hallOfFame />
            ))}
          </div>
        </section>
      )}

      {/* Filter + Search */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 rounded-full bg-onyx-900 p-1 border border-onyx-700/60">
          {(['all', 'coffee', 'tea'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all capitalize',
                filter === f
                  ? f === 'tea'
                    ? 'bg-jade-900/50 text-jade-300'
                    : f === 'coffee'
                      ? 'bg-caramel-900/50 text-caramel-300'
                      : 'bg-onyx-700 text-pearl-100'
                  : 'text-pearl-500 hover:text-pearl-300',
              )}
            >
              {f === 'coffee' && <Coffee className="h-4 w-4" />}
              {f === 'tea' && <Leaf className="h-4 w-4" />}
              {f === 'all' ? 'All Masters' : f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-onyx-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search masters..."
            className="w-full rounded-full bg-onyx-900 border border-onyx-700/60 pl-10 pr-4 py-2.5 text-sm text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Active masters grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <DiamondMark className="h-10 w-10 animate-spin-slow" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MasterCard key={m.id} master={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-pearl-500">No masters found matching your search.</p>
        </div>
      )}
    </div>
  )
}

async function loadMasters(): Promise<{ active: MasterWithStats[]; demos: MasterWithStats[] }> {
  const { data, error } = await supabase.from('masters').select('*').order('created_at', { ascending: false })
  if (error || !data) return { active: [], demos: [] }

  const allMasters = data as MasterWithStats[]

  const withStats = await Promise.all(
    allMasters.map(async (m) => {
      const [ach, rev, fol] = await Promise.all([
        supabase.from('master_achievements').select('*', { count: 'exact', head: true }).eq('master_id', m.id),
        supabase.from('guest_reviews').select('rating', { count: 'exact' }).eq('master_id', m.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('master_id', m.id),
      ])
      const ratings = (rev.data ?? []) as { rating: number }[]
      const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0
      return {
        ...m,
        achievement_count: ach.count ?? 0,
        review_count: rev.count ?? 0,
        follower_count: fol.count ?? 0,
        avg_rating: avg,
      }
    }),
  )

  const demos = withStats.filter((m) => m.is_demo)
  const active = withStats.filter((m) => !m.is_demo)
  return { active, demos }
}

function MasterCard({ master, hallOfFame = false }: { master: MasterWithStats; hallOfFame?: boolean }) {
  const isTea = master.specialization === 'tea'
  return (
    <Link
      to={`/m/${master.id}`}
      className={cn(
        'group relative rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] hover:shadow-card-luxe',
        hallOfFame ? 'border-caramel-400/20 bg-gradient-to-br from-onyx-900 to-onyx-800' : 'border-onyx-700/60 bg-onyx-900/50',
      )}
    >
      {hallOfFame && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-caramel-900/50 px-3 py-1 text-xs text-caramel-300">
          <Trophy className="h-3 w-3" />
          Hall of Fame
        </div>
      )}

      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          {master.avatar_url ? (
            <img src={master.avatar_url} alt={master.name} className="h-14 w-14 rounded-full object-cover border border-onyx-600" />
          ) : (
            <div className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full border',
              isTea ? 'bg-jade-900/30 border-jade-700/40' : 'bg-caramel-900/30 border-caramel-700/40',
            )}>
              {isTea ? <Leaf className="h-6 w-6 text-jade-400" /> : <Coffee className="h-6 w-6 text-caramel-400" />}
            </div>
          )}
          <div>
            <h3 className="font-serif text-xl text-pearl-100 group-hover:text-white transition-colors">{master.name}</h3>
            <p className={cn('text-xs uppercase tracking-wider', isTea ? 'text-jade-400' : 'text-caramel-400')}>
              {specializationLabel(master.specialization)}
            </p>
          </div>
        </div>

        {master.bio && (
          <p className="text-sm text-pearl-400 line-clamp-2 mb-4">{master.bio}</p>
        )}

        {master.workplace && (
          <p className="text-xs text-pearl-500 mb-4">at {master.workplace}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-5 pt-4 border-t border-onyx-700/40">
          <Stat icon={<Award className="h-3.5 w-3.5" />} value={master.achievement_count ?? 0} label="cups" />
          <Stat icon={<Star className="h-3.5 w-3.5" />} value={master.avg_rating ? master.avg_rating.toFixed(1) : '—'} label="rating" />
          <span className="ml-auto text-xs text-pearl-500">{master.experience_years}y exp</span>
        </div>
      </div>
    </Link>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-pearl-500">{icon}</span>
      <span className="text-sm font-medium text-pearl-200">{value}</span>
      <span className="text-xs text-onyx-400">{label}</span>
    </div>
  )
}
