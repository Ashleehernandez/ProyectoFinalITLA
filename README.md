# Proyecto Final - Sistema de Reservaciones de Restaurante

Sistema de gestión de reservaciones para restaurante desarrollado con React y Vite.

## 🚀 Características

- **Módulo Admin**: Gestión de días disponibles para reservaciones
- **Módulo Cliente**: Realización de reservaciones
- **Módulo Recepcionista**: Validación y gestión de reservaciones
- **Autenticación**: Sistema de login con roles (Admin, Cliente, Recepcionista)

## 🛠️ Tecnologías

- React 18
- Vite
- React Router DOM
- CSS3

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Crear build de producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── modules/           # Módulos de la aplicación
│   ├── admin/        # Módulo de administración
│   ├── cliente/      # Módulo de cliente
│   ├── recepcionista/# Módulo de recepcionista
│   └── auth/         # Módulo de autenticación
├── components/       # Componentes reutilizables
├── styles/           # Estilos globales
└── App.jsx           # Componente principal
```

## 👥 Roles del Sistema

### Administrador
- Crear días disponibles para reservaciones
- Gestionar horarios y capacidad máxima
- Ver estadísticas de reservaciones

### Cliente
- Ver días disponibles
- Realizar reservaciones
- Seleccionar fecha y hora

### Recepcionista
- Ver todas las reservaciones
- Confirmar reservaciones pendientes
- Cancelar reservaciones
- Filtrar por estado

## 🔐 Autenticación

El sistema actualmente usa autenticación hardcodeada para desarrollo. Los roles disponibles son:
- Admin
- Cliente
- Recepcionista

## 📝 Notas

- Los datos se almacenan temporalmente en localStorage
- Listo para integrar con backend API
- Diseño responsive y moderno

## 📄 Licencia

Este proyecto es parte del trabajo final del curso.
