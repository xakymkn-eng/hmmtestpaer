/**
 * Saved Loadouts Module for Sky Vanguard
 * Allows players to save, customize, rename, and instantly switch
 * between pre-configured Fighter + Pilot + Accessory loadouts.
 */

import {
FIGHTERS,
FighterStats,
PILOTS,
Pilot,
getPilotBonus,
WEAPON_ACCESSORIES,
WeaponAccessory,
calculateAccessoryBonuses,
} from './rules';

export interface SavedLoadout {
  id: string; // e.g. 'loadout_1', 'loadout_2', etc.
  name: string; // e.g. '⚡ Sát Thương Tinh Tú'
  icon: string; // e.g. '⚡', '🛡️', '🚀', '🔥', '💎', '🌟', '🎯', '👑'
  fighterId: string;
  pilotId: string | null;
  accessoryIds: string[]; // up to 3 accessories
  createdAt: number;
  updatedAt: number;
}

export const LOADOUT_ICONS = ['⚡', '🛡️', '🚀', '🔥', '💎', '🌟', '🎯', '👑', '🛸', '⚔️'] as const;

export const DEFAULT_LOADOUT_TEMPLATES: Omit<SavedLoadout, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'loadout_1',
    name: '⚡ Tiên Phong Tốc Chiến',
    icon: '⚡',
    fighterId: 'phoenix',
    pilotId: null,
    accessoryIds: [],
  },
  {
    id: 'loadout_2',
    name: '🛡️ Thiết Giáp Sinh Tồn',
    icon: '🛡️',
    fighterId: 'phoenix',
    pilotId: null,
    accessoryIds: [],
  },
  {
    id: 'loadout_3',
    name: '🚀 Siêu Bạo Kích',
    icon: '🚀',
    fighterId: 'phoenix',
    pilotId: null,
    accessoryIds: [],
  },
];

const STORAGE_KEY = 'sky_vanguard_saved_loadouts';

/**
 * Retrieves the persistent list of saved loadouts from localStorage,
 * or initializes default starter slots.
 */
export function getInitialSavedLoadouts(
  starterFighterId: string = 'phoenix',
  starterPilotId: string | null = null,
  starterAccessories: string[] = []
): SavedLoadout[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback below
    }
  }

  const now = Date.now();
  return DEFAULT_LOADOUT_TEMPLATES.map((t, idx) => ({
    ...t,
    fighterId: idx === 0 ? starterFighterId : t.fighterId,
    pilotId: idx === 0 ? starterPilotId : t.pilotId,
    accessoryIds: idx === 0 ? starterAccessories : t.accessoryIds,
    createdAt: now + idx,
    updatedAt: now + idx,
  }));
}

/**
 * Persists loadouts array to localStorage.
 */
export function saveLoadoutsToStorage(loadouts: SavedLoadout[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loadouts));
  } catch {}
}

/**
 * Saves current fighter, pilot, and accessories into a specific loadout slot.
 */
export function saveOrUpdateLoadoutSlot(
  loadouts: SavedLoadout[],
  slotId: string,
  name: string,
  icon: string,
  fighterId: string,
  pilotId: string | null,
  accessoryIds: string[]
): SavedLoadout[] {
  const now = Date.now();
  const existingIndex = loadouts.findIndex((l) => l.id === slotId);

  // Keep max 3 accessories per loadout
  const trimmedAccessories = accessoryIds.slice(0, 3);

  if (existingIndex >= 0) {
    const next = [...loadouts];
    next[existingIndex] = {
      ...next[existingIndex],
      name: name.trim() || next[existingIndex].name,
      icon: icon || next[existingIndex].icon,
      fighterId,
      pilotId,
      accessoryIds: trimmedAccessories,
      updatedAt: now,
    };
    saveLoadoutsToStorage(next);
    return next;
  }

  // Create new loadout slot
  const newLoadout: SavedLoadout = {
    id: slotId || `loadout_${now}`,
    name: name.trim() || `Đội Hình ${loadouts.length + 1}`,
    icon: icon || '⚡',
    fighterId,
    pilotId,
    accessoryIds: trimmedAccessories,
    createdAt: now,
    updatedAt: now,
  };

  const next = [...loadouts, newLoadout];
  saveLoadoutsToStorage(next);
  return next;
}

/**
 * Deletes a loadout slot (preserves at least one slot).
 */
export function deleteLoadoutSlot(loadouts: SavedLoadout[], slotId: string): SavedLoadout[] {
  if (loadouts.length <= 1) return loadouts;
  const next = loadouts.filter((l) => l.id !== slotId);
  saveLoadoutsToStorage(next);
  return next;
}

