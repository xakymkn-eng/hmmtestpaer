/**
 * Pure game rules, physics calculations, and scoring logic
 * Decoupled from React and DOM for deterministic testing.
 */

export type FighterTier = 'B' | 'A' | 'S';

export interface FighterStats {
  id: string;
  name: string;
  vietnameseName: string;
  tagline: string;
  tier: FighterTier;
  maxHp: number;
  maxArmor: number;
  speed: number;
  fireRate: number; // shots per second
  bulletDamage: number;
  bulletMechanic: string;
  skillName: string;
  skillDescription: string;
  skillCooldown: number; // seconds
  color: string;
  accentColor: string;
  unlockedByDefault?: boolean;
  defense: number; // Phòng thủ: giảm sát thương nhận vào
  armorPen: number; // Xuyên giáp %
  trueDamage: number; // Sát thương chuẩn
  critRate: number; // Tỉ lệ bạo kích %
  critDamage: number; // Sát thương bạo kích %
  dodgeChance: number; // Khả năng né tránh %
}

export const FIGHTERS: Record<string, FighterStats> = {
  // --- TIER S (Bậc S - Huyền Thoại Vũ Trụ: Tỉ Lệ 1%) ---
  rts_88: {
    id: 'rts_88',
    name: 'RTS-88 Lightning',
    vietnameseName: 'RTS-88 : Tia Chớp',
    tagline: 'Chiến cơ lôi đình tối thượng · Tia sét giật lan 70% xuyên 40% giáp & Khiên sấm sét 300 HP +80% ST',
    tier: 'S',
    maxHp: 38,
    maxArmor: 64,
    speed: 520, // Tốc độ bay: cực nhanh
    fireRate: 10, // Mỗi 0.1 giây (10 đợt / giây)
    bulletDamage: 22, // Gây 22 sát thương mỗi 0.1 giây
    bulletMechanic: 'Bắn ra 1 đường tia sấm sét tẹt vào kẻ địch gây 22 sát thương cho mỗi 0.1 giây; nếu có kẻ địch xung quanh tia sét sẽ lan ra kẻ địch xung quanh và gây sát thương bằng 70% sát thương gốc; sát thương gây ra sẽ xuyên qua 40% giáp và phòng thủ của kẻ địch',
    skillName: 'Khiên Sấm Sét Quá Tải',
    skillDescription: 'Khi dùng skill sẽ tạo ra 1 tấm khiên sấm sét có hiệu ứng tia sét và duy trì 10 giây, tấm khiên này sẽ có 300 điểm máu, khi có khiên bảo vệ sát thương gây ra của máy bay sẽ tăng 80% duy trì trong 10 giây cùng với khiên. Thời gian hồi: 18 giây.',
    skillCooldown: 18,
    color: '#00f0ff',
    accentColor: '#facc15',
    unlockedByDefault: false,
    defense: 14,
    armorPen: 40,
    trueDamage: 12,
    critRate: 16,
    critDamage: 160,
    dodgeChance: 18,
  },
  arc_tempest: {
    id: 'arc_tempest',
    name: 'LX-88 Arc Tempest',
    vietnameseName: 'LX-88 Lôi Quang Tiên Phong',
    tagline: 'Chiến cơ lôi quang tiên phong · Tia laser năng lượng bắn thẳng tắp bám theo phi cơ (không nghiêng, không lắc) · Mỗi 0.1s gây 12 ST · Skill: Tê liệt 6s, +80% ST, +60% Xuyên Giáp & +15 ST Chuẩn',
    tier: 'S',
    maxHp: 40, // Máu giảm xuống còn 40
    maxArmor: 150, // Giáp tăng lên 150
    speed: 490,
    fireRate: 10, // mỗi 0.1 giây gây 12 sát thương (10 đợt / giây)
    bulletDamage: 12, // 12 sát thương mỗi 0.1s
    bulletMechanic: 'Bắn ra tia laser năng lượng cao bắn thẳng tắp bám sát theo vị trí máy bay (hoàn toàn không lắc lư hay nghiêng theo hướng bay), mỗi 0.1 giây gây 12 sát thương cực mạnh lên mục tiêu',
    skillName: 'Lôi Đình Tê Liệt Toàn Cầu',
    skillDescription: 'Khi dùng skill kẻ địch bị tê liệt trong 6 giây đồng thời LX-88 nhận tăng 80% sát thương và 60% xuyên giáp +15 sát thương chuẩn trong 6 giây. Thời gian hồi: 16 giây.',
    skillCooldown: 16,
    color: '#00f2fe',
    accentColor: '#38bdf8',
    unlockedByDefault: false,
    defense: 8,
    armorPen: 25,
    trueDamage: 12,
    critRate: 18,
    critDamage: 175,
    dodgeChance: 20,
  },
  astraea: {
    id: 'astraea',
    name: 'SX-77 Astraea Starfire',
    vietnameseName: 'SX-77 Tinh Tú Tiên Phong',
    tagline: 'Chiến cơ ánh sao vũ trụ · Đạn ngôi sao phân tách 5 nhánh & Siêu tinh cầu hủy diệt',
    tier: 'S',
    maxHp: 90,
    maxArmor: 30,
    speed: 430, // nhanh
    fireRate: 8.5, // trung
    bulletDamage: 60, // Giảm 60% từ 150 -> 60 theo yêu cầu
    bulletMechanic: 'Bắn đạn ngôi sao 60 sát thương (đã giảm 60%), khi trúng mục tiêu toả 5 ngôi sao nhỏ theo 5 góc gây 24 sát thương',
    skillName: 'Siêu Tinh Cầu Hủy Diệt',
    skillDescription: 'Bắn ngôi sao to bay chậm trúng mục tiêu gây 300 sát thương và toả ra 5 ngôi sao tầm trung, sau đó trúng mục tiêu toả ra 5 ngôi sao nhỏ gây thêm 50 sát thương và làm choáng trong 1 giây, nổ lan diện rộng kèm âm thanh đặc trưng',
    skillCooldown: 16,
    color: '#fbbf24', // Star Gold
    accentColor: '#38bdf8', // Astral Cyan
    unlockedByDefault: false,
    defense: 12,
    armorPen: 25,
    trueDamage: 25,
    critRate: 20,
    critDamage: 180,
    dodgeChance: 16,
  },
  solaris: {
    id: 'solaris',
    name: 'ZX-99 Solaris',
    vietnameseName: 'ZX-99 Thái Dương',
    tagline: 'Chiến hạm bức xạ mặt trời · Cầu lửa nhiệt hạch thiêu đốt',
    tier: 'S',
    maxHp: 120,
    maxArmor: 60,
    speed: 400,
    fireRate: 9,
    bulletDamage: 45,
    bulletMechanic: 'Cầu nhiệt hạch bốc cháy nổ lan 45px và chém sóng lửa hai bên',
    skillName: 'Bộc Phá Thái Dương',
    skillDescription: 'Chiếu trụ năng lượng mặt trời khổng lồ quét sạch màn hình và bất tử 3 giây',
    skillCooldown: 16,
    color: '#eab308', // Solar Gold
    accentColor: '#fde047',
    unlockedByDefault: false,
    defense: 18,
    armorPen: 20,
    trueDamage: 20,
    critRate: 15,
    critDamage: 175,
    dodgeChance: 10,
  },
  chrono: {
    id: 'chrono',
    name: 'TX-0 Chrono',
    vietnameseName: 'TX-0 Kỷ Nguyên',
    tagline: 'Bộ gia tốc thời gian · Đạn lượng tử xuyên thấu bạo kích x2.5',
    tier: 'S',
    maxHp: 90,
    maxArmor: 50,
    speed: 440,
    fireRate: 12,
    bulletDamage: 38,
    bulletMechanic: 'Đạn hạt Tachyon dịch chuyển tức thời, tốc độ siêu thanh bạo kích x2.5',
    skillName: 'Ngưng Đọng Thời Gian',
    skillDescription: 'Kích hoạt Matrix Bullet-Time: Toàn bộ địch và đạn chậm 85% trong 5 giây',
    skillCooldown: 18,
    color: '#10b981', // Emerald Quantum
    accentColor: '#34d399',
    unlockedByDefault: false,
    defense: 8,
    armorPen: 35,
    trueDamage: 15,
    critRate: 30,
    critDamage: 250,
    dodgeChance: 22,
  },
  apocalypse: {
    id: 'apocalypse',
    name: 'EX-Omega Apocalypse',
    vietnameseName: 'EX-Omega Tận Thế',
    tagline: 'Chiến thần phản vật chất tối thượng · Đại bác hủy diệt diện rộng',
    tier: 'S',
    maxHp: 130,
    maxArmor: 70,
    speed: 380,
    fireRate: 8,
    bulletDamage: 55,
    bulletMechanic: 'Song pháo hạt phản vật chất phát nổ chấn động kèm chùm vi tên lửa đỏ',
    skillName: 'Tận Thế Khởi Nguyên',
    skillDescription: 'Phóng 12 đầu đạn phản vật chất truy kích và kích hoạt sóng hủy diệt toàn bản đồ',
    skillCooldown: 20,
    color: '#ef4444', // Red-Gold Overlord
    accentColor: '#fb7185',
    unlockedByDefault: false,
    defense: 25,
    armorPen: 30,
    trueDamage: 30,
    critRate: 18,
    critDamage: 200,
    dodgeChance: 8,
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'VX-1 Valkyrie',
    vietnameseName: 'VX-1 Nữ Thần Chiến Thắng',
    tagline: 'Chiến cơ thánh quang hộ mệnh · Ngọn giáo ánh sáng & bão tên lửa quang tử',
    tier: 'S',
    maxHp: 110,
    maxArmor: 55,
    speed: 420,
    fireRate: 10,
    bulletDamage: 48,
    bulletMechanic: 'Bắn thánh lăng ánh sáng xuyên giáp kèm loạt 8 tên lửa thánh quang tầm nhiệt',
    skillName: 'Phán Quyết Thiên Giới',
    skillDescription: 'Tạo vầng hào quang thánh diệt, hồi 25 HP và giải phóng 20 tia thánh quang quét sạch địch',
    skillCooldown: 17,
    color: '#38bdf8', // Radiant Sky
    accentColor: '#f0fdf4',
    unlockedByDefault: false,
    defense: 16,
    armorPen: 25,
    trueDamage: 18,
    critRate: 20,
    critDamage: 190,
    dodgeChance: 15,
  },
  nebula_sovereign: {
    id: 'nebula_sovereign',
    name: 'SX-99 Nebula Sovereign',
    vietnameseName: 'SX-99 Bá Chủ Tinh Vân',
    tagline: 'Soái hạm hạm đội thiên hà · Hạt Pulsar & vi lỗ đen hấp dẫn',
    tier: 'S',
    maxHp: 120,
    maxArmor: 65,
    speed: 370,
    fireRate: 8.5,
    bulletDamage: 52,
    bulletMechanic: 'Phóng quả cầu Pulsar xoáy tỏa tia vũ trụ, hút kẻ địch và phát nổ siêu tân tinh',
    skillName: 'Sụp Đổ Thiên Hà',
    skillDescription: 'Mở hố đen siêu trọng lực tại trung tâm tiêu diệt toàn bộ tàu địch và biến thành đá quý',
    skillCooldown: 22,
    color: '#a855f7', // Nebula Purple
    accentColor: '#c084fc',
    unlockedByDefault: false,
    defense: 20,
    armorPen: 22,
    trueDamage: 25,
    critRate: 16,
    critDamage: 185,
    dodgeChance: 10,
  },
  ouroboros: {
    id: 'ouroboros',
    name: 'OX-88 Ouroboros Eclipse',
    vietnameseName: 'OX-88 Hắc Long Vô Tận',
    tagline: 'Long cơ hư không tối thượng · Hỏa long xuyên giáp 35% & Hấp thụ Long Châu',
    tier: 'S',
    maxHp: 115,
    maxArmor: 60,
    speed: 410,
    fireRate: 9.5,
    bulletDamage: 54,
    bulletMechanic: 'Bắn tia Long Hỏa Hư Không uốn lượn xuyên giáp 35%, khi tiêu diệt địch sinh ra Long Châu hồi giáp và tăng sát thương',
    skillName: 'Hắc Long Giáng Thế',
    skillDescription: 'Triệu hồi Rồng Hư Không khổng lồ uốn lượn quét sạch màn hình, thiêu rụi toàn bộ đạn địch và bất tử 4 giây',
    skillCooldown: 18,
    color: '#10b981', // Emerald Dragon
    accentColor: '#34d399',
    unlockedByDefault: false,
    defense: 22,
    armorPen: 35,
    trueDamage: 28,
    critRate: 22,
    critDamage: 200,
    dodgeChance: 14,
  },
  quasar_titan: {
    id: 'quasar_titan',
    name: 'QX-99 Quasar Sovereign',
    vietnameseName: 'QX-99 Siêu Chuẩn Tinh Thể',
    tagline: 'Lõi phản ứng Quasar · Chùm tia Gamma cực quang & Vùng nổ bức xạ liên tục',
    tier: 'S',
    maxHp: 135,
    maxArmor: 75,
    speed: 375,
    fireRate: 8.5,
    bulletDamage: 58,
    bulletMechanic: 'Chùm tia Gamma nén cực đại tạo vùng bức xạ hủy diệt duy trì 1.5 giây lên mọi kẻ địch đi qua',
    skillName: 'Bão Bức Xạ Gamma',
    skillDescription: 'Kích hoạt vụ nổ Quasar cực quang toàn bản đồ, gây 400 sát thương chuẩn và biến 100% đạn địch thành ngọc thưởng',
    skillCooldown: 20,
    color: '#f59e0b', // Amber Flare
    accentColor: '#fbbf24',
    unlockedByDefault: false,
    defense: 26,
    armorPen: 28,
    trueDamage: 32,
    critRate: 18,
    critDamage: 210,
    dodgeChance: 8,
  },
  chronos_phantom: {
    id: 'chronos_phantom',
    name: 'ZX-00 Chronos Phantom',
    vietnameseName: 'ZX-00 Ảo Ảnh Vượt Thời Gian',
    tagline: 'Công nghệ gập không gian · Đạn lỗ giun nhị phân bạo kích x2.8 & Phân thân lượng tử',
    tier: 'S',
    maxHp: 100,
    maxArmor: 55,
    speed: 450,
    fireRate: 11,
    bulletDamage: 46,
    bulletMechanic: 'Bắn cặp đạn lỗ giun nhị phân gập cong không gian tìm điểm yếu mục tiêu với 35% Bạo Kích x2.8',
    skillName: 'Nghịch Đảo Không Gian',
    skillDescription: 'Tức thời né mọi đòn đánh, triệu hồi 3 bản sao thời gian cùng xả bão đạn lượng tử hủy diệt trong 4.5 giây',
    skillCooldown: 17,
    color: '#06b6d4', // Temporal Cyan
    accentColor: '#67e8f9',
    unlockedByDefault: false,
    defense: 14,
    armorPen: 32,
    trueDamage: 22,
    critRate: 35,
    critDamage: 280,
    dodgeChance: 25,
  },

  // --- TIER A (Bậc A - Đặc Nhiệm Tinh Anh: Tỉ Lệ 10%) ---
  aurora: {
    id: 'aurora',
    name: 'RX-7 Aurora',
    vietnameseName: 'RX-7 Hừng Đông',
    tagline: 'Chiến cơ băng hàn Cryo · Đạn tinh thể làm chậm 40%',
    tier: 'A',
    maxHp: 100,
    maxArmor: 45,
    speed: 390,
    fireRate: 9,
    bulletDamage: 28,
    bulletMechanic: 'Bắn mảnh băng tinh thể cực lạnh làm chậm kẻ địch và phát nổ băng đá',
    skillName: 'Bão Tuyết Tuyệt Đối',
    skillDescription: 'Đóng băng toàn bộ đạn địch trên màn hình thành tinh thể băng tan biến',
    skillCooldown: 13,
    color: '#38bdf8', // Ice Blue
    accentColor: '#7dd3fc',
    unlockedByDefault: false,
    defense: 12,
    armorPen: 15,
    trueDamage: 10,
    critRate: 14,
    critDamage: 165,
    dodgeChance: 12,
  },
  vortex: {
    id: 'vortex',
    name: 'NX-12 Vortex',
    vietnameseName: 'NX-12 Xoáy Hư Không',
    tagline: 'Hệ thống lực trường lượng tử · Đạn xoáy hút kẻ thù',
    tier: 'A',
    maxHp: 100,
    maxArmor: 50,
    speed: 360,
    fireRate: 7.5,
    bulletDamage: 34,
    bulletMechanic: 'Phóng cầu xoáy trọng lực hút kẻ địch yếu vào tâm nổ',
    skillName: 'Hố Đen Hút Đạn',
    skillDescription: 'Mở lỗ sâu không gian hút sạch đạn địch và chuyển thành điểm tích lũy',
    skillCooldown: 15,
    color: '#8b5cf6', // Violet
    accentColor: '#a78bfa',
    unlockedByDefault: false,
    defense: 15,
    armorPen: 18,
    trueDamage: 12,
    critRate: 12,
    critDamage: 160,
    dodgeChance: 10,
  },
  mirage: {
    id: 'mirage',
    name: 'SX-3 Mirage',
    vietnameseName: 'SX-3 Ảo Ảnh Song Hành',
    tagline: 'Công nghệ phân thân quang học · Bắn đạn đan chéo góc 30°',
    tier: 'A',
    maxHp: 90,
    maxArmor: 40,
    speed: 430,
    fireRate: 11,
    bulletDamage: 24,
    bulletMechanic: '2 bóng ảo ảnh hai bên bắn đạn đan chéo tạo lưới lửa tiêu diệt mục tiêu',
    skillName: 'Tam Thân Phân Ảnh',
    skillDescription: 'Tạo 2 phân thân thật bay yểm trợ thu hút hỏa lực và xả đạn cùng lúc trong 5 giây',
    skillCooldown: 12,
    color: '#ec4899', // Hot Pink
    accentColor: '#f472b6',
    unlockedByDefault: false,
    defense: 6,
    armorPen: 15,
    trueDamage: 8,
    critRate: 20,
    critDamage: 180,
    dodgeChance: 25,
  },
  thunderbolt: {
    id: 'thunderbolt',
    name: 'LX-7 Thunderbolt',
    vietnameseName: 'LX-7 Lôi Thần',
    tagline: 'Súng trường hồ quang cao thế · Sấm sét giật chuyền 4 mục tiêu',
    tier: 'A',
    maxHp: 105,
    maxArmor: 45,
    speed: 410,
    fireRate: 9.5,
    bulletDamage: 30,
    bulletMechanic: 'Bắn tia chớp cao áp giật lan qua nhiều kẻ địch liên tiếp trong chớp mắt',
    skillName: 'Bão Điện Từ Bất Tận',
    skillDescription: 'Kích hoạt trường điện trường 360 độ giật sét liên tục vào mọi kẻ địch xung quanh',
    skillCooldown: 14,
    color: '#06b6d4', // Electric Cyan
    accentColor: '#67e8f9',
    unlockedByDefault: false,
    defense: 10,
    armorPen: 20,
    trueDamage: 15,
    critRate: 16,
    critDamage: 170,
    dodgeChance: 14,
  },
  plasma_reaper: {
    id: 'plasma_reaper',
    name: 'KX-5 Plasma Reaper',
    vietnameseName: 'KX-5 Lưỡi Hái Plasma',
    tagline: 'Vũ khí cận chiến tầm xa · Đĩa cưa năng lượng cắt xuyên giáp',
    tier: 'A',
    maxHp: 105,
    maxArmor: 45,
    speed: 380,
    fireRate: 8,
    bulletDamage: 36,
    bulletMechanic: 'Bắn các đĩa cưa năng lượng quay tít với tốc độ kinh hoàng xé rách mọi chướng ngại',
    skillName: 'Vũ Điệu Lưỡi Hái',
    skillDescription: 'Xoay tròn 4 đĩa cưa khổng lồ quanh thân tàu chém nát kẻ địch áp sát',
    skillCooldown: 13,
    color: '#f43f5e', // Crimson Rose
    accentColor: '#fb7185',
    unlockedByDefault: false,
    defense: 12,
    armorPen: 28,
    trueDamage: 18,
    critRate: 18,
    critDamage: 185,
    dodgeChance: 11,
  },
  tempest: {
    id: 'tempest',
    name: 'WX-4 Tempest',
    vietnameseName: 'WX-4 Cuồng Phong',
    tagline: 'Pháo siêu âm dao động · Sóng chấn động hình sin quét màn hình',
    tier: 'A',
    maxHp: 95,
    maxArmor: 40,
    speed: 420,
    fireRate: 10,
    bulletDamage: 26,
    bulletMechanic: 'Sóng xung kích hình sin dao động tần số cao đẩy lùi đạn và quét sạch không phận',
    skillName: 'Lốc Xoáy Vũ Trụ',
    skillDescription: 'Tạo cơn lốc xoáy năng lượng khổng lồ cuốn phăng toàn bộ máy bay địch nhỏ',
    skillCooldown: 14,
    color: '#14b8a6', // Teal Tempest
    accentColor: '#2dd4bf',
    unlockedByDefault: false,
    defense: 8,
    armorPen: 16,
    trueDamage: 10,
    critRate: 15,
    critDamage: 165,
    dodgeChance: 18,
  },
  nanite_swarm: {
    id: 'nanite_swarm',
    name: 'NX-66 Nanite Swarm',
    vietnameseName: 'NX-66 Bầy Bọ Cơ Khí',
    tagline: 'Công nghệ sinh học vi mô · Bầy Nanite ăn mòn giáp & Tự nhân bản',
    tier: 'A',
    maxHp: 105,
    maxArmor: 45,
    speed: 400,
    fireRate: 10.5,
    bulletDamage: 32,
    bulletMechanic: 'Phóng bầy bọ Nanite bám chặt vào kẻ địch ăn mòn 30% giáp và tự nhân bản sang mục tiêu kế cận',
    skillName: 'Bão Bọ Ăn Mòn',
    skillDescription: 'Kích nổ bầy Nanite cực đại, chuyển hóa 30% sát thương gây ra thành Máu và Giáp sửa chữa chiến cơ',
    skillCooldown: 14,
    color: '#84cc16', // Lime Nanite
    accentColor: '#a3e635',
    unlockedByDefault: false,
    defense: 14,
    armorPen: 30,
    trueDamage: 14,
    critRate: 16,
    critDamage: 170,
    dodgeChance: 12,
  },
  plasma_hydra: {
    id: 'plasma_hydra',
    name: 'HX-9 Hydra Cannon',
    vietnameseName: 'HX-9 Thủy Quái 9 Đầu',
    tagline: 'Pháo đa nòng thủy lực · Hỏa lực 9 nòng quét nửa màn hình',
    tier: 'A',
    maxHp: 110,
    maxArmor: 50,
    speed: 385,
    fireRate: 8.5,
    bulletDamage: 34,
    bulletMechanic: 'Bắn chùm 9 tia Plasma đa góc độ phủ kín nửa bản đồ, triệt tiêu mọi góc chết',
    skillName: 'Thủy Quái Cuồng Nộ',
    skillDescription: 'Xả đợt pháo kích 18 nòng liên hoàn trong 3.5 giây dọn sạch bầu trời',
    skillCooldown: 15,
    color: '#3b82f6', // Ocean Hydra Blue
    accentColor: '#60a5fa',
    unlockedByDefault: false,
    defense: 15,
    armorPen: 18,
    trueDamage: 12,
    critRate: 15,
    critDamage: 160,
    dodgeChance: 10,
  },
  prism_aegis: {
    id: 'prism_aegis',
    name: 'PX-7 Prism Refractor',
    vietnameseName: 'PX-7 Lăng Kính Quang Học',
    tagline: 'Khúc xạ ánh sáng đa phổ · Laser tán sắc dội biên màn hình & Phản hồi đạn',
    tier: 'A',
    maxHp: 98,
    maxArmor: 52,
    speed: 415,
    fireRate: 9.8,
    bulletDamage: 30,
    bulletMechanic: 'Tia laser tán sắc 7 màu dội 2 lần khi chạm mép màn hình, tạo mạng lưới hỏa lực đan chéo',
    skillName: 'Lưới Ánh Sáng Phản Xạ',
    skillDescription: 'Kích hoạt trường lăng kính đa phổ, phản hồi 50% đạn địch ngược lại kẻ thù và tăng 30% né tránh trong 4 giây',
    skillCooldown: 13,
    color: '#ec4899', // Prism Magenta
    accentColor: '#f472b6',
    unlockedByDefault: false,
    defense: 10,
    armorPen: 22,
    trueDamage: 14,
    critRate: 20,
    critDamage: 175,
    dodgeChance: 20,
  },
  stellar_sentinel: {
    id: 'stellar_sentinel',
    name: 'GX-14 Stellar Sentinel',
    vietnameseName: 'GX-14 Vệ Binh Sao Băng',
    tagline: 'Hệ thống vệ tinh quỹ đạo · Đạn sóng xoắn Helix & Pháo đài vệ tinh 360°',
    tier: 'A',
    maxHp: 105,
    maxArmor: 52,
    speed: 400,
    fireRate: 9.5,
    bulletDamage: 33,
    bulletMechanic: 'Vệ tinh hộ vệ bắn đạn sóng xoắn Helix kép tự động đập tan đạn địch phía trước',
    skillName: 'Pháo Đài Vệ Tinh 360°',
    skillDescription: 'Mở rộng 6 vệ tinh quỹ đạo quét sạch không phận 360 độ, miễn nhiễm sát thương 4.5 giây và phản đòn 12 tia laser',
    skillCooldown: 14,
    color: '#38bdf8', // Stellar Cyan
    accentColor: '#7dd3fc',
    unlockedByDefault: false,
    defense: 14,
    armorPen: 20,
    trueDamage: 14,
    critRate: 16,
    critDamage: 170,
    dodgeChance: 12,
  },
  void_rift: {
    id: 'void_rift',
    name: 'VX-8 Void Riftwalker',
    vietnameseName: 'VX-8 Khe Nứt Hư Không',
    tagline: 'Công nghệ xé rách không gian · Đạn Lưỡi Dao Bẫy Nứt & Cổng Không Gian Tử Thần',
    tier: 'A',
    maxHp: 95,
    maxArmor: 45,
    speed: 420,
    fireRate: 9,
    bulletDamage: 36,
    bulletMechanic: 'Bắn Lưỡi Dao Hư Không cắm vào không gian tạo vết nứt xé rách liên tục mọi kẻ địch đi qua',
    skillName: 'Sụp Đổ Chiều Không Gian',
    skillDescription: 'Cắt đôi không phận bằng vết nứt chân không khổng lồ, hút kẻ địch vào tâm và phát nổ 3 đợt xé toạc 50% giáp địch',
    skillCooldown: 13,
    color: '#a855f7', // Void Violet
    accentColor: '#c084fc',
    unlockedByDefault: false,
    defense: 10,
    armorPen: 28,
    trueDamage: 20,
    critRate: 22,
    critDamage: 185,
    dodgeChance: 18,
  },
  sol_inferno: {
    id: 'sol_inferno',
    name: 'FX-33 Sol Inferno',
    vietnameseName: 'FX-33 Hỏa Thần Viêm Đế',
    tagline: 'Lửa thiêu bức xạ siêu tân tinh · Bom Napalm rơi chậm & Biển lửa lan tỏa',
    tier: 'A',
    maxHp: 112,
    maxArmor: 48,
    speed: 390,
    fireRate: 8,
    bulletDamage: 40,
    bulletMechanic: 'Bắn bom cầu lửa Napalm rải thảm tàn lửa bốc cháy dữ dội gây sát thương thiêu đốt liên tục',
    skillName: 'Biển Lửa Siêu Tân Tinh',
    skillDescription: 'Bùng nổ sóng nhiệt cuồng nộ biến nửa màn hình thành biển lửa thiêu đốt 5 giây, hủy diệt đạn địch và tăng 40% tốc bắn',
    skillCooldown: 14,
    color: '#f97316', // Flare Orange
    accentColor: '#fbbf24',
    unlockedByDefault: false,
    defense: 15,
    armorPen: 22,
    trueDamage: 16,
    critRate: 18,
    critDamage: 175,
    dodgeChance: 10,
  },
  chrono_echo: {
    id: 'chrono_echo',
    name: 'TX-19 Chrono Resonator',
    vietnameseName: 'TX-19 Âm Vang Thời Không',
    tagline: 'Sóng siêu tần thời gian · Đạn âm vang tự nhân đôi & Đảo ngược quỹ đạo',
    tier: 'A',
    maxHp: 98,
    maxArmor: 46,
    speed: 435,
    fireRate: 10,
    bulletDamage: 31,
    bulletMechanic: 'Bắn sóng âm vang thời gian, sau 0.2s tự động nhân đôi bản sao âm vang phóng tiếp với góc chéo tạo lưới sóng cộng hưởng',
    skillName: 'Đảo Ngược Thời Gian',
    skillDescription: 'Giật lùi toàn bộ quái vật và đạn địch về đỉnh màn hình 200px trong 1.5 giây, đồng thời phục hồi 100% lượng Giáp bị mất gần đây',
    skillCooldown: 15,
    color: '#06b6d4', // Temporal Cyan
    accentColor: '#34d399',
    unlockedByDefault: false,
    defense: 8,
    armorPen: 24,
    trueDamage: 15,
    critRate: 24,
    critDamage: 190,
    dodgeChance: 20,
  },
  graviton_lance: {
    id: 'graviton_lance',
    name: 'GX-99 Graviton Piercer',
    vietnameseName: 'GX-99 Mũi Giáo Trọng Lực',
    tagline: 'Pháo ray trọng lực gia tốc · Mũi giáo xuyên thấu kèm sóng xung kích nén',
    tier: 'A',
    maxHp: 120,
    maxArmor: 58,
    speed: 370,
    fireRate: 7.5,
    bulletDamage: 46,
    bulletMechanic: 'Bắn mũi giáo trọng lực siêu thanh tốc độ 1400px/s xuyên qua toàn bộ kẻ địch, kích nổ sóng xung lực nén sang 2 bên',
    skillName: 'Đại Pháo Khải Huyền',
    skillDescription: 'Phóng đại pháo trọng trường cực đại nghiền nát mọi tàu chiến và tạo lực đè bẹp các đòn tấn công của đối thủ trong 4 giây',
    skillCooldown: 16,
    color: '#e11d48', // Crimson Rose
    accentColor: '#fb7185',
    unlockedByDefault: false,
    defense: 18,
    armorPen: 30,
    trueDamage: 22,
    critRate: 15,
    critDamage: 180,
    dodgeChance: 8,
  },
  bio_spore: {
    id: 'bio_spore',
    name: 'BX-7 Bio Vanguard',
    vietnameseName: 'BX-7 Bào Tử Độc Tinh',
    tagline: 'Công nghệ bào tử ký sinh vũ trụ · Nang bào tử ký sinh & Chuỗi nổ lây nhiễm',
    tier: 'A',
    maxHp: 102,
    maxArmor: 50,
    speed: 405,
    fireRate: 9.5,
    bulletDamage: 32,
    bulletMechanic: 'Bắn các nang bào tử uốn lượn ký sinh vào mục tiêu, khi nổ bung 4 hạt phấn độc lây nhiễm các kẻ địch kế cận',
    skillName: 'Đại Dịch Ký Sinh Tuyệt Diệt',
    skillDescription: 'Bao phủ màn hình bằng đám mây bào tử độc lục bảo, lập tức rút 25% máu của toàn bộ kẻ địch và rơi ngọc hồi giáp',
    skillCooldown: 13,
    color: '#10b981', // Bio Emerald
    accentColor: '#a3e635',
    unlockedByDefault: false,
    defense: 12,
    armorPen: 25,
    trueDamage: 18,
    critRate: 18,
    critDamage: 165,
    dodgeChance: 15,
  },

  // --- TIER B (Bậc B - Quân Đoàn Tiêu Chuẩn: Tỉ Lệ 89%) ---
  phoenix: {
    id: 'phoenix',
    name: 'VX-9 Phoenix',
    vietnameseName: 'VX-9 Phượng Hoàng',
    tagline: 'Tiêm kích siêu thanh cơ động cao · Đạn chùm tỏa rộng',
    tier: 'B',
    maxHp: 100,
    maxArmor: 50,
    speed: 380,
    fireRate: 8,
    bulletDamage: 22,
    bulletMechanic: 'Đạn chùm đa nòng hình cánh én quét sạch diện rộng',
    skillName: 'Tăng Tốc Siêu Thanh',
    skillDescription: 'Gia tăng 60% tốc độ bay và tăng gấp đôi tốc độ bắn trong 4 giây',
    skillCooldown: 12,
    color: '#06b6d4', // Cyan
    accentColor: '#38bdf8',
    unlockedByDefault: false,
    defense: 10,
    armorPen: 10,
    trueDamage: 5,
    critRate: 12,
    critDamage: 155,
    dodgeChance: 12,
  },
  titan: {
    id: 'titan',
    name: 'TX-22 Titan',
    vietnameseName: 'TX-22 Chiến Đài',
    tagline: 'Thiết giáp hạm hạng nặng · Pháo Plasma & Tên lửa tự dẫn',
    tier: 'B',
    maxHp: 140,
    maxArmor: 80,
    speed: 290,
    fireRate: 6,
    bulletDamage: 38,
    bulletMechanic: 'Đạn pháo Plasma hạng nặng kết hợp phóng tên lửa tầm nhiệt',
    skillName: 'Pháo Đài Bất Hoại',
    skillDescription: 'Tạo lớp vỏ bọc thép hấp thụ toàn bộ sát thương trong 3.5 giây',
    skillCooldown: 14,
    color: '#f97316', // Orange
    accentColor: '#fbbf24',
    unlockedByDefault: false,
    defense: 25,
    armorPen: 12,
    trueDamage: 8,
    critRate: 8,
    critDamage: 150,
    dodgeChance: 5,
  },
  ghost: {
    id: 'ghost',
    name: 'QX-4 Ghost',
    vietnameseName: 'QX-4 Bóng Ma',
    tagline: 'Chiến cơ tàng hình tối tân · Tia Laser xuyên thấu bạo kích',
    tier: 'B',
    maxHp: 80,
    maxArmor: 40,
    speed: 420,
    fireRate: 10,
    bulletDamage: 20,
    bulletMechanic: 'Tia laser xuyên thấu không gián đoạn, thiêu rụi hàng dọc',
    skillName: 'Tàng Hình Hư Không',
    skillDescription: 'Vô hình trước radar và kẻ địch, tăng 100% sát thương bạo kích trong 4 giây',
    skillCooldown: 10,
    color: '#a855f7', // Purple
    accentColor: '#c084fc',
    unlockedByDefault: false,
    defense: 5,
    armorPen: 25,
    trueDamage: 10,
    critRate: 25,
    critDamage: 220,
    dodgeChance: 22,
  },
  viper: {
    id: 'viper',
    name: 'VX-2 Viper',
    vietnameseName: 'VX-2 Báo Thù Xà',
    tagline: 'Tiêm kích săn đêm độc tố · Đạn axit ăn mòn sát thương tích lũy',
    tier: 'B',
    maxHp: 95,
    maxArmor: 45,
    speed: 400,
    fireRate: 8.5,
    bulletDamage: 21,
    bulletMechanic: 'Bắn gai độc axit ăn mòn gây sát thương liên tục lên mục tiêu trúng đạn',
    skillName: 'Nọc Độc Hư Không',
    skillDescription: 'Phun sương axit độc bao phủ màn hình khiến kẻ địch giảm 50% máu',
    skillCooldown: 12,
    color: '#84cc16', // Lime Green
    accentColor: '#a3e635',
    unlockedByDefault: false,
    defense: 8,
    armorPen: 18,
    trueDamage: 12,
    critRate: 14,
    critDamage: 160,
    dodgeChance: 14,
  },
  falcon: {
    id: 'falcon',
    name: 'FX-8 Falcon',
    vietnameseName: 'FX-8 Ưng Tiên Phong',
    tagline: 'Hỏa thần súng máy Minigun · Tốc độ xả đạn cực nhanh',
    tier: 'B',
    maxHp: 95,
    maxArmor: 40,
    speed: 410,
    fireRate: 13,
    bulletDamage: 16,
    bulletMechanic: 'Súng máy 6 nòng bắn đạn kim loại xuyên giáp với mật độ đạn cực dày đặc',
    skillName: 'Hỏa Lực Cuồng Bạo',
    skillDescription: 'Gia tăng 150% tốc độ bắn trong 4 giây, không tốn đạn',
    skillCooldown: 11,
    color: '#3b82f6', // Cobalt Blue
    accentColor: '#60a5fa',
    unlockedByDefault: false,
    defense: 6,
    armorPen: 15,
    trueDamage: 6,
    critRate: 16,
    critDamage: 160,
    dodgeChance: 15,
  },
  bastion: {
    id: 'bastion',
    name: 'BX-3 Bastion',
    vietnameseName: 'BX-3 Pháo Đài Tiền Tiêu',
    tagline: 'Tàu tuần tra phòng ngự · Đạn sóng phản kích & lá chắn xung kích',
    tier: 'B',
    maxHp: 130,
    maxArmor: 75,
    speed: 310,
    fireRate: 6.5,
    bulletDamage: 32,
    bulletMechanic: 'Bắn các vòng sóng chấn động va đập làm tan biến các đạn địch nhỏ',
    skillName: 'Lá Chắn Đẩy Lùi',
    skillDescription: 'Kích nổ sóng EMP cục bộ đẩy lùi toàn bộ kẻ địch và dọn sạch đạn xung quanh',
    skillCooldown: 13,
    color: '#64748b', // Slate Iron
    accentColor: '#94a3b8',
    unlockedByDefault: false,
    defense: 22,
    armorPen: 10,
    trueDamage: 6,
    critRate: 8,
    critDamage: 150,
    dodgeChance: 6,
  },
};

