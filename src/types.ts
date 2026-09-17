/** characters.json の 1 要素 */
export interface MemberData {
  char: string;
  cast: string;
  /** メンバーカラー (#RRGGBB) */
  color: string;
}

/** characters.json 全体: { グループ名: メンバー配列 } */
export type CharacterData = Record<string, MemberData[]>;

export type SortMode = 'char' | 'cast';

/** ソーターに渡す 1 項目 (メンバー 1 人に対応する) */
export interface SortItem {
  /** 大きく表示する名前 (モードにより キャラ名 or キャスト名) */
  label: string;
  /** 補足として表示するもう一方の名前 */
  sub: string;
  group: string;
  color: string;
}
