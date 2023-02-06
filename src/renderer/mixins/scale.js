const { ipcRenderer } = require('electron');

export default {
    data() {
        return {
            timeoutStable: null,
            weight: 0,
            stable: false,
            unit: 'kg',
            testWeight: null,
        };
    },

    created() {
        ipcRenderer.on('scale-serialport-data', this.onScaleData);
    },

    beforeUnmount() {
        ipcRenderer.removeListener('scale-serialport-data', this.onScaleData);
    },

    methods: {
        onScaleData(event, data) {
            const regex = /^([A-Za-z]{2}),\+([-\d.]+) ([A-Za-z]{2})$/;
            const weightData = regex.exec(data.trim());

            if (!weightData) {
                this.stable = null;
                this.unit = null;
                this.weight = null;
                return;
            }

            const weight = parseFloat(weightData[2]);

            if (!isNaN(weight)) {
                const [ , stable, , unit ] = weightData;

                this.stable = stable;
                this.unit = unit;
                this.weight = weight;
            } else {
                this.stable = null;
                this.unit = null;
                this.weight = null;
                return;
            }

            if (this.stable !== 'ST') {
                clearTimeout(this.timeoutStable);
                this.timeoutStable = null;
            }

            if (this.weight > 0 && this.stable === 'ST') {
                if (this.timeoutStable === null) {
                    this.testWeight = this.weight;
                    this.timeoutStable = setTimeout(() => {
                        this.testStableWeight();
                    }, 500);
                }
            } else {
                try {
                    this.onResetWeight();
                    // eslint-disable-next-line no-empty
                } catch (e) {}
            }
        },
        testStableWeight() {
            if (this.weight <= 0 || this.stable !== 'ST') {
                // Invalid weight.
                return;
            }

            if (this.testWeight !== this.weight) {
                this.testWeight = this.weight;
                this.timeoutStable = setTimeout(() => {
                    this.testStableWeight();
                }, 500);

                return;
            }

            this.onWeightStable();
            this.timeoutStable = null;
        },
    },
};
