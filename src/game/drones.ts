/**
 * Drone (Máy Bay Không Người Lái) System
 * Defines Tier B, A, S combat drones, stat bonuses, Tier S unique passive skills,
 * drone gacha summon simulation with pity guarantees, and escort formation math.
 */

export type DroneTier = 'B' | 'A' | 'S';

export type DronePassiveType =
  | 'vampiric'      // Hút huyết lượng tử: Tiêu diệt mục tiêu hồi phục 10% Max HP
  | 'overclock'     // Quá tải lượng tử: Gây sát thương kích hoạt tăng 15% tổng ST trong 5s và bắn chùm năng lượng
  | 'aegis_shield'  // Khiên hộ thể nano: Mỗi 12s kích hoạt lá chắn bảo hộ 25% Max HP
  | 'chrono_burst'  // Sóng xung kích thời không: +20% tốc bắn, mỗi 8s xoá sạch đạn địch lân cận
  | 'plasma_burn'   // Hỏa ngục tân tinh: Đạn bắn trúng thiêu đốt mục tiêu gây thêm 30% sát thương chuẩn
  | 'void_rift'     // Hư không xé rách: Mỗi 10s tạo vết rách không gian hút và nghiền nát mục tiêu
  | 'solar_flare'   // Bão lửa nhật hoa: +35% Xuyên Giáp, mỗi 7s giải phóng luồng bão lửa chói lọi
  | 'nano_swarm'    // Bầy nano tự hồi phục: Mỗi 5s hồi phục 15 Giáp và tăng 25% Tỉ lệ Bạo Kích
  | 'thunder_strike'; // Lôi Đình Trấn Phái RTS-88: +80% Xuyên giáp & +50% ST chuẩn cho RTS-88, làm chậm 30%

export interface DronePassive {
  type: DronePassiveType;
  name: string;
  vietnameseName: string;
  description: string;
  triggerCooldown: number; // in seconds
}

export interface DroneStatBuffs {
  damagePercent: number;      // Tăng sát thương % cho máy bay chính
  fireRatePercent: number;    // Tăng tốc độ bắn %
  speedPercent: number;       // Tăng tốc độ bay %
  hpBonus: number;            // Tăng máu tối đa
  armorBonus: number;         // Tăng giáp tối đa
  defenseBonus: number;       // Tăng phòng thủ (giảm ST nhận vào)
  armorPenPercent: number;    // % Xuyên giáp
  trueDamageBonus: number;    // Sát thương chuẩn cộng thêm
  critRatePercent: number;    // Tỉ lệ bạo kích %
}

export interface DroneData {
  id: string;
  name: string;
  vietnameseName: string;
  tier: DroneTier;
  tagline: string;
  description: string;
  avatarEmoji: string;
  color: string;
  accentColor: string;
  bulletColor: string;
  bulletDamage: number;       // Sát thương viên đạn drone bắn ra
  fireRate: number;           // Tốc độ bắn của drone (viên / giây)
  bulletType: 'laser' | 'plasma' | 'missile' | 'photon' | 'tachyon' | 'vampiric';
  statBuffs: DroneStatBuffs;
  passiveSkill?: DronePassive; // Chỉ Drone bậc S mới có nội tại độc nhất!
}

