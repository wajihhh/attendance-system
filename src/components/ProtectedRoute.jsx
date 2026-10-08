import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const currentUser = useSelector((state) => state.auth.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.isAdmin) return <Navigate to="/admin/dashboard" replace />
  return children
}

export function PublicOnly({ children }) {
  const currentUser = useSelector((state) => state.auth.currentUser)
  if (currentUser?.isAdmin) return <Navigate to="/admin/dashboard" replace />
  if (currentUser) return <Navigate to="/dashboard" replace />
  return children
}

export function AdminRoute({ children }) {
  const currentUser = useSelector((state) => state.auth.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
