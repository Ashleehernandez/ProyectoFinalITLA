import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAvailableDays, createAvailableDay, deleteAvailableDay } from '../services/adminService'
import '../styles/admin.css'

function AdminDashboard() {
  const [availableDays, setAvailableDays] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    maxBookings: 10
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadAvailableDays()
  }, [])

  const loadAvailableDays = async () => {
    try {
      setLoading(true)
      const days = await getAvailableDays()
      setAvailableDays(days)
    } catch (err) {
      setError('Error al cargar días disponibles')
    } finally {
      setLoading(false)
    }
  }

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

    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Por favor completa todos los campos')
      return
    }

    try {
      setLoading(true)
      await createAvailableDay(formData)
      await loadAvailableDays()
      setShowForm(false)
      setFormData({ date: '', startTime: '', endTime: '', maxBookings: 10 })
    } catch (err) {
      setError('Error al crear día disponible')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este día disponible?')) {
      return
    }

    try {
      setLoading(true)
      await deleteAvailableDay(id)
      await loadAvailableDays()
    } catch (err) {
      setError('Error al eliminar día disponible')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  // Calcular estadísticas
  const totalDays = availableDays.length
  const totalBookings = availableDays.reduce((sum, day) => sum + (day.currentBookings || 0), 0)
  const totalCapacity = availableDays.reduce((sum, day) => sum + day.maxBookings, 0)
  const availableSlots = totalCapacity - totalBookings

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Gestión de Reservaciones</h1>
            <p>Sistema de Administración de Restaurante</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-label">Días Disponibles</div>
          <div className="stat-value">{totalDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reservaciones Totales</div>
          <div className="stat-value">{totalBookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Capacidad Total</div>
          <div className="stat-value">{totalCapacity}</div>
        </div>
        <div className="stat-card stat-card-add" onClick={() => setShowForm(!showForm)}>
          <div className="stat-label">AGREGAR NUEVO</div>
          <div className="stat-icon">+</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {error && <div className="error-message">{error}</div>}

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nuevo Día Disponible</h2>
                <button onClick={() => setShowForm(false)} className="close-button">×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="date">Fecha</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">Hora inicio</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime">Hora fin</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="maxBookings">Máximo de reservaciones</label>
                  <input
                    type="number"
                    id="maxBookings"
                    name="maxBookings"
                    value={formData.maxBookings}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="cancel-button"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="submit-button" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Día'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="table-section">
          <div className="table-header">
            <h2>Días Disponibles</h2>
            <div className="table-actions">
              <input 
                type="text" 
                placeholder="Buscar día..." 
                className="search-input"
              />
            </div>
          </div>

          {loading && !showForm ? (
            <div className="loading-state">Cargando...</div>
          ) : availableDays.length === 0 ? (
            <div className="empty-state">
              <p>No hay días disponibles creados</p>
              <button onClick={() => setShowForm(true)} className="add-first-button">
                + Crear primer día disponible
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>FECHA</th>
                    <th>HORARIO</th>
                    <th>CAPACIDAD MÁXIMA</th>
                    <th>RESERVACIONES</th>
                    <th>DISPONIBILIDAD</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {availableDays.map((day, index) => {
                    const availability = day.maxBookings - (day.currentBookings || 0)
                    const percentage = ((day.currentBookings || 0) / day.maxBookings) * 100
                    return (
                      <tr key={day.id}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{new Date(day.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</strong>
                        </td>
                        <td>{day.startTime} - {day.endTime}</td>
                        <td>{day.maxBookings}</td>
                        <td>
                          <span className="booking-count">{day.currentBookings || 0}</span>
                        </td>
                        <td>
                          <div className="availability-info">
                            <span className={`availability-badge ${availability > 0 ? 'available' : 'full'}`}>
                              {availability > 0 ? `${availability} disponibles` : 'Completo'}
                            </span>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDelete(day.id)}
                            className="action-button delete"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

