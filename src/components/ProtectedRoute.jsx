import { Navigate, Outlet } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute() {
  const { user, authLoading } = useApp()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Tjekker login…
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
