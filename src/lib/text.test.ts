import { describe, expect, it } from 'vitest';
import { withBreakHints } from './text';

const ZWSP = '​';

describe('withBreakHints', () => {
  it('「スクールアイドル」の直前に改行可能位置を入れる', () => {
    expect(withBreakHints('蓮ノ空女学院スクールアイドルクラブ')).toBe(
      `蓮ノ空女学院${ZWSP}スクールアイドルクラブ`,
    );
    expect(withBreakHints('虹ヶ咲学園スクールアイドル同好会')).toBe(
      `虹ヶ咲学園${ZWSP}スクールアイドル同好会`,
    );
  });

  it('対象がない文字列は変更しない', () => {
    for (const name of ["μ's", 'Aqours', 'Liella!', 'いきづらい部！']) {
      expect(withBreakHints(name)).toBe(name);
    }
  });

  it('改行可能位置を入れても表示上の文字列は変わらない', () => {
    const name = '蓮ノ空女学院スクールアイドルクラブ';
    expect(withBreakHints(name).replace(new RegExp(ZWSP, 'g'), '')).toBe(name);
  });

  it('空文字でも動く', () => {
    expect(withBreakHints('')).toBe('');
  });
});
