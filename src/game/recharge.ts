/**
 * Top-Up, Recharge, VIP, Pass, and Voucher mechanics for Sky Vanguard
 * Pure logic decoupled from React & DOM for deterministic testing.
 */

export type RechargeTab = 'packs' | 'gold_packs' | 'first_recharge' | 'passes' | 'vip' | 'giftcode';

export interface TopUpPackage {
  id: string;
  name: string;
  priceVnd: number;
  priceFormatted: string;
  baseGems: number;
  firstBonusGems: number; // x2 on first purchase of this pack
  regularBonusGems: number;
  icon: string;
  badge?: string;
  isHot?: boolean;
  isBestValue?: boolean;
}

export const TOPUP_PACKAGES: TopUpPackage[] = [
  {
    id: 'pack_26k',
    name: 'Gói Tân Thủ',
    priceVnd: 26000,
    priceFormatted: '26.000 đ',
    baseGems: 400,
    firstBonusGems: 400, // Total 800 on 1st buy
    regularBonusGems: 0,
    icon: '💎',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'pack_68k',
    name: 'Gói Tiên Phong',
    priceVnd: 68000,
    priceFormatted: '68.000 đ',
    baseGems: 1260,
    firstBonusGems: 1260, // Total 2,520 on 1st buy
    regularBonusGems: 60,
    icon: '💎💎',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'pack_128k',
    name: 'Gói Chỉ Huy',
    priceVnd: 128000,
    priceFormatted: '128.000 đ',
    baseGems: 2600,
    firstBonusGems: 2600, // Total 5,200 on 1st buy
    regularBonusGems: 150,
    icon: '💎💎💎',
    badge: 'PHỔ BIẾN NHẤT',
    isHot: true,
  },
  {
    id: 'pack_250k',
    name: 'Gói Tinh Anh',
    priceVnd: 250000,
    priceFormatted: '250.000 đ',
    baseGems: 5300,
    firstBonusGems: 5300, // Total 10,600 on 1st buy
    regularBonusGems: 350,
    icon: '👑💎',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'pack_505k',
    name: 'Gói Chiến Thần',
    priceVnd: 505000,
    priceFormatted: '505.000 đ',
    baseGems: 11000,
    firstBonusGems: 11000, // Total 22,000 on 1st buy
    regularBonusGems: 1000,
    icon: '⚡💎💎',
    badge: 'SIÊU ƯU ĐÃI',
    isHot: true,
  },
  {
    id: 'pack_1020k',
    name: 'Bá Chủ Ngân Hà',
    priceVnd: 1020000,
    priceFormatted: '1.020.000 đ',
    baseGems: 23000,
    firstBonusGems: 23000, // Total 46,000 on 1st buy
    regularBonusGems: 2500,
    icon: '🌌👑💎',
    badge: 'GIÁ TRỊ CAO',
  },
  {
    id: 'pack_2162k',
    name: 'Thần Thoại Vũ Trụ',
    priceVnd: 2162000,
    priceFormatted: '2.162.000 đ',
    baseGems: 50000,
    firstBonusGems: 50000, // Total 100,000 on 1st buy
    regularBonusGems: 6000,
    icon: '✨🌌👑💎',
    badge: 'GIÁ TRỊ TỐI ĐA',
    isBestValue: true,
  },
];

// ==========================================
// GOLD TOP-UP PACKAGES (GÓI NẠP MUA VÀNG)
// ==========================================
export interface TopUpGoldPackage {
  id: string;
  name: string;
  priceVnd: number;
  priceFormatted: string;
  baseGold: number;
  firstBonusGold: number; // x2 on first purchase
  regularBonusGold: number;
  icon: string;
  badge?: string;
  isHot?: boolean;
  isBestValue?: boolean;
}

