import test from 'node:test';
import assert from 'node:assert/strict';
import { sound } from './audio';

test('SoundEngine exposes cosmic music methods without crashing', () => {
  assert.equal(typeof sound.playLobbyMusic, 'function');
  assert.equal(typeof sound.playCombatMusic, 'function');
  assert.equal(typeof sound.stopMusic, 'function');
  assert.equal(typeof sound.toggleMute, 'function');
});

test('SoundEngine playLaser supports light, plasma, and laser variants', () => {
  assert.equal(typeof sound.playLaser, 'function');
  // Should execute cleanly without throwing
  assert.doesNotThrow(() => {
    sound.playLaser('light');
    sound.playLaser('plasma');
    sound.playLaser('laser');
  });
});

test('SoundEngine playFighterShot supports all fighter variants including astraea, falcon, bastion', () => {
  assert.equal(typeof sound.playFighterShot, 'function');
  assert.doesNotThrow(() => {
    sound.playFighterShot('astraea');
    sound.playFighterShot('falcon');
    sound.playFighterShot('bastion');
    sound.playFighterShot('aurora');
    sound.playFighterShot('vortex');
    sound.playFighterShot('phoenix');
  });
});

test('SoundEngine mute toggle state persists cleanly', () => {
  const initial = sound.isMuted;
  const toggled = sound.toggleMute();
  assert.equal(toggled, !initial);
  const reverted = sound.toggleMute();
  assert.equal(reverted, initial);
});
