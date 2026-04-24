import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableDays, createBooking } from "../services/clienteService";
import "../styles/cliente.css";

function ClienteDashboard() {
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [formData, setFormData] = useState({
    dateAndTime: "",
    bookedByClientName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAvailableDays();
  }, []);

  const loadAvailableDays = async () => {
    try {
      setLoading(true);
      const days = await getAvailableDays();
      setAvailableDays(days);
    } catch (err) {
      setError("Error al cargar días disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setFormData({
      dateAndTime: `${day.date}T${day.startTime}`,
      bookedByClientName: "",
    });
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.bookedByClientName) {
      setError("Por favor ingresa tu nombre completo");
      return;
    }

    if (!selectedDay) {
      setError("Por favor selecciona un día disponible");
      return;
    }

    try {
      setLoading(true);
      await createBooking({
        dateAndTime: formData.dateAndTime,
        bookedByClientName: formData.bookedByClientName,
        availableDayId: selectedDay.timeSlotId, // ← usa el timeSlotId real
        numeroPersonas: 1,
        comentarios: "",
      });
      setSuccess("¡Reservación creada exitosamente!");
      setFormData({ dateAndTime: "", bookedByClientName: "" });
      setSelectedDay(null);
      await loadAvailableDays();
    } catch (err) {
      setError(err.message || "Error al crear la reservación");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  // Calcular estadísticas
  const totalDays = availableDays.length;
  const availableSlots = availableDays.reduce((sum, day) => {
    const available = day.maxBookings - (day.currentBookings || 0);
    return sum + (available > 0 ? available : 0);
  }, 0);
  const totalBookings = availableDays.reduce(
    (sum, day) => sum + (day.currentBookings || 0),
    0,
  );
  const fullDays = availableDays.filter(
    (day) => (day.currentBookings || 0) >= day.maxBookings,
  ).length;

  return (
    <div className="cliente-container">
      {/* Header */}
      <div className="cliente-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Reservaciones</h1>
            <p>Sistema de Reservas del Restaurante</p>
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
          <div className="stat-label">Lugares Disponibles</div>
          <div className="stat-value">{availableSlots}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Reservaciones Totales</div>
          <div className="stat-value">{totalBookings}</div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-label">Días Completos</div>
          <div className="stat-value">{fullDays}</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Available Days Section */}
        <div className="days-section">
          <div className="section-header">
            <h2>Días Disponibles</h2>
            <input
              type="text"
              placeholder="Buscar día..."
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">Cargando días disponibles...</div>
          ) : availableDays.length === 0 ? (
            <div className="empty-state">
              <p>No hay días disponibles en este momento</p>
            </div>
          ) : (
            <div className="days-grid">
              {availableDays.map((day) => {
                const isFull = (day.currentBookings || 0) >= day.maxBookings;
                const availability =
                  day.maxBookings - (day.currentBookings || 0);
                const percentage =
                  ((day.currentBookings || 0) / day.maxBookings) * 100;

                return (
                  <div
                    key={day.id}
                    className={`day-card ${isFull ? "full" : ""} ${selectedDay?.id === day.id ? "selected" : ""}`}
                    onClick={() => !isFull && handleDaySelect(day)}
                  >
                    <div className="day-card-header">
                      <div className="day-date">
                        {new Date(day.date + "T12:00:00").toLocaleDateString(
                          "es-ES",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </div>
                      {isFull && <span className="full-badge">Completo</span>}
                    </div>
                    <div className="day-time">
                      <span className="time-icon">🕐</span>
                      {day.startTime} - {day.endTime}
                    </div>
                    <div className="day-availability">
                      <div className="availability-info">
                        <span className="availability-text">
                          {day.currentBookings || 0} / {day.maxBookings}{" "}
                          reservaciones
                        </span>
                        <span
                          className={`availability-badge ${availability > 0 ? "available" : "full"}`}
                        >
                          {availability > 0
                            ? `${availability} disponibles`
                            : "Sin disponibilidad"}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    {!isFull && (
                      <button
                        className="select-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDaySelect(day);
                        }}
                      >
                        Seleccionar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedDay && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedDay(null);
            setFormData({ dateAndTime: "", bookedByClientName: "" });
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Completa tu Reservación</h2>
              <button
                onClick={() => {
                  setSelectedDay(null);
                  setFormData({ dateAndTime: "", bookedByClientName: "" });
                }}
                className="close-button"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="selected-day-summary">
                <div className="summary-item">
                  <span className="summary-label">Fecha:</span>
                  <span className="summary-value">
                    {new Date(
                      selectedDay.date + "T12:00:00",
                    ).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Horario:</span>
                  <span className="summary-value">
                    {selectedDay.startTime} - {selectedDay.endTime}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Disponibilidad:</span>
                  <span className="summary-value">
                    {selectedDay.maxBookings -
                      (selectedDay.currentBookings || 0)}{" "}
                    lugares disponibles
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bookedByClientName">Nombre completo</label>
                <input
                  type="text"
                  id="bookedByClientName"
                  name="bookedByClientName"
                  value={formData.bookedByClientName}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateAndTime">Fecha y hora específica</label>
                <input
                  type="datetime-local"
                  id="dateAndTime"
                  name="dateAndTime"
                  value={formData.dateAndTime}
                  onChange={handleChange}
                  min={`${selectedDay.date}T${selectedDay.startTime}`}
                  max={`${selectedDay.date}T${selectedDay.endTime}`}
                  required
                />
                <small className="form-hint">
                  Selecciona la hora exacta dentro del horario disponible
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null);
                    setFormData({ dateAndTime: "", bookedByClientName: "" });
                  }}
                  className="cancel-button"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Reservando..." : "Confirmar Reservación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClienteDashboard;
