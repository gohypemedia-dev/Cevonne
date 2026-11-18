import fs from 'fs';

const fd = fs.openSync('C:/Users/GHM/Desktop/Recording 2026-11-18 120818.mp4', 'r');
let offset = 0;
const stat = fs.fstatSync(fd);

while (offset < stat.size) {
  const header = Buffer.alloc(8);
  const bytesRead = fs.readSync(fd, header, 0, 8, offset);
  if (bytesRead < 8) break;
  const size = header.readUInt32BE(0);
  const type = header.slice(4, 8).toString('ascii');
  console.log(`Box: ${type}, size: ${size}, offset: ${offset}`);
  if (size === 0 || size === 1) break;
  offset += size;
}

const buf = fs.readFileSync('C:/Users/GHM/Desktop/Recording 2026-11-18 120818.mp4');
const mdhdIdx = buf.indexOf('mdhd');
if (mdhdIdx !== -1) {
  const timescale = buf.readUInt32BE(mdhdIdx + 12);
  const duration = buf.readUInt32BE(mdhdIdx + 16);
  console.log(`Timescale: ${timescale}, Duration: ${duration} (${duration / timescale} seconds)`);
}
fs.closeSync(fd);
