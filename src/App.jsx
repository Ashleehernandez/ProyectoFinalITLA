import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './modules/auth/components/Login'
import Register from './modules/auth/components/Register'
import { AdminDashboard } from './modules/admin'
import { ClienteDashboard } from './modules/cliente'
import { RecepcionistaDashboard } from './modules/recepcionista'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/cliente" 
          element={
            <ProtectedRoute requiredRole="Cliente">
              <ClienteDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recepcionista" 
          element={
            <ProtectedRoute requiredRole="Recepcionista">
              <RecepcionistaDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

