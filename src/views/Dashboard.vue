<script setup>
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
</script>

<template>
  <div class="dashboard-container bg-base">
    <div class="dashboard-card card">
      <header class="dashboard-header">
        <h1 class="text-main">📋 Gestor de Tareas</h1>
        <button @click="logout" class="btn-secondary">
          Cerrar Sesión
        </button>
      </header>
      
      <div class="user-info text-muted">
        <p>Bienvenido, <strong>{{ user?.email }}</strong></p>
      </div>
      
      <div class="dashboard-content">
        <p class="text-muted">Aquí aparecerá tu lista de tareas próximamente...</p>
      </div>
    </div>
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

.dashboard-content {
  text-align: center;
  padding: 3rem 0;
}
</style>