import { describe, expect, it } from 'vitest';
import characters from './characters.json';
import type { CharacterData } from '../types';

// 手で編集するファイルなので、壊れた形式に気づけるようにする
const data = characters as CharacterData;
const entries = Object.entries(data);
const allMembers = entries.flatMap(([group, members]) =>
  members.map(m => ({ group, ...m })),
);

describe('characters.json', () => {
  it('グループが 1 つ以上ある', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it('グループ名が空でない', () => {
    for (const [group] of entries) expect(group.trim()).not.toBe('');
  });

  it('各グループにメンバーが 1 人以上いる', () => {
    for (const [group, members] of entries) {
      expect(Array.isArray(members), `${group} は配列であること`).toBe(true);
      expect(members.length, `${group} にメンバーがいること`).toBeGreaterThan(
        0,
      );
    }
  });

  it('char と cast が空でない', () => {
    for (const m of allMembers) {
      expect(m.char?.trim(), `${m.group} の char`).toBeTruthy();
      expect(m.cast?.trim(), `${m.char} の cast`).toBeTruthy();
    }
  });

  it('color が #RRGGBB 形式である', () => {
    for (const m of allMembers) {
      expect(m.color, `${m.char} の color`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('想定外のキーを持たない', () => {
    for (const m of allMembers) {
      const { group: _group, ...member } = m;
      expect(Object.keys(member).sort()).toEqual(['cast', 'char', 'color']);
    }
  });

  it('キャラクター名が重複しない', () => {
    const names = allMembers.map(m => m.char);
    expect(names).toHaveLength(new Set(names).size);
  });

  it('同じグループ内でキャスト名が重複しない', () => {
    for (const [group, members] of entries) {
      const casts = members.map(m => m.cast);
      expect(casts, `${group} のキャスト`).toHaveLength(new Set(casts).size);
    }
  });
});
