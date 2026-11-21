import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const {createClient} = require('../CODEX_connection.cjs');
const [method = 'ui.inspect', params = '{}', port = '7979'] = process.argv.slice(2);
try {console.log(JSON.stringify(await createClient({port:Number(port)})(method,JSON.parse(params)),null,2));}
catch(error){console.error(error.message);process.exitCode=1;}