export const TOPUP_GOLD_PACKAGES: TopUpGoldPackage[] = [
  {
    id: 'gold_pack_26k',
    name: 'Rương Vàng Tân Thủ',
    priceVnd: 26000,
    priceFormatted: '26.000 đ',
    baseGold: 500000,
    firstBonusGold: 500000, // Tổng 1,000,000 Vàng lần đầu
    regularBonusGold: 50000,
    icon: '🪙',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'gold_pack_68k',
    name: 'Túi Vàng Tiên Phong',
    priceVnd: 68000,
    priceFormatted: '68.000 đ',
    baseGold: 1500000,
    firstBonusGold: 1500000, // Tổng 3,000,000 Vàng
    regularBonusGold: 200000,
    icon: '💰',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'gold_pack_128k',
    name: 'Kho Vàng Chỉ Huy',
    priceVnd: 128000,
    priceFormatted: '128.000 đ',
    baseGold: 3500000,
    firstBonusGold: 3500000, // Tổng 7,000,000 Vàng
    regularBonusGold: 500000,
    icon: '🏦',
    badge: 'PHỔ BIẾN NHẤT',
    isHot: true,
  },
  {
    id: 'gold_pack_250k',
    name: 'Kho Báu Tinh Anh',
    priceVnd: 250000,
    priceFormatted: '250.000 đ',
    baseGold: 8000000,
    firstBonusGold: 8000000, // Tổng 16,000,000 Vàng
    regularBonusGold: 1200000,
    icon: '👑🪙',
    badge: 'X2 LẦN ĐẦU',
  },
  {
    id: 'gold_pack_505k',
    name: 'Kim Ngân Chiến Thần',
    priceVnd: 505000,
    priceFormatted: '505.000 đ',
    baseGold: 20000000,
    firstBonusGold: 20000000, // Tổng 40,000,000 Vàng
    regularBonusGold: 3500000,
    icon: '⚡💰💰',
    badge: 'SIÊU ƯU ĐÃI',
    isHot: true,
  },
  {
    id: 'gold_pack_1020k',
    name: 'Kho Vàng Bá Chủ Ngân Hà',
    priceVnd: 1020000,
    priceFormatted: '1.020.000 đ',
    baseGold: 50000000,
    firstBonusGold: 50000000, // Tổng 100,000,000 Vàng
    regularBonusGold: 10000000,
    icon: '🌌👑🪙',
    badge: 'GIÁ TRỊ CAO',
  },
  {
    id: 'gold_pack_2162k',
    name: 'Kho Vàng Thần Thoại Vũ Trụ',
    priceVnd: 2162000,
    priceFormatted: '2.162.000 đ',
    baseGold: 120000000,
    firstBonusGold: 120000000, // Tổng 240,000,000 Vàng
    regularBonusGold: 30000000,
    icon: '✨🌌👑🪙',
    badge: 'GIÁ TRỊ TỐI ĐA',
    isBestValue: true,
  },
];

export interface VipTier {
  level: number;
  title: string;
  requiredExp: number; // 1,000 VND = 1 EXP
  rewardGems: number;
  privilegeText: string;
  bonusDamagePercent: number;
  bonusFireRatePercent: number;
  bonusRevives: number;
  unlockedPilotId?: string;
  badgeColor: string;
}

