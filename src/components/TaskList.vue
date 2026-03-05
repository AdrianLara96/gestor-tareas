<script setup>
/* Importaciones */
import { ref, onMounted, defineEmits, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'

/* Composables y props */
const { user } = useAuth()
const emit = defineEmits(['edit-task', 'task-deleted'])

/* Estado */
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const deletingId = ref(null)
const currentFilter = ref('all')
const searchQuery = ref('')
const searchTimeout = ref(null)

/* Funciones */

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

// Definición de filtros disponibles
const filters = computed(() => [
  { 
    value: 'all', 
    label: 'Todas',
    count: tasks.value.length
  },
  { 
    value: 'pending', 
    label: 'Pendientes',
    count: tasks.value.filter(t => !t.is_completed && !t.is_postponed).length
  },
  { 
    value: 'completed', 
    label: 'Completadas',
    count: tasks.value.filter(t => t.is_completed).length
  },
  { 
    value: 'postponed', 
    label: 'Pospuestas',
    count: tasks.value.filter(t => t.is_postponed && !t.is_completed).length
  }
])

// Tareas filtradas y buscadas (lógica combinada)
const filteredTasks = computed(() => {
  let result = [...tasks.value]

  // 1. Aplicar filtro por estado
  if (currentFilter.value === 'pending') {
    result = result.filter(t => !t.is_completed && !t.is_postponed)
  } else if (currentFilter.value === 'completed') {
    result = result.filter(t => t.is_completed)
  } else if (currentFilter.value === 'postponed') {
    result = result.filter(t => t.is_postponed && !t.is_completed)
  }

  // 2. Aplicar búsqueda por texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    )
  }

  return result
})

// Manejar input de búsqueda con debounce simple (300ms)
const handleSearchInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  searchTimeout.value = setTimeout(() => {
    // La búsqueda se aplica automáticamente vía computed
    console.log('Búsqueda aplicada:', searchQuery.value)
  }, 300)
}

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = ''
}

// Resetear filtros al recargar tareas (opcional)
const resetFilters = () => {
  currentFilter.value = 'all'
  searchQuery.value = ''
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

/* onMounted */
// Cargar tareas al montar el componente
onMounted(() => {
  fetchTasks()
})

/* defioneExpose */
// Exponer método para que el padre pueda resetear si es necesario
defineExpose({
  refreshTasks: fetchTasks,
  resetFilters
})
</script>

<template>
  <div class="task-list">
    <!-- Filtros y Búsqueda -->
    <div class="task-filters">
      
      <!-- Botones de filtro -->
      <div class="filter-buttons" role="tablist">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="currentFilter = filter.value"
          class="filter-btn"
          :class="{ active: currentFilter === filter.value }"
          role="tab"
          :aria-selected="currentFilter === filter.value"
        >
          {{ filter.label }}
          <span v-if="filter.count !== undefined" class="filter-count">
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- Barra de búsqueda -->
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="🔍 Buscar tareas..."
          class="search-input"
          @input="handleSearchInput"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="search-clear"
          aria-label="Limpiar búsqueda"
        >
          ✕
        </button>
      </div>

      <!-- Contador de resultados -->
      <p class="results-count text-muted">
        Mostrando {{ filteredTasks.length }} de {{ tasks.length }} tareas
      </p>
    </div>
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

    <!-- Estado vacío cuando hay tareas pero no coinciden con filtro/búsqueda -->
    <div
      v-else-if="filteredTasks.length === 0"
      class="empty-state-filtered"
    >
      <p>😕 No se encontraron tareas</p>
      <p class="text-muted">
        {{ searchQuery ? 'Intenta con otra búsqueda' : 'Prueba con otro filtro' }}
      </p>
      <button @click="resetFilters" class="btn-reset">
        Ver todas las tareas
      </button>
    </div>

    <!-- Lista de tareas -->
    <div v-else class="tasks-container">
      <div
        v-for="task in filteredTasks"
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
.tasks-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

/* FILTROS Y BÚSQUEDA */
.task-filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--color-bg-base);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-btn {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-family: inherit;
}

.filter-btn:hover {
  background-color: var(--color-bg-surface);
  border-color: var(--color-primary);
}

.filter-btn.active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
  font-weight: 500;
}

.filter-count {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.1rem 0.4rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.filter-btn.active .filter-count {
  background-color: rgba(255, 255, 255, 0.2);
}

.search-box {
  position: relative;
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.9rem;
  background-color: var(--color-bg-surface);
  color: var(--color-text-main);
  font-family: inherit;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1rem;
  line-height: 1;
}

.search-clear:hover {
  color: var(--color-text-main);
}

.results-count {
  margin: 0;
  font-size: 0.8rem;
  text-align: right;
}

.task-list {
  width: 100%;
}

.task-item {
  padding: 1rem;
  transition: all 0.2s ease;
  position: relative;
}

.task-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.task-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
  accent-color: var(--color-primary);
  flex-shrink: 0;
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.task-description {
  margin: 0.5rem 0 0.5rem 2rem;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
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
  flex-wrap: wrap;
}

.btn-action {
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 0.4rem 0.6rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  flex-shrink: 0;
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

/* Estado vacío específico para búsqueda/filtro */
.empty-state-filtered {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-text-muted);
}

.empty-state-filtered p {
  margin: 0.5rem 0;
}

.empty-state-filtered .btn-reset {
  margin-top: 1rem;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .task-filters {
    padding: 0.75rem;
    margin-bottom: 1rem;
  }

  .filter-buttons {
    gap: 0.4rem;
  }

  .filter-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .search-input {
    padding: 0.5rem 2.2rem 0.5rem 0.8rem;
    font-size: 0.85rem;
  }

  .results-count {
    text-align: left;
    margin-top: 0.5rem;
  }
  
  .task-item {
    padding: 0.75rem;
  }

  .task-header {
    gap: 0.5rem;
  }

  .task-title {
    font-size: 1rem;
  }

  .task-description {
    margin-left: 0;
    font-size: 0.85rem;
  }

  .task-meta {
    margin-left: 0;
    gap: 0.5rem;
  }

  .task-actions {
    justify-content: flex-start;
    gap: 0.4rem;
  }

  .btn-action {
    padding: 0.3rem 0.5rem;
    font-size: 0.9rem;
  }
}
</style>