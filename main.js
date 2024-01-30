const {app, BrowserWindow, screen, ipcMain} = require('electron')

app.whenReady().then(() => {
	let win = new BrowserWindow({
		width: 1200, height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		},
		autoHideMenuBar: true
	})
	win.loadFile('index.html')
	win.on("close", () => {
		app.quit()
	})
	ipcMain.on('popup', () => {
		let popup = new BrowserWindow({
			width: 480, height: 80,
			maxHeight: 80,
			skipTaskbar: true,
			minimizable: false,
			maximizable: false,
			alwaysOnTop: true,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			},
			autoHideMenuBar: true
		})
		popup.loadFile('popup.html')
		ipcMain.on('finish', () => {
			popup.webContents.send('searched')
		})
		popup.on('close', () => {
			win.webContents.send('popup-close')
		})
	})
	ipcMain.on('search', (e, input) => {
		win.webContents.send('gosearch', input)
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

