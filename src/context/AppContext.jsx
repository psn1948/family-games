import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [members, setMembers] = useLocalStorage('fg_members', [])
  const [games, setGames] = useLocalStorage('fg_games', [])
  const [sessions, setSessions] = useLocalStorage('fg_sessions', [])

  // --- Members ---
  function addMember(member) {
    setMembers(prev => [...prev, member])
  }
  function updateMember(id, updates) {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)))
  }
  function deleteMember(id) {
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  // --- Games ---
  function addGame(game) {
    setGames(prev => [...prev, game])
  }
  function updateGame(id, updates) {
    setGames(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)))
  }
  function deleteGame(id) {
    setGames(prev => prev.filter(g => g.id !== id))
  }

  // --- Sessions ---
  function addSession(session) {
    setSessions(prev => [...prev, session])
  }
  function updateSession(id, updates) {
    setSessions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }
  function addRound(sessionId, round) {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId ? { ...s, rounds: [...s.rounds, round] } : s,
      ),
    )
  }
  function updateRound(sessionId, roundId, scores) {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        return {
          ...s,
          rounds: s.rounds.map(r =>
            r.id === roundId ? { ...r, scores } : r,
          ),
        }
      }),
    )
  }
  function deleteRound(sessionId, roundId) {
    setSessions(prev =>
      prev.map(s => {
        if (s.id !== sessionId) return s
        return { ...s, rounds: s.rounds.filter(r => r.id !== roundId) }
      }),
    )
  }
  function finishSession(id) {
    setSessions(prev =>
      prev.map(s =>
        s.id === id ? { ...s, status: 'completed', endedAt: new Date().toISOString() } : s,
      ),
    )
  }
  function deleteSession(id) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  const activeSession = sessions.find(s => s.status === 'active') ?? null

  return (
    <AppContext.Provider
      value={{
        members, addMember, updateMember, deleteMember,
        games, addGame, updateGame, deleteGame,
        sessions, addSession, updateSession, addRound, updateRound, deleteRound, finishSession, deleteSession,
        activeSession,
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
