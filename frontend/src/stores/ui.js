import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  // Store de UI para controlar carregamentos globais.
  // Usamos um contador para suportar múltiplas requisições simultâneas.
  state: () => ({
    loadingCount: 0
  }),
  getters: {
    isLoading: (s) => s.loadingCount > 0
  },
  actions: {
    iniciar() { this.loadingCount += 1; },
    finalizar() { if (this.loadingCount > 0) this.loadingCount -= 1; },
    resetar() { this.loadingCount = 0; }
  }
});
