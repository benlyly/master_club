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
  if (loading) return <div className="min-h-screen flex items-center justify-center"><DiamondMark className="h-10 w-10 animate-spin-slow" /></div>
  if (!master) return <div className="mx-auto max-w-2xl px-6 py-20 text-center"><DiamondMark className="h-12 w-12 mx-auto mb-6 opacity-50" /><h2 className="font-serif text-2xl text-pearl-100 mb-2">Profile not found</h2><p className="text-pearl-500">Your master profile could not be loaded. Try signing out and back in.</p></div>

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
      <div className="mb-10"><h1 className="font-serif text-3xl sm:text-4xl text-pearl-100">Master Dashboard</h1><p className="text-pearl-500 mt-2">Welcome, {master.name}. Manage your digital identity.</p></div>
      <div className="flex gap-1 overflow-x-auto mb-8 pb-1">
        {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex items-center gap-2 shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all', tab === t.id ? 'bg-onyx-700 text-pearl-100' : 'text-pearl-500 hover:text-pearl-300 hover:bg-onyx-800')}>{t.icon}{t.label}</button>)}
      </div>
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
  const [exp, setExp] = useState(master.experience_years)
  const [style, setStyle] = useState<CardStyle>(master.card_style)
  const [spec, setSpec] = useState<Specialization>(master.specialization)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true); setError(null)
    const { error: er } = await supabase.from('masters').update({ name, bio: bio || null, workplace: workplace || null, avatar_url: avatarUrl || null, experience_years: exp, card_style: style, specialization: spec }).eq('id', master.id)
    if (er) setError(er.message); else { setSaved(true); await onSaved(); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6"><Pencil className="h-5 w-5 text-pearl-500" /><h2 className="font-serif text-xl text-pearl-100">Edit Digital Business Card</h2></div>
      <div className="grid gap-5 sm:grid-cols-2"><Inp label="Name" val={name} set={setName} /><Inp label="Workplace" val={workplace} set={setWorkplace} ph="Café name" /></div>
      <div><Lbl>Avatar URL</Lbl><input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none" /></div>
      <div><Lbl>Bio</Lbl><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Tell your story..." className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none resize-none" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><Lbl>Experience (years)</Lbl><input type="number" min={0} value={exp} onChange={(e) => setExp(Number(e.target.value))} className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 focus:border-jade-500/40 focus:outline-none" /></div>
        <div><Lbl>Specialization</Lbl><div className="grid grid-cols-2 gap-3"><SpecTog active={spec === 'coffee'} onClick={() => setSpec('coffee')} icon={<Coffee className="h-4 w-4" />} label="Coffee" /><SpecTog active={spec === 'tea'} onClick={() => setSpec('tea')} icon={<Leaf className="h-4 w-4" />} label="Tea" /></div></div>
      </div>
      <div><Lbl>Card Style</Lbl><div className="grid grid-cols-4 gap-3">{(['classic','gold','noir','pearl'] as CardStyle[]).map((s) => <button key={s} onClick={() => setStyle(s)} className={cn('rounded-lg border py-3 text-xs font-medium capitalize transition-all', style === s ? 'border-jade-500/50 bg-jade-900/20 text-pearl-100' : 'border-onyx-600 bg-onyx-900 text-pearl-500 hover:border-onyx-500')}>{s}</button>)}</div></div>
      {error && <div className="rounded-lg bg-red-950/40 border border-red-900/50 px-4 py-3 text-sm text-red-300">{error}</div>}
      <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-jade-600 to-jade-500 px-6 py-3 text-sm font-medium text-white hover:scale-[1.02] transition-transform disabled:opacity-50">{saving ? 'Saving...' : saved ? <><Check className="h-4 w-4" /> Saved</> : 'Save changes'}</button>
    </div>
  )
}

