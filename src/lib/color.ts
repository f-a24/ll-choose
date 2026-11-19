/** #RRGGBB を [r, g, b] (0-255) に分解する */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => Number.parseInt(h.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function toHex(rgb: number[]): string {
  return `#${rgb
    .map(v => Math.round(v).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

/** WCAG の相対輝度 (0 = 黒, 1 = 白) */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** 色を黒に向かって暗くする (amount: 0 = そのまま, 1 = 黒) */
export function darken(hex: string, amount: number): string {
  return toHex(parseHex(hex).map(v => v * (1 - amount)));
}

/** 明るい色か (白文字が読みにくい色か) */
export function isLight(hex: string): boolean {
  // 白文字のコントラストが 3:1 を下回るあたり (グレーや橙) から濃い文字に切り替える
  return luminance(hex) > 0.3;
}

/** その色で塗った面に載せる文字色 */
export function onColor(hex: string): string {
  return isLight(hex) ? '#222222' : '#FFFFFF';
}

/** 白〜淡い背景の上で読める、その色系統の濃い文字色 */
export function inkColor(hex: string): string {
  // 明るい色ほど強めに暗くして可読性を確保する
  return darken(hex, isLight(hex) ? 0.55 : 0.35);
}

/** 枠線用の色。白に近い色は背景に溶けるので少し暗くする */
export function borderColor(hex: string): string {
  return luminance(hex) > 0.7 ? darken(hex, 0.25) : hex;
}
