import { createMemo, createSignal, Show } from 'solid-js';
import { AppBar, Box, Container, Toolbar } from '@suid/material';
import SetupScreen from './components/SetupScreen';
import SortScreen from './components/SortScreen';
import ResultScreen from './components/ResultScreen';
import characters from './data/characters.json';
import { buildItems, memberKey, shuffle } from './lib/items';
import { answer, createSorter, currentPair, progress } from './lib/sorter';
import type { Answer, SorterState } from './lib/sorter';
import type { CharacterData, SortItem, SortMode } from './types';

const data = characters as CharacterData;
const groupOrder = Object.keys(data);
const allKeys = Object.entries(data).flatMap(([group, members]) =>
  members.map(m => memberKey(group, m.char)),
);

interface Session {
  items: SortItem[];
  state: SorterState;
}

export default function App() {
  const [mode, setMode] = createSignal<SortMode>('char');
  const [selected, setSelected] = createSignal<Set<string>>(new Set(allKeys));
  /** null なら設定画面 */
  const [session, setSession] = createSignal<Session | null>(null);

  const selectedItems = createMemo(() => buildItems(data, selected(), mode()));

  const start = () => {
    const items = shuffle(selectedItems());
    setSession({ items, state: createSorter(items.length) });
  };

  const handleAnswer = (a: Answer) => {
    const s = session();
    if (!s || s.state.done) return;
    setSession({ items: s.items, state: answer(s.state, a) });
  };

  /** 同じ対象のまま、出題順をシャッフルし直す */
  const handleReplay = () => {
    const s = session();
    if (!s) return;
    const items = shuffle(s.items);
    setSession({ items, state: createSorter(items.length) });
  };

  const backToSetup = () => setSession(null);

  const pair = createMemo(() => {
    const s = session();
    return s && !s.state.done ? currentPair(s.state) : null;
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ maxWidth: 900, width: '100%', mx: 'auto' }}>
          <img
            src="./logo.svg"
            alt="LoveLive! Choose"
            style={{
              height: '64px',
              width: 'auto',
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 2, pb: 3 }}>
        <Show when={!session()}>
          <SetupScreen
            data={data}
            mode={mode()}
            onModeChange={m => setMode(m)}
            selected={selected()}
            onSelectedChange={next => setSelected(next)}
            itemCount={selectedItems().length}
            onStart={start}
          />
        </Show>

        <Show when={pair()}>
          <SortScreen
            left={session()!.items[pair()![0]]}
            right={session()!.items[pair()![1]]}
            comparisons={session()!.state.comparisons}
            progress={progress(session()!.state)}
            onAnswer={handleAnswer}
            onBackToSetup={backToSetup}
          />
        </Show>

        <Show when={session()?.state.done}>
          <ResultScreen
            items={session()!.items}
            result={session()!.state.done!}
            mode={mode()}
            comparisons={session()!.state.comparisons}
            groupOrder={groupOrder}
            onReplay={handleReplay}
            onBackToSetup={backToSetup}
          />
        </Show>
      </Container>
    </Box>
  );
}
