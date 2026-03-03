import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

// Importar las vistas
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/login' // Redirigir a login al entrar a la raíz
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true } // Solo usuarios NO logueados
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true } // Solo usuarios NO logueados
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // Solo usuarios logueados
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ============================================
// GUARDIA DE NAVEGACIÓN GLOBAL
// ============================================
router.beforeEach(async (to, from, next) => {
  // Verificar si hay una sesión activa
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  // Ruta protegida: requiere autenticación
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login') // Redirigir a login
  }
  // Ruta para invitados: solo si NO está logueado
  else if (to.meta.requiresGuest && isLoggedIn) {
    next('/dashboard') // Redirigir a dashboard
  }
  // En cualquier otro caso, permitir navegación
  else {
    next()
  }
})

export default router