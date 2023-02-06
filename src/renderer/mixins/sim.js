const { ipcRenderer } = require('electron');

export default {
    data() {
        return {
            // Simulation
            simulationStarted: false,
            simulate1: null,
            simulate2: null,
            simulate3: null,
        };
    },

    methods: {
        async onSimulateScan() {
            if (this.simulationStarted) {
                this.simulationStarted = false;
                clearInterval(this.simulate1);
                clearTimeout(this.simulate2);
                clearTimeout(this.simulate3);
                this.onScaleData(null, 'ST,+0.1 KG');
                return;
            }

            let epc;

            try {
                epc = await ipcRenderer.invoke('prompt', 'Enter EPC:');
            } catch (e) {
                return;
            }

            this.simulationStarted = true;

            if (epc !== '') {
                this.simulate1 = setInterval(() => {
                    this.onRfidData(null, `EPC:${epc}`);
                }, 200);
            }

            this.simulate2 = setTimeout(() => {
                this.onScaleData(null, 'ST,+0.15 KG');
            }, 3000);
        },
    },
};
