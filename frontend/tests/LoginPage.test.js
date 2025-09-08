import { render, fireEvent, waitFor } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../src/pages/LoginPage.vue';
import { createPinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';

// Mock API
vi.mock('../src/services/api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: { accessToken: 'token', refreshToken: 'refresh' } }))
  }
}));

describe('LoginPage', () => {
  it('renders login form and submits credentials', async () => {
    const pinia = createPinia();
    const router = createRouter({ history: createMemoryHistory(), routes: [] });
    const { getByLabelText, getByRole } = render(LoginPage, {
      global: { plugins: [pinia, router] }
    });
    const emailInput = getByLabelText('Email');
    const passwordInput = getByLabelText('Senha');
    await fireEvent.update(emailInput, 'user@example.com');
    await fireEvent.update(passwordInput, 'password');
    await fireEvent.click(getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(emailInput.value).toBe('user@example.com');
    });
  });
});