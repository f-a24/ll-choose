import { describe, expect, it } from 'vitest'
import { buildItems, memberKey, shuffle } from './items'
import type { CharacterData } from '../types'

const data: CharacterData = {
  グループA: [
    { char: 'キャラA1', cast: 'キャストA1', color: '#FF0000' },
    { char: 'キャラA2', cast: 'キャストA2', color: '#00FF00' },
  ],
  グループB: [
    // グループA と同じキャスト名。統合はせず別項目として扱う
    { char: 'キャラB1', cast: 'キャストA1', color: '#0000FF' },
  ],
}

const allKeys = new Set([
  memberKey('グループA', 'キャラA1'),
  memberKey('グループA', 'キャラA2'),
  memberKey('グループB', 'キャラB1'),
])

describe('memberKey', () => {
  it('グループ名とキャラ名からキーを作る', () => {
    expect(memberKey('μ\'s', '高坂穂乃果')).toBe("μ's/高坂穂乃果")
  })

  it('グループが違えば別のキーになる', () => {
    expect(memberKey('A', '同名')).not.toBe(memberKey('B', '同名'))
  })
})

describe('buildItems', () => {
  it('選択されたメンバーだけを返す', () => {
    const items = buildItems(data, new Set([memberKey('グループA', 'キャラA2')]), 'char')
    expect(items).toHaveLength(1)
    expect(items[0].label).toBe('キャラA2')
  })

  it('選択が空なら結果も空になる', () => {
    expect(buildItems(data, new Set(), 'char')).toEqual([])
  })

  it('キャラクターモードでは label がキャラ名、sub がキャスト名になる', () => {
    const items = buildItems(data, allKeys, 'char')
    expect(items[0]).toEqual({
      label: 'キャラA1',
      sub: 'キャストA1',
      group: 'グループA',
      color: '#FF0000',
    })
  })

  it('キャストモードでは label と sub が入れ替わる', () => {
    const items = buildItems(data, allKeys, 'cast')
    expect(items[0]).toEqual({
      label: 'キャストA1',
      sub: 'キャラA1',
      group: 'グループA',
      color: '#FF0000',
    })
  })

  it('同じキャスト名でも統合せず、メンバーの数だけ項目を作る', () => {
    const items = buildItems(data, allKeys, 'cast')
    expect(items).toHaveLength(3)
    expect(items.filter((i) => i.label === 'キャストA1')).toHaveLength(2)
  })

  it('データの定義順を保つ', () => {
    const items = buildItems(data, allKeys, 'char')
    expect(items.map((i) => i.label)).toEqual(['キャラA1', 'キャラA2', 'キャラB1'])
  })

  it('group はひとつのグループ名になる', () => {
    for (const item of buildItems(data, allKeys, 'cast')) {
      expect(Object.keys(data)).toContain(item.group)
    }
  })
})

describe('shuffle', () => {
  it('元の配列を変更しない', () => {
    const src = [1, 2, 3, 4, 5]
    shuffle(src)
    expect(src).toEqual([1, 2, 3, 4, 5])
  })

  it('要素の集合は変わらない', () => {
    const src = Array.from({ length: 50 }, (_, i) => i)
    const shuffled = shuffle(src)
    expect(shuffled).toHaveLength(src.length)
    expect([...shuffled].sort((a, b) => a - b)).toEqual(src)
  })

  it('空配列でも動く', () => {
    expect(shuffle([])).toEqual([])
  })
})
