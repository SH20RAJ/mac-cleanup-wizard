const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Core scanning and cleanup
  scanSystem: (options) => ipcRenderer.invoke('scan-system', options),
  deleteFiles: (filePaths, options) => ipcRenderer.invoke('delete-files', filePaths, options),
  getFileSize: (filePath) => ipcRenderer.invoke('get-file-size', filePath),
  openInFinder: (filePath) => ipcRenderer.invoke('open-in-finder', filePath),
  
  // System utilities
  getDiskUsage: () => ipcRenderer.invoke('get-disk-usage'),
  emptyTrash: () => ipcRenderer.invoke('empty-trash'),
  
  // Settings and preferences
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  saveAppSettings: (settings) => ipcRenderer.invoke('save-app-settings', settings),
  
  // App info
  getAppVersion: () => process.env.npm_package_version || '1.0.0',
  getPlatform: () => process.platform,
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options)
});
