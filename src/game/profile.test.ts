import { describe,it,beforeEach } from 'node:test';
import assert from 'node:assert';
import {
validatePlayerName,
validateCallsign,
getPlayerProfile,
savePlayerProfile,
DEFAULT_PLAYER_NAME,
DEFAULT_PLAYER_CALLSIGN,
getRandomProfileSuggestion,
} from './profile';

// Mock localStorage for node test environment
const mockStorage: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => {
    mockStorage[key] = String(val);
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const k in mockStorage) delete mockStorage[k];
  },
  length: 0,
  key: () => null,
};

describe('Player Profile & Renaming System', () => {
  beforeEach(() => {
    global.localStorage.clear();
  });

  it('validates player names correctly', () => {
    assert.strictEqual(validatePlayerName('').valid, false);
    assert.strictEqual(validatePlayerName('   ').valid, false);
    assert.strictEqual(validatePlayerName('A').valid, false);
    assert.strictEqual(validatePlayerName('Chiến Binh Rồng').valid, true);
    assert.strictEqual(validatePlayerName('   Kira Yamato   ').cleanName, 'Kira Yamato');
    assert.strictEqual(validatePlayerName('123456789012345678901').valid, false); // > 20 chars
  });

  it('validates callsigns correctly', () => {
    assert.strictEqual(validateCallsign('').valid, false);
    assert.strictEqual(validateCallsign('X').valid, false);
    assert.strictEqual(validateCallsign('phoenix ace').cleanCallsign, 'PHOENIX-ACE');
    assert.strictEqual(validateCallsign('ASTRAEA-99').valid, true);
  });

  it('provides default profile when storage is empty', () => {
    const profile = getPlayerProfile();
    assert.strictEqual(profile.playerName, DEFAULT_PLAYER_NAME);
    assert.strictEqual(profile.callsign, DEFAULT_PLAYER_CALLSIGN);
    assert.strictEqual(profile.renameCount, 0);
  });

  it('saves new profile and updates rename counter', () => {
    const res = savePlayerProfile({
      playerName: 'Thiếu Tá Kira',
      callsign: 'STRIKE-FREEDOM',
      avatar: '🌟',
    });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.profile.playerName, 'Thiếu Tá Kira');
    assert.strictEqual(res.profile.callsign, 'STRIKE-FREEDOM');
    assert.strictEqual(res.profile.avatar, '🌟');
    assert.strictEqual(res.profile.renameCount, 1);

    const reloaded = getPlayerProfile();
    assert.strictEqual(reloaded.playerName, 'Thiếu Tá Kira');
    assert.strictEqual(reloaded.callsign, 'STRIKE-FREEDOM');
  });

  it('generates random suggestions', () => {
    const s = getRandomProfileSuggestion();
    assert.ok(s.name.length >= 2);
    assert.ok(s.callsign.length >= 2);
  });
});
