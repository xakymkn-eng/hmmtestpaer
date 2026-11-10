import test from 'node:test';
import assert from 'node:assert/strict';
import {
compareBossRushEntries,
formatBossClearTime,
BossRushLeaderboardEntry,
} from './bossRushLeaderboard';

test('compareBossRushEntries prioritizes higher bosses defeated', () => {
  const entryA: BossRushLeaderboardEntry = {
    id: 'a',
    playerName: 'Pilot A',
    callsign: 'ALPHA',
    fighterId: 'arc_tempest',
    fighterName: 'LX-88',
    fighterTier: 'S',
    fighterStars: 5,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 200,
    revivesUsed: 1,
    score: 100000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: 100,
  };

  const entryB: BossRushLeaderboardEntry = {
    ...entryA,
    id: 'b',
    bossesDefeated: 18,
    revivesUsed: 0,
    clearTimeSeconds: 150,
  };

  // Entry A with 20 bosses defeated should rank higher (negative sort value) than entry B with 18
  assert.ok(compareBossRushEntries(entryA, entryB) < 0);
});

test('compareBossRushEntries prioritizes fewer revives on same bosses defeated', () => {
  const entryA: BossRushLeaderboardEntry = {
    id: 'a',
    playerName: 'Pilot A',
    callsign: 'ALPHA',
    fighterId: 'arc_tempest',
    fighterName: 'LX-88',
    fighterTier: 'S',
    fighterStars: 5,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 210,
    revivesUsed: 0, // 0 revives!
    score: 100000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: 100,
  };

  const entryB: BossRushLeaderboardEntry = {
    ...entryA,
    id: 'b',
    clearTimeSeconds: 180, // faster time, but has 1 revive
    revivesUsed: 1,
  };

  // Entry A with 0 revives should rank higher than Entry B with 1 revive
  assert.ok(compareBossRushEntries(entryA, entryB) < 0);
});

test('compareBossRushEntries prioritizes faster clear time on equal revives and bosses', () => {
  const entryA: BossRushLeaderboardEntry = {
    id: 'a',
    playerName: 'Pilot A',
    callsign: 'ALPHA',
    fighterId: 'arc_tempest',
    fighterName: 'LX-88',
    fighterTier: 'S',
    fighterStars: 5,
    bossesDefeated: 20,
    totalBosses: 20,
    clearTimeSeconds: 165.2, // faster!
    revivesUsed: 0,
    score: 100000,
    difficulty: 'normal',
    isVictory: true,
    timestamp: 100,
  };

  const entryB: BossRushLeaderboardEntry = {
    ...entryA,
    id: 'b',
    clearTimeSeconds: 195.4,
  };

  assert.ok(compareBossRushEntries(entryA, entryB) < 0);
});

test('formatBossClearTime formats minutes, seconds, and tenths properly', () => {
  assert.equal(formatBossClearTime(125.4), '02:05.4');
  assert.equal(formatBossClearTime(59.9), '00:59.9');
  assert.equal(formatBossClearTime(0), '00:00.0');
});
