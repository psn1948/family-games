import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function DashboardPage() {
  const { sessions, games, members, activeSession } = useApp()
  const navigate = useNavigate()

  const recentCompleted = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt))
    .slice(0, 5)

  const activeGame = activeSession ? games.find(g => g.id === activeSession.gameId) : null
  const activePlayers = activeSession
    ? members.filter(m => activeSession.participantIds.includes(m.id))
    : []

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-2 sm:py-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">🎲 Familie Spil</h1>
        <p className="text-sm sm:text-base text-gray-500">Hold styr på point til familiens spilleaftener</p>
      </div>

      {/* Active session banner */}
      {activeSession ? (
        <div
          className="card p-4 sm:p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => navigate(`/sessions/${activeSession.id}`)}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Aktivt spil</p>
              <h2 className="text-xl font-bold mt-0.5">{activeGame?.name ?? 'Ukendt'}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activePlayers.map(p => (
                  <span
                    key={p.id}
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${p.color}cc`, color: '#fff' }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
              <p className="text-indigo-200 text-xs mt-2">
                {activeSession.rounds.length} runde{activeSession.rounds.length !== 1 ? 'r' : ''} spillet
              </p>
            </div>
            <span className="text-4xl">▶</span>
          </div>
        </div>
      ) : (
        <div className="card p-5 text-center space-y-3">
          <p className="text-gray-500">Ingen aktive spil lige nu.</p>
          <Link to="/sessions/new" className="btn-primary inline-block">
            Start nyt spil 🎲
          </Link>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="card p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">{members.length}</p>
          <p className="text-xs text-gray-500 mt-1">Familiemedlemmer</p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">{games.length}</p>
          <p className="text-xs text-gray-500 mt-1">Spil</p>
        </div>
        <div className="card p-3 sm:p-4 col-span-2 sm:col-span-1">
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">
            {sessions.filter(s => s.status === 'completed').length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Spillede sessioner</p>
        </div>
      </div>

      {/* Recent sessions */}
      {recentCompleted.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Seneste spil</h2>
            <Link to="/history" className="text-sm text-indigo-600 hover:underline">
              Se alle →
            </Link>
          </div>
          <div className="space-y-2">
            {recentCompleted.map(session => {
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
                  className="card p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors group block"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800 group-hover:text-indigo-700 transition-colors">
                      {game?.name ?? 'Ukendt'}
                    </span>
                    <p className="text-xs text-gray-400">{new Date(session.endedAt).toLocaleDateString()}</p>
                  </div>
                  {winner && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <span
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: winner.member.color }}
                      />
                      <span className="text-gray-600">{winner.member.name}</span>
                      <span className="font-mono font-bold text-indigo-600">{winner.total}</span>
                    </div>
                  )}
                  <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">→</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/members" className="card p-3 sm:p-4 hover:bg-indigo-50 transition-colors group text-center">
          <p className="text-2xl mb-1">👨‍👩‍👧‍👦</p>
          <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-indigo-700">Administrer spillere</p>
        </Link>
        <Link to="/games" className="card p-3 sm:p-4 hover:bg-indigo-50 transition-colors group text-center">
          <p className="text-2xl mb-1">🃏</p>
          <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-indigo-700">Administrer spil</p>
        </Link>
      </div>
    </div>
  )
}
