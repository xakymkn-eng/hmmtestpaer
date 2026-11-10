/**
 * Commander Profile & Name Management System
 * Handles:
 * - Player custom Commander Name (Tên Chỉ Huy)
 * - Squadron Tactical Callsign (Mật Danh Phi Đội)
 * - Commander Insignia / Avatar
 * - Validation, random suggestions, and persistence in localStorage
 */

export const PLAYER_NAME_STORAGE_KEY = 'sky_vanguard_player_name';
export const PLAYER_CALLSIGN_STORAGE_KEY = 'sky_vanguard_player_callsign';
export const PLAYER_AVATAR_STORAGE_KEY = 'sky_vanguard_player_avatar';
export const RENAME_COUNT_STORAGE_KEY = 'sky_vanguard_rename_count';

export const DEFAULT_PLAYER_NAME = 'Chỉ Huy Tiên Phong';
export const DEFAULT_PLAYER_CALLSIGN = 'VANGUARD-01';
export const DEFAULT_PLAYER_AVATAR = '🧑‍✈️';

export const COMMANDER_AVATARS = [
  { id: 'pilot', emoji: '🧑‍✈️', label: 'Phi Công Tinh Nhuệ' },
  { id: 'ace', emoji: '👨‍🚀', label: 'Nhà Du Hành Lượng Tử' },
  { id: 'eagle', emoji: '🦅', label: 'Chim Ưng Săn Mồi' },
  { id: 'lightning', emoji: '⚡', label: 'Tia Chớp Không Gian' },
  { id: 'flame', emoji: '🔥', label: 'Phượng Hoàng Lửa' },
  { id: 'star', emoji: '🌟', label: 'Tinh Tú Khởi Nguyên' },
  { id: 'shield', emoji: '🛡️', label: 'Khiên Bất Diệt' },
  { id: 'crown', emoji: '👑', label: 'Thống Soái Thiên Hà' },
  { id: 'dragon', emoji: '🐉', label: 'Hư Không Long Vương' },
  { id: 'ufo', emoji: '🛸', label: 'Tiên Phong Chiến Cơ' },
];

export const RANDOM_NAME_SUGGESTIONS = [
  'Kira Yamato',
  'Chỉ Huy Phượng Hoàng',
  'Vance Walker',
  'Tia Chớp Lôi Quang',
  'Bão Táp Tinh Vân',
  'Thiên Sứ Ánh Sao',
  'Chiến Tướng Thiên Hà',
  'Hư Không Thần Phong',
  'Bạch Nguyệt Quang',
  'Chiến Binh Vũ Trụ',
  'Thần Ưng Tinh Cầu',
  'Bóng Ma Không Gian',
  'Vệ Binh Orion',
  'Sao Băng Rực Lửa',
  'Chỉ Huy Asuka',
  'Bóng Tối Hư Vô',
  'Trận Lôi Cuồng Nộ',
  'Sát Thủ Thiên Hà',
  'Phi Tiêu Bạc',
  'Thần Tốc Alpha',
];

export const RANDOM_CALLSIGN_SUGGESTIONS = [
  'PHOENIX-01',
  'ASTRAEA-X',
  'VANGUARD-99',
  'GHOST-STRIKE',
  'TEMPEST-ACE',
  'NOVA-PRIME',
  'SOLARIS-7',
  'TITAN-WARRIOR',
  'SHADOW-FOX',
  'CYBER-WING',
  'ORION-SPEAR',
  'AURORA-9',
];

export interface PlayerProfile {
  playerName: string;
  callsign: string;
  avatar: string;
  renameCount: number;
}

/**
 * Validate proposed player name
 */
export function validatePlayerName(name: string): { valid: boolean; error?: string; cleanName: string } {
  const cleanName = name ? name.trim().replace(/\s+/g, ' ') : '';
  if (!cleanName) {
    return { valid: false, error: 'Tên không được để trống.', cleanName: '' };
  }
  if (cleanName.length < 2) {
    return { valid: false, error: 'Tên phải có ít nhất 2 ký tự.', cleanName };
  }
  if (cleanName.length > 20) {
    return { valid: false, error: 'Tên không được vượt quá 20 ký tự.', cleanName };
  }
  // Check for forbidden control characters
  if (/[\u0000-\u001F\u007F]/.test(cleanName)) {
    return { valid: false, error: 'Tên chứa ký tự không hợp lệ.', cleanName };
  }
  return { valid: true, cleanName };
}

