<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const users = ref([])
const loading = ref(true)
const error = ref(null)

// Cargar usuarios públicos al montar el componente
onMounted(async () => {
  await fetchPublicUsers()
})

// Volver al dashboard
const goBack = () => {
  router.push('/dashboard')
}

// Obtener perfiles públicos desde Supabase
const fetchPublicUsers = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, bio, is_public')
      .eq('is_public', true)
      .order('full_name', { ascending: true, nullsFirst: false })

    if (fetchError) throw fetchError

    users.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error cargando usuarios públicos:', err)
  } finally {
    loading.value = false
  }
}

// Navegar al detalle de un usuario
const viewUserDetail = (userId) => {
  router.push(`/public/users/${userId}`)
}

// Generar iniciales para avatar placeholder
const getInitials = (fullName, email) => {
  if (fullName) {
    return fullName.charAt(0).toUpperCase()
  }
  if (email) {
    return email.charAt(0).toUpperCase()
  }
  return '?'
}
</script>

<template>
  <div class="gallery-container bg-base">
    <div class="gallery-header">
        <!-- Botón volver al dashboard -->
        <button @click="goBack" class="btn-back">
        ← Volver al Dashboard
        </button>
        <h1 class="text-main">🌍 Galería de Usuarios</h1>
        <p class="text-muted">Conoce a los miembros de nuestra comunidad</p>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchPublicUsers" class="btn-retry">Reintentar</button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state text-muted">
      <p>Cargando usuarios...</p>
    </div>

    <!-- Lista vacía -->
    <div v-else-if="users.length === 0" class="empty-state text-muted">
      <p>📭 Aún no hay usuarios públicos</p>
      <p class="text-muted">¡Sé el primero en hacer público tu perfil!</p>
    </div>

    <!-- Grid de usuarios -->
    <div v-else class="users-grid">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-card card"
        @click="viewUserDetail(user.id)"
      >
        <div class="user-avatar">
          <img
            v-if="user.avatar_url"
            :src="user.avatar_url"
            :alt="user.full_name || 'Avatar'"
            class="avatar-image"
            @error="e => e.target.style.display = 'none'"
          />
          <div v-else class="avatar-placeholder">
            <span>{{ getInitials(user.full_name, user.email) }}</span>
          </div>
        </div>

        <div class="user-info">
          <h3 class="user-name text-main">
            {{ user.full_name || 'Usuario anónimo' }}
          </h3>
          <p v-if="user.bio" class="user-bio text-muted">
            {{ user.bio.length > 100 ? user.bio.substring(0, 100) + '...' : user.bio }}
          </p>
          <p v-else class="user-bio text-muted">
            Sin biografía
          </p>
        </div>

        <div class="user-action">
          <span class="btn-view">Ver perfil →</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-back {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
  font-family: inherit;
}

.btn-back:hover {
  color: var(--color-primary-hover);
}

.gallery-container {
  min-height: 100vh;
  padding: 2rem;
}

.gallery-header {
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.gallery-header h1 {
  margin-bottom: 0.5rem;
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-retry {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-retry:hover {
  background-color: #dc2626;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.user-card {
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid var(--color-border);
  background-color: var(--color-bg-base);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-text-muted);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.user-bio {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  min-height: 3em;
}

.user-action {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  width: 100%;
}

.btn-view {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.user-card:hover .btn-view {
  color: var(--color-primary-hover);
}
</style>