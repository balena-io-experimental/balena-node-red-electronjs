{
    require('require-rebuild')();
    const electron = require('electron');
    const app = electron.app;
    const BrowserWindow = electron.BrowserWindow;
    const spawn = require('child_process').spawn;

    // Start Node-RED
    const nodered = spawn('node-red', ['--settings', '/usr/src/app/settings.js']);
    nodered.stdout.on('data', (data) => {
        "use strict";
        console.log(`node-red stdout: ${data}`);
    });
    nodered.stderr.on('data', (data) => {
        "use strict";
        console.log(`node-red stderr: ${data}`);
    });
    nodered.on('close', (code) => {
        "use strict";
        console.log(`node-red exited with code ${code}`);
    });

    // simple parameters initialization
    let electronConfig = {
        "URL_LAUNCHER_TOUCH": process.env.URL_LAUNCHER_TOUCH == null ? 0 : process.env.URL_LAUNCHER_TOUCH === '1',
        "URL_LAUNCHER_TOUCH_SIMULATE": process.env.URL_LAUNCHER_TOUCH_SIMULATE == null ? 0 : process.env.URL_LAUNCHER_TOUCH_SIMULATE === '1',
        "URL_LAUNCHER_FRAME": process.env.URL_LAUNCHER_FRAME == null ? 0 : process.env.URL_LAUNCHER_FRAME === '1',
        "URL_LAUNCHER_KIOSK": process.env.URL_LAUNCHER_KIOSK == null ? 1 : process.env.URL_LAUNCHER_KIOSK === '1',
        "URL_LAUNCHER_NODE": process.env.URL_LAUNCHER_NODE == null ? 0 : process.env.URL_LAUNCHER_NODE === '1',
        "URL_LAUNCHER_WIDTH": (process.env.URL_LAUNCHER_WIDTH == null) ? 1920 : parseInt(process.env.URL_LAUNCHER_WIDTH),
        "URL_LAUNCHER_HEIGHT": (process.env.URL_LAUNCHER_HEIGHT == null) ? 1080 : parseInt(process.env.URL_LAUNCHER_HEIGHT),
        "URL_LAUNCHER_TITLE": (process.env.URL_LAUNCHER_TITLE == null) ? "RESIN.IO" : process.env.URL_LAUNCHER_TITLE,
        "URL_LAUNCHER_CONSOLE": process.env.URL_LAUNCHER_CONSOLE == null ? 0 : process.env.URL_LAUNCHER_CONSOLE === '1',
        "URL_LAUNCHER_URL": (process.env.URL_LAUNCHER_URL == null) ? "http://127.0.0.1" : process.env.URL_LAUNCHER_URL,
        "URL_LAUNCHER_ZOOM": (process.env.URL_LAUNCHER_ZOOM == null) ? 1.0 : parseFloat(process.env.URL_LAUNCHER_ZOOM),
        "URL_LAUNCHER_OVERLAY_SCROLLBARS": process.env.URL_LAUNCHER_CONSOLE == null ? 0 : process.env.URL_LAUNCHER_CONSOLE === '1'
    };

    let window = null;


    // enable touch events if your device supports them
    if (electronConfig.URL_LAUNCHER_TOUCH) {
        app.commandLine.appendSwitch("--touch-devices");
    }
    // simulate touch events - might be useful for touchscreen with partial driver support
    if (electronConfig.URL_LAUNCHER_TOUCH_SIMULATE) {
        app.commandLine.appendSwitch("--simulate-touch-screen-with-mouse");
    }

    app.setPath("userData", "/data/electron");

    /*
      we initialize our application display as a callback of the electronJS "ready" event
    */
    app.on('ready', () => {
        "use strict";

        // here we actually configure the behavour of electronJS
        window = new BrowserWindow({
            width: parseInt(electronConfig.URL_LAUNCHER_WIDTH),
            height: parseInt(electronConfig.URL_LAUNCHER_HEIGHT),
            frame: (electronConfig.URL_LAUNCHER_FRAME) ? true : false,
            title: electronConfig.URL_LAUNCHER_TITLE,
            kiosk: (electronConfig.URL_LAUNCHER_KIOSK) ? true : false,
            webPreferences: {
                nodeIntegration: (electronConfig.URL_LAUNCHER_NODE) ? true : false,
                zoomFactor: electronConfig.URL_LAUNCHER_ZOOM,
                overlayScrollbars: (electronConfig.URL_LAUNCHER_OVERLAY_SCROLLBARS) ? true : false
            }
        });

        window.webContents.on('did-finish-load', () => {
            setTimeout(() => {
                window.show();
            }, 300);

        });

        // if the env-var is set to true, a portion of the screen will be dedicated to the chrome-dev-tools
        if (electronConfig.URL_LAUNCHER_CONSOLE) {
            window.openDevTools();
        }

        // TODO: remove the interval and implement a way of knowing when node-server is ready
        setTimeout(function() {
          window.loadURL(electronConfig.URL_LAUNCHER_URL);
        },30000);
    });
}
