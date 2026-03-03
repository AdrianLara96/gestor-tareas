/**
 * ¿Qué es un composable? 
 * Es una función de Vue 3 que nos permite encapsular lógica reutilizable. 
 * En este caso, toda la lógica de autenticación estará en un solo lugar, limpio y ordenado.
 */

/**
 * Aquí centralizamos las funciones para registrarse, loguearse y cerrar sesión.
 */

import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useRouter } from 'vue-router'

// Variables de estado
const user = ref(null)
const loading = ref(false)
const error = ref(null)

// Función principal
export function useAuth() {
  const router = useRouter()

  // Verificar si hay una sesión activa al cargar la app (si el usuario ya está logueado)
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    return !!session
  }

  // Registro de nuevo usuario con email y contraseña
  const register = async (email, password) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (authError) throw authError
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Login/autenticación de usuario existente
  const login = async (email, password) => {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (authError) throw authError
      
      user.value = data.user
      router.push('/dashboard') // Redirigir al dashboard después de login
      
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Cerrar sesión
  const logout = async () => {
    loading.value = true
    
    try {
      await supabase.auth.signOut()
      user.value = null
      router.push('/login') // Redirigir al login después de logout
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Escuchar cambios en la autenticación (login/logout en otra pestaña, etc.) en tiempo real
  const initAuthListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user ?? null
    })
  }

  return {
    user,
    loading,
    error,
    checkSession,
    register,
    login,
    logout,
    initAuthListener
  }
}