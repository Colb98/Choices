import fs from 'node:fs';
import path from 'node:path';

const POLYNOMIAL = 0x04c11db7;
const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index << 24;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 0x80000000
      ? ((value << 1) ^ POLYNOMIAL) >>> 0
      : (value << 1) >>> 0;
  }
  return value;
});

function oggCrc(buffer, start, end) {
  let crc = 0;
  for (let offset = start; offset < end; offset += 1) {
    crc = ((crc << 8) ^ CRC_TABLE[((crc >>> 24) ^ buffer[offset]) & 0xff]) >>> 0;
  }
  return crc;
}

function parsePages(buffer, filename) {
  const pages = [];
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 27 > buffer.length || buffer.toString('ascii', offset, offset + 4) !== 'OggS') {
      throw new Error(`${filename}: invalid Ogg page at byte ${offset}`);
    }

    const segmentCount = buffer[offset + 26];
    const headerLength = 27 + segmentCount;
    if (offset + headerLength > buffer.length) throw new Error(`${filename}: truncated segment table`);

    const segments = [];
    let bodyOffset = offset + headerLength;
    for (let index = 0; index < segmentCount; index += 1) {
      const length = buffer[offset + 27 + index];
      segments.push({ offset: bodyOffset, length });
      bodyOffset += length;
    }
    if (bodyOffset > buffer.length) throw new Error(`${filename}: truncated page body`);

    pages.push({ start: offset, end: bodyOffset, segments });
    offset = bodyOffset;
  }

  return pages;
}

function collectPackets(pages) {
  const packets = [];
  let fragments = [];

  for (const page of pages) {
    for (const segment of page.segments) {
      fragments.push({ ...segment, page });
      if (segment.length < 255) {
        packets.push(fragments);
        fragments = [];
      }
    }
  }
  if (fragments.length > 0) throw new Error('truncated final Ogg packet');
  return packets;
}

function readPacket(buffer, fragments) {
  return Buffer.concat(fragments.map(({ offset, length }) => buffer.subarray(offset, offset + length)));
}

function anonymousCommentPacket(length) {
  const signature = Buffer.from([0x03, ...Buffer.from('vorbis')]);
  const vendor = Buffer.from('anonymous');
  const fixedLength = signature.length + 4 + vendor.length + 4 + 4 + 1;
  const commentLength = length - fixedLength;
  if (commentLength < 8) throw new Error('Vorbis comment packet is too short to sanitize safely');

  const packet = Buffer.alloc(length, 0x20);
  let offset = 0;
  signature.copy(packet, offset);
  offset += signature.length;
  packet.writeUInt32LE(vendor.length, offset);
  offset += 4;
  vendor.copy(packet, offset);
  offset += vendor.length;
  packet.writeUInt32LE(1, offset);
  offset += 4;
  packet.writeUInt32LE(commentLength, offset);
  offset += 4;
  Buffer.from('PADDING=').copy(packet, offset);
  packet[length - 1] = 1; // Required Vorbis comment framing bit.
  return packet;
}

function sanitizeFile(filename) {
  const buffer = fs.readFileSync(filename);
  const pages = parsePages(buffer, filename);
  const packets = collectPackets(pages);
  const commentFragments = packets.find((fragments) => {
    const packet = readPacket(buffer, fragments);
    return packet.length >= 7 && packet[0] === 0x03 && packet.toString('ascii', 1, 7) === 'vorbis';
  });
  if (!commentFragments) throw new Error(`${filename}: Vorbis comment packet not found`);

  const originalPacket = readPacket(buffer, commentFragments);
  const replacement = anonymousCommentPacket(originalPacket.length);
  const changedPages = new Set();
  let replacementOffset = 0;
  for (const fragment of commentFragments) {
    replacement.copy(buffer, fragment.offset, replacementOffset, replacementOffset + fragment.length);
    replacementOffset += fragment.length;
    changedPages.add(fragment.page);
  }

  for (const page of changedPages) {
    buffer.fill(0, page.start + 22, page.start + 26);
    buffer.writeUInt32LE(oggCrc(buffer, page.start, page.end), page.start + 22);
  }

  fs.writeFileSync(filename, buffer);
  console.log(`Sanitized ${filename} (${originalPacket.length} comment bytes replaced)`);
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('Usage: node scripts/sanitize-ogg-metadata.mjs <file.ogg> [...]');
  process.exit(2);
}

for (const input of inputs) sanitizeFile(path.resolve(input));
