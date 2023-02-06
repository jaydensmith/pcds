const { app, screen, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');

const isProd = app.isPackaged;

module.exports = function createWindow(windowName = 'main', options = {}) {
    const winOptions = {
        minWidth: !isProd ? 1400 : undefined,
        minHeight: !isProd ? 800 : undefined,
        ...options,
        webPreferences: {
            contextIsolation: false,
            devTools: !isProd,
            spellcheck: false,
            nodeIntegration: true,
            webSecurity: false,
            ...(options.webPreferences || {}),
        },
    };

    let windowState = windowStateKeeper({
        defaultWidth: winOptions.minWidth,
        defaultHeight: winOptions.minHeight,
    });

    let win;

    win = new BrowserWindow({
        ...winOptions,
        x: windowState.x,
        y: windowState.y,
        width: windowState.width,
        height: windowState.height,
    });
    windowState.manage(win);

    // disabled as we now do it explicitly white hiding the splash screen
    // win.once('ready-to-show', () => {
    //   win.show()
    //   win.focus()
    // })

    return win;
};
