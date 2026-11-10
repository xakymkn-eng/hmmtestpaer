import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCombatTitles } from './combatTitles';

test('calculateCombatTitles awards "Xạ thủ thiện xạ" when enemiesKilled >= 40', () => {
  const titles = calculateCombatTitles({
    enemiesKilled: 45,
    remainingHp: 100,
    maxHp: 100,
    wave: 3,
    score: 8000,
    playTime: 60,
  });

  const hasSharpshooter = titles.some((t) => t.id === 'sharpshooter');
  assert.equal(hasSharpshooter, true, 'Must award Xạ Thủ Thiện Xạ for 45 kills');
});

test('calculateCombatTitles awards "Không sợ hiểm nguy" when remainingHp <= 30%', () => {
  const titles = calculateCombatTitles({
    enemiesKilled: 35,
    remainingHp: 20,
    maxHp: 100,
    wave: 2,
    score: 4500,
    playTime: 45,
    isVictory: true,
  });

  const hasFearless = titles.some((t) => t.id === 'fearless_ace');
  assert.equal(hasFearless, true, 'Must award Không Sợ Hiểm Nguy when HP is at 20%');
});

test('calculateCombatTitles awards "Bất khả xâm phạm" when remainingHp >= 85%', () => {
  const titles = calculateCombatTitles({
    enemiesKilled: 50,
    remainingHp: 90,
    maxHp: 100,
    wave: 4,
    score: 9500,
    playTime: 70,
  });

  const hasUntouchable = titles.some((t) => t.id === 'untouchable_aegis');
  assert.equal(hasUntouchable, true, 'Must award Bất Khả Xâm Phạm when retaining 90% HP');
});

test('calculateCombatTitles awards "Thần chết không gian" when enemiesKilled >= 80', () => {
  const titles = calculateCombatTitles({
    enemiesKilled: 88,
    remainingHp: 50,
    maxHp: 100,
    wave: 5,
    score: 22000,
    playTime: 120,
  });

  const hasReaper = titles.some((t) => t.id === 'cosmic_reaper');
  assert.equal(hasReaper, true, 'Must award Thần Chết Không Gian for 88 kills');
});

test('calculateCombatTitles awards "Chiến thần bất tử" on victory with 0 revives and healthy HP', () => {
  const titles = calculateCombatTitles({
    enemiesKilled: 55,
    remainingHp: 75,
    maxHp: 100,
    wave: 5,
    score: 15000,
    playTime: 95,
    isVictory: true,
    revivesUsed: 0,
  });

  const hasImmortal = titles.some((t) => t.id === 'immortal_warlord');
  assert.equal(hasImmortal, true, 'Must award Chiến Thần Bất Tử for flawless victory');
});

test('calculateCombatTitles always returns between 1 and 4 relevant ranked titles', () => {
  const cadetTitles = calculateCombatTitles({
    enemiesKilled: 5,
    remainingHp: 0,
    maxHp: 100,
    wave: 1,
    score: 600,
    playTime: 20,
  });

  assert.ok(cadetTitles.length >= 1, 'Must return at least 1 title');
  assert.ok(cadetTitles.length <= 4, 'Must return at most 4 titles');
});
