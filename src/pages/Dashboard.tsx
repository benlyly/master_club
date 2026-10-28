import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'
import type { Master, MasterAchievement, MasterDrink, MasterCafe, GuestReview, PeerEndorsement, CardStyle, Specialization, Ingredient } from '../lib/types'
import { cn } from '../lib/utils'
import { DiamondMark } from '../components/Layout'
import { Coffee, Leaf, Award, Plus, Trash2, Star, Quote, MapPin, Pencil, Check } from 'lucide-react'

type Tab = 'profile' | 'drinks' | 'cafes' | 'reviews' | 'endorsements' | 'achievements'

export default function Dashboard() {
  const { master, refreshMaster, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DiamondMark className="h-10 w-10 animate-spin-slow" />
      </div>
    )
  }

  if (!master) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <DiamondMark className="h-12 w-12 mx-auto mb-6 opacity-50" />
        <h2 className="font-serif text-2xl text-pearl-100 mb-2">Profile not found</h2>
        <p className="text-pearl-500">Your master profile could not be loaded. Try signing out and back in.</p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Business Card', icon: <Pencil className="h-4 w-4" /> },
    { id: 'drinks', label: 'Signature Drinks', icon: <Coffee className="h-4 w-4" /> },
    { id: 'cafes', label: 'Cafés', icon: <MapPin className="h-4 w-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="h-4 w-4" /> },
    { id: 'endorsements', label: 'Endorsements', icon: <Quote className="h-4 w-4" /> },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-pearl-100">Master Dashboard</h1>
        <p className="text-pearl-500 mt-2">Welcome, {master.name}. Manage your digital identity.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-8 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all',
              tab === t.id
                ? 'bg-onyx-700 text-pearl-100'
                : 'text-pearl-500 hover:text-pearl-300 hover:bg-onyx-800',
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="glass rounded-2xl border border-onyx-700/60 p-6 sm:p-8">
        {tab === 'profile' && <ProfileEditor master={master} onSaved={refreshMaster} />}
        {tab === 'drinks' && <DrinksEditor masterId={master.id} />}
        {tab === 'cafes' && <CafesEditor masterId={master.id} />}
        {tab === 'achievements' && <AchievementsEditor masterId={master.id} />}
        {tab === 'reviews' && <ReviewsViewer masterId={master.id} />}
        {tab === 'endorsements' && <EndorsementsViewer masterId={master.id} />}
      </div>
    </div>
  )
}

