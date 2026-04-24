import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { login, loginWithGoogle } from "../services/authService";
import "../../../styles/auth.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function Login() {
  const [formData, setFormData] = useState({
    userNameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

    // Validación básica
    if (!formData.userNameOrEmail || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    // ─── BYPASS TEMPORAL PARA PRUEBAS DE ADMIN ───────────────────────────────
    // Eliminar esto cuando el backend incluya el rol en el JWT
    if (
      formData.userNameOrEmail === "admin" &&
      formData.password === "Admin@123"
    ) {
      localStorage.setItem("userRole", "Admin");
      localStorage.setItem("token", "dev-admin-token");
      localStorage.setItem(
        "user",
        JSON.stringify({
          userName: "admin",
          firstName: "Admin",
          lastName: "Dev",
        }),
      );
      navigate("/admin");
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    setLoading(true);

    try {
      const data = await login({
        userNameOrEmail: formData.userNameOrEmail,
        password: formData.password,
      });

      // Temporal: todos van al admin mientras se implementan los demás módulos
      navigate("/admin");
    } catch (err) {
      setError(
        err.message || "Error al iniciar sesión. Verifica tus credenciales.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const data = await loginWithGoogle(credentialResponse.credential);
      const role = data.role;
      switch (role) {
        case "Admin":
          navigate("/admin");
          break;
        case "Recepcionista":
          navigate("/recepcionista");
          break;
        default:
          navigate("/cliente");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("No se pudo iniciar sesión con Google. Inténtalo nuevamente.");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Bienvenido de nuevo</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="userNameOrEmail">Nombre de usuario o correo</label>
            <input
              type="text"
              id="userNameOrEmail"
              name="userNameOrEmail"
              value={formData.userNameOrEmail}
              onChange={handleChange}
              placeholder="tu_usuario o correo@email.com"
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="auth-divider">
          <span>o continúa con</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleOAuthProvider clientId={clientId}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text="signin_with"
              shape="rectangular"
              locale="es"
            />
          </GoogleOAuthProvider>
        </div>

        <div className="auth-footer">
          <p>
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className="auth-link">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
