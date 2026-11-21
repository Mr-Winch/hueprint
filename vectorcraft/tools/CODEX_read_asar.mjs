import { readFileSync } from 'node:fs';
const [archive, ...paths] = process.argv.slice(2);
const bytes = readFileSync(archive);
const headerSize = bytes.readUInt32LE(4);
const header = JSON.parse(bytes.subarray(16, 16 + bytes.readUInt32LE(12)).toString('utf8'));
function walk(files, prefix = '') {
  for (const [name, entry] of Object.entries(files)) {
    const path = prefix + name;
    if (entry.files) walk(entry.files, path + '/');
    else if (!paths.length) console.log(path);
    else if (paths.includes(path)) {
      if (entry.unpacked || entry.link) throw new Error('Not an embedded regular file: ' + path);
      const start = 8 + headerSize + Number(entry.offset);
      console.log(JSON.stringify({path, content:bytes.subarray(start, start + entry.size).toString('utf8')}));
    }
  }
}
walk(header.files);