export const DRONES: Record<string, DroneData> = {
  // ==========================================
  // --- TIER S DRONES (BẬC S - HUYỀN THOẠI: 1.0%) ---
  // ==========================================
  drone_thunder_storm_s: {
    id: 'drone_thunder_storm_s',
    name: 'DR-88 Thunder Spark',
    vietnameseName: 'DR-88 Lôi Vân Kích S (Trấn Phái RTS-88)',
    tier: 'S',
    tagline: 'Drone Lôi Đình Trấn Phái RTS-88 · +80% Xuyên Giáp, +50% ST Chuẩn & Tia sét làm chậm 30%!',
    description: 'Chế tạo từ lõi lôi thạch siêu nén. KHI TRANG BỊ CHO RTS-88: Tăng thêm 80% xuyên giáp, 50% sát thương chuẩn, và khi tia sét bắn trúng khiến địch di chuyển chậm đi 30% (không cộng dồn). KHI TRANG BỊ CHO MÁY BAY KHÁC: Cứ sau 5 giây bắn 3 tia sét vào kẻ địch gây 200 sát thương và khiến kẻ địch bị tê liệt trong 3 giây.',
    avatarEmoji: '⚡',
    color: '#00f0ff',
    accentColor: '#facc15',
    bulletColor: '#38bdf8',
    bulletDamage: 38,
    fireRate: 4.2,
    bulletType: 'tachyon',
    statBuffs: {
      damagePercent: 35,
      fireRatePercent: 20,
      speedPercent: 18,
      hpBonus: 45,
      armorBonus: 60,
      defenseBonus: 25,
      armorPenPercent: 30,
      trueDamageBonus: 25,
      critRatePercent: 20,
    },
    passiveSkill: {
      type: 'thunder_strike',
      name: 'Thunderstorm Resonance',
      vietnameseName: 'Lôi Vân Kích Trấn Phái',
      description: 'Trang bị RTS-88: +80% Xuyên Giáp, +50% ST Chuẩn, làm chậm 30%. Máy bay khác: Cứ 5s bắn 3 tia sét 200 ST, tê liệt 3s.',
      triggerCooldown: 5.0,
    },
  },

  drone_vampiric_s: {
    id: 'drone_vampiric_s',
    name: 'DR-99 Bloodseeker Vortex',
    vietnameseName: 'DR-99 Huyết Nguyệt Hút Máu S',
    tier: 'S',
    tagline: 'Drone Hư Không Huyết Tế · Tiêu diệt mục tiêu hồi phục 10% Máu tối đa!',
    description: 'Chế tạo từ lõi năng lượng hấp thụ sinh mệnh. Khi máy bay chính tiêu diệt bất kỳ kẻ địch nào sẽ lập tức hồi lại 10% Máu tối đa cho máy bay!',
    avatarEmoji: '🩸',
    color: '#ef4444',
    accentColor: '#f87171',
    bulletColor: '#dc2626',
    bulletDamage: 30,
    fireRate: 3.5,
    bulletType: 'vampiric',
    statBuffs: {
      damagePercent: 30,
      fireRatePercent: 15,
      speedPercent: 15,
      hpBonus: 40,
      armorBonus: 50,
      defenseBonus: 20,
      armorPenPercent: 25,
      trueDamageBonus: 25,
      critRatePercent: 18,
    },
    passiveSkill: {
      type: 'vampiric',
      name: 'Vampiric Harvest',
      vietnameseName: 'Huyết Nguyệt Hồi Phục',
      description: 'Khi máy bay chính tiêu diệt mục tiêu (hoặc trùm), hồi phục ngay 10% Máu tối đa!',
      triggerCooldown: 0.5,
    },
  },

  drone_overclock_s: {
    id: 'drone_overclock_s',
    name: 'DR-X Apex Overclock',
    vietnameseName: 'DR-X Bộc Phá Quá Tải S',
    tier: 'S',
    tagline: 'Bộ đẩy hạt siêu xung năng · Kích hoạt tăng thêm 15% tổng sát thương!',
    description: 'Trang bị bộ gia tốc tachyon siêu nén. Khi máy bay chính gây sát thương lên kẻ địch, drone kích hoạt trạng thái Quá Tải tăng thêm 15% tổng sát thương!',
    avatarEmoji: '⚡',
    color: '#f59e0b',
    accentColor: '#fde047',
    bulletColor: '#fbbf24',
    bulletDamage: 34,
    fireRate: 4.0,
    bulletType: 'tachyon',
    statBuffs: {
      damagePercent: 35,
      fireRatePercent: 22,
      speedPercent: 18,
      hpBonus: 35,
      armorBonus: 45,
      defenseBonus: 18,
      armorPenPercent: 30,
      trueDamageBonus: 30,
      critRatePercent: 22,
    },
    passiveSkill: {
      type: 'overclock',
      name: 'Overclock Surge',
      vietnameseName: 'Quá Tải Lượng Tử',
      description: 'Khi gây sát thương, tăng thêm 15% tổng sát thương trong 5 giây và xả chùm tia huỷ diệt!',
      triggerCooldown: 6.0,
    },
  },

  drone_aegis_s: {
    id: 'drone_aegis_s',
    name: 'DR-00 Aegis Bastion',
    vietnameseName: 'DR-00 Pháo Đài Nano Bất Diệt S',
    tier: 'S',
    tagline: 'Trường bảo hộ hạt Higgs · Tự tạo lá chắn 25% Max HP mỗi 12 giây!',
    description: 'Sở hữu mạng lưới máy in nano siêu tốc. Tự động kiến tạo lá chắn lượng tử bảo hộ hấp thụ sát thương tương đương 25% Máu tối đa mỗi 12 giây.',
    avatarEmoji: '🛡️',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    bulletColor: '#38bdf8',
    bulletDamage: 28,
    fireRate: 3.2,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 25,
      fireRatePercent: 12,
      speedPercent: 10,
      hpBonus: 60,
      armorBonus: 80,
      defenseBonus: 35,
      armorPenPercent: 20,
      trueDamageBonus: 20,
      critRatePercent: 15,
    },
    passiveSkill: {
      type: 'aegis_shield',
      name: 'Nano Aegis Barrier',
      vietnameseName: 'Khiên Hộ Thể Nano',
      description: 'Mỗi 12 giây tự động kích hoạt lá chắn hấp thụ sát thương bằng 25% Max HP và giảm 25% ST nhận vào!',
      triggerCooldown: 12.0,
    },
  },

  drone_chrono_s: {
    id: 'drone_chrono_s',
    name: 'DR-77 Chrono Stasis',
    vietnameseName: 'DR-77 Thời Không Lượng Tử S',
    tier: 'S',
    tagline: 'Điều khiển dòng thời gian · Xung EMP ngưng đọng và xoá sạch đạn địch!',
    description: 'Bẻ cong không-thời gian xung quanh máy bay chính. Mỗi 8 giây phóng ra sóng xung kích lượng tử làm biến mất toàn bộ đạn địch bay gần!',
    avatarEmoji: '⏳',
    color: '#10b981',
    accentColor: '#34d399',
    bulletColor: '#059669',
    bulletDamage: 32,
    fireRate: 3.8,
    bulletType: 'photon',
    statBuffs: {
      damagePercent: 28,
      fireRatePercent: 25,
      speedPercent: 20,
      hpBonus: 30,
      armorBonus: 40,
      defenseBonus: 16,
      armorPenPercent: 25,
      trueDamageBonus: 22,
      critRatePercent: 20,
    },
    passiveSkill: {
      type: 'chrono_burst',
      name: 'Temporal EMP Shockwave',
      vietnameseName: 'Sóng Xung Kích Thời Không',
      description: 'Mỗi 8 giây giải phóng sóng EMP quét sạch toàn bộ đạn địch trong bán kính 180px!',
      triggerCooldown: 8.0,
    },
  },

  drone_plasma_s: {
    id: 'drone_plasma_s',
    name: 'DR-88 Nova Inferno',
    vietnameseName: 'DR-88 Siêu Tân Tinh Rực Lửa S',
    tier: 'S',
    tagline: 'Lò phản ứng nhiệt hạch mini · Thiêu đốt kẻ địch gây thêm 30% sát thương chuẩn!',
    description: 'Chứa quả cầu lửa plasma nén cực hạn. Đạn bắn trúng kẻ địch sẽ đốt cháy mục tiêu, gây thêm 30% sát thương chuẩn lan toả!',
    avatarEmoji: '🔥',
    color: '#e11d48',
    accentColor: '#fb7185',
    bulletColor: '#f43f5e',
    bulletDamage: 36,
    fireRate: 3.5,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 32,
      fireRatePercent: 16,
      speedPercent: 14,
      hpBonus: 45,
      armorBonus: 55,
      defenseBonus: 22,
      armorPenPercent: 28,
      trueDamageBonus: 28,
      critRatePercent: 18,
    },
    passiveSkill: {
      type: 'plasma_burn',
      name: 'Nova Plasma Burn',
      vietnameseName: 'Hỏa Ngục Tân Tinh',
      description: 'Bắn trúng kẻ địch thiêu đốt mục tiêu, gây thêm 30% sát thương chuẩn liên tục!',
      triggerCooldown: 2.0,
    },
  },

  drone_void_s: {
    id: 'drone_void_s',
    name: 'DR-90 Void Singularity',
    vietnameseName: 'DR-90 Hư Không Vô Cực S',
    tier: 'S',
    tagline: 'Lỗ đen lượng tử mini · Mỗi 10s tạo vết rách không gian hút và nghiền nát mục tiêu!',
    description: 'Chế tạo từ vật chất tối của hố đen trung tâm. Mỗi 10 giây triệu hồi vết rách hư không gây 150 sát thương chuẩn diện rộng lên toàn bộ tàu địch phía trước.',
    avatarEmoji: '🌌',
    color: '#8b5cf6',
    accentColor: '#c4b5fd',
    bulletColor: '#7c3aed',
    bulletDamage: 38,
    fireRate: 3.6,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 36,
      fireRatePercent: 18,
      speedPercent: 16,
      hpBonus: 50,
      armorBonus: 60,
      defenseBonus: 25,
      armorPenPercent: 32,
      trueDamageBonus: 35,
      critRatePercent: 20,
    },
    passiveSkill: {
      type: 'void_rift',
      name: 'Void Rift Singularity',
      vietnameseName: 'Hư Không Xé Rách',
      description: 'Mỗi 10 giây kích hoạt vết nứt không gian gây 150 sát thương chuẩn diện rộng và xóa đạn!',
      triggerCooldown: 10.0,
    },
  },

  drone_solar_s: {
    id: 'drone_solar_s',
    name: 'DR-95 Solar Prominence',
    vietnameseName: 'DR-95 Thái Dương Nhật Hoa S',
    tier: 'S',
    tagline: 'Lõi bức xạ vầng nhật hoa · Tăng 35% Xuyên Giáp & giải phóng bão lửa hủy diệt!',
    description: 'Nạp năng lượng từ các quầng sáng mặt trời bùng nổ, tăng mạnh 35% Xuyên Giáp cho máy bay chính và định kỳ phóng luồng bão lửa thiêu rụi hàng ngũ địch.',
    avatarEmoji: '☀️',
    color: '#f59e0b',
    accentColor: '#fde047',
    bulletColor: '#fbbf24',
    bulletDamage: 40,
    fireRate: 3.8,
    bulletType: 'tachyon',
    statBuffs: {
      damagePercent: 38,
      fireRatePercent: 20,
      speedPercent: 15,
      hpBonus: 45,
      armorBonus: 65,
      defenseBonus: 24,
      armorPenPercent: 35,
      trueDamageBonus: 30,
      critRatePercent: 22,
    },
    passiveSkill: {
      type: 'solar_flare',
      name: 'Solar Flare Cataclysm',
      vietnameseName: 'Bão Lửa Nhật Hoa',
      description: 'Mỗi 7 giây giải phóng luồng bão lửa chói lọi thiêu rụi mục tiêu với 35% Xuyên Giáp!',
      triggerCooldown: 7.0,
    },
  },

  drone_nanite_s: {
    id: 'drone_nanite_s',
    name: 'DR-98 Nanite Reconstructor',
    vietnameseName: 'DR-98 Nano Tái Cấu Trúc S',
    tier: 'S',
    tagline: 'Bầy máy in nano siêu vi · Tự hồi phục 15 Giáp mỗi 5s và bạo kích cực hạn!',
    description: 'Hàng triệu robot nano liên tục quét và sửa chữa lớp vỏ máy bay chính, tự động hồi phục 15 Giáp mỗi 5 giây đồng thời tăng 25% Tỉ lệ Bạo Kích.',
    avatarEmoji: '🧬',
    color: '#10b981',
    accentColor: '#6ee7b7',
    bulletColor: '#34d399',
    bulletDamage: 32,
    fireRate: 4.2,
    bulletType: 'photon',
    statBuffs: {
      damagePercent: 30,
      fireRatePercent: 24,
      speedPercent: 18,
      hpBonus: 55,
      armorBonus: 75,
      defenseBonus: 28,
      armorPenPercent: 25,
      trueDamageBonus: 24,
      critRatePercent: 25,
    },
    passiveSkill: {
      type: 'nano_swarm',
      name: 'Nanite Biorepair',
      vietnameseName: 'Nano Tái Tạo Hộ Thể',
      description: 'Mỗi 5 giây tự động hồi phục 15 Giáp cho phi cơ và duy trì 25% Tỉ lệ Bạo Kích!',
      triggerCooldown: 5.0,
    },
  },

  // ==========================================
  // --- TIER A DRONES (BẬC A - TINH ANH: 10.0%) ---
  // ==========================================
  drone_laser_a: {
    id: 'drone_laser_a',
    name: 'DR-12 Photon Striker',
    vietnameseName: 'DR-12 Drone Laser Quang Tử A',
    tier: 'A',
    tagline: 'Pháo laser quang tử tập trung · Bắn xuyên thẳng hàng mục tiêu',
    description: 'Trang bị lăng kính laser thạch anh vũ trụ, tăng 18% sát thương và 15% xuyên giáp cho máy bay chính.',
    avatarEmoji: '🎯',
    color: '#38bdf8',
    accentColor: '#7dd3fc',
    bulletColor: '#0ea5e9',
    bulletDamage: 22,
    fireRate: 3.2,
    bulletType: 'laser',
    statBuffs: {
      damagePercent: 18,
      fireRatePercent: 12,
      speedPercent: 10,
      hpBonus: 25,
      armorBonus: 35,
      defenseBonus: 14,
      armorPenPercent: 15,
      trueDamageBonus: 12,
      critRatePercent: 12,
    },
  },

  drone_missile_a: {
    id: 'drone_missile_a',
    name: 'DR-15 Swarm Barrage',
    vietnameseName: 'DR-15 Drone Bão Vi Tên Lửa A',
    tier: 'A',
    tagline: 'Dàn phóng 4 ống vi tên lửa · Tự động tìm diệt mục tiêu gần nhất',
    description: 'Phóng chùm vi tên lửa tầm nhiệt bám đuổi mục tiêu liên tục, tăng 20% sát thương và giáp trụ kiên cố.',
    avatarEmoji: '🚀',
    color: '#f97316',
    accentColor: '#fb923c',
    bulletColor: '#ea580c',
    bulletDamage: 24,
    fireRate: 2.5,
    bulletType: 'missile',
    statBuffs: {
      damagePercent: 20,
      fireRatePercent: 10,
      speedPercent: 8,
      hpBonus: 30,
      armorBonus: 40,
      defenseBonus: 16,
      armorPenPercent: 18,
      trueDamageBonus: 14,
      critRatePercent: 10,
    },
  },

  drone_cryo_a: {
    id: 'drone_cryo_a',
    name: 'DR-18 Cryo Blaster',
    vietnameseName: 'DR-18 Drone Băng Hàn Tuyệt Đối A',
    tier: 'A',
    tagline: 'Chùm băng Cryo lạnh âm độ · Làm chậm tốc độ di chuyển của địch',
    description: 'Phun chùm tinh thể băng tuyết làm lạnh động cơ kẻ địch, tăng 16% sát thương và 15% tốc độ bắn.',
    avatarEmoji: '❄️',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    bulletColor: '#22d3ee',
    bulletDamage: 20,
    fireRate: 3.5,
    bulletType: 'photon',
    statBuffs: {
      damagePercent: 16,
      fireRatePercent: 15,
      speedPercent: 12,
      hpBonus: 22,
      armorBonus: 30,
      defenseBonus: 12,
      armorPenPercent: 14,
      trueDamageBonus: 10,
      critRatePercent: 14,
    },
  },

  drone_vortex_a: {
    id: 'drone_vortex_a',
    name: 'DR-21 Gravity Core',
    vietnameseName: 'DR-21 Drone Trọng Lực Hư Không A',
    tier: 'A',
    tagline: 'Cầu hấp dẫn xoáy hút · Gây sát thương chuẩn lên kết cấu',
    description: 'Phát sóng hấp dẫn xoắn ốc gây chấn động kim loại, gia tăng 18% sát thương và +15 sát thương chuẩn.',
    avatarEmoji: '🌀',
    color: '#a855f7',
    accentColor: '#c084fc',
    bulletColor: '#9333ea',
    bulletDamage: 23,
    fireRate: 3.0,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 18,
      fireRatePercent: 12,
      speedPercent: 10,
      hpBonus: 25,
      armorBonus: 35,
      defenseBonus: 14,
      armorPenPercent: 16,
      trueDamageBonus: 15,
      critRatePercent: 12,
    },
  },

  drone_spark_a: {
    id: 'drone_spark_a',
    name: 'DR-24 Tesla Shock',
    vietnameseName: 'DR-24 Drone Hồ Quang Sấm Sét A',
    tier: 'A',
    tagline: 'Hồ quang điện áp cực cao · Sét giật lan truyền qua kẻ địch kế cận',
    description: 'Phóng tia sét cao thế giật tê liệt các phi cơ địch nhỏ, tăng 17% sát thương và 16% bạo kích.',
    avatarEmoji: '⚡',
    color: '#eab308',
    accentColor: '#facc15',
    bulletColor: '#ca8a04',
    bulletDamage: 21,
    fireRate: 3.4,
    bulletType: 'tachyon',
    statBuffs: {
      damagePercent: 17,
      fireRatePercent: 14,
      speedPercent: 14,
      hpBonus: 20,
      armorBonus: 30,
      defenseBonus: 10,
      armorPenPercent: 15,
      trueDamageBonus: 12,
      critRatePercent: 16,
    },
  },

  drone_thunder_a: {
    id: 'drone_thunder_a',
    name: 'DR-28 Thunder Lance',
    vietnameseName: 'DR-28 Drone Lôi Thương Xuyên Giáp A',
    tier: 'A',
    tagline: 'Mũi thương lôi đình siêu thanh · Tăng 22% Xuyên Giáp và 18% Sát Thương',
    description: 'Phóng các mũi thương điện tích cao tốc đâm thủng lớp giáp dày của tàu tuần dương địch, tăng 18% sát thương và 22% xuyên giáp.',
    avatarEmoji: '🌩️',
    color: '#38bdf8',
    accentColor: '#0ea5e9',
    bulletColor: '#0284c7',
    bulletDamage: 25,
    fireRate: 3.2,
    bulletType: 'laser',
    statBuffs: {
      damagePercent: 18,
      fireRatePercent: 15,
      speedPercent: 12,
      hpBonus: 28,
      armorBonus: 38,
      defenseBonus: 15,
      armorPenPercent: 22,
      trueDamageBonus: 16,
      critRatePercent: 14,
    },
  },

  drone_shield_a: {
    id: 'drone_shield_a',
    name: 'DR-30 Aegis Protector',
    vietnameseName: 'DR-30 Drone Vệ Binh Giáp Hộ Mệnh A',
    tier: 'A',
    tagline: 'Vỏ bọc hạt nano phòng thủ · Tăng 50 Giáp và 20 Phòng Thủ kiên cố',
    description: 'Tạo trường phản lực từ tính bảo hộ thân máy bay, tăng mạnh 50 Giáp tối đa và 20 điểm Phòng Thủ giúp giảm sát thương nhận vào.',
    avatarEmoji: '🔰',
    color: '#10b981',
    accentColor: '#34d399',
    bulletColor: '#059669',
    bulletDamage: 22,
    fireRate: 3.0,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 15,
      fireRatePercent: 10,
      speedPercent: 10,
      hpBonus: 35,
      armorBonus: 50,
      defenseBonus: 20,
      armorPenPercent: 12,
      trueDamageBonus: 12,
      critRatePercent: 10,
    },
  },

  // ==========================================
  // --- TIER B DRONES (BẬC B - TIÊU CHUẨN: 89.0%) ---
  // ==========================================
  drone_scout_b: {
    id: 'drone_scout_b',
    name: 'DR-01 Scout Sentinel',
    vietnameseName: 'DR-01 Drone Trinh Sát B',
    tier: 'B',
    tagline: 'Drone viễn thám tiền phương · Hỗ trợ bắn xung năng lượng',
    description: 'Thiết bị bay trinh sát gọn nhẹ, tăng 8% sát thương và 6% tốc độ bay cho máy bay chính.',
    avatarEmoji: '📡',
    color: '#38bdf8',
    accentColor: '#94a3b8',
    bulletColor: '#38bdf8',
    bulletDamage: 12,
    fireRate: 2.5,
    bulletType: 'laser',
    statBuffs: {
      damagePercent: 8,
      fireRatePercent: 5,
      speedPercent: 6,
      hpBonus: 10,
      armorBonus: 15,
      defenseBonus: 6,
      armorPenPercent: 6,
      trueDamageBonus: 5,
      critRatePercent: 6,
    },
  },

  drone_guard_b: {
    id: 'drone_guard_b',
    name: 'DR-02 Steel Guard',
    vietnameseName: 'DR-02 Drone Hộ Vệ Thép B',
    tier: 'B',
    tagline: 'Vỏ giáp hợp kim titan đúc · Gia tăng máu và sức chống chịu',
    description: 'Bay hộ tống phía sau hỗ trợ phòng vệ, tăng 18 Máu, 25 Giáp và 10 Phòng thủ cho máy bay chính.',
    avatarEmoji: '🛡️',
    color: '#64748b',
    accentColor: '#94a3b8',
    bulletColor: '#94a3b8',
    bulletDamage: 10,
    fireRate: 2.2,
    bulletType: 'plasma',
    statBuffs: {
      damagePercent: 6,
      fireRatePercent: 4,
      speedPercent: 4,
      hpBonus: 18,
      armorBonus: 25,
      defenseBonus: 10,
      armorPenPercent: 4,
      trueDamageBonus: 4,
      critRatePercent: 5,
    },
  },

  drone_rapid_b: {
    id: 'drone_rapid_b',
    name: 'DR-03 Rapid Needle',
    vietnameseName: 'DR-03 Drone Kim Châm Liên Thanh B',
    tier: 'B',
    tagline: 'Pháo nòng xoay siêu tốc · Xả đạn liên tục chế áp',
    description: 'Khẩu pháo liên thanh mini tăng 10% tốc độ bắn và 8% bạo kích cho máy bay chính.',
    avatarEmoji: '💨',
    color: '#10b981',
    accentColor: '#6ee7b7',
    bulletColor: '#34d399',
    bulletDamage: 11,
    fireRate: 3.5,
    bulletType: 'photon',
    statBuffs: {
      damagePercent: 7,
      fireRatePercent: 10,
      speedPercent: 5,
      hpBonus: 8,
      armorBonus: 12,
      defenseBonus: 5,
      armorPenPercent: 8,
      trueDamageBonus: 6,
      critRatePercent: 8,
    },
  },

  drone_piercer_b: {
    id: 'drone_piercer_b',
    name: 'DR-04 Tungsten Piercer',
    vietnameseName: 'DR-04 Drone Đục Giáp Vonfram B',
    tier: 'B',
    tagline: 'Đầu đạn hợp kim nặng vonfram · Xuyên phá giáp mục tiêu',
    description: 'Bắn các đầu đạn vonfram nặng, tăng 9% sát thương và 10% khả năng xuyên giáp đối phương.',
    avatarEmoji: '🔩',
    color: '#f59e0b',
    accentColor: '#fde047',
    bulletColor: '#d97706',
    bulletDamage: 14,
    fireRate: 2.4,
    bulletType: 'laser',
    statBuffs: {
      damagePercent: 9,
      fireRatePercent: 6,
      speedPercent: 5,
      hpBonus: 12,
      armorBonus: 16,
      defenseBonus: 7,
      armorPenPercent: 10,
      trueDamageBonus: 8,
      critRatePercent: 6,
    },
  },
};

