import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBookings, updateBookingState } from '../services/recepcionistaService'
import '../styles/recepcionista.css'

function RecepcionistaDashboard() {
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadBookings()
  }, [filter])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const fetchedBookings = await getBookings()
      setAllBookings(fetchedBookings)
      
      // Filtrar según el estado seleccionado
      if (filter === 'all') {
        setBookings(fetchedBookings)
      } else {
        setBookings(fetchedBookings.filter(b => b.bookingState === filter))
      }
    } catch (err) {
      setError('Error al cargar reservaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleStateChange = async (bookingId, newState) => {
    try {
      setLoading(true)
      await updateBookingState(bookingId, newState)
      await loadBookings()
    } catch (err) {
      setError('Error al actualizar el estado de la reservación')
    } finally {
      setLoading(false)
    }
  }

  const getStateBadgeClass = (state) => {
    switch (state) {
      case 'Pending':
        return 'badge-pending'
      case 'Confirmed':
        return 'badge-confirmed'
      case 'Cancelled':
        return 'badge-cancelled'
      default:
        return ''
    }
  }

  const getStateLabel = (state) => {
    switch (state) {
      case 'Pending':
        return 'Pendiente'
      case 'Confirmed':
        return 'Confirmada'
      case 'Cancelled':
        return 'Cancelada'
      default:
        return state
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  // Calcular estadísticas
  const pendingCount = allBookings.filter(b => b.bookingState === 'Pending').length
  const confirmedCount = allBookings.filter(b => b.bookingState === 'Confirmed').length
  const cancelledCount = allBookings.filter(b => b.bookingState === 'Cancelled').length

  return (
    <div className="recepcionista-container">
      {/* Header */}
      <div className="recepcionista-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gestión de Reservaciones</h1>
            <p>Sistema de Validación de Recepcionista</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-label">Total Reservaciones</div>
          <div className="stat-value">{allBookings.length}</div>
        </div>
        <div className="stat-card stat-card-pending">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
        <div className="stat-card stat-card-confirmed">
          <div className="stat-label">Confirmadas</div>
          <div className="stat-value">{confirmedCount}</div>
        </div>
        <div className="stat-card stat-card-cancelled">
          <div className="stat-label">Canceladas</div>
          <div className="stat-value">{cancelledCount}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {error && <div className="error-message">{error}</div>}

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filter-buttons">
            <button
              className={filter === 'all' ? 'filter-active' : 'filter-button'}
              onClick={() => setFilter('all')}
            >
              Todas ({allBookings.length})
            </button>
            <button
              className={filter === 'Pending' ? 'filter-active' : 'filter-button'}
              onClick={() => setFilter('Pending')}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              className={filter === 'Confirmed' ? 'filter-active' : 'filter-button'}
              onClick={() => setFilter('Confirmed')}
            >
              Confirmadas ({confirmedCount})
            </button>
            <button
              className={filter === 'Cancelled' ? 'filter-active' : 'filter-button'}
              onClick={() => setFilter('Cancelled')}
            >
              Canceladas ({cancelledCount})
            </button>
          </div>
        </div>

        {/* Bookings Table Section */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>Reservaciones ({bookings.length})</h2>
            <input 
              type="text" 
              placeholder="Buscar reservación..." 
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">Cargando reservaciones...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <p>No hay reservaciones {filter !== 'all' ? `con estado "${getStateLabel(filter)}"` : 'disponibles'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>CLIENTE</th>
                    <th>FECHA Y HORA</th>
                    <th>ESTADO</th>
                    <th>ID RESERVACIÓN</th>
                    <th>CREADA</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={booking.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{booking.bookedByClientName}</strong>
                      </td>
                      <td>
                        {new Date(booking.dateAndTime).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        <br />
                        <small style={{ color: '#666' }}>
                          {new Date(booking.dateAndTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td>
                        <span className={`state-badge ${getStateBadgeClass(booking.bookingState)}`}>
                          {getStateLabel(booking.bookingState)}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px', color: '#666' }}>#{booking.id.slice(-6)}</code>
                      </td>
                      <td>
                        <small style={{ color: '#666' }}>
                          {new Date(booking.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </small>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {booking.bookingState === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleStateChange(booking.id, 'Confirmed')}
                                className="action-button confirm"
                                title="Confirmar"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleStateChange(booking.id, 'Cancelled')}
                                className="action-button cancel"
                                title="Cancelar"
                              >
                                ✕
                              </button>
                            </>
                          )}
                          {booking.bookingState === 'Confirmed' && (
                            <button
                              onClick={() => handleStateChange(booking.id, 'Cancelled')}
                              className="action-button cancel"
                              title="Cancelar"
                            >
                              ✕
                            </button>
                          )}
                          {booking.bookingState === 'Cancelled' && (
                            <button
                              onClick={() => handleStateChange(booking.id, 'Pending')}
                              className="action-button restore"
                              title="Restaurar"
                            >
                              ↻
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecepcionistaDashboard

