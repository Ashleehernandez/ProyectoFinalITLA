// Servicio para el módulo de Cliente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/**
 * Obtiene los días disponibles para reservar
 * @returns {Promise} Lista de días disponibles
 */
export const getAvailableDays = async () => {
  try {
    // TODO: Conectar con el API real
    // Simulación - obtiene de localStorage (creado por admin)
    const days = JSON.parse(localStorage.getItem('availableDays') || '[]')
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    
    // Calcular reservaciones actuales por día
    return days.map(day => {
      const dayBookings = bookings.filter(
        b => b.availableDayId === day.id && b.bookingState !== 'Cancelled'
      )
      return {
        ...day,
        currentBookings: dayBookings.length
      }
    })
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/cliente/available-days`, {
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
 * Crea una nueva reservación
 * @param {Object} bookingData - Datos de la reservación
 * @returns {Promise} Reservación creada
 */
export const createBooking = async (bookingData) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
    
    // Verificar disponibilidad
    const day = JSON.parse(localStorage.getItem('availableDays') || '[]')
      .find(d => d.id === bookingData.availableDayId)
    
    if (!day) {
      throw new Error('Día no encontrado')
    }
    
    const dayBookings = bookings.filter(
      b => b.availableDayId === bookingData.availableDayId && b.bookingState !== 'Cancelled'
    )
    
    if (dayBookings.length >= day.maxBookings) {
      throw new Error('No hay disponibilidad para este día')
    }
    
    const newBooking = {
      id: Date.now().toString(),
      dateAndTime: bookingData.dateAndTime,
      bookedByClientName: bookingData.bookedByClientName,
      bookingState: 'Pending', // Pending, Confirmed, Cancelled
      availableDayId: bookingData.availableDayId,
      createdAt: new Date().toISOString()
    }
    
    bookings.push(newBooking)
    localStorage.setItem('bookings', JSON.stringify(bookings))
    return newBooking
    
    // Código real:
    // const response = await fetch(`${API_BASE_URL}/cliente/bookings`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   },
    //   body: JSON.stringify(bookingData)
    // })
    // if (!response.ok) {
    //   const error = await response.json()
    //   throw new Error(error.message || 'Error al crear reservación')
    // }
    // return await response.json()
  } catch (error) {
    throw error
  }
}

