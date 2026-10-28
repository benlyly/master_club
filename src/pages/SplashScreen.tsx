import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DiamondMark } from '../components/Layout'

export default function SplashScreen() {
  const navigate = useNavigate()
  const [entered, setEntered] = useState(false)

  useEffect(() => { const t = setTimeout(() => setEntered(true), 200); return () => clearTimeout(t) }, [])
  function enter() { navigate('/masters') }

  return (
    <div className="relative min-h-screen overflow-hidden bg-onyx-950 plenefilm-noise flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-jade-600/20 blur-[120px] animate-breathe" />
        <div className="absolute -right-32 top-1/2 -translate-y-1/2 h-[36rem] w-[36rem] rounded-full bg-caramel-600/20 blur-[120px] animate-breathe" style={{ animationDelay: '3.5s' }} />
      </div>
      <div className={`relative z-10 flex flex-col items-center px-6 transition-all duration-1000 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <button onClick={enter} className="group relative mb-12" aria-label="Enter master.club">
          <div className="relative h-40 w-72 sm:h-52 sm:w-96">
            <div className="absolute inset-0 rounded-full border border-onyx-600/40" />
            <div className="absolute inset-2 rounded-full border border-onyx-600/20" />
            <svg viewBox="0 0 384 208" className="absolute inset-0 h-full w-full drop-shadow-[0_0_40px_rgba(22,161,107,0.15)]">
              <defs>
                <linearGradient id="teaGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0c523a" /><stop offset="50%" stopColor="#16a16b" /><stop offset="100%" stopColor="#0c8057" />
                </linearGradient>
                <linearGradient id="coffeeGrad" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#61351d" /><stop offset="50%" stopColor="#cf7a2e" /><stop offset="100%" stopColor="#934d20" />
                </linearGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <path d="M192 8 L8 104 L192 200 Z" fill="url(#teaGrad)" opacity="0.9" filter="url(#glow)" />
              <path d="M192 8 L376 104 L192 200 Z" fill="url(#coffeeGrad)" opacity="0.9" filter="url(#glow)" />
              <line x1="192" y1="8" x2="192" y2="200" stroke="#070708" strokeWidth="2" />
              <path d="M100 104 Q140 84 160 104 Q140 124 100 104 Z" fill="rgba(238,251,244,0.25)" />
              <path d="M110 104 L155 104" stroke="rgba(238,251,244,0.3)" strokeWidth="0.5" />
              <ellipse cx="284" cy="104" rx="18" ry="12" fill="rgba(253,246,238,0.25)" transform="rotate(20 284 104)" />
              <path d="M272 100 Q284 108 296 100" stroke="rgba(253,246,238,0.3)" strokeWidth="0.8" fill="none" transform="rotate(20 284 104)" />
              <path d="M192 8 L376 104 L192 200 L8 104 Z" fill="none" stroke="rgba(244,243,241,0.3)" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-pearl-500 text-xs tracking-[0.3em] uppercase opacity-0 group-hover:opacity-100 transition-opacity">Enter</div>
        </button>
        <h1 className="font-serif text-5xl sm:text-6xl text-pearl-100 tracking-wide text-center">master<span className="text-jade-400">.</span>club</h1>
        <p className="mt-6 font-serif italic text-lg sm:text-xl text-pearl-500 text-center max-w-md">...find the one whose love you drink...</p>
        <p className="mt-4 text-xs tracking-[0.25em] uppercase text-onyx-400 text-center">The global H2H ecosystem for baristas &amp; tea masters</p>
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button onClick={enter} className="rounded-full bg-gradient-to-r from-jade-600 to-jade-500 px-8 py-3 text-sm font-medium text-white shadow-glow-jade hover:scale-105 transition-transform">Explore Masters</button>
          <Link to="/auth" className="rounded-full border border-onyx-600 px-8 py-3 text-sm font-medium text-pearl-300 hover:border-pearl-300/50 transition-all">Become a Master</Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-onyx-950 to-transparent z-5" />
    </div>
  )
}
