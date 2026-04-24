// Servicio para el módulo de Administración
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://proyectofinalitlabackend-production.up.railway.app/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

// ──────────────────────────────────────────────
//  PERFILES DE USUARIO
// ──────────────────────────────────────────────

/**
 * Obtiene el perfil del usuario autenticado
 * El backend requiere el token como query param: ?token=xxx
 * @returns {Promise} Datos del perfil
 */
export const getProfile = async () => {
  const token = localStorage.getItem("token") || "";
  const response = await fetch(`${API_BASE_URL}/Auth/profile?token=${token}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener perfil");
  return await response.json();
};

// ──────────────────────────────────────────────
//  ADMINISTRADORES
// ──────────────────────────────────────────────

/**
 * Lista todos los administradores registrados
 * GET /api/Administradores
 */
export const getAdmins = async () => {
  const response = await fetch(`${API_BASE_URL}/Administradores`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener administradores");
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || data.administradores || [];
};

/**
 * Lista solo los administradores activos
 * GET /api/Administradores/activos
 */
export const getActiveAdmins = async () => {
  const response = await fetch(`${API_BASE_URL}/Administradores/activos`, {
    headers: authHeaders(),
  });
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || data.administradores || [];
};

/**
 * Busca administradores por nombre
 * GET /api/Administradores/buscar?nombre={nombre}
 */
export const searchAdmins = async (nombre) => {
  if (!nombre) return getActiveAdmins();
  const response = await fetch(
    `${API_BASE_URL}/Administradores/buscar?nombre=${encodeURIComponent(nombre)}`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al buscar administradores");
  const data = await response.json();
  return Array.isArray(data) ? data : data.data || data.administradores || [];
};

/**
 * Obtiene el resumen de inventario
 * GET /api/Administradores/dashboard/inventario-resumen
 */
export const getInventarioResumen = async () => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/dashboard/inventario-resumen`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener resumen de inventario");
  return await response.json();
};

/**
 * Obtiene la lista completa de productos en el inventario
 * GET /api/Inventario
 */
export const getInventario = async () => {
  const response = await fetch(`${API_BASE_URL}/Inventario`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener listado de inventario");
  return await response.json();
};

/**
 * Agrega un nuevo producto al inventario
 * POST /api/Inventario
 */
export const createInventario = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/Inventario`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear producto");
  }
  return await response.json();
};

/**
 * Obtiene el resumen de empleados (prestadores) presentes y sus turnos
 * GET /api/Administradores/dashboard/empleados-presentes
 */
export const getEmpleadosPresentes = async () => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/dashboard/empleados-presentes`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener empleados presentes");
  return await response.json();
};

/**
 * Obtiene el reporte de ventas filtrado por rango de fechas
 * GET /api/Administradores/reportes/ventas?fechaInicio={inicio}&fechaFin={fin}
 */
export const getReporteVentas = async (fechaInicio, fechaFin) => {
  const query = new URLSearchParams();
  if (fechaInicio) query.append("fechaInicio", fechaInicio);
  if (fechaFin) query.append("fechaFin", fechaFin);

  const response = await fetch(
    `${API_BASE_URL}/Administradores/reportes/ventas?${query.toString()}`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener reporte de ventas");
  return await response.json();
};

/**
 * Obtiene el registro de auditoría de actividades
 * GET /api/Administradores/auditoria/actividades?limite={limite}
 */
export const getAuditoriaActividades = async (limite = 100) => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/auditoria/actividades?limite=${limite}`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok)
    throw new Error("Error al obtener auditoría de actividades");
  return await response.json();
};

/**
 * Crea un nuevo super administrador
 * POST /api/Administradores
 */
export const createAdmin = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/Administradores`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear administrador");
  }
  return await response.json();
};

/**
 * Elimina un administrador por su ID
 * DELETE /api/Administradores/{id}
 */
