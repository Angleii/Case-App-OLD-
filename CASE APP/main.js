const { app, BrowserWindow } = require('electron/main')
const { initialize } = require('./src/db/urServer');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon:'./src/img/logso.png'
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  initialize();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})