import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    name: 'DigitalTwin',
    component: () => import('../views/DigitalTwin.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/devices',
    name: 'Devices',
    component: () => import('../views/Devices.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ipam',
    name: 'IPAM',
    component: () => import('../views/IPAM.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && userStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
