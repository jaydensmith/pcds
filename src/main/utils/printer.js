const net = require('net');
const find = require('local-devices');

async function getPrinters() {
    const devices = await find(null, true);

    const printerDevices = devices.filter(device => {
        return device.mac.startsWith('00:07:4d');
    });

    const printers = [];

    for (const device of printerDevices) {
        try {
            printers.push(await getPrinterDetails(device));
        } catch (error) {
            console.error(error);
        }
    }

    return printers;
}

async function getDefaultPrinter() {
    const [ printer ] = await getPrinters();
    return printer ? printer : null;
}

function getPrinterDetails(printer) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();

        client.connect(9100, printer.ip, () => {
            client.write('^XA~HI^XZ');
        });

        client.on('data', (data) => {
            resolve({
                ...printer,
                // eslint-disable-next-line no-control-regex
                name: data.toString('utf8').trim().replace(/[\x02-\x03]/g, ''),
            });
            client.destroy();
        });

        client.on('error', () => {
            client.destroy();
            reject();
        });

        client.on('timeout', () => {
            client.destroy();
            reject();
        });
    });
}

module.exports.getPrinters = getPrinters;
module.exports.getDefaultPrinter = getDefaultPrinter;
