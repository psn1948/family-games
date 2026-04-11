import { useState } from 'react'

export default function GameForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Spilnavn er påkrævet.')
      return
    }
    onSave({ name: trimmed, description: description.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="game-name">Spilnavn</label>
        <input
          id="game-name"
          className="input"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="f.eks. Uno"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <div>
        <label className="label" htmlFor="game-desc">Beskrivelse <span className="text-gray-400 font-normal">(valgfri)</span></label>
        <textarea
          id="game-desc"
          className="input resize-none"
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Kort beskrivelse eller regelnote…"
        />
      </div>
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
            Annuller
          </button>
        )}
        <button type="submit" className="btn-primary btn-sm">
          {initial ? 'Gem ændringer' : 'Tilføj spil'}
        </button>
      </div>
    </form>
  )
}
