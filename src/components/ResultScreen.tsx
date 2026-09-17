import { createMemo, createSignal, For, Show } from 'solid-js'
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@suid/material'
import DownloadIcon from '@suid/icons-material/Download'
import ReplayIcon from '@suid/icons-material/Replay'
import TuneIcon from '@suid/icons-material/Tune'
import { toPng } from 'html-to-image'
import { availableGroups, filterRows, isRankHead, toRankedRows } from '../lib/ranking'
import type { Limit } from '../lib/ranking'
import type { Run } from '../lib/sorter'
import type { SortItem, SortMode } from '../types'

interface Props {
  items: SortItem[]
  result: Run
  mode: SortMode
  comparisons: number
  /** チップの並び順に使うグループ名 (データ定義順) */
  groupOrder: string[]
  onReplay: () => void
  onBackToSetup: () => void
}

const LIMITS: Limit[] = [10, 20, 30, 'all']

/** html-to-image は内部で rAF を待つため、画面が非表示になると完了しない。放置せず打ち切る */
const SAVE_TIMEOUT_MS = 20_000

/** はみ出した文字を「…」で省略する (MUI/SUID の noWrap 相当) */
const ELLIPSIS = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

export default function ResultScreen(props: Props) {
  /** PNG 保存の対象範囲 (絞り込み UI は含めない) */
  let captureEl: HTMLDivElement | undefined
  const [error, setError] = createSignal<string | null>(null)
  const [saving, setSaving] = createSignal(false)
  const [limit, setLimit] = createSignal<Limit>('all')
  /** 空の場合は「すべてのグループ」を意味する */
  const [groupFilter, setGroupFilter] = createSignal<Set<string>>(new Set())

  const allRows = createMemo(() => toRankedRows(props.result))
  const groups = createMemo(() => availableGroups(props.items, props.groupOrder))
  const visibleRows = createMemo(() =>
    filterRows(allRows(), props.items, groupFilter(), limit()),
  )

  const toggleGroup = (group: string) => {
    const next = new Set(groupFilter())
    if (next.has(group)) next.delete(group)
    else next.add(group)
    setGroupFilter(next)
  }

  const filterLabel = createMemo(() => {
    const parts: string[] = []
    const filter = groupFilter()
    if (filter.size > 0) parts.push(groups().filter((g) => filter.has(g)).join('・'))
    const l = limit()
    if (l !== 'all') parts.push('上位 ' + l + ' 名')
    return parts.join(' / ')
  })

  const handleSave = async () => {
    const node = captureEl
    if (!node) return
    setSaving(true)
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      // skipFonts: 日本語 Web フォントを埋め込むと大量のサブセットを取得してしまう
      const dataUrl = await Promise.race([
        toPng(node, { pixelRatio: 2, backgroundColor: '#ffffff', skipFonts: true }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error('画像の生成がタイムアウトしました')), SAVE_TIMEOUT_MS)
        }),
      ])
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `ll-choose-${props.mode}-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
    } catch {
      setError('画像の保存に失敗しました。この画面を表示したままもう一度お試しください。')
      setTimeout(() => setError(null), 6000)
    } finally {
      clearTimeout(timer)
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          表示件数
        </Typography>
        <Box sx={{ mt: 0.5, mb: 2 }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={limit()}
            onChange={(_, v) => {
              if (v !== null) setLimit(v as Limit)
            }}
          >
            <For each={LIMITS}>
              {(l) => <ToggleButton value={l}>{l === 'all' ? 'すべて' : '上位' + l}</ToggleButton>}
            </For>
          </ToggleButtonGroup>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
          グループ
        </Typography>
        <Stack direction="row" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="すべて"
            color={groupFilter().size === 0 ? 'primary' : 'default'}
            variant={groupFilter().size === 0 ? 'filled' : 'outlined'}
            onClick={() => setGroupFilter(new Set())}
          />
          <For each={groups()}>
            {(g) => (
              <Chip
                label={g}
                color={groupFilter().has(g) ? 'primary' : 'default'}
                variant={groupFilter().has(g) ? 'filled' : 'outlined'}
                onClick={() => toggleGroup(g)}
              />
            )}
          </For>
        </Stack>
      </Paper>

      <div ref={(el) => (captureEl = el)}>
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {props.mode === 'char' ? 'キャラクター' : 'キャスト'}ランキング
            </Typography>
            <Typography variant="caption" color="text.secondary">
              全 {props.items.length} 人 / {props.comparisons} 回の選択
              <Show when={filterLabel() !== ''}>
                {' ・ ' + filterLabel() + '（' + visibleRows().length + ' 件を表示）'}
              </Show>
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <For each={visibleRows()}>
              {(row, i) => {
                const item = () => props.items[row.index]
                const showRank = () => isRankHead(visibleRows(), i())
                return (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      borderLeft: `8px solid ${item().color}`,
                      bgcolor: `${item().color}14`,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 44,
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: row.rank <= 3 ? '1.5rem' : '1.1rem',
                        color: row.rank <= 3 ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {showRank() ? row.rank : '='}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, ...ELLIPSIS }}>{item().label}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', ...ELLIPSIS }}
                      >
                        {item().sub} ・ {item().group}
                      </Typography>
                    </Box>
                  </Stack>
                )
              }}
            </For>
          </Stack>
        </Paper>
      </div>

      <Stack direction="row" justifyContent="center" sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          disableElevation
          startIcon={<DownloadIcon />}
          onClick={handleSave}
          disabled={saving()}
        >
          画像で保存
        </Button>
        <Button variant="outlined" startIcon={<ReplayIcon />} onClick={props.onReplay}>
          同じ設定でもう一度
        </Button>
        <Button color="inherit" startIcon={<TuneIcon />} onClick={props.onBackToSetup}>
          対象を選び直す
        </Button>
      </Stack>

      {/* SUID に Snackbar がないため Alert で代用する */}
      <Show when={error()}>
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 16,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1400,
          }}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error()}
          </Alert>
        </Box>
      </Show>
    </Stack>
  )
}
