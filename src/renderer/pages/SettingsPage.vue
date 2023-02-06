<template>
    <div>
        <button class="btn px-4 py-2" @click.prevent="onClearCache">Clear Cache</button>

        <div v-if="defaultPrinter" class="mt-4">
            <label>Default Printer</label>
            <p>{{ defaultPrinter.name }}<br />{{ defaultPrinter.ip }}</p>
        </div>

        <div v-if="printers.length > 0" class="mt-4">
            <label>Printers</label>
            <ul>
                <li v-for="printer in printers" :key="printer.mac">
                    {{ printer.name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from 'vue';
    const { ipcRenderer } = require('electron');

    export default defineComponent({
        name: 'SettingsPage',

        inject: ['store'],

        data() {
            return {
                printers: [],
                defaultPrinter: null,
            };
        },

        created() {
            this.listPrinters();
            this.getDefaultPrinter();
        },

        methods: {
            async listPrinters() {
                this.printers = await ipcRenderer.invoke('printers-list');
            },
            async getDefaultPrinter() {
                this.defaultPrinter = await ipcRenderer.invoke('printer-default');
            },
            onClearCache() {
                this.$apollo.getClient().cache.reset();
            },
        },
    });
</script>

