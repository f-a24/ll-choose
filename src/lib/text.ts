/**
 * 意味の切れ目に改行可能位置 (ZWSP) を入れる。表示側の word-break: keep-all と併用する。
 * 例: 蓮ノ空女学院スクールアイドルクラブ → 蓮ノ空女学院 / スクールアイドルクラブ
 */
export const withBreakHints = (text: string) => text.replace(/スクールアイドル/g, '​スクールアイドル')
