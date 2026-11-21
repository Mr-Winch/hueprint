const net = require('node:net');
let nextId = 1;

function createClient({ port = 7979, timeout = 65000 } = {}) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid control port.');
  return function request(method, params = {}, timeoutMs = timeout) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      const socket = net.createConnection({ host: '127.0.0.1', port });
      let buffer = '';
      let settled = false;
      const finish = (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(deadline);
        socket.destroy();
        if (error) reject(error); else resolve(result);
      };
      const deadline = setTimeout(() => finish(new Error('VectorCraft no respondió a tiempo. Comprueba el documento antes de repetir la acción.')), timeoutMs);
      socket.setEncoding('utf8');
      socket.once('error', (error) => finish(error));
      socket.once('end', () => finish(new Error('VectorCraft cerró la conexión sin responder.')));
      socket.on('data', (chunk) => {
        buffer += chunk;
        if (buffer.length > 8 * 1024 * 1024) return finish(new Error('La respuesta de VectorCraft es demasiado grande.'));
        const newline = buffer.indexOf('\n');
        if (newline < 0) return;
        try {
          const reply = JSON.parse(buffer.slice(0, newline));
          if (reply.id !== id) throw new Error('VectorCraft devolvió una respuesta que no corresponde a esta solicitud.');
          if (reply.ok !== true) throw new Error(typeof reply.error === 'string' ? reply.error : 'VectorCraft rechazó la acción.');
          finish(null, reply.result);
        } catch (error) { finish(error); }
      });
      socket.once('connect', () => socket.write(JSON.stringify({id, method, params}) + '\n'));
    });
  };
}
module.exports = { createClient };
