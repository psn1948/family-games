import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login, authError } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password) {
      setError('Udfyld både brugernavn og adgangskode.')
      return
    }
    setLoading(true)
    const err = await login(username.trim(), password)
    setLoading(false)
    if (err) {
      setError('Forkert brugernavn eller adgangskode.')
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🎲</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Familie Spil</h1>
          <p className="text-sm text-gray-500 mt-1">Log ind for at fortsætte</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="username">Brugernavn</label>
              <input
                id="username"
                className="input"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="f.eks. Per"
                autoFocus
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Adgangskode</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {(error || authError) && (
              <p className="text-red-600 text-sm">{error || authError}</p>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Logger ind…' : 'Log ind'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
