import {
  ButtonBase,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@suid/material';
import HandshakeIcon from '@suid/icons-material/Handshake';
import TuneIcon from '@suid/icons-material/Tune';
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
  return (
    <ButtonBase
      onClick={props.onClick}
      sx={{
        // 狭い端末でも 2 枚が左右に並ぶよう等幅で縮める
        flex: '1 1 0',
        minWidth: 0,
        borderRadius: 3,
        textAlign: 'left',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          p: { xs: 1, sm: 4 },
          borderRadius: 3,
          borderTop: `8px solid ${props.item.color}`,
          background: `linear-gradient(180deg, ${props.item.color}1a 0%, #fff 60%)`,
          minHeight: { xs: 170, sm: 200 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 0.75, sm: 1 },
        }}
      >
        <Chip
          size="small"
          label={withBreakHints(props.item.group)}
          sx={{
            bgcolor: `${props.item.color}33`,
            fontWeight: 700,
            maxWidth: '100%',
            // 長いグループ名は省略せず折り返す (位置は withBreakHints + keep-all で制御)
            height: 'auto',
            py: 0.3,
            '& .MuiChip-label': {
              px: { xs: 0.5, sm: 1 },
              whiteSpace: 'normal',
              overflow: 'visible',
              textAlign: 'center',
              fontSize: { xs: '0.6rem', sm: '0.75rem' },
              lineHeight: 1.3,
              wordBreak: 'keep-all',
              overflowWrap: 'anywhere',
            },
          }}
        />
        <Typography
          sx={{
            fontSize: { xs: '1.05rem', sm: '2rem' },
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
          }}
        >
          {props.item.label}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            textAlign: 'center',
            overflowWrap: 'anywhere',
          }}
        >
          {props.item.sub}
        </Typography>
      </Paper>
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
        <LinearProgress
          variant="determinate"
          value={props.progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 800 }}>
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
