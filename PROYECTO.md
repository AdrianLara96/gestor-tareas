# 📋 Gestor de Tareas - Documentación del Proyecto

> **Aplicación full stack para gestión de tareas desarrollada con Vue 3 y Supabase**

---

## 🚀 Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| **Frontend** | Vue 3 | 3.x |
| **Build Tool** | Vite | 5.x |
| **Lenguaje** | JavaScript | ES6+ |
| **Backend** | Supabase | Latest |
| **Router** | Vue Router | 4.x |
| **Estilos** | CSS con Variables | - |
| **Control de Versiones** | Git + GitHub | - |

---

## ✨ Funcionalidades Implementadas

### Autenticación
- ✅ Registro de usuarios con email y contraseña
- ✅ Login de usuarios existentes
- ✅ Cierre de sesión
- ✅ Persistencia de sesión al recargar
- ✅ Protección de rutas (guardias de navegación)

### Gestión de Tareas
- ✅ Crear nueva tarea (título, descripción, fecha límite)
- ✅ Ver lista de tareas del usuario
- ✅ Marcar tarea como completada
- ✅ Marcar tarea como pospuesta
- ✅ Editar tarea existente
- ✅ Eliminar tarea (con confirmación)
- ✅ Persistencia de datos en Supabase

### Interfaz de Usuario
- ✅ Diseño responsive
- ✅ Modo oscuro automático (según sistema operativo)
- ✅ Estados de carga y error
- ✅ Feedback visual para acciones
- ✅ Formularios con validación básica

---

## 🗄️ Estructura de la Base de Datos

### Tabla `profiles`
Extiende la tabla `auth.users` de Supabase con información adicional.

| Columna | Tipo | Descripción | Default | Nullable |
|---------|------|-------------|---------|----------|
| `id` | uuid | PK, referencia a auth.users | uuid_generate_v4() | ❌ |
| `email` | text | Email del usuario | - | ❌ |
| `role` | text | Rol: 'admin' o 'usuario_publico' | 'usuario_publico' | ❌ |
| `created_at` | timestamptz | Fecha de creación | now() | ❌ |

**Relaciones:**
- `profiles.id` → `auth.users.id` (1:1, CASCADE)

---

### Tabla `tasks`
Almacena las tareas de cada usuario.

| Columna | Tipo | Descripción | Default | Nullable |
|---------|------|-------------|---------|----------|
| `id` | uuid | PK | uuid_generate_v4() | ❌ |
| `user_id` | uuid | FK → profiles.id | - | ❌ |
| `title` | text | Título de la tarea | - | ❌ |
| `description` | text | Descripción opcional | - | ✅ |
| `is_completed` | boolean | Estado completado | false | ❌ |
| `is_postponed` | boolean | Estado pospuesta | false | ❌ |
| `due_date` | timestamptz | Fecha límite | - | ✅ |
| `created_at` | timestamptz | Fecha creación | now() | ❌ |
| `updated_at` | timestamptz | Fecha modificación | now() | ❌ |

**Relaciones:**
- `tasks.user_id` → `profiles.id` (N:1, CASCADE)

---

### Trigger: `handle_new_user()`
Auto-crea un perfil cuando se registra un usuario nuevo.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, 'usuario_publico', NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

---

### Políticas de Seguridad (RLS)

| Tabla | Operación | Política |
|-------|-----------|----------|
| `profiles` | SELECT | Usuarios ven solo su propio perfil |
| `profiles` | UPDATE | Usuarios actualizan solo su propio perfil |
| `tasks` | SELECT | Usuarios ven solo sus propias tareas |
| `tasks` | INSERT | Usuarios insertan solo para sí mismos |
| `tasks` | UPDATE | Usuarios actualizan solo sus propias tareas |
| `tasks` | DELETE | Usuarios borran solo sus propias tareas |

---

