import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const project = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const watcher = await build({ configFile: `${project}CODEX_vite.config.ts`, build: { watch: {} } });
let desktop;

watcher.on('event', (event) => {
  if (event.code !== 'END' || desktop) return;
  desktop = spawn(require('electron'), [project], { cwd: project, stdio: 'inherit' });
  desktop.once('exit', async (code) => {
    await watcher.close();
    process.exitCode = code ?? 0;
  });
  desktop.once('error', async (error) => {
    console.error(error.message);
    await watcher.close();
    process.exitCode = 1;
  });
});
