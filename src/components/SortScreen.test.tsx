import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@solidjs/testing-library'
import SortScreen from './SortScreen'
import type { SortItem } from '../types'

/** 改行可能位置 (ゼロ幅スペース) */
const ZWSP = '​'

const left: SortItem = {
  label: '高坂穂乃果',
  sub: '新田恵海',
  group: "μ's",
  color: '#FF7F27',
}

const right: SortItem = {
  label: '日野下花帆',
  sub: '楡井希実',
  group: '蓮ノ空女学院スクールアイドルクラブ',
  color: '#FBA51E',
}

function setup() {
  const onAnswer = vi.fn()
  const onBackToSetup = vi.fn()
  const result = render(() => (
    <SortScreen
      left={left}
      right={right}
      comparisons={4}
      progress={37}
      onAnswer={onAnswer}
      onBackToSetup={onBackToSetup}
    />
  ))
  return { ...result, onAnswer, onBackToSetup }
}

/** 名前が書かれたカード (ボタン) を取り出す */
const cardOf = (label: string) => screen.getByText(label).closest('button') as HTMLButtonElement

describe('SortScreen', () => {
  it('両方のカードに名前と補足名を表示する', () => {
    setup()
    expect(screen.getByText('高坂穂乃果')).toBeInTheDocument()
    expect(screen.getByText('新田恵海')).toBeInTheDocument()
    expect(screen.getByText('日野下花帆')).toBeInTheDocument()
    expect(screen.getByText('楡井希実')).toBeInTheDocument()
  })

  it('何回目かと進捗率を表示する', () => {
    setup()
    expect(screen.getByText('5 回目')).toBeInTheDocument()
    expect(screen.getByText('37%')).toBeInTheDocument()
  })

  it('左のカードを押すと left を通知する', () => {
    const { onAnswer } = setup()
    fireEvent.click(cardOf('高坂穂乃果'))
    expect(onAnswer).toHaveBeenCalledWith('left')
  })

  it('右のカードを押すと right を通知する', () => {
    const { onAnswer } = setup()
    fireEvent.click(cardOf('日野下花帆'))
    expect(onAnswer).toHaveBeenCalledWith('right')
  })

  it('引き分けを押すと tie を通知する', () => {
    const { onAnswer } = setup()
    fireEvent.click(screen.getByText('引き分け'))
    expect(onAnswer).toHaveBeenCalledWith('tie')
  })

  it('対象を選び直すを押すと通知する', () => {
    const { onBackToSetup } = setup()
    fireEvent.click(screen.getByText('対象を選び直す'))
    expect(onBackToSetup).toHaveBeenCalled()
  })

  it('長いグループ名には改行可能位置が入るが、表示される文字列は変わらない', () => {
    const { container } = setup()
    const text = container.textContent ?? ''
    expect(text).toContain(`蓮ノ空女学院${ZWSP}スクールアイドルクラブ`)
    expect(text.split(ZWSP).join('')).toContain('蓮ノ空女学院スクールアイドルクラブ')
  })
})
