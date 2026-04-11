import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { newId } from '../utils/id'

export function ScoreTable({ session, members, readonly = false, onAddRound, onDeleteRound }) {
  const participants = members.filter(m => session.participantIds.includes(m.id))

  const totals = participants.map(p => ({
    memberId: p.id,
    total: session.rounds.reduce((sum, round) => {
      const score = round.scores.find(s => s.memberId === p.id)
      return sum + (score ? Number(score.score) : 0)
    }, 0),
  }))

  if (session.rounds.length === 0 && readonly) {
    return <p className="text-gray-400 text-sm">Ingen runder registreret.</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600 w-12 sm:w-16">Runde</th>
            {participants.map(p => (
              <th key={p.id} className="px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-700">
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <span
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-xs truncate max-w-[60px] sm:max-w-full">{p.name}</span>
                </div>
              </th>
            ))}
            {!readonly && <th className="px-3 py-3 w-10" />}
          </tr>
        </thead>
        <tbody>
          {session.rounds.map((round, idx) => (
            <tr key={round.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-2 sm:px-4 py-2 sm:py-2.5 font-medium text-gray-500 text-xs sm:text-sm">{idx + 1}</td>
              {participants.map(p => {
                const score = round.scores.find(s => s.memberId === p.id)
                return (
                  <td key={p.id} className="px-2 sm:px-4 py-2 sm:py-2.5 text-center font-mono text-xs sm:text-sm">
                    {score?.score ?? '—'}
                  </td>
                )
              })}
              {!readonly && (
                <td className="px-3 py-2.5 text-center">
                  <button
                    className="text-red-400 hover:text-red-600 text-xs"
                    title="Slet runde"
                    onClick={() => onDeleteRound(round.id)}
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-indigo-50 border-t-2 border-indigo-200">
            <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold text-indigo-700 text-xs sm:text-sm">Total</td>
            {totals.map(t => (
              <td key={t.memberId} className="px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-indigo-700 font-mono text-xs sm:text-sm">
                {t.total}
              </td>
            ))}
            {!readonly && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export function AddRoundForm({ participants, onSave, onCancel }) {
  const [scores, setScores] = useState(
    Object.fromEntries(participants.map(p => [p.id, '']))
  )

  function handleSubmit(e) {
    e.preventDefault()
    const roundScores = participants.map(p => ({
      memberId: p.id,
      score: scores[p.id] === '' ? 0 : Number(scores[p.id]),
    }))
    onSave({ id: newId(), scores: roundScores })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="section-title">Tilføj runde</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {participants.map(p => (
          <div key={p.id} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex-shrink-0 shadow-sm"
              style={{ backgroundColor: p.color }}
            />
            <label className="font-medium text-sm text-gray-700 w-24 truncate" htmlFor={`score-${p.id}`}>
              {p.name}
            </label>
            <input
              id={`score-${p.id}`}
              type="number"
              className="input w-24 font-mono"
              value={scores[p.id]}
              onChange={e => setScores(prev => ({ ...prev, [p.id]: e.target.value }))}
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>Annuller</button>
        <button type="submit" className="btn-primary btn-sm">Gem runde</button>
      </div>
    </form>
  )
}
