<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const { initAuthListener, checkSession } = useAuth()

onMounted(async () => {
  // Iniciar el listener de cambios de autenticación
  initAuthListener()
  
  // Verificar si hay sesión al cargar la app
  await checkSession()
})
</script>

<template>
  <router-view />
</template>

<style scoped>
/* Sin estilos específicos, todo va en las vistas */
</style>