## 📁 Estructura de Carpetas del Proyecto
gestor-tareas/
├── .env # Variables de entorno (NO subir a Git)
├── .env.example # Ejemplo de variables (SÍ subir a Git)
├── .gitignore # Archivos ignorados por Git
├── PROYECTO.md # Este archivo de documentación
├── README.md # README para GitHub
├── package.json # Dependencias y scripts
├── index.html # HTML principal
│
└── src/
├── main.js # Punto de entrada de la app
├── App.vue # Componente raíz
│
├── assets/
│ └── css/
│ ├── style.css # Variables CSS y paleta de colores
│ └── utils.css # Clases utilitarias reutilizables
│
├── components/
│ ├── TaskForm.vue # Formulario crear/editar tareas
│ └── TaskList.vue # Lista de tareas con acciones
│
├── composables/
│ └── useAuth.js # Lógica de autenticación (login, logout, etc.)
│
├── lib/
│ └── supabase.js # Cliente de Supabase inicializado
│
├── router/
│ └── index.js # Configuración de rutas y guardias
│
└── views/
├── Login.vue # Vista de inicio de sesión
├── Register.vue # Vista de registro
└── Dashboard.vue # Vista principal (gestor de tareas)


---

### 🗺️ Mapa de Rutas

| Ruta | Componente | Meta | Acceso |
|------|------------|------|--------|
| `/` | (redirige) | - | → `/login` |
| `/login` | `Login.vue` | `requiresGuest` | Solo NO logueados |
| `/register` | `Register.vue` | `requiresGuest` | Solo NO logueados |
| `/dashboard` | `Dashboard.vue` | `requiresAuth` | Solo logueados |

---

### 📝 Notas Importantes
Seguridad
✅ RLS (Row Level Security) activado en todas las tablas
✅ Cada usuario solo puede acceder a sus propios datos
✅ Claves API guardadas en variables de entorno
✅ Trigger auto-crea perfiles al registrar usuarios


### Desarrollo
⚠️ Email confirmation desactivado (solo para desarrollo)
⚠️ En producción, activar email confirmation
✅ Modo oscuro automático según preferencia del sistema
✅ Diseño responsive (móvil, tablet, desktop)

## 📚 Historial de Fases Completadas (Resumen Detallado)

### Fase 1: Configuración del Entorno de Desarrollo

**Objetivo:** Preparar el entorno local y conectar Vue con Supabase.

**Acciones realizadas:**
- Verificar instalación de Node.js
- Crear proyecto Vue con Vite usando `npm create vue@latest`
- Instalar cliente de Supabase: `npm install @supabase/supabase-js`
- Instalar Vue Router: `npm install vue-router@4`
- Configurar archivo `.env` con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
- Crear `src/lib/supabase.js` con el cliente inicializado
- Configurar `.gitignore` para excluir `.env` y `node_modules/`

**Archivos creados:**
- `.env` (variables de entorno)
- `src/lib/supabase.js` (cliente de Supabase)
- `src/main.js` (punto de entrada con router)
- `.gitignore` (archivos ignorados por Git)

**Resultado:** Entorno de desarrollo listo con conexión a Supabase verificada.

---

### Fase 2: Base de Datos en Supabase

**Objetivo:** Estructurar la base de datos con tablas, relaciones y seguridad.

**Acciones realizadas:**
- Crear tabla `profiles` (id, email, role, created_at)
- Crear tabla `tasks` (id, user_id, title, description, is_completed, is_postponed, due_date, created_at, updated_at)
- Establecer relaciones (Foreign Keys) entre tablas
- Crear trigger `handle_new_user()` para auto-crear perfiles al registrar usuarios
- Configurar 6 políticas RLS (Row Level Security):
  - profiles: SELECT y UPDATE (solo el dueño)
  - tasks: SELECT, INSERT, UPDATE, DELETE (solo el dueño)

**SQL ejecutado:**
- Función `handle_new_user()` que inserta en profiles al crear usuario en auth.users
- Trigger `on_auth_user_created` que activa la función automáticamente

**Resultado:** Base de datos estructurada y segura, lista para usar.

---

### Fase 3: Sistema de Autenticación en Vue

**Objetivo:** Implementar login, registro y gestión de sesión.