export const VIP_TIERS: VipTier[] = [
  {
    level: 0,
    title: 'Tân Binh Không Gian',
    requiredExp: 0,
    rewardGems: 0,
    privilegeText: 'Chưa có đặc quyền VIP. Hãy nạp lần đầu từ 26.000 đ để kích hoạt VIP 1!',
    bonusDamagePercent: 0,
    bonusFireRatePercent: 0,
    bonusRevives: 0,
    badgeColor: 'border-slate-600 text-slate-400 bg-slate-900',
  },
  {
    level: 1,
    title: 'Chiến Binh Tiên Phong',
    requiredExp: 26, // 26,000 VND
    rewardGems: 400,
    privilegeText: '+5% Tốc độ bắn phi đạn toàn đội',
    bonusDamagePercent: 0,
    bonusFireRatePercent: 5,
    bonusRevives: 0,
    badgeColor: 'border-cyan-500 text-cyan-300 bg-cyan-950/60',
  },
  {
    level: 2,
    title: 'Hộ Vệ Ngân Hà',
    requiredExp: 68, // 68,000 VND
    rewardGems: 1000,
    privilegeText: '+5% Sát thương toàn vũ khí',
    bonusDamagePercent: 5,
    bonusFireRatePercent: 5,
    bonusRevives: 0,
    badgeColor: 'border-blue-500 text-blue-300 bg-blue-950/60',
  },
  {
    level: 3,
    title: 'Chỉ Huy Tinh Vân',
    requiredExp: 128, // 128,000 VND
    rewardGems: 2000,
    privilegeText: '+10% Sát thương & +10% Tốc độ đạn',
    bonusDamagePercent: 10,
    bonusFireRatePercent: 10,
    bonusRevives: 0,
    badgeColor: 'border-purple-500 text-purple-300 bg-purple-950/60',
  },
  {
    level: 4,
    title: 'Đại Tướng Không Gian',
    requiredExp: 250, // 250,000 VND
    rewardGems: 4500,
    privilegeText: '+1 Mạng hồi sinh tự động mỗi trận (Revive)',
    bonusDamagePercent: 12,
    bonusFireRatePercent: 12,
    bonusRevives: 1,
    badgeColor: 'border-pink-500 text-pink-300 bg-pink-950/60',
  },
  {
    level: 5,
    title: 'Chiến Thần Tối Cao',
    requiredExp: 505, // 505,000 VND
    rewardGems: 10000,
    privilegeText: 'Giảm 10% chi phí quay Gacha x10 & +15% Sát thương',
    bonusDamagePercent: 15,
    bonusFireRatePercent: 15,
    bonusRevives: 1,
    badgeColor: 'border-rose-500 text-rose-300 bg-rose-950/60',
  },
  {
    level: 6,
    title: 'Chúa Tể Không Gian',
    requiredExp: 1020, // 1,020,000 VND
    rewardGems: 20000,
    privilegeText: 'Mở khóa Tay Lái Bậc S Elena Nova & +20% Sát thương',
    bonusDamagePercent: 20,
    bonusFireRatePercent: 20,
    bonusRevives: 2,
    unlockedPilotId: 'elena_nova',
    badgeColor: 'border-amber-500 text-amber-300 bg-amber-950/60',
  },
  {
    level: 7,
    title: 'Hoàng Gia Vũ Trụ',
    requiredExp: 2162, // 2,162,000 VND
    rewardGems: 45000,
    privilegeText: '+25% Điểm số cuối trận & +25% Sát thương hạm đội',
    bonusDamagePercent: 25,
    bonusFireRatePercent: 25,
    bonusRevives: 2,
    badgeColor: 'border-yellow-400 text-yellow-200 bg-yellow-950/70',
  },
  {
    level: 8,
    title: 'Bá Chủ Thần Thánh',
    requiredExp: 4324, // 4,324,000 VND
    rewardGems: 100000,
    privilegeText: 'Đặc quyền Vô Địch: Bất tử 5 giây đầu mỗi đợt & +35% Sát thương',
    bonusDamagePercent: 35,
    bonusFireRatePercent: 30,
    bonusRevives: 3,
    badgeColor: 'border-emerald-400 text-emerald-200 bg-emerald-950/70',
  },
  {
    level: 9,
    title: 'Thống Soái Ngân Hà',
    requiredExp: 6800, // 6,800,000 VND
    rewardGems: 160000,
    privilegeText: '+40% Sát thương toàn quân & +35% Tốc độ bắn phi cơ',
    bonusDamagePercent: 40,
    bonusFireRatePercent: 35,
    bonusRevives: 3,
    badgeColor: 'border-sky-400 text-sky-200 bg-sky-950/70',
  },
  {
    level: 10,
    title: 'Chiến Thần Tinh Tú',
    requiredExp: 10000, // 10,000,000 VND
    rewardGems: 250000,
    privilegeText: '+4 Mạng hồi sinh tự động mỗi trận & +45% Sát thương hạm đội',
    bonusDamagePercent: 45,
    bonusFireRatePercent: 38,
    bonusRevives: 4,
    badgeColor: 'border-indigo-400 text-indigo-200 bg-indigo-950/70',
  },
  {
    level: 11,
    title: 'Bá Vương Hư Không',
    requiredExp: 15000, // 15,000,000 VND
    rewardGems: 380000,
    privilegeText: '+50% Sát thương & Giảm 25% thời gian hồi chiêu tuyệt kỹ',
    bonusDamagePercent: 50,
    bonusFireRatePercent: 40,
    bonusRevives: 4,
    badgeColor: 'border-violet-400 text-violet-200 bg-violet-950/70',
  },
  {
    level: 12,
    title: 'Chúa Tể Không Gian',
    requiredExp: 22000, // 22,000,000 VND
    rewardGems: 550000,
    privilegeText: '+55% Sát thương & Hào quang bất tử 6 giây đầu mỗi đợt quái',
    bonusDamagePercent: 55,
    bonusFireRatePercent: 42,
    bonusRevives: 5,
    badgeColor: 'border-fuchsia-400 text-fuchsia-200 bg-fuchsia-950/70',
  },
  {
    level: 13,
    title: 'Đế Vương Tinh Vân',
    requiredExp: 32000, // 32,000,000 VND
    rewardGems: 800000,
    privilegeText: '+60% Sát thương & +45% Tốc độ bắn & Tăng 30% tầm nhặt vật phẩm',
    bonusDamagePercent: 60,
    bonusFireRatePercent: 45,
    bonusRevives: 5,
    badgeColor: 'border-pink-400 text-pink-200 bg-pink-950/70',
  },
  {
    level: 14,
    title: 'Vĩnh Hằng Chi Thần',
    requiredExp: 45000, // 45,000,000 VND
    rewardGems: 1150000,
    privilegeText: '+65% Sát thương & +6 Mạng hồi sinh tự động mỗi trận',
    bonusDamagePercent: 65,
    bonusFireRatePercent: 48,
    bonusRevives: 6,
    badgeColor: 'border-rose-400 text-rose-200 bg-rose-950/70',
  },
  {
    level: 15,
    title: 'Chúa Tể Đa Vũ Trụ',
    requiredExp: 65000, // 65,000,000 VND
    rewardGems: 1600000,
    privilegeText: '+70% Sát thương, +50% Tốc độ đạn & Tự động nạp 1 Bom EMP mỗi 60s',
    bonusDamagePercent: 70,
    bonusFireRatePercent: 50,
    bonusRevives: 7,
    badgeColor: 'border-amber-400 text-amber-200 bg-amber-950/70',
  },
  {
    level: 16,
    title: 'Thần Vương Hỗn Mãng',
    requiredExp: 90000, // 90,000,000 VND
    rewardGems: 2200000,
    privilegeText: '+75% Sát thương hạm đội & Bão đạn năng lượng tăng 50% tầm nổ lan',
    bonusDamagePercent: 75,
    bonusFireRatePercent: 52,
    bonusRevives: 7,
    badgeColor: 'border-yellow-300 text-yellow-100 bg-yellow-950/80',
  },
  {
    level: 17,
    title: 'Chúa Tể Kỷ Nguyên Mới',
    requiredExp: 125000, // 125,000,000 VND
    rewardGems: 3000000,
    privilegeText: '+80% Sát thương, +8 Mạng hồi sinh & Tỉ lệ bạo kích cơ bản +25%',
    bonusDamagePercent: 80,
    bonusFireRatePercent: 55,
    bonusRevives: 8,
    badgeColor: 'border-teal-400 text-teal-200 bg-teal-950/80',
  },
  {
    level: 18,
    title: 'Bất Diệt Thần Giới',
    requiredExp: 170000, // 170,000,000 VND
    rewardGems: 4000000,
    privilegeText: '+85% Sát thương, giảm 50% sát thương va chạm & Giáp hồi tức thì',
    bonusDamagePercent: 85,
    bonusFireRatePercent: 58,
    bonusRevives: 8,
    badgeColor: 'border-cyan-300 text-cyan-100 bg-cyan-950/80',
  },
  {
    level: 19,
    title: 'Chí Tôn Thần Khởi',
    requiredExp: 230000, // 230,000,000 VND
    rewardGems: 5200000,
    privilegeText: '+90% Sát thương toàn quân, +9 Mạng hồi sinh & Bất tử 8s đầu mỗi đợt',
    bonusDamagePercent: 90,
    bonusFireRatePercent: 60,
    bonusRevives: 9,
    badgeColor: 'border-purple-300 text-purple-100 bg-purple-950/80',
  },
  {
    level: 20,
    title: 'Bá Chủ Vũ Trụ Tối Thượng',
    requiredExp: 300000, // 300,000,000 VND
    rewardGems: 7000000,
    privilegeText: 'ĐẶC QUYỀN VIP 20 TỐI THƯỢNG: +100% Sát thương, +65% Tốc bắn, 10 Mạng hồi sinh, Bất tử 10s',
    bonusDamagePercent: 100,
    bonusFireRatePercent: 65,
    bonusRevives: 10,
    badgeColor: 'border-amber-300 text-amber-100 bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.5)]',
  },
];

