import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials)
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('token', token.value)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
