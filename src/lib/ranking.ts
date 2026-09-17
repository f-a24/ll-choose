import type { Run } from './sorter'
import type { SortItem } from '../types'

export interface RankedRow {
  /** 同順位を考慮した全体での順位 (1, 2, 2, 4 形式) */
  rank: number
  /** items のインデックス */
  index: number
}

/** 表示件数の指定。'all' は全件 */
export type Limit = number | 'all'

/** ソート結果を順位付きのフラットな行に展開する */
export function toRankedRows(result: Run): RankedRow[] {
  const rows: RankedRow[] = []
  let rank = 1
  for (const group of result) {
    for (const index of group) rows.push({ rank, index })
    rank += group.length
  }
  return rows
}

/**
 * 「グループで絞り込んだ結果の上位 limit 件」を返す。順位は全体順位のまま保つ。
 * groups が空ならグループでの絞り込みは行わない。
 */
export function filterRows(
  rows: readonly RankedRow[],
  items: readonly SortItem[],
  groups: ReadonlySet<string>,
  limit: Limit,
): RankedRow[] {
  const filtered = groups.size === 0 ? [...rows] : rows.filter((r) => groups.has(items[r.index].group))
  return limit === 'all' ? filtered : filtered.slice(0, limit)
}

/** 順位の数字を表示するか (false なら同順位を表す「=」)。絞り込みで先頭が消えた場合も数字にする */
export function isRankHead(rows: readonly RankedRow[], i: number): boolean {
  return i === 0 || rows[i - 1].rank !== rows[i].rank
}

/** 結果に含まれるグループ名を、指定した並び順 (データ定義順) で返す */
export function availableGroups(items: readonly SortItem[], order: readonly string[]): string[] {
  const present = new Set(items.map((item) => item.group))
  return order.filter((g) => present.has(g))
}
