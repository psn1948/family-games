import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

  useEffect(() => {
    let cancelled = false

    async function loadAll() {
      const [membersRes, gamesRes, sessionsRes] = await Promise.all([
        supabase.from('members').select('*').order('name', { ascending: true }),
        supabase.from('games').select('*').order('name', { ascending: true }),
        supabase.from('sessions').select('*').order('started_at', { ascending: false }),
      ])

      if (cancelled) return

      if (membersRes.error) console.error('Failed loading members', membersRes.error)
      if (gamesRes.error) console.error('Failed loading games', gamesRes.error)
      if (sessionsRes.error) console.error('Failed loading sessions', sessionsRes.error)

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
    setMembers(prev => [...prev, member])
    const { error } = await supabase.from('members').insert(member)
    if (error) console.error('Failed adding member', error)
  }
  async function updateMember(id, updates) {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)))
    const { error } = await supabase.from('members').update(updates).eq('id', id)
    if (error) console.error('Failed updating member', error)
  }
  async function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id))
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (error) console.error('Failed deleting member', error)
  }

  // --- Games ---
  async function addGame(game) {
    setGames(prev => [...prev, game])
    const { error } = await supabase.from('games').insert(game)
    if (error) console.error('Failed adding game', error)
  }
  async function updateGame(id, updates) {
    setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))
    const { error } = await supabase.from('games').update(updates).eq('id', id)
    if (error) console.error('Failed updating game', error)
  }
  async function deleteGame(id) {
    setGames(prev => prev.filter(g => g.id !== id))
    const { error } = await supabase.from('games').delete().eq('id', id)
    if (error) console.error('Failed deleting game', error)
  }

  // --- Sessions ---
  async function addSession(session) {
    setSessions(prev => [...prev, session])
    const { error } = await supabase.from('sessions').insert(clientSessionToDb(session))
    if (error) console.error('Failed adding session', error)
  }
  async function updateSession(id, updates) {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
    const dbUpdates = {}
    if (updates.gameId !== undefined) dbUpdates.game_id = updates.gameId
    if (updates.participantIds !== undefined) dbUpdates.participant_ids = updates.participantIds
    if (updates.rounds !== undefined) dbUpdates.rounds = updates.rounds
    if (updates.startedAt !== undefined) dbUpdates.started_at = updates.startedAt
    if (updates.endedAt !== undefined) dbUpdates.ended_at = updates.endedAt
    if (updates.status !== undefined) dbUpdates.status = updates.status
    const { error } = await supabase.from('sessions').update(dbUpdates).eq('id', id)
    if (error) console.error('Failed updating session', error)
  }
  async function addRound(sessionId, round) {
    let nextRounds = []
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        nextRounds = [...s.rounds, round]
        return { ...s, rounds: nextRounds }
      }),
    )
    const { error } = await supabase.from('sessions').update({ rounds: nextRounds }).eq('id', sessionId)
    if (error) console.error('Failed adding round', error)
  }
  async function updateRound(sessionId, roundId, scores) {
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
    if (error) console.error('Failed updating round', error)
  }
  async function deleteRound(sessionId, roundId) {
    let nextRounds = []
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        nextRounds = s.rounds.filter(r => r.id !== roundId)
        return { ...s, rounds: nextRounds }
      }),
    )
    const { error } = await supabase.from('sessions').update({ rounds: nextRounds }).eq('id', sessionId)
    if (error) console.error('Failed deleting round', error)
  }
  async function finishSession(id) {
    const endedAt = new Date().toISOString()
    setSessions(prev =>
      prev.map(s =>
        s.id === id ? { ...s, status: 'completed', endedAt } : s,
      ),
    )
    const { error } = await supabase.from('sessions').update({ status: 'completed', ended_at: endedAt }).eq('id', id)
    if (error) console.error('Failed finishing session', error)
  }
  async function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id))
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) console.error('Failed deleting session', error)
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