// ==========================================
// PILOT SYSTEM (TAY LÁI / PHI CÔNG)
// ==========================================
export type PilotTier = 'B' | 'A' | 'S';

export interface PilotBonus {
  damagePercent: number; // e.g. 25 = +25%
  hpBonus: number; // +Máu tối đa
  armorBonus: number; // +Giáp tối đa
  defenseBonus: number; // +Phòng thủ
  armorPenPercent: number; // +Xuyên giáp %
  trueDamageBonus: number; // +Sát thương chuẩn
  critRatePercent: number; // +Tỉ lệ bạo kích %
  critDamagePercent: number; // +Sát thương bạo kích %
  speedPercent: number; // +Tốc bay %
  fireRatePercent: number; // +Tốc bắn %
  dodgePercent: number; // +Khả năng né tránh %
  cooldownReductionPercent: number; // +Hồi chiêu %
  bombRadiusPercent: number; // +Bán kính nổ bom %
}

export interface Pilot {
  id: string;
  name: string;
  callsign: string;
  vietnameseTitle: string;
  tier: PilotTier;
  avatarEmoji: string;
  avatarBg: string;
  color: string;
  bonusText: string;
  bonus: PilotBonus;
  quote: string;
  signatureFighterId?: string;
}

export const PILOTS: Record<string, Pilot> = {
  // --- TIER S PILOTS (Huyền Thoại: 1.0%) ---
  pilot_raiden_s: {
    id: 'pilot_raiden_s',
    name: 'Raiden Kaminari',
    callsign: 'Lôi Thần Trấn Phái',
    vietnameseTitle: 'Đại Tướng Lôi Thần · Trấn Phái RTS-88',
    tier: 'S',
    signatureFighterId: 'rts_88',
    avatarEmoji: '⚡',
    avatarBg: 'from-amber-400/40 via-cyan-500/40 to-purple-700/50 border-cyan-300',
    color: '#00f0ff',
    bonusText: '+35% ST · +30% Xuyên Giáp · +25 ST Chuẩn · TRẤN PHÁI RTS-88: Bắn thêm 1 tia sấm sét!',
    bonus: {
      damagePercent: 35,
      hpBonus: 20,
      armorBonus: 40,
      defenseBonus: 20,
      armorPenPercent: 30,
      trueDamageBonus: 25,
      critRatePercent: 22,
      critDamagePercent: 65,
      speedPercent: 15,
      fireRatePercent: 15,
      dodgePercent: 14,
      cooldownReductionPercent: 20,
      bombRadiusPercent: 25,
    },
    quote: 'Sấm sét vũ trụ cuộn trào trong huyết quản! RTS-88, phóng xuất chùm song lôi diệt thế!',
  },
  celestia: {
    id: 'celestia',
    name: 'Celestia Vega',
    callsign: 'Nữ Vương Tinh Cầu',
    vietnameseTitle: 'Đô Đốc Celestia · Nữ Vương Tinh Cầu',
    tier: 'S',
    avatarEmoji: '👸',
    avatarBg: 'from-amber-400/30 via-yellow-500/30 to-amber-600/30 border-amber-300',
    color: '#fbbf24',
    bonusText: '+30 Sát thương chuẩn · +25% Tỉ lệ bạo kích · +60% ST bạo kích · +30 Giáp',
    bonus: {
      damagePercent: 25,
      hpBonus: 10,
      armorBonus: 30,
      defenseBonus: 12,
      armorPenPercent: 30,
      trueDamageBonus: 30,
      critRatePercent: 25,
      critDamagePercent: 60,
      speedPercent: 15,
      fireRatePercent: 15,
      dodgePercent: 12,
      cooldownReductionPercent: 20,
      bombRadiusPercent: 20,
    },
    quote: 'Mọi giáp trụ vũ trụ đều tan rã trước ánh sáng chuẩn của tinh tú vĩnh hằng!',
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis Vance',
    callsign: 'Khiên Bất Diệt',
    vietnameseTitle: 'Tổng Tư Lệnh Aegis · Khiên Bất Diệt',
    tier: 'S',
    avatarEmoji: '🛡️',
    avatarBg: 'from-cyan-500/30 via-blue-600/30 to-slate-800/40 border-cyan-400',
    color: '#38bdf8',
    bonusText: '+50 Giáp tối đa · +35 Phòng thủ · +15% Khả năng né tránh · +30 Máu',
    bonus: {
      damagePercent: 15,
      hpBonus: 30,
      armorBonus: 50,
      defenseBonus: 35,
      armorPenPercent: 10,
      trueDamageBonus: 10,
      critRatePercent: 10,
      critDamagePercent: 30,
      speedPercent: 10,
      fireRatePercent: 10,
      dodgePercent: 15,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 30,
    },
    quote: 'Lá chắn của ta là bức tường thành không một hạm đội nào có thể vượt qua!',
  },
  phantom_zero: {
    id: 'phantom_zero',
    name: 'Zero Phantom',
    callsign: 'U Linh Bóng Đêm',
    vietnameseTitle: 'Bóng Ma Zero · U Linh Vô Định',
    tier: 'S',
    avatarEmoji: '🥷',
    avatarBg: 'from-purple-600/30 via-indigo-700/30 to-slate-900/40 border-purple-400',
    color: '#c084fc',
    bonusText: '+25% Khả năng né tránh · +35% Tốc bay · +40% Xuyên giáp · +30% Tốc bắn',
    bonus: {
      damagePercent: 20,
      hpBonus: 5,
      armorBonus: 20,
      defenseBonus: 8,
      armorPenPercent: 40,
      trueDamageBonus: 20,
      critRatePercent: 22,
      critDamagePercent: 50,
      speedPercent: 35,
      fireRatePercent: 30,
      dodgePercent: 25,
      cooldownReductionPercent: 25,
      bombRadiusPercent: 15,
    },
    quote: 'Kẻ địch chỉ có thể bất lực khai hỏa vào tàn ảnh của ta!',
  },
  nova_striker: {
    id: 'nova_striker',
    name: 'Nova Sterling',
    callsign: 'Sao Băng Hủy Diệt',
    vietnameseTitle: 'Đại Úy Nova · Sao Băng Siêu Tân Tinh',
    tier: 'S',
    avatarEmoji: '🌟',
    avatarBg: 'from-rose-500/30 via-orange-500/30 to-amber-500/30 border-rose-400',
    color: '#f43f5e',
    bonusText: '+50% Xuyên giáp · +35% Tốc bắn · +25 Sát thương chuẩn · +20% Bạo kích',
    bonus: {
      damagePercent: 30,
      hpBonus: 10,
      armorBonus: 25,
      defenseBonus: 10,
      armorPenPercent: 50,
      trueDamageBonus: 25,
      critRatePercent: 20,
      critDamagePercent: 45,
      speedPercent: 20,
      fireRatePercent: 35,
      dodgePercent: 12,
      cooldownReductionPercent: 20,
      bombRadiusPercent: 25,
    },
    quote: 'Bão lửa thiên thạch hủy diệt, thiêu rụi toàn bộ hạm đội địch trong chớp mắt!',
  },
  astrid: {
    id: 'astrid',
    name: 'Astrid Silverwing',
    callsign: 'Thiên Sứ Ánh Sao',
    vietnameseTitle: 'Thiên Sứ Astrid · Ánh Sao Tiên Phong',
    tier: 'S',
    avatarEmoji: '✨',
    avatarBg: 'from-sky-400/30 via-emerald-400/30 to-indigo-500/30 border-sky-300',
    color: '#38bdf8',
    bonusText: '+30 Giáp · +18% Khả năng né tránh · +25% Bạo kích · +30% Hồi tuyệt kỹ',
    bonus: {
      damagePercent: 22,
      hpBonus: 15,
      armorBonus: 30,
      defenseBonus: 15,
      armorPenPercent: 25,
      trueDamageBonus: 20,
      critRatePercent: 25,
      critDamagePercent: 50,
      speedPercent: 22,
      fireRatePercent: 20,
      dodgePercent: 18,
      cooldownReductionPercent: 30,
      bombRadiusPercent: 25,
    },
    quote: 'Ánh sao tiên phong dẫn lối công lý, xóa tan bóng tối hư không!',
  },
  valerie: {
    id: 'valerie',
    name: 'Valerie Vance',
    callsign: 'Nữ Thần Lửa',
    vietnameseTitle: 'Đại Úy Valerie · Nữ Thần Lửa',
    tier: 'S',
    avatarEmoji: '👩‍✈️',
    avatarBg: 'from-amber-500/30 via-rose-500/30 to-amber-600/30 border-amber-400',
    color: '#f59e0b',
    bonusText: '+30% Sát thương · +25 Sát thương chuẩn · +25% Hồi tuyệt kỹ',
    bonus: {
      damagePercent: 30,
      hpBonus: 10,
      armorBonus: 25,
      defenseBonus: 10,
      armorPenPercent: 20,
      trueDamageBonus: 25,
      critRatePercent: 18,
      critDamagePercent: 40,
      speedPercent: 15,
      fireRatePercent: 15,
      dodgePercent: 10,
      cooldownReductionPercent: 25,
      bombRadiusPercent: 15,
    },
    quote: 'Bầu trời này thuộc về công lý, không kẻ nào có thể vượt qua lằn ranh hỏa lực!',
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Stone',
    callsign: 'Thiết Giáp Thần',
    vietnameseTitle: 'Đại Tá Marcus · Thiết Giáp Thần',
    tier: 'S',
    avatarEmoji: '👨‍✈️',
    avatarBg: 'from-orange-500/30 via-amber-500/30 to-red-600/30 border-orange-400',
    color: '#f97316',
    bonusText: '+40 Giáp tối đa · +25 Phòng thủ · +40% Bán kính Bom EMP',
    bonus: {
      damagePercent: 15,
      hpBonus: 25,
      armorBonus: 40,
      defenseBonus: 25,
      armorPenPercent: 15,
      trueDamageBonus: 10,
      critRatePercent: 10,
      critDamagePercent: 30,
      speedPercent: 5,
      fireRatePercent: 10,
      dodgePercent: 8,
      cooldownReductionPercent: 10,
      bombRadiusPercent: 40,
    },
    quote: 'Chiến giáp vững vàng như núi đá, kẻ địch hãy run sợ trước pháo đài thép!',
  },
  orion: {
    id: 'orion',
    name: 'Orion Vance',
    callsign: 'Thần Tinh Tú',
    vietnameseTitle: 'Huyền Thoại Orion · Thần Tinh Tú',
    tier: 'S',
    avatarEmoji: '🧑‍🚀',
    avatarBg: 'from-purple-500/30 via-indigo-500/30 to-cyan-500/30 border-purple-400',
    color: '#a855f7',
    bonusText: '+25% Sát thương · +25 Giáp · +20% Tốc bay · +15% Né tránh',
    bonus: {
      damagePercent: 25,
      hpBonus: 15,
      armorBonus: 25,
      defenseBonus: 12,
      armorPenPercent: 20,
      trueDamageBonus: 15,
      critRatePercent: 16,
      critDamagePercent: 35,
      speedPercent: 20,
      fireRatePercent: 15,
      dodgePercent: 15,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 20,
    },
    quote: 'Nhìn những vì sao kia xem, chúng đang dẫn lối cho chiến thắng vĩ đại!',
  },
  nyx: {
    id: 'nyx',
    name: 'Nyx Shadowfall',
    callsign: 'Ác Quỷ Hư Không',
    vietnameseTitle: 'Sát Thủ Nyx · Ác Quỷ Hư Không',
    tier: 'S',
    avatarEmoji: '🥷',
    avatarBg: 'from-violet-600/30 via-slate-800/40 to-fuchsia-600/30 border-fuchsia-400',
    color: '#d946ef',
    bonusText: '+35% Bạo kích · +50% ST bạo kích · +30% Xuyên giáp · +18% Né tránh',
    bonus: {
      damagePercent: 35,
      hpBonus: 5,
      armorBonus: 20,
      defenseBonus: 8,
      armorPenPercent: 30,
      trueDamageBonus: 20,
      critRatePercent: 35,
      critDamagePercent: 50,
      speedPercent: 18,
      fireRatePercent: 20,
      dodgePercent: 18,
      cooldownReductionPercent: 30,
      bombRadiusPercent: 10,
    },
    quote: 'Chúng không bao giờ kịp nhìn thấy mũi tên bắn ra từ bóng tối.',
  },

  // --- TIER A PILOTS (Tinh Anh: 10.0%) ---
  gideon: {
    id: 'gideon',
    name: 'Gideon Cross',
    callsign: 'Phá Giáp Thiết Giáp',
    vietnameseTitle: 'Thiếu Tá Gideon · Phá Giáp',
    tier: 'A',
    avatarEmoji: '🎯',
    avatarBg: 'from-red-500/30 via-orange-500/30 to-slate-800/40 border-red-400',
    color: '#ef4444',
    bonusText: '+35% Xuyên giáp · +20 Sát thương chuẩn · +15% Tốc bắn',
    bonus: {
      damagePercent: 15,
      hpBonus: 10,
      armorBonus: 15,
      defenseBonus: 8,
      armorPenPercent: 35,
      trueDamageBonus: 20,
      critRatePercent: 12,
      critDamagePercent: 30,
      speedPercent: 8,
      fireRatePercent: 15,
      dodgePercent: 8,
      cooldownReductionPercent: 10,
      bombRadiusPercent: 15,
    },
    quote: 'Không lớp giáp nào của kẻ địch chịu nổi loạt đạn xuyên phá năng lượng!',
  },
  seraphina: {
    id: 'seraphina',
    name: 'Seraphina Vale',
    callsign: 'Hộ Vệ Tinh Tú',
    vietnameseTitle: 'Đại Úy Seraphina · Hộ Vệ',
    tier: 'A',
    avatarEmoji: '💫',
    avatarBg: 'from-cyan-500/30 via-teal-500/30 to-slate-800/40 border-cyan-400',
    color: '#06b6d4',
    bonusText: '+30 Giáp tối đa · +20 Phòng thủ · +12% Khả năng né tránh',
    bonus: {
      damagePercent: 10,
      hpBonus: 15,
      armorBonus: 30,
      defenseBonus: 20,
      armorPenPercent: 10,
      trueDamageBonus: 8,
      critRatePercent: 8,
      critDamagePercent: 25,
      speedPercent: 10,
      fireRatePercent: 10,
      dodgePercent: 12,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 20,
    },
    quote: 'Lực trường bảo vệ đã kích hoạt, an tâm giao phó không phận cho tôi!',
  },
  hayabusa: {
    id: 'hayabusa',
    name: 'Ren Hayabusa',
    callsign: 'Chim Ưng Lướt Gió',
    vietnameseTitle: 'Thượng Úy Ren · Lướt Gió',
    tier: 'A',
    avatarEmoji: '🦅',
    avatarBg: 'from-emerald-500/30 via-sky-500/30 to-slate-800/40 border-emerald-400',
    color: '#10b981',
    bonusText: '+18% Khả năng né tránh · +25% Tốc bay · +15% Tốc bắn',
    bonus: {
      damagePercent: 12,
      hpBonus: 8,
      armorBonus: 15,
      defenseBonus: 6,
      armorPenPercent: 15,
      trueDamageBonus: 10,
      critRatePercent: 14,
      critDamagePercent: 30,
      speedPercent: 25,
      fireRatePercent: 15,
      dodgePercent: 18,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 10,
    },
    quote: 'Cơ động tối thượng, uốn lượn xuyên qua ngàn lằn đạn như gió thoảng!',
  },
  vulkan: {
    id: 'vulkan',
    name: 'Vulkan Ironheart',
    callsign: 'Bạo Kích Cuồng Nộ',
    vietnameseTitle: 'Kỹ Sư Trưởng Vulkan · Cuồng Nộ',
    tier: 'A',
    avatarEmoji: '💥',
    avatarBg: 'from-amber-600/30 via-red-600/30 to-slate-800/40 border-amber-500',
    color: '#f59e0b',
    bonusText: '+20% Tỉ lệ bạo kích · +45% ST bạo kích · +15 Phòng thủ',
    bonus: {
      damagePercent: 18,
      hpBonus: 12,
      armorBonus: 20,
      defenseBonus: 15,
      armorPenPercent: 15,
      trueDamageBonus: 12,
      critRatePercent: 20,
      critDamagePercent: 45,
      speedPercent: 8,
      fireRatePercent: 12,
      dodgePercent: 8,
      cooldownReductionPercent: 10,
      bombRadiusPercent: 20,
    },
    quote: 'Mỗi phát bắn là một quả bộc phá nghiền nát thân tàu địch!',
  },
  selene: {
    id: 'selene',
    name: 'Selene Lunar',
    callsign: 'Bạch Nguyệt Tốc Kích',
    vietnameseTitle: 'Hoa Tiêu Selene · Bạch Nguyệt',
    tier: 'A',
    avatarEmoji: '🌙',
    avatarBg: 'from-indigo-500/30 via-blue-500/30 to-slate-800/40 border-indigo-400',
    color: '#818cf8',
    bonusText: '+25% Tốc bắn · +15% Tốc bay · +20% Xuyên giáp',
    bonus: {
      damagePercent: 15,
      hpBonus: 8,
      armorBonus: 18,
      defenseBonus: 8,
      armorPenPercent: 20,
      trueDamageBonus: 12,
      critRatePercent: 15,
      critDamagePercent: 30,
      speedPercent: 15,
      fireRatePercent: 25,
      dodgePercent: 10,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 15,
    },
    quote: 'Ánh trăng lạnh lẽo định vị tọa độ, khai hỏa bão đạn liên hồi!',
  },
  lyra: {
    id: 'lyra',
    name: 'Lyra Song',
    callsign: 'Bóng Ảo Ảnh',
    vietnameseTitle: 'Trung Úy Lyra · Bóng Ảo Ảnh',
    tier: 'A',
    avatarEmoji: '👩‍🎤',
    avatarBg: 'from-pink-500/30 via-purple-500/30 to-indigo-500/30 border-pink-400',
    color: '#ec4899',
    bonusText: '+15% Khả năng né tránh · +20% Tốc bay · +20% Hồi tuyệt kỹ',
    bonus: {
      damagePercent: 15,
      hpBonus: 8,
      armorBonus: 15,
      defenseBonus: 8,
      armorPenPercent: 15,
      trueDamageBonus: 10,
      critRatePercent: 12,
      critDamagePercent: 30,
      speedPercent: 20,
      fireRatePercent: 12,
      dodgePercent: 15,
      cooldownReductionPercent: 20,
      bombRadiusPercent: 10,
    },
    quote: 'Chiến thuật tốt nhất là khiến kẻ thù bắn vào hư không!',
  },
  zephyr: {
    id: 'zephyr',
    name: 'Dr. Zephyr Frost',
    callsign: 'Bão Băng',
    vietnameseTitle: 'Tiến Sĩ Zephyr · Bão Băng',
    tier: 'A',
    avatarEmoji: '👨‍🔬',
    avatarBg: 'from-cyan-500/30 via-blue-500/30 to-sky-500/30 border-cyan-400',
    color: '#38bdf8',
    bonusText: '+20% Sát thương · +20 Giáp · +15% Tốc bắn',
    bonus: {
      damagePercent: 20,
      hpBonus: 10,
      armorBonus: 20,
      defenseBonus: 10,
      armorPenPercent: 15,
      trueDamageBonus: 12,
      critRatePercent: 10,
      critDamagePercent: 25,
      speedPercent: 10,
      fireRatePercent: 15,
      dodgePercent: 10,
      cooldownReductionPercent: 15,
      bombRadiusPercent: 10,
    },
    quote: 'Nhiệt độ tuyệt đối sẽ đóng băng tham vọng của bọn xâm lăng.',
  },
  drake: {
    id: 'drake',
    name: 'Drake Ironclaw',
    callsign: 'Thợ Săn Rồng',
    vietnameseTitle: 'Thiếu Tá Drake · Thợ Săn Rồng',
    tier: 'A',
    avatarEmoji: '🤠',
    avatarBg: 'from-rose-500/30 via-red-500/30 to-amber-500/30 border-rose-400',
    color: '#f43f5e',
    bonusText: '+20 Máu tối đa · +20 Giáp · +15% Xuyên giáp',
    bonus: {
      damagePercent: 15,
      hpBonus: 20,
      armorBonus: 20,
      defenseBonus: 15,
      armorPenPercent: 15,
      trueDamageBonus: 10,
      critRatePercent: 12,
      critDamagePercent: 30,
      speedPercent: 8,
      fireRatePercent: 10,
      dodgePercent: 8,
      cooldownReductionPercent: 10,
      bombRadiusPercent: 15,
    },
    quote: 'Mục tiêu đã khóa trong tầm ngắm, khai hỏa toàn lực!',
  },
  kael: {
    id: 'kael',
    name: 'Kael Thunder',
    callsign: 'Tia Chớp Lôi',
    vietnameseTitle: 'Thượng Úy Kael · Tia Chớp Lôi',
    tier: 'A',
    avatarEmoji: '⚡',
    avatarBg: 'from-teal-500/30 via-cyan-500/30 to-blue-500/30 border-teal-400',
    color: '#14b8a6',
    bonusText: '+20% Sát thương · +15 Sát thương chuẩn · +15% Tốc bay',
    bonus: {
      damagePercent: 20,
      hpBonus: 10,
      armorBonus: 18,
      defenseBonus: 10,
      armorPenPercent: 18,
      trueDamageBonus: 15,
      critRatePercent: 14,
      critDamagePercent: 30,
      speedPercent: 15,
      fireRatePercent: 12,
      dodgePercent: 10,
      cooldownReductionPercent: 10,
      bombRadiusPercent: 15,
    },
    quote: 'Sấm sét không bao giờ đánh hai lần ở một nơi, vì một lần là đủ kết liễu!',
  },

  // --- TIER B PILOTS (Tiêu Chuẩn: 89.0%) ---
  toby: {
    id: 'toby',
    name: 'Toby Sparks',
    callsign: 'Thợ Hàn Xung Điện',
    vietnameseTitle: 'Tân Binh Toby · Xung Điện',
    tier: 'B',
    avatarEmoji: '🔧',
    avatarBg: 'from-amber-500/20 to-slate-700/40 border-amber-400/40',
    color: '#fbbf24',
    bonusText: '+20 Giáp tối đa · +10 Phòng thủ',
    bonus: {
      damagePercent: 6,
      hpBonus: 8,
      armorBonus: 20,
      defenseBonus: 10,
      armorPenPercent: 8,
      trueDamageBonus: 6,
      critRatePercent: 6,
      critDamagePercent: 15,
      speedPercent: 5,
      fireRatePercent: 6,
      dodgePercent: 6,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 8,
    },
    quote: 'Mối hàn điện cực đã gia cố giáp máy bay thêm kiên cố!',
  },
  mira: {
    id: 'mira',
    name: 'Mira Keen',
    callsign: 'Xạ Thủ Ngắm Chuẩn',
    vietnameseTitle: 'Xạ Thủ Mira · Chuẩn Xác',
    tier: 'B',
    avatarEmoji: '🎯',
    avatarBg: 'from-rose-500/20 to-slate-700/40 border-rose-400/40',
    color: '#fb7185',
    bonusText: '+15% Tỉ lệ bạo kích · +25% ST bạo kích',
    bonus: {
      damagePercent: 8,
      hpBonus: 5,
      armorBonus: 10,
      defenseBonus: 5,
      armorPenPercent: 10,
      trueDamageBonus: 8,
      critRatePercent: 15,
      critDamagePercent: 25,
      speedPercent: 6,
      fireRatePercent: 8,
      dodgePercent: 6,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 6,
    },
    quote: 'Hồng tâm đã căn chuẩn điểm yếu mục tiêu, bóp cò!',
  },
  boris: {
    id: 'boris',
    name: 'Boris Bull',
    callsign: 'Thiết Đầu Công',
    vietnameseTitle: 'Trung Sĩ Boris · Thiết Đầu',
    tier: 'B',
    avatarEmoji: '🪖',
    avatarBg: 'from-slate-600/30 to-slate-800/40 border-slate-500/40',
    color: '#94a3b8',
    bonusText: '+25 Giáp tối đa · +12 Phòng thủ · +10 Máu',
    bonus: {
      damagePercent: 5,
      hpBonus: 10,
      armorBonus: 25,
      defenseBonus: 12,
      armorPenPercent: 5,
      trueDamageBonus: 5,
      critRatePercent: 5,
      critDamagePercent: 15,
      speedPercent: 0,
      fireRatePercent: 5,
      dodgePercent: 4,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 10,
    },
    quote: 'Thép tôi luyện trên chiến trường không ngại va chạm!',
  },
  faye: {
    id: 'faye',
    name: 'Faye Windrider',
    callsign: 'Phi Yến Lách Đạn',
    vietnameseTitle: 'Tân Binh Faye · Lách Đạn',
    tier: 'B',
    avatarEmoji: '💨',
    avatarBg: 'from-teal-500/20 to-slate-700/40 border-teal-400/40',
    color: '#2dd4bf',
    bonusText: '+12% Khả năng né tránh · +12% Tốc bay',
    bonus: {
      damagePercent: 6,
      hpBonus: 5,
      armorBonus: 10,
      defenseBonus: 4,
      armorPenPercent: 8,
      trueDamageBonus: 5,
      critRatePercent: 8,
      critDamagePercent: 20,
      speedPercent: 12,
      fireRatePercent: 8,
      dodgePercent: 12,
      cooldownReductionPercent: 6,
      bombRadiusPercent: 5,
    },
    quote: 'Nhanh nhẹn như én lượn, đạn địch chỉ sượt qua cánh gió!',
  },
  jax: {
    id: 'jax',
    name: 'Jax Pierce',
    callsign: 'Mũi Khoan Kim Loại',
    vietnameseTitle: 'Hạ Sĩ Jax · Mũi Khoan',
    tier: 'B',
    avatarEmoji: '⚡',
    avatarBg: 'from-yellow-500/20 to-slate-700/40 border-yellow-400/40',
    color: '#facc15',
    bonusText: '+15% Xuyên giáp · +10 Sát thương chuẩn',
    bonus: {
      damagePercent: 8,
      hpBonus: 5,
      armorBonus: 12,
      defenseBonus: 6,
      armorPenPercent: 15,
      trueDamageBonus: 10,
      critRatePercent: 8,
      critDamagePercent: 20,
      speedPercent: 6,
      fireRatePercent: 8,
      dodgePercent: 5,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 8,
    },
    quote: 'Đầu đạn vonfram đặc biệt, đục thủng mọi kết cấu kim loại!',
  },
  alex: {
    id: 'alex',
    name: 'Alex Ray',
    callsign: 'Tân Binh Nhiệt Huyết',
    vietnameseTitle: 'Tân Binh Alex · Nhiệt Huyết',
    tier: 'B',
    avatarEmoji: '🧑‍✈️',
    avatarBg: 'from-sky-500/20 to-slate-700/40 border-sky-400/40',
    color: '#38bdf8',
    bonusText: '+10% Tốc độ bay · +8% Khả năng né tránh',
    bonus: {
      damagePercent: 5,
      hpBonus: 5,
      armorBonus: 10,
      defenseBonus: 5,
      armorPenPercent: 8,
      trueDamageBonus: 5,
      critRatePercent: 8,
      critDamagePercent: 20,
      speedPercent: 10,
      fireRatePercent: 6,
      dodgePercent: 8,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 5,
    },
    quote: 'Sẵn sàng nhận nhiệm vụ, tôi sẽ không làm hạm đội thất vọng!',
  },
  elena: {
    id: 'elena',
    name: 'Elena Rostova',
    callsign: 'Hoa Tiêu Tọa Độ',
    vietnameseTitle: 'Hoa Tiêu Elena · Tọa Độ',
    tier: 'B',
    avatarEmoji: '👩‍🏫',
    avatarBg: 'from-blue-500/20 to-slate-700/40 border-blue-400/40',
    color: '#60a5fa',
    bonusText: '+12% Tốc độ bắn · +10% Xuyên giáp',
    bonus: {
      damagePercent: 8,
      hpBonus: 5,
      armorBonus: 10,
      defenseBonus: 6,
      armorPenPercent: 10,
      trueDamageBonus: 6,
      critRatePercent: 8,
      critDamagePercent: 20,
      speedPercent: 5,
      fireRatePercent: 12,
      dodgePercent: 5,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 5,
    },
    quote: 'Tọa độ kẻ địch đã xác định, hỏa lực tập trung điểm hẹn!',
  },
  bruno: {
    id: 'bruno',
    name: 'Bruno Hammer',
    callsign: 'Cơ Khí Trưởng',
    vietnameseTitle: 'Cơ Khí Trưởng Bruno · Bọc Thép',
    tier: 'B',
    avatarEmoji: '🧔',
    avatarBg: 'from-amber-500/20 to-slate-700/40 border-amber-400/40',
    color: '#fbbf24',
    bonusText: '+15 Máu tối đa · +20 Giáp tối đa · +8 Phòng thủ',
    bonus: {
      damagePercent: 4,
      hpBonus: 15,
      armorBonus: 20,
      defenseBonus: 8,
      armorPenPercent: 6,
      trueDamageBonus: 5,
      critRatePercent: 6,
      critDamagePercent: 15,
      speedPercent: 0,
      fireRatePercent: 5,
      dodgePercent: 4,
      cooldownReductionPercent: 5,
      bombRadiusPercent: 10,
    },
    quote: 'Động cơ và khung thân đã được bọc thép thêm hai lớp, an tâm tác chiến!',
  },
  clara: {
    id: 'clara',
    name: 'Clara Swift',
    callsign: 'Trinh Sát Radar',
    vietnameseTitle: 'Trinh Sát Clara · Radar',
    tier: 'B',
    avatarEmoji: '👩‍🔧',
    avatarBg: 'from-emerald-500/20 to-slate-700/40 border-emerald-400/40',
    color: '#34d399',
    bonusText: '+12% Hồi tuyệt kỹ · +8% Khả năng né tránh',
    bonus: {
      damagePercent: 5,
      hpBonus: 6,
      armorBonus: 12,
      defenseBonus: 5,
      armorPenPercent: 8,
      trueDamageBonus: 6,
      critRatePercent: 8,
      critDamagePercent: 20,
      speedPercent: 8,
      fireRatePercent: 8,
      dodgePercent: 8,
      cooldownReductionPercent: 12,
      bombRadiusPercent: 5,
    },
    quote: 'Cảm biến hồng ngoại không phát hiện góc chết, radar thông suốt!',
  },
};

