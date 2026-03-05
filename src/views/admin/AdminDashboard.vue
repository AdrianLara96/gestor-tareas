<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()

const users = ref([])
const stats = ref({
  totalUsers: 0,
  publicUsers: 0,
  adminUsers: 0
})
const loading = ref(true)
const error = ref(null)
const changingRole = ref(null)

// Cargar datos al montar
onMounted(async () => {
  await fetchAllUsers()
  await calculateStats()
})

// Volver al dashboard
const goBack = () => {
  router.push('/dashboard')
}

// Obtener todos los usuarios (solo admins)
const fetchAllUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_public, created_at')
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    users.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error cargando usuarios:', err)
  } finally {
    loading.value = false
  }
}

// Calcular estadísticas
const calculateStats = async () => {
  try {
    // Total de usuarios
    const { count: totalCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Usuarios públicos
    const { count: publicCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)

    // Usuarios admin
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    stats.value = {
      totalUsers: totalCount || 0,
      publicUsers: publicCount || 0,
      adminUsers: adminCount || 0
    }
  } catch (err) {
    console.error('Error calculando estadísticas:', err)
  }
}

// Cambiar rol de usuario (admin ↔ usuario_publico)
const toggleUserRole = async (userId, currentRole) => {
  if (!confirm(`¿Estás seguro de cambiar el rol de este usuario?`)) {
    return
  }

  changingRole.value = userId
  error.value = null

  try {
    const newRole = currentRole === 'admin' ? 'usuario_publico' : 'admin'

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (updateError) throw updateError

    // Actualizar lista localmente
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }

    // Actualizar estadísticas
    await calculateStats()

    alert(`✅ Rol cambiado a: ${newRole}`)
  } catch (err) {
    error.value = err.message
    console.error('Error cambiando rol:', err)
    alert(`❌ Error: ${err.message}`)
  } finally {
    changingRole.value = null
  }
}

// Cambiar visibilidad pública de un usuario
const togglePublicVisibility = async (userId, isPublic) => {
  changingRole.value = userId

  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_public: !isPublic })
      .eq('id', userId)

    if (updateError) throw updateError

    // Actualizar lista localmente
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].is_public = !isPublic
    }

    // Actualizar estadísticas
    await calculateStats()
  } catch (err) {
    error.value = err.message
    console.error('Error cambiando visibilidad:', err)
  } finally {
    changingRole.value = null
  }
}

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="admin-container bg-base">
    <div class="admin-card card">
      
      <!-- Header -->
      <header class="admin-header">
        <div>
            <!-- Botón volver al dashboard -->
            <button @click="goBack" class="btn-back-dashboard">
            ← Volver al Dashboard
            </button>
            <h1 class="text-main">🔐 Panel de Administración</h1>
            <p class="text-muted">Gestión de usuarios y roles</p>
        </div>
        <button @click="logout" class="btn-secondary">
          Cerrar Sesión
        </button>
      </header>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="stat-number text-main">{{ stats.totalUsers }}</div>
          <div class="stat-label text-muted">Total Usuarios</div>
        </div>
        <div class="stat-card card">
          <div class="stat-number text-main">{{ stats.publicUsers }}</div>
          <div class="stat-label text-muted">Perfiles Públicos</div>
        </div>
        <div class="stat-card card">
          <div class="stat-number text-main">{{ stats.adminUsers }}</div>
          <div class="stat-label text-muted">Administradores</div>
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state text-muted">
        <p>Cargando usuarios...</p>
      </div>

      <!-- Tabla de usuarios -->
      <div v-else class="users-table-container">
        <h2 class="section-title text-main">👥 Todos los Usuarios</h2>
        
        <div class="table-responsive">
          <table class="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Visibilidad</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="userItem in users" :key="userItem.id">
                <td>
                  <span class="text-main">
                    {{ userItem.full_name || 'Sin nombre' }}
                  </span>
                </td>
                <td class="text-muted">{{ userItem.email }}</td>
                <td>
                  <span 
                    class="role-badge"
                    :class="userItem.role === 'admin' ? 'badge-admin' : 'badge-user'"
                  >
                    {{ userItem.role === 'admin' ? '👑 Admin' : '👤 Usuario' }}
                  </span>
                </td>
                <td>
                  <span 
                    class="visibility-badge"
                    :class="userItem.is_public ? 'badge-public' : 'badge-private'"
                  >
                    {{ userItem.is_public ? '🌍 Público' : '🔒 Privado' }}
                  </span>
                </td>
                <td class="text-muted">{{ formatDate(userItem.created_at) }}</td>
                <td>
                  <div class="action-buttons">
                    <button
                      @click="toggleUserRole(userItem.id, userItem.role)"
                      class="btn-action btn-role"
                      :disabled="changingRole === userItem.id"
                      :title="userItem.role === 'admin' ? 'Quitar rol admin' : 'Dar rol admin'"
                    >
                      {{ changingRole === userItem.id ? '...' : (userItem.role === 'admin' ? '👑' : '⭐') }}
                    </button>
                    <button
                      @click="togglePublicVisibility(userItem.id, userItem.is_public)"
                      class="btn-action btn-visibility"
                      :disabled="changingRole === userItem.id"
                      :title="userItem.is_public ? 'Hacer privado' : 'Hacer público'"
                    >
                      {{ userItem.is_public ? '🔒' : '🌍' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-container {
  min-height: 100vh;
  padding: 2rem;
}

.admin-card {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-header > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0; 
}

.btn-back-dashboard {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
  font-family: inherit;
  display: block;
}

.btn-back-dashboard:hover {
  color: var(--color-primary-hover);
}

.admin-header h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.2;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.admin-header p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  word-break: break-word;
  overflow-wrap: break-word;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
  padding: 1.5rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
}

/* Users Table */
.users-table-container {
  margin-top: 2rem;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  min-width: 800px;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

.users-table th {
  background-color: var(--color-bg-base);
  font-weight: 600;
  color: var(--color-text-main);
  position: sticky;
  top: 0;
}

.users-table tr:hover {
  background-color: var(--color-bg-base);
}

/* Badges */
.role-badge,
.visibility-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-admin {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-primary);
}

.badge-user {
  background-color: rgba(107, 114, 128, 0.1);
  color: var(--color-text-muted);
}

.badge-public {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-primary);
}

.badge-private {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.6rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn-action:hover:not(:disabled) {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-role:hover:not(:disabled) {
  border-color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.1);
}

.btn-visibility:hover:not(:disabled) {
  border-color: var(--color-primary);
  background-color: rgba(16, 185, 129, 0.1);
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .admin-container {
    padding: 1rem;
  }

  .admin-card {
    padding: 1rem;
  }

  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    gap: 0.75rem;
  }

  .admin-header > div {
    width: 100%;
  }

  .admin-header p {
    font-size: 0.85rem;
  }

  .admin-header .btn-secondary {
    align-self: flex-end;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .users-table {
    font-size: 0.8rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }

  .btn-action {
    padding: 0.3rem 0.4rem;
    font-size: 0.85rem;
  }
}
</style>