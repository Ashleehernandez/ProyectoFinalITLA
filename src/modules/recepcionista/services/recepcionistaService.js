// Servicio para el módulo de Recepcionista
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Obtiene todas las reservaciones
 * @returns {Promise} Lista de reservaciones
 */
export const getBookings = async () => {
  try {
    // TODO: Conectar con el API real
    // Simulación - obtiene de localStorage
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    
    // Ordenar por fecha más reciente
    return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/recepcionista/bookings`, {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Error al obtener reservaciones')
    // return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Actualiza el estado de una reservación
 * @param {string} bookingId - ID de la reservación
 * @param {string} newState - Nuevo estado (Pending, Confirmed, Cancelled)
 * @returns {Promise} Reservación actualizada
 */
export const updateBookingState = async (bookingId, newState) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    const bookingIndex = bookings.findIndex(b => b.id === bookingId)
    
    if (bookingIndex === -1) {
      throw new Error('Reservación no encontrada')
    }
    
    bookings[bookingIndex].bookingState = newState
    bookings[bookingIndex].updatedAt = new Date().toISOString()
    
    localStorage.setItem('bookings', JSON.stringify(bookings))
    return bookings[bookingIndex]
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/recepcionista/bookings/${bookingId}`, {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify({ bookingState: newState })
    // })
    // if (!response.ok) {
    //   const error = await response.json()
    //   throw new Error(error.message || 'Error al actualizar reservación')
    // }
    // return await response.json()
  } catch (error) {
    throw error
  }
}

