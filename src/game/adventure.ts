/**
 * Adventure Mode (Chế Độ Phiêu Lưu) - Galactic Armada Campaign
 * 20 distinct galactic journey destinations from bottom to top (1 -> 20),
 * each featuring unique space backdrops, wave formations, enemy warship wings,
 * quantum energy core cells, high-energy plasma torpedoes, and 20 bespoke Colossal Dreadnought Bosses!
 */

export type ChickenBossShape =
  | 'robo_chicken'       // 1. Leviathan Cơ Khí Mk-I (Heavy Mecha Dreadnought)
  | 'blizzard_hen'       // 2. Băng Hạm Glacies (Cryo-Carrier Glacies)
  | 'vampire_rooster'    // 3. Tuần Dương Hạm Huyết Nguyệt (Crimson Bloodfang Warcruiser)
  | 'tesla_mother'       // 4. Soái Hạm Lôi Thần Tesla (Apex Tesla Dreadnought)
  | 'bio_venom_gallus'   // 5. Hạm Đội Bọ Độc Bio-Gorgon (Gorgon Bio-Alloy Frigate)
  | 'atomic_egg'         // 6. Pháo Đài Lỗ Đen Singularity (Antimatter Singularity Fortress)
  | 'golden_sultan'      // 7. Chiến Hạm Hoàng Kim Sultan (Imperial Gold Sovereign)
  | 'void_phantom'       // 8. Bóng Ma Hư Không Phantom (Void Specter Stealth Flagship)
  | 'kraken_calamari'    // 9. Chiến Hạm Hải Quái Kraken (Abyssal Kraken Battlecruiser)
  | 'gatling_eggomatic'  // 10. Pháo Đài Gatling Vulcan 3000 (Vulcan Rotary Fortress)
  | 'magma_inferno'      // 11. Hỏa Hạm Dung Nham Vulcan (Inferno Vulcan Battleship)
  | 'prismatic_crystal'  // 12. Thiết Hạm Lăng Kính Crystal (Prismatic Refractor Super-Dreadnought)
  | 'toxic_methane'      // 13. Tuần Dương Hạm Khí Methane (Methane Heavy Cruiser)
  | 'chronos_multi'      // 14. Chiến Hạm Lượng Tử Chronos (Chronos Quantum Dreadnought)
  | 'dreadnought_hen'    // 15. Thiết Hạm Thao Thiết Dreadnought (Imperial Leviathan Behemoth)
  | 'cyborg_scrappy'     // 16. Chiến Hạm Phế Liệu Cyborg (Marauder Ironclad Pirate Flagship)
  | 'strobe_beacon'      // 17. Trạm Hải Đăng Pulsar 360° (Pulsar Light Fortress)
  | 'binary_twin'        // 18. Song Hạm Âm Dương Gemini (Gemini Dual-Core Fusion Cruiser)
  | 'imperial_general'   // 19. Soái Hạm Đại Tướng Armada (Armada Admiral Flagship)
  | 'supreme_emperor';   // 20. ĐẠI THIẾT HẠM VUA VŨ TRỤ (The Supreme Galactic Overlord Dreadnought)

export interface AdventureBossInfo {
  id: string;
  name: string;
  title: string;
  shapeType: ChickenBossShape;
  hp: number;
  defense: number;
  color: string;
  accentColor: string;
  specialAttack: string;
  eggColor: string;
  featherColor: string;
  dangerRating: number; // 1 to 5
}

export interface AdventureStage {
  id: number; // 1 to 20
  name: string;
  galaxyName: string;
  subLocation: string;
  description: string;
  boss: AdventureBossInfo;
  backgroundTheme: {
    starColors: string[];
    nebulaPrimary: string;
    nebulaSecondary: string;
    ambientHazard: 'asteroid_fall' | 'ice_crystals' | 'magnetic_sparks' | 'egg_rain' | 'solar_embers' | 'void_rift' | 'cosmic_aurora';
    hazardName: string;
  };
  rewardGold: number;
  rewardGems: number;
  rewardShards: number;
  formationName: string;
  formationDesc: string;
}

export interface AdventureProgress {
  unlockedStages: number[];
  completedStages: number[];
  stageStars: Record<number, number>; // stageId -> 1..3
  stageHighScores: Record<number, number>;
  totalStars: number;
  claimedMilestones: number[];
}

