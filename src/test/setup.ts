import '@testing-library/jest-dom/vitest'

/**
 * SUID の Chip が出力する `--xxxxx: & .MuiChip-deleteIcon` を jsdom が解析できず、
 * Chip を描画するたびに警告が出るため通知を止める (詳細は README「既知の警告」)。
 * 自分たちのスタイルの誤りは見逃したくないので、対象をこの宣言に限定する。
 */
const SUID_CHIP_MARKER = '--xxxxx'

interface JsdomError {
  type?: string
  sheetText?: string
}
interface VirtualConsole {
  listeners(event: string): ((e: JsdomError) => void)[]
  removeAllListeners(event: string): void
  on(event: string, listener: (e: JsdomError) => void): void
}

const virtualConsole = (globalThis as { _virtualConsole?: VirtualConsole })._virtualConsole
if (virtualConsole) {
  const original = virtualConsole.listeners('jsdomError')
  virtualConsole.removeAllListeners('jsdomError')
  virtualConsole.on('jsdomError', (error) => {
    if (error?.type === 'css-parsing' && error.sheetText?.includes(SUID_CHIP_MARKER)) return
    for (const listener of original) listener(error)
  })
}
