import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

// Importar las vistas
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import ProfileEdit from '../views/profile/ProfileEdit.vue'

// Nuevas vistas para la galería pública 
import UserGallery from '../views/public/UserGallery.vue'
import UserDetail from '../views/public/UserDetail.vue'

// Nuevas vistas para admin
import AdminDashboard from '../views/admin/AdminDashboard.vue'

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
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileEdit,
    meta: { requiresAuth: true } // Solo usuarios logueados
  },
  {
    path: '/public/users',
    name: 'UserGallery',
    component: UserGallery,
    meta: { requiresAuth: false } // Público (cualquiera puede ver)
  },
  {
    path: '/public/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    meta: { requiresAuth: false } // Público (cualquiera puede ver)
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true } // Solo admins
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
  // Ruta para admins: verificar rol
  else if (to.meta.requiresAdmin && isLoggedIn) {
    // Verificar si el usuario tiene rol de admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      next('/dashboard') // No es admin, redirigir a dashboard
    } else {
      next() // Es admin, permitir acceso
    }
  }  
  // En cualquier otro caso, permitir navegación
  else {
    next()
  }
})

export default router