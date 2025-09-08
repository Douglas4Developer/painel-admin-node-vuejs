import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const LoginPage = () => import('../pages/LoginPage.vue');
const RegisterPage = () => import('../pages/RegisterPage.vue');
const Dashboard = () => import('../pages/DashboardPage.vue');
const UsersPage = () => import('../pages/UsersPage.vue');
const RolesPage = () => import('../pages/RolesPage.vue');

const routes = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { public: true } },
  { path: '/register', name: 'Register', component: RegisterPage, meta: { public: true } },
  { path: '/', redirect: { name: 'Dashboard' } },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/users', name: 'Users', component: UsersPage },
  { path: '/roles', name: 'Roles', component: RolesPage }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (to.meta.public) return true; // permite rotas públicas
  if (auth.isAuthenticated) return true;

  // tenta refresh automático
  try {
    const ok = await auth.tryRefresh();
    if (ok) return true;
  } catch (_) {}

  return { name: 'Login', query: { redirect: to.fullPath } };
});

export default router;