export interface PassSubscription {
  active: boolean;
  daysRemaining: number;
  lastClaimDate: string | null; // 'YYYY-MM-DD'
  dailyGems: number;
  totalDays: number;
  instantGems: number;
  name: string;
  priceVnd: number;
}

export const DEFAULT_WEEKLY_PASS: PassSubscription = {
  active: false,
  daysRemaining: 0,
  lastClaimDate: null,
  dailyGems: 120,
  totalDays: 7,
  instantGems: 400,
  name: 'Thẻ Tuần Chiến Binh',
  priceVnd: 26000,
};

export const DEFAULT_MONTHLY_PASS: PassSubscription = {
  active: false,
  daysRemaining: 0,
  lastClaimDate: null,
  dailyGems: 300,
  totalDays: 30,
  instantGems: 2600,
  name: 'Thẻ Tháng Lượng Tử',
  priceVnd: 128000,
};

export interface PromoGiftCode {
  code: string;
  gems: number;
  vipExp: number;
  description: string;
}

export const PROMO_GIFT_CODES: Record<string, PromoGiftCode> = {
  SKYVANGUARD: {
    code: 'SKYVANGUARD',
    gems: 5000,
    vipExp: 10,
    description: 'Quà Tri Ân Phi Đội Tiên Phong: +5,000 💎 & +10 Điểm VIP',
  },
  VIP999: {
    code: 'VIP999',
    gems: 10000,
    vipExp: 50,
    description: 'Code VIP Huyền Thoại: +10,000 💎 & +50 Điểm VIP (Lên thẳng VIP 2-3)',
  },
  NAPDAU2026: {
    code: 'NAPDAU2026',
    gems: 3000,
    vipExp: 10,
    description: 'Quà Hỗ Trợ Nạp Đầu: +3,000 💎',
  },
  TANTHU: {
    code: 'TANTHU',
    gems: 2000,
    vipExp: 5,
    description: 'Gói Tân Binh Nhập Ngũ: +2,000 💎',
  },
  CHIENTHAN: {
    code: 'CHIENTHAN',
    gems: 8000,
    vipExp: 20,
    description: 'Quà Tặng Chiến Thần: +8,000 💎',
  },
};

