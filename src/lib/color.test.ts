import { describe, expect, it } from 'vitest';
import { borderColor, darken, inkColor, isLight, luminance } from './color';

describe('color', () => {
  it('相対輝度は黒で 0、白で 1', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#FFFFFF')).toBeCloseTo(1);
  });

  it('darken は指定割合だけ黒に近づける', () => {
    expect(darken('#FF8000', 0.5)).toBe('#804000');
    expect(darken('#123456', 0)).toBe('#123456');
  });

  it('明るい色と暗い色を判定する', () => {
    expect(isLight('#FFE14D')).toBe(true);
    expect(isLight('#E8383D')).toBe(false);
  });

  it('文字色は元の色より暗い', () => {
    for (const c of ['#E8E8E8', '#FFE14D', '#E8383D', '#1F6BC6']) {
      expect(luminance(inkColor(c))).toBeLessThan(luminance(c));
    }
  });

  it('白に近い色の枠線だけ暗くする', () => {
    expect(borderColor('#E8383D')).toBe('#E8383D');
    expect(luminance(borderColor('#E8E8E8'))).toBeLessThan(
      luminance('#E8E8E8'),
    );
  });
});
