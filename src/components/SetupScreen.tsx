import { createMemo, createSignal, For, Show } from 'solid-js'
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@suid/material'
import ExpandMoreIcon from '@suid/icons-material/ExpandMore'
import PlayArrowIcon from '@suid/icons-material/PlayArrow'
import { memberKey } from '../lib/items'
import { maxComparisons } from '../lib/sorter'
import { withBreakHints } from '../lib/text'
import type { CharacterData, SortMode } from '../types'

interface Props {
  data: CharacterData
  mode: SortMode
  onModeChange: (mode: SortMode) => void
  selected: Set<string>
  onSelectedChange: (next: Set<string>) => void
  itemCount: number
  onStart: () => void
}

export default function SetupScreen(props: Props) {
  const groups = createMemo(() => Object.entries(props.data))
  /** 開いているグループ名 (SUID に Accordion がないため自前で開閉する) */
  const [expanded, setExpanded] = createSignal<Set<string>>(new Set())

  const toggleExpanded = (group: string) => {
    const next = new Set(expanded())
    if (next.has(group)) next.delete(group)
    else next.add(group)
    setExpanded(next)
  }

  const toggleMember = (key: string) => {
    const next = new Set(props.selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    props.onSelectedChange(next)
  }

  const toggleGroup = (group: string, checked: boolean) => {
    const next = new Set(props.selected)
    for (const m of props.data[group]) {
      const key = memberKey(group, m.char)
      if (checked) next.add(key)
      else next.delete(key)
    }
    props.onSelectedChange(next)
  }

  const setAll = (checked: boolean) => {
    if (!checked) {
      props.onSelectedChange(new Set())
      return
    }
    const next = new Set<string>()
    for (const [group, members] of groups()) {
      for (const m of members) next.add(memberKey(group, m.char))
    }
    props.onSelectedChange(next)
  }

  const countIn = (group: string) =>
    props.data[group].filter((m) => props.selected.has(memberKey(group, m.char))).length

  return (
    <Stack spacing={2.5} sx={{ pb: 12 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          ソート対象
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          color="primary"
          value={props.mode}
          onChange={(_, v) => {
            if (v) props.onModeChange(v as SortMode)
          }}
        >
          <ToggleButton value="char">キャラクター</ToggleButton>
          <ToggleButton value="cast">キャスト</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {props.mode === 'char' ? 'キャラクター名で比較します。' : 'キャスト名で比較します。'}
        </Typography>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            対象メンバー
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setAll(true)}>
              すべて選択
            </Button>
            <Button size="small" color="inherit" onClick={() => setAll(false)}>
              すべて解除
            </Button>
          </Stack>
        </Stack>

        <For each={groups()}>
          {([group, members]) => {
            const count = createMemo(() => countIn(group))
            const isOpen = createMemo(() => expanded().has(group))
            return (
              <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    checked={count() === members.length}
                    indeterminate={count() > 0 && count() < members.length}
                    onChange={(_, checked) => toggleGroup(group, checked)}
                  />
                  <ButtonBase
                    onClick={() => toggleExpanded(group)}
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      justifyContent: 'space-between',
                      gap: 1,
                      px: { xs: 0.5, sm: 1 },
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          textAlign: 'left',
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          wordBreak: 'keep-all',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {withBreakHints(group)}
                      </Typography>
                      {/* 桁数でチップ幅が変わるとグループ名の折り返し位置がずれるため固定する */}
                      <Chip
                        size="small"
                        label={`${count()} / ${members.length}`}
                        sx={{ flexShrink: 0, minWidth: 62 }}
                      />
                    </Stack>
                    <ExpandMoreIcon
                      sx={{
                        color: 'action.active',
                        transition: 'transform .2s',
                        transform: isOpen() ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  </ButtonBase>
                </Stack>

                <Show when={isOpen()}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                      pb: 1.5,
                    }}
                  >
                    <For each={members}>
                      {(m) => (
                        // label で包むと名前をクリックしてもチェックが切り替わる
                        <label style={{ display: 'flex', 'align-items': 'center', cursor: 'pointer' }}>
                          <Checkbox
                            checked={props.selected.has(memberKey(group, m.char))}
                            onChange={() => toggleMember(memberKey(group, m.char))}
                            sx={{ color: m.color, '&.Mui-checked': { color: m.color } }}
                          />
                          <Stack>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {props.mode === 'char' ? m.char : m.cast}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {props.mode === 'char' ? m.cast : m.char}
                            </Typography>
                          </Stack>
                        </label>
                      )}
                    </For>
                  </Box>
                </Show>
              </Box>
            )
          }}
        </For>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        ※ 非公式のファンメイドツールです。
      </Typography>

      {/* 開始バー。本文と重ならないよう外側 Stack に pb を入れている */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          p: 2,
          borderRadius: 0,
          zIndex: 1100,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ maxWidth: 900, mx: 'auto' }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {props.itemCount} 人を選択中
            </Typography>
            <Typography variant="caption" color="text.secondary">
              最大 {maxComparisons(props.itemCount)} 回の選択
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            disableElevation
            startIcon={<PlayArrowIcon />}
            disabled={props.itemCount < 2}
            onClick={props.onStart}
          >
            ソート開始
          </Button>
        </Stack>
      </Paper>
    </Stack>
  )
}
