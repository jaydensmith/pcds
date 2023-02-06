import * as Sentry from '@sentry/vue';
import { BrowserTracing } from '@sentry/tracing';

import { createApp } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import router from './router';
import store from './store';
import graphql from './graphql';
import App from './App.vue';
import './assets/css/index.pcss';

const app = createApp(App);

if (import.meta.env.MODE !== 'development') {
    Sentry.init({
        app,
        dsn: 'REDACTED',
        integrations: [
            new BrowserTracing({
                routingInstrumentation: Sentry.vueRouterInstrumentation(router),
                tracingOrigins: ['localhost', /^\//],
            }),
        ],
        tracesSampleRate: 1.0,
    });
}

app.provide('store', store);

app.use(router);
app.use(graphql);

app.component('Icon', FontAwesomeIcon);

app.mount('#app');
