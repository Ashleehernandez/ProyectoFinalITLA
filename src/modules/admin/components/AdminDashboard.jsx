import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getConfig,
  saveConfig,
  getPredicciones,
  createPrediccion,
  getProfile,
  getAdmins,
  deleteAdmin,
  getActiveAdmins,
  searchAdmins,
  getDashboardStats,
  getReservasHoy,
  getInventarioResumen,
  getEmpleadosPresentes,
  getReporteVentas,
  getAuditoriaActividades,
  getInventario,
  createInventario,
  createAvailability,
  getAvailabilityList,
  getProductoHistorial,
} from "../services/adminService";
import "../styles/admin.css";

/* ═══════════════════════════════════════════════════════════
   CALENDAR COMPONENT — Full featured date picker
═══════════════════════════════════════════════════════════ */
const DAYS_ES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function CalendarPicker({
  value,
  onChange,
  minDate,
  maxDate,
  label,
  placeholder = "Seleccionar fecha",
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(null);
  const [viewMonth, setViewMonth] = useState(null);
  const ref = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value + "T00:00:00") : null;

  useEffect(() => {
    const base = selected || today;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const toISO = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const isDisabled = (y, m, d) => {
    const iso = toISO(y, m, d);
    if (minDate && iso < minDate) return true;
    if (maxDate && iso > maxDate) return true;
    return false;
  };

  const handleDay = (d) => {
    const iso = toISO(viewYear, viewMonth, d);
    if (!isDisabled(viewYear, viewMonth, d)) {
      onChange(iso);
      setOpen(false);
    }
  };

  const displayValue = selected
    ? selected.toLocaleDateString("es-ES", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const days = getDaysInMonth(
    viewYear ?? today.getFullYear(),
    viewMonth ?? today.getMonth(),
  );
  const firstDay = getFirstDay(
    viewYear ?? today.getFullYear(),
    viewMonth ?? today.getMonth(),
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && <label style={styles.label}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...styles.calInput,
          color: selected ? "#111827" : "#9ca3af",
        }}
      >
        <span style={{ fontSize: "16px" }}>📅</span>
        <span style={{ flex: 1, textAlign: "left" }}>
          {displayValue || placeholder}
        </span>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>▼</span>
      </button>

      {open && viewYear !== null && viewMonth !== null && (
        <div style={styles.calPopup}>
          {/* Header */}
          <div style={styles.calHeader}>
            <button type="button" onClick={prevMonth} style={styles.calNav}>
              ‹
            </button>
            <span style={styles.calTitle}>
              {MONTHS_ES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} style={styles.calNav}>
              ›
            </button>
          </div>

          {/* Day names */}
          <div style={styles.calGrid}>
            {DAYS_ES.map((d) => (
              <div key={d} style={styles.calDayName}>
                {d}
              </div>
            ))}
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {/* Days */}
            {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
              const iso = toISO(viewYear, viewMonth, d);
              const isSelected = value === iso;
              const disabled = isDisabled(viewYear, viewMonth, d);
              const isToday =
                iso ===
                toISO(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDay(d)}
                  disabled={disabled}
                  style={{
                    ...styles.calDay,
                    ...(isSelected ? styles.calDaySelected : {}),
                    ...(isToday && !isSelected ? styles.calDayToday : {}),
                    ...(disabled ? styles.calDayDisabled : {}),
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div style={{ padding: "8px 12px", borderTop: "1px solid #f3f4f6" }}>
            <button
              type="button"
              onClick={() => {
                const iso = toISO(
                  today.getFullYear(),
                  today.getMonth(),
                  today.getDate(),
                );
                if (
                  !isDisabled(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  )
                ) {
                  onChange(iso);
                  setOpen(false);
                }
              }}
              style={styles.calTodayBtn}
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={{
                  ...styles.calTodayBtn,
                  marginLeft: "8px",
                  color: "#dc2626",
                }}
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DATE RANGE PICKER — Two calendars side by side
═══════════════════════════════════════════════════════════ */
function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  label,
}) {
  return (
    <div>
      {label && (
        <label
          style={{ ...styles.label, marginBottom: "8px", display: "block" }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1", minWidth: "180px" }}>
          <CalendarPicker
            value={startDate}
            onChange={onStartChange}
            label="Fecha Inicio"
            placeholder="Desde..."
            maxDate={endDate || undefined}
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: "32px",
            color: "#9ca3af",
            fontWeight: "600",
          }}
        >
          →
        </div>
        <div style={{ flex: "1", minWidth: "180px" }}>
          <CalendarPicker
            value={endDate}
            onChange={onEndChange}
            label="Fecha Fin"
            placeholder="Hasta..."
            minDate={startDate || undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TIME PICKER — Visual clock-style selector
═══════════════════════════════════════════════════════════ */
function TimePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar hora",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [hour, minute] = value ? value.split(":").map(Number) : [null, null];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatDisplay = (h, m) => {
    if (h === null) return "";
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const quickTimes = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && <label style={styles.label}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          ...styles.calInput,
          color: value ? "#111827" : "#9ca3af",
        }}
      >
        <span style={{ fontSize: "16px" }}>🕐</span>
        <span style={{ flex: 1, textAlign: "left" }}>
          {value ? formatDisplay(hour, minute) : placeholder}
        </span>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>▼</span>
      </button>

      {open && (
        <div style={{ ...styles.calPopup, width: "220px" }}>
          <div style={{ padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "600",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Hora rápida
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "4px",
              }}
            >
              {quickTimes.map((t) => {
                const [h] = t.split(":").map(Number);
                const ampm = h >= 12 ? "PM" : "AM";
                const h12 = h % 12 === 0 ? 12 : h % 12;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChange(t);
                      setOpen(false);
                    }}
                    style={{
                      padding: "6px 4px",
                      fontSize: "12px",
                      border: "1px solid",
                      borderColor: value === t ? "#6d28d9" : "#e5e7eb",
                      borderRadius: "6px",
                      background: value === t ? "#6d28d9" : "white",
                      color: value === t ? "white" : "#374151",
                      cursor: "pointer",
                      fontWeight: value === t ? "700" : "400",
                      transition: "all 0.15s",
                    }}
                  >
                    {String(h12).padStart(2, "0")}
                    <br />
                    <span style={{ fontSize: "10px", opacity: 0.7 }}>
                      {ampm}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual input */}
          <div style={{ padding: "12px" }}>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontWeight: "600",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Hora exacta
            </p>
            <input
              type="time"
              value={value || ""}
              onChange={(e) => {
                onChange(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />
          </div>

          {value && (
            <div style={{ padding: "0 12px 12px" }}>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={{
                  ...styles.calTodayBtn,
                  color: "#dc2626",
                  width: "100%",
                }}
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INLINE STYLES
═══════════════════════════════════════════════════════════ */
const styles = {
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  calInput: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    textAlign: "left",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  calPopup: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    zIndex: 1000,
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
    width: "300px",
    overflow: "hidden",
    animation: "calFadeIn 0.15s ease",
  },
  calHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6",
    background: "#fafafa",
  },
  calNav: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#374151",
    transition: "background 0.15s",
  },
  calTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "2px",
    padding: "12px",
  },
  calDayName: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    padding: "4px 0",
    textTransform: "uppercase",
  },
  calDay: {
    width: "100%",
    aspectRatio: "1",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calDaySelected: {
    background: "#6d28d9",
    color: "white",
    fontWeight: "700",
    boxShadow: "0 2px 8px rgba(109,40,217,0.4)",
  },
  calDayToday: {
    background: "#f3f0ff",
    color: "#6d28d9",
    fontWeight: "700",
    border: "1.5px solid #c4b5fd",
  },
  calDayDisabled: {
    opacity: 0.3,
    cursor: "not-allowed",
    background: "transparent",
  },
  calTodayBtn: {
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "5px 12px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#6d28d9",
    fontWeight: "600",
    transition: "background 0.15s",
  },
};

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════ */
const MENU_ITEMS = [
  { id: "estadisticas", icon: "📊", label: "Estadísticas" },
  { id: "auditoria", icon: "🔍", label: "Auditoría" },
  { id: "reportes_ventas", icon: "💰", label: "Reportes de Ventas" },
  { id: "inventario", icon: "📦", label: "Inventario" },
  { id: "prestadores", icon: "👥", label: "Prestadores" },
  { id: "configuracion", icon: "⚙️", label: "Configuración" },
  { id: "disponibilidad", icon: "🗓️", label: "Agregar Fecha Reserva" },
  { id: "periodos", icon: "📅", label: "Períodos de Disponibilidad" },
  { id: "administradores", icon: "🛡️", label: "Super Administradores" },
  { id: "administradores_activos", icon: "✅", label: "Admins Activos" },
];

const CATEGORIAS_INVENTARIO = [
  { id: 1, name: "Comidas y Aperitivos" },
  { id: 2, name: "Bebidas Varios" },
  { id: 3, name: "Insumos de Cocina" },
  { id: 4, name: "Suministros Generales" },
  { id: 5, name: "Limpieza y Mantenimiento" },
];

function getInitials(profile) {
  if (!profile) return "?";
  const f = profile.firstName?.[0] || "";
  const l = profile.lastName?.trim()[0] || "";
  return (f + l).toUpperCase() || "?";
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("estadisticas");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ── Estadísticas State ──
  const [stats, setStats] = useState(null);
  const [reservasHoy, setReservasHoy] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // ── Inventario State ──
  const [inventario, setInventario] = useState(null);
  const [inventarioLoading, setInventarioLoading] = useState(false);
  const [inventarioError, setInventarioError] = useState("");
  const [inventarioLista, setInventarioLista] = useState([]);
  const [inventarioListaLoading, setInventarioListaLoading] = useState(false);
  const [inventarioListaError, setInventarioListaError] = useState("");
  const [showInventarioForm, setShowInventarioForm] = useState(false);
  const [inventarioFormData, setInventarioFormData] = useState({
    nombre: "",
    descripcion: "",
    categoria: 1,
    cantidadActual: 0,
    cantidadMinima: 0,
    cantidadMaxima: 0,
    unidad: "unidades",
    precioCosto: 0,
    fechaVencimiento: "",
    proveedor: "",
  });
  const [inventarioFormLoading, setInventarioFormLoading] = useState(false);
  const [inventarioFormError, setInventarioFormError] = useState("");

  // ── Prestadores State ──
  const [prestadores, setPrestadores] = useState(null);
  const [prestadoresLoading, setPrestadoresLoading] = useState(false);
  const [prestadoresError, setPrestadoresError] = useState("");

  // ── Reporte Ventas State ──
  const [reporteVentas, setReporteVentas] = useState(null);
  const [reporteVentasLoading, setReporteVentasLoading] = useState(false);
  const [reporteVentasError, setReporteVentasError] = useState("");
  const [filtroVentas, setFiltroVentas] = useState({
    fechaInicio: "",
    fechaFin: "",
  });

  // ── Auditoria State ──
  const [auditoriaActividades, setAuditoriaActividades] = useState([]);
  const [auditoriaLoading, setAuditoriaLoading] = useState(false);
  const [auditoriaError, setAuditoriaError] = useState("");

  // ── Config State ──
  const [config, setConfig] = useState({
    capacidadMaxima: "",
    horaApertura: "",
    horaCierre: "",
    tiempoPromedioMesa: "",
    margenGanancia: "",
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [configSuccess, setConfigSuccess] = useState("");
  const [configError, setConfigError] = useState("");
  const [showConfigForm, setShowConfigForm] = useState(false);

  // ── Predicciones State ──
  const [predicciones, setPredicciones] = useState([]);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    periodoInicio: "",
    periodoFin: "",
    consideraFestivos: true,
    consideraTendencias: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Administradores State ──
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    usuarioId: "",
    nivelAcceso: "SuperAdmin",
    areaResponsabilidad: "Operaciones generales",
    activo: true,
  });
  const [adminFormLoading, setAdminFormLoading] = useState(false);
  const [adminFormError, setAdminFormError] = useState("");

  // ── Admins Activos State ──
  const [activeAdmins, setActiveAdmins] = useState([]);
  const [activeAdminsLoading, setActiveAdminsLoading] = useState(false);
  const [activeAdminsError, setActiveAdminsError] = useState("");
  const [searchAdminQuery, setSearchAdminQuery] = useState("");

  // ── Profile State ──
  const [profile, setProfile] = useState(null);

  // ── AI Prediction State ──
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [aiSelectedProducts, setAiSelectedProducts] = useState([]);
  const [aiMeses, setAiMeses] = useState(3);

  // ── Disponibilidad State ──
  const [showDispoForm, setShowDispoForm] = useState(false);
  const [dispoFormData, setDispoFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [dispoLoading, setDispoLoading] = useState(false);
  const [dispoError, setDispoError] = useState("");
  const [dispoSuccess, setDispoSuccess] = useState("");
  const [availabilityList, setAvailabilityList] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  /* ── Loaders ── */
  const loadAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const data = await getAvailabilityList();
      setAvailabilityList(data);
    } catch {
      setAvailabilityError("Error al leer listado de fechas de reserva");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const [statsData, reservasHoyData] = await Promise.all([
        getDashboardStats(),
        getReservasHoy(),
      ]);
      setStats(statsData.data || statsData);
      setReservasHoy(reservasHoyData.data || reservasHoyData);
    } catch {
      setStatsError("No se pudieron cargar las estadísticas");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadPrestadores = async () => {
    try {
      setPrestadoresLoading(true);
      const data = await getEmpleadosPresentes();
      setPrestadores(data.data || data);
    } catch {
      setPrestadoresError("No se pudo cargar la información de prestadores");
    } finally {
      setPrestadoresLoading(false);
    }
  };

  const loadReporteVentas = async (
    fechaInicio = filtroVentas.fechaInicio,
    fechaFin = filtroVentas.fechaFin,
  ) => {
    try {
      setReporteVentasLoading(true);
      const data = await getReporteVentas(fechaInicio, fechaFin);
      setReporteVentas(data.data || data);
    } catch {
      setReporteVentasError("No se pudo cargar el reporte de ventas");
    } finally {
      setReporteVentasLoading(false);
    }
  };

  const loadAuditoria = async () => {
    try {
      setAuditoriaLoading(true);
      const data = await getAuditoriaActividades();
      setAuditoriaActividades(data.data || data || []);
    } catch {
      setAuditoriaError("No se pudo cargar la auditoría de actividades");
    } finally {
      setAuditoriaLoading(false);
    }
  };

  const loadInventario = async () => {
    try {
      setInventarioLoading(true);
      const data = await getInventarioResumen();
      setInventario(data.data || data);
    } catch {
      setInventarioError("No se pudo cargar el resumen de inventario");
    } finally {
      setInventarioLoading(false);
    }

    try {
      setInventarioListaLoading(true);
      const listData = await getInventario();
      const arrayData = Array.isArray(listData)
        ? listData
        : Array.isArray(listData?.data)
          ? listData.data
          : [];
      setInventarioLista(arrayData);
    } catch {
      setInventarioListaError("No se pudo cargar la lista de inventario");
    } finally {
      setInventarioListaLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      setConfigLoading(true);
      const data = await getConfig();
      setConfig({
        capacidadMaxima: data.capacidadMaxima ?? "",
        horaApertura: data.horaApertura ?? "",
        horaCierre: data.horaCierre ?? "",
        tiempoPromedioMesa: data.tiempoPromedioMesa ?? "",
        margenGanancia: data.margenGanancia ?? "",
      });
    } catch {
      setConfigError("No se pudo cargar la configuración");
    } finally {
      setConfigLoading(false);
    }
  };

  const loadPredicciones = async () => {
    try {
      setPredLoading(true);
      const data = await getPredicciones();
      setPredicciones(data);
    } catch {
      setPredError("No se pudieron cargar las predicciones");
    } finally {
      setPredLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch {
      setAdminsError("No se pudieron cargar los administradores");
    } finally {
      setAdminsLoading(false);
    }
  };

  const loadActiveAdmins = async () => {
    try {
      setActiveAdminsLoading(true);
      const data = await getActiveAdmins();
      setActiveAdmins(data);
    } catch {
      setActiveAdminsError("No se pudieron cargar los administradores activos");
    } finally {
      setActiveAdminsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const localUserStr = localStorage.getItem("user");
      if (localUserStr) setProfile(JSON.parse(localUserStr));
      const data = await getProfile();
      if (data && (data.data || data.user || data.id))
        setProfile(data.data || data.user || data);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    loadStats();
    loadInventario();
    loadPrestadores();
    loadReporteVentas();
    loadAuditoria();
    loadConfig();
    loadPredicciones();
    loadProfile();
    loadAdmins();
    loadActiveAdmins();
    loadAvailability();
  }, []);

  /* ── Handlers ── */
  const handleFiltrarVentas = (e) => {
    e.preventDefault();
    loadReporteVentas(filtroVentas.fechaInicio, filtroVentas.fechaFin);
  };

  const handleConfigChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
    setConfigSuccess("");
    setConfigError("");
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setConfigError("");
    setConfigSuccess("");
    try {
      setConfigLoading(true);
      await saveConfig({
        capacidadMaxima: parseInt(config.capacidadMaxima),
        horaApertura: parseInt(config.horaApertura),
        horaCierre: parseInt(config.horaCierre),
        tiempoPromedioMesa: parseInt(config.tiempoPromedioMesa),
        margenGanancia: parseFloat(config.margenGanancia),
      });
      setConfigSuccess("¡Configuración guardada exitosamente!");
      setShowConfigForm(false);
    } catch {
      setConfigError("Error al guardar la configuración");
    } finally {
      setConfigLoading(false);
    }
  };

  const handleCreatePrediccion = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.periodoInicio || !formData.periodoFin) {
      setFormError("Debes indicar fecha de inicio y fin");
      return;
    }
    if (formData.periodoFin < formData.periodoInicio) {
      setFormError("La fecha de fin no puede ser anterior al inicio");
      return;
    }
    try {
      setFormLoading(true);
      await createPrediccion(formData);
      await loadPredicciones();
      setShowForm(false);
      setFormData({
        periodoInicio: "",
        periodoFin: "",
        consideraFestivos: true,
        consideraTendencias: true,
      });
    } catch (err) {
      setFormError(err.message || "Error al generar predicción");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdminFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminFormData({
      ...adminFormData,
      [name]: type === "checkbox" ? checked : value,
    });
    setAdminFormError("");
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setAdminFormError("");
    if (!profile || !profile.id) {
      setAdminFormError(
        "No se pudo identificar tu usuario actual. Recarga la página.",
      );
      return;
    }
    try {
      setAdminFormLoading(true);
      const { createAdmin } = await import("../services/adminService");
      await createAdmin({ ...adminFormData, usuarioId: profile.id });
      await loadAdmins();
      setShowAdminForm(false);
      setAdminFormData({
        usuarioId: "",
        nivelAcceso: "SuperAdmin",
        areaResponsabilidad: "Operaciones generales",
        activo: true,
      });
    } catch (err) {
      setAdminFormError(err.message || "Error al crear administrador");
    } finally {
      setAdminFormLoading(false);
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (
      !window.confirm(
        "¿Está seguro de que desea eliminar a este administrador? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      await deleteAdmin(id);
      loadAdmins();
      loadActiveAdmins();
    } catch {
      alert("Error al intentar eliminar el administrador.");
    }
  };

  const handleCreateInventario = async (e) => {
    e.preventDefault();
    setInventarioFormError("");
    setInventarioFormLoading(true);
    try {
      const payload = {
        ...inventarioFormData,
        categoria: parseInt(inventarioFormData.categoria, 10),
        cantidadActual: parseInt(inventarioFormData.cantidadActual, 10),
        cantidadMinima: parseInt(inventarioFormData.cantidadMinima, 10),
        cantidadMaxima: parseInt(inventarioFormData.cantidadMaxima, 10),
        precioCosto: parseFloat(inventarioFormData.precioCosto),
      };
      if (!payload.fechaVencimiento) delete payload.fechaVencimiento;
      await createInventario(payload);
      setShowInventarioForm(false);
      loadInventario();
      setInventarioFormData({
        nombre: "",
        descripcion: "",
        categoria: 1,
        cantidadActual: 0,
        cantidadMinima: 0,
        cantidadMaxima: 0,
        unidad: "unidades",
        precioCosto: 0,
        fechaVencimiento: "",
        proveedor: "",
      });
    } catch (err) {
      setInventarioFormError(
        err.message || "Ocurrió un error al crear el producto",
      );
    } finally {
      setInventarioFormLoading(false);
    }
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    setDispoLoading(true);
    setDispoError("");
    setDispoSuccess("");
    if (!dispoFormData.date) {
      setDispoError("Selecciona una fecha.");
      setDispoLoading(false);
      return;
    }
    if (!dispoFormData.startTime) {
      setDispoError("Selecciona una hora de inicio.");
      setDispoLoading(false);
      return;
    }
    if (!dispoFormData.endTime) {
      setDispoError("Selecciona una hora de cierre.");
      setDispoLoading(false);
      return;
    }
    if (dispoFormData.endTime <= dispoFormData.startTime) {
      setDispoError("La hora de cierre debe ser posterior a la de inicio.");
      setDispoLoading(false);
      return;
    }
    try {
      const payload = {
        date: dispoFormData.date,
        timeSlots: [
          {
            startTime: dispoFormData.startTime,
            endTime: dispoFormData.endTime,
          },
        ],
        createdBy: profile?.email || profile?.userName || "Admin",
      };
      await createAvailability(payload);
      setDispoSuccess("Fecha de reserva agregada exitosamente.");
      setShowDispoForm(false);
      setDispoFormData({ date: "", startTime: "", endTime: "" });
      loadAvailability();
      setTimeout(() => setDispoSuccess(""), 3000);
    } catch (err) {
      setDispoError(
        err.message || "Error al contactar a la API de Disponibilidad",
      );
    } finally {
      setDispoLoading(false);
    }
  };

  const handleAIPrediction = async () => {
    if (!aiSelectedProducts || aiSelectedProducts.length === 0) {
      setAiError("Por favor seleccione al menos un producto a analizar.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const productosPayload = [];
      for (const prodName of aiSelectedProducts) {
        const productoObj = inventarioLista.find((p) => p.nombre === prodName);
        if (!productoObj) continue;
        try {
          const historialReal = await getProductoHistorial(productoObj.id);
          if (historialReal && historialReal.length >= 2)
            productosPayload.push({
              producto: prodName,
              historial: historialReal,
            });
          else
            console.warn(
              `El producto ${prodName} no tiene historial suficiente.`,
            );
        } catch (e) {
          console.error(`No se pudo obtener el historial de ${prodName}`, e);
        }
      }
      if (productosPayload.length === 0)
        throw new Error(
          "Ninguno de los productos seleccionados tiene suficientes datos históricos.",
        );
      const payload = {
        meses_a_predecir: Number(aiMeses),
        productos: productosPayload,
      };
      const currentToken = localStorage.getItem("token") || "";
      const res = await fetch(
        "https://sigidai-modelmicroservice-production.up.railway.app/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("Falló la conexión con el motor de IA");
      const data = await res.json();
      setAiResults(data.resultados || []);
    } catch (err) {
      setAiError(
        err.message || "No se pudo generar la predicción. Intente más tarde.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearchAdmins = async (e) => {
    e.preventDefault();
    try {
      setActiveAdminsLoading(true);
      const data = await searchAdmins(searchAdminQuery);
      setActiveAdmins(data);
    } catch {
      setActiveAdminsError("Error al buscar administradores");
    } finally {
      setActiveAdminsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const todayISO = new Date().toISOString().split("T")[0];
  const activeItem = MENU_ITEMS.find((m) => m.id === activeSection);

  /* ─── Global calendar animation keyframes injected once ─── */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes calFadeIn {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className={`adm-layout ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          {!sidebarCollapsed && (
            <div className="adm-brand-text">
              <span className="adm-brand-icon">🍽️</span>
              <div>
                <p className="adm-brand-name">RestaurantApp</p>
                <p className="adm-brand-sub">Panel de Administración</p>
              </div>
            </div>
          )}
          <button
            className="adm-collapse-btn"
            onClick={() => setSidebarCollapsed((p) => !p)}
            title="Colapsar menú"
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>
        </div>
        <nav className="adm-nav">
          {!sidebarCollapsed && <p className="adm-nav-label">MÓDULOS</p>}
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`adm-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className="adm-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="adm-nav-label-text">{item.label}</span>
              )}
              {!sidebarCollapsed && activeSection === item.id && (
                <span className="adm-nav-active-dot" />
              )}
            </button>
          ))}
        </nav>
        <button
          className="adm-logout-btn"
          onClick={handleLogout}
          title="Cerrar sesión"
        >
          <span className="adm-nav-icon">🚪</span>
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar-title">
            <h1>{activeItem?.label}</h1>
          </div>
          <div className="adm-topbar-user">
            {profile ? (
              <>
                <div className="adm-user-info">
                  <p className="adm-user-name">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <p className="adm-user-email">{profile.email}</p>
                </div>
                <div
                  className="adm-avatar"
                  title={`${profile.firstName} ${profile.lastName}`}
                >
                  {getInitials(profile)}
                </div>
              </>
            ) : (
              <div className="adm-avatar">?</div>
            )}
          </div>
        </header>

        <main className="adm-content">
          {/* ══════════════════════════════════════════
              ESTADÍSTICAS
          ══════════════════════════════════════════ */}
          {activeSection === "estadisticas" && (
            <div
              className="panel-card"
              style={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="panel-card-header"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <h2>Panel de Estadísticas</h2>
                  <p>Resumen general del restaurante</p>
                </div>
              </div>
              {statsError && <div className="error-message">{statsError}</div>}
              {statsLoading ? (
                <div className="loading-state">Cargando estadísticas...</div>
              ) : (
                <>
                  {stats && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "20px",
                        marginBottom: "24px",
                      }}
                    >
                      {[
                        {
                          label: "Total Reservas",
                          value: stats.totalReservas,
                          color: "#111827",
                        },
                        {
                          label: "Reservas Hoy",
                          value: stats.reservasHoy,
                          color: "#059669",
                        },
                        {
                          label: "Total Empleados",
                          value: stats.totalEmpleados,
                          color: "#3b82f6",
                        },
                        {
                          label: "Prods. Bajo Stock",
                          value: stats.productosConBajoStock,
                          color:
                            stats.productosConBajoStock > 0
                              ? "#dc2626"
                              : "#6b7280",
                        },
                      ].map(({ label, value, color }) => (
                        <div
                          key={label}
                          style={{
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                            border: "1px solid #f3f4f6",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "14px",
                              color: "#6b7280",
                              marginBottom: "8px",
                            }}
                          >
                            {label}
                          </h3>
                          <p
                            style={{
                              fontSize: "32px",
                              fontWeight: "700",
                              color,
                            }}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {reservasHoy && (
                    <>
                      <h3
                        style={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#111827",
                          margin: "32px 0 16px",
                        }}
                      >
                        Detalles de Reservas (Hoy)
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(300px, 1fr))",
                          gap: "20px",
                        }}
                      >
                        <div
                          style={{
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                            border: "1px solid #f3f4f6",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "14px",
                              color: "#6b7280",
                              marginBottom: "8px",
                            }}
                          >
                            Total de Personas Hoy
                          </h3>
                          <p
                            style={{
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#8b5cf6",
                            }}
                          >
                            {reservasHoy.personasTotal}
                          </p>
                        </div>
                        <div
                          style={{
                            background: "#fff",
                            padding: "24px",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                            border: "1px solid #f3f4f6",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "14px",
                              color: "#6b7280",
                              marginBottom: "8px",
                            }}
                          >
                            Ingreso Estimado Hoy
                          </h3>
                          <p
                            style={{
                              fontSize: "32px",
                              fontWeight: "700",
                              color: "#d97706",
                            }}
                          >
                            $
                            {(
                              reservasHoy.ingresoEstimado || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              INVENTARIO
          ══════════════════════════════════════════ */}
          {activeSection === "inventario" && (
            <div
              className="panel-card"
              style={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="panel-card-header"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <h2>Resumen de Inventario</h2>
                  <p>Estado actual de los productos e insumos</p>
                </div>
              </div>
              {inventarioError && (
                <div className="error-message">{inventarioError}</div>
              )}
              {inventarioLoading ? (
                <div className="loading-state">Cargando inventario...</div>
              ) : inventario ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {Object.entries(inventario).map(([key, value]) => {
                    if (key === "fecha") return null;
                    if (typeof value === "object" && value !== null)
                      return null;
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    const isCurrency =
                      key.toLowerCase().includes("valor") ||
                      key.toLowerCase().includes("costo") ||
                      key.toLowerCase().includes("ingreso") ||
                      key.toLowerCase().includes("precio");
                    const displayValue =
                      isCurrency && typeof value === "number"
                        ? `$${value.toLocaleString()}`
                        : value;
                    return (
                      <div key={key} className="kpi-card">
                        <h3
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                            zIndex: 1,
                            position: "relative",
                          }}
                        >
                          {label}
                        </h3>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "800",
                            color: "#111827",
                            zIndex: 1,
                            position: "relative",
                          }}
                        >
                          {displayValue}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Listado */}
              <div
                className="panel-card"
                style={{ padding: "0", overflow: "hidden", marginTop: "24px" }}
              >
                <div
                  className="panel-card-header"
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}
                  >
                    Listado de Productos
                  </h3>
                  <button
                    onClick={() => setShowInventarioForm(true)}
                    className="action-btn primary"
                  >
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                      +
                    </span>{" "}
                    Nuevo Producto
                  </button>
                </div>
                {inventarioListaError && (
                  <div className="error-message">{inventarioListaError}</div>
                )}
                {inventarioListaLoading ? (
                  <div className="loading-state">
                    Cargando lista de inventario...
                  </div>
                ) : inventarioLista && inventarioLista.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th
                            style={{ textAlign: "left", padding: "16px 24px" }}
                          >
                            NOMBRE
                          </th>
                          <th
                            style={{ textAlign: "left", padding: "16px 24px" }}
                          >
                            CATEGORÍA
                          </th>
                          <th
                            style={{ textAlign: "right", padding: "16px 24px" }}
                          >
                            CANT. ACTUAL
                          </th>
                          <th
                            style={{ textAlign: "right", padding: "16px 24px" }}
                          >
                            CANT. MÍNIMA
                          </th>
                          <th
                            style={{ textAlign: "right", padding: "16px 24px" }}
                          >
                            PRECIO COSTO
                          </th>
                          <th
                            style={{ textAlign: "left", padding: "16px 24px" }}
                          >
                            PROVEEDOR
                          </th>
                          <th
                            style={{ textAlign: "left", padding: "16px 24px" }}
                          >
                            VENCIMIENTO
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventarioLista.map((item, idx) => (
                          <tr key={idx}>
                            <td
                              style={{
                                padding: "16px 24px",
                                fontWeight: "500",
                              }}
                            >
                              {item.nombre}
                            </td>
                            <td
                              style={{ padding: "16px 24px", color: "#6b7280" }}
                            >
                              {item.categoriaNombre || `ID: ${item.categoria}`}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "16px 24px",
                              }}
                            >
                              {item.cantidadActual} {item.unidad}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "16px 24px",
                                color:
                                  item.cantidadActual <= item.cantidadMinima
                                    ? "#dc2626"
                                    : "#6b7280",
                              }}
                            >
                              {item.cantidadMinima} {item.unidad}
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                padding: "16px 24px",
                              }}
                            >
                              ${(item.precioCosto || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: "16px 24px" }}>
                              {item.proveedor || "N/A"}
                            </td>
                            <td style={{ padding: "16px 24px" }}>
                              {item.fechaVencimiento
                                ? new Date(
                                    item.fechaVencimiento,
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No hay productos en el inventario.</p>
                  </div>
                )}
              </div>

              {/* ── Inventario Modal ── */}
              {showInventarioForm && (
                <div
                  className="modal-backdrop"
                  onClick={() => setShowInventarioForm(false)}
                >
                  <div
                    className="modal-box"
                    style={{
                      maxWidth: "750px",
                      maxHeight: "90vh",
                      overflowY: "auto",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="modal-header"
                      style={{ padding: "24px 28px", borderBottom: "none" }}
                    >
                      <div>
                        <h2>Nuevo Producto de Inventario</h2>
                        <p>
                          Completa los datos detallados para registrar el
                          artículo
                        </p>
                      </div>
                      <button
                        className="modal-close"
                        onClick={() => setShowInventarioForm(false)}
                      >
                        ✕
                      </button>
                    </div>
                    {inventarioFormError && (
                      <div
                        className="error-message"
                        style={{ margin: "0 28px 16px" }}
                      >
                        {inventarioFormError}
                      </div>
                    )}
                    <form
                      onSubmit={handleCreateInventario}
                      className="config-form"
                      style={{ padding: "0 28px 24px" }}
                    >
                      <div className="form-section">
                        <div className="section-title">
                          <span>📋</span> Información General
                        </div>
                        <div className="form-row-2">
                          <div className="form-group">
                            <label>Nombre del Producto *</label>
                            <input
                              type="text"
                              placeholder="Ej: Bebida Cola 2L"
                              value={inventarioFormData.nombre}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  nombre: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Categoría *</label>
                            <select
                              value={inventarioFormData.categoria}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  categoria: e.target.value,
                                })
                              }
                              required
                              className="modern-select"
                            >
                              <option value="">
                                Seleccione una categoría...
                              </option>
                              {CATEGORIAS_INVENTARIO.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Descripción</label>
                          <input
                            type="text"
                            placeholder="Breve descripción del artículo..."
                            value={inventarioFormData.descripcion}
                            onChange={(e) =>
                              setInventarioFormData({
                                ...inventarioFormData,
                                descripcion: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="form-section">
                        <div className="section-title">
                          <span>📦</span> Control de Inventario
                        </div>
                        <div className="form-row-3">
                          <div className="form-group">
                            <label>Cantidad Actual *</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={inventarioFormData.cantidadActual}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  cantidadActual: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Cant. Mínima (Alerta) *</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={inventarioFormData.cantidadMinima}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  cantidadMinima: e.target.value,
                                })
                              }
                              required
                            />
                            <span className="input-hint">
                              Stock mínimo recomendable
                            </span>
                          </div>
                          <div className="form-group">
                            <label>Cant. Máxima (Límite) *</label>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={inventarioFormData.cantidadMaxima}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  cantidadMaxima: e.target.value,
                                })
                              }
                              required
                            />
                            <span className="input-hint">
                              Límite según capacidad
                            </span>
                          </div>
                        </div>
                        <div className="form-row-2" style={{ marginBottom: 0 }}>
                          <div className="form-group">
                            <label>Unidad de Medida *</label>
                            <select
                              value={inventarioFormData.unidad}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  unidad: e.target.value,
                                })
                              }
                              required
                              className="modern-select"
                            >
                              <option value="unidades">Unidades</option>
                              <option value="kg">Kilogramos</option>
                              <option value="litros">Litros</option>
                              <option value="cajas">Cajas</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div
                        className="form-section"
                        style={{ marginBottom: "16px" }}
                      >
                        <div className="section-title">
                          <span>💰</span> Costos y Proveedor
                        </div>
                        <div className="form-row-2">
                          <div className="form-group">
                            <label>Precio Costo ($) *</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={inventarioFormData.precioCosto}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  precioCosto: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Proveedor Recomendado</label>
                            <input
                              type="text"
                              placeholder="Distribuidora principal..."
                              value={inventarioFormData.proveedor}
                              onChange={(e) =>
                                setInventarioFormData({
                                  ...inventarioFormData,
                                  proveedor: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        {/* ✅ CALENDAR for expiry date */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <CalendarPicker
                            label="Fecha de Vencimiento (Opcional)"
                            value={inventarioFormData.fechaVencimiento}
                            onChange={(val) =>
                              setInventarioFormData({
                                ...inventarioFormData,
                                fechaVencimiento: val,
                              })
                            }
                            minDate={todayISO}
                            placeholder="Sin fecha de vencimiento"
                          />
                        </div>
                      </div>

                      <div
                        className="modal-footer"
                        style={{
                          padding: "20px 0 0",
                          border: "none",
                          marginTop: "0",
                        }}
                      >
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setShowInventarioForm(false)}
                          disabled={inventarioFormLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="submit-button"
                          disabled={inventarioFormLoading}
                          style={{ fontSize: "15px", padding: "12px 24px" }}
                        >
                          {inventarioFormLoading
                            ? "Guardando..."
                            : "Guardar Producto"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* AI Floating Button */}
              <button
                className="ai-floating-btn"
                onClick={() => setShowAIModal(true)}
                title="Predicción de Demanda IA"
              >
                ✨ <span>Predicción IA</span>
              </button>

              {/* AI PREDICTION MODAL */}
              {showAIModal && (
                <div
                  className="modal-backdrop"
                  onClick={() => setShowAIModal(false)}
                >
                  <div
                    className="modal-box"
                    style={{ maxWidth: "600px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <div>
                        <h2>Predicción de Demanda - IA</h2>
                        <p>
                          Analiza el historial para proyectar sugerencias
                          futuras.
                        </p>
                      </div>
                      <button
                        className="modal-close"
                        onClick={() => setShowAIModal(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ padding: "20px 28px" }}>
                      <div
                        className="form-row-2"
                        style={{ marginBottom: "12px" }}
                      >
                        <div className="form-group">
                          <label>Productos a Analizar *</label>
                          <select
                            className="modern-select"
                            defaultValue=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val && !aiSelectedProducts.includes(val))
                                setAiSelectedProducts([
                                  ...aiSelectedProducts,
                                  val,
                                ]);
                              e.target.value = "";
                            }}
                          >
                            <option value="">Añadir producto...</option>
                            {inventarioLista.map((item, idx) => (
                              <option key={idx} value={item.nombre}>
                                {item.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Meses a Predecir</label>
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={aiMeses}
                            onChange={(e) => setAiMeses(e.target.value)}
                          />
                        </div>
                      </div>
                      {aiSelectedProducts.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "20px",
                          }}
                        >
                          {aiSelectedProducts.map((prod) => (
                            <span
                              key={prod}
                              style={{
                                background: "#ede9fe",
                                color: "#6d28d9",
                                padding: "6px 12px",
                                borderRadius: "16px",
                                fontSize: "13px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontWeight: "500",
                              }}
                            >
                              {prod}
                              <button
                                type="button"
                                onClick={() =>
                                  setAiSelectedProducts(
                                    aiSelectedProducts.filter(
                                      (p) => p !== prod,
                                    ),
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#6d28d9",
                                  cursor: "pointer",
                                  padding: "0",
                                  fontSize: "16px",
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={handleAIPrediction}
                        className="submit-button"
                        style={{
                          width: "100%",
                          padding: "16px",
                          fontSize: "15px",
                        }}
                        disabled={aiLoading || aiSelectedProducts.length === 0}
                      >
                        {aiLoading
                          ? "Calculando predicción..."
                          : "🔮 Generar Predicción ahora"}
                      </button>
                      {aiError && (
                        <div
                          className="error-message"
                          style={{ marginTop: "16px" }}
                        >
                          {aiError}
                        </div>
                      )}
                      {aiResults && !aiLoading && (
                        <div
                          className="ai-results-list"
                          style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "15px",
                              color: "#1e293b",
                              marginBottom: "12px",
                            }}
                          >
                            Proyecciones estimadas ({aiMeses} meses)
                          </h3>
                          {aiResults.map((group, grpIdx) => (
                            <div
                              key={grpIdx}
                              style={{
                                marginBottom: "16px",
                                background: "#f8fafc",
                                padding: "16px",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: "14px",
                                  color: "#6d28d9",
                                  margin: "0 0 12px",
                                  fontWeight: "bold",
                                }}
                              >
                                {group.producto}
                              </h4>
                              {group.predicciones.map((res, i) => (
                                <div
                                  className="ai-result-card"
                                  key={i}
                                  style={{
                                    marginBottom: "8px",
                                    background: "white",
                                  }}
                                >
                                  <span className="ai-result-date">
                                    {res.fecha}
                                  </span>
                                  <span className="ai-result-qty">
                                    {Number(res.cantidad_estimada).toFixed(1)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              AUDITORÍA
          ══════════════════════════════════════════ */}
          {activeSection === "auditoria" && (
            <div
              className="panel-card"
              style={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="panel-card-header"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div>
                    <h2>Auditoría de Actividades</h2>
                    <p>Registro de las acciones recientes del sistema</p>
                  </div>
                  <button
                    onClick={loadAuditoria}
                    className="action-btn primary"
                    disabled={auditoriaLoading}
                  >
                    {auditoriaLoading ? "⏳ Actualizando..." : "🔄 Actualizar"}
                  </button>
                </div>
              </div>
              {auditoriaError && (
                <div className="error-message">{auditoriaError}</div>
              )}
              <div
                className="panel-card"
                style={{ padding: "0", overflow: "hidden" }}
              >
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "16px 24px" }}>
                          FECHA
                        </th>
                        <th style={{ textAlign: "left", padding: "16px 24px" }}>
                          USUARIO
                        </th>
                        <th style={{ textAlign: "left", padding: "16px 24px" }}>
                          ACTIVIDAD
                        </th>
                        <th style={{ textAlign: "left", padding: "16px 24px" }}>
                          IP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditoriaActividades.length > 0 ? (
                        auditoriaActividades.map((actividad, idx) => {
                          const fecha = new Date(actividad.fecha);
                          return (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: "16px 24px",
                                  color: "#6b7280",
                                  fontSize: "14px",
                                }}
                              >
                                {fecha.toLocaleDateString()}{" "}
                                {fecha.toLocaleTimeString()}
                              </td>
                              <td
                                style={{
                                  padding: "16px 24px",
                                  fontWeight: "600",
                                  color: "#111827",
                                }}
                              >
                                {actividad.usuario}
                              </td>
                              <td style={{ padding: "16px 24px" }}>
                                {actividad.actividad}
                              </td>
                              <td
                                style={{
                                  padding: "16px 24px",
                                  fontFamily: "monospace",
                                  color: "#4b5563",
                                }}
                              >
                                {actividad.ip}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            style={{
                              textAlign: "center",
                              padding: "32px",
                              color: "#6b7280",
                            }}
                          >
                            {auditoriaLoading
                              ? "Cargando registros..."
                              : "No hay registros de auditoría recientes."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              REPORTE VENTAS — con DateRangePicker
          ══════════════════════════════════════════ */}
          {activeSection === "reportes_ventas" && (
            <div
              className="panel-card"
              style={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="panel-card-header"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h2>Reporte de Ventas</h2>
                    <p>Consulta las ventas y reservas en un rango de fechas</p>
                  </div>

                  {/* ✅ CALENDAR RANGE PICKER for sales filter */}
                  <form onSubmit={handleFiltrarVentas}>
                    <DateRangePicker
                      startDate={filtroVentas.fechaInicio}
                      endDate={filtroVentas.fechaFin}
                      onStartChange={(val) =>
                        setFiltroVentas({ ...filtroVentas, fechaInicio: val })
                      }
                      onEndChange={(val) =>
                        setFiltroVentas({ ...filtroVentas, fechaFin: val })
                      }
                    />
                    <div
                      style={{
                        marginTop: "16px",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="submit"
                        className="action-btn primary"
                        style={{ padding: "10px 28px" }}
                        disabled={reporteVentasLoading}
                      >
                        {reporteVentasLoading
                          ? "Cargando..."
                          : "🔍 Filtrar ventas"}
                      </button>
                      {(filtroVentas.fechaInicio || filtroVentas.fechaFin) && (
                        <button
                          type="button"
                          style={{
                            ...styles.calTodayBtn,
                            padding: "10px 20px",
                            fontSize: "13px",
                          }}
                          onClick={() => {
                            setFiltroVentas({ fechaInicio: "", fechaFin: "" });
                            loadReporteVentas("", "");
                          }}
                        >
                          Limpiar filtro
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {reporteVentasError && (
                <div className="error-message">{reporteVentasError}</div>
              )}
              {reporteVentasLoading ? (
                <div className="loading-state">
                  Cargando reporte de ventas...
                </div>
              ) : reporteVentas ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    {[
                      {
                        label: "Total Ventas",
                        value: `$${(reporteVentas.totalVentas || 0).toLocaleString()}`,
                        color: "#10b981",
                      },
                      {
                        label: "Total Reservas",
                        value: reporteVentas.totalReservas || 0,
                        color: "#3b82f6",
                      },
                      {
                        label: "Promedio Venta Diaria",
                        value: `$${(reporteVentas.promedioVentaDiaria || 0).toLocaleString()}`,
                        color: "#8b5cf6",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        style={{
                          background: "#fff",
                          padding: "24px",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                          border: "1px solid #f3f4f6",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            marginBottom: "8px",
                          }}
                        >
                          {label}
                        </h3>
                        <p
                          style={{ fontSize: "32px", fontWeight: "700", color }}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {reporteVentas.ventasPorDia &&
                    reporteVentas.ventasPorDia.length > 0 && (
                      <div
                        className="panel-card"
                        style={{ padding: "0", overflow: "hidden" }}
                      >
                        <div
                          className="panel-card-header"
                          style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              margin: 0,
                            }}
                          >
                            Ventas Detalladas por Día
                          </h3>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "16px 24px",
                                  }}
                                >
                                  FECHA
                                </th>
                                <th
                                  style={{
                                    textAlign: "right",
                                    padding: "16px 24px",
                                  }}
                                >
                                  CANTIDAD RESERVAS
                                </th>
                                <th
                                  style={{
                                    textAlign: "right",
                                    padding: "16px 24px",
                                  }}
                                >
                                  MONTO RECAUDADO
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {reporteVentas.ventasPorDia.map((venta, idx) => (
                                <tr key={idx}>
                                  <td
                                    style={{
                                      padding: "16px 24px",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {new Date(venta.fecha).toLocaleDateString(
                                      "es-ES",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      },
                                    )}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      padding: "16px 24px",
                                    }}
                                  >
                                    {venta.cantidadReservas || 0}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      padding: "16px 24px",
                                      fontWeight: "600",
                                      color: "#10b981",
                                    }}
                                  >
                                    $
                                    {(
                                      venta.montoRecaudado || 0
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  {reporteVentas.ventasPorDia &&
                    reporteVentas.ventasPorDia.length === 0 && (
                      <div className="empty-state">
                        <p>
                          No se encontraron ventas registradas en el período
                          seleccionado.
                        </p>
                      </div>
                    )}
                </>
              ) : null}
            </div>
          )}

          {/* ══════════════════════════════════════════
              PRESTADORES
          ══════════════════════════════════════════ */}
          {activeSection === "prestadores" && (
            <div
              className="panel-card"
              style={{
                background: "transparent",
                boxShadow: "none",
                padding: 0,
              }}
            >
              <div
                className="panel-card-header"
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <h2>Prestadores Activos</h2>
                  <p>Resumen de empleados presentes y turnos asignados</p>
                </div>
              </div>
              {prestadoresError && (
                <div className="error-message">{prestadoresError}</div>
              )}
              {prestadoresLoading ? (
                <div className="loading-state">Cargando prestadores...</div>
              ) : prestadores ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "20px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        padding: "24px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                        border: "1px solid #f3f4f6",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          marginBottom: "8px",
                        }}
                      >
                        Empleados Presentes Hoy
                      </h3>
                      <p
                        style={{
                          fontSize: "36px",
                          fontWeight: "700",
                          color: "#0ea5e9",
                        }}
                      >
                        {prestadores.empleadosPresentes}
                      </p>
                    </div>
                  </div>
                  {prestadores.turnosPorDepartamento &&
                    prestadores.turnosPorDepartamento.length > 0 && (
                      <div
                        className="panel-card"
                        style={{ padding: "0", overflow: "hidden" }}
                      >
                        <div
                          className="panel-card-header"
                          style={{
                            padding: "20px 24px",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              margin: 0,
                            }}
                          >
                            Turnos por Departamento
                          </h3>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "16px 24px",
                                  }}
                                >
                                  DEPARTAMENTO
                                </th>
                                <th
                                  style={{
                                    textAlign: "right",
                                    padding: "16px 24px",
                                  }}
                                >
                                  EMPLEADOS ASIGNADOS
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {prestadores.turnosPorDepartamento.map(
                                (turno, idx) => (
                                  <tr key={idx}>
                                    <td
                                      style={{
                                        padding: "16px 24px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {turno.departamento}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        padding: "16px 24px",
                                      }}
                                    >
                                      <span
                                        className="badge badge-gray"
                                        style={{ fontSize: "14px" }}
                                      >
                                        {turno.cantidad}
                                      </span>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  {prestadores.turnosPorDepartamento &&
                    prestadores.turnosPorDepartamento.length === 0 && (
                      <div className="empty-state">
                        <p>Aún no hay asignación de turnos registrada hoy</p>
                      </div>
                    )}
                </>
              ) : null}
            </div>
          )}

          {/* ══════════════════════════════════════════
              CONFIGURACIÓN
          ══════════════════════════════════════════ */}
          {activeSection === "configuracion" && (
            <>
              <div className="panel-card">
                <div className="panel-card-header">
                  <div>
                    <h2>Configuración actual</h2>
                    <p>Parámetros operativos del restaurante</p>
                  </div>
                  <button
                    className="add-button"
                    onClick={() => setShowConfigForm((p) => !p)}
                  >
                    {showConfigForm ? "✕ Cancelar" : "✏️ Editar"}
                  </button>
                </div>
                {configError && (
                  <div className="error-message">{configError}</div>
                )}
                {configSuccess && (
                  <div className="success-message">{configSuccess}</div>
                )}
                {configLoading && !config.capacidadMaxima ? (
                  <div className="loading-state">Cargando configuración...</div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>CAPACIDAD MÁXIMA</th>
                          <th>HORA APERTURA</th>
                          <th>HORA CIERRE</th>
                          <th>TIEMPO PROM. MESA (min)</th>
                          <th>MARGEN GANANCIA (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>{config.capacidadMaxima}</strong> personas
                          </td>
                          <td>{config.horaApertura}:00 h</td>
                          <td>{config.horaCierre}:00 h</td>
                          <td>{config.tiempoPromedioMesa} min</td>
                          <td>{config.margenGanancia}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {showConfigForm && (
                <div
                  className="modal-backdrop"
                  onClick={() => setShowConfigForm(false)}
                >
                  <div
                    className="modal-box"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <div>
                        <h2>Editar configuración</h2>
                        <p>Modifica los valores y guarda los cambios</p>
                      </div>
                      <button
                        className="modal-close"
                        onClick={() => setShowConfigForm(false)}
                      >
                        ✕
                      </button>
                    </div>
                    <form onSubmit={handleConfigSubmit} className="config-form">
                      <div className="form-row-3">
                        <div className="form-group">
                          <label htmlFor="capacidadMaxima">
                            Capacidad máxima
                          </label>
                          <input
                            type="number"
                            id="capacidadMaxima"
                            name="capacidadMaxima"
                            value={config.capacidadMaxima}
                            onChange={handleConfigChange}
                            min="1"
                            required
                          />
                        </div>
                        {/* ✅ TIME PICKERS for open/close hours */}
                        <div className="form-group">
                          <label
                            style={{
                              display: "block",
                              marginBottom: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#374151",
                            }}
                          >
                            Hora de Apertura
                          </label>
                          <select
                            name="horaApertura"
                            value={config.horaApertura}
                            onChange={handleConfigChange}
                            className="modern-select"
                            required
                          >
                            <option value="">Seleccionar...</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0
                                  ? "12:00 AM"
                                  : i < 12
                                    ? `${i}:00 AM`
                                    : i === 12
                                      ? "12:00 PM"
                                      : `${i - 12}:00 PM`}
                              </option>
                            ))}
                          </select>
                          <span className="input-hint">
                            Hora de apertura del restaurante
                          </span>
                        </div>
                        <div className="form-group">
                          <label
                            style={{
                              display: "block",
                              marginBottom: "6px",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "#374151",
                            }}
                          >
                            Hora de Cierre
                          </label>
                          <select
                            name="horaCierre"
                            value={config.horaCierre}
                            onChange={handleConfigChange}
                            className="modern-select"
                            required
                          >
                            <option value="">Seleccionar...</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i === 0
                                  ? "12:00 AM"
                                  : i < 12
                                    ? `${i}:00 AM`
                                    : i === 12
                                      ? "12:00 PM"
                                      : `${i - 12}:00 PM`}
                              </option>
                            ))}
                          </select>
                          <span className="input-hint">
                            Hora de cierre del restaurante
                          </span>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="tiempoPromedioMesa">
                            Tiempo promedio por mesa
                          </label>
                          <input
                            type="number"
                            id="tiempoPromedioMesa"
                            name="tiempoPromedioMesa"
                            value={config.tiempoPromedioMesa}
                            onChange={handleConfigChange}
                            min="1"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="margenGanancia">
                            Margen de ganancia (%)
                          </label>
                          <input
                            type="number"
                            id="margenGanancia"
                            name="margenGanancia"
                            value={config.margenGanancia}
                            onChange={handleConfigChange}
                            min="0"
                            step="0.5"
                            required
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setShowConfigForm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="submit-button"
                          disabled={configLoading}
                        >
                          {configLoading
                            ? "Guardando..."
                            : "💾 Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════
              DISPONIBILIDAD — con CalendarPicker y TimePicker
          ══════════════════════════════════════════ */}
          {activeSection === "disponibilidad" && (
            <div className="panel-card">
              <div className="panel-card-header">
                <div>
                  <h2>Fechas de Reserva</h2>
                  <p>Inyecta fechas manuales con rangos horarios al sistema</p>
                </div>
                <button
                  className="add-button"
                  onClick={() => setShowDispoForm(!showDispoForm)}
                >
                  {showDispoForm ? "✕ Cancelar" : "+ Agregar Fecha"}
                </button>
              </div>

              {dispoSuccess && (
                <div
                  className="success-message"
                  style={{ margin: "16px 24px" }}
                >
                  {dispoSuccess}
                </div>
              )}
              {dispoError && (
                <div className="error-message" style={{ margin: "16px 24px" }}>
                  {dispoError}
                </div>
              )}

              {showDispoForm && (
                <div className="inline-form" style={{ marginTop: "20px" }}>
                  <h3
                    style={{
                      marginBottom: "20px",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    📅 Nueva Disponibilidad
                  </h3>
                  <form onSubmit={handleCreateAvailability}>
                    {/* ✅ FULL CALENDAR PICKER for date selection */}
                    <div style={{ marginBottom: "24px" }}>
                      <CalendarPicker
                        label="Fecha de Reserva *"
                        value={dispoFormData.date}
                        onChange={(val) =>
                          setDispoFormData({ ...dispoFormData, date: val })
                        }
                        minDate={todayISO}
                        placeholder="Seleccionar día del calendario..."
                      />
                    </div>

                    {/* ✅ TIME PICKERS for start/end */}
                    <div
                      className="form-row-2"
                      style={{ marginBottom: "20px", alignItems: "flex-start" }}
                    >
                      <TimePicker
                        label="Hora de Apertura *"
                        value={dispoFormData.startTime}
                        onChange={(val) =>
                          setDispoFormData({ ...dispoFormData, startTime: val })
                        }
                        placeholder="Seleccionar hora de inicio..."
                      />
                      <TimePicker
                        label="Hora de Cierre *"
                        value={dispoFormData.endTime}
                        onChange={(val) =>
                          setDispoFormData({ ...dispoFormData, endTime: val })
                        }
                        placeholder="Seleccionar hora de fin..."
                      />
                    </div>

                    {/* Preview */}
                    {dispoFormData.date &&
                      dispoFormData.startTime &&
                      dispoFormData.endTime && (
                        <div
                          style={{
                            background: "#f0fdf4",
                            border: "1px solid #bbf7d0",
                            borderRadius: "10px",
                            padding: "14px 18px",
                            marginBottom: "20px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>✅</span>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: "700",
                                color: "#15803d",
                                fontSize: "14px",
                              }}
                            >
                              Vista previa de la reserva
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                color: "#166534",
                                fontSize: "13px",
                              }}
                            >
                              {new Date(
                                dispoFormData.date + "T00:00:00",
                              ).toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}{" "}
                              · {dispoFormData.startTime} a{" "}
                              {dispoFormData.endTime}
                            </p>
                          </div>
                        </div>
                      )}

                    <div
                      className="modal-footer"
                      style={{ border: "none", padding: 0, marginTop: "4px" }}
                    >
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={dispoLoading}
                      >
                        {dispoLoading
                          ? "Guardando Disponibilidad..."
                          : "Guardar Fecha"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Listado */}
              <div style={{ marginTop: "24px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    padding: "0 24px",
                    marginBottom: "12px",
                  }}
                >
                  Fechas configuradas actualmente
                </h3>
                {availabilityError && (
                  <div className="error-message" style={{ margin: "0 24px" }}>
                    {availabilityError}
                  </div>
                )}
                {availabilityLoading ? (
                  <div className="loading-state">Cargando fechas...</div>
                ) : availabilityList.length === 0 ? (
                  <div className="empty-state">
                    No hay fechas de disponibilidad registradas
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>FECHA</th>
                          <th>HORARIO (INICIO - FIN)</th>
                          <th>CREADO POR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availabilityList.map((item, idx) => (
                          <tr key={item.id || item.date || idx}>
                            <td>
                              <strong>
                                {new Date(item.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </strong>
                            </td>
                            <td>
                              {item.timeSlots?.map((slot, i) => (
                                <div
                                  key={i}
                                  style={{ marginBottom: i > 0 ? "4px" : "0" }}
                                >
                                  <span
                                    className="badge"
                                    style={{
                                      background: "#f3f4f6",
                                      color: "#374151",
                                    }}
                                  >
                                    {slot.startTime} a {slot.endTime}
                                  </span>
                                </div>
                              ))}
                            </td>
                            <td>{item.createdBy || "Sistema"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════
              PERÍODOS — con DateRangePicker
          ══════════════════════════════════════════ */}
          {activeSection === "periodos" && (
            <div className="panel-card">
              <div className="panel-card-header">
                <div>
                  <p>
                    Genera predicciones de demanda para habilitar fechas de
                    reserva
                  </p>
                </div>
                <button
                  className="add-button"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "✕ Cancelar" : "+ Nuevo período"}
                </button>
              </div>

              {showForm && (
                <div className="inline-form">
                  <h3 style={{ marginBottom: "20px" }}>
                    Generar nuevo período
                  </h3>
                  {formError && (
                    <div className="error-message">{formError}</div>
                  )}
                  <form onSubmit={handleCreatePrediccion}>
                    {/* ✅ CALENDAR RANGE PICKER for period selection */}
                    <div style={{ marginBottom: "24px" }}>
                      <DateRangePicker
                        startDate={formData.periodoInicio}
                        endDate={formData.periodoFin}
                        onStartChange={(val) => {
                          setFormData({ ...formData, periodoInicio: val });
                          setFormError("");
                        }}
                        onEndChange={(val) => {
                          setFormData({ ...formData, periodoFin: val });
                          setFormError("");
                        }}
                        label="Rango del período *"
                      />
                    </div>

                    {/* Preview */}
                    {formData.periodoInicio && formData.periodoFin && (
                      <div
                        style={{
                          background: "#faf5ff",
                          border: "1px solid #e9d5ff",
                          borderRadius: "10px",
                          padding: "12px 16px",
                          marginBottom: "20px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "#7e22ce",
                            fontWeight: "600",
                          }}
                        >
                          📆 Período:{" "}
                          {new Date(
                            formData.periodoInicio + "T00:00:00",
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          →{" "}
                          {new Date(
                            formData.periodoFin + "T00:00:00",
                          ).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}

                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="consideraFestivos"
                          checked={formData.consideraFestivos}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              consideraFestivos: e.target.checked,
                            })
                          }
                        />
                        <span>Considerar festivos</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="consideraTendencias"
                          checked={formData.consideraTendencias}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              consideraTendencias: e.target.checked,
                            })
                          }
                        />
                        <span>Considerar tendencias históricas</span>
                      </label>
                    </div>
                    <div className="form-actions-right">
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={formLoading}
                      >
                        {formLoading ? "Generando..." : "Generar predicción"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {predError && <div className="error-message">{predError}</div>}
              {predLoading ? (
                <div className="loading-state">Cargando períodos...</div>
              ) : predicciones.length === 0 ? (
                <div className="empty-state">
                  <p>No hay períodos generados todavía</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>PERÍODO INICIO</th>
                        <th>PERÍODO FIN</th>
                        <th>FESTIVOS</th>
                        <th>TENDENCIAS</th>
                        <th>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predicciones.map((pred, i) => (
                        <tr key={pred.id || i}>
                          <td>{i + 1}</td>
                          <td>
                            {new Date(pred.periodoInicio).toLocaleDateString(
                              "es-ES",
                            )}
                          </td>
                          <td>
                            {new Date(pred.periodoFin).toLocaleDateString(
                              "es-ES",
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge ${pred.consideraFestivos ? "badge-green" : "badge-gray"}`}
                            >
                              {pred.consideraFestivos ? "Sí" : "No"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${pred.consideraTendencias ? "badge-green" : "badge-gray"}`}
                            >
                              {pred.consideraTendencias ? "Sí" : "No"}
                            </span>
                          </td>
                          <td>
                            <span className="availability-badge available">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              ADMINISTRADORES
          ══════════════════════════════════════════ */}
          {activeSection === "administradores" && (
            <div className="panel-card">
              <div className="panel-card-header">
                <div>
                  <p>Gestiona los usuarios con acceso total al sistema</p>
                </div>
                <button
                  className="add-button"
                  onClick={() => setShowAdminForm(true)}
                >
                  + Nuevo administrador
                </button>
              </div>
              {adminsError && (
                <div className="error-message">{adminsError}</div>
              )}
              {adminsLoading ? (
                <div className="loading-state">Cargando administradores...</div>
              ) : admins.length === 0 ? (
                <div className="empty-state">
                  <p>No hay administradores registrados</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>NIVEL DE ACCESO</th>
                        <th>ÁREA RESPONSABILIDAD</th>
                        <th>ESTADO</th>
                        <th>ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id}>
                          <td>
                            <strong>{admin.usuarioNombre}</strong>
                          </td>
                          <td>{admin.usuarioEmail}</td>
                          <td>
                            <span className="badge badge-gray">
                              {admin.nivelAcceso}
                            </span>
                          </td>
                          <td>{admin.areaResponsabilidad || "-"}</td>
                          <td>
                            <span
                              className={`availability-badge ${admin.activo ? "available" : "full"}`}
                            >
                              {admin.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="modal-close"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                color: "#dc2626",
                                borderColor: "#fca5a5",
                                background: "#fee2e2",
                              }}
                              title="Eliminar administrador"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showAdminForm && (
                <div
                  className="modal-backdrop"
                  onClick={() => setShowAdminForm(false)}
                >
                  <div
                    className="modal-box"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <div>
                        <h2>Nuevo Administrador</h2>
                        <p>Completa los datos para registrar un super admin</p>
                      </div>
                      <button
                        className="modal-close"
                        onClick={() => setShowAdminForm(false)}
                      >
                        ✕
                      </button>
                    </div>
                    {adminFormError && (
                      <div
                        className="error-message"
                        style={{ margin: "16px 28px 0" }}
                      >
                        {adminFormError}
                      </div>
                    )}
                    <form onSubmit={handleCreateAdmin} className="config-form">
                      <div className="form-row">
                        <div
                          className="form-group"
                          style={{ gridColumn: "span 2" }}
                        >
                          <label htmlFor="usuarioNombreDisplay">
                            Usuario a promover
                          </label>
                          <input
                            type="text"
                            id="usuarioNombreDisplay"
                            value={
                              profile
                                ? `${profile.firstName || ""} ${profile.lastName || ""} (${profile.email || profile.userName || "Local"})`
                                : "Cargando..."
                            }
                            disabled
                            className="disabled-input"
                          />
                          <span className="input-hint">
                            El identificador (
                            {profile?.id || profile?.userName || "Auto"}) se
                            enviará automáticamente.
                          </span>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Nivel de Acceso</label>
                          <input
                            type="text"
                            value={adminFormData.nivelAcceso}
                            disabled
                          />
                          <span className="input-hint">
                            Asignado automáticamente
                          </span>
                        </div>
                        <div className="form-group">
                          <label>Área Responsabilidad</label>
                          <input
                            type="text"
                            value={adminFormData.areaResponsabilidad}
                            disabled
                          />
                          <span className="input-hint">
                            Asignado automáticamente
                          </span>
                        </div>
                      </div>
                      <div
                        className="checkbox-row"
                        style={{ padding: "4px 0 10px" }}
                      >
                        <label
                          className="checkbox-label"
                          style={{ opacity: 0.7, cursor: "not-allowed" }}
                        >
                          <input
                            type="checkbox"
                            checked={adminFormData.activo}
                            disabled
                          />
                          <span>Usuario Activo (por defecto)</span>
                        </label>
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setShowAdminForm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="submit-button"
                          disabled={adminFormLoading}
                        >
                          {adminFormLoading
                            ? "Creando..."
                            : "Crear administrador"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════
              ADMINISTRADORES ACTIVOS
          ══════════════════════════════════════════ */}
          {activeSection === "administradores_activos" && (
            <div className="panel-card">
              <div className="panel-card-header">
                <div>
                  <p>Listado de Super Administradores actualmente activos</p>
                </div>
                <form
                  onSubmit={handleSearchAdmins}
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchAdminQuery}
                    onChange={(e) => setSearchAdminQuery(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                      width: "200px",
                    }}
                  />
                  <button
                    type="submit"
                    className="submit-button"
                    style={{ padding: "8px 16px", borderRadius: "8px" }}
                  >
                    Buscar
                  </button>
                </form>
              </div>
              {activeAdminsError && (
                <div className="error-message">{activeAdminsError}</div>
              )}
              {activeAdminsLoading ? (
                <div className="loading-state">
                  Cargando administradores activos...
                </div>
              ) : activeAdmins.length === 0 ? (
                <div className="empty-state">
                  <p>No hay administradores activos en este momento</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>NOMBRE</th>
                        <th>EMAIL</th>
                        <th>NIVEL DE ACCESO</th>
                        <th>ÁREA RESPONSABILIDAD</th>
                        <th>ESTADO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAdmins.map((admin) => (
                        <tr key={admin.id}>
                          <td>
                            <strong>{admin.usuarioNombre}</strong>
                          </td>
                          <td>{admin.usuarioEmail}</td>
                          <td>
                            <span className="badge badge-gray">
                              {admin.nivelAcceso}
                            </span>
                          </td>
                          <td>{admin.areaResponsabilidad || "-"}</td>
                          <td>
                            <span className="availability-badge available">
                              Activo
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="adm-footer">
          © 2026 RestaurantApp · Panel de Administración · Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
