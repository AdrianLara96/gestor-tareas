#  Gestor de Tareas

Aplicación full stack para gestión de tareas desarrollada con Vue 3 y Supabase.

## Demo

[Ver aplicación en producción](https://tu-app.vercel.app)

##  Tecnologías

- **Frontend**: Vue 3 + Vite + JavaScript
- **Backend**: Supabase (Auth, Database, Storage, RLS)
- **Estilos**: CSS con variables y modo oscuro automático
- **Router**: Vue Router con guardias de navegación

##  Características

- Autenticación de usuarios con persistencia de sesión (login/registro)
- CRUD de tareas con estados (completada/pospuesta)
- Perfiles de usuario con upload de avatares
- Galería pública de usuarios
- Panel de administración con gestión de roles
- Modo oscuro automático
- Diseño responsive
- Integración con Supabase Database
- Estados de carga y error en UI

## CRUD de tareas

- Componente TaskForm para crear/editar tareas
- Componente TaskList para mostrar tareas del usuario
- Acciones: completar, posponer, editar, eliminar

## Probar la app

1. Regístrate con cualquier email
2. Completa tu perfil y marca "Perfil público"
3. Visita la galería pública para ver tu perfil
4. Crea y gestiona tus tareas