function hashString(value: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

function mapHash(value: string, min: number, max: number): number {
  const ratio = hashString(value) / 0xffffffff;
  return min + (max - min) * ratio;
}

export function getCardRotation(id: string): number {
  return Number(mapHash(`card:${id}`, -1.5, 1.5).toFixed(3));
}

export function getTapeRotation(id: string): number {
  return Number(mapHash(`tape:${id}`, -3.5, 3.5).toFixed(3));
}

export function getTapeOffset(id: string): number {
  return Number(mapHash(`tape-offset:${id}`, 24, 68).toFixed(2));
}

export function getStickerRotation(value: string): number {
  return Number(mapHash(`sticker:${value}`, -2.5, 2.5).toFixed(3));
}

export function getStickerVariant(value: string, count = 5): number {
  return hashString(`sticker-color:${value}`) % count;
}
