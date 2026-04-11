import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AppContext = createContext(null)

function dbSessionToClient(session) {
  return {
    id: session.id,
    gameId: session.game_id,
    participantIds: session.participant_ids ?? [],
    rounds: session.rounds ?? [],
    startedAt: session.started_at,
    endedAt: session.ended_at,
    status: session.status,
  }
}

function clientSessionToDb(session) {
  return {
    id: session.id,
    game_id: session.gameId,
    participant_ids: session.participantIds ?? [],
    rounds: session.rounds ?? [],
    started_at: session.startedAt,
    ended_at: session.endedAt,
    status: session.status,
  }
}

export function AppProvider({ children }) {
  const [members, setMembers] = useState([])
  const [games, setGames] = useState([])
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncError, setSyncError] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  // --- Auth ---
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Map username → email (e.g. "Per" → "per@familygames.local")
  async function login(username, password) {
    if (!isSupabaseConfigured || !supabase) return 'Database ikke konfigureret.'
    const email = `${username.toLowerCase()}@familygames.local`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? error.message : null
  }

  async function logout() {
    if (!isSupabaseConfigured || !supabase) return
    await supabase.auth.signOut()
  }

  function ensureDbConfigured() {
    if (!isSupabaseConfigured || !supabase) {
      setSyncError('Database ikke konfigureret. Udfyld VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY i .env.local.')
      return false
    }
    return true
  }

  function setDbError(prefix, error) {
    const message = error?.message ? `${prefix}: ${error.message}` : prefix
    setSyncError(message)
    console.error(prefix, error)
  }

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      if (!ensureDbConfigured()) {
        setIsLoading(false)
        return
      }

      const [membersRes, gamesRes, sessionsRes] = await Promise.all([
        supabase.from('members').select('*').order('name', { ascending: true }),
        supabase.from('games').select('*').order('name', { ascending: true }),
        supabase.from('sessions').select('*').order('started_at', { ascending: false }),
      ])

      if (cancelled) return

      if (membersRes.error) setDbError('Kunne ikke hente spillere', membersRes.error)
      if (gamesRes.error) setDbError('Kunne ikke hente spil', gamesRes.error)
      if (sessionsRes.error) setDbError('Kunne ikke hente sessioner', sessionsRes.error)

      setMembers(membersRes.data ?? [])
      setGames(gamesRes.data ?? [])
      setSessions((sessionsRes.data ?? []).map(dbSessionToClient))
      setIsLoading(false)
    }

    loadAll()

    return () => {
      cancelled = true
    }
  }, [])

  // --- Members ---
  async function addMember(member) {
    if (!ensureDbConfigured()) return
    setMembers(prev => [...prev, member])
    const { error } = await supabase.from('members').insert(member)
    if (error) setDbError('Kunne ikke oprette spiller', error)
  }
  async function updateMember(id, updates) {
    if (!ensureDbConfigured()) return
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)))
    const { error } = await supabase.from('members').update(updates).eq('id', id)
    if (error) setDbError('Kunne ikke opdatere spiller', error)
  }
  async function deleteMember(id) {
    if (!ensureDbConfigured()) return
    setMembers(prev => prev.filter(m => m.id !== id))
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) setDbError('Kunne ikke slette spiller', error)
  }

  // --- Games ---
  async function addGame(game) {
    if (!ensureDbConfigured()) return
    setGames(prev => [...prev, game])
    const { error } = await supabase.from('games').insert(game)
    if (error) setDbError('Kunne ikke oprette spil', error)
  }
  async function updateGame(id, updates) {
    if (!ensureDbConfigured()) return
    setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))
    const { error } = await supabase.from('games').update(updates).eq('id', id)
    if (error) setDbError('Kunne ikke opdatere spil', error)
  }
  async function deleteGame(id) {
    if (!ensureDbConfigured()) return
    setGames(prev => prev.filter(g => g.id !== id))
    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) setDbError('Kunne ikke slette spil', error)
  }

  // --- Sessions ---
  async function addSession(session) {
    if (!ensureDbConfigured()) return
    setSessions(prev => [...prev, session])
    const { error } = await supabase.from('sessions').insert(clientSessionToDb(session))
    if (error) setDbError('Kunne ikke oprette session', error)
  }
  async function updateSession(id, updates) {
    if (!ensureDbConfigured()) return
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
    const dbUpdates = {}
    if (updates.gameId !== undefined) dbUpdates.game_id = updates.gameId
    if (updates.participantIds !== undefined) dbUpdates.participant_ids = updates.participantIds
    if (updates.rounds !== undefined) dbUpdates.rounds = updates.rounds
    if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt
    if (updates.endedAt !== undefined) dbUpdates.ended_at = updates.endedAt
    if (updates.status !== undefined) dbUpdates.status = updates.status
    const { error } = await supabase.from('sessions').update(dbUpdates).eq('id', id)
    if (error) setDbError('Kunne ikke opdatere session', error)
  }
  async function addRound(sessionId, round) {
    if (!ensureDbConfigured()) return
    let nextRounds = []
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        nextRounds = [...s.rounds, round]
        return { ...s, rounds: nextRounds }
      }),
    )
    const { error } = await supabase.from('sessions').update({ rounds: nextRounds }).eq('id', sessionId)
    if (error) setDbError('Kunne ikke tilfoeje runde', error)
  }
  async function updateRound(sessionId, roundId, scores) {
    if (!ensureDbConfigured()) return
    let nextRounds = []
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        nextRounds = s.rounds.map(r =>
          r.id === roundId ? { ...r, scores } : r,
        )
        return {
          ...s,
          rounds: nextRounds,
        }
      }),
    )
    const { error } = await supabase.from('sessions').update({ rounds: nextRounds }).eq('id', sessionId)
    if (error) setDbError('Kunne ikke opdatere runde', error)
  }
  async function deleteRound(sessionId, roundId) {
    if (!ensureDbConfigured()) return
    let nextRounds = []
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        nextRounds = s.rounds.filter(r => r.id !== roundId)
        return { ...s, rounds: nextRounds }
      }),
    )
    const { error } = await supabase.from('sessions').update({ rounds: nextRounds }).eq('id', sessionId)
    if (error) setDbError('Kunne ikke slette runde', error)
  }
  async function finishSession(id) {
    if (!ensureDbConfigured()) return
    const endedAt = new Date().toISOString()
    setSessions(prev =>
      prev.map(s =>
        s.id === id ? { ...s, status: 'completed', endedAt } : s,
      ),
    )
    const { error } = await supabase.from('sessions').update({ status: 'completed', ended_at: endedAt }).eq('id', id)
    if (error) setDbError('Kunne ikke afslutte session', error)
  }
  async function deleteSession(id) {
    if (!ensureDbConfigured()) return
    setSessions(prev => prev.filter(s => s.id !== id))
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) setDbError('Kunne ikke slette session', error)
  }

  const activeSession = sessions.find(s => s.status === 'active') ?? null

  return (
    <AppContext.Provider
      value={{
        members, addMember, updateMember, deleteMember,
        games, addGame, updateGame, deleteGame,
        sessions, addSession, updateSession, addRound, updateRound, deleteRound, finishSession, deleteSession,
        activeSession,
        isLoading,
        syncError,
        user, authLoading, authError, login, logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
