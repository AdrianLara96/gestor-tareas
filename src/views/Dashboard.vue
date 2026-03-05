<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../lib/supabase'
import TaskForm from '../components/TaskForm.vue'
import TaskList from '../components/TaskList.vue'

const { user, logout } = useAuth()

// Estado del formulario
const showForm = ref(false)
const taskToEdit = ref(null)
const taskListRef = ref(null)

const isAdmin = ref(false)

// Verificar si el usuario es admin al montar
onMounted(async () => {
  if (user.value) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    
    if (!profileError && profile) {
      isAdmin.value = profile.role === 'admin'
      
    }
  }
})

// Manejar creación de tarea
const handleTaskCreated = (newTask) => {
  console.log('Tarea creada:', newTask)
  showForm.value = false
  // Recargar la lista
  taskListRef.value?.refreshTasks()
}

// Manejar actualización de tarea
const handleTaskUpdated = (updatedTask) => {
  console.log('Tarea actualizada:', updatedTask)
  showForm.value = false
  taskToEdit.value = null
  // Recargar la lista
  taskListRef.value?.refreshTasks()
}

// Abrir formulario para editar
const handleEditTask = (task) => {
  taskToEdit.value = task
  showForm.value = true
}

// Cerrar formulario
const handleCloseForm = () => {
  showForm.value = false
  taskToEdit.value = null
}

// Manejar eliminación
const handleTaskDeleted = () => {
  console.log('Tarea eliminada')
  // La lista ya se actualiza automáticamente en TaskList
}

// Obtener nombre para mostrar en el welcome
const getWelcomeName = () => {
  if (user.value?.user_metadata?.full_name) {
    return user.value.user_metadata.full_name
  }
  if (user.value?.email) {
    // Mostrar solo la parte antes del @
    return user.value.email.split('@')[0]
  }
  return 'Usuario'
}
</script>

<template>
  <div class="dashboard-container bg-base">
    <div class="dashboard-card card">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1 class="text-main">📋 Gestor de Tareas</h1>
          <div class="header-buttons">
            <router-link to="/profile" class="btn-profile">
              👤 Mi Perfil
            </router-link>
            <router-link to="/public/users" class="btn-gallery">
              🌍 Galería
            </router-link>
            <router-link v-if="isAdmin" to="/admin" class="btn-admin">
              🔐 Admin
            </router-link>
          </div>
        </div>
        <button @click="logout" class="btn-secondary">
          Cerrar Sesión
        </button>
      </header>

      <!-- Info del usuario -->
      <div class="user-info text-muted">
        <p class="user-info-text">Bienvenido, <strong>{{ getWelcomeName() }}</strong></p>
      </div>

      <!-- Botón nueva tarea -->
      <div class="dashboard-actions">
        <button @click="showForm = true" class="btn-primary">
          ➕ Nueva Tarea
        </button>
      </div>

      <!-- Lista de tareas -->
      <TaskList
        ref="taskListRef"
        @edit-task="handleEditTask"
        @task-deleted="handleTaskDeleted"
      />
    </div>

    <!-- Formulario modal (solo se muestra si showForm es true) -->
    <TaskForm
      v-if="showForm"
      :taskToEdit="taskToEdit"
      @task-created="handleTaskCreated"
      @task-updated="handleTaskUpdated"
      @close-form="handleCloseForm"
    />
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  padding: 2rem;
}

.dashboard-card {
  max-width: 800px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  gap: 1rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.dashboard-header h1 {
  font-size: 1.8rem;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-profile,
.btn-gallery,
.btn-admin {
  background-color: transparent;
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.5rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-profile:hover,
.btn-gallery:hover,
.btn-admin:hover {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-admin {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn-admin:hover {
  background-color: rgba(245, 158, 11, 0.1);
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
  margin-left: 0.5rem;
}

.btn-secondary:hover {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.user-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--color-bg-base);
  border-radius: 0.375rem;
  overflow: hidden; 
}

.user-info-text {
  margin: 0;
  word-break: break-word; 
  overflow-wrap: break-word;
  max-width: 100%;
}



.dashboard-actions {
  margin-bottom: 2rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .header-buttons {
    width: 100%;
    justify-content: flex-start;
  }

  .btn-profile,
  .btn-gallery,
  .btn-admin {
    flex: 1;
    text-align: center;
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
  }

  .dashboard-header h1 {
    font-size: 1.4rem;
  }

  .user-info {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .user-info-text {
    font-size: 0.9rem;
  }
}
</style>