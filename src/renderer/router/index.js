import { createRouter, createMemoryHistory } from 'vue-router';

import ScalePage from '~/pages/ScalePage.vue';
import IncomingPage from '~/pages/IncomingPage.vue';
import CombinePage from '~/pages/CombinePage.vue';
import SettingsPage from '~/pages/SettingsPage.vue';

export default createRouter({
    history: createMemoryHistory(),
    routes: [
        {
            path: '/',
            name: 'scale',
            component: ScalePage,
        },
        {
            path: '/combine',
            name: 'combine',
            component: CombinePage,
        },
        {
            path: '/incoming',
            name: 'incoming',
            component: IncomingPage,
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsPage,
        },
    ],
});
