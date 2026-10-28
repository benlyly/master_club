import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/utils'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, master, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/masters', label: 'Masters' },
    { to: '/card', label: 'Card Studio' },
  ]
  if (user && master) navLinks.push({ to: '/me', label: 'Dashboard' })

  async function handleSignOut() { await signOut(); navigate('/') }

  return (
    <div className="min-h-screen bg-onyx-950 text-pearl-100">
      <header className="sticky top-0 z-50 glass border-b border-onyx-700/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <DiamondMark className="h-7 w-7 transition-transform group-hover:rotate-90 duration-700" />
            <span className="font-serif text-xl tracking-wide text-pearl-100">master<span className="text-jade-400">.</span>club</span>
          </Link>
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={cn('link-underline text-sm font-medium tracking-wide transition-colors',
                  location.pathname === link.to ? 'text-pearl-100' : 'text-pearl-500 hover:text-pearl-100')}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-4">
                {master && <Link to={`/m/${master.id}`} className="text-sm font-medium text-jade-400 hover:text-jade-300 transition-colors">{master.name}</Link>}
                <button onClick={handleSignOut} className="text-sm text-pearl-500 hover:text-pearl-100 transition-colors">Sign out</button>
              </div>
            ) : (
              <Link to="/auth" className="rounded-full border border-onyx-600 px-5 py-2 text-sm font-medium text-pearl-100 hover:border-jade-500/50 hover:bg-jade-900/20 transition-all">Sign in</Link>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-onyx-800 mt-20">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-center gap-4">
            <DiamondMark className="h-8 w-8 opacity-60" />
            <p className="font-serif italic text-pearl-500 text-center text-sm">...find the one whose love you drink...</p>
            <p className="text-xs text-onyx-400 mt-2">master.club — the global H2H ecosystem for baristas and tea masters</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export function DiamondMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      <path d="M24 4 L44 24 L24 44 L4 24 Z" stroke="currentColor" strokeWidth="1.5" className="text-pearl-300" />
      <path d="M24 4 L24 44" stroke="currentColor" strokeWidth="1.2" className="text-caramel-400" />
      <path d="M14 24 Q24 14 34 24" stroke="currentColor" strokeWidth="1" className="text-jade-400" fill="none" />
      <path d="M14 24 Q24 34 34 24" stroke="currentColor" strokeWidth="1" className="text-caramel-400" fill="none" />
      <circle cx="24" cy="24" r="2" fill="currentColor" className="text-pearl-100" />
    </svg>
  )
}
