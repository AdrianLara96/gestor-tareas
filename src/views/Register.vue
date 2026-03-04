<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const { register, loading, error } = useAuth()
const successMessage = ref('')

const handleSubmit = async () => {
  // Validar que las contraseñas coinciden
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  
  const result = await register(email.value, password.value)
  
  if (result.success) {
    // ✅ Redirigir a profile para completar información
    router.push('/profile')
    
    // Mostrar mensaje de éxito antes de redirigir
    successMessage.value = '✅ Registro completado. Por favor, completa tu perfil.'
    
    // Limpiar el formulario
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
  }
}
</script>

<template>
  <div class="auth-container bg-base">
    <div class="auth-card card">
      <h1 class="text-main">Crear Cuenta</h1>
      
      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email" class="text-main">Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="tu@email.com"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="text-main">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="••••••••"
            minlength="6"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="text-main">Confirmar Contraseña:</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="••••••••"
            class="form-input"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="btn-primary full-width">
          {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>
      
      <p class="auth-link text-muted">
        ¿Ya tienes cuenta? 
        <router-link to="/login">Inicia sesión aquí</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

.auth-form {
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.full-width {
  width: 100%;
  margin: 1rem 0 0 0;
}

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

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.auth-link a {
  color: var(--color-primary);
  font-weight: 500;
}

.auth-link a:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}
</style>