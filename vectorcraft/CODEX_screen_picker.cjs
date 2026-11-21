const { BrowserWindow, desktopCapturer, ipcMain, screen } = require('electron');
const os = require('node:os');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const overlays = new Map();
const samplePage = path.join(__dirname, 'screen-picker.html');
let activePick;

ipcMain.on('hueprint:screen-picked', (event, point) => {
  const overlay = overlays.get(event.sender);
  if (!overlay || event.senderFrame !== event.sender.mainFrame) return;
  if (point === null) return overlay.done(null);
  if (typeof point?.x !== 'number' || typeof point?.y !== 'number') return;
  if (!(point.x >= 0 && point.x < 1 && point.y >= 0 && point.y < 1)) return;

  const { bitmap, width, height } = overlay;
  const pixel = (Math.floor(point.y * height) * width + Math.floor(point.x * width)) * 4;
  const hex = [bitmap[pixel + 2], bitmap[pixel + 1], bitmap[pixel]]
    .map((channel) => channel.toString(16).padStart(2, '0')).join('');
  overlay.done(`#${hex.toUpperCase()}`);
});

function createProgressWindow({ workArea }) {
  const width = 272;
  const window = new BrowserWindow({
    x: workArea.x + Math.round((workArea.width - width) / 2),
    y: workArea.y + 18,
    width,
    height: 36,
    title: 'Cuentagotas de HuePrint',
    show: false,
    frame: false,
    skipTaskbar: true,
    focusable: false,
    resizable: false,
    backgroundColor: '#16181c',
  });
  window.setAlwaysOnTop(true, 'screen-saver');
  window.setIgnoreMouseEvents(true);
  return window;
}

async function captureScreens(thumbnailSize) {
  let timer;
  try {
    const deadline = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('La captura tardó demasiado. Vuelve a intentar el cuentagotas.')), 8000);
    });
    return await Promise.race([desktopCapturer.getSources({ types: ['screen'], thumbnailSize }), deadline]);
  } finally {
    clearTimeout(timer);
  }
}

async function createOverlay(display, thumbnail, done) {
  const window = new BrowserWindow({
    ...display.bounds,
    title: 'Cuentagotas de HuePrint',
    show: false,
    frame: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'CODEX_screen_preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  });
  window.setAlwaysOnTop(true, 'screen-saver');
  window.setBounds(display.bounds);
  window.setMenu(null);
  const contents = window.webContents;
  const channel = contents.ipc;
  const { width, height } = thumbnail.getSize();
  overlays.set(contents, { window, width, height, bitmap: thumbnail.toBitmap(), done });
  window.on('closed', () => { overlays.delete(contents); done(null); });
  contents.on('render-process-gone', () => done(null));
  contents.on('will-navigate', (event) => event.preventDefault());
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));
  await window.loadFile(samplePage);
  await new Promise((resolve, reject) => {
    const onImageReady = (event) => {
      if (event.senderFrame === contents.mainFrame) finish(resolve);
    };
    const onClosed = () => finish(() => reject(new Error('Se cerró la ventana del cuentagotas.')));
    const finish = (callback) => {
      clearTimeout(timer);
      channel.removeListener('hueprint:screen-ready', onImageReady);
      window.removeListener('closed', onClosed);
      callback();
    };
    const timer = setTimeout(() => finish(() => reject(new Error('No se pudo mostrar la captura del cuentagotas.'))), 5000);
    channel.on('hueprint:screen-ready', onImageReady);
    window.once('closed', onClosed);
    contents.send('hueprint:screen-image', thumbnail.toPNG().toString('base64'));
  });
  return window;
}

async function pickScreenColor(owner) {
  if (activePick) return activePick;
  const picker = async () => {
    const displays = screen.getAllDisplays();
    const thumbnailSize = {
      width: Math.max(...displays.map(({ size, scaleFactor }) => Math.round(size.width * scaleFactor))),
      height: Math.max(...displays.map(({ size, scaleFactor }) => Math.round(size.height * scaleFactor))),
    };
    const progress = createProgressWindow(screen.getDisplayNearestPoint(screen.getCursorScreenPoint()));
    try {
      // Older versions of Windows render excluded windows as black in the screenshot.
      const excludeFromCapture = process.platform === 'win32' && Number(os.release().split('.')[2]) >= 19041;
      if (excludeFromCapture) progress.setContentProtection(true);
      await progress.loadFile(samplePage, { hash: 'preparing' });
      owner.hide();
      if (excludeFromCapture) progress.showInactive();

      // Let Windows recomposite the desktop after hiding HuePrint.
      await delay(140);
      const sources = await captureScreens(thumbnailSize);
      if (!excludeFromCapture) progress.showInactive();
      let done;
      const result = new Promise((resolve) => { done = resolve; });
      const windows = [];
      for (const display of displays) {
        const source = sources.find(({ display_id }) => display_id === String(display.id)) ?? (displays.length === 1 ? sources[0] : null);
        if (source && !source.thumbnail.isEmpty()) windows.push(await createOverlay(display, source.thumbnail, done));
      }
      if (!windows.length) throw new Error('No se pudo capturar la pantalla. Vuelve a intentar el cuentagotas.');
      for (const window of windows) window.showInactive();
      progress.destroy();
      const point = screen.getCursorScreenPoint();
      const current = windows.find((window) => {
        const { x, y, width, height } = window.getBounds();
        return point.x >= x && point.y >= y && point.x < x + width && point.y < y + height;
      });
      (current ?? windows[0]).focus();
      const watchdog = setTimeout(() => done(null), 120000);
      screen.on('display-removed', doneOnDisplayChange);
      screen.on('display-metrics-changed', doneOnDisplayChange);
      function doneOnDisplayChange() { done(null); }
      try { return await result; }
      finally {
        clearTimeout(watchdog);
        screen.removeListener('display-removed', doneOnDisplayChange);
        screen.removeListener('display-metrics-changed', doneOnDisplayChange);
      }
    } finally {
      if (!progress.isDestroyed()) progress.destroy();
      for (const overlay of Array.from(overlays.values())) {
        if (!overlay.window.isDestroyed()) overlay.window.destroy();
      }
      if (!owner.isDestroyed()) owner.show();
    }
  };
  activePick = picker().finally(() => { activePick = null; });
  return activePick;
}

module.exports = { pickScreenColor };
