import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import setupVuetify from './plugins/vuetify';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(setupVuetify());
app.use(router);

app.mount('#app');