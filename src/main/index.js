const Sentry = require('@sentry/electron');
const { app, ipcMain } = require('electron');
const isDev = !app.isPackaged;

if (!isDev) {
    Sentry.init({ dsn: 'REDACTED' });
}

const net = require('net');
const Store = require('electron-store');
const contextMenu = require('electron-context-menu');
const resolveConfig = require('tailwindcss/resolveConfig');
const prompt = require('electron-prompt');

const createWindow = require('./helpers/create-window.js');
const tailwindConfig = require('../../tailwind.config');
const { getDefaultPrinter, getPrinters } = require('./utils/printer');
const fullTailwindConfig = resolveConfig(tailwindConfig);

const store = new Store();

try {
    require('electron-reloader')(module);
} catch {
    // Noop
}

contextMenu({
    showSearchWithGoogle: false,
    showCopyImage: false,
});

let mainWindow;

function loadVitePage(port) {
    mainWindow.loadURL(`http://localhost:${port}`).catch((err) => {
        console.log('VITE NOT READY, WILL TRY AGAIN IN 200ms');
        setTimeout(() => {
            // do it again as the vite build can take a bit longer the first time
            loadVitePage(port);
        }, 200);
    });
}

async function createMainWindow() {
    if (isDev) {
        try {
            let installExtension = require('electron-devtools-installer');
            await installExtension.default(installExtension.APOLLO_DEVELOPER_TOOLS);
            await installExtension.default(installExtension.VUEJS3_DEVTOOLS);
        } catch {
            // Noop
        }
    }

    mainWindow = createWindow('main', {
        backgroundColor: fullTailwindConfig.theme.colors.gray[100],
        fullscreen: !isDev,
        autoHideMenuBar: !isDev,
        show: false,
    });

    mainWindow.once('close', () => {
        mainWindow = null;
    });

    const port = process.env.PORT || 3333;
    if (isDev) {
        loadVitePage(port);
    } else {
        mainWindow.loadFile(`${__dirname}/../renderer/dist/index.html`);
    }

    // if main window is ready to show, then destroy the splash window and show up the main window
    mainWindow.once('ready-to-show', () => {
        console.log('READY');

        mainWindow.show();
        mainWindow.focus();
    });

    // Open dev tools initially when in development mode
    if (isDev) {
        mainWindow.webContents.on('did-frame-finish-load', () => {
            mainWindow.webContents.once('devtools-opened', () => {
                mainWindow.focus();
            });
            mainWindow.webContents.openDevTools();
        });
    }
}

app.allowRendererProcessReuse = false;

app.once('ready', createMainWindow);

app.on('activate', () => {
    if (!mainWindow) {
        createMainWindow();
    }
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.handle('printers-list', async(event) => {
    return await getPrinters();
});

ipcMain.handle('printer-default', async(event) => {
    return printer;
});

ipcMain.handle('prompt', (event, title) => {
    return new Promise((resolve, reject) => {
        prompt({ title, alwaysOnTop: true }).then(result => {
            resolve(result);
        }).catch(reject);
    });
});

const printer = getDefaultPrinter();

if (!isDev) {
    const client = net.createConnection({ path: process.env.SOCKET_PATH || '/tmp/pcsd' });

    client.on('data', data => {
        try {
            const json = JSON.parse(data.toString('utf8'));

            if (mainWindow) {
                mainWindow.webContents.send(`${json.device}-serialport-data`, json.data);
            }
        } catch (e) {
            // console.error(e);
        }
    });
}