export const ADVENTURE_STAGES: AdventureStage[] = [
  {
    id: 1,
    name: 'Vành Đai Thái Dương Hệ',
    galaxyName: 'Ngân Hà Quê Hương (Milky Way)',
    subLocation: 'Trạm Tiền Đồn Trái Đất',
    description: 'Bầy chiến tàu quái vật ma quái trinh sát kéo đến từ rìa Vành đai Kuiper. Lớp giáp obsidian đen tuyền cùng lưỡi hái năng lượng mở màn cuộc đại chiến!',
    formationName: 'Bầy Quái Lượn Sóng Sin',
    formationDesc: 'Chiến tàu quái vật bay uốn lượn nhịp nhàng phóng cầu plasma nguyền rủa.',
    rewardGold: 8000,
    rewardGems: 120,
    rewardShards: 5,
    backgroundTheme: {
      starColors: ['#38bdf8', '#e0f2fe', '#bae6fd'],
      nebulaPrimary: 'rgba(56, 189, 248, 0.22)',
      nebulaSecondary: 'rgba(3, 105, 161, 0.15)',
      ambientHazard: 'asteroid_fall',
      hazardName: 'Tiểu Hành Tinh Rải Rác',
    },
    boss: {
      id: 'robo_clucker_1',
      name: 'Leviathan Cơ Khí Mk-I',
      title: 'Chiến Hạm Ma Quái Cổ Đại',
      shapeType: 'robo_chicken',
      hp: 1200,
      defense: 8,
      color: '#38bdf8',
      accentColor: '#f59e0b',
      specialAttack: 'Bắn 3 loạt đạn plasma tên lửa và quạt cánh laser tử thần!',
      eggColor: '#fef08a',
      featherColor: '#38bdf8',
      dangerRating: 1,
    },
  },
  {
    id: 2,
    name: 'Tinh Cầu Băng Giá Glacies',
    galaxyName: 'Dải Thiên Hà Tiên Nữ M31',
    subLocation: 'Bình Nguyên Tuyết Trắng Vĩnh Cửu',
    description: 'Hành tinh băng tuyết âm 200°C. Bầy quái vật ma hàn cực địa phóng cầu gai băng làm đông cứng các mảnh thiên thạch.',
    formationName: 'Vòng Xoay Băng Thần',
    formationDesc: 'Đội hình ma hạm xoay tròn phóng chùm gai tuyết tán sắc.',
    rewardGold: 10000,
    rewardGems: 140,
    rewardShards: 6,
    backgroundTheme: {
      starColors: ['#7dd3fc', '#a5f3fc', '#ffffff'],
      nebulaPrimary: 'rgba(125, 211, 252, 0.25)',
      nebulaSecondary: 'rgba(14, 116, 144, 0.18)',
      ambientHazard: 'ice_crystals',
      hazardName: 'Cơn Lốc Tinh Thể Băng',
    },
    boss: {
      id: 'blizzard_hen_2',
      name: 'Cự Thú Băng Hàn Glacies',
      title: 'Băng Thần Quái Vật Cực Bắc',
      shapeType: 'blizzard_hen',
      hp: 1600,
      defense: 12,
      color: '#7dd3fc',
      accentColor: '#0284c7',
      specialAttack: 'Phun hơi thở băng giá đóng băng đạn và phóng chùm gai tuyết tử thần!',
      eggColor: '#bae6fd',
      featherColor: '#e0f2fe',
      dangerRating: 1,
    },
  },
  {
    id: 3,
    name: 'Vực Đỏ Huyết Nguyệt',
    galaxyName: 'Dải Ngân Hà Tam Giác M33',
    subLocation: 'Mặt Trăng Huyết Quỷ Phobos-X',
    description: 'Bầu trời rực một màu đỏ thẫm rợn người. Bầy ma hạm cánh dơi hút máu lặn ngụp trong bóng tối rồi bổ nhào tử chiến!',
    formationName: 'Mũi Tên Huyết Ma',
    formationDesc: 'Từng đàn quái vật lao dốc hình chữ V với tốc độ xé toạc không gian.',
    rewardGold: 12000,
    rewardGems: 160,
    rewardShards: 7,
    backgroundTheme: {
      starColors: ['#f43f5e', '#fda4af', '#fecdd3'],
      nebulaPrimary: 'rgba(244, 63, 94, 0.26)',
      nebulaSecondary: 'rgba(136, 19, 55, 0.20)',
      ambientHazard: 'solar_embers',
      hazardName: 'Mưa Xỉ Nham Thạch Đỏ',
    },
    boss: {
      id: 'vampire_rooster_3',
      name: 'Bá Tước Huyết Ma Nosferatu',
      title: 'Quái Vật Huyết Tộc Khát Máu',
      shapeType: 'vampire_rooster',
      hp: 2100,
      defense: 15,
      color: '#f43f5e',
      accentColor: '#881337',
      specialAttack: 'Lướt tàng hình siêu tốc và thả bầy dơi ma plasma phát nổ!',
      eggColor: '#fda4af',
      featherColor: '#991b1b',
      dangerRating: 2,
    },
  },
  {
    id: 4,
    name: 'Lò Rèn Điện Từ Orion',
    galaxyName: 'Đám Mây Phân Tử Orion B',
    subLocation: 'Trạm Phát Điện Tesla Không Gian',
    description: 'Các cuộn dây điện từ khổng lồ phóng tia sét liên tục. Bầy quái hạm hồ quang tích điện giật sét lan toả màn hình!',
    formationName: 'Ma Trận Sấm Sét 4 Góc',
    formationDesc: 'Bốn cụm chiến hạm quái vật dàn quân tại các góc màn hình phát xung điện giật.',
    rewardGold: 14000,
    rewardGems: 180,
    rewardShards: 8,
    backgroundTheme: {
      starColors: ['#06b6d4', '#67e8f9', '#ffffff'],
      nebulaPrimary: 'rgba(6, 182, 212, 0.28)',
      nebulaSecondary: 'rgba(21, 94, 117, 0.22)',
      ambientHazard: 'magnetic_sparks',
      hazardName: 'Bão Từ Trường Ion Hóa',
    },
    boss: {
      id: 'tesla_mother_4',
      name: 'Mẫu Hạm Lôi Điện Tesla',
      title: 'Quái Vật Điện Từ Bất Hoại',
      shapeType: 'tesla_mother',
      hp: 2700,
      defense: 18,
      color: '#06b6d4',
      accentColor: '#38bdf8',
      specialAttack: 'Tạo vòng đĩa sấm sét 360 độ và phóng chuỗi tia hồ quang hủy diệt!',
      eggColor: '#67e8f9',
      featherColor: '#0891b2',
      dangerRating: 2,
    },
  },
  {
    id: 5,
    name: 'Vườn Ươm Sinh Thái Bio-Spore',
    galaxyName: 'Thiên Hà Xoắn Ốc Pinwheel M101',
    subLocation: 'Trục Diệp Lục Khổng Lồ',
    description: 'Thảm thực vật vũ trụ rậm rạp xanh ngắt. Bầy trùng ma cánh cứng mang bọc kén độc phát nổ thành dịch axit độc hại.',
    formationName: 'Vòng Xoắn Chuỗi DNA Tử Thần',
    formationDesc: 'Hai nhánh ma hạm đan chéo theo mô hình xoắn kép gieo rắc độc tố.',
    rewardGold: 16000,
    rewardGems: 200,
    rewardShards: 9,
    backgroundTheme: {
      starColors: ['#10b981', '#6ee7b7', '#a7f3d0'],
      nebulaPrimary: 'rgba(16, 185, 129, 0.26)',
      nebulaSecondary: 'rgba(6, 78, 59, 0.20)',
      ambientHazard: 'cosmic_aurora',
      hazardName: 'Sương Khí Phấn Hoa Độc',
    },
    boss: {
      id: 'bio_venom_gallus_5',
      name: 'Trùng Chúa Độc Tố Bio-Venom',
      title: 'Chúa Tễ Bào Tử Diệp Lục Đột Biến',
      shapeType: 'bio_venom_gallus',
      hp: 3300,
      defense: 20,
      color: '#10b981',
      accentColor: '#84cc16',
      specialAttack: 'Bắn chùm plasma axit độc ăn mòn và thả kén ấu trùng ký sinh!',
      eggColor: '#a3e635',
      featherColor: '#059669',
      dangerRating: 2,
    },
  },
  {
    id: 6,
    name: 'Tàn Tích Quả Cầu Hạch Nhân',
    galaxyName: 'Thiên Hà Bánh Xe Cartwheel',
    subLocation: 'Vùng Va Chạm Siêu Hạt Nhân',
    description: 'Khối năng lượng vũ trụ bị rạn nứt từ thời Big Bang, nơi bầy quái vật ma biến dị hấp thụ năng lượng hạt nhân phân hạch.',
    formationName: 'Vòng Tròn Hạt Nhân Hủy Diệt',
    formationDesc: 'Các lớp ma hạm xoay đều quanh tâm, thu hẹp rồi phóng thích xung bức xạ.',
    rewardGold: 18000,
    rewardGems: 220,
    rewardShards: 10,
    backgroundTheme: {
      starColors: ['#facc15', '#fde047', '#ffffff'],
      nebulaPrimary: 'rgba(250, 204, 21, 0.28)',
      nebulaSecondary: 'rgba(161, 98, 7, 0.22)',
      ambientHazard: 'solar_embers',
      hazardName: 'Bụi Bức Xạ Hạt Nhân',
    },
    boss: {
      id: 'atomic_egg_6',
      name: 'Dị Thể Hạch Nhân Nguyên Tử',
      title: 'Cầu Ma Bức Xạ Diệt Chủng',
      shapeType: 'atomic_egg',
      hp: 4000,
      defense: 25,
      color: '#facc15',
      accentColor: '#ea580c',
      specialAttack: 'Tách đôi lớp vỏ bộc lộ lõi hạt nhân bắn siêu pháo laser quét sạch!',
      eggColor: '#fef08a',
      featherColor: '#ca8a04',
      dangerRating: 3,
    },
  },
  {
    id: 7,
    name: 'Lò Rèn Hoàng Kim Nhân Mã',
    galaxyName: 'Chòm Sao Nhân Mã Sagittarius A',
    subLocation: 'Cung Điện Vàng Midas',
    description: 'Cả một góc trời dát vàng óng ánh! Bầy chiến hạm bọc giáp hoàng kim ma quái rơi ra vô vàn tinh thể cổ đại lấp lánh.',
    formationName: 'Đoàn Hộ Tống Hoàng Kim',
    formationDesc: 'Hàng ngang ma hạm áp sát nghiêm trang, xả mưa đạn hoàng kim xối xả.',
    rewardGold: 22000,
    rewardGems: 240,
    rewardShards: 11,
    backgroundTheme: {
      starColors: ['#fbbf24', '#fef08a', '#ffffff'],
      nebulaPrimary: 'rgba(251, 191, 36, 0.30)',
      nebulaSecondary: 'rgba(180, 83, 9, 0.24)',
      ambientHazard: 'solar_embers',
      hazardName: 'Cơn Mưa Vụn Vàng Hoàng Kim',
    },
    boss: {
      id: 'golden_sultan_7',
      name: 'Hoàng Kim Ma Thú Sultan',
      title: 'Bạo Chúa Ngai Vàng Hoàng Kim',
      shapeType: 'golden_sultan',
      hp: 4800,
      defense: 30,
      color: '#fbbf24',
      accentColor: '#d97706',
      specialAttack: 'Bắn chùm lông kiếm hoàng kim và triệu hồi mưa bom nén áp suất!',
      eggColor: '#fef08a',
      featherColor: '#f59e0b',
      dangerRating: 3,
    },
  },
  {
    id: 8,
    name: 'Vực Thẳm Không Gian Tối',
    galaxyName: 'Thiên Hà Mũ Rộng Sombrero M104',
    subLocation: 'Vùng Đứt Gãy Vật Chất Tối',
    description: 'Không gian tĩnh mịch chỉ có ánh mắt đỏ rực của bầy quái vật bóng tối. Đạn plasma đen của chúng hút ánh sáng tạo hố đen mini!',
    formationName: 'Đội Bay U Linh Ẩn Hiện',
    formationDesc: 'Bầy ma hạm thoắt ẩn thoắt hiện với quỹ đạo hư không khó đoán.',
    rewardGold: 25000,
    rewardGems: 260,
    rewardShards: 12,
    backgroundTheme: {
      starColors: ['#c084fc', '#e879f9', '#a855f7'],
      nebulaPrimary: 'rgba(192, 132, 252, 0.25)',
      nebulaSecondary: 'rgba(88, 28, 135, 0.22)',
      ambientHazard: 'void_rift',
      hazardName: 'Lỗ Hổng Trọng Lực Hư Vô',
    },
    boss: {
      id: 'void_phantom_8',
      name: 'Cổ Thần Hư Không Void',
      title: 'U Linh Ranh Giới Đa Chiều',
      shapeType: 'void_phantom',
      hp: 5600,
      defense: 26,
      color: '#c084fc',
      accentColor: '#9333ea',
      specialAttack: 'Dịch chuyển tức thời 3 điểm và mở xoáy hút vật chất tối nuốt chửng!',
      eggColor: '#e9d5ff',
      featherColor: '#6b21a8',
      dangerRating: 3,
    },
  },
  {
    id: 9,
    name: 'Rạn San Hô Vũ Trụ Tiên Nữ',
    galaxyName: 'Vòng Ngoài Thiên Hà Tiên Nữ',
    subLocation: 'Biển San Hô Phát Quang Sinh Học',
    description: 'Rạn san hô vũ trụ lung linh nhưng đầy cạm bẫy. Bầy quái vật xúc tu ngầm bơi lượn tựa dưới đáy vực thẳm sao trời!',
    formationName: 'Thủy Triều Ma Quái',
    formationDesc: 'Đội hình uốn lượn như đàn quái ngư vực sâu tránh đạn.',
    rewardGold: 28000,
    rewardGems: 280,
    rewardShards: 13,
    backgroundTheme: {
      starColors: ['#ec4899', '#2dd4bf', '#f472b6'],
      nebulaPrimary: 'rgba(236, 72, 153, 0.28)',
      nebulaSecondary: 'rgba(13, 148, 136, 0.20)',
      ambientHazard: 'cosmic_aurora',
      hazardName: 'Thủy Triều Hạt Phát Quang',
    },
    boss: {
      id: 'kraken_calamari_9',
      name: 'Hải Quái Vực Thẳm Kraken',
      title: 'Thủy Quái Xúc Tu Ma Vực 8 Đầu',
      shapeType: 'kraken_calamari',
      hp: 6500,
      defense: 28,
      color: '#ec4899',
      accentColor: '#06b6d4',
      specialAttack: 'Quất 8 xúc tu quét nửa màn hình và phun quả cầu mực độc làm mù radar!',
      eggColor: '#fbcfe8',
      featherColor: '#be185d',
      dangerRating: 3,
    },
  },
  {
    id: 10,
    name: 'Lốc Xoáy Bão Từ Gatling',
    galaxyName: 'Thiên Hà Chong Chóng Rực Lửa NGC 5457',
    subLocation: 'Hành Lang Đạn Đạo Trọng Liên',
    description: 'Tâm điểm của cuộc tổng tấn công đạn đạo! Cỗ máy Gatling 6 nòng nhả hàng vạn quả cầu plasma quái dị với tốc độ khủng khiếp!',
    formationName: 'Bão Lửa Đạn Đạo Tàn Sát',
    formationDesc: 'Từng đàn ma hạm liên tục xả đạn thẳng tạo màn đạn dày đặc.',
    rewardGold: 32000,
    rewardGems: 300,
    rewardShards: 14,
    backgroundTheme: {
      starColors: ['#f97316', '#fb923c', '#fdba74'],
      nebulaPrimary: 'rgba(249, 115, 22, 0.32)',
      nebulaSecondary: 'rgba(154, 52, 18, 0.25)',
      ambientHazard: 'egg_rain',
      hazardName: 'Bão Pháo Plasma Tự Do',
    },
    boss: {
      id: 'gatling_eggomatic_10',
      name: 'Cỗ Máy Hủy Diệt Gatling 3000',
      title: 'Pháo Đài Liên Thanh Bão Lửa Tối Thượng',
      shapeType: 'gatling_eggomatic',
      hp: 7500,
      defense: 35,
      color: '#f97316',
      accentColor: '#ef4444',
      specialAttack: 'Quay 2 nòng Gatling xoay tròn xả 120 quả cầu plasma cao tốc liên tục!',
      eggColor: '#fed7aa',
      featherColor: '#c2410c',
      dangerRating: 4,
    },
  },
  {
    id: 11,
    name: 'Núi Lửa Nham Thạch Magma',
    galaxyName: 'Thiên Hà Râu Mực Antennae Galaxies',
    subLocation: 'Lòng Chảo Núi Lửa Dung Nham',
    description: 'Hàng ngàn quả cầu lửa sôi sùng sục. Bầy viêm ma quái vật nung chảy vỏ tàu thành bom nổ nhiệt độ hàng triệu độ!',
    formationName: 'Phun Trào Nham Thạch Phân Tán',
    formationDesc: 'Bầy ma hạm từ dưới vọt lên rồi toả sang hai bên rải lửa thiêu rụi.',
    rewardGold: 35000,
    rewardGems: 320,
    rewardShards: 15,
    backgroundTheme: {
      starColors: ['#ef4444', '#f87171', '#fbbf24'],
      nebulaPrimary: 'rgba(239, 68, 68, 0.32)',
      nebulaSecondary: 'rgba(127, 29, 29, 0.28)',
      ambientHazard: 'solar_embers',
      hazardName: 'Mưa Tro Bụi Dung Nham',
    },
    boss: {
      id: 'magma_inferno_11',
      name: 'Viêm Ma Hỏa Ngục Behemoth',
      title: 'Bạo Chúa Lòng Chảo Dung Nham',
      shapeType: 'magma_inferno',
      hp: 8600,
      defense: 36,
      color: '#ef4444',
      accentColor: '#f97316',
      specialAttack: 'Ném đá nham thạch nổ bung thành 8 tia lửa tàn bạo thiêu đốt bầu trời!',
      eggColor: '#fca5a5',
      featherColor: '#991b1b',
      dangerRating: 4,
    },
  },
  {
    id: 12,
    name: 'Hệ Sao Kim Cương Đa Sắc',
    galaxyName: 'Hệ Tinh Vân Chiếc Nhẫn M57',
    subLocation: 'Hành Tinh Kim Cương Lăng Kính 55 Cancri',
    description: 'Bề mặt toàn kim cương phản chiếu ánh sáng lấp lánh 7 màu. Bầy quái vật ma tinh thể phản xạ đạn laser của phi thuyền!',
    formationName: 'Mặt Trời Tinh Thể Đa Cạnh',
    formationDesc: 'Đội hình bát giác hoàn mỹ phản xạ đạn ma quái đa chiều.',
    rewardGold: 38000,
    rewardGems: 350,
    rewardShards: 16,
    backgroundTheme: {
      starColors: ['#38bdf8', '#c084fc', '#f43f5e', '#fbbf24'],
      nebulaPrimary: 'rgba(56, 189, 248, 0.30)',
      nebulaSecondary: 'rgba(192, 132, 252, 0.22)',
      ambientHazard: 'ice_crystals',
      hazardName: 'Mảnh Vỡ Kim Cương Lơ Lửng',
    },
    boss: {
      id: 'prismatic_crystal_12',
      name: 'Quái Thú Lăng Kính Prismatic',
      title: 'Nữ Hoàng Kim Cương Đa Sắc Ma Thần',
      shapeType: 'prismatic_crystal',
      hp: 9800,
      defense: 40,
      color: '#38bdf8',
      accentColor: '#ec4899',
      specialAttack: 'Bắn chùm lăng kính quang phổ 7 màu quét toàn dải màn hình!',
      eggColor: '#e0f2fe',
      featherColor: '#67e8f9',
      dangerRating: 4,
    },
  },
  {
    id: 13,
    name: 'Khí Quyển Độc Dược Methane',
    galaxyName: 'Hệ Khí Sao Mộc Siêu Nặng HD 189733b',
    subLocation: 'Tầng Khí Quyển Axit Lưu Huỳnh',
    description: 'Những cơn gió rít 8.000 km/h mang theo mưa axit. Bầy quái vật độc dược bốc khói độc bao phủ mù mịt!',
    formationName: 'Vòi Rồng Lốc Xoáy Khí Độc',
    formationDesc: 'Quái hạm xoắn ốc hạ độ cao tạo luồng khí độc ép góc né.',
    rewardGold: 42000,
    rewardGems: 380,
    rewardShards: 17,
    backgroundTheme: {
      starColors: ['#84cc16', '#a3e635', '#bef264'],
      nebulaPrimary: 'rgba(132, 204, 22, 0.30)',
      nebulaSecondary: 'rgba(54, 83, 20, 0.24)',
      ambientHazard: 'cosmic_aurora',
      hazardName: 'Khói Khí Methane Độc Hại',
    },
    boss: {
      id: 'toxic_methane_13',
      name: 'Độc Thú Khí Methane Miasma',
      title: 'Quái Thú Khí Thải Sinh Học Tận Thế',
      shapeType: 'toxic_methane',
      hp: 11000,
      defense: 38,
      color: '#84cc16',
      accentColor: '#4d7c0f',
      specialAttack: 'Phun đám mây khí độc gây sát thương liên tục và bom nhớt axit!',
      eggColor: '#d9f99d',
      featherColor: '#65a30d',
      dangerRating: 4,
    },
  },
  {
    id: 14,
    name: 'Nút Giao Lượng Tử Phân Thân',
    galaxyName: 'Thiên Hà Mắt Mèo NGC 6543',
    subLocation: 'Giao Lộ Đa Chiều Lượng Tử',
    description: 'Nơi thời gian bị bẻ cong thành các dòng thực tại song song. Bầy quái vật lượng tử phân thân tạo ảo ảnh đánh lừa radar phi thuyền!',
    formationName: 'Ảo Ảnh Đối Xứng Gương',
    formationDesc: 'Hai nửa đội hình ma hạm chuyển động đối xứng qua trục tâm.',
    rewardGold: 46000,
    rewardGems: 400,
    rewardShards: 18,
    backgroundTheme: {
      starColors: ['#06b6d4', '#10b981', '#34d399'],
      nebulaPrimary: 'rgba(6, 182, 212, 0.28)',
      nebulaSecondary: 'rgba(16, 185, 129, 0.24)',
      ambientHazard: 'void_rift',
      hazardName: 'Vòng Lặp Thời Gian Lượng Tử',
    },
    boss: {
      id: 'chronos_multi_14',
      name: 'Dị Quái Thời Gian Chronos',
      title: 'Bậc Thầy Phân Thân Đa Chiều',
      shapeType: 'chronos_multi',
      hp: 12500,
      defense: 42,
      color: '#06b6d4',
      accentColor: '#10b981',
      specialAttack: 'Tách làm 2 phân thân mini-boss bắn đạn plasma chéo nhau!',
      eggColor: '#a5f3fc',
      featherColor: '#0891b2',
      dangerRating: 4,
    },
  },
  {
    id: 15,
    name: 'Nghĩa Địa Chiến Hạm Cổ Điển',
    galaxyName: 'Cụm Thiên Hà Xử Nữ Virgo Cluster',
    subLocation: 'Bãi Phế Liệu Chiến Tranh Cổ',
    description: 'Xác hàng vạn chiến hạm khổng lồ trôi dạt. Bầy quái vật bọc thép dung hợp pháo hạm cổ tạo thành pháo đài thép di động.',
    formationName: 'Hàng Rào Thiết Hạm Thép',
    formationDesc: 'Từng bức tường ma hạm kiên cố tiến thẳng xuống như máy ủi.',
    rewardGold: 50000,
    rewardGems: 420,
    rewardShards: 20,
    backgroundTheme: {
      starColors: ['#94a3b8', '#cbd5e1', '#e2e8f0'],
      nebulaPrimary: 'rgba(148, 163, 184, 0.25)',
      nebulaSecondary: 'rgba(51, 65, 85, 0.30)',
      ambientHazard: 'asteroid_fall',
      hazardName: 'Mảnh Vỡ Vỏ Tàu Kim Loại',
    },
    boss: {
      id: 'dreadnought_hen_15',
      name: 'Thiết Hạm Quái Thú Thao Thiết',
      title: 'Pháo Đài Kim Loại Thép Dreadnought',
      shapeType: 'dreadnought_hen',
      hp: 14500,
      defense: 48,
      color: '#94a3b8',
      accentColor: '#f59e0b',
      specialAttack: 'Bắn 4 quả ngư lôi plasma phá giáp và kích hoạt khiên thép bất hoại!',
      eggColor: '#e2e8f0',
      featherColor: '#475569',
      dangerRating: 5,
    },
  },
  {
    id: 16,
    name: 'Thung Lũng Tàu Đắm Cyborg',
    galaxyName: 'Dải Bụi Tối Tinh Vân Đầu Ngựa',
    subLocation: 'Căn Cứ Tái Chế Phế Liệu Quái Thú',
    description: 'Những quái vật được cải tạo nửa máy nửa sinh học kinh dị với cánh quạt phản lực và mỏ hàn plasma nóng rực.',
    formationName: 'Lưỡi Cưa Xoay Tử Thần',
    formationDesc: 'Đội hình ma quái xếp hình lưỡi cưa xoay cắt ngang màn hình.',
    rewardGold: 55000,
    rewardGems: 450,
    rewardShards: 22,
    backgroundTheme: {
      starColors: ['#ea580c', '#f97316', '#78716c'],
      nebulaPrimary: 'rgba(234, 88, 12, 0.28)',
      nebulaSecondary: 'rgba(68, 64, 60, 0.32)',
      ambientHazard: 'magnetic_sparks',
      hazardName: 'Mạt Sắt Rỉ Sét Bay Tự Do',
    },
    boss: {
      id: 'cyborg_scrappy_16',
      name: 'Đao Phủ Hài Cốt Scrappy Cyborg',
      title: 'Đao Phủ Bãi Rác Bán Cơ Khí Kinh Dị',
      shapeType: 'cyborg_scrappy',
      hp: 17000,
      defense: 50,
      color: '#ea580c',
      accentColor: '#ef4444',
      specialAttack: 'Bắn đĩa cưa xoay dội lại từ vách màn hình cắt nát chiến cơ!',
      eggColor: '#fed7aa',
      featherColor: '#9a3412',
      dangerRating: 5,
    },
  },
  {
    id: 17,
    name: 'Hải Đăng Sao Xung Siêu Tốc',
    galaxyName: 'Vườn Sao Xung Crab Pulsar M1',
    subLocation: 'Tháp Hải Đăng Chiếu Xạ Thiên Hà',
    description: 'Một sao xung quay 30 vòng mỗi giây phát ra chùm tia năng lượng cực đại. Bầy quái hạm bay đồng bộ theo nhịp chớp tử thần!',
    formationName: 'Nhịp Điệu Đèn Hải Đăng Ma Quái',
    formationDesc: 'Chiến tàu quái vật bay ziczac giật cục theo từng nhịp chớp đèn.',
    rewardGold: 60000,
    rewardGems: 480,
    rewardShards: 24,
    backgroundTheme: {
      starColors: ['#38bdf8', '#818cf8', '#ffffff'],
      nebulaPrimary: 'rgba(56, 189, 248, 0.32)',
      nebulaSecondary: 'rgba(99, 102, 241, 0.26)',
      ambientHazard: 'magnetic_sparks',
      hazardName: 'Tia Chiếu Xạ Sao Xung Chu Kỳ',
    },
    boss: {
      id: 'strobe_beacon_17',
      name: 'Quái Thú Hải Đăng 360° Pulsar',
      title: 'Thủ Hộ Hải Đăng Bão Ánh Sáng Hủy Diệt',
      shapeType: 'strobe_beacon',
      hp: 20000,
      defense: 52,
      color: '#38bdf8',
      accentColor: '#818cf8',
      specialAttack: 'Quét chùm laser ngọn hải đăng quay 360 độ liên tục buộc phải né vòng!',
      eggColor: '#bae6fd',
      featherColor: '#4f46e5',
      dangerRating: 5,
    },
  },
  {
    id: 18,
    name: 'Cặp Sao Quasar Song Sinh',
    galaxyName: 'Hệ Lỗ Đen Nhị Phân Cygnus X-1',
    subLocation: 'Vùng Xoáy Trọng Lực Kép',
    description: 'Hai hố đen siêu nặng hút lẫn nhau tạo hai dòng xoáy lửa và băng. Đội quân ma thú phân hóa làm hai phe tương khắc!',
    formationName: 'Vũ Điệu Nhị Quả Âm Dương',
    formationDesc: 'Hai tốp quái hạm lượn vòng quanh nhau tạo liên kết năng lượng hủy diệt.',
    rewardGold: 65000,
    rewardGems: 500,
    rewardShards: 26,
    backgroundTheme: {
      starColors: ['#38bdf8', '#f97316', '#ffffff'],
      nebulaPrimary: 'rgba(56, 189, 248, 0.28)',
      nebulaSecondary: 'rgba(249, 115, 22, 0.28)',
      ambientHazard: 'void_rift',
      hazardName: 'Sóng Hấp Dẫn Nhị Phân',
    },
    boss: {
      id: 'binary_twin_18',
      name: 'Song Sát Nhị Thể Âm Dương',
      title: 'Cặp Đôi Hắc Bạch Song Sát Kinh Dị',
      shapeType: 'binary_twin',
      hp: 23500,
      defense: 54,
      color: '#38bdf8',
      accentColor: '#f97316',
      specialAttack: 'Hai quái thú nối với nhau bằng dây cáp laser tử thần, quay tròn càn quét!',
      eggColor: '#fed7aa',
      featherColor: '#0284c7',
      dangerRating: 5,
    },
  },
  {
    id: 19,
    name: 'Vách Ngăn Vực Sâu Boötes Void',
    galaxyName: 'Vực Thẳm Boötes Void',
    subLocation: 'Cổng Thành Phòng Ngự Hư Không',
    description: 'Hàng rào phòng ngự cuối cùng trước Hoàng Cung Quái Vật. Tướng quân ma quái điều phối pháo dàn trận địa dầy đặc như nêm!',
    formationName: 'Hàng Bát Quái Thiết Giáp Ma Thú',
    formationDesc: 'Đội hình cận vệ quái vật vây bọc không chừa kẽ hở.',
    rewardGold: 75000,
    rewardGems: 600,
    rewardShards: 30,
    backgroundTheme: {
      starColors: ['#f43f5e', '#a855f7', '#fbbf24'],
      nebulaPrimary: 'rgba(244, 63, 94, 0.32)',
      nebulaSecondary: 'rgba(168, 85, 247, 0.28)',
      ambientHazard: 'egg_rain',
      hazardName: 'Mưa Bom Từ Trường Chiến Trường',
    },
    boss: {
      id: 'imperial_general_19',
      name: 'Đại Thần Tướng Ma Quái Boötes',
      title: 'Tổng Tư Lệnh Quân Đoàn Ma Thú Thống Nhất',
      shapeType: 'imperial_general',
      hp: 28000,
      defense: 58,
      color: '#f43f5e',
      accentColor: '#fbbf24',
      specialAttack: 'Gọi oanh tạc cơ rải thảm bom plasma toàn màn hình và bắn đại bác 100mm!',
      eggColor: '#fda4af',
      featherColor: '#b91c1c',
      dangerRating: 5,
    },
  },
  {
    id: 20,
    name: 'Hoàng Cung Hạm Đội Tối Thượng',
    galaxyName: 'Trái Tim Đa Vũ Trụ Siêu Khởi Nguyên',
    subLocation: 'Ngai Vàng Hư Không Tối Thượng',
    description: 'Trận chiến định đoạt số phận ngân hà! ĐẠI THIẾT HẠM VUA VŨ TRỤ SUPREME OVERLORD đích thân giáng lâm trên ngai vàng hư không, giải phóng hỏa lực tối thượng!',
    formationName: 'Vạn Hạm Quy Tâm · Đại Hỗn Chiến',
    formationDesc: 'Toàn bộ chủng loại chiến hạm hắc ám đồng loạt xuất trận bảo vệ Soái Hạm!',
    rewardGold: 100000,
    rewardGems: 1000,
    rewardShards: 50,
    backgroundTheme: {
      starColors: ['#fbbf24', '#f43f5e', '#a855f7', '#38bdf8', '#ffffff'],
      nebulaPrimary: 'rgba(251, 191, 36, 0.38)',
      nebulaSecondary: 'rgba(244, 63, 94, 0.32)',
      ambientHazard: 'cosmic_aurora',
      hazardName: 'Bão Năng Lượng Vũ Trụ Tối Thượng',
    },
    boss: {
      id: 'supreme_emperor_20',
      name: 'ĐẠI THIẾT HẠM VUA VŨ TRỤ',
      title: 'Soái Hạm Tối Thượng Thống Trị Vũ Trụ',
      shapeType: 'supreme_emperor',
      hp: 36000,
      defense: 65,
      color: '#fbbf24',
      accentColor: '#ef4444',
      specialAttack: 'Tam giai đoạn: Bắn chùm Vương Miện Laser, Triệu hồi Mưa Plasma Siêu Tân Tinh và Pháo Hư Không Hủy Diệt Vũ Trụ!',
      eggColor: '#fef08a',
      featherColor: '#b45309',
      dangerRating: 5,
    },
  },
];