**Acciones realizadas:**
- Crear composable `src/composables/useAuth.js` con funciones:
  - checkSession(): verificar sesión activa
  - register(email, password): crear nuevo usuario
  - login(email, password): autenticar usuario
  - logout(): cerrar sesión
  - initAuthListener(): escuchar cambios de auth
- Crear vista `src/views/Login.vue` con formulario de login
- Crear vista `src/views/Register.vue` con formulario de registro
- Integrar estilos personalizados (style.css y utils.css)
- Configurar modo oscuro automático con variables CSS

**Resultado:** Sistema de autenticación completo y funcional.

---

### Fase 4: Router y Navegación Protegida

**Objetivo:** Configurar rutas y proteger vistas según estado de autenticación.

**Acciones realizadas:**
- Crear vista `src/views/Dashboard.vue` para usuarios logueados
- Configurar rutas en `src/router/index.js`:
  - `/` → redirige a `/login`
  - `/login` → solo no logueados (requiresGuest)
  - `/register` → solo no logueados (requiresGuest)
  - `/dashboard` → solo logueados (requiresAuth)
- Implementar guardia de navegación `router.beforeEach()`
- Configurar `src/App.vue` con `initAuthListener()` y `checkSession()`
- Corregir orden en `main.js` (.use antes de .mount)

**Resultado:** Navegación protegida funcionando correctamente.

---

### Fase 5: Subida a GitHub (Segura)

**Objetivo:** Versionar el proyecto y subirlo a GitHub sin exponer credenciales.

**Acciones realizadas:**
- Crear repositorio en GitHub llamado `gestor-tareas`
- Configurar `.gitignore` correctamente
- Eliminar archivos sensibles del historial de Git (`git rm -r --cached .`)
- Forzar push para actualizar GitHub sin `.env`
- Crear archivo `.env.example` con valores de ejemplo
- Añadir descripción y tags al repositorio

**Comandos utilizados:**
- `git init`
- `git add .`
- `git commit -m "feat: configuración inicial"`
- `git remote add origin [url]`
- `git push -f origin main`

**Resultado:** Repositorio público seguro con código versionado.

---

### Fase 6: CRUD de Tareas

**Objetivo:** Implementar gestión completa de tareas (crear, leer, actualizar, eliminar).

**Acciones realizadas:**
- Crear componente `src/components/TaskForm.vue`:
  - Formulario modal para crear/editar tareas
  - Campos: título, descripción, fecha límite
  - Validación básica y estados de carga/error
- Crear componente `src/components/TaskList.vue`:
  - Lista de tareas del usuario desde Supabase
  - Acciones: completar, posponer, editar, eliminar
  - Estados visuales (completada, pospuesta, vencida)
- Actualizar `src/views/Dashboard.vue`:
  - Integrar TaskForm y TaskList
  - Botón "Nueva Tarea"
  - Mostrar información del usuario logueado

**Consultas Supabase implementadas:**
- INSERT: crear nueva tarea con user_id
- SELECT: obtener tareas del usuario ordenadas por fecha
- UPDATE: modificar estado o datos de tarea
- DELETE: eliminar tarea con confirmación

**Pruebas realizadas:**
- Crear tarea nueva ✅
- Ver lista de tareas ✅
- Marcar como completada ✅
- Posponer tarea ✅
- Editar tarea existente ✅
- Eliminar tarea con confirmación ✅
- Persistencia al recargar (F5) ✅

**Resultado:** CRUD de tareas completamente funcional.

---

### Estado Actual del Proyecto (Fin Fase 6)

**Funcionalidades completadas:**
- Autenticación completa (login, registro, logout, persistencia)
- Protección de rutas con guardias de navegación
- CRUD de tareas (crear, leer, actualizar, eliminar)
- Estados de tareas (completada, pospuesta, vencida)
- Diseño responsive con modo oscuro automático
- Repositorio GitHub seguro y documentado

**Progreso total:** ~80% del MVP básico

**Próxima fase:** Fase 7 - Perfiles, Galería de Usuarios y Área Admin