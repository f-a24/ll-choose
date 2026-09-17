import type { CharacterData, SortItem, SortMode } from '../types'

/** グループ名 + キャラ名 で 1 メンバーを一意に指すキー */
export const memberKey = (group: string, char: string) => `${group}/${char}`

/** 選択されたメンバーからソート対象アイテムを組み立てる */
export function buildItems(
  data: CharacterData,
  selected: ReadonlySet<string>,
  mode: SortMode,
): SortItem[] {
  const items: SortItem[] = []

  for (const [group, members] of Object.entries(data)) {
    for (const m of members) {
      if (!selected.has(memberKey(group, m.char))) continue
      items.push(
        mode === 'char'
          ? { label: m.char, sub: m.cast, group, color: m.color }
          : { label: m.cast, sub: m.char, group, color: m.color },
      )
    }
  }
  return items
}

/** Fisher-Yates シャッフル (出題順の偏りをなくす) */
export function shuffle<T>(src: readonly T[]): T[] {
  const a = [...src]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
