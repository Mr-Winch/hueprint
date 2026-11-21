function hexColor(value) {
  if (typeof value !== 'string' || !/^#[0-9a-f]{6}$/i.test(value)) throw new Error('El color debe ser HEX de seis dígitos.');
  return value.toUpperCase();
}
function paletteInput(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 120) throw new Error('Escribe un nombre de paleta de hasta 120 caracteres.');
  if (!Array.isArray(input.colors) || input.colors.length < 1 || input.colors.length > 256) throw new Error('La paleta debe tener entre 1 y 256 colores.');
  return { name: input.name.trim(), colors: [...new Set(input.colors.map(hexColor))] };
}
function selectedIds(inspection) {
  const ids = inspection?.selection;
  if (!Array.isArray(ids) || !ids.length) throw new Error('Selecciona un objeto en VectorCraft y vuelve a intentarlo.');
  if (ids.some((id) => !Number.isSafeInteger(id) || id < 0)) throw new Error('VectorCraft devolvió una selección no válida.');
  return ids;
}
function createOperations(request) {
  const execute = (command, params = {}) => request('engine.execute', {command, params});

  async function missingColors(colors, swatches) {
    const existingHex = new Set(swatches.map(({ hex }) => hex?.toUpperCase()));
    const missing = colors.filter((hex) => !existingHex.has(hex));
    const cmyk = new Set(swatches.filter(({ color }) => color?.model === 'cmyk')
      .map(({ color }) => [color.c, color.m, color.y, color.k].join(',')));
    if (!cmyk.size || !missing.length) return missing;

    const document = await request('document.inspect', {depth:0, childLimit:0});
    if (document.colorMode?.toLowerCase() !== 'cmyk') return missing;

    // VectorCraft can display a different HEX after converting RGB to working CMYK.
    const additions = [];
    for (const color of missing) {
      const converted = await execute('color.convert', {color, to:'cmyk'});
      const key = converted.values.join(',');
      if (cmyk.has(key)) continue;
      cmyk.add(key);
      additions.push(color);
    }
    return additions;
  }

  return {
    async status() {
      const ui = await request('ui.inspect', {}, 2500);
      let document = null;
      try { document = await request('document.inspect', {depth:0, childLimit:0}, 2500); } catch { /* no document */ }
      return {connected:true, ui, document};
    },
    async applyColor(input) {
      const color = hexColor(input?.color);
      if (input?.target !== 'fill' && input?.target !== 'stroke') throw new Error('Destino de color no válido.');
      const doc = await request('document.inspect', {depth:0, childLimit:0});
      const ids = selectedIds(doc);
      // Capture the current selection explicitly; never apply to defaults on an empty selection.
      const result = await execute(input.target === 'fill' ? 'paint.setFill' : 'paint.setStroke', {color, ids});
      return { color, target: input.target, result };
    },
    async readColor(target = 'fill') {
      if (target !== 'fill' && target !== 'stroke') throw new Error('Destino de color no válido.');
      const doc = await request('document.inspect', {depth:0, childLimit:0});
      const ids = selectedIds(doc);
      const selected = await request('document.inspect', {ids:[ids[0]], depth:0, childLimit:0});
      const paint = selected.nodes?.[0]?.[target];
      const color = typeof paint === 'string' ? paint : paint?.hex ?? paint?.color;
      try { return {color:hexColor(color)}; }
      catch { throw new Error('El primer objeto seleccionado no tiene un color sólido de ' + (target === 'fill' ? 'relleno' : 'trazo') + '.'); }
    },
    async sendPalette(input) {
      const { name, colors } = paletteInput(input);
      const catalog = await execute('swatch.list');
      if (!catalog.groups.some((group) => group.name === name)) {
        const result = await execute('swatch.newGroup', {name, colors});
        return {name:result.name, count:result.swatches.length, created:true};
      }

      const swatches = catalog.swatches.filter((swatch) => swatch.group === name && swatch.kind === 'color');
      const additions = await missingColors(colors, swatches);
      if (!additions.length) return {name, count:0, created:false};

      const result = await execute('swatch.new', {group:name, colors:additions});
      return {name, count:result.names.length, created:false};
    },
    async readSwatches() {
      const result = await execute('swatch.list');
      const colors = (result.swatches ?? [])
        .filter((swatch) => swatch.kind === 'color' && /^#[0-9a-f]{6}$/i.test(swatch.hex))
        .map((swatch) => ({ hex: swatch.hex.toUpperCase(), name: swatch.name, group: swatch.group || null }));
      const counts = new Map();
      for (const { group } of colors) counts.set(group, (counts.get(group) ?? 0) + 1);
      const groups = (result.groups ?? [])
        .map(({ name }) => ({ name, count: counts.get(name) ?? 0 }))
        .filter(({ count }) => count > 0);
      return { colors, groups, ungroupedCount: counts.get(null) ?? 0 };
    }
  };
}
module.exports = {createOperations, hexColor, paletteInput, selectedIds};
