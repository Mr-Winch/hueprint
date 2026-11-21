const { ipcRenderer } = require('electron');
ipcRenderer.once('hueprint:screen-image', async (_event, data) => {
  const image = document.querySelector('img');
  image.src = `data:image/png;base64,${data}`;
  await image.decode();
  ipcRenderer.send('hueprint:screen-ready');
});
window.addEventListener('click', (event) => {
  if (event.button === 0 && document.querySelector('img').complete) {
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
