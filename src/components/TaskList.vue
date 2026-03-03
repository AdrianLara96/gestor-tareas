<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()
const emit = defineEmits(['edit-task', 'task-deleted'])

const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const deletingId = ref(null)

// Obtener tareas del usuario
const fetchTasks = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    tasks.value = data || []
  } catch (err) {
    error.value = err.message
    console.error('Error obteniendo tareas:', err)
  } finally {
    loading.value = false
  }
}

// Marcar/desmarcar como completada
const toggleCompleted = async (task) => {
  try {
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id)

    if (updateError) throw updateError

    // Actualizar localmente para feedback inmediato
    task.is_completed = !task.is_completed
  } catch (err) {
    error.value = err.message
    console.error('Error actualizando tarea:', err)
  }
}

// Marcar/desmarcar como pospuesta
const togglePostponed = async (task) => {
  try {
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ is_postponed: !task.is_postponed })
      .eq('id', task.id)

    if (updateError) throw updateError

    // Actualizar localmente
    task.is_postponed = !task.is_postponed
  } catch (err) {
    error.value = err.message
    console.error('Error actualizando tarea:', err)
  }
}

// Eliminar tarea (con confirmación)
const deleteTask = async (task) => {
  if (!confirm(`¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`)) {
    return
  }

  deletingId.value = task.id

  try {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)

    if (deleteError) throw deleteError

    // Eliminar localmente
    tasks.value = tasks.value.filter(t => t.id !== task.id)
    emit('task-deleted', task.id)
  } catch (err) {
    error.value = err.message
    console.error('Error eliminando tarea:', err)
  } finally {
    deletingId.value = null
  }
}

// Formatear fecha para mostrar
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Cargar tareas al montar el componente
onMounted(() => {
  fetchTasks()
})

// Exponer método para recargar desde el padre
defineExpose({
  refreshTasks: fetchTasks
})
</script>

<template>
  <div class="task-list">
    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchTasks" class="btn-retry">Reintentar</button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state text-muted">
      <p>Cargando tareas...</p>
    </div>

    <!-- Lista vacía -->
    <div v-else-if="tasks.length === 0" class="empty-state text-muted">
      <p>📭 No tienes tareas todavía</p>
      <p class="text-muted">¡Crea tu primera tarea para comenzar!</p>
    </div>

    <!-- Lista de tareas -->
    <div v-else class="tasks-container">
      <div
        v-for="task in tasks"
        :key="task.id"
        class="task-item card"
        :class="{
          'task-completed': task.is_completed,
          'task-postponed': task.is_postponed && !task.is_completed
        }"
      >
        <div class="task-header">
          <input
            type="checkbox"
            :checked="task.is_completed"
            @change="toggleCompleted(task)"
            class="task-checkbox"
            :disabled="deletingId === task.id"
          />
          <h3 class="task-title" :class="{ 'text-muted': task.is_completed }">
            {{ task.title }}
          </h3>
        </div>

        <p v-if="task.description" class="task-description text-muted">
          {{ task.description }}
        </p>

        <div class="task-meta">
          <span v-if="task.due_date" class="task-due-date" :class="{ 'overdue': new Date(task.due_date) < new Date() && !task.is_completed }">
            📅 {{ formatDate(task.due_date) }}
          </span>
          <span v-if="task.is_postponed && !task.is_completed" class="badge-postponed">
            ⏸️ Pospuesta
          </span>
          <span v-if="task.is_completed" class="badge-completed">
            ✅ Completada
          </span>
        </div>

        <div class="task-actions">
          <button
            @click="togglePostponed(task)"
            class="btn-action btn-postpone"
            :disabled="deletingId === task.id || task.is_completed"
            :title="task.is_postponed ? 'Quitar posposición' : 'Posponer tarea'"
          >
            {{ task.is_postponed ? '↩️' : '⏸️' }}
          </button>
          <button
            @click="emit('edit-task', task)"
            class="btn-action btn-edit"
            :disabled="deletingId === task.id"
            title="Editar tarea"
          >
            ✏️
          </button>
          <button
            @click="deleteTask(task)"
            class="btn-action btn-delete"
            :disabled="deletingId === task.id"
            title="Eliminar tarea"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  width: 100%;
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

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.task-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-completed {
  opacity: 0.6;
  background-color: rgba(34, 197, 94, 0.05);
}

.task-completed .task-title {
  text-decoration: line-through;
}

.task-postponed {
  border-left: 4px solid #f59e0b;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.task-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.task-description {
  margin: 0.5rem 0 0.5rem 2rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  margin-left: 2rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
}

.task-due-date {
  color: var(--color-text-muted);
}

.task-due-date.overdue {
  color: #ef4444;
  font-weight: 500;
}

.badge-postponed,
.badge-completed {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-postponed {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.badge-completed {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
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

.btn-delete:hover:not(:disabled) {
  border-color: #ef4444;
  color: #ef4444;
}
</style>