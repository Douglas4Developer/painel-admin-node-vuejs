import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useUiStore } from '../stores/ui';
import router from '../router';  // importa o roteador para redirecionar ao login 

// Configuração da instância Axios para chamadas à API backend
// Inclui interceptors para gerenciar tokens e loading global

// Base URL da API, configurável via variável de ambiente

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api')
  .replace(/\/$/, ''); // remove barra final

  
const instance = axios.create({
  baseURL: BASE,
  // withCredentials: true // ligue se usar cookies de sessão
});

// Request: adiciona Authorization e aciona loading global
instance.interceptors.request.use((config) => {
  const auth = useAuthStore();
  const ui = useUiStore();
  ui.iniciar();

  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
}, (error) => {
  const ui = useUiStore();
  ui.finalizar(); // << NOVO
  return Promise.reject(error);
});

// Response: encerra loading e trata 401 com refresh automático
instance.interceptors.response.use(
  (response) => {
    const ui = useUiStore();
    ui.finalizar(); // << NOVO
    return response;
  },
  async (error) => {
    const ui = useUiStore();
    ui.finalizar(); // << NOVO

    const auth = useAuthStore();
    const original = error.config;

    // Tenta refresh se access expirar
    if (error.response?.status === 401 && !original._retry && auth.refreshToken) {
      original._retry = true;
      try {
        await auth.refresh();
        original.headers.Authorization = `Bearer ${auth.accessToken}`;
        return instance(original);
      } catch (e) {
        // falhou refresh -> vai para login
        auth.logout();
        router.replace({ name: 'Login', query: { redirect: router.currentRoute.value.fullPath } });
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
