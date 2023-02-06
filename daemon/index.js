#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const net = require('net');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const Sentry = require('@sentry/node');
const SentryTracing = require('@sentry/tracing');

Sentry.init({
    dsn: 'REDACTED',
    tracesSampleRate: 1.0,
});

let ports = [];
const server = net.createServer();

const socketPath = process.env.SOCKET_PATH || '/tmp/pcsd/pcsd.sock';
const socketDir = path.dirname(socketPath);
const scaleComPort = process.env.SCALE_COM_PORT || '';
const rfidComPort = process.env.RFID_COM_PORT || '';

if (!fs.existsSync(socketDir)) {
    fs.mkdirSync(socketDir);
}

if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
}

server.on('error', error => {
    throw error;
});

server.listen({
    path: socketPath,
    readableAll: true,
    writableAll: true,
}, () => {
    console.log('now listening');
});

server.on('connection', socket => {
    closePorts();

    createListener('scale', socket, {
        path: scaleComPort,
        baudRate: 2400,
        dataBits: 7,
        stopBits: 1,
        parity: 'even',
    });

    createListener('rfid', socket, {
        path: rfidComPort,
        baudRate: 115200,
        dataBits: 7,
        stopBits: 1,
        parity: 'even',
    });
});

process.on('SIGINT', () => {
    console.log('\x1b[2Dkilling server');

    server.close();
    closePorts();
});

function closePorts() {
    for (const port of ports) {
        port.close();
    }

    ports = [];
}

function createListener(device, socket, config) {
    if (!config.path) {
        return;
    }

    const port = new SerialPort({
        autoOpen: false,
        ...config,
    });

    port.on('error', error => {
        throw error;
    });

    const parser = port.pipe(new ReadlineParser({
        encoding: 'utf8',
    }));

    parser.on('data', data => {
        socket.write(JSON.stringify({
            device,
            data,
        }));
    });

    port.open();
    ports.push(port);
}