export function getPilotBonus(pilotId: string | null): PilotBonus {
  const fallback: PilotBonus = {
    damagePercent: 0,
    hpBonus: 0,
    armorBonus: 0,
    defenseBonus: 0,
    armorPenPercent: 0,
    trueDamageBonus: 0,
    critRatePercent: 0,
    critDamagePercent: 0,
    speedPercent: 0,
    fireRatePercent: 0,
    dodgePercent: 0,
    cooldownReductionPercent: 0,
    bombRadiusPercent: 0,
  };
  if (!pilotId || !PILOTS[pilotId]) {
    return fallback;
  }
  return { ...fallback, ...PILOTS[pilotId].bonus };
}

/**
 * Pure formula calculation helpers for combat stats
 */
export function calculateIncomingDamage(rawDamage: number, defense: number): number {
  const def = Math.max(0, defense);
  const factor = 100 / (100 + def);
  return Math.max(1, Math.round(rawDamage * factor));
}

export function checkDodge(dodgeChance: number, randomRoll?: number): boolean {
  const roll = randomRoll !== undefined ? randomRoll : Math.random() * 100;
  const clampedChance = Math.min(75, Math.max(0, dodgeChance));
  return roll < clampedChance;
}

export function calculateBulletDamage(
  baseDamage: number,
  specsMultiplier: number = 1.0,
  bonusMultiplier: number = 1.0,
  critRate: number = 0,
  critDamage: number = 150,
  trueDamage: number = 0,
  randomRoll?: number
): { finalDamage: number; isCrit: boolean; trueDamagePart: number } {
  const roll = randomRoll !== undefined ? randomRoll : Math.random() * 100;
  const isCrit = roll < Math.min(100, Math.max(0, critRate));
  const critMult = isCrit ? Math.max(1.0, critDamage / 100) : 1.0;
  const normalPart = Math.round(baseDamage * specsMultiplier * bonusMultiplier * critMult);
  const finalDamage = Math.max(1, normalPart + trueDamage);
  return { finalDamage, isCrit, trueDamagePart: trueDamage };
}

