<script setup>
import { ref, defineEmits } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from '../composables/useAuth'

const { user } = useAuth()

// Props para modo edición 
const props = defineProps({
  taskToEdit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['task-created', 'task-updated', 'close-form'])

// Estado del formulario
const title = ref(props.taskToEdit?.title || '')
const description = ref(props.taskToEdit?.description || '')
const dueDate = ref(props.taskToEdit?.due_date || '')
const loading = ref(false)
const error = ref(null)

// Determinar si estamos en modo edición
const isEditMode = !!props.taskToEdit

// Crear nueva tarea
const createTask = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.value.id,
          title: title.value,
          description: description.value,
          due_date: dueDate.value || null,
          is_completed: false,
          is_postponed: false
        }
      ])
      .select()

    if (insertError) throw insertError

    emit('task-created', data[0])
    resetForm()
  } catch (err) {
    error.value = err.message
    console.error('Error creando tarea:', err)
  } finally {
    loading.value = false
  }
}

// Actualizar tarea existente
const updateTask = async () => {
  loading.value = true
  error.value = null

  try {
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update({
        title: title.value,
        description: description.value,
        due_date: dueDate.value || null
      })
      .eq('id', props.taskToEdit.id)
      .select()

    if (updateError) throw updateError

    emit('task-updated', data[0])
    resetForm()
  } catch (err) {
    error.value = err.message
    console.error('Error actualizando tarea:', err)
  } finally {
    loading.value = false
  }
}

// Enviar formulario
const handleSubmit = async () => {
  if (isEditMode) {
    await updateTask()
  } else {
    await createTask()
  }
}

// Resetear formulario
const resetForm = () => {
  title.value = ''
  description.value = ''
  dueDate.value = ''
  error.value = null
  emit('close-form')
}

// Cancelar y cerrar
const handleCancel = () => {
  resetForm()
}
</script>

<template>
  <div class="task-form-overlay" @click.self="handleCancel">
    <div class="task-form-card card">
      <h2 class="text-main">
        {{ isEditMode ? '✏️ Editar Tarea' : '📝 Nueva Tarea' }}
      </h2>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="task-form">
        <div class="form-group">
          <label for="title" class="text-main">Título *</label>
          <input
            type="text"
            id="title"
            v-model="title"
            required
            placeholder="Ej: Comprar leche"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="description" class="text-main">Descripción</label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Detalles opcionales..."
            class="form-input textarea"
            :disabled="loading"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="dueDate" class="text-main">Fecha límite</label>
          <input
            type="datetime-local"
            id="dueDate"
            v-model="dueDate"
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-actions">
          <button
            type="button"
            @click="handleCancel"
            class="btn-secondary"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Tarea') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.task-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.task-form-card {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  margin: auto;
}

.task-form {
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

.form-input.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.form-actions button {
  min-width: 120px;
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
  font-weight: 500;
}

.btn-secondary:hover {
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
  margin: 0;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

h2 {
  margin: 0;
  font-size: 1.5rem;
}

/* Responsive para móviles */
@media (max-width: 640px) {
  .task-form-overlay {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .task-form-card {
    max-height: 95vh;
    margin: 0;
  }

  .task-form-card h2 {
    font-size: 1.3rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .form-actions button {
    width: 100%;
    min-width: auto;
  }
}
</style>