/**
 * Calculate aggregated stat bonuses and active passives from equipped drones
 * Supports up to 2 equipped drones (Slot 1 & Slot 2)
 */
export function calculateDroneBonuses(
  equippedDroneIds: string[],
  fighterId?: string
): DroneStatBuffs & { passives: DronePassive[] } {
  const result: DroneStatBuffs & { passives: DronePassive[] } = {
    damagePercent: 0,
    fireRatePercent: 0,
    speedPercent: 0,
    hpBonus: 0,
    armorBonus: 0,
    defenseBonus: 0,
    armorPenPercent: 0,
    trueDamageBonus: 0,
    critRatePercent: 0,
    passives: [],
  };

  if (!equippedDroneIds || !Array.isArray(equippedDroneIds)) {
    return result;
  }

  for (const droneId of equippedDroneIds) {
    const drone = DRONES[droneId];
    if (drone) {
      const b = drone.statBuffs;
      result.damagePercent += b.damagePercent || 0;
      result.fireRatePercent += b.fireRatePercent || 0;
      result.speedPercent += b.speedPercent || 0;
      result.hpBonus += b.hpBonus || 0;
      result.armorBonus += b.armorBonus || 0;
      result.defenseBonus += b.defenseBonus || 0;
      result.armorPenPercent += b.armorPenPercent || 0;
      result.trueDamageBonus += b.trueDamageBonus || 0;
      result.critRatePercent += b.critRatePercent || 0;

      if (drone.passiveSkill) {
        result.passives.push(drone.passiveSkill);
      }
    }
  }

  // TRẤN PHÁI RTS-88: Khi trang bị Drone S (DR-88 Lôi Vân Kích S) cho RTS-88 Tia Chớp
  // Tăng thêm 80% xuyên giáp và 50 sát thương chuẩn!
  if (fighterId === 'rts_88' && equippedDroneIds.some((id) => id === 'drone_thunder_storm_s')) {
    result.armorPenPercent += 80;
    result.trueDamageBonus += 50;
  }

  return result;
}

