import { useState } from 'react'

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export default function MemberForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? COLORS[0])
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Navn er påkrævet.')
      return
    }
    onSave({ name: trimmed, color })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="member-name">Navn</label>
        <input
          id="member-name"
          className="input"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="f.eks. Alice"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <div>
        <label className="label">Farve</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#1e1b4b' : 'transparent',
                transform: color === c ? 'scale(1.2)' : undefined,
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        {onCancel && (
          <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
            Annuller
          </button>
        )}
        <button type="submit" className="btn-primary btn-sm">
          {initial ? 'Gem ændringer' : 'Tilføj spiller'}
        </button>
      </div>
    </form>
  )
}
