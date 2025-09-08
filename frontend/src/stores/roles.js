import { defineStore } from 'pinia';
import api from '../services/api';

export const useRolesStore = defineStore('roles', {
  state: () => ({ roles: [] }),
  actions: {
    async fetchRoles() {
      const res = await api.get('/roles');
      this.roles = res.data.data;
    },
    async createRole(data) {
      const res = await api.post('/roles', data);
      await this.fetchRoles();
      return res.data;
    },
    async updateRole(id, data) {
      const res = await api.put(`/roles/${id}`, data);
      await this.fetchRoles();
      return res.data;
    },
    async deleteRole(id) {
      await api.delete(`/roles/${id}`);
      await this.fetchRoles();
    }
  }
});