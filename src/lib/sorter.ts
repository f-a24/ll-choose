/**
 * 対話式マージソート。
 * 要素は「同順位グループ (Group)」の配列 = Run として保持し、引き分けで Group を統合する。
 * 状態は純粋なデータのみなので、answer() は複製を更新して返せる。
 */

/** 同順位のアイテム index 群 */
export type Group = number[]
/** 降順 (好きな順) に並んだ Group の列 */
export type Run = Group[]

export type Answer = 'left' | 'right' | 'tie'

export interface SorterState {
  queue: Run[]
  left: Run | null
  right: Run | null
  /** left / right の読み出し位置 */
  li: number
  ri: number
  out: Run
  /** 完了していれば最終結果 */
  done: Run | null
  comparisons: number
  /** 確定済みアイテム数 (進捗表示用) */
  work: number
  totalWork: number
}

/** マージ手順全体で確定するアイテム数の総和。要素数 n だけで決まるので事前計算できる */
function computeTotalWork(n: number): number {
  if (n < 2) return 0
  const sizes: number[] = new Array(n).fill(1)
  let head = 0
  let total = 0
  while (sizes.length - head > 1) {
    const a = sizes[head++]
    const b = sizes[head++]
    total += a + b
    sizes.push(a + b)
  }
  return total
}

/** 次の比較待ちになるまで状態を進める。引数を書き換えるので複製を渡すこと */
function settle(s: SorterState): SorterState {
  for (;;) {
    if (s.left && s.right) {
      if (s.li < s.left.length && s.ri < s.right.length) return s
      // 片側が尽きたので残りをそのまま流し込む
      while (s.li < s.left.length) {
        s.out.push(s.left[s.li])
        s.work += s.left[s.li].length
        s.li++
      }
      while (s.ri < s.right.length) {
        s.out.push(s.right[s.ri])
        s.work += s.right[s.ri].length
        s.ri++
      }
      s.queue.push(s.out)
      s.left = null
      s.right = null
      s.out = []
      s.li = 0
      s.ri = 0
      continue
    }
    if (s.queue.length >= 2) {
      s.left = s.queue.shift()!
      s.right = s.queue.shift()!
      s.li = 0
      s.ri = 0
      s.out = []
      continue
    }
    s.done = s.queue.length === 1 ? s.queue[0] : []
    return s
  }
}

/** n 個のアイテム (index 0..n-1) をソートする状態を作る */
export function createSorter(n: number): SorterState {
  const queue: Run[] = []
  for (let i = 0; i < n; i++) queue.push([[i]])
  return settle({
    queue,
    left: null,
    right: null,
    li: 0,
    ri: 0,
    out: [],
    done: null,
    comparisons: 0,
    work: 0,
    totalWork: computeTotalWork(n),
  })
}

/** 出題すべき比較対象 [左のindex, 右のindex]。同順位グループは先頭の 1 件だけを出す */
export function currentPair(s: SorterState): [number, number] | null {
  if (s.done || !s.left || !s.right) return null
  return [s.left[s.li][0], s.right[s.ri][0]]
}

/** 回答を反映した新しい状態を返す (元の状態は変更しない) */
export function answer(s: SorterState, a: Answer): SorterState {
  if (s.done || !s.left || !s.right) return s
  const next: SorterState = structuredClone(s)
  const lg = next.left![next.li]
  const rg = next.right![next.ri]
  if (a === 'left') {
    next.out.push(lg)
    next.work += lg.length
    next.li++
  } else if (a === 'right') {
    next.out.push(rg)
    next.work += rg.length
    next.ri++
  } else {
    const merged = [...lg, ...rg]
    next.out.push(merged)
    next.work += merged.length
    next.li++
    next.ri++
  }
  next.comparisons++
  return settle(next)
}

/** 進捗率 (0-100)。比較回数ではなく確定件数が基準なので引き分けでも後戻りしない */
export function progress(s: SorterState): number {
  if (s.totalWork === 0) return 100
  return Math.min(100, Math.round((s.work / s.totalWork) * 100))
}

/**
 * 比較回数の上限 (目安表示用)。
 * 1 回のマージは「両側の要素数の合計 - 1」回以下で終わり、マージは n - 1 回行われる。
 */
export function maxComparisons(n: number): number {
  if (n < 2) return 0
  return computeTotalWork(n) - (n - 1)
}