/**
 * Calculates passive bonus damage multiplier against Boss targets
 * LX-88 Arc Tempest deals +120% damage against bosses (2.2x total multiplier).
 */
export function getBossDamageMultiplier(fighterId: string, isBoss: boolean): number {
  return isBoss && fighterId === 'arc_tempest' ? 2.2 : 1.0;
}

// ==========================================
// WEAPON ACCESSORIES (PHỤ KIỆN VŨ KHÍ)
/// ==========================================
// WEAPON ACCESSORIES (PHỤ KIỆN VŨ KHÍ BÁN BẰNG VÀNG)
// ==========================================
export type AccessorySlot = 'barrel' | 'loader' | 'core';
export type AccessoryTier = 'B' | 'A' | 'S' | 'SS' | 'MYTHIC';

export interface WeaponAccessory {
  id: string;
  name: string;
  vietnameseName: string;
  slot: AccessorySlot;
  slotLabel: string;
  tier: AccessoryTier;
  damageBonusPercent: number; // Sát thương %
  fireRateBonusPercent: number; // Tốc độ bắn %
  critRatePercent?: number; // Tỉ lệ bạo kích %
  armorPenPercent?: number; // Xuyên giáp %
  trueDamageBonus?: number; // Sát thương chuẩn cộng thêm
  description: string;
  icon: string;
  color: string;
  costGold: number; // Bán bằng VÀNG (giá từ 50,000 đến 100,000,000 Vàng)
  costGems?: number; // Tùy chọn tương thích ngược
}

export const WEAPON_ACCESSORIES: Record<string, WeaponAccessory> = {
  // ========================================================
  // --- TIER B ACCESSORIES (50,000 - 150,000 VÀNG) ---
  // ========================================================
  barrel_kinetic_b: {
    id: 'barrel_kinetic_b',
    name: 'Kinetic Accelerating Barrel',
    vietnameseName: 'Nòng Gia Tốc Đạn Đồng',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'B',
    damageBonusPercent: 12,
    fireRateBonusPercent: 0,
    critRatePercent: 0,
    armorPenPercent: 3,
    trueDamageBonus: 0,
    description: 'Tăng áp suất buồng phóng cơ bản, gia tăng 12% sát thương đạn và 3% xuyên giáp.',
    icon: '🎯',
    color: '#38bdf8',
    costGold: 50000, // 50k Vàng
  },
  loader_rapid_b: {
    id: 'loader_rapid_b',
    name: 'Pulse Auto-Feeder',
    vietnameseName: 'Hộp Nạp Xung Lực B-1',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'B',
    damageBonusPercent: 0,
    fireRateBonusPercent: 12,
    critRatePercent: 2,
    armorPenPercent: 0,
    trueDamageBonus: 0,
    description: 'Cơ cấu nạp đạn cơ khí cải tiến, tăng 12% nhịp bắn liên thanh và 2% bạo kích.',
    icon: '⚡',
    color: '#38bdf8',
    costGold: 60000, // 60k Vàng
  },
  core_hybrid_b: {
    id: 'core_hybrid_b',
    name: 'Micro Energy Cell',
    vietnameseName: 'Lõi Năng Lượng Thứ Cấp',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'B',
    damageBonusPercent: 8,
    fireRateBonusPercent: 8,
    critRatePercent: 2,
    armorPenPercent: 2,
    trueDamageBonus: 2,
    description: 'Vi mạch năng lượng cân bằng, tăng đồng thời 8% sát thương, 8% tốc bắn và +2 sát thương chuẩn.',
    icon: '💠',
    color: '#38bdf8',
    costGold: 90000, // 90k Vàng
  },
  barrel_carbide_b: {
    id: 'barrel_carbide_b',
    name: 'Tungsten Carbide Barrel',
    vietnameseName: 'Nòng Hợp Kim Vonfram B-2',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'B',
    damageBonusPercent: 15,
    fireRateBonusPercent: 0,
    critRatePercent: 2,
    armorPenPercent: 5,
    trueDamageBonus: 0,
    description: 'Đúc từ hợp kim Vonfram siêu cứng, gia tăng 15% sát thương và 5% khả năng xuyên giáp.',
    icon: '🔩',
    color: '#38bdf8',
    costGold: 75000,
  },
  loader_twin_spring_b: {
    id: 'loader_twin_spring_b',
    name: 'Twin-Spring Recoil Damper',
    vietnameseName: 'Bộ Nạp Lò Xo Kép B-2',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'B',
    damageBonusPercent: 0,
    fireRateBonusPercent: 15,
    critRatePercent: 3,
    armorPenPercent: 0,
    trueDamageBonus: 0,
    description: 'Bộ giảm giật lò xo đôi tăng tốc độ nhả đạn thêm 15% và 3% bạo kích.',
    icon: '🔄',
    color: '#38bdf8',
    costGold: 85000,
  },
  core_gyro_stabilizer_b: {
    id: 'core_gyro_stabilizer_b',
    name: 'Gyro Dynamic Stabilizer',
    vietnameseName: 'Lõi Con Quay Ổn Định B-3',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'B',
    damageBonusPercent: 10,
    fireRateBonusPercent: 10,
    critRatePercent: 3,
    armorPenPercent: 3,
    trueDamageBonus: 3,
    description: 'Hệ con quay triệt tiêu độ lệch đạn, tăng 10% sát thương, 10% tốc bắn và 3% bạo kích.',
    icon: '🧭',
    color: '#38bdf8',
    costGold: 120000,
  },

  // ========================================================
  // --- TIER A ACCESSORIES (250,000 - 850,000 VÀNG) ---
  // ========================================================
  barrel_plasma_a: {
    id: 'barrel_plasma_a',
    name: 'Focusing Plasma Emitter',
    vietnameseName: 'Nòng Hội Tụ Plasma RX',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'A',
    damageBonusPercent: 25,
    fireRateBonusPercent: 0,
    critRatePercent: 4,
    armorPenPercent: 8,
    trueDamageBonus: 4,
    description: 'Ống nòng từ trường plasma nén chặt luồng năng lượng, tăng 25% sát thương và 8% xuyên giáp.',
    icon: '🔥',
    color: '#c084fc',
    costGold: 250000,
  },
  loader_chrono_a: {
    id: 'loader_chrono_a',
    name: 'Quantum Magnetic Feeder',
    vietnameseName: 'Bộ Nạp Từ Trường Lượng Tử',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'A',
    damageBonusPercent: 0,
    fireRateBonusPercent: 25,
    critRatePercent: 5,
    armorPenPercent: 0,
    trueDamageBonus: 0,
    description: 'Đệm từ siêu dẫn triệt tiêu ma sát nạp đạn, tăng 25% tốc độ bắn và 5% tỉ lệ bạo kích.',
    icon: '⚙️',
    color: '#c084fc',
    costGold: 350000,
  },
  core_quantum_a: {
    id: 'core_quantum_a',
    name: 'Superconducting Overcharger',
    vietnameseName: 'Lõi Quá Tải Siêu Dẫn',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'A',
    damageBonusPercent: 18,
    fireRateBonusPercent: 18,
    critRatePercent: 5,
    armorPenPercent: 6,
    trueDamageBonus: 6,
    description: 'Lõi lượng tử ổn định cao, tăng vọt 18% sát thương, 18% tốc bắn và +6 sát thương chuẩn.',
    icon: '🚀',
    color: '#c084fc',
    costGold: 500000,
  },
  barrel_cryo_shatter_a: {
    id: 'barrel_cryo_shatter_a',
    name: 'Cryo Frost Shatterer',
    vietnameseName: 'Nòng Hàn Băng Vỡ Vụn',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'A',
    damageBonusPercent: 28,
    fireRateBonusPercent: 0,
    critRatePercent: 6,
    armorPenPercent: 10,
    trueDamageBonus: 5,
    description: 'Đóng băng vỏ đạn ở độ không tuyệt đối, tăng 28% sát thương và 6% bạo kích chí mạng.',
    icon: '❄️',
    color: '#c084fc',
    costGold: 400000,
  },
  loader_magma_drive_a: {
    id: 'loader_magma_drive_a',
    name: 'Magma Hydraulic Chamber',
    vietnameseName: 'Bộ Nạp Hỏa Diệm Nham Thạch',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'A',
    damageBonusPercent: 0,
    fireRateBonusPercent: 28,
    critRatePercent: 6,
    armorPenPercent: 4,
    trueDamageBonus: 4,
    description: 'Hệ thống thủy lực áp suất nham thạch, tăng 28% tốc độ bắn liên hoàn và +4 sát thương chuẩn.',
    icon: '🌋',
    color: '#c084fc',
    costGold: 450000,
  },
  core_solar_flare_a: {
    id: 'core_solar_flare_a',
    name: 'Solar Flare Overclock Core',
    vietnameseName: 'Lõi Bùng Nổ Mặt Trời',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'A',
    damageBonusPercent: 20,
    fireRateBonusPercent: 20,
    critRatePercent: 6,
    armorPenPercent: 8,
    trueDamageBonus: 8,
    description: 'Tận dụng bức xạ nhiệt hạch mặt trời, tăng 20% sát thương, 20% tốc bắn và 8% xuyên giáp.',
    icon: '☀️',
    color: '#c084fc',
    costGold: 650000,
  },
  barrel_toxic_corrosion_a: {
    id: 'barrel_toxic_corrosion_a',
    name: 'Corrosive Acid Projector',
    vietnameseName: 'Nòng Axit Ăn Mòn Hợp Kim',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'A',
    damageBonusPercent: 32,
    fireRateBonusPercent: 0,
    critRatePercent: 5,
    armorPenPercent: 14,
    trueDamageBonus: 7,
    description: 'Phủ lớp axit sinh học cực mạnh lên đạn, tăng 32% sát thương và 14% xuyên thủng giáp địch.',
    icon: '🧪',
    color: '#c084fc',
    costGold: 750000,
  },
  loader_storm_vortex_a: {
    id: 'loader_storm_vortex_a',
    name: 'Vortex Rapid Dispenser',
    vietnameseName: 'Bộ Nạp Xoáy Bão Điện Từ',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'A',
    damageBonusPercent: 0,
    fireRateBonusPercent: 32,
    critRatePercent: 8,
    armorPenPercent: 5,
    trueDamageBonus: 5,
    description: 'Vòng xoáy điện trường nạp đạn siêu tốc, gia tăng 32% tốc bắn và 8% bạo kích.',
    icon: '🌪️',
    color: '#c084fc',
    costGold: 850000,
  },

  // ========================================================
  // --- TIER S ACCESSORIES (2,500,000 - 15,000,000 VÀNG) ---
  // ========================================================
  barrel_antimatter_s: {
    id: 'barrel_antimatter_s',
    name: 'Doomsday Antimatter Rail',
    vietnameseName: 'Nòng Pháo Phản Vật Chất Doomsday',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'S',
    damageBonusPercent: 45,
    fireRateBonusPercent: 0,
    critRatePercent: 8,
    armorPenPercent: 15,
    trueDamageBonus: 10,
    description: 'Đại bác hạt phản vật chất siêu cấp, thổi bay lá chắn địch với +45% sát thương và 15% xuyên giáp.',
    icon: '💥',
    color: '#fbbf24',
    costGold: 2500000,
  },
  loader_hyperfeed_s: {
    id: 'loader_hyperfeed_s',
    name: 'Hyper-Feed Infinite Chamber',
    vietnameseName: 'Bộ Nạp Vô Cực Hyper-Feed',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'S',
    damageBonusPercent: 0,
    fireRateBonusPercent: 40,
    critRatePercent: 10,
    armorPenPercent: 6,
    trueDamageBonus: 8,
    description: 'Cơ chế nạp hạt vi mô tức thời, gia tăng cực đại 40% tốc độ xả đạn và 10% bạo kích.',
    icon: '⚡',
    color: '#fbbf24',
    costGold: 4000000,
  },
  core_supernova_s: {
    id: 'core_supernova_s',
    name: 'Supernova Singularity Core',
    vietnameseName: 'Lõi Siêu Tân Tinh Tối Thượng',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'S',
    damageBonusPercent: 30,
    fireRateBonusPercent: 30,
    critRatePercent: 8,
    armorPenPercent: 12,
    trueDamageBonus: 12,
    description: 'Trái tim của một ngôi sao đang nổ tung, tăng mãnh liệt 30% sát thương, 30% tốc bắn và +12 sát thương chuẩn!',
    icon: '👑',
    color: '#fbbf24',
    costGold: 8000000,
  },
  barrel_neutron_s: {
    id: 'barrel_neutron_s',
    name: 'Neutron Density Cannon',
    vietnameseName: 'Nòng Neutron Nén Trọng Lực',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'S',
    damageBonusPercent: 52,
    fireRateBonusPercent: 0,
    critRatePercent: 10,
    armorPenPercent: 18,
    trueDamageBonus: 15,
    description: 'Bắn các hạt neutron tỷ trọng siêu đặc, gây choáng ngợp với +52% sát thương và 18% xuyên giáp.',
    icon: '🪐',
    color: '#fbbf24',
    costGold: 5500000,
  },
  loader_tachyon_s: {
    id: 'loader_tachyon_s',
    name: 'Tachyon Hyper-Booster',
    vietnameseName: 'Bộ Nạp Siêu Quang Tachyon',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'S',
    damageBonusPercent: 0,
    fireRateBonusPercent: 48,
    critRatePercent: 12,
    armorPenPercent: 8,
    trueDamageBonus: 10,
    description: 'Vận chuyển đạn nhanh hơn tốc độ ánh sáng qua hạt Tachyon, tăng vọt 48% nhịp bắn và 12% bạo kích.',
    icon: '🌠',
    color: '#fbbf24',
    costGold: 7000000,
  },
  core_pulsar_s: {
    id: 'core_pulsar_s',
    name: 'Pulsar Magnetar Core',
    vietnameseName: 'Lõi Sao Xung Từ Tính Cực Biến',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'S',
    damageBonusPercent: 38,
    fireRateBonusPercent: 38,
    critRatePercent: 10,
    armorPenPercent: 15,
    trueDamageBonus: 16,
    description: 'Phát xạ xung điện từ cực đại từ sao xung Magnetar, tăng 38% sát thương, 38% tốc bắn và +16 ST chuẩn.',
    icon: '💫',
    color: '#fbbf24',
    costGold: 10000000,
  },
  barrel_gamma_ray_s: {
    id: 'barrel_gamma_ray_s',
    name: 'Gamma Ray Burst Projector',
    vietnameseName: 'Nòng Tia Gamma Thiêu Đốt',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'S',
    damageBonusPercent: 58,
    fireRateBonusPercent: 0,
    critRatePercent: 12,
    armorPenPercent: 20,
    trueDamageBonus: 20,
    description: 'Chùm tia năng lượng tử ngoại Gamma hủy diệt mọi giáp trụ với +58% sát thương và 20% xuyên giáp.',
    icon: '☢️',
    color: '#fbbf24',
    costGold: 12500000,
  },
  loader_sublight_s: {
    id: 'loader_sublight_s',
    name: 'Sub-Light Pulse Accelerator',
    vietnameseName: 'Bộ Nạp Cận Quang Tốc',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'S',
    damageBonusPercent: 0,
    fireRateBonusPercent: 55,
    critRatePercent: 14,
    armorPenPercent: 10,
    trueDamageBonus: 14,
    description: 'Cơ chế nạp đạn xấp xỉ quang tốc, xả bão đạn điên cuồng với +55% tốc độ bắn.',
    icon: '✨',
    color: '#fbbf24',
    costGold: 15000000,
  },

  // ========================================================
  // --- TIER SS & MYTHIC ACCESSORIES (25,000,000 - 100,000,000 VÀNG) ---
  // ========================================================
  barrel_void_piercer_ss: {
    id: 'barrel_void_piercer_ss',
    name: 'Void Piercer Cataclysm Cannon',
    vietnameseName: 'Nòng Xuyên Thấu Hư Không SS',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'SS',
    damageBonusPercent: 68,
    fireRateBonusPercent: 0,
    critRatePercent: 15,
    armorPenPercent: 25,
    trueDamageBonus: 25,
    description: 'Hỏa pháo xé rách ranh giới không gian, ban tặng +68% sát thương, 25% xuyên giáp và 15% bạo kích.',
    icon: '🌌',
    color: '#f43f5e',
    costGold: 25000000,
  },
  loader_chrono_warp_ss: {
    id: 'loader_chrono_warp_ss',
    name: 'Chrono-Warp Phase Feeder',
    vietnameseName: 'Hộp Nạp Gập Không Thời Gian SS',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'SS',
    damageBonusPercent: 0,
    fireRateBonusPercent: 65,
    critRatePercent: 16,
    armorPenPercent: 15,
    trueDamageBonus: 20,
    description: 'Gập khúc không gian đưa đạn từ tương lai về buồng phóng, tăng 65% tốc bắn và 16% bạo kích.',
    icon: '⏳',
    color: '#f43f5e',
    costGold: 32000000,
  },
  core_event_horizon_ss: {
    id: 'core_event_horizon_ss',
    name: 'Event Horizon Singularity Matrix',
    vietnameseName: 'Trọng Tâm Chân Trời Biến Sự SS',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'SS',
    damageBonusPercent: 48,
    fireRateBonusPercent: 48,
    critRatePercent: 15,
    armorPenPercent: 20,
    trueDamageBonus: 30,
    description: 'Lực hút vô tận của hố đen nuốt trọn kẻ thù, tăng 48% sát thương, 48% tốc bắn và +30 sát thương chuẩn.',
    icon: '🕳️',
    color: '#f43f5e',
    costGold: 40000000,
  },
  barrel_celestial_god_ss: {
    id: 'barrel_celestial_god_ss',
    name: 'Celestial God Genesis Rail',
    vietnameseName: 'Thần Nòng Khởi Nguyên Thiên Hà SS',
    slot: 'barrel',
    slotLabel: 'NÒNG SÚNG',
    tier: 'SS',
    damageBonusPercent: 78,
    fireRateBonusPercent: 0,
    critRatePercent: 18,
    armorPenPercent: 30,
    trueDamageBonus: 35,
    description: 'Được rèn từ tàn tích của chòm sao thần thánh cổ xưa, tăng cực khủng 78% sát thương và 30% xuyên giáp.',
    icon: '🔱',
    color: '#e11d48',
    costGold: 55000000,
  },
  loader_quantum_matrix_ss: {
    id: 'loader_quantum_matrix_ss',
    name: 'Multiverse Quantum Chamber',
    vietnameseName: 'Bộ Nạp Ma Trận Lượng Tử Đa Chiều SS',
    slot: 'loader',
    slotLabel: 'BỘ NẠP ĐẠN',
    tier: 'SS',
    damageBonusPercent: 0,
    fireRateBonusPercent: 75,
    critRatePercent: 20,
    armorPenPercent: 18,
    trueDamageBonus: 28,
    description: 'Kéo đạn dược từ hàng vạn vũ trụ song song, tăng 75% tốc độ bắn kinh hoàng và 20% bạo kích.',
    icon: '🔮',
    color: '#e11d48',
    costGold: 68000000,
  },
  core_big_bang_ss: {
    id: 'core_big_bang_ss',
    name: 'Primordial Big Bang Core',
    vietnameseName: 'Lõi Đại Bộc Phá Big Bang SS',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'SS',
    damageBonusPercent: 60,
    fireRateBonusPercent: 60,
    critRatePercent: 20,
    armorPenPercent: 25,
    trueDamageBonus: 45,
    description: 'Sức mạnh của khoảnh khắc khai sinh vũ trụ, tăng 60% sát thương, 60% tốc bắn và +45 sát thương chuẩn.',
    icon: '💥',
    color: '#e11d48',
    costGold: 80000000,
  },
  core_omniversal_primordial: {
    id: 'core_omniversal_primordial',
    name: 'Omniversal Primordial God Core',
    vietnameseName: 'Lõi Thần Ma Trận Vũ Trụ Cực Đạo',
    slot: 'core',
    slotLabel: 'LÕI PHỤ KIỆN',
    tier: 'MYTHIC',
    damageBonusPercent: 95,
    fireRateBonusPercent: 95,
    critRatePercent: 30,
    armorPenPercent: 35,
    trueDamageBonus: 80,
    description: 'TUYỆT PHẨM ĐỈNH CAO 100 TRIỆU VÀNG: Sức mạnh chi phối vạn vật vũ trụ! Tăng 95% sát thương, 95% tốc bắn, 30% bạo kích, 35% xuyên giáp và +80 sát thương chuẩn!',
    icon: '💠',
    color: '#fb7185',
    costGold: 100000000, // 100,000,000 Vàng
  },
};

