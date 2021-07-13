import { createApp } from 'vue';
import App from './App.vue';
import router from './route';
import store from './store';
import '@styles/normal.scss';

createApp(App).use(router).use(store).mount('#app');