/**
 * Validate proposed callsign
 */
export function validateCallsign(callsign: string): { valid: boolean; error?: string; cleanCallsign: string } {
  const cleanCallsign = callsign ? callsign.trim().toUpperCase().replace(/\s+/g, '-') : '';
  if (!cleanCallsign) {
    return { valid: false, error: 'Mật danh không được để trống.', cleanCallsign: '' };
  }
  if (cleanCallsign.length < 2) {
    return { valid: false, error: 'Mật danh phải có ít nhất 2 ký tự.', cleanCallsign };
  }
  if (cleanCallsign.length > 16) {
    return { valid: false, error: 'Mật danh không vượt quá 16 ký tự.', cleanCallsign };
  }
  return { valid: true, cleanCallsign };
}

/**
 * Get current profile from localStorage
 */
export function getPlayerProfile(): PlayerProfile {
  let playerName = DEFAULT_PLAYER_NAME;
  let callsign = DEFAULT_PLAYER_CALLSIGN;
  let avatar = DEFAULT_PLAYER_AVATAR;
  let renameCount = 0;

  try {
    const savedName = localStorage.getItem(PLAYER_NAME_STORAGE_KEY);
    if (savedName && savedName.trim().length >= 2) {
      playerName = savedName.trim();
    }
    const savedCallsign = localStorage.getItem(PLAYER_CALLSIGN_STORAGE_KEY);
    if (savedCallsign && savedCallsign.trim().length >= 2) {
      callsign = savedCallsign.trim().toUpperCase();
    }
    const savedAvatar = localStorage.getItem(PLAYER_AVATAR_STORAGE_KEY);
    if (savedAvatar) {
      avatar = savedAvatar;
    }
    const savedRenames = localStorage.getItem(RENAME_COUNT_STORAGE_KEY);
    if (savedRenames) {
      renameCount = parseInt(savedRenames, 10) || 0;
    }
  } catch {}

  return { playerName, callsign, avatar, renameCount };
}

/**
 * Save updated player profile to localStorage
 */
export function savePlayerProfile(
  profile: Partial<PlayerProfile>
): { success: boolean; error?: string; profile: PlayerProfile } {
  const current = getPlayerProfile();

  let nextName = current.playerName;
  let nextCallsign = current.callsign;
  let nextAvatar = current.avatar;
  let nextRenames = current.renameCount;

  if (profile.playerName !== undefined) {
    const val = validatePlayerName(profile.playerName);
    if (!val.valid) {
      return { success: false, error: val.error, profile: current };
    }
    nextName = val.cleanName;
    if (nextName !== current.playerName) {
      nextRenames += 1;
    }
  }

  if (profile.callsign !== undefined) {
    const val = validateCallsign(profile.callsign);
    if (!val.valid) {
      return { success: false, error: val.error, profile: current };
    }
    nextCallsign = val.cleanCallsign;
  }

  if (profile.avatar !== undefined) {
    nextAvatar = profile.avatar;
  }

  const updated: PlayerProfile = {
    playerName: nextName,
    callsign: nextCallsign,
    avatar: nextAvatar,
    renameCount: nextRenames,
  };

  try {
    localStorage.setItem(PLAYER_NAME_STORAGE_KEY, updated.playerName);
    localStorage.setItem(PLAYER_CALLSIGN_STORAGE_KEY, updated.callsign);
    localStorage.setItem(PLAYER_AVATAR_STORAGE_KEY, updated.avatar);
    localStorage.setItem(RENAME_COUNT_STORAGE_KEY, updated.renameCount.toString());
  } catch (err) {
    return { success: false, error: 'Không thể lưu vào bộ nhớ cục bộ.', profile: current };
  }

  return { success: true, profile: updated };
}

/**
 * Get random name and callsign pair
 */
export function getRandomProfileSuggestion(): { name: string; callsign: string } {
  const name = RANDOM_NAME_SUGGESTIONS[Math.floor(Math.random() * RANDOM_NAME_SUGGESTIONS.length)];
  const callsign = RANDOM_CALLSIGN_SUGGESTIONS[Math.floor(Math.random() * RANDOM_CALLSIGN_SUGGESTIONS.length)];
  return { name, callsign };
}
