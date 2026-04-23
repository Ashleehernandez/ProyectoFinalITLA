import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, requiredRole }) {
  const userRole = localStorage.getItem('userRole')

  if (!userRole) {
    return <Navigate to="/login" replace />
  }

  // Temporal: sin restricción de rol mientras se implementan los módulos
  // if (requiredRole && userRole !== requiredRole) {
  //   const rolePath = userRole.toLowerCase()
  //   return <Navigate to={`/${rolePath}`} replace />
  // }

  return children
}

export default ProtectedRoute

