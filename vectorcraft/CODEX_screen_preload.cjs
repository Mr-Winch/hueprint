const { ipcRenderer } = require('electron');
let readyToSample = false;
ipcRenderer.once('hueprint:screen-image', async (_event, data) => {
  const image = new Image();
  image.alt = '';
  image.src = `data:image/png;base64,${data}`;
  await image.decode();
  document.body.prepend(image);
  readyToSample = true;
  ipcRenderer.send('hueprint:screen-ready');
});
window.addEventListener('click', (event) => {
  if (event.button === 0 && readyToSample) {
    ipcRenderer.send('hueprint:screen-picked', { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight });
  }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') ipcRenderer.send('hueprint:screen-picked', null);
});
window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  ipcRenderer.send('hueprint:screen-picked', null);
});