function ProfileEditor({ master, onSaved }: { master: Master; onSaved: () => Promise<void> }) {
  const [name, setName] = useState(master.name)
  const [bio, setBio] = useState(master.bio ?? '')
  const [workplace, setWorkplace] = useState(master.workplace ?? '')
  const [avatarUrl, setAvatarUrl] = useState(master.avatar_url ?? '')
  const [experienceYears, setExperienceYears] = useState(master.experience_years)
  const [cardStyle, setCardStyle] = useState<CardStyle>(master.card_style)
  const [specialization, setSpecialization] = useState<Specialization>(master.specialization)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    const { error: updateError } = await supabase
      .from('masters')
      .update({
        name,
        bio: bio || null,
        workplace: workplace || null,
        avatar_url: avatarUrl || null,
        experience_years: experienceYears,
        card_style: cardStyle,
        specialization,
      })
      .eq('id', master.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setSaved(true)
      await onSaved()
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Pencil className="h-5 w-5 text-pearl-500" />
        <h2 className="font-serif text-xl text-pearl-100">Edit Digital Business Card</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Name" value={name} onChange={setName} />
        <Input label="Workplace" value={workplace} onChange={setWorkplace} placeholder="Café name" />
      </div>

      <div>
        <Label>Avatar URL</Label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none"
        />
      </div>

      <div>
        <Label>Bio</Label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Tell your story..."
          className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none resize-none"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Experience (years)</Label>
          <input
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 focus:border-jade-500/40 focus:outline-none"
          />
        </div>
        <div>
          <Label>Specialization</Label>
          <div className="grid grid-cols-2 gap-3">
            <SpecToggle active={specialization === 'coffee'} onClick={() => setSpecialization('coffee')} icon={<Coffee className="h-4 w-4" />} label="Coffee" />
            <SpecToggle active={specialization === 'tea'} onClick={() => setSpecialization('tea')} icon={<Leaf className="h-4 w-4" />} label="Tea" />
          </div>
        </div>
      </div>

      <div>
        <Label>Card Style</Label>
        <div className="grid grid-cols-4 gap-3">
          {(['classic', 'gold', 'noir', 'pearl'] as CardStyle[]).map((style) => (
            <button
              key={style}
              onClick={() => setCardStyle(style)}
              className={cn(
                'rounded-lg border py-3 text-xs font-medium capitalize transition-all',
                cardStyle === style
                  ? 'border-jade-500/50 bg-jade-900/20 text-pearl-100'
                  : 'border-onyx-600 bg-onyx-900 text-pearl-500 hover:border-onyx-500',
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-jade-600 to-jade-500 px-6 py-3 text-sm font-medium text-white hover:scale-[1.02] transition-transform disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? <><Check className="h-4 w-4" /> Saved</> : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function DrinksEditor({ masterId }: { masterId: string }) {
  const [drinks, setDrinks] = useState<MasterDrink[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newIngredients, setNewIngredients] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('master_drinks').select('*').eq('master_id', masterId)
    setDrinks((data ?? []) as MasterDrink[])
    setLoading(false)
  }, [masterId])

  useEffect(() => { load() }, [load])

  async function addDrink() {
    if (!newName) return
    const ingredients: Ingredient[] = newIngredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const [name, amount] = s.split(':').map((p) => p.trim())
        return { name, amount: amount || '' }
      })
    const { data } = await supabase
      .from('master_drinks')
      .insert({ master_id: masterId, name: newName, description: newDesc || null, ingredients })
      .select('*')
      .single()
    if (data) {
      setDrinks([...drinks, data as MasterDrink])
      setNewName('')
      setNewDesc('')
      setNewIngredients('')
      setAdding(false)
    }
  }

  async function deleteDrink(id: string) {
    await supabase.from('master_drinks').delete().eq('id', id)
    setDrinks(drinks.filter((d) => d.id !== id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-pearl-100">Signature Craft Drinks</h2>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600 transition-colors">
          <Plus className="h-4 w-4" /> Add drink
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3">
          <Input label="Drink name" value={newName} onChange={setNewName} placeholder="e.g. Nitro Cascade" />
          <Input label="Description" value={newDesc} onChange={setNewDesc} placeholder="A brief tasting note" />
          <div>
            <Label>Ingredients (name:amount, comma separated)</Label>
            <input
              type="text"
              value={newIngredients}
              onChange={(e) => setNewIngredients(e.target.value)}
              placeholder="Espresso:30ml, Oat milk:120ml, Vanilla:5ml"
              className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={addDrink} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save drink</button>
            <button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button>
          </div>
        </div>
      )}

      {drinks.length === 0 ? (
        <EmptyState text="No signature drinks yet. Add your first craft." />
      ) : (
        <div className="space-y-3">
          {drinks.map((d) => (
            <div key={d.id} className="flex items-start justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4">
              <div className="flex-1">
                <h4 className="font-serif text-lg text-pearl-100">{d.name}</h4>
                {d.description && <p className="text-sm text-pearl-400 mt-1">{d.description}</p>}
                {d.ingredients?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {d.ingredients.map((ing, i) => (
                      <span key={i} className="rounded-full bg-onyx-700 px-2.5 py-0.5 text-xs text-pearl-300">
                        {ing.name}{ing.amount ? ` · ${ing.amount}` : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => deleteDrink(d.id)} className="text-pearl-500 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CafesEditor({ masterId }: { masterId: string }) {
  const [cafes, setCafes] = useState<MasterCafe[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('master_cafes').select('*').eq('master_id', masterId)
    setCafes((data ?? []) as MasterCafe[])
    setLoading(false)
  }, [masterId])

  useEffect(() => { load() }, [load])

  async function addCafe() {
    if (!name) return
    const { data } = await supabase
      .from('master_cafes')
      .insert({ master_id: masterId, name, location: location || null })
      .select('*')
      .single()
    if (data) {
      setCafes([...cafes, data as MasterCafe])
      setName('')
      setLocation('')
      setAdding(false)
    }
  }

  async function deleteCafe(id: string) {
    await supabase.from('master_cafes').delete().eq('id', id)
    setCafes(cafes.filter((c) => c.id !== id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-pearl-100">Café Workplaces</h2>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600 transition-colors">
          <Plus className="h-4 w-4" /> Add café
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3">
          <Input label="Café name" value={name} onChange={setName} placeholder="e.g. Onyx Coffee Lab" />
          <Input label="Location" value={location} onChange={setLocation} placeholder="City, Country" />
          <div className="flex gap-3">
            <button onClick={addCafe} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save café</button>
            <button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button>
          </div>
        </div>
      )}

      {cafes.length === 0 ? (
        <EmptyState text="No cafés added yet. Add where you currently work." />
      ) : (
        <div className="space-y-3">
          {cafes.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-jade-400" />
                <div>
                  <h4 className="font-medium text-pearl-100">{c.name}</h4>
                  {c.location && <p className="text-sm text-pearl-500">{c.location}</p>}
                </div>
              </div>
              <button onClick={() => deleteCafe(c.id)} className="text-pearl-500 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AchievementsEditor({ masterId }: { masterId: string }) {
  const [achievements, setAchievements] = useState<MasterAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('master_achievements').select('*').eq('master_id', masterId).order('date', { ascending: false })
    setAchievements((data ?? []) as MasterAchievement[])
    setLoading(false)
  }, [masterId])

  useEffect(() => { load() }, [load])

  async function addAchievement() {
    if (!title) return
    const { data } = await supabase
      .from('master_achievements')
      .insert({ master_id: masterId, title, date: date || null })
      .select('*')
      .single()
    if (data) {
      setAchievements([data as MasterAchievement, ...achievements])
      setTitle('')
      setDate('')
      setAdding(false)
    }
  }

  async function deleteAchievement(id: string) {
    await supabase.from('master_achievements').delete().eq('id', id)
    setAchievements(achievements.filter((a) => a.id !== id))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl text-pearl-100">Achievements</h2>
          <p className="text-xs text-pearl-500 mt-1">Verified achievements (e.g. WBC championships) are confirmed by admins.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600 transition-colors">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3">
          <Input label="Achievement title" value={title} onChange={setTitle} placeholder="e.g. WBC World Champion 2024" />
          <div>
            <Label>Date</Label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 focus:border-jade-500/40 focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={addAchievement} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save</button>
            <button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button>
          </div>
        </div>
      )}

      {achievements.length === 0 ? (
        <EmptyState text="No achievements yet. Add your competition wins and certifications." />
      ) : (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  a.verified ? 'bg-jade-900/40 text-jade-400' : 'bg-onyx-700 text-pearl-500',
                )}>
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-pearl-100">{a.title}</p>
                  {a.date && <p className="text-xs text-pearl-500">{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}
                </div>
                {a.verified && <span className="rounded-full bg-jade-900/40 px-2 py-0.5 text-xs text-jade-400">Verified</span>}
              </div>
              <button onClick={() => deleteAchievement(a.id)} className="text-pearl-500 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewsViewer({ masterId }: { masterId: string }) {
  const [reviews, setReviews] = useState<GuestReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('guest_reviews').select('*').eq('master_id', masterId).order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data ?? []) as GuestReview[])
        setLoading(false)
      })
  }, [masterId])

  if (loading) return <LoadingSpinner />

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-serif text-xl text-pearl-100">Guest Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-caramel-400 fill-caramel-400" />
            <span className="font-serif text-lg text-pearl-100">{avg.toFixed(1)}</span>
            <span className="text-xs text-pearl-500">({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <EmptyState text="No reviews yet. They will appear here when guests leave feedback." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'text-caramel-400 fill-caramel-400' : 'text-onyx-600')} />
                ))}
              </div>
              {r.text && <p className="text-pearl-300">{r.text}</p>}
              <p className="text-xs text-pearl-500 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EndorsementsViewer({ masterId }: { masterId: string }) {
  const [endorsements, setEndorsements] = useState<(PeerEndorsement & { sender_name?: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: ends } = await supabase.from('peer_endorsements').select('*').eq('receiver_id', masterId).order('created_at', { ascending: false })
      const endList = (ends ?? []) as PeerEndorsement[]
      const senderIds = [...new Set(endList.map((e) => e.sender_id))]
      const { data: senders } = await supabase.from('masters').select('id, name').in('id', senderIds)
      const senderMap = new Map<string, string>()
      for (const s of (senders ?? []) as { id: string; name: string }[]) {
        senderMap.set(s.id, s.name)
      }
      setEndorsements(endList.map((e) => ({ ...e, sender_name: senderMap.get(e.sender_id) })))
      setLoading(false)
    }
    load()
  }, [masterId])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl text-pearl-100 mb-6">Peer Endorsements</h2>
      {endorsements.length === 0 ? (
        <EmptyState text="No endorsements yet. Fellow masters can vouch for your craft." />
      ) : (
        <div className="space-y-3">
          {endorsements.map((e) => (
            <div key={e.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
              <Quote className="h-5 w-5 text-jade-500/40 mb-2" />
              <p className="font-serif italic text-pearl-200">"{e.text}"</p>
              {e.sender_name && <p className="text-sm text-pearl-500 mt-2">— {e.sender_name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none"
      />
    </label>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-xs uppercase tracking-wider text-pearl-500">{children}</span>
}

function SpecToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
        active ? 'border-jade-500/50 bg-jade-900/30 text-jade-300' : 'border-onyx-600 bg-onyx-900 text-pearl-500',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-950/40 border border-red-900/50 px-4 py-3 text-sm text-red-300">{message}</div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-onyx-600 bg-onyx-900/30 p-12 text-center">
      <p className="text-pearl-500">{text}</p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-12">
      <DiamondMark className="h-8 w-8 animate-spin-slow" />
    </div>
  )
}
