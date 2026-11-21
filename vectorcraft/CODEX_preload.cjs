const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('hueprintVectorCraft', Object.freeze({
  status: () => ipcRenderer.invoke('hueprint:status'),
  launch: () => ipcRenderer.invoke('hueprint:launch'),
  pickScreenColor: () => ipcRenderer.invoke('hueprint:pick-screen-color'),
  applyColor: (input) => ipcRenderer.invoke('hueprint:apply-color', input),
  readColor: (target) => ipcRenderer.invoke('hueprint:read-color', target),
  sendPalette: (input) => ipcRenderer.invoke('hueprint:send-palette', input),
  readSwatches: () => ipcRenderer.invoke('hueprint:read-swatches')
}));
