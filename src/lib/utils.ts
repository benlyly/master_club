import clsx, { type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export function specializationLabel(s: 'tea' | 'coffee'): string {
  return s === 'tea' ? 'Tea Master' : 'Barista'
}

export function cardStyleGradient(style: 'classic' | 'gold' | 'noir' | 'pearl'): string {
  switch (style) {
    case 'gold': return 'from-[#1a1612] via-[#2a2218] to-[#1a1612]'
    case 'noir': return 'from-[#0a0a0b] via-[#16161a] to-[#0a0a0b]'
    case 'pearl': return 'from-[#1c1c1f] via-[#26262c] to-[#1c1c1f]'
    default: return 'from-[#0e0f11] via-[#181a1e] to-[#0e0f11]'
  }
}
