import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { newId } from '../utils/id'
import GameForm from '../components/GameForm'

export default function GamesPage() {
  const { games, addGame, updateGame, deleteGame } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)

  function handleAdd(data) {
    addGame({ id: newId(), ...data })
    setShowAdd(false)
  }

  function handleUpdate(id, data) {
    updateGame(id, data)
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Games</h1>
        {!showAdd && (
          <button className="btn-primary btn-sm" onClick={() => setShowAdd(true)}>
            + Add Game
          </button>
        )}
      </div>

      {showAdd && (
        <div className="card p-5">
          <h2 className="section-title mb-4">New Game</h2>
          <GameForm
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      )}

      {games.length === 0 && !showAdd ? (
        <div className="card p-8 text-center text-gray-400">
          <p className="text-lg mb-2">No games yet.</p>
          <p className="text-sm">Add your first game to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {games.map(game => (
            <div key={game.id} className="card p-4">
              {editingId === game.id ? (
                <GameForm
                  initial={game}
                  onSave={data => handleUpdate(game.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{game.name}</h3>
                      {game.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{game.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setEditingId(game.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => {
                          if (confirm(`Remove "${game.name}"?`)) deleteGame(game.id)
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
