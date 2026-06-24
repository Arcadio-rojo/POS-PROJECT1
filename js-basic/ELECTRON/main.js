const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1750,
    height: 780,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // This might be necessary if you're using Node.js features in the renderer process
    }
  });

  // Load your dashboard.html file from the specified path
  mainWindow.loadFile(path.join(__dirname, '../all/Employee-system/Login-forgot/login.html'));

  // Prevent zooming by setting the zoom factor
  mainWindow.webContents.setZoomFactor(1); // Set initial zoom factor to 1

  // Prevent user from zooming
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1); // Keep it at 1
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
