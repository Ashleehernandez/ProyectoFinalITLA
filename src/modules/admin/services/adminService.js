// Servicio para el módulo de Administración
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Obtiene todos los días disponibles
 * @returns {Promise} Lista de días disponibles
 */
export const getAvailableDays = async () => {
  try {
    // TODO: Conectar con el API real
    // Simulación con datos mock
    const mockDays = JSON.parse(localStorage.getItem('availableDays') || '[]')
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    
    // Calcular reservaciones actuales por día
    return mockDays.map(day => {
      const dayBookings = bookings.filter(
        b => b.availableDayId === day.id && b.bookingState !== 'Cancelled'
      )
      return {
        ...day,
        currentBookings: dayBookings.length
      }
    })
    
    // Código real cuando se integre:
    // const response = await fetch(`${API_BASE_URL}/admin/available-days`, {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Error al obtener días')
    // return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Crea un nuevo día disponible
 * @param {Object} dayData - Datos del día (date, startTime, endTime, maxBookings)
 * @returns {Promise} Día creado
 */
export const createAvailableDay = async (dayData) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const days = JSON.parse(localStorage.getItem('availableDays') || '[]')
    const newDay = {
      id: Date.now().toString(),
      date: dayData.date,
      startTime: dayData.startTime,
      endTime: dayData.endTime,
      maxBookings: parseInt(dayData.maxBookings),
      currentBookings: 0,
      createdAt: new Date().toISOString()
    }
    days.push(newDay)
    localStorage.setItem('availableDays', JSON.stringify(days))
    return newDay
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/admin/available-days`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify(dayData)
    // })
    // if (!response.ok) throw new Error('Error al crear día')
    // return await response.json()
  } catch (error) {
    throw error
  }
}

/**
 * Elimina un día disponible
 * @param {string} id - ID del día a eliminar
 * @returns {Promise}
 */
export const deleteAvailableDay = async (id) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const days = JSON.parse(localStorage.getItem('availableDays') || '[]')
    const filtered = days.filter(day => day.id !== id)
    localStorage.setItem('availableDays', JSON.stringify(filtered))
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/admin/available-days/${id}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Error al eliminar día')
  } catch (error) {
    throw error
  }
}

