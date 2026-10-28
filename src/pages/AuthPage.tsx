import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { DiamondMark } from '../components/Layout'
import { cn } from '../lib/utils'
import { Coffee, Leaf, ArrowRight } from 'lucide-react'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState<'tea' | 'coffee'>('coffee')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    if (mode === 'signup') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setSubmitting(false); return }
      const { error: signUpError } = await signUp(email, password, name || 'New Master', specialization)
      if (signUpError) { setError(signUpError); setSubmitting(false); return }
      navigate('/me')
    } else {
      const { error: signInError } = await signIn(email, password)
      if (signInError) { setError(signInError); setSubmitting(false); return }
      navigate('/me')
    }
    setSubmitting(false)
  }

  return (
    <div className="relative min-h-screen bg-onyx-950 plenefilm-noise flex items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-jade-600/10 blur-[100px] animate-breathe" />
        <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-caramel-600/10 blur-[100px] animate-breathe" style={{ animationDelay: '3s' }} />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-10">
          <DiamondMark className="h-8 w-8" />
          <span className="font-serif text-2xl text-pearl-100">master<span className="text-jade-400">.</span>club</span>
        </Link>
        <div className="glass rounded-2xl border border-onyx-700/60 p-8 shadow-card-luxe">
          <div className="flex gap-1 rounded-full bg-onyx-900 p-1 mb-8">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(null) }}
                className={cn('flex-1 rounded-full py-2.5 text-sm font-medium transition-all',
                  mode === m ? 'bg-onyx-700 text-pearl-100' : 'text-pearl-500 hover:text-pearl-300')}>
                {m === 'signin' ? 'Sign In' : 'Become a Master'}
              </button>
            ))}
          </div>
          <h2 className="font-serif text-2xl text-pearl-100 mb-2">{mode === 'signin' ? 'Welcome back' : 'Begin your craft journey'}</h2>
          <p className="text-sm text-pearl-500 mb-6">{mode === 'signin' ? 'Access your digital identity card.' : 'Create your master profile and digital ID card.'}</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <Field label="Master name">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                  className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/50 focus:outline-none transition-colors" />
              </Field>
            )}
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@master.club" required
                className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/50 focus:outline-none transition-colors" />
            </Field>
            <Field label="Password">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-pearl-100 placeholder-onyx-400 focus:border-jade-500/50 focus:outline-none transition-colors" />
            </Field>
            {mode === 'signup' && (
              <Field label="Specialization">
                <div className="grid grid-cols-2 gap-3">
                  <SpecButton active={specialization === 'coffee'} onClick={() => setSpecialization('coffee')} icon={<Coffee className="h-5 w-5" />} label="Coffee" color="caramel" />
                  <SpecButton active={specialization === 'tea'} onClick={() => setSpecialization('tea')} icon={<Leaf className="h-5 w-5" />} label="Tea" color="jade" />
                </div>
              </Field>
            )}
            {error && <div className="rounded-lg bg-red-950/40 border border-red-900/50 px-4 py-3 text-sm text-red-300">{error}</div>}
            <button type="submit" disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-jade-600 to-jade-500 py-3 text-sm font-medium text-white shadow-glow-jade hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:hover:scale-100">
              {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Profile'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-pearl-500">
            {mode === 'signin' ? (
              <>New to master.club? <button onClick={() => { setMode('signup'); setError(null) }} className="text-jade-400 hover:text-jade-300">Become a Master</button></>
            ) : (
              <>Already a master? <button onClick={() => { setMode('signin'); setError(null) }} className="text-jade-400 hover:text-jade-300">Sign in</button></>
            )}
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-onyx-400">Guests can browse masters without an account. <Link to="/masters" className="text-pearl-500 hover:text-pearl-300">Explore directory</Link></p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs uppercase tracking-wider text-pearl-500">{label}</span>{children}</label>
}

function SpecButton({ active, onClick, icon, label, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: 'jade' | 'caramel' }) {
  return (
    <button type="button" onClick={onClick}
      className={cn('flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
        active ? color === 'jade' ? 'border-jade-500/50 bg-jade-900/30 text-jade-300' : 'border-caramel-500/50 bg-caramel-900/30 text-caramel-300' : 'border-onyx-600 bg-onyx-900 text-pearl-500 hover:border-onyx-500')}>
      {icon}{label}
    </button>
  )
}
