import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { toPng } from 'html-to-image';
import ResultScreen from './ResultScreen';
import type { Run } from '../lib/sorter';
import type { SortItem } from '../types';

// 画像生成は jsdom では動かないため差し替える
vi.mock('html-to-image', () => ({ toPng: vi.fn() }));

const GROUP_ORDER = ['グループA', 'グループB'];

const item = (label: string, group: string): SortItem => ({
  label,
  sub: `${label}のキャスト`,
  group,
  color: '#123456',
});

// B1 と A2 を同順位にした 12 件
const items: SortItem[] = [
  item('A1', 'グループA'),
  item('B1', 'グループB'),
  item('A2', 'グループA'),
  item('B2', 'グループB'),
  ...Array.from({ length: 8 }, (_, i) => item(`C${i + 1}`, 'グループA')),
];

const result: Run = [
  [0],
  [1, 2],
  [3],
  ...Array.from({ length: 8 }, (_, i) => [i + 4]),
];

function setup() {
  const onReplay = vi.fn();
  const onBackToSetup = vi.fn();
  const rendered = render(() => (
    <ResultScreen
      items={items}
      result={result}
      mode="char"
      comparisons={30}
      groupOrder={GROUP_ORDER}
      onReplay={onReplay}
      onBackToSetup={onBackToSetup}
    />
  ));
  return { ...rendered, onReplay, onBackToSetup };
}

/** 名前から、その行に表示されている順位 (または「=」) を取り出す */
function rankOf(label: string): string {
  const row = screen.getByText(label).closest('.MuiStack-root') as HTMLElement;
  return row.firstElementChild?.textContent ?? '';
}

/** 現在表示されている名前を上から順に取り出す */
function visibleLabels(): string[] {
  return items
    .map(i => i.label)
    .filter(label => screen.queryByText(label) !== null);
}

/** グループ絞り込みの「すべて」チップ (表示件数にも同名のボタンがあるため区別する) */
const allGroupsChip = () =>
  screen
    .getAllByText('すべて')
    .find(el => el.className.includes('MuiChip-label'))!;

describe('ResultScreen', () => {
  it('見出しに対象種別と件数を表示する', () => {
    setup();
    expect(screen.getByText('キャラクターランキング')).toBeInTheDocument();
    expect(screen.getByText(/全 12 人 \/ 30 回の選択/)).toBeInTheDocument();
  });

  it('同順位を考慮した順位を表示し、2 件目以降は「=」にする', () => {
    setup();
    expect(rankOf('A1')).toBe('1');
    expect(rankOf('B1')).toBe('2');
    expect(rankOf('A2')).toBe('=');
    expect(rankOf('B2')).toBe('4');
  });

  it('初期状態では全件表示する', () => {
    setup();
    expect(visibleLabels()).toHaveLength(12);
  });

  it('「上位10」を押すと 10 件に絞られる', () => {
    setup();
    fireEvent.click(screen.getByText('上位10'));
    expect(visibleLabels()).toHaveLength(10);
    expect(screen.getByText(/上位 10 名（10 件を表示）/)).toBeInTheDocument();
  });

  it('グループチップで絞り込み、順位は全体順位のまま表示する', () => {
    setup();
    fireEvent.click(screen.getByText('グループB'));
    expect(visibleLabels()).toEqual(['B1', 'B2']);
    expect(rankOf('B1')).toBe('2');
    expect(rankOf('B2')).toBe('4');
  });

  it('絞り込みで同順位の 1 件目が消えた場合は「=」ではなく順位を表示する', () => {
    setup();
    fireEvent.click(screen.getByText('グループA'));
    // 2 位タイの B1 が消えるので、残った A2 に順位が出る
    expect(screen.queryByText('B1')).toBeNull();
    expect(rankOf('A2')).toBe('2');
  });

  it('「すべて」を押すとグループの絞り込みを解除する', () => {
    setup();
    fireEvent.click(screen.getByText('グループB'));
    expect(visibleLabels()).toHaveLength(2);
    fireEvent.click(allGroupsChip());
    expect(visibleLabels()).toHaveLength(12);
  });

  it('グループチップは指定した並び順で表示する', () => {
    const { container } = setup();
    const text = container.textContent ?? '';
    expect(text.indexOf('グループA')).toBeLessThan(text.indexOf('グループB'));
  });

  it('ボタンを押すと再実行・設定に戻るを通知する', () => {
    const { onReplay, onBackToSetup } = setup();
    fireEvent.click(screen.getByText('同じ設定でもう一度'));
    expect(onReplay).toHaveBeenCalled();
    fireEvent.click(screen.getByText('対象を選び直す'));
    expect(onBackToSetup).toHaveBeenCalled();
  });
});

describe('ResultScreen の画像保存', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const saveButton = () =>
    screen.getByText('画像で保存').closest('button') as HTMLButtonElement;

  it('生成した画像を日付入りのファイル名でダウンロードする', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    vi.mocked(toPng).mockResolvedValue('data:image/png;base64,dGVzdA==');
    setup();

    fireEvent.click(saveButton());

    await waitFor(() => expect(click).toHaveBeenCalled());
    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toMatch(/^ll-choose-char-\d{4}-\d{2}-\d{2}\.png$/);
    expect(anchor.href).toContain('data:image/png;base64,');
  });

  it('生成に失敗したらエラーを表示する', async () => {
    vi.mocked(toPng).mockRejectedValue(new Error('boom'));
    setup();

    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByText(/画像の保存に失敗しました/)).toBeInTheDocument(),
    );
    expect(saveButton().disabled).toBe(false);
  });

  it('生成が終わらない場合でも打ち切ってボタンを戻す', async () => {
    vi.useFakeTimers();
    // 画面が非表示のときのように、いつまでも解決しない Promise を返す
    vi.mocked(toPng).mockReturnValue(new Promise(() => {}));
    setup();

    fireEvent.click(saveButton());
    expect(saveButton().disabled).toBe(true);

    await vi.advanceTimersByTimeAsync(20_000);

    expect(screen.getByText(/画像の保存に失敗しました/)).toBeInTheDocument();
    expect(saveButton().disabled).toBe(false);
  });
});