/**
 * Initializes persistent adventure progress with Stage 1 unlocked.
 */
export function getInitialAdventureProgress(): AdventureProgress {
  return {
    unlockedStages: [1],
    completedStages: [],
    stageStars: {},
    stageHighScores: {},
    totalStars: 0,
    claimedMilestones: [],
  };
}

/**
 * Calculates 1 to 3 stars rating based on victory parameters:
 * 1 Star: Clear stage
 * 2 Stars: HP remaining >= 50%
 * 3 Stars: HP remaining >= 80% AND 0 revives used
 */
export function calculateStageStars(hpRemainingRatio: number, revivesUsed: number): number {
  if (revivesUsed === 0 && hpRemainingRatio >= 0.8) {
    return 3;
  }
  if (hpRemainingRatio >= 0.5) {
    return 2;
  }
  return 1;
}

/**
 * Retrieves an adventure stage by its sequential ID (1 to 20).
 */
export function getAdventureStageById(stageId: number): AdventureStage {
  const found = ADVENTURE_STAGES.find((s) => s.id === stageId);
  return found || ADVENTURE_STAGES[0];
}

/**
 * Updates adventure progress after successfully clearing a stage.
 */
export function completeAdventureStage(
  prevProgress: AdventureProgress,
  stageId: number,
  score: number,
  hpRemainingRatio: number,
  revivesUsed: number
): {
  nextProgress: AdventureProgress;
  starsEarned: number;
  firstClear: boolean;
  rewardGold: number;
  rewardGems: number;
  rewardShards: number;
} {
  const stage = getAdventureStageById(stageId);
  const firstClear = !prevProgress.completedStages.includes(stageId);
  const starsEarned = calculateStageStars(hpRemainingRatio, revivesUsed);

  const prevBestStars = prevProgress.stageStars[stageId] || 0;
  const bestStars = Math.max(prevBestStars, starsEarned);

  const completedStages = firstClear
    ? [...prevProgress.completedStages, stageId]
    : prevProgress.completedStages;

  // Unlock next stage (up to 20)
  const nextStageId = stageId + 1;
  const unlockedStages =
    nextStageId <= 20 && !prevProgress.unlockedStages.includes(nextStageId)
      ? [...prevProgress.unlockedStages, nextStageId]
      : prevProgress.unlockedStages;

  const stageStars = {
    ...prevProgress.stageStars,
    [stageId]: bestStars,
  };

  const prevHighScore = prevProgress.stageHighScores[stageId] || 0;
  const stageHighScores = {
    ...prevProgress.stageHighScores,
    [stageId]: Math.max(prevHighScore, score),
  };

  const totalStars = Object.values(stageStars).reduce((sum, s) => sum + s, 0);

  // Rewards: Full rewards on first clear, 30% repeatable replay rewards
  const rewardMult = firstClear ? 1.0 : 0.35;
  const rewardGold = Math.round(stage.rewardGold * rewardMult);
  const rewardGems = firstClear ? stage.rewardGems : 0;
  const rewardShards = firstClear ? stage.rewardShards : 0;

  return {
    nextProgress: {
      unlockedStages,
      completedStages,
      stageStars,
      stageHighScores,
      totalStars,
      claimedMilestones: prevProgress.claimedMilestones,
    },
    starsEarned,
    firstClear,
    rewardGold,
    rewardGems,
    rewardShards,
  };
}
