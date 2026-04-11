import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const navLinks = [
  { to: '/', label: 'Oversigt', end: true },
  { to: '/members', label: 'Spillere' },
  { to: '/games', label: 'Spil' },
  { to: '/history', label: 'Historik' },
]

export default function Layout() {
  const { activeSession, isLoading } = useApp()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">🎲 Familie Spil</span>
          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-indigo-700'
                      : 'text-indigo-100 hover:bg-indigo-600'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {activeSession && (
          <div
            className="bg-indigo-900 text-indigo-100 text-xs text-center py-1 cursor-pointer hover:bg-indigo-800 transition-colors"
            onClick={() => navigate(`/sessions/${activeSession.id}`)}
          >
            ▶ Spil i gang — tryk for at fortsætte
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        {isLoading ? (
          <div className="card p-8 text-center text-gray-500">Indlaeser data...</div>
        ) : (
          <Outlet />
        )}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        Familie Spil — data gemt i database
      </footer>
    </div>
  )
}
