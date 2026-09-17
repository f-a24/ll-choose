import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import SetupScreen from './SetupScreen'
import { memberKey } from '../lib/items'
import type { CharacterData, SortMode } from '../types'

const data: CharacterData = {
  グループA: [
    { char: 'キャラA1', cast: 'キャストA1', color: '#FF0000' },
    { char: 'キャラA2', cast: 'キャストA2', color: '#00FF00' },
  ],
  グループB: [{ char: 'キャラB1', cast: 'キャストB1', color: '#0000FF' }],
}

const allKeys = [
  memberKey('グループA', 'キャラA1'),
  memberKey('グループA', 'キャラA2'),
  memberKey('グループB', 'キャラB1'),
]

function setup(options: { selected?: string[]; mode?: SortMode } = {}) {
  const onModeChange = vi.fn()
  const onSelectedChange = vi.fn()
  const onStart = vi.fn()
  const selected = new Set(options.selected ?? allKeys)
  const rendered = render(() => (
    <SetupScreen
      data={data}
      mode={options.mode ?? 'char'}
      onModeChange={onModeChange}
      selected={selected}
      onSelectedChange={onSelectedChange}
      itemCount={selected.size}
      onStart={onStart}
    />
  ))
  return { ...rendered, onModeChange, onSelectedChange, onStart }
}

/** 最後に onSelectedChange へ渡された Set を配列で取り出す */
const lastSelection = (fn: ReturnType<typeof vi.fn>) =>
  [...(fn.mock.calls.at(-1)![0] as Set<string>)]

describe('SetupScreen', () => {
  it('選択中の人数と最大比較回数を表示する', () => {
    setup()
    expect(screen.getByText('3 人を選択中')).toBeInTheDocument()
    expect(screen.getByText(/最大 \d+ 回の選択/)).toBeInTheDocument()
  })

  it('グループごとの選択数を表示する', () => {
    setup({ selected: [allKeys[0]] })
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByText('0 / 1')).toBeInTheDocument()
  })

  it('初期状態ではメンバー一覧を閉じている', () => {
    setup()
    expect(screen.queryByText('キャラA1')).toBeNull()
  })

  it('グループ見出しを押すとメンバー一覧が開く', () => {
    setup()
    fireEvent.click(screen.getByText('グループA'))
    expect(screen.getByText('キャラA1')).toBeInTheDocument()
    expect(screen.getByText('キャラA2')).toBeInTheDocument()
    expect(screen.queryByText('キャラB1')).toBeNull()
  })

  it('複数のグループを同時に開ける', () => {
    setup()
    fireEvent.click(screen.getByText('グループA'))
    fireEvent.click(screen.getByText('グループB'))
    expect(screen.getByText('キャラA1')).toBeInTheDocument()
    expect(screen.getByText('キャラB1')).toBeInTheDocument()
  })

  it('キャストモードではキャスト名を主に表示する', () => {
    setup({ mode: 'cast' })
    fireEvent.click(screen.getByText('グループA'))
    expect(screen.getByText('キャストA1')).toBeInTheDocument()
    expect(screen.getByText('キャラA1')).toBeInTheDocument()
  })

  it('「すべて解除」で空の選択を通知する', () => {
    const { onSelectedChange } = setup()
    fireEvent.click(screen.getByText('すべて解除'))
    expect(lastSelection(onSelectedChange)).toEqual([])
  })

  it('「すべて選択」で全員のキーを通知する', () => {
    const { onSelectedChange } = setup({ selected: [] })
    fireEvent.click(screen.getByText('すべて選択'))
    expect(lastSelection(onSelectedChange).sort()).toEqual([...allKeys].sort())
  })

  it('メンバーのチェックを外すとそのキーだけが除かれる', () => {
    const { onSelectedChange } = setup()
    fireEvent.click(screen.getByText('グループA'))
    fireEvent.click(screen.getByText('キャラA1'))
    expect(lastSelection(onSelectedChange)).toEqual([allKeys[1], allKeys[2]])
  })

  it('グループのチェックを外すとそのグループ全員が除かれる', () => {
    const { container, onSelectedChange } = setup()
    const groupCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    fireEvent.click(groupCheckbox)
    expect(lastSelection(onSelectedChange)).toEqual([allKeys[2]])
  })

  it('2 人未満のときはソートを開始できない', () => {
    setup({ selected: [allKeys[0]] })
    const start = screen.getByText('ソート開始').closest('button') as HTMLButtonElement
    expect(start.disabled).toBe(true)
  })

  it('ソート開始を押すと通知する', () => {
    const { onStart } = setup()
    fireEvent.click(screen.getByText('ソート開始'))
    expect(onStart).toHaveBeenCalled()
  })
})
