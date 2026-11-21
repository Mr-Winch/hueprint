const { app, BrowserWindow, dialog, ipcMain, screen, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');
const { createClient } = require('./CODEX_connection.cjs');
const { createOperations } = require('./CODEX_operations.cjs');
const { pickScreenColor } = require('./CODEX_screen_picker.cjs');
const port = Number(process.env.HUEPRINT_CONTROL_PORT || 7979);
const request = createClient({ port });
const operations = createOperations(request);
let mainWindow;
let launching;
const entry = path.join(__dirname, 'dist', 'index.html');
const entryUrl = pathToFileURL(entry).href;
if (process.env.HUEPRINT_USER_DATA) app.setPath('userData', path.resolve(process.env.HUEPRINT_USER_DATA));
function readSettings() {
  try { return JSON.parse(fs.readFileSync(path.join(app.getPath('userData'), 'connection.json'), 'utf8')); }
  catch { return {}; }
}
function locate() {
  const candidates = [readSettings().executable,
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'VectorCraft', 'vectorcraft.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'VectorCraft', 'vectorcraft.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'VectorCraft', 'vectorcraft.exe')];
  return candidates.find((file) => typeof file === 'string' && fs.existsSync(file)) || '';
}
async function status() {
  try {
    const result = await operations.status();
    const document = result.document ? { selection: result.document.selection } : null;
    return { connected: true, document };
  } catch {
    return { connected: false, document: null };
  }
}
async function choose() {
  const picked = await dialog.showOpenDialog(mainWindow, {title:'Localizar VectorCraft', properties:['openFile'], filters:[{name:'VectorCraft', extensions:['exe']}]});
  if (picked.canceled) return {cancelled:true};
  const executable = picked.filePaths[0];
  if (path.basename(executable).toLowerCase() !== 'vectorcraft.exe') throw new Error('Selecciona el archivo vectorcraft.exe.');
  fs.mkdirSync(app.getPath('userData'), {recursive:true});
  fs.writeFileSync(path.join(app.getPath('userData'), 'connection.json'), JSON.stringify({executable}, null, 2));
  return {executable};
}
async function launch() {
  const current = await status();
  if (current.connected) {
    await request('ui.focus', {}, 3500);
    return current;
  }
  const executable = locate() || (await choose()).executable;
  if (!executable) return current;
  await new Promise((resolve, reject) => {
    const child = spawn(executable, ['--control=' + port], {cwd:path.dirname(executable), detached:true, stdio:'ignore', windowsHide:false});
    child.once('error', reject);
    child.once('spawn', () => {child.unref(); resolve();});
  });
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const next = await status();
    if (next.connected) return next;
  }
  throw new Error('No se pudo conectar. Guarda tu trabajo, cierra VectorCraft y pulsa Abrir VectorCraft de nuevo.');
}
function handle(channel, handler) {
  ipcMain.handle(channel, async (event, input) => {
    if (event.sender !== mainWindow?.webContents || event.senderFrame !== mainWindow.webContents.mainFrame || event.senderFrame.url !== entryUrl) throw new Error('Origen no autorizado.');
    return handler(input);
  });
}
handle('hueprint:status', status);
handle('hueprint:launch', () => launching ??= launch().finally(() => {launching = null;}));
handle('hueprint:pick-screen-color', () => pickScreenColor(mainWindow));
handle('hueprint:apply-color', operations.applyColor);
handle('hueprint:read-color', operations.readColor);
handle('hueprint:send-palette', operations.sendPalette);
handle('hueprint:read-swatches', operations.readSwatches);

function watchDevelopmentRenderer(window) {
  if (app.isPackaged) return;
  let reloadTimer;
  const watcher = fs.watch(path.dirname(entry), (_event, filename) => {
    if (filename !== 'index.html') return;
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      if (!window.isDestroyed() && fs.existsSync(entry)) window.webContents.reload();
    }, 220);
  });
  window.once('closed', () => {
    clearTimeout(reloadTimer);
    watcher.close();
  });
}

function createWindow() {
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  // Leave room for three rows of Saved Swatches at the default portrait size.
  mainWindow = new BrowserWindow({width:877, height:1055, useContentSize:true, show:false,
    title:'HuePrint for VectorCraft', icon:path.join(__dirname,'assets','hueprint.png'), backgroundColor:'#eef1f5',
    webPreferences:{preload:path.join(__dirname,'CODEX_preload.cjs'), contextIsolation:true, nodeIntegration:false, sandbox:true}});
  mainWindow.removeMenu();
  const frame = mainWindow.getBounds();
  const width = Math.min(frame.width, workArea.width);
  const height = Math.min(frame.height, workArea.height);
  mainWindow.setMinimumSize(width, height);
  mainWindow.setBounds({
    x: workArea.x + Math.floor((workArea.width - width) / 2),
    y: workArea.y + Math.floor((workArea.height - height) / 2),
    width,
    height,
  });
  mainWindow.loadFile(entry);
  watchDevelopmentRenderer(mainWindow);
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.webContents.on('will-navigate', (event, url) => {if (url !== entryUrl) event.preventDefault();});
  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    if (/^https:\/\/(?:colornames\.org|chir\.ag)(?:\/|$)/i.test(url)) void shell.openExternal(url);
    return {action:'deny'};
  });
}
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {if (mainWindow) {if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus();}});
  app.whenReady().then(createWindow);
  app.on('window-all-closed', () => app.quit());
}