export interface DroneGachaItem {
  droneId: string;
  name: string;
  vietnameseName: string;
  tier: DroneTier;
  color: string;
  accentColor: string;
  avatarEmoji: string;
  isNew: boolean;
  duplicateBonusGems: number;
  passiveName?: string;
}

export const DRONE_GACHA_SINGLE_COST = 200;
export const DRONE_GACHA_TEN_COST = 1800;

/**
 * Execute Drone Gacha Summons (Quay Gacha Drone)
 * Rates: S: 1.0%, A: 10.0%, B: 89.0%
 * Pity:
 * - Tier S guaranteed within 80 summons
 * - Tier A guaranteed within 10 summons
 * - 10x Pull Guarantee: Guaranteed at least 1 Tier A or Tier S!
 * - Duplicates give compensation Gems (S: 500 gems, A: 200 gems, B: 50 gems)
 */
export function executeDroneGachaPull(
  pullCount: 1 | 10,
  ownedDroneIds: string[],
  currentPityS: number,
  currentPityA: number
): {
  results: DroneGachaItem[];
  newOwnedDroneIds: string[];
  newPityS: number;
  newPityA: number;
  totalGemsCost: number;
  duplicateGemsGranted: number;
} {
  const cost = pullCount === 10 ? DRONE_GACHA_TEN_COST : DRONE_GACHA_SINGLE_COST;
  const results: DroneGachaItem[] = [];
  const ownedSet = new Set(ownedDroneIds);

  let pityS = currentPityS;
  let pityA = currentPityA;
  let duplicateGemsGranted = 0;

  const tierSList = Object.values(DRONES).filter((d) => d.tier === 'S');
  const tierAList = Object.values(DRONES).filter((d) => d.tier === 'A');
  const tierBList = Object.values(DRONES).filter((d) => d.tier === 'B');

  let hasTierAorS = false;

  for (let i = 0; i < pullCount; i++) {
    pityS++;
    pityA++;

    let chosenTier: DroneTier = 'B';
    const roll = Math.random() * 100;

    // Rates: S = 1.0%, A = 10.0%, B = 89.0%
    if (pityS >= 80 || roll < 1.0) {
      chosenTier = 'S';
      pityS = 0;
      pityA = 0;
      hasTierAorS = true;
    } else if (pityA >= 10 || roll < 11.0) {
      chosenTier = 'A';
      pityA = 0;
      hasTierAorS = true;
    } else {
      chosenTier = 'B';
    }

    // 10x Guarantee check: If 10th pull and still no Tier A or S, guarantee at least Tier A
    if (pullCount === 10 && i === 9 && !hasTierAorS) {
      chosenTier = Math.random() * 100 < 10.0 ? 'S' : 'A';
      hasTierAorS = true;
      if (chosenTier === 'S') pityS = 0;
      pityA = 0;
    }

    const pool = chosenTier === 'S' ? tierSList : chosenTier === 'A' ? tierAList : tierBList;
    const selectedDrone = pool[Math.floor(Math.random() * pool.length)];

    const isNew = !ownedSet.has(selectedDrone.id);
    const bonusGems = isNew ? 0 : selectedDrone.tier === 'S' ? 500 : selectedDrone.tier === 'A' ? 200 : 50;

    if (isNew) {
      ownedSet.add(selectedDrone.id);
    } else {
      duplicateGemsGranted += bonusGems;
    }

    results.push({
      droneId: selectedDrone.id,
      name: selectedDrone.name,
      vietnameseName: selectedDrone.vietnameseName,
      tier: selectedDrone.tier,
      color: selectedDrone.color,
      accentColor: selectedDrone.accentColor,
      avatarEmoji: selectedDrone.avatarEmoji,
      isNew,
      duplicateBonusGems: bonusGems,
      passiveName: selectedDrone.passiveSkill?.vietnameseName,
    });
  }

  return {
    results,
    newOwnedDroneIds: Array.from(ownedSet),
    newPityS: pityS,
    newPityA: pityA,
    totalGemsCost: cost,
    duplicateGemsGranted,
  };
}

/**
 * Escort wingman coordinate calculator
 * Computes smooth escort positions for equipped drones behind and to the sides of the player
 */
export function calculateDroneEscortPosition(
  playerX: number,
  playerY: number,
  slotIndex: 0 | 1,
  totalDrones: number,
  hoverTimeMs: number
): { x: number; y: number } {
  // If 1 drone: flies slightly to the left-rear (-34px, +28px)
  // If 2 drones: drone 0 is left-rear (-36px, +24px), drone 1 is right-rear (+36px, +24px)
  const isLeft = slotIndex === 0;
  const offsetX = totalDrones === 1 ? -32 : isLeft ? -36 : 36;
  const offsetY = totalDrones === 1 ? 26 : 24;

  // Gentle hovering bobbing
  const bobbing = Math.sin(hoverTimeMs * 0.004 + (isLeft ? 0 : Math.PI)) * 4;
  const swayX = Math.cos(hoverTimeMs * 0.003 + (isLeft ? 0 : Math.PI / 2)) * 2;

  return {
    x: playerX + offsetX + swayX,
    y: playerY + offsetY + bobbing,
  };
}
