const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require("fs");
const { ipcMain } = require('electron');
const { Client, Authenticator } = require('minecraft-launcher-core');
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        menu: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });


    win.loadFile('index.html');

    // Redirection des erreurs vers p.log
    win.webContents.on('crashed', (event, killed) => {
        const errorLog = path.join(app.getPath('userData'), 'p.log');
        fs.writeFileSync(errorLog, `Crashed: ${killed}`);
    });

    win.webContents.on('console-message', (event, level, message, line, sourceId) => {
        const errorLog = path.join(app.getPath('userData'), 'p.log');
        fs.appendFileSync(errorLog, `${message}\n`);
    });

    win.on('closed', () => {
        mainWindow = null;
    });

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


ipcMain.on('launch-minecraft', (event, config) => {
    const launcher = new Client();

    const path = require('path');

    let opts = {
        clientPackage: null,
        authorization: Authenticator.getAuth('zelflor'), // Remplacer par une méthode d'authentification réelle
        root: path.join(__dirname, 'minecraft'), // Utilisation de path.join pour un chemin absolu
        version: {
            number: config.version,
            type: 'release',
        },
        forge: path.join(config.modpackPath, 'forge.jar'), // Utilisation de path.join pour un chemin absolu
        memory: {
            max: '4G',
            min: '2G',
        },
    };
    

    launcher.launch(opts);
    launcher.on('close', (code) => {
        console.log(`Minecraft closed with code ${code}`);
    });
    
    launcher.on('error', (err) => {
        console.error('Launcher error:', err);
        event.reply('launch-failed', err.message); // Envoyer le message d'erreur à la fenêtre principale
    });
    
    launcher.on('debug', (msg) => {
        console.log('Launcher debug:', msg);
    });
    
    launcher.on('data', (info) => {
        console.log('Launcher data:', info);
    });
    
    
});