export interface RechargeSystemState {
  vipExp: number; // 1,000 VND = 1 EXP
  hasRecharged: boolean;
  firstRechargeClaimed: boolean;
  purchasedPackIds: string[]; // Set of pack IDs that were purchased (for x2 detection)
  claimedVipTierLevels: number[]; // VIP tiers whose level-up rewards have been claimed
  claimedGiftCodes: string[];
  weeklyPass: PassSubscription;
  monthlyPass: PassSubscription;
}

export const INITIAL_RECHARGE_STATE: RechargeSystemState = {
  vipExp: 0,
  hasRecharged: false,
  firstRechargeClaimed: false,
  purchasedPackIds: [],
  claimedVipTierLevels: [],
  claimedGiftCodes: [],
  weeklyPass: { ...DEFAULT_WEEKLY_PASS },
  monthlyPass: { ...DEFAULT_MONTHLY_PASS },
};

/**
 * Calculates current VIP level, progress, and next tier details
 */
export function getVipStatus(vipExp: number): {
  currentTier: VipTier;
  nextTier: VipTier | null;
  currentExp: number;
  expForNext: number;
  progressPercent: number;
} {
  let currentTier = VIP_TIERS[0];
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (vipExp >= VIP_TIERS[i].requiredExp) {
      currentTier = VIP_TIERS[i];
      break;
    }
  }

  const nextTierIndex = currentTier.level < VIP_TIERS.length - 1 ? currentTier.level + 1 : -1;
  const nextTier = nextTierIndex !== -1 ? VIP_TIERS[nextTierIndex] : null;

  let progressPercent = 100;
  let expForNext = currentTier.requiredExp;

  if (nextTier) {
    const range = nextTier.requiredExp - currentTier.requiredExp;
    const progressInTier = vipExp - currentTier.requiredExp;
    progressPercent = Math.min(100, Math.max(0, Math.floor((progressInTier / range) * 100)));
    expForNext = nextTier.requiredExp;
  }

  return {
    currentTier,
    nextTier,
    currentExp: vipExp,
    expForNext,
    progressPercent,
  };
}

