import {createWebHashHistory, createRouter} from 'vue-router';
import Home from '@views/Home/index.vue';
import Login from '@views/Login/index.vue';

const history = createWebHashHistory();

const routes = [
    {
        path: '/',
        name: '/',
        component: () => import('@views/Home/index.vue')
    },
    {
        path: '/login',
        name: '/login',
        component: () => import('@views/Login/index.vue')
    },
];

const router = createRouter({
    history,
    routes,
});

export default router;
