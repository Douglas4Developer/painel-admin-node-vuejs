import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: { id: null, name: null, email: null, roles: [] },
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken
  },
  actions: {
    async login(email, password) {
      const res = await api.post('/auth/login', { email, password });
      this.setTokens(res.data.accessToken, res.data.refreshToken);
      await this.fetchMe(); 
      return res;
    },
    async fetchMe() {
      // Se não há token, não chama
      if (!this.accessToken) return;
      const { data } = await api.get('/auth/me');
      this.user = { ...this.user, ...data }; // mantém reatividade
      return data;
    },
    async refresh() {
      if (!this.refreshToken) throw new Error('No refresh token');
      const res = await api.post('/auth/refresh', { refresh_token: this.refreshToken });
      this.setTokens(res.data.accessToken, res.data.refreshToken);
    },
    async logout() {
      try {
        await api.post('/auth/logout', { refresh_token: this.refreshToken });
      } catch (err) {
       // ignorar erros no logout
      }
      this.clearTokens();
      this.user = { id: null, name: null, email: null, roles: [] };
    },
    setTokens(accessToken, refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens() {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
});