import { describe, expect, it } from 'vitest'
import { answer, createSorter, currentPair, maxComparisons, progress } from './sorter'
import type { Answer, SorterState } from './sorter'

/** 失敗を再現できるよう乱数は固定シードにする */
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function shuffle<T>(src: readonly T[], rand: () => number): T[] {
  const a = [...src]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** truth に従って自動回答する。truth[i] が大きいほど上位で、同値は引き分け */
function autoSort(truth: readonly number[], useTie = true): SorterState {
  let s = createSorter(truth.length)
  let guard = 0
  while (!s.done) {
    if (guard++ > 100_000) throw new Error('ソートが終了しませんでした')
    const pair = currentPair(s)
    expect(pair).not.toBeNull()
    const [a, b] = pair!
    const ans: Answer =
      truth[a] === truth[b] && useTie ? 'tie' : truth[a] >= truth[b] ? 'left' : 'right'
    s = answer(s, ans)
  }
  return s
}

const toValues = (s: SorterState, truth: readonly number[]) =>
  s.done!.map((group) => group.map((i) => truth[i]))

const countItems = (s: SorterState) => s.done!.reduce((n, group) => n + group.length, 0)

describe('createSorter', () => {
  it('0 件なら比較せずに完了し、結果は空になる', () => {
    const s = createSorter(0)
    expect(s.done).toEqual([])
    expect(currentPair(s)).toBeNull()
    expect(s.comparisons).toBe(0)
  })

  it('1 件なら比較せずに完了する', () => {
    const s = createSorter(1)
    expect(s.done).toEqual([[0]])
    expect(currentPair(s)).toBeNull()
    expect(s.comparisons).toBe(0)
  })

  it('2 件以上なら最初の比較対象が得られる', () => {
    const s = createSorter(2)
    expect(s.done).toBeNull()
    expect(currentPair(s)).toEqual([0, 1])
  })
})

describe('ソート結果', () => {
  it('回答どおりの降順に並ぶ', () => {
    const s = autoSort([0, 3, 1, 2])
    expect(toValues(s, [0, 3, 1, 2])).toEqual([[3], [2], [1], [0]])
  })

  it('引き分けにした要素は同順位グループにまとまる', () => {
    const truth = [2, 1, 2, 0]
    const s = autoSort(truth)
    const values = toValues(s, truth)
    expect(values).toEqual([[2, 2], [1], [0]])
  })

  it('すべて引き分けなら 1 グループになる', () => {
    const s = autoSort([1, 1, 1, 1, 1])
    expect(s.done).toHaveLength(1)
    expect(s.done![0]).toHaveLength(5)
  })

  it.each([2, 3, 7, 16, 33, 62])('%i 件をランダムな順序で正しく並べ替える', (n) => {
    const rand = createRandom(n * 7919)
    for (let trial = 0; trial < 5; trial++) {
      const truth = shuffle(
        Array.from({ length: n }, (_, i) => i),
        rand,
      )
      const s = autoSort(truth)
      const values = toValues(s, truth).map((g) => g[0])
      expect(values).toEqual([...values].sort((a, b) => b - a))
      expect(countItems(s)).toBe(n)
    }
  })

  it('同値を多く含んでも、同順位グループ内の値はすべて等しい', () => {
    const rand = createRandom(20260914)
    for (let trial = 0; trial < 20; trial++) {
      const n = 2 + Math.floor(rand() * 30)
      const truth = Array.from({ length: n }, () => Math.floor(rand() * 3))
      const s = autoSort(truth)
      for (const group of toValues(s, truth)) {
        expect(new Set(group).size).toBe(1)
      }
      expect(countItems(s)).toBe(n)
    }
  })
})

describe('answer', () => {
  it('元の状態を変更しない', () => {
    const before = createSorter(8)
    const snapshot = structuredClone(before)
    answer(before, 'left')
    expect(before).toEqual(snapshot)
  })

  it('完了後に回答しても状態は変わらない', () => {
    const done = autoSort([2, 1])
    expect(answer(done, 'left')).toBe(done)
  })
})

describe('progress', () => {
  it('開始時は 0、完了時は 100 になる', () => {
    expect(progress(createSorter(10))).toBe(0)
    expect(progress(autoSort([3, 1, 2]))).toBe(100)
  })

  it('1 件以下でも 100 を返す', () => {
    expect(progress(createSorter(0))).toBe(100)
    expect(progress(createSorter(1))).toBe(100)
  })

  it('回答しても後戻りしない', () => {
    const truth = Array.from({ length: 40 }, (_, i) => i)
    let s = createSorter(truth.length)
    let last = -1
    while (!s.done) {
      const p = progress(s)
      expect(p).toBeGreaterThanOrEqual(last)
      last = p
      const [a, b] = currentPair(s)!
      s = answer(s, truth[a] > truth[b] ? 'left' : 'right')
    }
  })
})

describe('maxComparisons', () => {
  it('1 件以下なら 0 回', () => {
    expect(maxComparisons(0)).toBe(0)
    expect(maxComparisons(1)).toBe(0)
  })

  it('2 件なら 1 回', () => {
    expect(maxComparisons(2)).toBe(1)
  })

  it.each([2, 3, 7, 16, 33, 62])('%i 件の実際の比較回数が上限を超えない', (n) => {
    const rand = createRandom(n * 104729)
    for (let trial = 0; trial < 5; trial++) {
      const truth = shuffle(
        Array.from({ length: n }, (_, i) => i),
        rand,
      )
      // 引き分けを使うと比較回数は減るため、使わない場合が最悪ケースになる
      expect(autoSort(truth, false).comparisons).toBeLessThanOrEqual(maxComparisons(n))
    }
  })
})
