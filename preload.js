const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    launchMinecraft: (config) => ipcRenderer.send('launch-minecraft', config),
});
