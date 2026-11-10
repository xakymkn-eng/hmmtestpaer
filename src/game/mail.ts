/**
 * Pure Mailbox & Reward Distribution Logic
 * Decoupled from React for deterministic testing and persistence.
 * Includes automated hourly random military intelligence & supply mail dispatches.
 */

export interface MailReward {
  type: 'gems' | 'gold' | 'item' | 'shards';
  amount: number;
  label: string;
}

export interface MailItem {
  id: string;
  title: string;
  sender: string;
  date: string;
  content: string;
  rewards: MailReward[];
  isRead: boolean;
  isClaimed: boolean;
  tag: 'welcome' | 'system' | 'event' | 'hourly';
  timestamp?: number;
}

export const INITIAL_MAILS: MailItem[] = [
  {
    id: 'mail_starter_welcome',
    title: 'Quà Tân Thủ: Chào Mừng Chỉ Huy Gia Nhập!',
    sender: 'Bộ Tư Lệnh Sky Vanguard',
    date: 'Tân Thủ',
    content:
      'Chào mừng tân Chỉ Huy đã gia nhập lực lượng Phi Đội Tiên Phong Sky Vanguard!\n\nNhằm trang bị hỏa lực tối tân nhất giúp Chỉ Huy chuẩn bị cho chiến dịch đẩy lùi hạm đội bóng tối, Bộ Tư Lệnh gửi tặng bạn 5,000 Kim Cương khởi đầu.\n\nHãy sử dụng số Kim Cương này tại Trung Tâm Gacha để chiêu mộ chiến cơ Bậc S (ZX-99 Solaris, TX-0 Chrono) và tuyển dụng Phi Công huyền thoại!\n\nChúc Chỉ Huy lập chiến công hiển hách và bảo vệ trọn vẹn dải ngân hà!',
    rewards: [
      {
        type: 'gems',
        amount: 5000,
        label: '5,000 Kim Cương',
      },
    ],
    isRead: false,
    isClaimed: false,
    tag: 'welcome',
  },
  {
    id: 'mail_system_intel',
    title: 'Chỉ Thị Tác Chiến: Báo Cáo Không Phận Vũ Trụ',
    sender: 'Hội Đồng Tình Báo Vũ Trụ',
    date: 'Hệ Thống',
    content:
      'Báo cáo trinh sát: Hạm đội xâm lăng đã thiết lập vành đai phòng thủ qua 5 khu vực chiến trường (từ Không Phận Khởi Nguyên Alpha Void đến Không Phận Thần Thánh Olympus).\n\nLời khuyên cho Chỉ Huy:\n• Nâng cấp Phụ Kiện Vũ Khí (Nòng Pháo, Bộ Nạp, Lõi Siêu Tân Tinh) tại Xưởng Cơ Khí để tăng uy lực đạn.\n• Kích hoạt Tuyệt Kỹ khi bị vây ráp để dọn sạch mưa đạn địch.\n• Giữ vững chuỗi hạ địch để đạt trạng thái FEVER và GODLIKE nhân x3.0 điểm số!',
    rewards: [],
    isRead: false,
    isClaimed: true,
    tag: 'system',
  },
];

// 1 Hour Interval in Milliseconds
export const HOURLY_MAIL_INTERVAL_MS = 60 * 60 * 1000; // 3,600,000 ms

export interface HourlyMailTemplate {
  title: string;
  sender: string;
  content: string;
  gold: number;
  gems: number;
}

