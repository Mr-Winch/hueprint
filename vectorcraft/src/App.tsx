import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorHarmonyPicker, GeneratedColor, SavedPaletteCollection, SavedPaletteInput } from '../../src/color-harmony-picker';
import { bridge, ConnectionStatus, VectorCraftSwatchCatalog } from './bridge';
import { usePickerLayout } from './usePickerLayout';

const prefix = 'hueprint-vectorcraft-v1:';
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeOptions = [
  { id: 'light', label: 'Tema claro' },
  { id: 'dark', label: 'Tema oscuro' },
  { id: 'system', label: 'Seguir sistema' },
] as const;
type ThemeMode = typeof themeOptions[number]['id'];
type PaintTarget = 'fill' | 'stroke';
const targetNames = { fill: 'Relleno', stroke: 'Trazo' };

function readStored<T>(key: string, fallback: T): unknown {
  try { return JSON.parse(localStorage.getItem(prefix + key) ?? 'null') ?? fallback; }
  catch { return fallback; }
}

function readArray<T>(key: string): T[] {
  const value = readStored(key, []);
  return Array.isArray(value) ? value : [];
}

function readTheme(): ThemeMode {
  const value = readStored('theme', 'system');
  return value === 'light' || value === 'dark' ? value : 'system';
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {mode === 'light' && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4" /></>}
      {mode === 'dark' && <path d="M20.9 13.2A9 9 0 0 1 10.8 3.1 9 9 0 1 0 20.9 13.2Z" />}
      {mode === 'system' && <><rect x="3" y="4" width="18" height="13" rx="1.8" /><path d="M12 17v4m-4 0h8" /></>}
    </svg>
  );
}

function messageFor(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/^Error invoking remote method '[^']+': Error: /, '');
}

