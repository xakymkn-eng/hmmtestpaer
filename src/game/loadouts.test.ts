import { describe,it } from 'node:test';
import assert from 'node:assert/strict';
import {
getInitialSavedLoadouts,
saveOrUpdateLoadoutSlot,
deleteLoadoutSlot,
applySavedLoadout,
getLoadoutStatsSummary,
SavedLoadout,
} from './loadouts';

describe('Saved Loadouts Module', () => {
  it('returns default loadout templates when no persistent data exists', () => {
    const loadouts = getInitialSavedLoadouts('phoenix', 'valkyrie', ['acc_vulcan_core']);
    assert.ok(Array.isArray(loadouts));
    assert.equal(loadouts.length, 3);
    assert.equal(loadouts[0].fighterId, 'phoenix');
    assert.equal(loadouts[0].pilotId, 'valkyrie');
    assert.deepEqual(loadouts[0].accessoryIds, ['acc_vulcan_core']);
  });

  it('updates an existing loadout slot correctly', () => {
    let loadouts = getInitialSavedLoadouts();
    loadouts = saveOrUpdateLoadoutSlot(
      loadouts,
      'loadout_1',
      '💥 Hỏa Lực Tối Thượng',
      '🔥',
      'phoenix',
      'lynx',
      ['acc_vulcan_core', 'acc_hyper_thruster']
    );

    const slot = loadouts.find((l) => l.id === 'loadout_1');
    assert.ok(slot);
    assert.equal(slot.name, '💥 Hỏa Lực Tối Thượng');
    assert.equal(slot.icon, '🔥');
    assert.equal(slot.pilotId, 'lynx');
    assert.equal(slot.accessoryIds.length, 2);
  });

  it('creates a new custom loadout slot when slotId is new', () => {
    let loadouts = getInitialSavedLoadouts();
    const initialCount = loadouts.length;
    loadouts = saveOrUpdateLoadoutSlot(
      loadouts,
      'loadout_custom_99',
      '🛡️ Pháo Đài Phòng Thủ',
      '🛡️',
      'phoenix',
      null,
      []
    );

    assert.equal(loadouts.length, initialCount + 1);
    const customSlot = loadouts.find((l) => l.id === 'loadout_custom_99');
    assert.ok(customSlot);
    assert.equal(customSlot.name, '🛡️ Pháo Đài Phòng Thủ');
  });

  it('deletes a loadout slot but retains at least one', () => {
    let loadouts = getInitialSavedLoadouts();
    const countBefore = loadouts.length;
    loadouts = deleteLoadoutSlot(loadouts, 'loadout_3');
    assert.equal(loadouts.length, countBefore - 1);
    assert.ok(!loadouts.find((l) => l.id === 'loadout_3'));

    // Try deleting remaining down to 1
    loadouts = deleteLoadoutSlot(loadouts, 'loadout_2');
    assert.equal(loadouts.length, 1);
    // Attempting to delete the last one should not empty the array
    loadouts = deleteLoadoutSlot(loadouts, loadouts[0].id);
    assert.equal(loadouts.length, 1);
  });

  it('validates ownership when applying loadout and generates fallback warnings', () => {
    const testLoadout: SavedLoadout = {
      id: 'test_slot',
      name: 'Test Loadout',
      icon: '⚡',
      fighterId: 'astraea', // unowned
      pilotId: 'pilot_phantom_unowned', // unowned
      accessoryIds: ['acc_vulcan_core', 'unowned_acc_xyz'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const ownedFighters = ['phoenix'];
    const ownedPilots = ['valkyrie'];
    const ownedAccessories = ['acc_vulcan_core'];

    const result = applySavedLoadout(testLoadout, ownedFighters, ownedPilots, ownedAccessories);

    // Should fall back to owned phoenix
    assert.equal(result.fighterId, 'phoenix');
    // Pilot should be set to null since requested was unowned
    assert.equal(result.pilotId, null);
    // Unowned accessory should be removed
    assert.deepEqual(result.accessoryIds, ['acc_vulcan_core']);
    // Should contain warnings for missing assets
    assert.ok(result.warnings.length >= 2);
  });

  it('computes combined stats summary accurately', () => {
    const stats = getLoadoutStatsSummary('phoenix', null, []);
    assert.ok(stats.totalHp > 0);
    assert.ok(stats.totalArmor > 0);
    assert.ok(stats.totalSpeed > 0);
    assert.ok(stats.totalFireRate > 0);
    assert.equal(stats.totalDamageMultiplier, 1.0);
  });
});
