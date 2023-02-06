<template>
    <div id="app" class="flex h-screen bg-gray-100">
        <nav class="relative w-64 p-4">
            <router-link
                :to="{ name: 'scale' }"
                class="menu-link btn"
                exact-active-class="btn--active"
            >
                <icon class="menu-link__icon" icon="weight-hanging" />
                <span class="menu-link__text">Scale</span>
            </router-link>

            <router-link
                :to="{ name: 'combine' }"
                class="menu-link btn"
                exact-active-class="btn--active"
            >
                <icon class="menu-link__icon" icon="boxes-stacked" />
                <span class="menu-link__text">Combine</span>
            </router-link>

            <!--
            <router-link
                :to="{ name: 'incoming' }"
                class="menu-link btn"
                exact-active-class="btn--active"
            >
                <icon class="menu-link__icon" icon="box-check" />
                <span class="menu-link__text">Incoming</span>
            </router-link>
            -->

            <router-link
                v-if="isSuper"
                :to="{ name: 'settings' }"
                class="menu-link btn"
                exact-active-class="btn--active"
            >
                <icon class="menu-link__icon" icon="cog" />
                <span class="menu-link__text">Settings</span>
            </router-link>
        </nav>

        <main class="flex-1 p-4">
            <router-view />
        </main>
    </div>
</template>

<script>
    import { library } from '@fortawesome/fontawesome-svg-core';
    import { faCog } from '@fortawesome/pro-solid-svg-icons/faCog';
    import { faBoxCheck } from '@fortawesome/pro-solid-svg-icons/faBoxCheck';
    import { faWeightHanging } from '@fortawesome/pro-solid-svg-icons/faWeightHanging';
    import { faBoxesStacked } from '@fortawesome/pro-solid-svg-icons/faBoxesStacked';

    library.add(faCog, faBoxCheck, faWeightHanging, faBoxesStacked);

    export default {
        name: 'PCDS',

        data() {
            return {
                // isSuper: import.meta.env.MODE === 'development',
                isSuper: true,
            };
        },

        computed: {
            routes() {
                return this.$router.options.routes.map(route => ({
                    name: route.name,
                }));
            },
        },

        methods: {
            onExit() {
                window.close();
            },
        },
    };
</script>

<style scoped>
    .menu-link {
        @apply flex items-center justify-center w-full text-center py-8 mb-4 last:mb-0;

        &__icon {
            @apply text-2xl;
        }

        &__text {
            @apply block text-lg ml-2;
        }
    }
</style>
