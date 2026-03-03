<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import TaskForm from '../components/TaskForm.vue'
import TaskList from '../components/TaskList.vue'

const { user, logout } = useAuth()

// Estado del formulario
const showForm = ref(false)
const taskToEdit = ref(null)
const taskListRef = ref(null)

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
</script>

<template>
  <div class="dashboard-container bg-base">
    <div class="dashboard-card card">
      <!-- Header -->
      <header class="dashboard-header">
        <h1 class="text-main">📋 Gestor de Tareas</h1>
        <button @click="logout" class="btn-secondary">
          Cerrar Sesión
        </button>
      </header>

      <!-- Info del usuario -->
      <div class="user-info text-muted">
        <p>Bienvenido, <strong>{{ user?.email }}</strong></p>
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
}

.dashboard-header h1 {
  font-size: 1.8rem;
  margin: 0;
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

.user-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--color-bg-base);
  border-radius: 0.375rem;
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
</style>