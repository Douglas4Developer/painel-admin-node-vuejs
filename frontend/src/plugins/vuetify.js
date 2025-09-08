// Configuração do plugin Vuetify. Importa estilos e registra componentes.
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'; // importa o set de ícones MDI
import { createVuetify } from 'vuetify';

export default function setupVuetify() {
  return createVuetify({
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#3F51B5', // azul mais elegante
            secondary: '#03A9F4',
            success: '#4CAF50',
            warning: '#FFC107',
            error: '#F44336',
          },
        },
      },
    },
    icons: {
      defaultSet: 'mdi',
    },
    defaults: {
      VBtn: { rounded: 'lg' },
      VTextField: { density: 'comfortable', variant: 'outlined' },
      VCard: { rounded: 'xl' },
    },
  });
}