/**
 * Calculates how many gems a package awards based on whether it is the first purchase
 */
export function calculatePackageGems(pkg: TopUpPackage, alreadyPurchased: boolean): {
  totalGems: number;
  isFirstBonus: boolean;
  bonusGems: number;
} {
  if (!alreadyPurchased) {
    const bonus = pkg.firstBonusGems;
    return {
      totalGems: pkg.baseGems + bonus,
      isFirstBonus: true,
      bonusGems: bonus,
    };
  }
  return {
    totalGems: pkg.baseGems + pkg.regularBonusGems,
    isFirstBonus: false,
    bonusGems: pkg.regularBonusGems,
  };
}

/**
 * Applies a top-up package purchase to the player's account
 */
export function executeRechargePurchase(
  state: RechargeSystemState,
  currentGems: number,
  packageId: string
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  gemsGranted: number;
  vipExpGained: number;
  message: string;
} {
  const pkg = TOPUP_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      vipExpGained: 0,
      message: 'Gói nạp không tồn tại!',
    };
  }

  const isAlreadyPurchased = state.purchasedPackIds.includes(packageId);
  const { totalGems, isFirstBonus } = calculatePackageGems(pkg, isAlreadyPurchased);
  const vipExpGained = Math.floor(pkg.priceVnd / 1000);

  const updatedPurchasedIds = isAlreadyPurchased
    ? state.purchasedPackIds
    : [...state.purchasedPackIds, packageId];

  const newState: RechargeSystemState = {
    ...state,
    vipExp: state.vipExp + vipExpGained,
    hasRecharged: true,
    purchasedPackIds: updatedPurchasedIds,
  };

  const message = isFirstBonus
    ? `Nạp thành công ${pkg.name}! Nhận ${totalGems.toLocaleString()} 💎 (Ưu đãi x2 Nạp Đầu)! +${vipExpGained} Điểm VIP.`
    : `Nạp thành công ${pkg.name}! Nhận ${totalGems.toLocaleString()} 💎 +${vipExpGained} Điểm VIP.`;

  return {
    success: true,
    newState,
    newGems: currentGems + totalGems,
    gemsGranted: totalGems,
    vipExpGained,
    message,
  };
}

/**
 * Calculates how much gold a gold top-up package awards based on first purchase status
 */
export function calculateGoldPackageGold(pkg: TopUpGoldPackage, alreadyPurchased: boolean): {
  totalGold: number;
  isFirstBonus: boolean;
  bonusGold: number;
} {
  if (!alreadyPurchased) {
    const bonus = pkg.firstBonusGold;
    return {
      totalGold: pkg.baseGold + bonus,
      isFirstBonus: true,
      bonusGold: bonus,
    };
  }
  return {
    totalGold: pkg.baseGold + pkg.regularBonusGold,
    isFirstBonus: false,
    bonusGold: pkg.regularBonusGold,
  };
}

/**
 * Applies a gold top-up package purchase to the player's account
 */
