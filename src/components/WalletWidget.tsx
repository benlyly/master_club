import { useState } from 'react'
import type { MasterCafe } from '../lib/types'
import { cn } from '../lib/utils'
import { ChevronDown, MapPin, Calendar, Clock } from 'lucide-react'

const DAYS = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'] as const

export function WalletWidget({ masterName, cafes }: { masterId: string; masterName: string; cafes: MasterCafe[] }) {
  const [expanded, setExpanded] = useState(false)
  const [activeDay, setActiveDay] = useState(0)

  const schedule = DAYS.map((day, i) => {
    if (cafes.length === 0) return { day, cafe: null }
    const cafe = cafes[i % cafes.length]
    return { day, cafe }
  })

  return (
    <div className="glass rounded-2xl border border-onyx-700/60 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-jade-900/40 text-jade-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-pearl-100">Where I am today</h3>
            <p className="text-xs text-pearl-500">7-day schedule — {masterName}</p>
          </div>
        </div>
        <ChevronDown className={cn('h-5 w-5 text-pearl-500 transition-transform', expanded && 'rotate-180')} />
      </button>

      <div className={cn(
        'transition-all duration-500 overflow-hidden',
        expanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
      )}>
        <div className="px-6 pb-6">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {schedule.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={cn(
                  'shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-all',
                  activeDay === i
                    ? 'bg-onyx-700 text-pearl-100'
                    : 'bg-onyx-900 text-pearl-500 hover:text-pearl-300',
                )}
              >
                {s.day}
              </button>
            ))}
          </div>

          {schedule[activeDay]?.cafe ? (
            <div className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jade-900/40 text-jade-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-lg text-pearl-100">{schedule[activeDay].cafe!.name}</h4>
                  {schedule[activeDay].cafe!.location && (
                    <p className="text-sm text-pearl-400 mt-0.5">{schedule[activeDay].cafe!.location}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-pearl-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Typical hours: 07:00 — 19:00</span>
                  </div>
                </div>
              </div>

              {schedule[activeDay].cafe!.coordinates && (
                <div className="mt-4 h-32 rounded-lg bg-onyx-800 border border-onyx-700 flex items-center justify-center">
                  <p className="text-xs text-onyx-400 font-mono">
                    {schedule[activeDay].cafe!.coordinates.lat.toFixed(4)}, {schedule[activeDay].cafe!.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-onyx-700/60 bg-onyx-900/50 p-8 text-center">
              <p className="text-pearl-500">No café scheduled for this day.</p>
              <p className="text-xs text-onyx-400 mt-1">Check back soon for updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