export function App() {
  const [color, setColor] = useState('#2F80ED');
  const [generated, setGenerated] = useState<GeneratedColor[]>([]);
  const [saved, setSaved] = useState<SavedPaletteInput[]>(() => readArray('swatches'));
  const [palettes, setPalettes] = useState<SavedPaletteCollection[]>(() => readArray('palettes'));
  const [status, setStatus] = useState<ConnectionStatus>({ connected: false, document: null });
  const [themeMode, setThemeMode] = useState<ThemeMode>(readTheme);
  const [systemDark, setSystemDark] = useState(systemTheme.matches);
  const [target, setTarget] = useState<PaintTarget>('fill');
  const [name, setName] = useState('HuePrint');
  const [swatchCatalog, setSwatchCatalog] = useState<VectorCraftSwatchCatalog | null>(null);
  const importTrigger = useRef<HTMLButtonElement>(null);
  const importOptions = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState({ text: '', error: false });
  const { layout, workspace } = usePickerLayout();
  const theme = themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode;

  const refresh = useCallback(async () => {
    if (!bridge) return;
    try { setStatus(await bridge.status()); }
    catch { setStatus({ connected: false, document: null }); }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(refresh, 3000);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  useEffect(() => {
    const updateTheme = () => setSystemDark(systemTheme.matches);
    systemTheme.addEventListener('change', updateTheme);
    return () => systemTheme.removeEventListener('change', updateTheme);
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  useEffect(() => {
    const popup = importOptions.current;
    if (swatchCatalog && popup && !popup.matches(':popover-open')) {
      popup.showPopover();
      popup.querySelector('button')?.focus();
    }
  }, [swatchCatalog]);

  function persist(key: string, value: unknown) {
    try { localStorage.setItem(prefix + key, JSON.stringify(value)); }
    catch { setNotice({ text: 'No se pudo guardar la configuración local.', error: true }); }
  }

  async function action(label: string, work: () => Promise<string>) {
    if (busy) return;
    setBusy(label);
    try { setNotice({ text: await work(), error: false }); }
    catch (error) { setNotice({ text: messageFor(error), error: true }); }
    finally { setBusy(''); void refresh(); }
  }

  async function pickScreenColor() {
    try { return await bridge!.pickScreenColor(); }
    catch (error) {
      setNotice({ text: messageFor(error), error: true });
      return null;
    }
  }

  async function loadSwatchCatalog() {
    const catalog = await bridge!.readSwatches();
    if (!catalog.colors.length) return 'Este documento no tiene muestras sólidas.';
    setSwatchCatalog(catalog);
    return '';
  }

  function importSwatches(group?: string | null) {
    if (!swatchCatalog) return;
    const colors = group === undefined ? swatchCatalog.colors : swatchCatalog.colors.filter((item) => item.group === group);
    const knownColors = new Set(saved.map((item) => (typeof item === 'string' ? item : item.hex).toUpperCase()));
    const next = [...saved];
    for (const item of colors) {
      if (knownColors.has(item.hex)) continue;
      knownColors.add(item.hex);
      next.push({ hex: item.hex, name: item.name, id: `vc-${item.hex.slice(1)}`, hue: 0, role: 'custom', sourceRule: 'custom' });
    }
    const count = next.length - saved.length;
    setNotice({ text: count > 0 ? `${count} ${count === 1 ? 'muestra añadida' : 'muestras añadidas'} a Saved Swatches.` : 'Ya tienes todas esas muestras en HuePrint.', error: false });
    if (count > 0) {
      setSaved(next);
      persist('swatches', next);
    }
    importOptions.current?.hidePopover();
    importTrigger.current?.focus();
  }

  const unavailable = Boolean(busy) || !status.connected;
  const paintDisabled = unavailable || !status.document?.selection?.length;
  return (
    <main className="desktopShell">
      <header className="appHeader">
        <div className="identity">
          <img src="./hueprint.svg" width="36" height="36" alt="" />
          <h1>HuePrint <span>for VectorCraft</span></h1>
        </div>
        <div className="headerControls">
          <button type="button" className="connectionButton" disabled={!bridge || !!busy} onClick={() => void action('Abriendo VectorCraft…', async () => {
            const next = await bridge!.launch();
            setStatus(next);
            return next.connected ? 'VectorCraft conectado.' : '';
          })}>
            <span className="connectionDot" data-connected={status.connected} aria-hidden="true" />
            <span>Abrir VectorCraft</span>
            <span className="srOnly">{status.connected ? ' (conectado)' : ' (sin conectar)'}</span>
          </button>
          <div className="themeButtons" role="group" aria-label="Tema">
            {themeOptions.map(({ id, label }) => (
              <button type="button" key={id} aria-label={label} title={label} aria-pressed={themeMode === id} onClick={() => {
                setThemeMode(id);
                persist('theme', id);
              }}><ThemeIcon mode={id} /></button>
            ))}
          </div>
        </div>
      </header>

      <div className="workspaceScroll" ref={workspace}>
        <ColorHarmonyPicker
          className="desktopPicker"
          value={color}
          onChange={setColor}
          theme={theme}
          layout={layout}
          onPickScreenColor={bridge ? pickScreenColor : undefined}
          onGeneratedColorsChange={setGenerated}
          savedPalette={saved}
          onSavedPaletteChange={(next) => { setSaved(next); persist('swatches', next); }}
          savedPalettes={palettes}
          onSavedPalettesChange={(next) => { setPalettes(next); persist('palettes', next); }}
        />
        <section className="deliveryBar" aria-labelledby="vectorcraft-palettes-title">
          <h2 id="vectorcraft-palettes-title">Paletas de VectorCraft</h2>
          <label><span>Nombre de paleta</span><input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} /></label>
          <button type="button" className="primaryButton" disabled={unavailable || !status.document || !generated.length || !name.trim()} onClick={() => void action('Enviando paleta…', async () => {
            const result = await bridge!.sendPalette({ name, colors: generated.map((item) => item.hex) });
            return `“${result.name}”: ${result.count} colores añadidos a Muestras.`;
          })}>Enviar paleta actual</button>
          <button type="button" ref={importTrigger} className="swatchImportTrigger" popoverTarget="vectorcraft-swatch-options" disabled={unavailable || !status.document} onClick={(event) => {
            if (importOptions.current?.matches(':popover-open')) return;
            event.preventDefault();
            void action('Leyendo muestras…', loadSwatchCatalog);
          }}>
            Traer muestras
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 4.75 3 3 3-3" /></svg>
          </button>
          <div className="swatchImportOptions" id="vectorcraft-swatch-options" role="group" aria-label="Muestras que quieres traer" ref={importOptions} popover="auto" onToggle={(event) => {
            if (event.newState === 'closed') setSwatchCatalog(null);
          }}>
            {swatchCatalog && <>
              <button type="button" onClick={() => importSwatches()}><span>Todas las muestras</span><span>{swatchCatalog.colors.length}</span></button>
              {swatchCatalog.groups.map(({ name, count }) => <button type="button" key={name} onClick={() => importSwatches(name)}><span>{name}</span><span>{count}</span></button>)}
              {swatchCatalog.groups.length > 0 && swatchCatalog.ungroupedCount > 0 && <button type="button" onClick={() => importSwatches(null)}><span>Sin grupo</span><span>{swatchCatalog.ungroupedCount}</span></button>}
            </>}
          </div>
        </section>
      </div>

      <footer className="paintDock">
        <div className="paintActions">
          <div className="targets" role="group" aria-label="Destino del color">
            {(['fill', 'stroke'] as const).map((value) => (
              <button type="button" key={value} aria-pressed={target === value} onClick={() => setTarget(value)}>{targetNames[value]}</button>
            ))}
          </div>
          <div className="selectionActions">
            <button type="button" disabled={paintDisabled} onClick={() => void action('Leyendo color…', async () => {
              const result = await bridge!.readColor(target);
              setColor(result.color);
              return 'Color de la selección cargado en HuePrint.';
            })}>Tomar de la selección</button>
            <button type="button" className="primaryButton" disabled={paintDisabled} onClick={() => void action('Aplicando color…', async () => {
              const result = await bridge!.applyColor({ color, target });
              const count = result.result.objects;
              return count ? `${color} aplicado a ${count} ${count === 1 ? 'objeto' : 'objetos'}.` : 'La selección no admite ese cambio de color.';
            })}><span className="colorChip" style={{ background: color }} />Aplicar {targetNames[target].toLowerCase()}</button>
          </div>
        </div>
        <p className="notice" data-error={notice.error && !busy} role="status">{busy || notice.text || (paintDisabled && status.connected ? 'Selecciona un objeto en VectorCraft para tomar o aplicar su color.' : '')}</p>
      </footer>
    </main>
  );
}
