import { useState, useEffect, useRef } from "react";
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

// Genera las iniciales del nombre para el avatar
function getInitials(profile) {
  if (!profile) return "?";
  const f = profile.firstName?.[0] || "";
  const l = profile.lastName?.trim()[0] || "";
  return (f + l).toUpperCase() || "?";
}

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

          if (historialReal && historialReal.length >= 2) {
            productosPayload.push({
              producto: prodName,
              historial: historialReal,
            });
          } else {
            console.warn(
              `El producto ${prodName} no tiene historial suficiente (mínimo 2 meses).`,
            );
          }
        } catch (e) {
          console.error(`No se pudo obtener el historial de ${prodName}`, e);
        }
      }

      if (productosPayload.length === 0) {
        throw new Error(
          "Ninguno de los productos seleccionados tiene suficientes datos históricos (se requieren mínimo 2 meses).",
        );
      }

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

      if (data.resultados) {
        setAiResults(data.resultados);
      } else {
        setAiResults([]);
      }
    } catch (err) {
      setAiError(
        err.message || "No se pudo generar la predicción. Intente más tarde.",
      );
    } finally {
      setAiLoading(false);
    }
  };

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

  const loadAvailability = async () => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    try {
      const data = await getAvailabilityList();
      setAvailabilityList(data);
    } catch (err) {
      setAvailabilityError("Error al leer listado de fechas de reserva");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    setDispoLoading(true);
    setDispoError("");
    setDispoSuccess("");
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

  const handleFiltrarVentas = (e) => {
    e.preventDefault();
    loadReporteVentas(filtroVentas.fechaInicio, filtroVentas.fechaFin);
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
      // Si la respuesta es directamente un arreglo, lo asignamos. Si viene envuelto en .data y .data es un arreglo, lo usamos.
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

  const loadProfile = async () => {
    try {
      const localUserStr = localStorage.getItem("user");
      if (localUserStr) {
        setProfile(JSON.parse(localUserStr));
      }
      const data = await getProfile();
      if (data && (data.data || data.user || data.id)) {
        setProfile(data.data || data.user || data);
      }
    } catch {
      /* silent */
    }
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

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setFormError("");
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

      const payload = {
        ...adminFormData,
        usuarioId: profile.id,
      };

      const { createAdmin } = await import("../services/adminService");
      await createAdmin(payload);
      await loadAdmins();
      setShowAdminForm(false);
      // Reset only standard form data, keep defaults
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
      loadAdmins(); // Recargar la lista después de eliminar
      loadActiveAdmins(); // Recargar la lista de activos
    } catch {
      alert("Error al intentar eliminar el administrador.");
    }
  };

  // ── Handlers Inventario ──
  const handleCreateInventario = async (e) => {
    e.preventDefault();
    setInventarioFormError("");
    setInventarioFormLoading(true);

    try {
      // Convertir valores numéricos obligatorios
      const payload = {
        ...inventarioFormData,
        categoria: parseInt(inventarioFormData.categoria, 10),
        cantidadActual: parseInt(inventarioFormData.cantidadActual, 10),
        cantidadMinima: parseInt(inventarioFormData.cantidadMinima, 10),
        cantidadMaxima: parseInt(inventarioFormData.cantidadMaxima, 10),
        precioCosto: parseFloat(inventarioFormData.precioCosto),
      };
      // Ajustar fechas vacías (api las requiere válidas o nulas)
      if (!payload.fechaVencimiento) delete payload.fechaVencimiento;

      await createInventario(payload);
      setShowInventarioForm(false);
      loadInventario(); // Recargar resumen y lista
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const activeItem = MENU_ITEMS.find((m) => m.id === activeSection);

  return (
    <div className={`adm-layout ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* ══════════ SIDEBAR ══════════ */}
      <aside className="adm-sidebar">
        {/* Brand header */}
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

        {/* Navigation */}
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

        {/* Cerrar sesión - bottom */}
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
        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-title">
            <h1>{activeItem?.label}</h1>
          </div>

          {/* Right: user info + avatar */}
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

        {/* Content */}
        <main className="adm-content">
          {/* ── Estadísticas ── */}
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
                          Total Reservas
                        </h3>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#111827",
                          }}
                        >
                          {stats.totalReservas}
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
                          Reservas Hoy
                        </h3>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#059669",
                          }}
                        >
                          {stats.reservasHoy}
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
                          Total Empleados
                        </h3>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color: "#3b82f6",
                          }}
                        >
                          {stats.totalEmpleados}
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
                          Prods. Bajo Stock
                        </h3>
                        <p
                          style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            color:
                              stats.productosConBajoStock > 0
                                ? "#dc2626"
                                : "#6b7280",
                          }}
                        >
                          {stats.productosConBajoStock}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Segunda fila de cards para Reservas Hoy (Más detalle) */}
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

          {/* ── Inventario ── */}
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
                    // Ignore metadata like 'fecha' or generic strings if not needed as KPI
                    if (key === "fecha") return null;

                    // CRITICAL FIX: skip over arrays/objects (like 'categorias') since React can't render objects directly
                    if (typeof value === "object" && value !== null)
                      return null;

                    // Format key from camelCase to Title Case (e.g. totalProductos -> Total Productos)
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());

                    // If it's a number and has 'valor' or 'costo', format as currency
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

              {/* Inventario List Table */}
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

              {/* Inventario Modal */}
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
                      {/* SECCIÓN 1 */}
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

                      {/* SECCIÓN 2 */}
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

                      {/* SECCIÓN 3 */}
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
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>Fecha Venc. (Opcional)</label>
                          <input
                            type="date"
                            value={inventarioFormData.fechaVencimiento}
                            onChange={(e) =>
                              setInventarioFormData({
                                ...inventarioFormData,
                                fechaVencimiento: e.target.value,
                              })
                            }
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

              {/* ── Floating AI Button ── */}
              <button
                className="ai-floating-btn"
                onClick={() => setShowAIModal(true)}
                title="Predicción de Demanda IA"
              >
                ✨ <span>Predicción IA</span>
              </button>

              {/* ── AI PREDICTION MODAL ── */}
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
                              if (val && !aiSelectedProducts.includes(val)) {
                                setAiSelectedProducts([
                                  ...aiSelectedProducts,
                                  val,
                                ]);
                              }
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
                                  lineHeight: "1",
                                  display: "flex",
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

          {/* ── Auditoría ── */}
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
                          const fechaStr =
                            fecha.toLocaleDateString() +
                            " " +
                            fecha.toLocaleTimeString();
                          return (
                            <tr key={idx}>
                              <td
                                style={{
                                  padding: "16px 24px",
                                  color: "#6b7280",
                                  fontSize: "14px",
                                }}
                              >
                                {fechaStr}
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

          {/* ── Reporte Ventas ── */}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    flexWrap: "wrap",
                    gap: "20px",
                  }}
                >
                  <div>
                    <h2>Reporte de Ventas</h2>
                    <p>Consulta las ventas y reservas en un rango de fechas</p>
                  </div>
                  <form
                    onSubmit={handleFiltrarVentas}
                    style={{
                      display: "flex",
                      gap: "15px",
                      alignItems: "flex-end",
                      flexWrap: "wrap",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Fecha Inicio</label>
                      <input
                        type="date"
                        value={filtroVentas.fechaInicio}
                        onChange={(e) =>
                          setFiltroVentas({
                            ...filtroVentas,
                            fechaInicio: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Fecha Fin</label>
                      <input
                        type="date"
                        value={filtroVentas.fechaFin}
                        onChange={(e) =>
                          setFiltroVentas({
                            ...filtroVentas,
                            fechaFin: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      className="action-btn primary"
                      style={{
                        height: "44px",
                        padding: "0 24px",
                        marginBottom: "22px",
                      }}
                      disabled={reporteVentasLoading}
                    >
                      Filtrar
                    </button>
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
                        Total Ventas
                      </h3>
                      <p
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          color: "#10b981",
                        }}
                      >
                        ${(reporteVentas.totalVentas || 0).toLocaleString()}
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
                        Total Reservas
                      </h3>
                      <p
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          color: "#3b82f6",
                        }}
                      >
                        {reporteVentas.totalReservas || 0}
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
                        Promedio Venta Diaria
                      </h3>
                      <p
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          color: "#8b5cf6",
                        }}
                      >
                        $
                        {(
                          reporteVentas.promedioVentaDiaria || 0
                        ).toLocaleString()}
                      </p>
                    </div>
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
                              {reporteVentas.ventasPorDia.map((venta, idx) => {
                                const fechaFormateada = new Date(
                                  venta.fecha,
                                ).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                });
                                return (
                                  <tr key={idx}>
                                    <td
                                      style={{
                                        padding: "16px 24px",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {fechaFormateada}
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
                                );
                              })}
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

          {/* ── Prestadores ── */}
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

          {/* ── Configuración ── */}
          {activeSection === "configuracion" && (
            <>
              {/* Results card */}
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

              {/* ── MODAL de edición ── */}
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
                        <div className="form-group">
                          <label htmlFor="horaApertura">Hora de apertura</label>
                          <input
                            type="number"
                            id="horaApertura"
                            name="horaApertura"
                            value={config.horaApertura}
                            onChange={handleConfigChange}
                            min="0"
                            max="23"
                            required
                          />
                          <span className="input-hint">Formato 24h (0–23)</span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="horaCierre">Hora de cierre</label>
                          <input
                            type="number"
                            id="horaCierre"
                            name="horaCierre"
                            value={config.horaCierre}
                            onChange={handleConfigChange}
                            min="0"
                            max="23"
                            required
                          />
                          <span className="input-hint">Formato 24h (0–23)</span>
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

          {/* ── Agregar Fecha Reserva (Disponibilidad) ── */}
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
                  <h3 style={{ marginBottom: "16px" }}>Nueva Disponibilidad</h3>
                  <form onSubmit={handleCreateAvailability}>
                    <div className="form-row-3">
                      <div className="form-group">
                        <label>Fecha de Reserva *</label>
                        <input
                          type="date"
                          value={dispoFormData.date}
                          onChange={(e) =>
                            setDispoFormData({
                              ...dispoFormData,
                              date: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hora de Inicio *</label>
                        <input
                          type="time"
                          value={dispoFormData.startTime}
                          onChange={(e) =>
                            setDispoFormData({
                              ...dispoFormData,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Hora de Cierre *</label>
                        <input
                          type="time"
                          value={dispoFormData.endTime}
                          onChange={(e) =>
                            setDispoFormData({
                              ...dispoFormData,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div
                      className="modal-footer"
                      style={{ border: "none", padding: 0, marginTop: "16px" }}
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

              {/* Listado de Disponibilidad */}
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
                                {new Date(item.date).toLocaleDateString()}
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

          {/* ── Períodos ── */}
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
                  <h3>Generar nuevo período</h3>
                  {formError && (
                    <div className="error-message">{formError}</div>
                  )}
                  <form onSubmit={handleCreatePrediccion}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="periodoInicio">Fecha inicio</label>
                        <input
                          type="date"
                          id="periodoInicio"
                          name="periodoInicio"
                          value={formData.periodoInicio}
                          onChange={handleFormChange}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="periodoFin">Fecha fin</label>
                        <input
                          type="date"
                          id="periodoFin"
                          name="periodoFin"
                          value={formData.periodoFin}
                          onChange={handleFormChange}
                          min={
                            formData.periodoInicio ||
                            new Date().toISOString().split("T")[0]
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="checkbox-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="consideraFestivos"
                          checked={formData.consideraFestivos}
                          onChange={handleFormChange}
                        />
                        <span>Considerar festivos</span>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="consideraTendencias"
                          checked={formData.consideraTendencias}
                          onChange={handleFormChange}
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

          {/* ── Administradores ── */}
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

              {/* ── MODAL de creación de admin ── */}
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
                          <label htmlFor="usuarioId">Usuario a promover</label>
                          <input
                            type="text"
                            id="usuarioNombreDisplay"
                            name="usuarioNombreDisplay"
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
                          <label htmlFor="nivelAcceso">Nivel de Acceso</label>
                          <input
                            type="text"
                            id="nivelAcceso"
                            name="nivelAcceso"
                            value={adminFormData.nivelAcceso}
                            onChange={handleAdminFormChange}
                            disabled
                          />
                          <span className="input-hint">
                            Asignado automáticamente
                          </span>
                        </div>
                        <div className="form-group">
                          <label htmlFor="areaResponsabilidad">
                            Área Responsabilidad
                          </label>
                          <input
                            type="text"
                            id="areaResponsabilidad"
                            name="areaResponsabilidad"
                            value={adminFormData.areaResponsabilidad}
                            onChange={handleAdminFormChange}
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
                            name="activo"
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

          {/* ── Administradores Activos ── */}
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

        {/* Footer */}
        <footer className="adm-footer">
          © 2026 RestaurantApp · Panel de Administración · Todos los derechos
          reservados.
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
