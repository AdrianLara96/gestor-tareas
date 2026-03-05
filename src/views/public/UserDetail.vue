<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const loading = ref(true)
const error = ref(null)

// Obtener el ID del usuario desde la URL
const userId = computed(() => route.params.id)

// Cargar datos del usuario al montar
onMounted(async () => {
  await fetchUserDetail()
})

// Obtener perfil del usuario desde Supabase
const fetchUserDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url, bio, is_public, created_at')
      .eq('id', userId.value)
      .eq('is_public', true) // Solo perfiles públicos
      .single()

    if (fetchError) throw fetchError

    if (!data) {
      error.value = 'Usuario no encontrado o no es público'
      return
    }

    user.value = data
  } catch (err) {
    error.value = err.message
    console.error('Error cargando detalle de usuario:', err)
  } finally {
    loading.value = false
  }
}

// Volver a la galería
const goBack = () => {
  router.push('/public/users')
}

// Formatear fecha de registro
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
  <div class="detail-container bg-base">
    <div class="detail-card card">
      
      <!-- Botón volver -->
      <button @click="goBack" class="btn-back">
        ← Volver a la galería
      </button>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="goBack" class="btn-return">Volver a la galería</button>
      </div>

      <!-- Estado de carga -->
      <div v-else-if="loading" class="loading-state text-muted">
        <p>Cargando perfil...</p>
      </div>

      <!-- Perfil del usuario -->
      <div v-else-if="user" class="user-profile">
        
        <!-- Avatar -->
        <div class="profile-avatar">
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

        <!-- Información principal -->
        <div class="profile-info">
          <h1 class="profile-name text-main">
            {{ user.full_name || 'Usuario anónimo' }}
          </h1>
          
          <p v-if="user.email" class="profile-email text-muted">
            📧 {{ user.email }}
          </p>

          <p class="profile-member-since text-muted">
            📅 Miembro desde {{ formatDate(user.created_at) }}
          </p>
        </div>

        <!-- Biografía -->
        <div v-if="user.bio" class="profile-bio-section">
          <h2 class="bio-title text-main">Sobre mí</h2>
          <p class="profile-bio text-muted">
            {{ user.bio }}
          </p>
        </div>
        <div v-else class="profile-bio-section">
          <p class="text-muted">
            Este usuario no ha añadido una biografía.
          </p>
        </div>

        <!-- Badge de perfil público -->
        <div class="public-badge">
          <span class="badge-icon">🌍</span>
          <span class="badge-text">Perfil Público</span>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.detail-container {
  min-height: 100vh;
  padding: 2rem;
}

.detail-card {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

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

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-return {
  display: block;
  margin: 1rem auto 0;
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-return:hover {
  background-color: #dc2626;
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
}

.user-profile {
  text-align: center;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--color-border);
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
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-text-muted);
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.profile-info {
  margin-bottom: 2rem;
}

.profile-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.profile-email {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.profile-member-since {
  margin: 0.5rem 0;
  font-size: 0.85rem;
}

.profile-bio-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: var(--color-bg-base);
  border-radius: 0.375rem;
  text-align: left;
}

.bio-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  text-align: left;
}

.profile-bio {
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.public-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-primary);
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 1rem;
}

.badge-icon {
  font-size: 1rem;
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .detail-container {
    padding: 1rem;
  }

  .detail-card {
    padding: 1rem;
  }

  .profile-avatar {
    width: 120px;
    height: 120px;
  }

  .avatar-placeholder {
    font-size: 2.5rem;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .profile-email {
    font-size: 0.85rem;
  }

  .profile-member-since {
    font-size: 0.8rem;
  }

  .profile-bio-section {
    padding: 1rem;
  }

  .bio-title {
    font-size: 1.1rem;
  }

  .profile-bio {
    font-size: 0.9rem;
  }
}
</style>