export const deleteAdmin = async (id) => {
  const response = await fetch(`${API_BASE_URL}/Administradores/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al eliminar administrador");
  }
  return true;
};

// ──────────────────────────────────────────────
//  CONFIGURACIÓN DEL RESTAURANTE
// ──────────────────────────────────────────────

/**
 * Obtiene la configuración actual del restaurante
 * @returns {Promise} { capacidadMaxima, horaApertura, horaCierre, tiempoPromedioMesa, margenGanancia }
 */
export const getConfig = async () => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/configuracion`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener configuración");
  return await response.json();
};

/**
 * Guarda/actualiza la configuración del restaurante
 * @param {Object} config - { capacidadMaxima, horaApertura, horaCierre }
 */
export const saveConfig = async (config) => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/configuracion`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(config),
    },
  );
  if (!response.ok) throw new Error("Error al guardar configuración");
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// ──────────────────────────────────────────────
//  PREDICCIÓN DE DEMANDA (períodos habilitados)
// ──────────────────────────────────────────────

/**
 * Lista todas las predicciones de demanda generadas
 * @returns {Promise} Array de predicciones
 */
export const getPredicciones = async () => {
  const response = await fetch(`${API_BASE_URL}/PrediccionDemanda`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Error al obtener predicciones");
  const data = await response.json();
  // La API puede devolver el array directamente o dentro de una propiedad
  return Array.isArray(data) ? data : data.data || data.predicciones || [];
};

/**
 * Genera una nueva predicción de demanda para un período
 * @param {Object} periodo - { periodoInicio, periodoFin, consideraFestivos, consideraTendencias }
 * @returns {Promise} Predicción creada
 */
export const createPrediccion = async (periodo) => {
  const response = await fetch(`${API_BASE_URL}/PrediccionDemanda`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(periodo),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al generar predicción");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

/**
 * Agrega una nueva fecha de disponibilidad (reserva) manual
 * @param {Object} payload
 */
export const createAvailability = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/Availability`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Error al crear la fecha de disponibilidad");
  }
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

// ──────────────────────────────────────────────
//  DASHBOARD STATS
// ──────────────────────────────────────────────

/**
 * Obtiene las estadísticas generales del dashboard
 */
export const getDashboardStats = async () => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/dashboard/estadisticas`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener estadísticas");
  return await response.json();
};

export const getAvailabilityList = async () => {
  const response = await fetch(`${API_BASE_URL}/Availability`, {
    headers: authHeaders(),
  });
  if (!response.ok)
    throw new Error("Error al obtener la lista de disponibilidades");
  return await response.json();
};

/**
 * Obtiene las reservas de hoy
 */
export const getReservasHoy = async () => {
  const response = await fetch(
    `${API_BASE_URL}/Administradores/dashboard/reservas-hoy`,
    {
      headers: authHeaders(),
    },
  );
  if (!response.ok) throw new Error("Error al obtener reservas de hoy");
  return await response.json();
};

/**
 * Obtiene todos los días disponibles
 * @returns {Promise} Lista de días disponibles
 */
export const getAvailableDays = async () => {
  try {
    // TODO: Conectar con el API real
    // Simulación con datos mock
    const mockDays = JSON.parse(localStorage.getItem("availableDays") || "[]");
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    // Calcular reservaciones actuales por día
    return mockDays.map((day) => {
      const dayBookings = bookings.filter(
        (b) => b.availableDayId === day.id && b.bookingState !== "Cancelled",
      );
      return {
        ...day,
        currentBookings: dayBookings.length,
      };
    });

    // Código real cuando se integre:
    // const response = await fetch(`${API_BASE_URL}/admin/available-days`, {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Error al obtener días')
    // return await response.json()
  } catch (error) {
    throw error;
  }
};

/**
 * Crea un nuevo día disponible
 * @param {Object} dayData - Datos del día (date, startTime, endTime, maxBookings)
 * @returns {Promise} Día creado
 */
export const createAvailableDay = async (dayData) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const days = JSON.parse(localStorage.getItem("availableDays") || "[]");
    const newDay = {
      id: Date.now().toString(),
      date: dayData.date,
      startTime: dayData.startTime,
      endTime: dayData.endTime,
      maxBookings: parseInt(dayData.maxBookings),
      currentBookings: 0,
      createdAt: new Date().toISOString(),
    };
    days.push(newDay);
    localStorage.setItem("availableDays", JSON.stringify(days));
    return newDay;

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
    throw error;
  }
};

/**
 * Elimina un día disponible
 * @param {string} id - ID del día a eliminar
 * @returns {Promise}
 */
export const deleteAvailableDay = async (id) => {
  try {
    // TODO: Conectar con el API real
    // Simulación
    const days = JSON.parse(localStorage.getItem("availableDays") || "[]");
    const filtered = days.filter((day) => day.id !== id);
    localStorage.setItem("availableDays", JSON.stringify(filtered));

    // Código real:
    // const response = await fetch(`${API_BASE_URL}/admin/available-days/${id}`, {
    //   method: 'DELETE',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //   }
    // })
    // if (!response.ok) throw new Error('Error al eliminar día')
  } catch (error) {
    throw error;
  }
};
