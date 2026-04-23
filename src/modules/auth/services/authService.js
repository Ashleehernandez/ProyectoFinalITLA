// Servicio de autenticación
// Aquí irán todas las llamadas al API relacionadas con autenticación

import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://proyectofinalitlabackend-production.up.railway.app/api'

/**
 * Inicia sesión con email/usuario y contraseña
 * @param {Object} credentials Datos de inicio de sesión { userNameOrEmail, password }
 * @returns {Promise} Respuesta del servidor incluyendo el rol
 */
export const login = async (credentials) => {
  try {
    const { userNameOrEmail, password } = credentials

    // Detectar si es email o userName para mandar el campo correcto al backend
    const isEmail = userNameOrEmail.includes('@')
    const body = isEmail
      ? { email: userNameOrEmail, password }
      : { userName: userNameOrEmail, password }

    console.log('Enviando al API:', body) // debug temporal

    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const originalMessage = errorData.message || 'Error al iniciar sesión'
      const translatedMessage = translateError(originalMessage)
      throw new Error(translatedMessage)
    }

    const data = await response.json()
    
    if (data.isSuccess && data.token) {
      saveToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      // Decodificar el JWT para buscar el rol
      try {
        const decodedToken = jwtDecode(data.token)
        // El rol puede venir en varias claims según la config del backend
        const role = decodedToken['role'] || 
                     decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                     decodedToken['roles'] ||
                     null
        
        // Si no hay rol en el token, usar 'Cliente' por defecto
        // En el futuro el backend debería incluir el rol en el JWT
        data.role = role || 'Cliente'
        localStorage.setItem('userRole', data.role)
        console.log('Token decodificado:', decodedToken)
        console.log('Rol detectado:', data.role)
      } catch (e) {
        console.error('Error al decodificar el token:', e)
        data.role = 'Cliente'
      }
    }

    return data
  } catch (error) {
    throw error
  }
}

// Mapeo de errores comunes del backend (Identity) a español
const errorTranslations = {
  "Passwords must have at least one lowercase ('a'-'z').": "La contraseña debe tener al menos una letra minúscula.",
  "Passwords must have at least one uppercase ('A'-'Z').": "La contraseña debe tener al menos una letra mayúscula.",
  "Passwords must have at least one non alphanumeric character.": "La contraseña debe tener al menos un carácter especial.",
  "Passwords must have at least one digit ('0'-'9').": "La contraseña debe tener al menos un número.",
  "Passwords must be at least 6 characters.": "La contraseña debe tener al menos 6 caracteres.",
  "User already exists.": "Ya existe un usuario con este correo o nombre de usuario."
}

function translateError(message) {
  // Buscamos si parte del mensaje original coincide con alguna de nuestras traducciones
  for (const [english, spanish] of Object.entries(errorTranslations)) {
    if (message.includes(english)) {
      return spanish;
    }
  }
  return message; // Si no hay traducción, devolvemos el original
}

/**
 * Registra un nuevo usuario
 * @param {Object} userData Datos del usuario (userName, email, password, firstName, lastName)
 * @returns {Promise} Respuesta del servidor
 */
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      
      // Intentamos extraer el mensaje de error de tu estructura particular
      const originalMessage = errorData.message || 'Error al registrar'
      const translatedMessage = translateError(originalMessage)
      
      throw new Error(translatedMessage)
    }

    // El endpoint puede que no devuelva JSON si es un simple OK 200, 
    // pero intentamos parsearlo si hay contenido.
    let data;
    const text = await response.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch(e) {
            data = text;
        }
    }
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

/**
 * Inicia sesión con Google OAuth (idToken obtenido por el SDK de Google)
 * @param {string} idToken Token de Google
 * @returns {Promise} Respuesta del servidor incluyendo el rol
 */
export const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch(`${API_BASE_URL}/GoogleAuth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      const originalMessage = errorData.message || 'Error al iniciar sesión con Google'
      const translatedMessage = translateError(originalMessage)
      throw new Error(translatedMessage)
    }

    const data = await response.json()

    if (data.isSuccess && data.token) {
      saveToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      try {
        const decodedToken = jwtDecode(data.token)
        const role = decodedToken['role'] ||
                     decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                     'Cliente'
        data.role = role
        localStorage.setItem('userRole', role)
      } catch (e) {
        console.error('Error al decodificar el token de Google:', e)
        data.role = 'Cliente'
      }
    }

    return data
  } catch (error) {
    throw error
  }
}

