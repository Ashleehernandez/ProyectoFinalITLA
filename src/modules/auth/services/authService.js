// Servicio de autenticación
// Aquí irán todas las llamadas al API relacionadas con autenticación

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Inicia sesión con email y contraseña
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Respuesta del servidor
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al iniciar sesión')
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

/**
 * Registra un nuevo usuario
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} Respuesta del servidor
 */
export const register = async (name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al registrar')
    }

    const data = await response.json()
    return data
  } catch (error) {
    throw error
  }
}

/**
 * Cierra sesión del usuario
 */
export const logout = () => {
  // Limpiar token del localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Guarda el token de autenticación
 * @param {string} token 
 */
export const saveToken = (token) => {
  localStorage.setItem('token', token)
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getToken()
}

