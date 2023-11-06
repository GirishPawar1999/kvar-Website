const { app, BrowserWindow } = require('electron');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // Load your existing HTML file
  mainWindow.loadFile('./views/index.pug');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Handle window close event
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create the main app window when Electron is ready
app.on('ready', createWindow);

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Create a new window when the app is activated (e.g., clicking the dock icon on macOS)
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
