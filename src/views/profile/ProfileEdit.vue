<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import { useStorage } from '../../composables/useStorage'

const { user } = useAuth()
const { uploadFile, uploading: uploadingAvatar } = useStorage()
const router = useRouter()

// Estado del formulario
const fullName = ref('')
const bio = ref('')
const avatarUrl = ref('')
const isPublic = ref(false)
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const successMessage = ref('')

// Referencia al input de archivo
const fileInput = ref(null)
const selectedFile = ref(null)

// Cargar datos del perfil al montar
onMounted(async () => {
  await loadProfile()
})

// Volver al dashboard
const goBack = () => {
  router.push('/dashboard')
}

// Cargar perfil del usuario desde la base de datos
const loadProfile = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (fetchError) throw fetchError

    if (data) {
      fullName.value = data.full_name || ''
      bio.value = data.bio || ''
      avatarUrl.value = data.avatar_url || ''
      isPublic.value = data.is_public || false
    }
  } catch (err) {
    error.value = err.message
    console.error('Error cargando perfil:', err)
  } finally {
    loading.value = false
  }
}

// Manejar selección de archivo de avatar
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  
  if (!file) return

  // Validar tipo de archivo
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    error.value = 'Solo se permiten imágenes PNG, JPG o WEBP'
    return
  }

  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'La imagen no puede superar los 5MB'
    return
  }

  selectedFile.value = file
  error.value = null
  console.log('Archivo seleccionado:', file.name, file.type, file.size)
}

// Subir avatar a Storage
const uploadAvatar = async () => {
  if (!selectedFile.value) {
    console.log('No hay archivo para subir')
    return null
  }

  // Crear ruta única: avatars/user-id/avatar-timestamp.jpg
  const fileExtension = selectedFile.value.name.split('.').pop()
  const path = `${user.value.id}/avatar-${Date.now()}.${fileExtension}`

  console.log('Subiendo avatar a:', path)  // ← Debug

  const result = await uploadFile(selectedFile.value, 'avatars', path)

  console.log('Resultado de subida:', result)  // ← Debug

  if (result.success) {
    console.log('Avatar subido correctamente, URL:', result.url)
    return result.url
  } else {
    console.error('Error subiendo avatar:', result.error)
    throw new Error(result.error)
  }
}

// Guardar cambios del perfil
const saveProfile = async () => {
  saving.value = true
  error.value = null
  successMessage.value = ''

  try {
    let newAvatarUrl = avatarUrl.value

    // Si hay un nuevo archivo seleccionado, subirlo primero
    if (selectedFile.value) {
      console.log('Hay nuevo archivo, subiendo...')
      newAvatarUrl = await uploadAvatar()
      console.log('Nueva URL de avatar:', newAvatarUrl)
    }

    console.log('Guardando perfil con avatar_url:', newAvatarUrl)

    // Actualizar perfil en la base de datos
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.value,
        bio: bio.value,
        avatar_url: newAvatarUrl,
        is_public: isPublic.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.value.id)
      .select()  // ← Para ver qué se guardó

    if (updateError) {
      console.error('Error de actualización:', updateError)
      throw updateError
    }

    console.log('Perfil actualizado:', data)

    // Actualizar avatarUrl con la nueva URL
    avatarUrl.value = newAvatarUrl
    selectedFile.value = null // Limpiar archivo seleccionado

    successMessage.value = '✅ Perfil actualizado correctamente'
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (err) {
    error.value = err.message
    console.error('Error guardando perfil:', err)
  } finally {
    saving.value = false
  }
}

// Cancelar y recargar datos originales
const cancelEdit = async () => {
  await loadProfile()
  successMessage.value = ''
  error.value = ''
}

// Vista previa del avatar seleccionado
const avatarPreview = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value)
  }
  return avatarUrl.value
})

// Activar el input de archivo programáticamente
const triggerFileInput = () => {
  fileInput.value?.click()
}
</script>

