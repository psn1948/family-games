import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function HistoryPage() {
  const { sessions, games, members } = useApp()

  const completed = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))

  if (completed.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="page-title">History</h1>
        <div className="card p-8 text-center text-gray-400 space-y-2">
          <p className="text-lg">No finished games yet.</p>
          <p className="text-sm">Complete a game session to see it here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">History</h1>
      <div className="space-y-3">
        {completed.map(session => {
          const game = games.find(g => g.id === session.gameId)
          const participants = members.filter(m => session.participantIds.includes(m.id))

          const totals = participants.map(p => ({
            member: p,
            total: session.rounds.reduce((sum, round) => {
              const score = round.scores.find(s => s.memberId === p.id)
              return sum + (score ? Number(score.score) : 0)
            }, 0),
          })).sort((a, b) => b.total - a.total)

          const winner = totals[0]

          return (
            <Link
              key={session.id}
              to={`/sessions/${session.id}`}
              className="card p-4 flex flex-wrap items-center gap-4 hover:bg-gray-50 transition-colors group block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                    {game?.name ?? 'Unknown Game'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session.rounds.length} round{session.rounds.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(session.endedAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {participants.map(p => (
                    <span
                      key={p.id}
                      className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
              {winner && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Top score</p>
                  <div className="flex items-center gap-2 justify-end mt-0.5">
                    <span
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: winner.member.color }}
                    />
                    <span className="font-bold text-gray-700">{winner.member.name}</span>
                    <span className="font-mono font-bold text-indigo-600">{winner.total}</span>
                  </div>
                </div>
              )}
              <span className="text-gray-400 group-hover:text-indigo-500 transition-colors text-lg">→</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
