import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem('userRole')

  if (!userRole) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirigir al dashboard correspondiente al rol del usuario
    const rolePath = userRole.toLowerCase()
    return <Navigate to={`/${rolePath}`} replace />
  }

  return children
}

export default ProtectedRoute