export function calculateAccessoryBonuses(installedAccessoryIds: string[]): {
  damagePercent: number;
  fireRatePercent: number;
  critRatePercent: number;
  armorPenPercent: number;
  trueDamageBonus: number;
  maxHpBonus: number;
  maxArmorBonus: number;
} {
  let damagePercent = 0;
  let fireRatePercent = 0;
  let critRatePercent = 0;
  let armorPenPercent = 0;
  let trueDamageBonus = 0;
  let maxHpBonus = 0;
  let maxArmorBonus = 0;

  for (const accId of installedAccessoryIds) {
    const acc = WEAPON_ACCESSORIES[accId];
    if (acc) {
      damagePercent += acc.damageBonusPercent || 0;
      fireRatePercent += acc.fireRateBonusPercent || 0;
      critRatePercent += acc.critRatePercent || 0;
      armorPenPercent += acc.armorPenPercent || 0;
      trueDamageBonus += acc.trueDamageBonus || 0;
    }
  }

  return { damagePercent, fireRatePercent, critRatePercent, armorPenPercent, trueDamageBonus, maxHpBonus, maxArmorBonus };
}

// ==========================================
// FIGHTER STAR RANK & SHARDS SYSTEM
// Nâng Cấp Sao Máy Bay Bằng Mảnh Trùng Lặp
// ==========================================
export const MAX_FIGHTER_STARS = 6;

export interface FighterStarBonus {
  star: number;
  hpBonusPercent: number;
  armorBonusPercent: number;
  damageBonusPercent: number;
  speedBonusPercent: number;
  critRateBonus: number;
  defenseBonus: number;
  trueDamageBonus: number;
  cooldownReductionPercent: number;
}

export interface FighterStarConfig {
  star: number;
  requiredShards: number;
  requiredGold: number;
  title: string;
  bonus: FighterStarBonus;
}

export const FIGHTER_STAR_CONFIGS: Record<number, FighterStarConfig> = {
  1: {
    star: 1,
    requiredShards: 0,
    requiredGold: 0,
    title: '★1 Tiêu Chuẩn',
    bonus: {
      star: 1,
      hpBonusPercent: 0,
      armorBonusPercent: 0,
      damageBonusPercent: 0,
      speedBonusPercent: 0,
      critRateBonus: 0,
      defenseBonus: 0,
      trueDamageBonus: 0,
      cooldownReductionPercent: 0,
    },
  },
  2: {
    star: 2,
    requiredShards: 30,
    requiredGold: 30000,
    title: '★2 Cường Hóa',
    bonus: {
      star: 2,
      hpBonusPercent: 15,
      armorBonusPercent: 15,
      damageBonusPercent: 15,
      speedBonusPercent: 5,
      critRateBonus: 3,
      defenseBonus: 5,
      trueDamageBonus: 5,
      cooldownReductionPercent: 5,
    },
  },
  3: {
    star: 3,
    requiredShards: 60,
    requiredGold: 80000,
    title: '★3 Đột Phá',
    bonus: {
      star: 3,
      hpBonusPercent: 30,
      armorBonusPercent: 30,
      damageBonusPercent: 30,
      speedBonusPercent: 10,
      critRateBonus: 6,
      defenseBonus: 10,
      trueDamageBonus: 12,
      cooldownReductionPercent: 10,
    },
  },
  4: {
    star: 4,
    requiredShards: 120,
    requiredGold: 250000,
    title: '★4 Siêu Việt',
    bonus: {
      star: 4,
      hpBonusPercent: 50,
      armorBonusPercent: 50,
      damageBonusPercent: 50,
      speedBonusPercent: 15,
      critRateBonus: 10,
      defenseBonus: 16,
      trueDamageBonus: 22,
      cooldownReductionPercent: 15,
    },
  },
  5: {
    star: 5,
    requiredShards: 250,
    requiredGold: 600000,
    title: '★5 Cực Hạn',
    bonus: {
      star: 5,
      hpBonusPercent: 75,
      armorBonusPercent: 75,
      damageBonusPercent: 75,
      speedBonusPercent: 20,
      critRateBonus: 15,
      defenseBonus: 24,
      trueDamageBonus: 35,
      cooldownReductionPercent: 20,
    },
  },
  6: {
    star: 6,
    requiredShards: 500,
    requiredGold: 1500000,
    title: '★6 Thần Khởi Tối Thượng',
    bonus: {
      star: 6,
      hpBonusPercent: 100,
      armorBonusPercent: 100,
      damageBonusPercent: 100,
      speedBonusPercent: 25,
      critRateBonus: 20,
      defenseBonus: 35,
      trueDamageBonus: 55,
      cooldownReductionPercent: 25,
    },
  },
};

export function getFighterStarBonus(starLevel: number = 1): FighterStarBonus {
  const clamped = Math.max(1, Math.min(MAX_FIGHTER_STARS, starLevel));
  return FIGHTER_STAR_CONFIGS[clamped]?.bonus || FIGHTER_STAR_CONFIGS[1].bonus;
}

export function getFighterStarUpgradeCost(currentStar: number = 1): {
  shards: number;
  gold: number;
  maxed: boolean;
  nextStar: number;
} {
  const nextStar = currentStar + 1;
  if (nextStar > MAX_FIGHTER_STARS) {
    return { shards: 0, gold: 0, maxed: true, nextStar: currentStar };
  }
  const nextCfg = FIGHTER_STAR_CONFIGS[nextStar];
  return {
    shards: nextCfg.requiredShards,
    gold: nextCfg.requiredGold,
    maxed: false,
    nextStar,
  };
}

export function canUpgradeFighterStar(
  currentStar: number,
  shards: number,
  gold: number
): boolean {
  if (currentStar >= MAX_FIGHTER_STARS) return false;
  const cost = getFighterStarUpgradeCost(currentStar);
  return shards >= cost.shards && gold >= cost.gold;
}

export function upgradeFighterStar(
  fighterId: string,
  starOrStars: number | Record<string, number>,
  shardsOrShardsMap: number | Record<string, number>,
  gold: number
): {
  success: boolean;
  newStar: number;
  remainingShards: number;
  remainingGold: number;
  newStars: Record<string, number>;
  newShards: Record<string, number>;
  newGold: number;
  message: string;
} {
  const currentStar: number =
    typeof starOrStars === 'number'
      ? starOrStars
      : (starOrStars && starOrStars[fighterId]) || 1;

  const shards: number =
    typeof shardsOrShardsMap === 'number'
      ? shardsOrShardsMap
      : (shardsOrShardsMap && shardsOrShardsMap[fighterId]) || 0;

  const currentStarsMap: Record<string, number> =
    typeof starOrStars === 'object' && starOrStars !== null
      ? { ...starOrStars }
      : { [fighterId]: currentStar };

  const currentShardsMap: Record<string, number> =
    typeof shardsOrShardsMap === 'object' && shardsOrShardsMap !== null
      ? { ...shardsOrShardsMap }
      : { [fighterId]: shards };

  if (currentStar >= MAX_FIGHTER_STARS) {
    return {
      success: false,
      newStar: currentStar,
      remainingShards: shards,
      remainingGold: gold,
      newStars: currentStarsMap,
      newShards: currentShardsMap,
      newGold: gold,
      message: 'Chiến cơ đã đạt đẳng cấp Sao tối đa!',
    };
  }

  const cost = getFighterStarUpgradeCost(currentStar);
  if (shards < cost.shards) {
    return {
      success: false,
      newStar: currentStar,
      remainingShards: shards,
      remainingGold: gold,
      newStars: currentStarsMap,
      newShards: currentShardsMap,
      newGold: gold,
      message: `Cần thêm ${cost.shards - shards} Mảnh chiến cơ để nâng cấp!`,
    };
  }

  if (gold < cost.gold) {
    return {
      success: false,
      newStar: currentStar,
      remainingShards: shards,
      remainingGold: gold,
      newStars: currentStarsMap,
      newShards: currentShardsMap,
      newGold: gold,
      message: `Cần thêm ${(cost.gold - gold).toLocaleString()} Vàng để nâng cấp!`,
    };
  }

  const newStar = cost.nextStar;
  const remainingShards = shards - cost.shards;
  const remainingGold = gold - cost.gold;

  return {
    success: true,
    newStar,
    remainingShards,
    remainingGold,
    newStars: { ...currentStarsMap, [fighterId]: newStar },
    newShards: { ...currentShardsMap, [fighterId]: remainingShards },
    newGold: remainingGold,
    message: `Đột phá thành công chiến cơ lên ${FIGHTER_STAR_CONFIGS[cost.nextStar].title}!`,
  };
}

// Gold reward per battle calculation
export const STARTING_GOLD = 200000; // 200k vàng khởi đầu

export function calculateGoldReward(
  score: number,
  enemiesKilled: number,
  wave: number,
  difficulty: DifficultyLevel = 'normal',
  isVictory: boolean = false
): number {
  const diffMultiplier = difficulty === 'hard' ? 2.0 : difficulty === 'easy' ? 0.8 : 1.2;
  const base = Math.floor(wave * 25000 + enemiesKilled * 3000 + score * 0.4);
  const victoryBonus = isVictory ? 500000 : 0;
  const rawTotal = Math.round((base + victoryBonus) * diffMultiplier);
  // Giảm 80% tài nguyên vàng nhận được khi kết thúc phần chơi (giữ lại 20%)
  const reducedTotal = Math.round(rawTotal * 0.2);
  return Math.max(10000, reducedTotal); // Tối thiểu 10,000 Vàng sau khi giảm 80%
}

// Gacha System Constants
export const STARTING_GEMS = 5000;
export const GACHA_SINGLE_COST = 200;
export const GACHA_TEN_COST = 1800;

export interface GachaItem {
  fighterId: string;
  name: string;
  vietnameseName: string;
  tier: FighterTier;
  color: string;
  isNew: boolean;
  duplicateBonusShards: number;
}

export interface PilotGachaItem {
  pilotId: string;
  name: string;
  callsign: string;
  vietnameseTitle: string;
  tier: PilotTier;
  avatarEmoji: string;
  color: string;
  isNew: boolean;
  duplicateBonusGems: number;
}

export const ASTRAEA_LIMITED_BANNER_DURATION_DAYS = 10;
export const ASTRAEA_LIMITED_BANNER_DURATION_MS = ASTRAEA_LIMITED_BANNER_DURATION_DAYS * 24 * 60 * 60 * 1000;

export function getAstraeaBannerStatus(
  startTimeMs: number,
  currentTimeMs: number = Date.now()
): {
  isActive: boolean;
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
} {
  const elapsed = Math.max(0, currentTimeMs - startTimeMs);
  const remainingMs = Math.max(0, ASTRAEA_LIMITED_BANNER_DURATION_MS - elapsed);
  const isActive = remainingMs > 0;

  const totalSecs = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const formattedCountdown = !isActive
    ? 'SỰ KIỆN ĐÃ KẾT THÚC'
    : `${days.toString().padStart(2, '0')} ngày ${hours.toString().padStart(2, '0')} giờ ${minutes.toString().padStart(2, '0')} phút ${seconds.toString().padStart(2, '0')} giây`;

  return {
    isActive,
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown,
  };
}

/**
 * Execute Fighter Gacha Summons
 * Duplicate roll returns Shards (Mảnh) for fighter promotion!
 * Tier B: 30 shards
 * Tier A: 60 shards
 * Tier S: 120 shards
 * If 10-day limited banner has expired, Astraea is removed from the S-tier pool.
 */
export function executeGachaPull(
  pullCount: 1 | 10,
  ownedFighterIds: string[],
  currentPityS: number,
  currentPityA: number,
  isAstraeaBannerActive: boolean = true
): {
  results: GachaItem[];
  newOwnedFighterIds: string[];
  newPityS: number;
  newPityA: number;
  totalGemsCost: number;
  duplicateShardsGranted: Record<string, number>;
} {
  const cost = pullCount === 10 ? GACHA_TEN_COST : GACHA_SINGLE_COST;
  const results: GachaItem[] = [];
  const ownedSet = new Set(ownedFighterIds);
  const duplicateShardsGranted: Record<string, number> = {};

  let pityS = currentPityS;
  let pityA = currentPityA;

  let tierSList = Object.values(FIGHTERS).filter((f) => f.tier === 'S');
  if (!isAstraeaBannerActive) {
    tierSList = tierSList.filter((f) => f.id !== 'astraea');
  }
  const tierAList = Object.values(FIGHTERS).filter((f) => f.tier === 'A');
  const tierBList = Object.values(FIGHTERS).filter((f) => f.tier === 'B');

  let hasTierAorS = false;

  for (let i = 0; i < pullCount; i++) {
    pityS++;
    pityA++;

    let chosenTier: FighterTier = 'B';
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

    // 10x Pull Guarantee: If 10th pull and still no Tier A or S, force at least Tier A
    if (pullCount === 10 && i === 9 && !hasTierAorS) {
      chosenTier = Math.random() * 100 < 10.0 ? 'S' : 'A';
      hasTierAorS = true;
      if (chosenTier === 'S') pityS = 0;
      pityA = 0;
    }

    // Pick random fighter from chosen tier pool
    const pool = chosenTier === 'S' ? tierSList : chosenTier === 'A' ? tierAList : tierBList;
    const selectedFighter = pool[Math.floor(Math.random() * pool.length)];

    const isNew = !ownedSet.has(selectedFighter.id);
    const shards = isNew ? 0 : selectedFighter.tier === 'S' ? 120 : selectedFighter.tier === 'A' ? 60 : 30;

    if (isNew) {
      ownedSet.add(selectedFighter.id);
    } else {
      duplicateShardsGranted[selectedFighter.id] = (duplicateShardsGranted[selectedFighter.id] || 0) + shards;
    }

    results.push({
      fighterId: selectedFighter.id,
      name: selectedFighter.name,
      vietnameseName: selectedFighter.vietnameseName,
      tier: selectedFighter.tier,
      color: selectedFighter.color,
      isNew,
      duplicateBonusShards: shards,
    });
  }

  return {
    results,
    newOwnedFighterIds: Array.from(ownedSet),
    newPityS: pityS,
    newPityA: pityA,
    totalGemsCost: cost,
    duplicateShardsGranted,
  };
}

/**
 * Execute Pilot Gacha Summons (Tay Lái Gacha)
 * Rates: S: 1.0%, A: 10.0%, B: 89.0%
 * 10x Guarantee: Guaranteed at least 1 Tier A or Tier S!
 */
export function executePilotGachaPull(
  pullCount: 1 | 10,
  ownedPilotIds: string[],
  currentPityS: number,
  currentPityA: number
): {
  results: PilotGachaItem[];
  newOwnedPilotIds: string[];
  newPityS: number;
  newPityA: number;
  totalGemsCost: number;
} {
  const cost = pullCount === 10 ? GACHA_TEN_COST : GACHA_SINGLE_COST;
  const results: PilotGachaItem[] = [];
  const ownedSet = new Set(ownedPilotIds);

  let pityS = currentPityS;
  let pityA = currentPityA;

  const tierSList = Object.values(PILOTS).filter((p) => p.tier === 'S');
  const tierAList = Object.values(PILOTS).filter((p) => p.tier === 'A');
  const tierBList = Object.values(PILOTS).filter((p) => p.tier === 'B');

  let hasTierAorS = false;

  for (let i = 0; i < pullCount; i++) {
    pityS++;
    pityA++;

    let chosenTier: PilotTier = 'B';
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

    // 10x Guarantee check
    if (pullCount === 10 && i === 9 && !hasTierAorS) {
      chosenTier = Math.random() * 100 < 10.0 ? 'S' : 'A';
      hasTierAorS = true;
      if (chosenTier === 'S') pityS = 0;
      pityA = 0;
    }

    const pool = chosenTier === 'S' ? tierSList : chosenTier === 'A' ? tierAList : tierBList;
    const selectedPilot = pool[Math.floor(Math.random() * pool.length)];

    const isNew = !ownedSet.has(selectedPilot.id);
    if (isNew) {
      ownedSet.add(selectedPilot.id);
    }

    results.push({
      pilotId: selectedPilot.id,
      name: selectedPilot.name,
      callsign: selectedPilot.callsign,
      vietnameseTitle: selectedPilot.vietnameseTitle,
      tier: selectedPilot.tier,
      avatarEmoji: selectedPilot.avatarEmoji,
      color: selectedPilot.color,
      isNew,
      duplicateBonusGems: isNew ? 0 : selectedPilot.tier === 'S' ? 500 : selectedPilot.tier === 'A' ? 200 : 50,
    });
  }

  return {
    results,
    newOwnedPilotIds: Array.from(ownedSet),
    newPityS: pityS,
    newPityA: pityA,
    totalGemsCost: cost,
  };
}

