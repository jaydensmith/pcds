const Store = require('electron-store');

const schema = {
    scalePort: {
        type: 'string',
    },
    rfidPort: {
        type: 'string',
    },
};

const store = new Store({ schema });

export default store;
