import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ScoreTable, AddRoundForm } from '../components/ScoreTable'

export default function SessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sessions, games, members, addRound, deleteRound, finishSession, deleteSession } = useApp()

  const session = sessions.find(s => s.id === id)
  const [showAddRound, setShowAddRound] = useState(false)

  if (!session) {
    return (
      <div className="card p-8 text-center text-gray-400 space-y-2">
        <p className="text-lg">Session not found.</p>
        <Link to="/" className="text-indigo-600 underline text-sm">Go home</Link>
      </div>
    )
  }

  const game = games.find(g => g.id === session.gameId)
  const participants = members.filter(m => session.participantIds.includes(m.id))
  const isActive = session.status === 'active'

  function handleSaveRound(round) {
    addRound(session.id, round)
    setShowAddRound(false)
  }

  function handleFinish() {
    if (confirm('Mark this game as finished?')) {
      finishSession(session.id)
    }
  }

  function handleDelete() {
    if (confirm('Delete this session permanently?')) {
      deleteSession(session.id)
      navigate('/history')
    }
  }

  const startDate = new Date(session.startedAt).toLocaleString()
  const endDate = session.endedAt ? new Date(session.endedAt).toLocaleString() : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="page-title">{game?.name ?? 'Unknown Game'}</h1>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {isActive ? 'Active' : 'Completed'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Started {startDate}
            {endDate && ` · Finished ${endDate}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isActive && (
            <>
              <button
                className="btn-primary btn-sm"
                onClick={() => setShowAddRound(true)}
                disabled={showAddRound}
              >
                + Add Round
              </button>
              <button className="btn-success btn-sm" onClick={handleFinish}>
                Finish Game ✓
              </button>
            </>
          )}
          <button className="btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="flex flex-wrap gap-2">
        {participants.map(p => (
          <span
            key={p.id}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: p.color }}
          >
            {p.name}
          </span>
        ))}
      </div>

      {/* Add round form */}
      {showAddRound && (
        <div className="card p-5">
          <AddRoundForm
            participants={participants}
            onSave={handleSaveRound}
            onCancel={() => setShowAddRound(false)}
          />
        </div>
      )}

      {/* Score table */}
      {session.rounds.length === 0 && !showAddRound ? (
        <div className="card p-8 text-center text-gray-400 space-y-2">
          <p>No rounds yet.</p>
          {isActive && (
            <button className="btn-primary btn-sm mx-auto" onClick={() => setShowAddRound(true)}>
              + Add First Round
            </button>
          )}
        </div>
      ) : (
        <ScoreTable
          session={session}
          members={members}
          readonly={!isActive}
          onDeleteRound={roundId => deleteRound(session.id, roundId)}
        />
      )}

      {!isActive && (
        <div className="text-center">
          <Link to="/history" className="text-indigo-600 underline text-sm">
            ← Back to history
          </Link>
        </div>
      )}
    </div>
  )
}
