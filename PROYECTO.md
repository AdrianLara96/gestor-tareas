# 📋 Gestor de Tareas - Documentación del Proyecto

**Aplicación full stack para gestión de tareas desarrollada con Vue 3 y Supabase**

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

### Trigger: `handle_new_user`
Auto-crea un perfil cuando se registra un usuario nuevo.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at)
  VALUES (NEW.id, NEW.email, `usuario_publico`, NEW.created_at);
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

---

## Fase 7: Perfiles, Galería de Usuarios y Área Admin

**Objetivo:** Implementar gestión completa de perfiles de usuario con avatares, galería pública y panel de administración exclusivo.

**Fecha de completado:** [Fecha actual]

---

### 🗄️ Cambios en Base de Datos

#### Tabla `profiles` (columnas añadidas)
| Columna | Tipo | Propósito |
|---------|------|-----------|
| `full_name` | text | Nombre visible públicamente |
| `bio` | text | Biografía del usuario |
| `avatar_url` | text | URL del avatar en Storage |
| `is_public` | boolean | Controla visibilidad en galería |
| `updated_at` | timestamptz | Fecha de última modificación |

#### Supabase Storage: Bucket `avatars`
- **Tipo**: Público (lectura sin autenticación)
- **Límite**: 5 MB por archivo
- **Tipos**: PNG, JPG, JPEG, WEBP
- **Estructura**: `avatars/{user-id}/avatar-{timestamp}.{ext}`

#### Políticas RLS configuradas
| Bucket/Tabla | Operación | Condición |
|-------------|-----------|-----------|
| `storage.objects` (avatars) | SELECT | `bucket_id = 'avatars'` (público) |
| `storage.objects` (avatars) | INSERT | `auth.role() = 'authenticated'` |
| `storage.objects` (avatars) | UPDATE/DELETE | `owner = auth.uid()` |
| `profiles` | SELECT | `is_public = true` OR `auth.uid() = id` |
| `profiles` | INSERT/UPDATE/DELETE | `auth.uid() = id` |

---

### 📁 Nuevos Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `src/composables/useStorage.js` | Lógica reutilizable para upload/delete de archivos |
| `src/views/profile/ProfileEdit.vue` | Formulario para editar perfil propio |
| `src/views/public/UserGallery.vue` | Galería pública de usuarios |
| `src/views/public/UserDetail.vue` | Detalle de un usuario público |
| `src/views/admin/AdminDashboard.vue` | Panel exclusivo para admins |

---

### 🗺️ Nuevas Rutas

| Ruta | Componente | Acceso | Descripción |
|------|------------|--------|-------------|
| `/profile` | ProfileEdit | Auth required | Editar mi perfil |
| `/public/users` | UserGallery | Público | Galería de usuarios públicos |
| `/public/users/:id` | UserDetail | Público | Detalle de usuario |
| `/admin` | AdminDashboard | Admin only | Panel de administración |

---

### ✨ Funcionalidades Implementadas

#### 👤 Perfil de Usuario
- Editar nombre completo, biografía y avatar
- Toggle de perfil público/privado
- Vista previa de avatar antes de subir
- Validación de tipo y tamaño de archivo
- Feedback visual de carga y éxito/error

#### 🌍 Galería Pública
- Lista de usuarios con `is_public = true`
- Avatar, nombre y biografía resumida
- Navegación a detalle de usuario
- Diseño responsive con CSS Grid
- Accesible sin login

#### 🔐 Panel de Administración
- Acceso exclusivo para `role = 'admin'`
- Estadísticas: total usuarios, públicos, admins
- Tabla con todos los usuarios (incluyendo privados)
- Cambiar rol de usuario (admin ↔ usuario_publico)
- Cambiar visibilidad pública de cualquier usuario

#### 🎨 Mejoras de UX
- Botones de navegación en Dashboard (Perfil, Galería, Admin)
- Redirección a `/profile` después de registrarse
- Botón "Volver al Dashboard" en perfil y admin
- Verificación de rol admin al cargar componentes

---

### 🔧 Problemas Solucionados

| Problema | Solución |
|----------|----------|
| Columna `updated_at` no existía | Añadida en Supabase Table Editor |
| `supabase is not defined` en Dashboard | Añadida importación faltante |
| Error al hacer clic en "Subir avatar" | Función `triggerFileInput()` con `fileInput.value?.click()` |
| `url: undefined` en upload de avatar | Construir URL pública manualmente con formato de Supabase |
| Avatar no se mostraba después de guardar | Actualizar `avatarUrl.value = newAvatarUrl` post-update |

---

### 🧪 Pruebas Realizadas ✅

- [x] Editar perfil y guardar cambios
- [x] Subir avatar y persistencia al recargar
- [x] Toggle de perfil público/privado
- [x] Galería pública accesible sin login
- [x] Navegación: galería → detalle → volver
- [x] Acceso a `/admin` como admin
- [x] Acceso a `/admin` como usuario normal (redirige)
- [x] Cambiar rol de usuario desde admin
- [x] Redirección a `/profile` post-registro
- [x] Botones de navegación en dashboard

---

## Fase 8: Filtros y Búsqueda de Tareas

**Objetivo:** Mejorar la usabilidad de la lista de tareas permitiendo filtrar por estado y buscar por texto.

**Fecha de completado:** [Fecha actual]

---

### ✨ Funcionalidades Implementadas

#### Filtros por Estado

