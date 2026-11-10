import test from 'node:test';
import assert from 'node:assert/strict';
import { getPilotDossier } from './pilotDetails';
import { PILOTS } from './rules';

test('pilot dossier exists for Raiden S with RTS-88 synergy', () => {
  const raiden = getPilotDossier('pilot_raiden_s');
  assert.ok(raiden, 'Raiden dossier must exist');
  assert.equal(raiden.id, 'pilot_raiden_s');
  assert.ok(raiden.signatureFighterName?.includes('RTS-88'));
  assert.ok(raiden.signatureFighterSynergy?.includes('RTS-88'));
  assert.ok(raiden.biography.length > 50);
});

test('pilot dossier fallback works for any pilot in PILOTS', () => {
  for (const pilotId of Object.keys(PILOTS)) {
    const dossier = getPilotDossier(pilotId);
    assert.ok(dossier, `Dossier must exist for pilot ${pilotId}`);
    assert.ok(dossier.role.length > 0);
    assert.ok(dossier.biography.length > 0);
  }
});
