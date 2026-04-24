const API_BASE_URL =
  "https://proyectofinalitlabackend-production.up.railway.app/api";

const getToken = () => localStorage.getItem("token");

/**
 * Obtiene todas las disponibilidades futuras (para el cliente)
 */
export const getAvailableDays = async () => {
  const res = await fetch(`${API_BASE_URL}/Availability/all`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Error al obtener días disponibles");
  const data = await res.json();

  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return data
    .map((item) => ({
      id: item.id,
      date: item.date.split("T")[0],
      startTime: item.timeSlots?.[0]?.startTime ?? "00:00",
      endTime: item.timeSlots?.[0]?.endTime ?? "00:00",
      timeSlotId: item.timeSlots?.[0]?.id ?? null,
      maxBookings: 10,
      currentBookings: item.timeSlots?.filter((ts) => ts.isBooked).length ?? 0,
      createdBy: item.createdBy,
    }))
    .filter((day) => day.date >= todayISO) // ← solo hoy en adelante
    .sort((a, b) => a.date.localeCompare(b.date)); // ← ordenadas por fecha
};
/**
 * Crea una nueva reservación usando el endpoint real
 */
export const createBooking = async (bookingData) => {
  const token = getToken();

  // Decodificar el userId del JWT
  let userId = null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userId = payload.nameid;
  } catch {
    throw new Error(
      "No se pudo identificar el usuario. Inicia sesión de nuevo.",
    );
  }

  const payload = {
    timeSlotId: bookingData.availableDayId, // availableDayId = timeSlotId en nuestro mapeo
    userId,
    date: bookingData.dateAndTime,
    numeroPersonas: bookingData.numeroPersonas ?? 1,
    comentarios: bookingData.comentarios ?? "",
  };

  const res = await fetch(`${API_BASE_URL}/Reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Error al crear la reservación");
  }

  return res.json();
};