<template>
  <div class="profile-container bg-base">
    <div class="profile-card card">
        <button @click="goBack" class="btn-back">
         ← Volver al Dashboard
        </button>
        
        <h1 class="text-main">👤 Mi Perfil</h1>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state text-muted">
        <p>Cargando perfil...</p>
      </div>

      <!-- Formulario de perfil -->
      <form v-else @submit.prevent="saveProfile" class="profile-form">
        
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-preview">
            <img
              v-if="avatarPreview"
              :src="avatarPreview"
              alt="Avatar"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <span>{{ fullName?.charAt(0) || user?.email?.charAt(0) || '?' }}</span>
            </div>
          </div>
          
          <div class="avatar-actions">
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="file-input"
              :disabled="uploadingAvatar"
            />
            <button
            type="button"
            @click="triggerFileInput"  
            class="btn-secondary"
            :disabled="uploadingAvatar"
            >
            {{ avatarUrl ? 'Cambiar avatar' : 'Subir avatar' }}
            </button>
            <button
              v-if="avatarUrl"
              type="button"
              @click="avatarUrl = ''; selectedFile = null"
              class="btn-danger"
              :disabled="uploadingAvatar"
            >
              Eliminar
            </button>
          </div>
          
          <p v-if="uploadingAvatar" class="text-muted">
            Subiendo imagen...
          </p>
          <p class="avatar-hint text-muted">
            PNG, JPG o WEBP. Máximo 5MB.
          </p>
        </div>

        <!-- Campo: Nombre completo -->
        <div class="form-group">
          <label for="fullName" class="text-main">Nombre completo</label>
          <input
            type="text"
            id="fullName"
            v-model="fullName"
            placeholder="Tu nombre completo"
            class="form-input"
            :disabled="saving"
          />
        </div>

        <!-- Campo: Email (solo lectura) -->
        <div class="form-group">
          <label for="email" class="text-main">Email</label>
          <input
            type="email"
            id="email"
            :value="user?.email"
            disabled
            class="form-input disabled"
          />
          <p class="form-hint text-muted">
            El email no se puede modificar desde aquí
          </p>
        </div>

        <!-- Campo: Biografía -->
        <div class="form-group">
          <label for="bio" class="text-main">Biografía</label>
          <textarea
            id="bio"
            v-model="bio"
            placeholder="Cuéntanos algo sobre ti..."
            class="form-input textarea"
            rows="4"
            :disabled="saving"
          ></textarea>
          <p class="form-hint text-muted">
            Opcional. Se mostrará en tu perfil público.
          </p>
        </div>

        <!-- Toggle: Perfil público -->
        <div class="form-group">
          <label class="toggle-label">
            <input
              type="checkbox"
              v-model="isPublic"
              :disabled="saving"
              class="toggle-checkbox"
            />
            <span class="toggle-text text-main">
              Perfil público
            </span>
          </label>
          <p class="form-hint text-muted">
            Si activas esta opción, tu perfil aparecerá en la galería pública.
          </p>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button
            type="button"
            @click="cancelEdit"
            class="btn-secondary"
            :disabled="saving || uploadingAvatar"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="saving || uploadingAvatar"
          >
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
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

.profile-container {
  min-height: 100vh;
  padding: 2rem;
}

.profile-card {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-form {
  margin-top: 1.5rem;
}

/* Avatar Section */
.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border);
}

.avatar-preview {
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-bg-base);
  border: 3px solid var(--color-border);
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

.avatar-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

.btn-danger {
  background-color: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

.btn-danger:hover:not(:disabled) {
  background-color: #ef4444;
  color: white;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  margin-top: 0.5rem;
}

.form-input.textarea {
  resize: vertical;
  min-height: 100px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--color-bg-base);
}

.form-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

/* Toggle Switch */
.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--color-primary);
}

.toggle-text {
  font-weight: 500;
}

/* Messages */
.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-message {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.9rem;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  margin:0;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-card {
    padding: 1rem;
  }

  .profile-card h1 {
    font-size: 1.4rem;
  }

  .avatar-section {
    padding-bottom: 1rem;
  }

  .avatar-preview {
    width: 120px;
    height: 120px;
  }

  .avatar-placeholder {
    font-size: 2.5rem;
  }

  .avatar-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .avatar-actions button {
    width: 100%;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>