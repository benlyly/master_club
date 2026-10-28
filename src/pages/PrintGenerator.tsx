import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useAuth } from '../lib/auth'
import { DiamondMark } from '../components/Layout'
import { cn } from '../lib/utils'
import { Coffee, Leaf, Stamp, Download, RefreshCw } from 'lucide-react'

export default function PrintGenerator() {
  const { master } = useAuth()
  const [qrUrl, setQrUrl] = useState('')
  const [monogram, setMonogram] = useState('M')
  const [monoShape, setMonoShape] = useState<'circle' | 'diamond' | 'hex'>('diamond')
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const base = window.location.origin
      const url = master ? `${base}/m/${master.id}` : base
      setMonogram(master?.name?.charAt(0)?.toUpperCase() ?? 'M')
      try { const qr = await QRCode.toDataURL(url, { width: 200, margin: 1, color: { dark: '#070708', light: '#f4f3f1' } }); setQrUrl(qr) } catch { /* */ }
      setLoading(false)
    })()
  }, [master])

  if (loading) return <div className="flex justify-center py-20"><DiamondMark className="h-10 w-10 animate-spin-slow" /></div>
  const isTea = master?.specialization === 'tea'

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="text-center mb-12"><DiamondMark className="h-10 w-10 mx-auto mb-4 opacity-80" /><h1 className="font-serif text-4xl text-pearl-100">Card Studio</h1><p className="font-serif italic text-pearl-500 mt-3">Generate your physical master business card</p></div>
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="font-serif text-xl text-pearl-100 flex items-center gap-2"><Coffee className="h-5 w-5 text-caramel-400" />Double-Sided Card (90×50mm)</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="cursor-pointer" onClick={() => setFlipped(!flipped)}>
              <div className="relative transition-transform duration-700" style={{ width: '360px', height: '200px', transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                <CardFront name={master?.name ?? 'MASTER'} spec={master?.specialization ?? 'coffee'} qrUrl={qrUrl} style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0 }} />
                <CardBack style={{ backfaceVisibility: 'hidden', position: 'absolute', inset: 0, transform: 'rotateY(180deg)' }} />
              </div>
            </div>
            <p className="text-xs text-pearl-500">Click card to flip · Touche Cover 90×50mm</p>
            <div className="flex gap-3">
              <button onClick={() => setFlipped(!flipped)} className="flex items-center gap-2 rounded-full border border-onyx-600 px-5 py-2.5 text-sm text-pearl-100 hover:border-pearl-300/40 transition-all"><RefreshCw className="h-4 w-4" />Flip card</button>
              <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-jade-600 to-jade-500 px-5 py-2.5 text-sm font-medium text-white hover:scale-[1.02] transition-transform"><Download className="h-4 w-4" />Print / Export</button>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="font-serif text-xl text-pearl-100 flex items-center gap-2"><Stamp className="h-5 w-5 text-caramel-400" />Craft Wood Stamp Monogram</h2>
          <div className="glass rounded-2xl border border-onyx-700/60 p-6 space-y-5">
            <div><label className="block"><span className="mb-2 block text-xs uppercase tracking-wider text-pearl-500">Monogram letter</span><input type="text" maxLength={1} value={monogram} onChange={(e) => setMonogram(e.target.value.toUpperCase().slice(0, 1) || 'M')} className="w-20 rounded-lg bg-onyx-900 border border-onyx-600 px-4 py-3 text-center text-2xl font-serif text-pearl-100 focus:border-jade-500/40 focus:outline-none" /></label></div>
            <div><span className="mb-2 block text-xs uppercase tracking-wider text-pearl-500">Stamp shape</span><div className="grid grid-cols-3 gap-3">{(['diamond','circle','hex'] as const).map((s) => <button key={s} onClick={() => setMonoShape(s)} className={cn('rounded-lg border py-3 text-xs font-medium capitalize transition-all', monoShape === s ? 'border-caramel-500/50 bg-caramel-900/20 text-caramel-300' : 'border-onyx-600 bg-onyx-900 text-pearl-500 hover:border-onyx-500')}>{s}</button>)}</div></div>
          </div>
          <div className="flex flex-col items-center"><StampPreview letter={monogram} shape={monoShape} isTea={isTea} /><p className="text-xs text-pearl-500 mt-4">For cup branding — debossed wood stamp</p></div>
        </div>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .print-card, .print-card * { visibility: visible; } .print-card { position: absolute; left: 0; top: 0; } }`}</style>
    </div>
  )
}

function CardFront({ name, spec, qrUrl, style }: { name: string; spec: 'tea' | 'coffee'; qrUrl: string; style: React.CSSProperties }) {
  const isTea = spec === 'tea'
  return (
    <div style={style} className="print-card rounded-lg overflow-hidden shadow-card-luxe border border-onyx-600/40">
      <div className="relative h-full w-full bg-gradient-to-br from-onyx-900 via-onyx-800 to-onyx-900 plenefilm-noise">
        <div className="absolute inset-0 flex flex-col items-center justify-center"><p className="font-serif text-5xl tracking-[0.3em] text-pearl-100/15 debossed pl-2">MASTER</p><div className="mt-3 h-px w-32 bg-gradient-to-r from-transparent via-pearl-300/20 to-transparent" /><p className="mt-3 font-serif italic text-xs text-pearl-500 text-center px-8">...find the one whose love you drink...</p></div>
        <div className="absolute top-3 left-3"><DiamondMark className="h-5 w-5 opacity-40" /></div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">{isTea ? <Leaf className="h-3 w-3 text-jade-400/60" /> : <Coffee className="h-3 w-3 text-caramel-400/60" />}<span className="text-[8px] uppercase tracking-widest text-pearl-500">{isTea ? 'Tea' : 'Coffee'}</span></div>
        {qrUrl && <div className="absolute bottom-3 right-3"><img src={qrUrl} alt="QR" className="h-12 w-12 rounded border border-onyx-600/40" /></div>}
        <div className="absolute bottom-3 left-3"><p className="font-serif text-sm text-pearl-300">{name}</p><p className="text-[8px] text-onyx-400 tracking-widest">master.club</p></div>
      </div>
    </div>
  )
}

function CardBack({ style }: { style: React.CSSProperties }) {
  return (
    <div style={style} className="rounded-lg overflow-hidden shadow-card-luxe border border-onyx-600/40">
      <div className="relative h-full w-full bg-onyx-950 plenefilm-noise flex flex-col items-center justify-center">
        <DiamondMark className="h-10 w-10 mb-3 opacity-60" />
        <p className="font-serif text-xs text-pearl-500 tracking-widest uppercase">master.club</p>
        <div className="mt-2 h-px w-24 bg-gradient-to-r from-transparent via-jade-500/30 to-transparent" />
        <p className="mt-3 font-serif italic text-[10px] text-pearl-500 text-center px-6">The global H2H ecosystem<br />for baristas &amp; tea masters</p>
        <div className="absolute top-3 left-3 text-[8px] text-onyx-400 tracking-widest font-mono">ID</div>
        <div className="absolute bottom-3 right-3 text-[8px] text-onyx-400 tracking-widest font-mono">v1.0</div>
      </div>
    </div>
  )
}

function StampPreview({ letter, shape, isTea }: { letter: string; shape: 'circle' | 'diamond' | 'hex'; isTea: boolean }) {
  const accent = isTea ? '#16a16b' : '#cf7a2e'
  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <defs><filter id="wg"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={letter.charCodeAt(0)} /><feColorMatrix values="0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0 0.1 0 0 0 0.15 0" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs>
      {shape === 'circle' && <><circle cx="100" cy="100" r="85" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" /><circle cx="100" cy="100" r="78" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.4" /></>}
      {shape === 'diamond' && <><path d="M100 15 L185 100 L100 185 L15 100 Z" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" /><path d="M100 25 L175 100 L100 175 L25 100 Z" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.4" /></>}
      {shape === 'hex' && <><path d="M100 20 L170 60 L170 140 L100 180 L30 140 L30 60 Z" fill="none" stroke={accent} strokeWidth="2" opacity="0.8" /><path d="M100 28 L162 64 L162 136 L100 172 L38 136 L38 64 Z" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.4" /></>}
      <circle cx="100" cy="100" r="55" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <text x="100" y="100" textAnchor="middle" dominantBaseline="central" fontFamily="Cormorant Garamond, serif" fontSize="72" fontWeight="500" fill={accent} opacity="0.9">{letter}</text>
      <path id="topArc" d="M 30 100 A 70 70 0 0 1 170 100" fill="none" />
      <path id="botArc" d="M 170 100 A 70 70 0 0 1 30 100" fill="none" />
      <text fontFamily="Inter, sans-serif" fontSize="8" letterSpacing="3" fill={accent} opacity="0.6"><textPath href="#topArc" startOffset="50%" textAnchor="middle">MASTER · CLUB</textPath></text>
      <text fontFamily="Inter, sans-serif" fontSize="6" letterSpacing="2" fill={accent} opacity="0.5"><textPath href="#botArc" startOffset="50%" textAnchor="middle">CRAFT · SINCE · DAY · ONE</textPath></text>
      <rect x="0" y="0" width="200" height="200" filter="url(#wg)" opacity="0.3" />
    </svg>
  )
}
