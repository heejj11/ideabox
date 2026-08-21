import { getCardRotation, getStickerVariant } from './deterministicStyle';

describe('deterministic styles', () => {
  it('keeps a card rotation stable and inside the requested range', () => {
    const rotation = getCardRotation('same-idea');
    expect(getCardRotation('same-idea')).toBe(rotation);
    expect(rotation).toBeGreaterThanOrEqual(-1.5);
    expect(rotation).toBeLessThanOrEqual(1.5);
  });

  it('maps sticker colors into the available palette', () => {
    expect(getStickerVariant('research', 5)).toBeGreaterThanOrEqual(0);
    expect(getStickerVariant('research', 5)).toBeLessThan(5);
  });
});