function DrinksEditor({ masterId }: { masterId: string }) {
  const [drinks, setDrinks] = useState<MasterDrink[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [nName, setNName] = useState(''); const [nDesc, setNDesc] = useState(''); const [nIng, setNIng] = useState('')
  const load = useCallback(async () => { const { data } = await supabase.from('master_drinks').select('*').eq('master_id', masterId); setDrinks((data ?? []) as MasterDrink[]); setLoading(false) }, [masterId])
  useEffect(() => { load() }, [load])
  async function add() {
    if (!nName) return
    const ings: Ingredient[] = nIng.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [name, amount] = s.split(':').map((p) => p.trim()); return { name, amount: amount || '' } })
    const { data } = await supabase.from('master_drinks').insert({ master_id: masterId, name: nName, description: nDesc || null, ingredients: ings }).select('*').single()
    if (data) { setDrinks([...drinks, data as MasterDrink]); setNName(''); setNDesc(''); setNIng(''); setAdding(false) }
  }
  async function del(id: string) { await supabase.from('master_drinks').delete().eq('id', id); setDrinks(drinks.filter((d) => d.id !== id)) }
  if (loading) return <Spin />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl text-pearl-100">Signature Craft Drinks</h2><button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600"><Plus className="h-4 w-4" />Add drink</button></div>
      {adding && <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3"><Inp label="Drink name" val={nName} set={setNName} ph="e.g. Nitro Cascade" /><Inp label="Description" val={nDesc} set={setNDesc} ph="A brief tasting note" /><div><Lbl>Ingredients (name:amount, comma separated)</Lbl><input type="text" value={nIng} onChange={(e) => setNIng(e.target.value)} placeholder="Espresso:30ml, Oat milk:120ml" className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none" /></div><div className="flex gap-3"><button onClick={add} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save drink</button><button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button></div></div>}
      {drinks.length === 0 ? <Empty text="No signature drinks yet. Add your first craft." /> : <div className="space-y-3">{drinks.map((d) => <div key={d.id} className="flex items-start justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4"><div className="flex-1"><h4 className="font-serif text-lg text-pearl-100">{d.name}</h4>{d.description && <p className="text-sm text-pearl-400 mt-1">{d.description}</p>}{d.ingredients?.length > 0 && <div className="flex flex-wrap gap-2 mt-2">{d.ingredients.map((ing, i) => <span key={i} className="rounded-full bg-onyx-700 px-2.5 py-0.5 text-xs text-pearl-300">{ing.name}{ing.amount ? ` · ${ing.amount}` : ''}</span>)}</div>}</div><button onClick={() => del(d.id)} className="text-pearl-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
    </div>
  )
}

function CafesEditor({ masterId }: { masterId: string }) {
  const [cafes, setCafes] = useState<MasterCafe[]>([]); const [loading, setLoading] = useState(true); const [adding, setAdding] = useState(false)
  const [name, setName] = useState(''); const [loc, setLoc] = useState('')
  const load = useCallback(async () => { const { data } = await supabase.from('master_cafes').select('*').eq('master_id', masterId); setCafes((data ?? []) as MasterCafe[]); setLoading(false) }, [masterId])
  useEffect(() => { load() }, [load])
  async function add() { if (!name) return; const { data } = await supabase.from('master_cafes').insert({ master_id: masterId, name, location: loc || null }).select('*').single(); if (data) { setCafes([...cafes, data as MasterCafe]); setName(''); setLoc(''); setAdding(false) } }
  async function del(id: string) { await supabase.from('master_cafes').delete().eq('id', id); setCafes(cafes.filter((c) => c.id !== id)) }
  if (loading) return <Spin />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl text-pearl-100">Café Workplaces</h2><button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600"><Plus className="h-4 w-4" />Add café</button></div>
      {adding && <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3"><Inp label="Café name" val={name} set={setName} ph="e.g. Onyx Coffee Lab" /><Inp label="Location" val={loc} set={setLoc} ph="City, Country" /><div className="flex gap-3"><button onClick={add} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save café</button><button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button></div></div>}
      {cafes.length === 0 ? <Empty text="No cafés added yet. Add where you currently work." /> : <div className="space-y-3">{cafes.map((c) => <div key={c.id} className="flex items-center justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4"><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-jade-400" /><div><h4 className="font-medium text-pearl-100">{c.name}</h4>{c.location && <p className="text-sm text-pearl-500">{c.location}</p>}</div></div><button onClick={() => del(c.id)} className="text-pearl-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
    </div>
  )
}

function AchievementsEditor({ masterId }: { masterId: string }) {
  const [achs, setAchs] = useState<MasterAchievement[]>([]); const [loading, setLoading] = useState(true); const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState(''); const [date, setDate] = useState('')
  const load = useCallback(async () => { const { data } = await supabase.from('master_achievements').select('*').eq('master_id', masterId).order('date', { ascending: false }); setAchs((data ?? []) as MasterAchievement[]); setLoading(false) }, [masterId])
  useEffect(() => { load() }, [load])
  async function add() { if (!title) return; const { data } = await supabase.from('master_achievements').insert({ master_id: masterId, title, date: date || null }).select('*').single(); if (data) { setAchs([data as MasterAchievement, ...achs]); setTitle(''); setDate(''); setAdding(false) } }
  async function del(id: string) { await supabase.from('master_achievements').delete().eq('id', id); setAchs(achs.filter((a) => a.id !== id)) }
  if (loading) return <Spin />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4"><div><h2 className="font-serif text-xl text-pearl-100">Achievements</h2><p className="text-xs text-pearl-500 mt-1">Verified achievements are confirmed by admins.</p></div><button onClick={() => setAdding(!adding)} className="flex items-center gap-2 rounded-full bg-onyx-700 px-4 py-2 text-sm text-pearl-100 hover:bg-onyx-600"><Plus className="h-4 w-4" />Add</button></div>
      {adding && <div className="rounded-xl border border-onyx-600 bg-onyx-900 p-5 space-y-3"><Inp label="Achievement title" val={title} set={setTitle} ph="e.g. WBC World Champion 2024" /><div><Lbl>Date</Lbl><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 focus:border-jade-500/40 focus:outline-none" /></div><div className="flex gap-3"><button onClick={add} className="rounded-lg bg-jade-600 px-4 py-2 text-sm text-white hover:bg-jade-500">Save</button><button onClick={() => setAdding(false)} className="rounded-lg border border-onyx-600 px-4 py-2 text-sm text-pearl-500 hover:text-pearl-300">Cancel</button></div></div>}
      {achs.length === 0 ? <Empty text="No achievements yet. Add your competition wins and certifications." /> : <div className="space-y-3">{achs.map((a) => <div key={a.id} className="flex items-center justify-between rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-4"><div className="flex items-center gap-3"><div className={cn('flex h-8 w-8 items-center justify-center rounded-full', a.verified ? 'bg-jade-900/40 text-jade-400' : 'bg-onyx-700 text-pearl-500')}><Award className="h-4 w-4" /></div><div><p className="font-medium text-pearl-100">{a.title}</p>{a.date && <p className="text-xs text-pearl-500">{new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>}</div>{a.verified && <span className="rounded-full bg-jade-900/40 px-2 py-0.5 text-xs text-jade-400">Verified</span>}</div><button onClick={() => del(a.id)} className="text-pearl-500 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
    </div>
  )
}

function ReviewsViewer({ masterId }: { masterId: string }) {
  const [reviews, setReviews] = useState<GuestReview[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { supabase.from('guest_reviews').select('*').eq('master_id', masterId).order('created_at', { ascending: false }).then(({ data }) => { setReviews((data ?? []) as GuestReview[]); setLoading(false) }) }, [masterId])
  if (loading) return <Spin />
  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  return <div className="space-y-4"><div className="flex items-center gap-4 mb-6"><h2 className="font-serif text-xl text-pearl-100">Guest Reviews</h2>{reviews.length > 0 && <div className="flex items-center gap-1"><Star className="h-4 w-4 text-caramel-400 fill-caramel-400" /><span className="font-serif text-lg text-pearl-100">{avg.toFixed(1)}</span><span className="text-xs text-pearl-500">({reviews.length})</span></div>}</div>{reviews.length === 0 ? <Empty text="No reviews yet. They will appear here when guests leave feedback." /> : <div className="space-y-3">{reviews.map((r) => <div key={r.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5"><div className="flex items-center gap-1 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'text-caramel-400 fill-caramel-400' : 'text-onyx-600')} />)}</div>{r.text && <p className="text-pearl-300">{r.text}</p>}<p className="text-xs text-pearl-500 mt-2">{new Date(r.created_at).toLocaleDateString()}</p></div>)}</div>}</div>
}

function EndorsementsViewer({ masterId }: { masterId: string }) {
  const [ends, setEnds] = useState<(PeerEndorsement & { sender_name?: string })[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { const { data: e } = await supabase.from('peer_endorsements').select('*').eq('receiver_id', masterId).order('created_at', { ascending: false }); const eList = (e ?? []) as PeerEndorsement[]; const sIds = [...new Set(eList.map((x) => x.sender_id))]; const { data: senders } = await supabase.from('masters').select('id, name').in('id', sIds); const sMap = new Map<string, string>(); for (const s of (senders ?? []) as { id: string; name: string }[]) sMap.set(s.id, s.name); setEnds(eList.map((x) => ({ ...x, sender_name: sMap.get(x.sender_id) }))); setLoading(false) })() }, [masterId])
  if (loading) return <Spin />
  return <div className="space-y-4"><h2 className="font-serif text-xl text-pearl-100 mb-6">Peer Endorsements</h2>{ends.length === 0 ? <Empty text="No endorsements yet. Fellow masters can vouch for your craft." /> : <div className="space-y-3">{ends.map((e) => <div key={e.id} className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5"><Quote className="h-5 w-5 text-jade-500/40 mb-2" /><p className="font-serif italic text-pearl-200">"{e.text}"</p>{e.sender_name && <p className="text-sm text-pearl-500 mt-2">— {e.sender_name}</p>}</div>)}</div>}</div>
}

function Inp({ label, val, set, ph }: { label: string; val: string; set: (v: string) => void; ph?: string }) {
  return <label className="block"><Lbl>{label}</Lbl><input type="text" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="w-full rounded-lg bg-onyx-800 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/40 focus:outline-none" /></label>
}
function Lbl({ children }: { children: React.ReactNode }) { return <span className="mb-2 block text-xs uppercase tracking-wider text-pearl-500">{children}</span> }
function SpecTog({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={cn('flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all', active ? 'border-jade-500/50 bg-jade-900/30 text-jade-300' : 'border-onyx-600 bg-onyx-900 text-pearl-500')}>{icon}{label}</button>
}
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-onyx-600 bg-onyx-900/30 p-12 text-center"><p className="text-pearl-500">{text}</p></div> }
function Spin() { return <div className="flex justify-center py-12"><DiamondMark className="h-8 w-8 animate-spin-slow" /></div> }