// Mission System
export type MissionDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardGems: number;
  rewardGold: number;
  difficulty: MissionDifficulty;
  completed: boolean;
  claimed: boolean;
  category: 'combat' | 'gacha' | 'powerup' | 'skill';
}

export const INITIAL_MISSIONS: Mission[] = [
  // --- DỄ (EASY) ---
  {
    id: 'first_sortie',
    title: 'Tân Binh Xuất Trận',
    description: 'Tham gia xuất kích ít nhất 1 trận chiến',
    target: 1,
    current: 0,
    rewardGems: 20,
    rewardGold: 10000,
    difficulty: 'easy',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'kill_enemies_easy',
    title: 'Thử Lửa Không Gian',
    description: 'Tiêu diệt 15 máy bay địch bất kỳ',
    target: 15,
    current: 0,
    rewardGems: 30,
    rewardGold: 15000,
    difficulty: 'easy',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'collect_boxes_easy',
    title: 'Thu Thập Quân Nhu',
    description: 'Thu thập 2 vật phẩm tiếp tế (Đạn [P], Khiên [S] hoặc Bom [B])',
    target: 2,
    current: 0,
    rewardGems: 25,
    rewardGold: 12000,
    difficulty: 'easy',
    completed: false,
    claimed: false,
    category: 'powerup',
  },
  {
    id: 'combo_easy',
    title: 'Chuỗi Công Kích Đầu Tiên',
    description: 'Đạt chuỗi Combo 5 hits trong trận đấu',
    target: 5,
    current: 0,
    rewardGems: 25,
    rewardGold: 12000,
    difficulty: 'easy',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'use_skill_easy',
    title: 'Kích Hoạt Tuyệt Kỹ',
    description: 'Sử dụng Tuyệt kỹ phi cơ [E] 1 lần trong trận chiến',
    target: 1,
    current: 0,
    rewardGems: 20,
    rewardGold: 10000,
    difficulty: 'easy',
    completed: false,
    claimed: false,
    category: 'skill',
  },

  // --- TRUNG BÌNH (NORMAL) ---
  {
    id: 'kill_enemies',
    title: 'Quét Sạch Không Phận',
    description: 'Tiêu diệt 40 máy bay địch bất kỳ',
    target: 40,
    current: 0,
    rewardGems: 120, // Giảm 90% từ 1,200 -> 120
    rewardGold: 30000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'trigger_bomb',
    title: 'Xung Kích Tần Số',
    description: 'Kích hoạt Bom EMP 2 lần trong trận chiến',
    target: 2,
    current: 0,
    rewardGems: 80, // Giảm 90% từ 800 -> 80
    rewardGold: 25000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'collect_boxes',
    title: 'Tiếp Tế Quân Nhu',
    description: 'Thu thập 5 Vật phẩm Tiếp tế (Cấp độ đạn [P], Khiên [S] hoặc Bom [B])',
    target: 5,
    current: 0,
    rewardGems: 150, // Giảm 90% từ 1,500 -> 150
    rewardGold: 35000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'powerup',
  },
  {
    id: 'do_gacha',
    title: 'Triệu Hồi Hạm Đội',
    description: 'Thực hiện ít nhất 1 lượt quay Gacha chiến cơ hoặc phi công',
    target: 1,
    current: 0,
    rewardGems: 100, // Giảm 90% từ 1,000 -> 100
    rewardGold: 25000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'gacha',
  },
  {
    id: 'reach_wave',
    title: 'Chặn Đứng Đợt Tấn Công',
    description: 'Đạt đến Wave 3 và đối đầu với hạm đội tiền tiêu',
    target: 3,
    current: 0,
    rewardGems: 250, // Giảm 90% từ 2,500 -> 250
    rewardGold: 45000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'use_skill',
    title: 'Tuyệt Kỹ Chiến Cơ',
    description: 'Sử dụng Tuyệt kỹ phi cơ [E] 3 lần trong trận',
    target: 3,
    current: 0,
    rewardGems: 100, // Giảm 90% từ 1,000 -> 100
    rewardGold: 30000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'skill',
  },
  {
    id: 'combo_normal',
    title: 'Tay Súng Điêu Luyện',
    description: 'Duy trì chuỗi Combo đạt mốc 10 hits liên hoàn',
    target: 10,
    current: 0,
    rewardGems: 75,
    rewardGold: 30000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'reach_score',
    title: 'Phi Công Huyền Thoại',
    description: 'Đạt mốc 8,000 điểm trong một lượt bay',
    target: 8000,
    current: 0,
    rewardGems: 300, // Giảm 90% từ 3,000 -> 300
    rewardGold: 50000,
    difficulty: 'normal',
    completed: false,
    claimed: false,
    category: 'combat',
  },

  // --- KHÓ (HARD) ---
  {
    id: 'kill_enemies_hard',
    title: 'Đại Chiến Không Gian',
    description: 'Tiêu diệt 100 máy bay địch trên mọi chiến trường',
    target: 100,
    current: 0,
    rewardGems: 180,
    rewardGold: 80000,
    difficulty: 'hard',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'boss_hunter',
    title: 'Thợ Săn Tinh Hệ',
    description: 'Đánh bại ít nhất 1 Trùm Chiến Hạm Không Gian',
    target: 1,
    current: 0,
    rewardGems: 200,
    rewardGold: 90000,
    difficulty: 'hard',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'reach_wave_hard',
    title: 'Vượt Sóng Sinh Tử',
    description: 'Vượt qua đợt sóng Wave 5 đầy cam go',
    target: 5,
    current: 0,
    rewardGems: 220,
    rewardGold: 100000,
    difficulty: 'hard',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'combo_hard',
    title: 'Bão Tố Liên Hoàn',
    description: 'Đạt chuỗi Combo 15 hits liên tiếp không gián đoạn',
    target: 15,
    current: 0,
    rewardGems: 160,
    rewardGold: 85000,
    difficulty: 'hard',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'reach_score_hard',
    title: 'Chiến Công Hiển Hách',
    description: 'Đạt mốc 25,000 điểm trong một lượt bay',
    target: 25000,
    current: 0,
    rewardGems: 240,
    rewardGold: 120000,
    difficulty: 'hard',
    completed: false,
    claimed: false,
    category: 'combat',
  },

  // --- CỰC HẠN / ÁC MỘNG (NIGHTMARE) ---
  {
    id: 'kill_enemies_nightmare',
    title: 'Càn Quét Thiên Hà',
    description: 'Tiêu diệt 250 máy bay địch tinh nhuệ',
    target: 250,
    current: 0,
    rewardGems: 300,
    rewardGold: 200000,
    difficulty: 'nightmare',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'reach_wave_nightmare',
    title: 'Chinh Phục Tinh Cầu',
    description: 'Đạt mốc Wave 8 trong chế độ vô tận hoặc hoàn tất bản đồ vũ trụ',
    target: 8,
    current: 0,
    rewardGems: 350,
    rewardGold: 250000,
    difficulty: 'nightmare',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'combo_nightmare',
    title: 'Thần Thoại Bất Bại',
    description: 'Chạm tới đỉnh cao GODLIKE với chuỗi Combo 20 hits tối đa',
    target: 20,
    current: 0,
    rewardGems: 280,
    rewardGold: 220000,
    difficulty: 'nightmare',
    completed: false,
    claimed: false,
    category: 'combat',
  },
  {
    id: 'reach_score_nightmare',
    title: 'Chiến Thần Vũ Trụ',
    description: 'Đạt kỷ lục phi thường 50,000 điểm trong một lượt bay',
    target: 50000,
    current: 0,
    rewardGems: 400,
    rewardGold: 300000,
    difficulty: 'nightmare',
    completed: false,
    claimed: false,
    category: 'combat',
  },
];

/**
 * Updates a mission's progress and marks completed if target reached
 */
export function updateMissionProgress(
  missions: Mission[],
  missionId: string,
  amount: number,
  isAbsolute: boolean = false
): { updatedMissions: Mission[]; newlyCompleted: boolean } {
  let newlyCompleted = false;

  const updatedMissions = missions.map((m) => {
    if (m.id !== missionId || m.claimed) return m;

    const nextCurrent = isAbsolute ? Math.max(m.current, amount) : m.current + amount;
    const isNowComplete = nextCurrent >= m.target;

    if (isNowComplete && !m.completed) {
      newlyCompleted = true;
    }

    return {
      ...m,
      current: Math.min(m.target, nextCurrent),
      completed: isNowComplete,
    };
  });

  return { updatedMissions, newlyCompleted };
}

/**
 * Claims a completed mission's reward gems and gold
 */
export function claimMissionReward(
  missions: Mission[],
  missionId: string
): { updatedMissions: Mission[]; rewardGems: number; rewardGold: number } {
  let rewardGems = 0;
  let rewardGold = 0;

  const updatedMissions = missions.map((m) => {
    if (m.id === missionId && m.completed && !m.claimed) {
      rewardGems = m.rewardGems;
      rewardGold = m.rewardGold || 0;
      return { ...m, claimed: true };
    }
    return m;
  });

  return { updatedMissions, rewardGems, rewardGold };
}

export interface CircleCollider {
  x: number;
  y: number;
  radius: number;
}

/**
 * Checks circle-circle collision between two entities
 */
export function checkCircleCollision(a: CircleCollider, b: CircleCollider): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distSq = dx * dx + dy * dy;
  const radSum = a.radius + b.radius;
  return distSq <= radSum * radSum;
}

/**
 * Calculates score earned for destroying an enemy
 */
export function calculateEnemyScore(basePoints: number, comboMultiplier: number, wave: number): number {
  const waveBonus = 1 + (wave - 1) * 0.15;
  return Math.round(basePoints * comboMultiplier * waveBonus);
}

/**
 * Checks if a combo milestone has been reached (e.g. crossing every 50 hits: 50, 100, 150, 200...).
 * Returns the milestone number if crossed in this hit, or null if no new milestone was crossed.
 */
export function checkComboMilestone(
  prevCombo: number,
  currentCombo: number,
  step: number = 50
): number | null {
  if (currentCombo <= 0 || step <= 0) return null;
  if (currentCombo <= prevCombo) return null;
  const prevTier = Math.floor(prevCombo / step);
  const currentTier = Math.floor(currentCombo / step);
  if (currentTier > prevTier && currentTier > 0) {
    return currentTier * step;
  }
  return null;
}

/**
 * Updates combo count and timer.
 * If time since last hit <= comboWindowMs, increments combo (capped at maxCombo).
 * Otherwise resets combo to 1.
 */
export function updateCombo(
  currentCombo: number,
  lastHitTime: number,
  currentTime: number,
  comboWindowMs: number = 2500,
  maxCombo: number = 999
): { combo: number; lastHitTime: number } {
  if (lastHitTime > 0 && currentTime - lastHitTime <= comboWindowMs) {
    return {
      combo: Math.min(currentCombo + 1, maxCombo),
      lastHitTime: currentTime,
    };
  }
  return {
    combo: 1,
    lastHitTime: currentTime,
  };
}

/**
 * Calculates multiplier from combo count with progressive reward tiers for sustaining high combos
 */
export function getComboMultiplier(combo: number): number {
  if (combo <= 1) return 1.0;
  if (combo <= 5) return 1.2;
  if (combo <= 10) return 1.5;
  if (combo <= 15) return 2.0;
  if (combo < 50) return 3.0; // 20-49 hits
  if (combo < 100) return 3.5; // 50-99 hits
  if (combo < 150) return 4.0; // 100-149 hits
  if (combo < 200) return 4.5; // 150-199 hits
  return 5.0; // 200+ hits
}

/**
 * Calculates weapon spread and bullet count based on weapon level (1 to 5)
 */
export function getWeaponUpgradeSpecs(level: number): {
  bulletCount: number;
  spreadAngleDeg: number;
  damageMultiplier: number;
  hasSideGuns: boolean;
} {
  const clamped = Math.max(1, Math.min(5, Math.floor(level)));
  switch (clamped) {
    case 1:
      return { bulletCount: 1, spreadAngleDeg: 0, damageMultiplier: 1.0, hasSideGuns: false };
    case 2:
      return { bulletCount: 2, spreadAngleDeg: 6, damageMultiplier: 1.15, hasSideGuns: false };
    case 3:
      return { bulletCount: 3, spreadAngleDeg: 16, damageMultiplier: 1.3, hasSideGuns: true };
    case 4:
      return { bulletCount: 4, spreadAngleDeg: 24, damageMultiplier: 1.5, hasSideGuns: true };
    case 5:
    default:
      return { bulletCount: 5, spreadAngleDeg: 34, damageMultiplier: 1.8, hasSideGuns: true };
  }
}

/**
 * Special weapon types granted by gift boxes
 */
export type SpecialWeaponType = 'none' | 'laser' | 'lightning';

export interface SpecialWeaponSpecs {
  type: SpecialWeaponType;
  name: string;
  vietnameseName: string;
  description: string;
  color: string;
  accentColor: string;
  baseDuration: number;
  maxDuration: number;
  bulletDamage: number;
  fireRate: number;
}

export const SPECIAL_WEAPONS: Record<SpecialWeaponType, SpecialWeaponSpecs> = {
  none: {
    type: 'none',
    name: 'Standard Plasma',
    vietnameseName: 'Đạn Tiêu Chuẩn',
    description: 'Hỏa lực cơ bản theo từng loại chiến cơ',
    color: '#38bdf8',
    accentColor: '#0284c7',
    baseDuration: 0,
    maxDuration: 0,
    bulletDamage: 20,
    fireRate: 8,
  },
  laser: {
    type: 'laser',
    name: 'Hyper Laser',
    vietnameseName: 'Đạn Laser Xuyên Thấu',
    description: 'Tia laser cực đại quét sạch hàng dọc kẻ thù',
    color: '#f43f5e',
    accentColor: '#fb7185',
    baseDuration: 15,
    maxDuration: 30,
    bulletDamage: 36,
    fireRate: 14,
  },
  lightning: {
    type: 'lightning',
    name: 'Tesla Storm',
    vietnameseName: 'Đạn Sấm Sét Lan Tỏa',
    description: 'Luồng sét cao thế giật truyền chuỗi đa mục tiêu',
    color: '#06b6d4',
    accentColor: '#67e8f9',
    baseDuration: 15,
    maxDuration: 30,
    bulletDamage: 30,
    fireRate: 9,
  },
};

/**
 * Calculates updated duration when picking up a special weapon gift box
 */
export function calculateSpecialWeaponDuration(
  currentWeapon: SpecialWeaponType,
  newWeapon: SpecialWeaponType,
  currentRemaining: number,
  addedSeconds: number = 15,
  maxCap: number = 30
): { weapon: SpecialWeaponType; duration: number } {
  if (currentWeapon === newWeapon) {
    return {
      weapon: newWeapon,
      duration: Math.min(maxCap, currentRemaining + addedSeconds),
    };
  }
  return {
    weapon: newWeapon,
    duration: addedSeconds,
  };
}

/**
 * Calculates chained lightning targets within max chain distance
 */
export function findLightningChainTargets<T extends { x: number; y: number; id: number }>(
  startX: number,
  startY: number,
  candidates: T[],
  maxChainCount: number = 3,
  maxDistance: number = 260
): T[] {
  const chained: T[] = [];
  const visited = new Set<number>();

  let currX = startX;
  let currY = startY;

  for (let step = 0; step < maxChainCount; step++) {
    let nearest: T | null = null;
    let nearestDist = Infinity;

    for (const c of candidates) {
      if (visited.has(c.id)) continue;
      const dist = Math.hypot(c.x - currX, c.y - currY);
      if (dist <= maxDistance && dist < nearestDist) {
        nearestDist = dist;
        nearest = c;
      }
    }

    if (!nearest) break;

    chained.push(nearest);
    visited.add(nearest.id);
    currX = nearest.x;
    currY = nearest.y;
  }

  return chained;
}

/**
 * Clamps numeric value between min and max
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Spawning difficulty progression based on elapsed wave and game time
 */
export function getSpawnInterval(wave: number): number {
  // Waves 1 to 10: starts at 1.8s, drops down to 0.7s
  return Math.max(0.65, 1.8 - (wave - 1) * 0.12);
}

/**
 * Determines boss spawn condition
 */
export function shouldSpawnBoss(wave: number, score: number, lastBossScore: number): boolean {
  // Boss spawns every 3 waves or every 3500 points
  return wave > 0 && wave % 3 === 0 && score - lastBossScore >= 2000;
}

// ==========================================
// DAILY LOGIN BONUS SYSTEM (24-Hour Cycle & 7-Day Streak Rewards)
// ==========================================

export interface CosmeticSkin {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  tag: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  rarity: 'S' | 'EX' | 'Epic' | 'HUYỀN THOẠI';
  icon: string;
  targetFighterId?: string;
}

