import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../../styles/auth.css'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '' // Admin, Cliente, Recepcionista
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validación básica
    if (!formData.email || !formData.password || !formData.role) {
      setError('Por favor completa todos los campos')
      return
    }

    // Hardcodeado mientras no se integre el backend
    try {
      // Simular login exitoso
      localStorage.setItem('userRole', formData.role)
      localStorage.setItem('userEmail', formData.email)
      
      // Redirigir según el rol
      switch (formData.role) {
        case 'Admin':
          navigate('/admin')
          break
        case 'Cliente':
          navigate('/cliente')
          break
        case 'Recepcionista':
          navigate('/recepcionista')
          break
        default:
          setError('Rol no válido')
      }
      
      // TODO: Conectar con el servicio de autenticación real
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // })
      
      // if (response.ok) {
      //   const data = await response.json()
      //   localStorage.setItem('token', data.token)
      //   localStorage.setItem('userRole', data.role)
      //   navigate(`/${data.role.toLowerCase()}`)
      // } else {
      //   setError('Credenciales incorrectas')
      // }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Bienvenido de nuevo</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Selecciona un rol</option>
              <option value="Admin">Administrador</option>
              <option value="Cliente">Cliente</option>
              <option value="Recepcionista">Recepcionista</option>
            </select>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="auth-button">
            Iniciar sesión
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