export const HOURLY_MAIL_TEMPLATES: HourlyMailTemplate[] = [
  {
    title: 'Tiếp Tế Quân Nhu Định Kỳ: Cập Bến Trạm Không Gian',
    sender: 'Đoàn Hạm Đội Vận Tải Gamma',
    content:
      'Hạm đội vận tải vừa an toàn cập bến trạm vũ trụ tiền tiêu, mang theo khối lượng lớn tinh thể nhiên liệu và vàng trợ cấp cho phi đội.\n\nBộ phận hậu cần xin gửi phần viện trợ đến kho dự trữ chiến lược của Chỉ Huy để sẵn sàng cho các đợt không chiến kế tiếp!',
    gold: 50000,
    gems: 30,
  },
  {
    title: 'Báo Cáo Tình Báo: Thu Hồi Tàn Dư Chiến Hạm Địch',
    sender: 'Cục Tình Báo Không Gian Sâu',
    content:
      'Đội trinh sát vừa hoàn tất khảo sát khu vực vành đai thiên thạch nơi diễn ra trận chiến gần nhất. Chúng tôi đã trục vớt thành công các lõi năng lượng nguyên vẹn và quy đổi thành chiến lợi phẩm quý giá gửi về hậu cứ.',
    gold: 40000,
    gems: 25,
  },
  {
    title: 'Bảo Trì Động Cơ & Tinh Chỉnh Phản Lực Hoàn Tất',
    sender: 'Xưởng Cơ Khí Tiên Phong',
    content:
      'Kỹ sư trưởng Bruno và đội ngũ kỹ thuật vừa hoàn tất đợt kiểm tra vi mạch, gia cố buồng phản lực và bôi trơn nòng súng máy cho toàn bộ hạm đội.\n\nKèm theo phần thưởng vàng và tinh thể phụ tùng khuyến khích tinh thần chiến đấu quả cảm của Chỉ Huy!',
    gold: 60000,
    gems: 20,
  },
  {
    title: 'Phát Hiện Mỏ Tinh Thể Năng Lượng Vũ Trụ Hiếm',
    sender: 'Đài Quan Trắc Thiên Văn Tinh Vân',
    content:
      'Kính thiên văn quang phổ cực rộng vừa ghi nhận một chùm tinh thể năng lượng phát sáng trôi dạt từ vùng ranh giới vũ trụ. Các phi thuyền thăm dò đã khai thác an toàn và gửi tặng Chỉ Huy một phần tinh thể quý giá này!',
    gold: 35000,
    gems: 45,
  },
  {
    title: 'Thư Cảm Ơn: Tín Hiệu Cứu Hộ Tàu Buôn Không Gian',
    sender: 'Liên Hợp Thương Gia Thiên Hà',
    content:
      'Thay mặt hiệp hội các tàu vận tải dân sự, chúng tôi gửi lời tri ân chân thành đến Phi Đội Tiên Phong vì đã quét sạch toán cướp không gian trên tuyến hải trình tự do.\n\nXin gửi chút lễ vật bao gồm vàng ròng và kim cương để trang bị thêm hỏa lực bảo vệ dải ngân hà!',
    gold: 75000,
    gems: 35,
  },
  {
    title: 'Tuyên Dương Chiến Công: Huân Chương Tuần Tra Không Phận',
    sender: 'Bộ Tổng Tư Lệnh Sky Vanguard',
    content:
      'Ghi nhận thành tích bảo vệ không phận xuất sắc trong 1 giờ qua! Tinh thần quả cảm và kỹ năng điều khiển chiến cơ của Chỉ Huy đang là nguồn cảm hứng lớn lao cho toàn thể quân đoàn phi công.',
    gold: 80000,
    gems: 40,
  },
  {
    title: 'Dữ Liệu Khắc Chế Kẻ Thù Từ Học Viện Phi Công',
    sender: 'Học Viện Chỉ Huy Bay Vũ Trụ',
    content:
      'Các tân binh tại Học viện vừa tổng hợp thành công phân tích quỹ đạo đạn và điểm yếu của các dòng tàu tuần dương địch. Xin trân trọng gửi bản báo cáo kèm theo ngân sách nghiên cứu hỗ trợ phi đội.',
    gold: 45000,
    gems: 30,
  },
  {
    title: 'Chiến Lợi Phẩm Tịch Thu Từ Vành Đai Asteroid',
    sender: 'Biệt Đội Săn Đêm Hư Không',
    content:
      'Trong lúc phục kích tại tọa độ biên giới, đội đặc nhiệm đã đánh chặn một toán tàu tiếp tế của quân phản bội và thu hồi toàn bộ kho vàng cùng đá quý chiến lược. Toàn bộ tang vật được chuyển giao cho Chỉ Huy định đoạt!',
    gold: 70000,
    gems: 35,
  },
];

/**
 * Format timestamp to friendly time string (e.g. "15:30 Hôm nay" or "10/05/2026")
 */