export const COSMETIC_SKINS: Record<string, CosmeticSkin> = {
  skin_rts88_neon_violet: {
    id: 'skin_rts88_neon_violet',
    name: 'RTS-88 Cyber Neon Violet',
    vietnameseName: 'RTS-88 Tia Chớp Tím Neon (Epic)',
    description: 'Trang phục Epic Tím Neon tương lai độc quyền cho RTS-88 Tia Chớp. Thân cơ giáp phủ hợp kim đen Obsidian viền dải đèn LED Neon tím phát sáng rực rỡ, nòng pháo Tesla phát ra chùm lôi quang Tím Neon tuyệt mỹ và ngọn lửa đuôi cực quang tím ma mị.',
    tag: 'RTS-88 EPIC NEON VIOLET',
    primaryColor: '#a855f7',
    secondaryColor: '#d946ef',
    glowColor: 'rgba(168, 85, 247, 0.95)',
    rarity: 'Epic',
    icon: '💜',
    targetFighterId: 'rts_88',
  },
  skin_rts88_ark_one: {
    id: 'skin_rts88_ark_one',
    name: 'RTS-88 Kamen Rider Ark-One [HUYỀN THOẠI]',
    vietnameseName: 'RTS-88 Kamen Rider Ark-One Ác Ma [HUYỀN THOẠI]',
    description: 'Trang phục HUYỀN THOẠI tối thượng chủ đề Kamen Rider Ark-One - Hiện thân của Ác Ý & Hủy Diệt Tối Thượng (Conclusion: Malice & Ruin). Khung giáp cơ khí bất đối xứng trắng sứ và hắc thạch Obsidian, buồng lái Mắt Quỷ Đỏ Ark rực cháy ác ý. Phía sau phi cơ có Vòng Tròn Ark-One xoay tròn phát quang ma mị liên tục. Khai hỏa chùm Tia Sấm Sét Đỏ Đen Ác Quỷ Uốn Cong xé rách không gian kèm âm thanh Ark-One rền vang uy lực.',
    tag: 'HUYỀN THOẠI · KAMEN RIDER ARK-ONE',
    primaryColor: '#09090b',
    secondaryColor: '#ff0033',
    glowColor: 'rgba(255, 0, 51, 0.95)',
    rarity: 'HUYỀN THOẠI',
    icon: '🔴',
    targetFighterId: 'rts_88',
  },
  skin_lx88_royal_gold: {
    id: 'skin_lx88_royal_gold',
    name: 'LX-88 Royal Sovereign Gold [HUYỀN THOẠI]',
    vietnameseName: 'LX-88 Hoàng Kim Đế Vương [HUYỀN THOẠI]',
    description: 'Trang phục HUYỀN THOẠI mạ vàng hoàng gia 24K siêu đỉnh cho LX-88. Thân phi cơ đúc bằng hợp kim hoàng kim nguyên khối nạm đá quý hoàng tộc, có các viên kim cương và đá quý đa sắc bay xoay tròn lơ lửng quanh máy bay phát sáng lấp lánh. Khai hỏa chùm Thánh Quang Đế Vương ngân vang chuông thánh quang rực rỡ kèm bão bụi vàng kim cương lộng lẫy.',
    tag: 'HUYỀN THOẠI · HOÀNG GIA ĐẾ VƯƠNG',
    primaryColor: '#fbbf24',
    secondaryColor: '#fef08a',
    glowColor: 'rgba(251, 191, 36, 0.95)',
    rarity: 'HUYỀN THOẠI',
    icon: '👑',
    targetFighterId: 'arc_tempest',
  },
  skin_lx88_vampire: {
    id: 'skin_lx88_vampire',
    name: 'LX-88 Crimson Vampire Lord [HUYỀN THOẠI]',
    vietnameseName: 'LX-88 Huyết Dạ Ma Cà Rồng [HUYỀN THOẠI]',
    description: 'Trang phục HUYỀN THOẠI Ma Cà Rồng tối thượng cho LX-88. Thân phi cơ tạo hình cánh dơi Gothic hắc thạch viền huyết ngọc, buồng lái Mắt Quỷ Đỏ Thẫm đập nhịp tim ma cà rồng, 4 luồng Thủy Đỏ ma thuật bay zick zack uốn lượn liên tục quanh thân máy bay. Khai hỏa chùm Laser Huyết Tinh rền vang tiếng rít ma cà rồng ghê rợn, kèm bầy dơi đêm và hiệu ứng Hút Máu Huyết Nguyệt tối thượng.',
    tag: 'HUYỀN THOẠI · MA CÀ RỒNG HUYẾT DẠ',
    primaryColor: '#e11d48',
    secondaryColor: '#881337',
    glowColor: 'rgba(225, 29, 72, 0.95)',
    rarity: 'HUYỀN THOẠI',
    icon: '🧛',
    targetFighterId: 'arc_tempest',
  },
  skin_solaris_cyberpunk: {
    id: 'skin_solaris_cyberpunk',
    name: 'ZX-99 Cyberpunk Overdrive',
    vietnameseName: 'ZX-99 Thái Dương Cyberpunk (Neon Overdrive)',
    description: 'Chủ đề Cyberpunk tương lai thập niên 2099 cho ZX-99. Dải đèn LED neon hồng cánh sen và xanh lam phản quang, bo mạch năng lượng 3D, phóng ra các quả cầu plasma neon rực cháy và luồng xả sóng synthwave.',
    tag: 'CYBERPUNK NEON 2099',
    primaryColor: '#ff007f',
    secondaryColor: '#00f2fe',
    glowColor: 'rgba(255, 0, 127, 0.85)',
    rarity: 'S',
    icon: '⚡',
    targetFighterId: 'solaris',
  },
  skin_astraea_sakura: {
    id: 'skin_astraea_sakura',
    name: 'SX-77 Astral Cherry Blossom [Epic]',
    vietnameseName: 'SX-77 Tinh Cầu Hoa Anh Đào [Epic]',
    description: 'Trang phục EPIC Hoa Anh Đào Thần Mộc tuyệt mỹ cho SX-77. Khung chiến cơ ngọc hồng anh đào thanh nhã viền cánh hoa nở rộ, đài buồng lái pha lê mùa xuân tỏa hương hoa, các cánh hoa anh đào phát sáng lượn lờ quanh phi cơ. Khai hỏa chùm Đạn Hoa Anh Đào 5 Cánh xoay chuyển bung tỏa kèm bão cánh hoa đào rực rỡ.',
    tag: 'EPIC · HOA ANH ĐÀO THẦN MỘC',
    primaryColor: '#f472b6',
    secondaryColor: '#fbcfe8',
    glowColor: 'rgba(244, 114, 182, 0.95)',
    rarity: 'Epic',
    icon: '🌸',
    targetFighterId: 'astraea',
  },
  skin_chrono_void: {
    id: 'skin_chrono_void',
    name: 'TX-0 Dark Matter Void',
    vietnameseName: 'TX-0 Kỷ Nguyên Hư Không (Void Tachyon)',
    description: 'Chủ đề Hư Không Lượng Tử cho TX-0. Giáp kim loại đen Obsidian phủ viền tím ma mị, cuộn cảm biến Tachyon bẻ cong không thời gian, giải phóng sóng xung kích lượng tử làm chậm vạn vật.',
    tag: 'VOID DARK MATTER',
    primaryColor: '#7c3aed',
    secondaryColor: '#22d3ee',
    glowColor: 'rgba(124, 58, 237, 0.85)',
    rarity: 'S',
    icon: '🌀',
    targetFighterId: 'chrono',
  },
  skin_apocalypse_inferno: {
    id: 'skin_apocalypse_inferno',
    name: 'EX-Omega Infernal Hellfire',
    vietnameseName: 'EX-Omega Hỏa Ngục Tận Thế (Infernal Hellfire)',
    description: 'Chủ đề Ma Thần Hỏa Ngục Dung Nham cho EX-Omega. Giáp nung đỏ rực cháy từ lõi núi lửa ngầm, nòng pháo sừng quỷ cơ giáp phun ra đạn pháo hạt plasma nham thạch hủy diệt.',
    tag: 'INFERNAL HELLFIRE',
    primaryColor: '#dc2626',
    secondaryColor: '#f97316',
    glowColor: 'rgba(220, 38, 38, 0.9)',
    rarity: 'S',
    icon: '🔥',
    targetFighterId: 'apocalypse',
  },
  skin_victory_valkyrie: {
    id: 'skin_victory_valkyrie',
    name: 'VX-1 Fallen Moon Valkyrie',
    vietnameseName: 'VX-1 Nữ Thần Cánh Bạc (Fallen Valkyrie)',
    description: 'Chủ đề Valkyrie Ánh Trăng Thần Thoại cho VX-1. Đôi cánh bạc lông vũ ánh trăng thanh khiết, vòng hào quang thiên sứ hộ mệnh và ngọn giáo thánh quang bảo hộ phi cơ khỏi hiểm nguy.',
    tag: 'VALKYRIE MOONLIGHT',
    primaryColor: '#e2e8f0',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(226, 232, 240, 0.85)',
    rarity: 'S',
    icon: '🕊️',
    targetFighterId: 'valkyrie',
  },
  skin_dragon_mecha: {
    id: 'skin_dragon_mecha',
    name: 'OX-88 Cyber Mecha Dragon',
    vietnameseName: 'OX-88 Lôi Long Cơ Giáp (Cyber Mecha Dragon)',
    description: 'Chủ đề Lôi Long Cơ Giáp Bão Tố cho OX-88. Vảy rồng phủ nano hợp kim xanh ngọc lục bảo, sừng rồng tích điện thế 5 triệu Volt và hơi thở rồng lôi điện quét sạch chiến trường.',
    tag: 'MECHA CYBER DRAGON',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    glowColor: 'rgba(16, 185, 129, 0.85)',
    rarity: 'S',
    icon: '🐉',
    targetFighterId: 'ouroboros',
  },
  skin_nebula_supernova: {
    id: 'skin_nebula_supernova',
    name: 'Nebula Sovereign Supernova',
    vietnameseName: 'Tối Cao Tinh Vân Siêu Tân Tinh (Supernova)',
    description: 'Chủ đề Siêu Tân Tinh Lượng Tử cho Tối Cao Tinh Vân. Cánh chuyển sắc tinh vân tím lấp lánh, lõi phản vật chất siêu sáng giải phóng sóng tinh vân quét sạch kẻ thù.',
    tag: 'SUPERNOVA COSMIC',
    primaryColor: '#c084fc',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(192, 132, 252, 0.9)',
    rarity: 'S',
    icon: '🌌',
    targetFighterId: 'nebula_sovereign',
  },
  skin_quasar_colossus: {
    id: 'skin_quasar_colossus',
    name: 'Quasar Titan Golden Colossus',
    vietnameseName: 'Kình Thiên Khổng Thần Hoàng Kim Lực (Colossus)',
    description: 'Chủ đề Hoàng Kim Cự Thần cho Quasar Titan. Giáp hợp kim titan mạ vàng hộ vệ cực đại, phản xung ch động neutronium đập tan mọi pháo đạn hạm đội địch.',
    tag: 'GOLDEN COLOSSUS',
    primaryColor: '#eab308',
    secondaryColor: '#f97316',
    glowColor: 'rgba(234, 179, 8, 0.9)',
    rarity: 'S',
    icon: '🛡️',
    targetFighterId: 'quasar_titan',
  },
  skin_phantom_tachyon: {
    id: 'skin_phantom_tachyon',
    name: 'Chronos Phantom Dark Mirage',
    vietnameseName: 'Thời Không Ảo Ảnh Bóng Ma Lượng Tử (Mirage)',
    description: 'Chủ đề Bóng Ma Hư Ảnh Lượng Tử cho Thời Không Ảo Ảnh. Lớp ngụy trang quang phổ tàng hình biến ảo, dịch chuyển tức thời và chùm dao cạo tachyon rực tím xuyên thủng phòng tuyến.',
    tag: 'TACHYON MIRAGE',
    primaryColor: '#8b5cf6',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(139, 92, 246, 0.9)',
    rarity: 'S',
    icon: '👤',
    targetFighterId: 'chronos_phantom',
  },
  skin_golden_sovereign: {
    id: 'skin_golden_sovereign',
    name: 'Golden Sovereign',
    vietnameseName: 'Hoàng Kim Đế Vương',
    description: 'Trang phục mạ vàng hoàng gia độc quyền chuỗi 7 ngày kỳ 1. Phủ lớp giáp quang phổ rực sáng, phát quang bụi sao vàng khi xuất kích.',
    tag: 'CHUỖI 7 NGÀY - KỲ 1',
    primaryColor: '#fbbf24',
    secondaryColor: '#fef08a',
    glowColor: 'rgba(251, 191, 36, 0.75)',
    rarity: 'EX',
    icon: '👑',
  },
  skin_cosmic_nebula: {
    id: 'skin_cosmic_nebula',
    name: 'Cosmic Nebula',
    vietnameseName: 'Tinh Vân Huyền Ảo',
    description: 'Trang phục năng lượng vũ trụ độc quyền chuỗi 7 ngày kỳ 2. Thân phi cơ chuyển sắc cực quang tím lam huyền ảo, để lại vệt tinh vân lấp lánh.',
    tag: 'CHUỖI 7 NGÀY - KỲ 2',
    primaryColor: '#c084fc',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    rarity: 'EX',
    icon: '🌌',
  },
  skin_void_obsidian: {
    id: 'skin_void_obsidian',
    name: 'Void Obsidian',
    vietnameseName: 'Hắc Long Hư Không',
    description: 'Trang phục hắc diện thạch độc quyền chuỗi 7 ngày kỳ 3. Giáp đen viền đỏ thẫm uy nghi, tỏa ra chấn động hư không và tàn lửa hắc thạch.',
    tag: 'CHUỖI 7 NGÀY - KỲ 3',
    primaryColor: '#e11d48',
    secondaryColor: '#fb7185',
    glowColor: 'rgba(225, 29, 72, 0.75)',
    rarity: 'EX',
    icon: '🐉',
  },
};

export const COSMETIC_SKIN_CYCLE_ORDER: string[] = [
  'skin_golden_sovereign',
  'skin_cosmic_nebula',
  'skin_void_obsidian',
];

export interface DailyBonusDayConfig {
  day: number;
  gems: number;
  title: string;
  subtitle: string;
  isSpecial?: boolean;
  bonusShards?: number;
  exclusiveSkinId?: string;
}

export const DAILY_BONUS_DAYS: DailyBonusDayConfig[] = [
  { day: 1, gems: 500, title: 'Ngày 1: Xuất Kích', subtitle: 'Khởi đầu chiến dịch' },
  { day: 2, gems: 1000, title: 'Ngày 2: Tiếp Năng Lượng', subtitle: 'Nạp năng lượng phản vật chất' },
  { day: 3, gems: 1500, title: 'Ngày 3: Tiếp Tế Vũ Trụ', subtitle: 'Vũ khí đặc biệt & đạn dược' },
  { day: 4, gems: 2000, title: 'Ngày 4: Hỏa Lực Tiên Tiến', subtitle: 'Nâng cấp hạm đội' },
  { day: 5, gems: 3000, title: 'Ngày 5: Kho Tàng Lượng Tử', subtitle: 'Lõi tinh thể siêu sáng' },
  { day: 6, gems: 5000, title: 'Ngày 6: Át Chủ Bài', subtitle: 'Chiến cơ tinh nhuệ' },
  {
    day: 7,
    gems: 10000,
    title: 'Ngày 7: Đại Thần Không Gian',
    subtitle: 'Chuỗi 7 Ngày: 10k Gems + Skin Độc Quyền & 150 Mảnh S!',
    isSpecial: true,
    bonusShards: 150,
    exclusiveSkinId: 'skin_golden_sovereign',
  },
];

export const DAILY_BONUS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
export const DAILY_BONUS_GRACE_PERIOD_MS = 48 * 60 * 60 * 1000; // 48 hours to preserve streak

export interface DailyLoginState {
  lastClaimTimestamp: number | null;
  currentStreakDay: number; // 1 to 7
  totalClaimsCount: number;
  streakCount: number; // Number of completed 7-day cycles (0, 1, 2, ...)
  unlockedSkinIds: string[]; // List of unlocked skin IDs
  activeSkinId: string | null; // Equipped cosmetic skin
  fighterActiveSkins?: Record<string, string | null>; // Equipped skin per fighter
}

export const INITIAL_DAILY_LOGIN_STATE: DailyLoginState = {
  lastClaimTimestamp: null,
  currentStreakDay: 1,
  totalClaimsCount: 0,
  streakCount: 0,
  unlockedSkinIds: [],
  activeSkinId: null,
  fighterActiveSkins: {},
};

/**
 * Formats milliseconds into HH:MM:SS string
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Checks whether the daily login bonus can be claimed, time remaining, and next day's rewards
 */
export function checkDailyBonusStatus(
  state: DailyLoginState,
  now: number = Date.now()
): {
  canClaim: boolean;
  msRemaining: number;
  formattedCountdown: string;
  currentStreakDay: number;
  nextDayToClaim: number;
  rewardGems: number;
  isStreakBroken: boolean;
  isStreakMilestone: boolean;
  nextStreakSkin: CosmeticSkin | null;
  streakCount: number;
} {
  const { lastClaimTimestamp, currentStreakDay } = state;
  const streakCount = state.streakCount || 0;
  const unlockedSkins = state.unlockedSkinIds || [];
  const nextSkinId = COSMETIC_SKIN_CYCLE_ORDER.find((id) => !unlockedSkins.includes(id));
  const nextStreakSkin = nextSkinId && COSMETIC_SKINS[nextSkinId] ? COSMETIC_SKINS[nextSkinId] : null;

  if (!lastClaimTimestamp) {
    // First time claiming ever
    return {
      canClaim: true,
      msRemaining: 0,
      formattedCountdown: 'SẴN SÀNG',
      currentStreakDay: 1,
      nextDayToClaim: 1,
      rewardGems: DAILY_BONUS_DAYS[0].gems,
      isStreakBroken: false,
      isStreakMilestone: false,
      nextStreakSkin,
      streakCount,
    };
  }

  const elapsed = now - lastClaimTimestamp;

  if (elapsed >= DAILY_BONUS_COOLDOWN_MS) {
    // 24 hours passed - ready to claim!
    const isStreakBroken = elapsed > DAILY_BONUS_GRACE_PERIOD_MS;
    const nextDay = isStreakBroken ? 1 : (currentStreakDay % 7) + 1;
    const rewardConfig = DAILY_BONUS_DAYS.find((d) => d.day === nextDay) || DAILY_BONUS_DAYS[0];

    return {
      canClaim: true,
      msRemaining: 0,
      formattedCountdown: 'SẴN SÀNG',
      currentStreakDay,
      nextDayToClaim: nextDay,
      rewardGems: rewardConfig.gems,
      isStreakBroken,
      isStreakMilestone: nextDay === 7,
      nextStreakSkin,
      streakCount,
    };
  }

  // Under 24h cooldown
  const msRemaining = DAILY_BONUS_COOLDOWN_MS - elapsed;
  const currentConfig = DAILY_BONUS_DAYS.find((d) => d.day === currentStreakDay) || DAILY_BONUS_DAYS[0];
  const nextDay = (currentStreakDay % 7) + 1;

  return {
    canClaim: false,
    msRemaining,
    formattedCountdown: formatTimeRemaining(msRemaining),
    currentStreakDay,
    nextDayToClaim: nextDay,
    rewardGems: currentConfig.gems,
    isStreakBroken: false,
    isStreakMilestone: nextDay === 7,
    nextStreakSkin,
    streakCount,
  };
}

export interface StreakRewardResult {
  streakNumber: number;
  unlockedSkin: CosmeticSkin | null;
  bonusShards: {
    fighterId: string;
    fighterName: string;
    count: number;
  };
  bonusGems?: number;
  message: string;
}

/**
 * Executes daily bonus claim, handling 7-day streak milestones, bonus shards, and exclusive skins
 */
export function claimDailyBonusReward(
  state: DailyLoginState,
  currentGems: number,
  now: number = Date.now(),
  targetFighterId: string = 'astraea'
): {
  success: boolean;
  newDailyState: DailyLoginState;
  newGems: number;
  rewardClaimed: number;
  claimedDay: number;
  nextDayToClaim: number;
  streakReward?: StreakRewardResult;
} {
  const status = checkDailyBonusStatus(state, now);
  if (!status.canClaim) {
    return {
      success: false,
      newDailyState: state,
      newGems: currentGems,
      rewardClaimed: 0,
      claimedDay: state.currentStreakDay,
      nextDayToClaim: status.nextDayToClaim,
    };
  }

  const dayToClaim = status.nextDayToClaim;
  const reward = status.rewardGems;

  const currentStreakCount = state.streakCount || 0;
  const currentUnlockedSkins = state.unlockedSkinIds || [];
  let currentActiveSkin = state.activeSkinId || null;

  let streakReward: StreakRewardResult | undefined = undefined;
  let newStreakCount = currentStreakCount;
  const newUnlockedSkins = [...currentUnlockedSkins];

  // When completing the 7-day streak (Day 7 claimed)
  if (dayToClaim === 7) {
    newStreakCount = currentStreakCount + 1;

    // Find next skin in progression that isn't unlocked yet
    const nextSkinId = COSMETIC_SKIN_CYCLE_ORDER.find((id) => !newUnlockedSkins.includes(id));
    let newlyUnlockedSkin: CosmeticSkin | null = null;

    if (nextSkinId && COSMETIC_SKINS[nextSkinId]) {
      newlyUnlockedSkin = COSMETIC_SKINS[nextSkinId];
      newUnlockedSkins.push(nextSkinId);
      // Auto-equip the newly earned exclusive skin if none equipped
      if (!currentActiveSkin) {
        currentActiveSkin = nextSkinId;
      }
    }

    // Determine target fighter for bonus shards
    const fKey = targetFighterId && FIGHTERS[targetFighterId] ? targetFighterId : 'astraea';
    const targetFighter = FIGHTERS[fKey] || FIGHTERS.astraea || FIGHTERS.phoenix;
    const shardsCount = newlyUnlockedSkin ? 150 : 250; // Extra shards if player already owns all skins

    streakReward = {
      streakNumber: newStreakCount,
      unlockedSkin: newlyUnlockedSkin,
      bonusShards: {
        fighterId: targetFighter.id,
        fighterName: targetFighter.vietnameseName || targetFighter.name,
        count: shardsCount,
      },
      message: newlyUnlockedSkin
        ? `👑 HOÀN THÀNH CHUỖI 7 NGÀY (Lần ${newStreakCount})! Mở khóa Trang phục Độc quyền [${newlyUnlockedSkin.vietnameseName}] và nhận +${shardsCount} Mảnh ${targetFighter.vietnameseName || targetFighter.name}!`
        : `👑 HOÀN THÀNH CHUỖI 7 NGÀY (Lần ${newStreakCount})! Đã sở hữu toàn bộ trang phục, nhận siêu thưởng +${shardsCount} Mảnh ${targetFighter.vietnameseName || targetFighter.name}!`,
    };
  }

  const newDailyState: DailyLoginState = {
    lastClaimTimestamp: now,
    currentStreakDay: dayToClaim,
    totalClaimsCount: state.totalClaimsCount + 1,
    streakCount: newStreakCount,
    unlockedSkinIds: newUnlockedSkins,
    activeSkinId: currentActiveSkin,
  };

  return {
    success: true,
    newDailyState,
    newGems: currentGems + reward,
    rewardClaimed: reward,
    claimedDay: dayToClaim,
    nextDayToClaim: (dayToClaim % 7) + 1,
    streakReward,
  };
}

/**
 * Checks whether a skin is unlocked.
 * LX-88 Royal Gold (skin_lx88_royal_gold), LX-88 Vampire Lord (skin_lx88_vampire),
 * and Tier S themed skins are immediately unlocked for all commanders!
 */
export function isSkinUnlocked(skinId: string, unlockedSkinIds: string[] = []): boolean {
  if (
    skinId === 'skin_lx88_royal_gold' ||
    skinId === 'skin_lx88_vampire' ||
    skinId === 'skin_rts88_neon_violet' ||
    skinId === 'skin_rts88_ark_one'
  ) return true;
  if (
    skinId.startsWith('skin_solaris_') ||
    skinId.startsWith('skin_astraea_') ||
    skinId.startsWith('skin_chrono_') ||
    skinId.startsWith('skin_apocalypse_') ||
    skinId.startsWith('skin_victory_') ||
    skinId.startsWith('skin_dragon_') ||
    skinId.startsWith('skin_nebula_') ||
    skinId.startsWith('skin_quasar_') ||
    skinId.startsWith('skin_phantom_')
  ) {
    return true;
  }
  return (unlockedSkinIds || []).includes(skinId);
}

/**
 * Calculates Vampiric Life Leech for the LX-88 Vampire Crimson Lord skin.
 * Restores HP and Armor when damaging or harvesting enemy vitality.
 */
