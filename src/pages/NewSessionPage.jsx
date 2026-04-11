import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { newId } from '../utils/id'

export default function NewSessionPage() {
  const { games, members, addSession, activeSession } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [selectedGameId, setSelectedGameId] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState([])

  const selectedGame = games.find(g => g.id === selectedGameId)

  function toggleMember(id) {
    setSelectedMemberIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  function handleStart() {
    const session = {
      id: newId(),
      gameId: selectedGameId,
      participantIds: selectedMemberIds,
      rounds: [],
      startedAt: new Date().toISOString(),
      endedAt: null,
      status: 'active',
    }
    addSession(session)
    navigate(`/sessions/${session.id}`)
  }

  if (activeSession) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Start New Game</h1>
        <div className="card p-6 text-center space-y-4">
          <p className="text-gray-600">
            There is already an active game in progress. Finish it before starting a new one.
          </p>
          <Link to={`/sessions/${activeSession.id}`} className="btn-primary inline-block">
            Continue Active Game
          </Link>
        </div>
      </div>
    )
  }

  if (games.length === 0 || members.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="page-title">Start New Game</h1>
        <div className="card p-6 text-center space-y-3 text-gray-500">
          {games.length === 0 && <p>You need at least one <Link to="/games" className="text-indigo-600 underline">game</Link> to get started.</p>}
          {members.length === 0 && <p>You need at least one <Link to="/members" className="text-indigo-600 underline">family member</Link> to get started.</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="page-title">Start New Game</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map(n => (
          <div key={n} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step >= n
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {n}
            </div>
            <span className={`text-sm font-medium ${step >= n ? 'text-indigo-700' : 'text-gray-400'}`}>
              {n === 1 ? 'Pick a game' : 'Select players'}
            </span>
            {n < 2 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Pick game */}
      {step === 1 && (
        <div className="card p-5 space-y-4">
          <h2 className="section-title">Which game are you playing?</h2>
          <div className="grid gap-2">
            {games.map(game => (
              <button
                key={game.id}
                type="button"
                onClick={() => setSelectedGameId(game.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedGameId === game.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-800">{game.name}</span>
                {game.description && (
                  <span className="block text-sm text-gray-500 mt-0.5">{game.description}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary"
              disabled={!selectedGameId}
              onClick={() => setStep(2)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select members */}
      {step === 2 && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-indigo-600 text-sm hover:underline"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <h2 className="section-title">Who's playing {selectedGame?.name}?</h2>
          </div>
          <div className="grid gap-2">
            {members.map(member => {
              const selected = selectedMemberIds.includes(member.id)
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="font-medium text-gray-800">{member.name}</span>
                  <span className="ml-auto text-indigo-500 text-lg">{selected ? '✓' : ''}</span>
                </button>
              )
            })}
          </div>
          {selectedMemberIds.length > 0 && (
            <p className="text-sm text-gray-500">{selectedMemberIds.length} player{selectedMemberIds.length > 1 ? 's' : ''} selected</p>
          )}
          <div className="flex justify-end">
            <button
              className="btn-success"
              disabled={selectedMemberIds.length < 1}
              onClick={handleStart}
            >
              Start Game 🎲
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
