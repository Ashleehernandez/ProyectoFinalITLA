# Proyecto Final React

Proyecto creado con React y Vite, organizado con estructura modular.

## Estructura del Proyecto

```
src/
├── modules/           # Módulos de la aplicación
│   └── auth/         # Módulo de autenticación
│       ├── components/    # Componentes del módulo
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── services/      # Servicios/API del módulo
│       │   └── authService.js
│       └── index.js       # Exportaciones del módulo
├── components/       # Componentes reutilizables globales
├── styles/          # Estilos globales y compartidos
│   └── auth.css
├── services/        # Servicios globales
├── utils/           # Utilidades y helpers
├── App.jsx          # Componente principal
└── main.jsx         # Punto de entrada
```

## Comandos disponibles

### Instalar dependencias
```bash
npm install
```

### Ejecutar en modo desarrollo
```bash
npm run dev
```

### Crear build de producción
```bash
npm run build
```

### Previsualizar build de producción
```bash
npm run preview
```

## Organización Modular

Cada módulo (como `auth`) contiene:
- **components/**: Componentes específicos del módulo
- **services/**: Llamadas a APIs relacionadas con el módulo
- **styles/**: Estilos específicos (si los hay)
- **index.js**: Exportaciones centralizadas del módulo

Esta estructura facilita:
- Escalabilidad: Fácil agregar nuevos módulos
- Mantenibilidad: Todo relacionado está junto
- Reutilización: Componentes y servicios organizados
- Colaboración: Estructura clara para equipos