export function calculateVampireLifeLeech(
  dealtDamage: number,
  isKill: boolean
): { healHp: number; healArmor: number } {
  if (isKill) {
    return { healHp: 3, healArmor: 3 };
  }
  // On regular hit tick, 15% leech chance converts ~8% damage into HP/Armor
  const healHp = Math.max(1, Math.round(dealtDamage * 0.08));
  const healArmor = Math.max(1, Math.round(dealtDamage * 0.05));
  return { healHp, healArmor };
}

/**
 * Calculates Bloodthirst Combat Bonuses for LX-88 Vampire Lord.
 * Bloodthirst ranges from 0 to 100%.
 */
export function getVampireBloodthirstBonus(bloodthirst: number): {
  speedBonusPercent: number;
  critRateBonus: number;
  isBloodMistActive: boolean;
} {
  const clamped = Math.max(0, Math.min(100, bloodthirst));
  const isBloodMistActive = clamped >= 50;
  return {
    speedBonusPercent: Math.round((clamped / 100) * 20), // Up to +20% flight speed
    critRateBonus: Math.round((clamped / 100) * 15),     // Up to +15% crit rate
    isBloodMistActive,
  };
}

/**
 * Calculates RTS-88 Lightning Bolt Damage.
 * - Base damage: 22 per 0.1s tick
 * - Shield protection bonus: +80% damage (+80% -> multiplier 1.8) while shield has HP and is active
 * - Chain lightning: 70% of base damage to surrounding enemies
 */
export function calculateRts88LightningDamage(
  baseDamage: number,
  isShieldActive: boolean,
  isChain: boolean
): number {
  const shieldMultiplier = isShieldActive ? 1.8 : 1.0;
  const directDamage = baseDamage * shieldMultiplier;
  if (isChain) {
    return Math.max(1, Math.round(directDamage * 0.70));
  }
  return Math.round(directDamage);
}

/**
 * Calculates effective enemy defense against RTS-88 lightning.
 * "sát thương gây ra sẽ xuyên qua 40% giáp và phòng thủ của kẻ địch"
 * Pierces 40% of target defense and armor rating.
 */
export function calculateRts88EffectiveDefense(targetDefense: number): number {
  return Math.max(0, targetDefense * (1 - 0.40));
}

/**
 * Absorbs incoming damage through the RTS-88 300 HP Lightning Shield.
 * When shield is active, incoming damage is absorbed by shield first.
 */
export function absorbRts88ShieldDamage(
  currentShieldHp: number,
  incomingDamage: number
): { remainingShieldHp: number; leftoverDamage: number; isShieldBroken: boolean } {
  if (currentShieldHp <= 0) {
    return { remainingShieldHp: 0, leftoverDamage: incomingDamage, isShieldBroken: true };
  }
  if (currentShieldHp >= incomingDamage) {
    const remaining = currentShieldHp - incomingDamage;
    return {
      remainingShieldHp: remaining,
      leftoverDamage: 0,
      isShieldBroken: remaining <= 0,
    };
  }
  const leftover = incomingDamage - currentShieldHp;
  return {
    remainingShieldHp: 0,
    leftoverDamage: leftover,
    isShieldBroken: true,
  };
}


/**
 * Gets the active equipped cosmetic skin for a specific fighter
 */
export function getActiveSkinForFighter(
  state: DailyLoginState,
  fighterId: string
): string | null {
  if (state.fighterActiveSkins && state.fighterActiveSkins[fighterId] !== undefined) {
    return state.fighterActiveSkins[fighterId];
  }
  if (state.activeSkinId) {
    const s = COSMETIC_SKINS[state.activeSkinId];
    if (!s || !s.targetFighterId || s.targetFighterId === fighterId) {
      return state.activeSkinId;
    }
  }
  return null;
}

/**
 * Toggles or equips/unequips a cosmetic skin for a specific fighter
 */
export function toggleCosmeticSkin(
  state: DailyLoginState,
  skinId: string,
  targetFighterId?: string
): DailyLoginState {
  const unlocked = state.unlockedSkinIds || [];
  if (!isSkinUnlocked(skinId, unlocked)) {
    return state; // Skin not owned
  }
  const skinObj = COSMETIC_SKINS[skinId];
  const fid = targetFighterId || skinObj?.targetFighterId;
  const currentFighterSkins = { ...(state.fighterActiveSkins || {}) };

  const currentEquipped = fid ? currentFighterSkins[fid] : state.activeSkinId;
  const isAlreadyActive = currentEquipped === skinId;
  const nextSkinForFighter = isAlreadyActive ? null : skinId;

  if (fid) {
    currentFighterSkins[fid] = nextSkinForFighter;
  }

  return {
    ...state,
    activeSkinId: nextSkinForFighter,
    fighterActiveSkins: currentFighterSkins,
  };
}

// ==========================================
// DYNAMIC MAP SECTORS (KHU VỰC BẢN ĐỒ CHIẾN ĐẤU)
// Changes every 5th wave cleared (1-5, 6-10, 11-15, 16-20, 21+)
// ==========================================
export interface MapSector {
  sectorIndex: number;
  name: string;
  vietnameseName: string;
  subtitle: string;
  minWave: number;
  maxWave: number;
  bgColorTop: string;
  bgColorBottom: string;
  accentColor: string;
  nebulaPrimary: string;
  nebulaSecondary: string;
  starColor: string;
  ambientType: 'alpha_void' | 'cryo_ice' | 'solar_flare' | 'black_hole' | 'olympus_core';
}

export const MAP_SECTORS: MapSector[] = [
  {
    sectorIndex: 1,
    name: 'Alpha Void',
    vietnameseName: 'Không Phận Khởi Nguyên',
    subtitle: 'Vùng Không Gian Sơ Khai · Bão Bụi Lượng Tử',
    minWave: 1,
    maxWave: 5,
    bgColorTop: '#040814',
    bgColorBottom: '#0a1226',
    accentColor: '#38bdf8',
    nebulaPrimary: 'rgba(3, 105, 161, 0.28)',
    nebulaSecondary: 'rgba(99, 102, 241, 0.22)',
    starColor: '#e2e8f0',
    ambientType: 'alpha_void',
  },
  {
    sectorIndex: 2,
    name: 'Cryo Glacial Drift',
    vietnameseName: 'Vành Đai Băng Cryo',
    subtitle: 'Vành Đai Thiên Thạch Băng · Tinh Thể Tuyệt Đối',
    minWave: 6,
    maxWave: 10,
    bgColorTop: '#021824',
    bgColorBottom: '#062d3e',
    accentColor: '#22d3ee',
    nebulaPrimary: 'rgba(8, 145, 178, 0.32)',
    nebulaSecondary: 'rgba(6, 182, 212, 0.24)',
    starColor: '#a5f3fc',
    ambientType: 'cryo_ice',
  },
  {
    sectorIndex: 3,
    name: 'Solar Supernova Sea',
    vietnameseName: 'Biển Lửa Siêu Tân Tinh',
    subtitle: 'Vùng Bức Xạ Nhiệt Hạch · Bão Lửa Tinh Tú',
    minWave: 11,
    maxWave: 15,
    bgColorTop: '#180707',
    bgColorBottom: '#2d0a0a',
    accentColor: '#f97316',
    nebulaPrimary: 'rgba(220, 38, 38, 0.32)',
    nebulaSecondary: 'rgba(234, 88, 12, 0.26)',
    starColor: '#fed7aa',
    ambientType: 'solar_flare',
  },
  {
    sectorIndex: 4,
    name: 'Graviton Singularity',
    vietnameseName: 'Vùng Vô Quy Hố Đen',
    subtitle: 'Chân Trời Sự Kiện · Lực Hút Trọng Trường Cực Đại',
    minWave: 16,
    maxWave: 20,
    bgColorTop: '#0e041a',
    bgColorBottom: '#1e0735',
    accentColor: '#c084fc',
    nebulaPrimary: 'rgba(124, 58, 237, 0.34)',
    nebulaSecondary: 'rgba(147, 51, 234, 0.26)',
    starColor: '#e9d5ff',
    ambientType: 'black_hole',
  },
  {
    sectorIndex: 5,
    name: 'Olympus Celestial Prime',
    vietnameseName: 'Không Phận Thần Thánh Olympus',
    subtitle: 'Vương Triều Tinh Tú · Lõi Năng Lượng Tối Thượng',
    minWave: 21,
    maxWave: Infinity,
    bgColorTop: '#080d19',
    bgColorBottom: '#1a1333',
    accentColor: '#fbbf24',
    nebulaPrimary: 'rgba(217, 119, 6, 0.30)',
    nebulaSecondary: 'rgba(168, 85, 247, 0.26)',
    starColor: '#fef08a',
    ambientType: 'olympus_core',
  },
];

/**
 * Returns the active map sector based on current wave
 */
export function getSectorForWave(wave: number): MapSector {
  const clamped = Math.max(1, wave);
  const found = MAP_SECTORS.find((s) => clamped >= s.minWave && clamped <= s.maxWave);
  return found || MAP_SECTORS[MAP_SECTORS.length - 1];
}

export interface SectorVisualTheme {
  sectorIndex: number;
  name: string;
  vietnameseName: string;
  bgColorTop: string;
  bgColorBottom: string;
  accentColor: string;
  starColors: string[];
  nebulaPrimary: string;
  nebulaSecondary: string;
  nebulaTertiary: string;
  ambientType: 'alpha_void' | 'cryo_ice' | 'solar_flare' | 'black_hole' | 'olympus_core';
}

/**
 * Switches the background stars or nebulae color based on current sector index
 * to enhance visual variety during gameplay.
 */
export function switchSectorBackgroundTheme(sectorIndex: number): SectorVisualTheme {
  const normalizedIndex = Math.max(1, Math.min(5, Math.floor(sectorIndex) || 1));
  const sector = MAP_SECTORS.find((s) => s.sectorIndex === normalizedIndex) || MAP_SECTORS[0];

  const paletteMap: Record<number, { starColors: string[]; nebulaTertiary: string }> = {
    1: {
      starColors: ['#e2e8f0', '#38bdf8', '#818cf8', '#bae6fd'],
      nebulaTertiary: 'rgba(14, 165, 233, 0.18)',
    },
    2: {
      starColors: ['#a5f3fc', '#38bdf8', '#e0f2fe', '#67e8f9', '#ffffff'],
      nebulaTertiary: 'rgba(6, 182, 212, 0.20)',
    },
    3: {
      starColors: ['#fed7aa', '#f97316', '#fbbf24', '#fecdd3', '#ffedd5'],
      nebulaTertiary: 'rgba(239, 68, 68, 0.22)',
    },
    4: {
      starColors: ['#e9d5ff', '#c084fc', '#f472b6', '#a855f7', '#fae8ff'],
      nebulaTertiary: 'rgba(168, 85, 247, 0.24)',
    },
    5: {
      starColors: ['#fef08a', '#fbbf24', '#f59e0b', '#38bdf8', '#ffffff'],
      nebulaTertiary: 'rgba(245, 158, 11, 0.25)',
    },
  };

  const extra = paletteMap[normalizedIndex] || paletteMap[1];

  return {
    sectorIndex: sector.sectorIndex,
    name: sector.name,
    vietnameseName: sector.vietnameseName,
    bgColorTop: sector.bgColorTop,
    bgColorBottom: sector.bgColorBottom,
    accentColor: sector.accentColor,
    starColors: extra.starColors,
    nebulaPrimary: sector.nebulaPrimary,
    nebulaSecondary: sector.nebulaSecondary,
    nebulaTertiary: extra.nebulaTertiary,
    ambientType: sector.ambientType,
  };
}

export const getSectorVisualTheme = switchSectorBackgroundTheme;

// ==========================================
// COMBO RANK TIERS (HẠNG CHUỖI HẠ ĐỊCH LIÊN HOÀN)
// ==========================================
export type ComboRankTier = 'NORMAL' | 'FEVER' | 'ULTRA' | 'APEX' | 'GODLIKE';

export interface ComboRankInfo {
  tier: ComboRankTier;
  label: string;
  vietnameseTitle: string;
  bonusPercentLabel: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  borderClass: string;
  minCombo: number;
}

export function getComboRankInfo(combo: number): ComboRankInfo {
  if (combo >= 20) {
    return {
      tier: 'GODLIKE',
      label: 'GODLIKE ONSLAUGHT',
      vietnameseTitle: 'HỦY DIỆT VÔ ĐỐI',
      bonusPercentLabel: '+200% ĐIỂM (CỰC HẠN)',
      color: '#f43f5e',
      glowColor: '#fb7185',
      bgGradient: 'from-rose-500/30 via-red-500/25 to-amber-500/30',
      borderClass: 'border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.6)]',
      minCombo: 20,
    };
  }
  if (combo >= 15) {
    return {
      tier: 'APEX',
      label: 'APEX STRIKE',
      vietnameseTitle: 'ĐỈNH CAO CHIẾN ĐẤU',
      bonusPercentLabel: '+100% ĐIỂM',
      color: '#ec4899',
      glowColor: '#f472b6',
      bgGradient: 'from-pink-500/30 via-purple-500/25 to-indigo-500/30',
      borderClass: 'border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.5)]',
      minCombo: 15,
    };
  }
  if (combo >= 10) {
    return {
      tier: 'ULTRA',
      label: 'ULTRA FEVER',
      vietnameseTitle: 'CUỒNG PHÁ BẬC CAO',
      bonusPercentLabel: '+50% ĐIỂM',
      color: '#a855f7',
      glowColor: '#c084fc',
      bgGradient: 'from-purple-500/30 via-indigo-500/25 to-blue-500/30',
      borderClass: 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
      minCombo: 10,
    };
  }
  if (combo >= 5) {
    return {
      tier: 'FEVER',
      label: 'FEVER RUSH',
      vietnameseTitle: 'CƠN SỐT CUỒNG NỘ',
      bonusPercentLabel: '+20% ĐIỂM',
      color: '#3b82f6',
      glowColor: '#60a5fa',
      bgGradient: 'from-blue-500/30 via-cyan-500/25 to-teal-500/30',
      borderClass: 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]',
      minCombo: 5,
    };
  }
  return {
    tier: 'NORMAL',
    label: 'COMBO RUSH',
    vietnameseTitle: 'CHUỖI HẠ ĐỊCH',
    bonusPercentLabel: 'CƠ BẢN',
    color: '#06b6d4',
    glowColor: '#22d3ee',
    bgGradient: 'from-cyan-500/20 via-sky-500/20 to-blue-500/20',
    borderClass: 'border-cyan-400/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
    minCombo: 1,
  };
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: DifficultyLevel;
  name: string;
  vietnameseName: string;
  shortDesc: string;
  description: string;
  badgeClass: string;
  badgeBorder: string;
  textColor: string;
  hpMultiplier: number;
  damageMultiplier: number;
  fireRateMultiplier: number;
  bulletSpeedMultiplier: number;
  enemyCountMultiplier: number;
  scoreBonusPercent: number;
  gemRewardBonusPercent: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Easy',
    vietnameseName: 'Dễ',
    shortDesc: 'Tân Thủ',
    description: 'Quái ít hơn, giảm 30% sát thương và tốc độ đạn quái',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    badgeBorder: 'border-emerald-400',
    textColor: 'text-emerald-300',
    hpMultiplier: 0.7,
    damageMultiplier: 0.7,
    fireRateMultiplier: 0.8,
    bulletSpeedMultiplier: 0.85,
    enemyCountMultiplier: 0.75,
    scoreBonusPercent: 0,
    gemRewardBonusPercent: 0,
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    vietnameseName: 'Bình Thường',
    shortDesc: 'Tiên Phong',
    description: 'Mỗi wave quái tăng 50% cộng dồn máu, giáp, sát thương, tốc bắn',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    badgeBorder: 'border-cyan-400',
    textColor: 'text-cyan-300',
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    fireRateMultiplier: 1.0,
    bulletSpeedMultiplier: 1.0,
    enemyCountMultiplier: 1.0,
    scoreBonusPercent: 20,
    gemRewardBonusPercent: 20,
  },
  hard: {
    id: 'hard',
    name: 'Hard',
    vietnameseName: 'Khó',
    shortDesc: 'Ác Mộng',
    description: 'Quái siêu trâu, hỏa lực dày đặc, +50% điểm số và phần thưởng',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
    badgeBorder: 'border-rose-400',
    textColor: 'text-rose-300',
    hpMultiplier: 1.45,
    damageMultiplier: 1.45,
    fireRateMultiplier: 1.35,
    bulletSpeedMultiplier: 1.25,
    enemyCountMultiplier: 1.4,
    scoreBonusPercent: 50,
    gemRewardBonusPercent: 50,
  },
};

/**
 * Calculates wave scaling parameters:
 * Cumulative compounding +50% per wave for HP, damage, armor, fire rate, and enemy density.
 */
export function calculateWaveScaling(wave: number, difficulty: DifficultyLevel = 'normal') {
  const diff = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
  // Compounding 50% accumulation per wave (Wave 1: 1.0x, Wave 2: 1.5x, Wave 3: 2.25x...)
  // Capped at reasonable exponent (e.g. 10) so numbers remain performant and playable
  const effectiveWaveOffset = Math.min(Math.max(0, wave - 1), 10);
  const waveCompound = Math.pow(1.5, effectiveWaveOffset);

  // Scaled multipliers
  const hpMultiplier = diff.hpMultiplier * waveCompound;
  const damageMultiplier = diff.damageMultiplier * waveCompound;
  const enemyArmor = Math.round(effectiveWaveOffset * 10 * diff.hpMultiplier);
  const fireRateCooldownScale = Math.min(3.0, (1 + effectiveWaveOffset * 0.5) * diff.fireRateMultiplier);
  // Loại bỏ chỉ số tăng tốc độ đạn bay và tốc độ bay của địch khi qua từng wave theo yêu cầu người dùng
  const bulletSpeedMultiplier = diff.bulletSpeedMultiplier;

  // Additional enemies per wave (+50% compounding on capacity)
  const baseCapacity = 5;
  const enemyCountCompounded = Math.round((baseCapacity * (1 + effectiveWaveOffset * 0.5)) * diff.enemyCountMultiplier);
  const maxEnemies = Math.min(24, Math.max(4, enemyCountCompounded));

  // Spawn interval speeds up as waves advance
  const spawnInterval = Math.max(0.3, (1.8 / Math.pow(1.2, effectiveWaveOffset)) / diff.enemyCountMultiplier);

  return {
    wave,
    difficulty,
    waveCompound,
    hpMultiplier,
    damageMultiplier,
    enemyArmor,
    fireRateCooldownScale,
    bulletSpeedMultiplier,
    maxEnemies,
    spawnInterval,
    scoreMultiplier: (1 + (diff.scoreBonusPercent / 100)) * (1 + (wave - 1) * 0.2),
  };
}

export interface TouchMovementBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Calculates responsive target position for touch drag controls on mobile.
 * Uses relative touch delta with sensitivity scaling and viewport clamping.
 */
export function calculateMobileTouchPosition(
  currentTouchX: number,
  currentTouchY: number,
  touchStartX: number,
  touchStartY: number,
  shipStartX: number,
  shipStartY: number,
  bounds: TouchMovementBounds,
  touchSensitivity: number = 1.0
): { targetX: number; targetY: number } {
  const deltaX = (currentTouchX - touchStartX) * touchSensitivity;
  const deltaY = (currentTouchY - touchStartY) * touchSensitivity;
  const targetX = clamp(shipStartX + deltaX, bounds.minX, bounds.maxX);
  const targetY = clamp(shipStartY + deltaY, bounds.minY, bounds.maxY);
  return { targetX, targetY };
}

/**
 * Categorizes viewport for responsive mobile gaming.
 */
export function getMobileViewportMode(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export interface LaserBeamTrajectory {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  dirX: number;
  dirY: number;
  beamLength: number;
}

/**
 * Calculates straight directional laser trajectory along the aircraft's facing heading (tilt).
 * Shoots straight from the nose along the vector (sin(tilt), -cos(tilt)).
 */
export function calculateLaserBeamTrajectory(
  playerX: number,
  playerY: number,
  tilt: number,
  viewportHeight: number = 800,
  noseOffset: number = 34
): LaserBeamTrajectory {
  const sinTilt = Math.sin(tilt);
  const cosTilt = Math.cos(tilt);
  // Straight direction vector aligned with the fighter's nose
  const dirX = sinTilt;
  const dirY = -cosTilt;
  const startX = playerX + noseOffset * sinTilt;
  const startY = playerY - noseOffset * cosTilt;
  const beamLength = Math.max(viewportHeight + 200, 1200);
  const endX = startX + dirX * beamLength;
  const endY = startY + dirY * beamLength;

  return { startX, startY, endX, endY, dirX, dirY, beamLength };
}

/**
 * Checks if a circular entity intersects with a straight laser beam segment.
 */
export function checkLaserHit(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  targetX: number,
  targetY: number,
  targetRadius: number,
  beamRadius: number = 20
): { isHit: boolean; projX: number; projY: number; distance: number } {
  const dx = endX - startX;
  const dy = endY - startY;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const dist = Math.hypot(targetX - startX, targetY - startY);
    return {
      isHit: dist <= targetRadius + beamRadius,
      projX: startX,
      projY: startY,
      distance: dist,
    };
  }

  const t = Math.max(0, Math.min(1, ((targetX - startX) * dx + (targetY - startY) * dy) / lenSq));
  const projX = startX + t * dx;
  const projY = startY + t * dy;
  const distance = Math.hypot(targetX - projX, targetY - projY);

  return {
    isHit: distance <= targetRadius + beamRadius,
    projX,
    projY,
    distance,
  };
}