export function executeGoldRechargePurchase(
  state: RechargeSystemState,
  currentGold: number,
  packageId: string
): {
  success: boolean;
  newState: RechargeSystemState;
  newGold: number;
  goldGranted: number;
  vipExpGained: number;
  message: string;
} {
  const pkg = TOPUP_GOLD_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return {
      success: false,
      newState: state,
      newGold: currentGold,
      goldGranted: 0,
      vipExpGained: 0,
      message: 'Gói nạp vàng không tồn tại!',
    };
  }

  const isAlreadyPurchased = state.purchasedPackIds.includes(packageId);
  const { totalGold, isFirstBonus } = calculateGoldPackageGold(pkg, isAlreadyPurchased);
  const vipExpGained = Math.floor(pkg.priceVnd / 1000);

  const updatedPurchasedIds = isAlreadyPurchased
    ? state.purchasedPackIds
    : [...state.purchasedPackIds, packageId];

  const newState: RechargeSystemState = {
    ...state,
    vipExp: state.vipExp + vipExpGained,
    hasRecharged: true,
    purchasedPackIds: updatedPurchasedIds,
  };

  const message = isFirstBonus
    ? `Nạp thành công ${pkg.name}! Nhận +${totalGold.toLocaleString()} 🪙 Vàng (Ưu đãi x2 Nạp Đầu)! +${vipExpGained} Điểm VIP.`
    : `Nạp thành công ${pkg.name}! Nhận +${totalGold.toLocaleString()} 🪙 Vàng +${vipExpGained} Điểm VIP.`;

  return {
    success: true,
    newState,
    newGold: currentGold + totalGold,
    goldGranted: totalGold,
    vipExpGained,
    message,
  };
}

/**
 * Purchases Weekly or Monthly Pass
 */
export function executePassPurchase(
  state: RechargeSystemState,
  currentGems: number,
  passType: 'weekly' | 'monthly'
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  gemsGranted: number;
  vipExpGained: number;
  message: string;
} {
  const isWeekly = passType === 'weekly';
  const template = isWeekly ? DEFAULT_WEEKLY_PASS : DEFAULT_MONTHLY_PASS;
  const currentPass = isWeekly ? state.weeklyPass : state.monthlyPass;

  const vipExpGained = Math.floor(template.priceVnd / 1000);
  const newDaysRemaining = (currentPass.active ? currentPass.daysRemaining : 0) + template.totalDays;

  const updatedPass: PassSubscription = {
    ...template,
    active: true,
    daysRemaining: newDaysRemaining,
    lastClaimDate: currentPass.lastClaimDate,
  };

  const newState: RechargeSystemState = {
    ...state,
    vipExp: state.vipExp + vipExpGained,
    hasRecharged: true,
    weeklyPass: isWeekly ? updatedPass : state.weeklyPass,
    monthlyPass: !isWeekly ? updatedPass : state.monthlyPass,
  };

  return {
    success: true,
    newState,
    newGems: currentGems + template.instantGems,
    gemsGranted: template.instantGems,
    vipExpGained,
    message: `Kích hoạt thành công ${template.name}! Nhận ngay ${template.instantGems.toLocaleString()} 💎 và ${newDaysRemaining} ngày nhận quà!`,
  };
}

/**
 * Gets formatted today date string in YYYY-MM-DD
 */
export function getTodayDateString(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Claims daily gems from an active pass
 */
export function claimPassDailyGems(
  state: RechargeSystemState,
  currentGems: number,
  passType: 'weekly' | 'monthly',
  todayStr: string = getTodayDateString()
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  gemsClaimed: number;
  message: string;
} {
  const isWeekly = passType === 'weekly';
  const pass = isWeekly ? state.weeklyPass : state.monthlyPass;

  if (!pass.active || pass.daysRemaining <= 0) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsClaimed: 0,
      message: 'Gói thẻ chưa được kích hoạt hoặc đã hết hạn!',
    };
  }

  if (pass.lastClaimDate === todayStr) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsClaimed: 0,
      message: 'Hôm nay bạn đã nhận phần thưởng của thẻ này rồi!',
    };
  }

  const remaining = Math.max(0, pass.daysRemaining - 1);
  const updatedPass: PassSubscription = {
    ...pass,
    daysRemaining: remaining,
    active: remaining > 0,
    lastClaimDate: todayStr,
  };

  const newState: RechargeSystemState = {
    ...state,
    weeklyPass: isWeekly ? updatedPass : state.weeklyPass,
    monthlyPass: !isWeekly ? updatedPass : state.monthlyPass,
  };

  return {
    success: true,
    newState,
    newGems: currentGems + pass.dailyGems,
    gemsClaimed: pass.dailyGems,
    message: `Điểm danh ${pass.name} thành công! +${pass.dailyGems.toLocaleString()} 💎 (Còn ${remaining} ngày)`,
  };
}

/**
 * Claims first recharge reward: S-Tier Fighter (solaris or chrono) + 10,000 Gems + VIP badge
 */
