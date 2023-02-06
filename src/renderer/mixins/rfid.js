const { ipcRenderer } = require('electron');
import { GET_UNIT_QUERY } from '~/graphql/queries/units';

export default {
    data() {
        return {
            timeoutClear: null,
            rfidData: null,
            inventoryItemUnit: null,
        };
    },

    apollo: {
        inventoryItemUnit: {
            query: GET_UNIT_QUERY,
            fetchPolicy: 'cache-and-network',
            variables() {
                return {
                    epc: this.rfidData.EPC,
                };
            },
            skip() {
                return !this.rfidData;
            },
        },
    },

    methods: {
        onRfidData(event, data) {
            const regex = /((\w+):([^,]+))/g;
            const trimmedData = data.trim();

            let matches;
            const params = {};
            // eslint-disable-next-line no-cond-assign
            while (matches = regex.exec(trimmedData)) {
                const [ ,, key, value ] = matches;
                params[key] = value;
            }

            this.rfidData = params;

            clearTimeout(this.timeoutClear);
            this.timeoutClear = setTimeout(() => {
                this.clearProduct();
            }, 1500);
        },

        clearProduct() {
            this.rfidData = null;
        },
    },

    created() {
        ipcRenderer.on('rfid-serialport-data', this.onRfidData);
    },

    beforeUnmount() {
        ipcRenderer.removeListener('rfid-serialport-data', this.onRfidData);
    },
};