/**
 * Validates and applies a saved loadout against player's current owned assets.
 * Returns valid identifiers and human-readable warning messages if some assets aren't unlocked.
 */
export function applySavedLoadout(
  loadout: SavedLoadout,
  ownedFighterIds: string[],
  ownedPilotIds: string[],
  ownedAccessoryIds: string[]
): {
  fighterId: string;
  pilotId: string | null;
  accessoryIds: string[];
  warnings: string[];
} {
  const warnings: string[] = [];

  // 1. Fighter ownership validation
  let targetFighterId = loadout.fighterId;
  if (!ownedFighterIds.includes(targetFighterId)) {
    const fighterName = FIGHTERS[targetFighterId]?.vietnameseName || targetFighterId;
    targetFighterId = ownedFighterIds[0] || 'phoenix';
    warnings.push(`Chiến cơ "${fighterName}" chưa mở khóa, chuyển sang "${FIGHTERS[targetFighterId]?.vietnameseName || targetFighterId}".`);
  }

  // 2. Pilot ownership validation
  let targetPilotId: string | null = loadout.pilotId;
  if (targetPilotId && !ownedPilotIds.includes(targetPilotId)) {
    const pilotName = PILOTS[targetPilotId]?.callsign || targetPilotId;
    targetPilotId = null;
    warnings.push(`Phi công "${pilotName}" chưa sở hữu, để trống.`);
  }

  // 3. Accessory ownership validation
  const validAccessories: string[] = [];
  for (const accId of loadout.accessoryIds) {
    if (ownedAccessoryIds.includes(accId)) {
      validAccessories.push(accId);
    } else {
      const accName = WEAPON_ACCESSORIES[accId]?.name || accId;
      warnings.push(`Phụ kiện "${accName}" chưa sở hữu.`);
    }
  }

  return {
    fighterId: targetFighterId,
    pilotId: targetPilotId,
    accessoryIds: validAccessories.slice(0, 3),
    warnings,
  };
}

/**
 * Computes combined stats summary for a loadout configuration
 * (Base fighter stats + pilot bonuses + accessory bonuses).
 */
export function getLoadoutStatsSummary(
  fighterId: string,
  pilotId: string | null,
  accessoryIds: string[]
): {
  fighter: FighterStats;
  pilot: Pilot | null;
  accessories: WeaponAccessory[];
  totalHp: number;
  totalArmor: number;
  totalDamageMultiplier: number;
  totalCritRate: number;
  totalSpeed: number;
  totalFireRate: number;
  totalTrueDamage: number;
  totalDodge: number;
} {
  const fighter = FIGHTERS[fighterId] || FIGHTERS.phoenix;
  const pilot = pilotId ? PILOTS[pilotId] || null : null;
  const accessories = accessoryIds.map((id) => WEAPON_ACCESSORIES[id]).filter(Boolean);

  const pilotBonus = getPilotBonus(pilotId);
  const accBonuses = calculateAccessoryBonuses(accessoryIds);

  const totalHp = Math.round(fighter.maxHp + (pilotBonus.hpBonus || 0) + (accBonuses.maxHpBonus || 0));
  const totalArmor = Math.round(fighter.maxArmor + (pilotBonus.armorBonus || 0) + (accBonuses.maxArmorBonus || 0));

  const damageMul = 1 + ((pilotBonus.damagePercent || 0) + (accBonuses.damagePercent || 0)) / 100;
  const totalCritRate = Math.min(100, Math.round(fighter.critRate + (pilotBonus.critRatePercent || 0) + (accBonuses.critRatePercent || 0)));
  const totalSpeed = Math.round(fighter.speed * (1 + (pilotBonus.speedPercent || 0) / 100));
  const totalFireRate = Number((fighter.fireRate * (1 + ((pilotBonus.fireRatePercent || 0) + (accBonuses.fireRatePercent || 0)) / 100)).toFixed(1));
  const totalTrueDamage = Math.round(fighter.trueDamage + (pilotBonus.trueDamageBonus || 0) + (accBonuses.trueDamageBonus || 0));
  const totalDodge = Math.min(75, Math.round(fighter.dodgeChance + (pilotBonus.dodgePercent || 0)));

  return {
    fighter,
    pilot,
    accessories,
    totalHp,
    totalArmor,
    totalDamageMultiplier: Number(damageMul.toFixed(2)),
    totalCritRate,
    totalSpeed,
    totalFireRate,
    totalTrueDamage,
    totalDodge,
  };
}
