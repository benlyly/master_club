import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Master } from './types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  master: Master | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, specialization: 'tea' | 'coffee') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshMaster: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [master, setMaster] = useState<Master | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadMaster(uid: string) {
    const { data } = await supabase.from('masters').select('*').eq('id', uid).maybeSingle()
    setMaster(data as Master | null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        loadMaster(data.session.user.id).finally(() => setLoading(false))
      } else { setLoading(false) }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        loadMaster(newSession.user.id).finally(() => setLoading(false))
      } else { setMaster(null); setLoading(false) }
    })
    return () => { listener.subscription.unsubscribe() }
  }, [])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, name, specialization) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      const { error: insertError } = await supabase.from('masters').insert({ id: data.user.id, name, specialization })
      if (insertError) return { error: insertError.message }
    }
    return { error: null }
  }

  const signOut = async () => { await supabase.auth.signOut(); setMaster(null) }
  const refreshMaster = async () => { if (user) await loadMaster(user.id) }

  return (
    <AuthContext.Provider value={{ session, user, master, loading, signIn, signUp, signOut, refreshMaster }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
