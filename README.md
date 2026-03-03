#  Gestor de Tareas

Aplicación full stack para gestión de tareas desarrollada con Vue 3 y Supabase.

##  Tecnologías

- **Frontend**: Vue 3 + Vite + JavaScript
- **Backend**: Supabase (Auth, Database, Storage)
- **Estilos**: CSS con variables y modo oscuro automático
- **Router**: Vue Router con guardias de navegación

##  Características

- Autenticación de usuarios (login/registro)
- Roles de usuario (admin / usuario público)
- Protección de rutas
- Integración con Supabase Database
- Estados de carga y error en UI
- CRUD de tareas
- Modo oscuro automático

## CRUD de tareas

- Componente TaskForm para crear/editar tareas
- Componente TaskList para mostrar tareas del usuario
- Acciones: completar, posponer, editar, eliminar

##  Instalación

```bash
npm install
npm run dev