export function claimFirstRechargeReward(
  state: RechargeSystemState,
  currentGems: number,
  ownedFighterIds: string[]
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  rewardFighterId: string;
  gemsGranted: number;
  message: string;
} {
  if (!state.hasRecharged) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      rewardFighterId: '',
      gemsGranted: 0,
      message: 'Bạn cần nạp bất kỳ gói nào trước khi nhận Quà Nạp Đầu!',
    };
  }

  if (state.firstRechargeClaimed) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      rewardFighterId: '',
      gemsGranted: 0,
      message: 'Bạn đã nhận Quà Nạp Đầu trước đó rồi!',
    };
  }

  // Grant S-Tier fighter: solaris if not owned, otherwise chrono or apocalypse
  let grantedFighterId = 'solaris';
  if (ownedFighterIds.includes('solaris')) {
    grantedFighterId = ownedFighterIds.includes('chrono') ? 'apocalypse' : 'chrono';
  }

  const bonusGems = 10000;
  const newState: RechargeSystemState = {
    ...state,
    firstRechargeClaimed: true,
  };

  return {
    success: true,
    newState,
    newGems: currentGems + bonusGems,
    rewardFighterId: grantedFighterId,
    gemsGranted: bonusGems,
    message: `Nhận thành công Quà Nạp Đầu! Mở khóa Chiến Cơ Bậc S Huyền Thoại và +${bonusGems.toLocaleString()} 💎!`,
  };
}

/**
 * Claims level-up rewards for a specific VIP tier
 */
export function claimVipLevelReward(
  state: RechargeSystemState,
  currentGems: number,
  vipLevel: number
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  gemsGranted: number;
  unlockedPilotId?: string;
  message: string;
} {
  const currentStatus = getVipStatus(state.vipExp);
  if (currentStatus.currentTier.level < vipLevel) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      message: `Bạn chưa đạt cấp VIP ${vipLevel} để nhận phần thưởng này!`,
    };
  }

  if (state.claimedVipTierLevels.includes(vipLevel)) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      message: `Bạn đã nhận thưởng của cấp VIP ${vipLevel} rồi!`,
    };
  }

  const tier = VIP_TIERS.find((t) => t.level === vipLevel);
  if (!tier || tier.rewardGems <= 0) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      message: 'Cấp VIP này không có phần thưởng ngọc!',
    };
  }

  const newState: RechargeSystemState = {
    ...state,
    claimedVipTierLevels: [...state.claimedVipTierLevels, vipLevel],
  };

  return {
    success: true,
    newState,
    newGems: currentGems + tier.rewardGems,
    gemsGranted: tier.rewardGems,
    unlockedPilotId: tier.unlockedPilotId,
    message: `Nhận thưởng VIP ${vipLevel} thành công! +${tier.rewardGems.toLocaleString()} 💎!`,
  };
}

/**
 * Redeems promo giftcode
 */
export function redeemGiftCode(
  state: RechargeSystemState,
  currentGems: number,
  rawCode: string
): {
  success: boolean;
  newState: RechargeSystemState;
  newGems: number;
  gemsGranted: number;
  vipExpGranted: number;
  message: string;
} {
  const normalized = (rawCode || '').trim().toUpperCase();
  const promo = PROMO_GIFT_CODES[normalized];

  if (!promo) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      vipExpGranted: 0,
      message: 'Mã Giftcode không hợp lệ hoặc đã hết hạn!',
    };
  }

  if (state.claimedGiftCodes.includes(normalized)) {
    return {
      success: false,
      newState: state,
      newGems: currentGems,
      gemsGranted: 0,
      vipExpGranted: 0,
      message: 'Bạn đã sử dụng mã Giftcode này rồi!',
    };
  }

  const newState: RechargeSystemState = {
    ...state,
    vipExp: state.vipExp + promo.vipExp,
    claimedGiftCodes: [...state.claimedGiftCodes, normalized],
  };

  return {
    success: true,
    newState,
    newGems: currentGems + promo.gems,
    gemsGranted: promo.gems,
    vipExpGranted: promo.vipExp,
    message: `Đổi mã thành công! Nhận ${promo.gems.toLocaleString()} 💎 ${promo.vipExp > 0 ? `và +${promo.vipExp} EXP VIP` : ''}!`,
  };
}