export function formatMailDate(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

/**
 * Generate a random hourly mail item
 */
export function generateRandomHourlyMail(timestamp: number = Date.now()): MailItem {
  const template =
    HOURLY_MAIL_TEMPLATES[Math.floor(Math.random() * HOURLY_MAIL_TEMPLATES.length)];
  const mailId = `hourly_mail_${timestamp}_${Math.floor(Math.random() * 10000)}`;

  const rewards: MailReward[] = [];
  if (template.gold > 0) {
    rewards.push({
      type: 'gold',
      amount: template.gold,
      label: `${template.gold.toLocaleString()} Vàng`,
    });
  }
  if (template.gems > 0) {
    rewards.push({
      type: 'gems',
      amount: template.gems,
      label: `${template.gems.toLocaleString()} Kim Cương`,
    });
  }

  return {
    id: mailId,
    title: template.title,
    sender: template.sender,
    date: formatMailDate(timestamp),
    content: template.content,
    rewards,
    isRead: false,
    isClaimed: false,
    tag: 'hourly',
    timestamp,
  };
}

/**
 * Checks elapsed time and automatically generates hourly mails if at least 1 hour has passed.
 * Capped at generating 5 mails at a time to prevent backlog spam if user was away for days.
 */
export function checkAndDispatchHourlyMails(
  currentMails: MailItem[],
  lastDispatchMs: number,
  nowMs: number = Date.now()
): {
  updatedMails: MailItem[];
  newMailsGenerated: number;
  newLastDispatchMs: number;
  hasNewMail: boolean;
} {
  if (nowMs < lastDispatchMs) {
    return { updatedMails: currentMails, newMailsGenerated: 0, newLastDispatchMs: nowMs, hasNewMail: false };
  }

  const elapsedMs = nowMs - lastDispatchMs;
  if (elapsedMs < HOURLY_MAIL_INTERVAL_MS) {
    return { updatedMails: currentMails, newMailsGenerated: 0, newLastDispatchMs: lastDispatchMs, hasNewMail: false };
  }

  // Calculate full hours passed
  const hoursPassed = Math.floor(elapsedMs / HOURLY_MAIL_INTERVAL_MS);
  const mailsToCreate = Math.min(5, Math.max(1, hoursPassed));

  const newMails: MailItem[] = [];
  for (let i = 0; i < mailsToCreate; i++) {
    // Stagger timestamp slightly for realism
    const mailTime = lastDispatchMs + (i + 1) * HOURLY_MAIL_INTERVAL_MS;
    newMails.push(generateRandomHourlyMail(mailTime));
  }

  // Update lastDispatchMs to cover the elapsed hours (or nowMs if large gap)
  const newLastDispatchMs = Math.min(nowMs, lastDispatchMs + hoursPassed * HOURLY_MAIL_INTERVAL_MS);

  // Prepend new mails so they show up at top
  const updatedMails = [...newMails, ...currentMails];

  return {
    updatedMails,
    newMailsGenerated: mailsToCreate,
    newLastDispatchMs,
    hasNewMail: true,
  };
}

/**
 * Calculate the number of mails that have unclaimed rewards
 */
export function getUnclaimedMailCount(mails: MailItem[]): number {
  return mails.filter((m) => !m.isClaimed && m.rewards && m.rewards.length > 0).length;
}

/**
 * Calculate the number of unread mails
 */
export function getUnreadMailCount(mails: MailItem[]): number {
  return mails.filter((m) => !m.isRead).length;
}

/**
 * Mark a single mail as read
 */
export function markMailAsRead(mails: MailItem[], mailId: string): MailItem[] {
  return mails.map((m) => (m.id === mailId ? { ...m, isRead: true } : m));
}

/**
 * Claim reward for a specific mail
 */
export function claimMailReward(
  mails: MailItem[],
  mailId: string
): { updatedMails: MailItem[]; claimedGems: number; claimedGold: number; success: boolean } {
  const target = mails.find((m) => m.id === mailId);
  if (!target || target.isClaimed || !target.rewards || target.rewards.length === 0) {
    return { updatedMails: mails, claimedGems: 0, claimedGold: 0, success: false };
  }

  let totalGems = 0;
  let totalGold = 0;
  for (const r of target.rewards) {
    if (r.type === 'gems') {
      totalGems += r.amount;
    } else if (r.type === 'gold') {
      totalGold += r.amount;
    }
  }

  const updatedMails = mails.map((m) =>
    m.id === mailId ? { ...m, isRead: true, isClaimed: true } : m
  );

  return {
    updatedMails,
    claimedGems: totalGems,
    claimedGold: totalGold,
    success: true,
  };
}

/**
 * Claim all unclaimed mails at once
 */
export function claimAllMails(mails: MailItem[]): {
  updatedMails: MailItem[];
  totalClaimedGems: number;
  totalClaimedGold: number;
  claimedCount: number;
} {
  let totalClaimedGems = 0;
  let totalClaimedGold = 0;
  let claimedCount = 0;

  const updatedMails = mails.map((m) => {
    if (!m.isClaimed && m.rewards && m.rewards.length > 0) {
      claimedCount++;
      for (const r of m.rewards) {
        if (r.type === 'gems') {
          totalClaimedGems += r.amount;
        } else if (r.type === 'gold') {
          totalClaimedGold += r.amount;
        }
      }
      return { ...m, isRead: true, isClaimed: true };
    }
    return m;
  });

  return {
    updatedMails,
    totalClaimedGems,
    totalClaimedGold,
    claimedCount,
  };
}

/**
 * Delete all mails that are both read and claimed (unless they are protected)
 */
export function deleteClaimedMails(mails: MailItem[]): MailItem[] {
  return mails.filter((m) => !m.isClaimed || !m.isRead);
}
