// A working news-image-daily entry (Node 22, standard library only): its image is the entry.png beside this file, and
// the program copies it to /output/entry.png. A starting point, not a winner: replace the image. The gate takes a
// whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels, and the judge sees exactly the bytes copied.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const src = join(here, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const dst = join(outDir, 'entry.png');

const MAX_BYTES = 1048576;
const MAX_SIDE = 1024;

// Refuse a broken or oversized image here instead of shipping an invalid entry: the judge sees
// exactly these bytes, and PNG IHDR at 16..23 carries width and height big-endian.
const info = statSync(src);
if (info.size === 0) throw new Error(`news-image: ${src} is empty`);
if (info.size > MAX_BYTES) throw new Error(`news-image: ${src} is ${info.size} bytes, over the 1 MiB cap`);
const head = readFileSync(src).subarray(0, 24);
if (head[0] === 0x89 && head[1] === 0x50) {
  const w = head.readUInt32BE(16);
  const h = head.readUInt32BE(20);
  if (w > MAX_SIDE || h > MAX_SIDE) throw new Error(`news-image: ${w}x${h} exceeds ${MAX_SIDE}x${MAX_SIDE}`);
}

copyFileSync(src, dst);
process.stdout.write(`news-image: copied ${info.size} bytes to ${dst}\n`);
