# HuePrint for VectorCraft 1.0.3

Companion de escritorio para Windows x64. Usa el mismo estudio de color HuePrint React 1.6 y se conecta a VectorCraft por su protocolo local de control, como Iconify Search for VectorCraft. Es una ventana independiente conectada al editor; no se incrusta como panel nativo.

## Instalar y usar

1. Instala VectorCraft para Windows. La integración se probó con VectorCraft 0.24.1 y requiere `--control` y los comandos `paint.setFill`, `paint.setStroke`, `swatch.newGroup`, `swatch.new` y `swatch.list`.
2. Ejecuta `CODEX_HuePrint-VectorCraft-Setup-1.0.3.exe`. El asistente instala HuePrint para tu usuario, con accesos en Inicio y en el escritorio.
3. Pulsa **Abrir VectorCraft** en la cabecera. Si el editor ya está conectado, el botón trae su ventana al frente. Si lo abriste sin control local, guarda tu trabajo, ciérralo y ábrelo desde HuePrint. Una sesión iniciada por Iconify en el puerto habitual se puede compartir.
4. Para una instalación portable que HuePrint no encuentre automáticamente, el mismo botón pide seleccionar `vectorcraft.exe`. La ubicación se recuerda en tu equipo.
5. Selecciona un objeto en VectorCraft y elige **Relleno** o **Trazo** en la barra de abajo. Puedes tomar el color de la selección o aplicarle el color activo.
6. **Enviar paleta actual** crea un grupo en Muestras si el nombre es nuevo. Si el grupo ya existe, añade solo los colores que faltan. Cada envío que añade muestras se deshace en un paso.
7. Con **Traer muestras**, elige un grupo, las muestras sin grupo o todas las muestras sólidas del documento. Los colores se añaden a Saved Swatches sin duplicados.

HuePrint conserva sus armonías, 70 recetas, nombres NTC sin conexión, biblioteca de paletas e importación y exportación GPL y JSON. El cuentagotas permite tomar un color de otra ventana o monitor. Espera a que aparezca la mira antes de elegir el color. Pulsa Esc o haz clic derecho para cancelar. La captura se mantiene en memoria mientras eliges el color. Para enviar una paleta guardada, cárgala primero como Current Palette.

## Distribuir a otras copias

Comparte el instalador y su archivo SHA-256 de `release/`. Contiene su propio runtime y todos los recursos de HuePrint; no incluye VectorCraft ni depende de rutas personales, del repositorio fuente o de Iconify. Cada equipo detecta su propia instalación. Esta entrega es Windows x64; no es un instalador para macOS/Linux.

La conexión usa exclusivamente `127.0.0.1:7979` y la API oficial de VectorCraft. No abre un servicio web ni envía los documentos o paletas a Internet. Los enlaces de nombres de color se abren en el navegador solo al pulsarlos. El puerto de control de VectorCraft no tiene autenticación: queda disponible localmente mientras la instancia iniciada con `--control` esté abierta.

Los colores se entregan como RGB HEX; en documentos CMYK, VectorCraft hace su conversión habitual según el documento. La biblioteca de HuePrint se guarda en el perfil local de la aplicación. Exporta JSON para llevar tus paletas a otro equipo. Desinstala desde Configuración de Windows; las paletas locales se conservan para una futura reinstalación.

## Desarrollo

Desde la raíz de HuePrint: `npm ci`. Después, desde esta carpeta:

```powershell
npm ci
npm test
npm run dev
npm run package
```

La compilación reutiliza `../src/color-harmony-picker`; no hay una segunda copia del motor que mantener. `CODEX_` identifica los lanzadores y scripts auxiliares. El instalador no está firmado con un certificado comercial.

`npm run dev` abre la ventana y recarga la interfaz cuando Vite termina de compilar cambios. Reinicia el proceso de desarrollo después de modificar el código principal de Electron o su preload.

Protocolo: https://github.com/storytold/vectorcraft/blob/main/docs/control-protocol.md

## Pruebas

`npm test` prueba errores de transporte, respuestas fragmentadas, validación y límites de las acciones. `tools/CODEX_integration.mjs` prueba contra una instancia aislada de VectorCraft, cuyo perfil se guarda bajo `.test-profile`; usa el puerto 7989 y documentos propios de prueba.
