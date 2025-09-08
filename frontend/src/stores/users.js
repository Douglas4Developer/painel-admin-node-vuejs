import { defineStore } from 'pinia'
import api from '@/services/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    meta: { total: 0, page: 1, limit: 10 },
    loading: false,
  }),
  actions: {
    async fetchUsers({ q, role_id, status = 'active', page = 1, limit = 10 }) {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (q) params.set('q', q)
        if (role_id) params.set('role_id', role_id)
        if (status) params.set('status', status)
        params.set('page', page.toString())
        params.set('limit', limit.toString())

        const { data } = await api.get(`/users?${params.toString()}`)
        this.users = data.items || []
        this.meta = data.meta || { total: 0, page, limit }
      } finally {
        this.loading = false
      }
    },

    async deactivate(id) {
      await api.patch(`/users/${id}/deactivate`)
    },

    // === USE ESTES NOMES, que o UserForm vai chamar ===
    async createUser(payload) {
      // payload esperado: { name, email, password, isActive, role_ids: number[] }
      const { data } = await api.post('/users', payload)
      return data
    },

    async updateUser(id, payload) {
      // payload esperado: { name?, email?, isActive?, role_ids? }
      const { data } = await api.put(`/users/${id}`, payload)
      return data
    },

    async setRoles(id, roleIds) {
      const payload = { roleIds: (roleIds || []).filter(Boolean).map(String) }
      const { data } = await api.post(`/users/${id}/roles`, payload)
      return data
    },

 
    async update(id, payload) {
      const { data } = await api.put(`/users/${id}`, payload)
      return data
    },
  },
})
