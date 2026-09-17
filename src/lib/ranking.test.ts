import { describe, expect, it } from 'vitest'
import { availableGroups, filterRows, isRankHead, toRankedRows } from './ranking'
import type { Run } from './sorter'
import type { SortItem } from '../types'

const item = (label: string, group: string): SortItem => ({
  label,
  sub: `${label}のキャスト`,
  group,
  color: '#000000',
})

// 0:A1(1位) / 1:B1・2:A2(2位タイ) / 3:B2(4位)
const items = [item('A1', 'グループA'), item('B1', 'グループB'), item('A2', 'グループA'), item('B2', 'グループB')]
const result: Run = [[0], [1, 2], [3]]

describe('toRankedRows', () => {
  it('同順位を考慮した順位を振る (1, 2, 2, 4 形式)', () => {
    expect(toRankedRows(result)).toEqual([
      { rank: 1, index: 0 },
      { rank: 2, index: 1 },
      { rank: 2, index: 2 },
      { rank: 4, index: 3 },
    ])
  })

  it('空の結果は空の行になる', () => {
    expect(toRankedRows([])).toEqual([])
  })
})

describe('filterRows', () => {
  const rows = toRankedRows(result)

  it('グループ指定が空なら全件返す', () => {
    expect(filterRows(rows, items, new Set(), 'all')).toHaveLength(4)
  })

  it('グループで絞り込んでも順位は全体順位のまま', () => {
    const filtered = filterRows(rows, items, new Set(['グループB']), 'all')
    expect(filtered.map((r) => r.rank)).toEqual([2, 4])
  })

  it('複数グループを指定できる', () => {
    const filtered = filterRows(rows, items, new Set(['グループA', 'グループB']), 'all')
    expect(filtered).toHaveLength(4)
  })

  it('上位 N 件に切り詰める', () => {
    expect(filterRows(rows, items, new Set(), 2).map((r) => r.index)).toEqual([0, 1])
  })

  it('グループで絞り込んだ結果に対して上位 N 件を取る', () => {
    const filtered = filterRows(rows, items, new Set(['グループB']), 1)
    expect(filtered).toEqual([{ rank: 2, index: 1 }])
  })

  it('件数が N に満たなくてもエラーにならない', () => {
    expect(filterRows(rows, items, new Set(), 100)).toHaveLength(4)
  })

  it('元の配列を変更しない', () => {
    const before = [...rows]
    filterRows(rows, items, new Set(['グループA']), 1)
    expect(rows).toEqual(before)
  })
})

describe('isRankHead', () => {
  const rows = toRankedRows(result)

  it('先頭と、順位が変わる行では順位を表示する', () => {
    expect(rows.map((_, i) => isRankHead(rows, i))).toEqual([true, true, false, true])
  })

  it('絞り込みで同順位の 1 件目が消えた場合は、残った先頭に順位を表示する', () => {
    // グループA だけに絞ると、2 位タイのうち B1 が消えて A2 だけが残る
    const filtered = filterRows(rows, items, new Set(['グループA']), 'all')
    expect(filtered.map((r) => r.rank)).toEqual([1, 2])
    expect(filtered.map((_, i) => isRankHead(filtered, i))).toEqual([true, true])
  })
})

describe('availableGroups', () => {
  it('指定した並び順で、結果に含まれるグループだけを返す', () => {
    const order = ['グループB', 'グループA', 'グループC']
    expect(availableGroups(items, order)).toEqual(['グループB', 'グループA'])
  })

  it('重複を取り除く', () => {
    expect(availableGroups(items, ['グループA'])).toEqual(['グループA'])
  })
})