| Filtro | Descripción |
|--------|-------------|
| Todas | Muestra todas las tareas sin filtrar |
| Pendientes | Tareas no completadas y no pospuestas |
| Completadas | Tareas con checkbox marcado |
| Pospuestas | Tareas con badge naranja (pospuestas pero no completadas) |

#### Búsqueda de Texto

- Búsqueda en tiempo real por título y descripción
- debounce de 300ms para optimizar rendimiento
- Botón "X" para limpiar búsqueda rápidamente
- Case-insensitive (no distingue mayúsculas/minúsculas)

#### Contador de Resultados

- Muestra "X de Y tareas" actualizado dinámicamente
- Ayuda al usuario a entender cuántas tareas coinciden con su búsqueda/filtro

#### Estados Vacíos Inteligentes

| Situación | Mensaje mostrado |
|-----------|-----------------|
| Sin tareas | 📭 No tienes tareas todavía |
| Sin resultados (filtro/búsqueda) | 😕 No se encontraron tareas + botón "Ver todas las tareas" |

---

### 📁 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| src/components/TaskList.vue | Nuevas variables de estado: currentFilter, searchQuery, searchTimeout. Propiedad computada filters con contadores. Propiedad computada filteredTasks con lógica combinada. Funciones: handleSearchInput, clearSearch, resetFilters. Template: botones de filtro, barra de búsqueda, contador, estado vacío. Estilos: sección completa para filtros y búsqueda + responsive |

---

### 🔧 Cambios Técnicos

#### Nuevas Variables Reactivas

| Variable | Tipo | Valor inicial | Propósito |
|----------|------|---------------|-----------|
| currentFilter | ref | 'all' | Filtro activo (all, pending, completed, postponed) |
| searchQuery | ref | '' | Texto de búsqueda del usuario |
| searchTimeout | ref | null | Timeout para debounce de búsqueda |

#### Propiedad Computada: filters

Devuelve array de 4 objetos con:
- value: identificador del filtro
- label: texto visible del botón
- count: número de tareas que coinciden con ese filtro

#### Propiedad Computada: filteredTasks

Aplica dos niveles de filtrado:
1. Filtra por estado según currentFilter
2. Filtra por texto de búsqueda en título y descripción
3. Devuelve array de tareas que coinciden con ambos criterios

#### Funciones Nuevas

| Función | Propósito |
|---------|-----------|
| handleSearchInput() | Aplica debounce de 300ms a la búsqueda |
| clearSearch() | Limpia el campo de búsqueda |
| resetFilters() | Resetea filtro y búsqueda a valores por defecto |

---

### 🎨 Estilos Añadidos

| Clase CSS | Propósito |
|-----------|-----------|
| .task-filters | Contenedor principal de filtros y búsqueda |
| .filter-buttons | Grid de botones de filtro |
| .filter-btn | Botón individual de filtro |
| .filter-btn.active | Estado activo del filtro |
| .filter-count | Badge con contador de tareas por filtro |
| .search-box | Contenedor de la barra de búsqueda |
| .search-input | Input de búsqueda |
| .search-clear | Botón X para limpiar búsqueda |
| .results-count | Contador de resultados mostrados |
| .empty-state-filtered | Estado vacío cuando no hay resultados |

#### Responsive Móvil

- Botones de filtro con wrap automático
- Búsqueda full-width en pantallas menores a 640px
- Contador alineado a la izquierda en móvil
- Padding y tamaños de fuente reducidos

---

### 🧪 Pruebas Realizadas

| # | Prueba | Resultado |
|---|--------|-----------|
| 1 | Ver lista de tareas con filtros | ✅ Funciona |
| 2 | Filtrar por Pendientes | ✅ Funciona |
| 3 | Filtrar por Completadas | ✅ Funciona |
| 4 | Filtrar por Pospuestas | ✅ Funciona |
| 5 | Búsqueda por título | ✅ Funciona |
| 6 | Búsqueda por descripción | ✅ Funciona |
| 7 | Combinar filtro + búsqueda | ✅ Funciona |
| 8 | Estado vacío con reset | ✅ Funciona |
| 9 | Contador de resultados | ✅ Funciona |
| 10 | Responsive en móvil (375px) | ✅ Funciona |

---

### 📊 Estado Actual del Proyecto

| Módulo | Estado | Completitud |
|--------|--------|-------------|
| Configuración del entorno | ✅ Completado | 100% |
| Base de datos Supabase | ✅ Completado | 100% |
| Autenticación | ✅ Completado | 100% |
| Router y protección de rutas | ✅ Completado | 100% |
| CRUD de tareas | ✅ Completado | 100% |
| Perfiles y avatares (Storage) | ✅ Completado | 100% |
| Galería pública | ✅ Completado | 100% |
| Panel de administración | ✅ Completado | 100% |
| Correcciones responsive | ✅ Completado | 100% |
| Filtros y búsqueda | ✅ Completado | 100% |

**Progreso total: ~99% (MVP completo + mejoras)**

---

### 🚀 Próximos Pasos Sugeridos (Opcionales)

| Feature | Prioridad | Descripción |
|---------|-----------|-------------|
| Notificaciones toast | Media | Mensajes flotantes de éxito/error |
| Ordenar tareas | Baja | Por fecha, estado, alfabético |
| Exportar a CSV | Baja | Descargar tareas en formato CSV |
| Confirmación custom | Baja | Modal propio en vez de confirm() nativo |
| Deploy en producción | Media | Publicar en Vercel con variables de entorno |

---


*Última actualización: [05/03/2026]*