import { ButtonBase, Box, Button, Stack, Typography } from '@suid/material';
import HandshakeIcon from '@suid/icons-material/Handshake';
import TuneIcon from '@suid/icons-material/Tune';
import { borderColor, inkColor } from '../lib/color';
import { withBreakHints } from '../lib/text';
import type { Answer } from '../lib/sorter';
import type { SortItem } from '../types';

interface Props {
  left: SortItem;
  right: SortItem;
  comparisons: number;
  progress: number;
  onAnswer: (a: Answer) => void;
  onBackToSetup: () => void;
}

function Card(props: { item: SortItem; onClick: () => void }) {
  // ボタンの中に置けるのはフレーズコンテンツだけなので、内側の要素はすべて span にする
  return (
    <ButtonBase
      class="choice-card"
      onClick={props.onClick}
      style={{ '--item-color': props.item.color }}
      sx={{
        // 狭い端末でも 2 枚が左右に並ぶよう等幅で縮める
        flex: '1 1 0',
        minWidth: 0,
        borderRadius: 4,
        textAlign: 'left',
      }}
    >
      {/* SUID の Paper は component 指定を無視して div になるため Box を使う */}
      <Box
        component="span"
        sx={{
          width: '100%',
          p: { xs: 1, sm: 4 },
          borderRadius: 4,
          // 全面ソフトティント + 太い色枠 (ティントは白地に重ねて不透明にする)
          border: `3px solid ${borderColor(props.item.color)}`,
          background: `linear-gradient(${props.item.color}1f, ${props.item.color}1f), #fff`,
          minHeight: { xs: 170, sm: 200 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0.75, sm: 1 },
        }}
      >
        {/* グループ名のバッジ。文字色は CSS の contrast-color() で背景色から決める */}
        <Box
          component="span"
          class="on-item-color"
          sx={{
            bgcolor: props.item.color,
            borderRadius: 99,
            fontWeight: 700,
            maxWidth: '100%',
            px: { xs: 1, sm: 1.5 },
            py: 0.3,
            textAlign: 'center',
            fontSize: { xs: '0.6rem', sm: '0.75rem' },
            lineHeight: 1.3,
            // 長いグループ名は省略せず折り返す (位置は withBreakHints + keep-all で制御)
            wordBreak: 'keep-all',
            overflowWrap: 'anywhere',
          }}
        >
          {withBreakHints(props.item.group)}
        </Box>
        <Typography
          component="span"
          class="balance-text"
          sx={{
            display: 'block',
            fontSize: { xs: '1.05rem', sm: '2rem' },
            fontWeight: 800,
            color: inkColor(props.item.color),
            textAlign: 'center',
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
          }}
        >
          {props.item.label}
        </Typography>
        <Typography
          component="span"
          color="text.secondary"
          sx={{
            display: 'block',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            textAlign: 'center',
            overflowWrap: 'anywhere',
          }}
        >
          {props.item.sub}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default function SortScreen(props: Props) {
  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {props.comparisons + 1} 回目
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.progress}%
          </Typography>
        </Stack>
        {/* SUID の LinearProgress は値を支援技術に公開しないため、ネイティブ要素を使う */}
        <progress
          class="sort-progress"
          max={100}
          value={props.progress}
          aria-label="ソートの進捗"
        />
      </Box>

      <Typography
        variant="h6"
        component="h2"
        sx={{ textAlign: 'center', fontWeight: 800 }}
      >
        どちらが好き？
      </Typography>

      {/* SUID の Stack の spacing はレスポンシブ指定が効かないため gap を使う */}
      <Stack
        direction="row"
        alignItems="stretch"
        sx={{ gap: { xs: 2, sm: 3 } }}
      >
        <Card item={props.left} onClick={() => props.onAnswer('left')} />
        <Card item={props.right} onClick={() => props.onAnswer('right')} />
      </Stack>

      <Stack
        direction="row"
        justifyContent="center"
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          variant="outlined"
          startIcon={<HandshakeIcon />}
          onClick={() => props.onAnswer('tie')}
        >
          引き分け
        </Button>
        <Button
          color="inherit"
          startIcon={<TuneIcon />}
          onClick={props.onBackToSetup}
        >
          対象を選び直す
        </Button>
      </Stack>
    </Stack>
  );
}
