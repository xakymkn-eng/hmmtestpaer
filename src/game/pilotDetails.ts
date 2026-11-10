/**
 * Pilot Dossier & Lore System (Hồ Sơ & Chiến Thuật Tay Lái)
 * Provides comprehensive dossiers, combat biographies, tactical advice,
 * and signature aircraft synergy info for all pilots in Sky Vanguard.
 */

export interface PilotDossier {
  id: string;
  role: string;
  specialty: string;
  biography: string;
  tacticalAdvice: string;
  combatStyle: string;
  signatureFighterName?: string;
  signatureFighterSynergy?: string;
}

export const PILOT_DOSSIERS: Record<string, PilotDossier> = {
  pilot_raiden_s: {
    id: 'pilot_raiden_s',
    role: 'Đại Tướng Lôi Thần · Trấn Phái RTS-88',
    specialty: 'Sấm Sét Liên Hoàn & Sát Thương Chuẩn Tuyệt Đối',
    combatStyle: 'Tấn Công Siêu Bạo Kích & Phá Giáp Siêu Nhanh',
    signatureFighterName: 'RTS-88 Tia Chớp (Lightning Flash)',
    signatureFighterSynergy: 'Kích hoạt Trấn Phái: Khi lái RTS-88 Tia Chớp, phát xạ thêm 1 luồng sấm sét xích liên hoàn gây 100% sát thương chuẩn, tăng 30% xuyên giáp và khuếch đại bão lôi đình!',
    biography: 'Sinh ra tại Vành Đai Bão Điện Từ Cygnus, Raiden Kaminari là phi công huyền thoại duy nhất đồng bộ 100% với lõi lôi thạch siêu nén của chiến cơ RTS-88. Anh nổi danh với chiến công một mình tiêu diệt hạm đội 40 tuần dương hạm địch chỉ trong 3 phút nhờ vào khả năng điều khiển dòng điện lượng tử ở vận tốc ánh sáng.',
    tacticalAdvice: 'Phối hợp cực tốt với drone DR-88 Lôi Vân Kích S. Đạn sấm sét sẽ liên tục giật tê liệt địch, bỏ qua lớp giáp cứng của trùm và dọn dẹp các đợt máy bay nhỏ chỉ trong chớp mắt.',
  },
  celestia: {
    id: 'celestia',
    role: 'Đô Đốc Celestia · Nữ Vương Tinh Cầu',
    specialty: 'Sát Thương Chuẩn Vĩnh Hằng & Bạo Kích Tinh Tú',
    combatStyle: 'Bắn Tỉa Tinh Thể & Xuyên Thấu Không Gian',
    signatureFighterName: 'Astraea Nữ Thần Tinh Tú',
    signatureFighterSynergy: 'Cộng hưởng Tinh Vân: Tăng 30 sát thương chuẩn và 60% sát thương bạo kích, khiến mọi phát đạn sao xuyên thủng lớp giáp phòng ngự của kẻ thù.',
    biography: 'Người bảo hộ Tinh Hệ Tiên Nữ, Đô Đốc Celestia sở hữu thị giác lượng tử có thể phát hiện điểm yếu kết cấu của bất kỳ tàu chiến nào từ cự ly hàng nghìn dặm không gian.',
    tacticalAdvice: 'Thích hợp nhất khi đối đầu với các màn Boss trâu máu và chế độ Boss Rush. Sát thương chuẩn cộng thêm đảm bảo lượng sát thương đầu ra không bị tụt giảm khi đối thủ kích hoạt khiên.',
  },
  aegis: {
    id: 'aegis',
    role: 'Tổng Tư Lệnh Aegis · Khiên Bất Diệt',
    specialty: 'Phòng Ngự Tuyệt Đối & Tái Tạo Lớp Giáp',
    combatStyle: 'Phản Đòn Cận Chiến & Hấp Thụ Xung Năng',
    signatureFighterName: 'GX-14 Cự Hạm Thép',
    signatureFighterSynergy: 'Thành Trì Bất Diệt: Cung cấp +50 Giáp tối đa và +35 Phòng Thủ, giảm thiểu 40% sát thương nhận vào từ các đợt đạn ma trận.',
    biography: 'Cựu binh dày dạn kinh nghiệm qua 3 cuộc đại chiến không gian. Vance luôn bay ở tiền tuyến để che chắn cho đồng đội bằng trường lực từ tính kiên cố.',
    tacticalAdvice: 'Lựa chọn số 1 cho người chơi thích lối chơi an toàn, bền bỉ trong chế độ Vô Tận (Endless) hoặc Siêu Khó (Super Hard).',
  },
  phantom_zero: {
    id: 'phantom_zero',
    role: 'Bóng Ma Zero · U Linh Vô Định',
    specialty: 'Né Tránh Đạn Cực Đại & Tốc Độ Siêu Thanh',
    combatStyle: 'Lả Lướt Giữa Làn Mưa Đạn & Phản Kích Siêu Tốc',
    signatureFighterName: 'Phantom X Lưỡi Dao Không Gian',
    signatureFighterSynergy: 'Ảo Ảnh Lượng Tử: Tăng 25% tỉ lệ né tránh hoàn toàn sát thương và 35% tốc độ bay, dễ dàng luồn lách qua các khe đạn hẹp nhất.',
    biography: 'Tay lái bí ẩn xuất thân từ lực lượng trinh sát đặc nhiệm hư không. Không ai từng thấy diện mạo thật của Zero đằng sau chiếc mũ phi công lượng tử.',
    tacticalAdvice: 'Tận dụng tốc độ lướt cao để nhặt các viên ngọc và hộp năng lượng rơi ra từ địch. Khả năng né tránh 25% là bảo hiểm sinh mạng tuyệt vời khi trùm xả đạn.',
  },
  nova_striker: {
    id: 'nova_striker',
    role: 'Đội Trưởng Nova · Liệt Hỏa Tân Tinh',
    specialty: 'Sát Thương Bạo Phát & Bão Lửa Diện Rộng',
    combatStyle: 'Càn Quét Tiền Tuyến & Hủy Diệt Mục Tiêu Lớn',
    signatureFighterName: 'Phoenix Hỏa Phượng Hoàng',
    signatureFighterSynergy: 'Phượng Hoàng Niết Bàn: Tăng 30% sát thương và 30% bán kính nổ của bom EMP, thiêu rụi toàn bộ máy bay nhỏ xung quanh.',
    biography: 'Được mệnh danh là Sao Chổi Đỏ của liên đoàn, Nova nổi tiếng với phong cách chiến đấu rực lửa, luôn lao thẳng vào tâm bão đạn để kết liễu hạm trưởng địch.',
    tacticalAdvice: 'Rất mạnh trong các chiến dịch vượt màn nhanh. Sử dụng bom EMP vào thời điểm đông địch nhất để tối đa hóa điểm số và combo.',
  },
  chronos: {
    id: 'chronos',
    role: 'Học Giả Chronos · Nghịch Đảo Thời Gian',
    specialty: 'Giảm Hồi Chiêu & Ngưng Đọng Thời Không',
    combatStyle: 'Xả Kỹ Năng Tần Suất Cao & Khống Chế Trận Đấu',
    signatureFighterName: 'Chronos Bẻ Cong Thời Gian',
    signatureFighterSynergy: 'Thời Không Xung Kích: Giảm 30% thời gian hồi chiêu của kỹ năng chiến cơ và bom, cho phép kích hoạt liên tục trong các trận đánh kéo dài.',
    biography: 'Nhà vật lý học lượng tử biến tàu bay thành phòng thí nghiệm dòng thời gian. Ông làm chậm sự chuyển động của các hạt photon để vô hiệu hóa hỏa lực địch.',
    tacticalAdvice: 'Giúp bạn hồi kỹ năng nhanh hơn tới 30%, cực kỳ hữu dụng để kích hoạt trạng thái bất tử hoặc kỹ năng nổ diện rộng liên tục.',
  },
};

/**
 * Get full dossier for a pilot (falls back to generated dossier if specific one not listed)
 */
export function getPilotDossier(pilotId: string): PilotDossier {
  if (PILOT_DOSSIERS[pilotId]) {
    return PILOT_DOSSIERS[pilotId];
  }

  // Generic fallback dossier matching pilot id style
  return {
    id: pilotId,
    role: 'Phi Công Tinh Nhuệ Liên Bang',
    specialty: 'Tác Chiến Không Quân Vũ Trụ Đa Năng',
    combatStyle: 'Hỗ Trợ Toàn Diện & Phối Hợp Phi Đội',
    biography: 'Tốt nghiệp Học Viện Phi Hành Không Gian Tân Tinh với thành tích xuất sắc. Luôn sẵn sàng nhận mệnh lệnh chỉ huy chiến cơ bước vào tiền tuyến bảo vệ thiên hà.',
    tacticalAdvice: 'Tăng cường chỉ số chiến cơ đồng đều. Hãy nâng sao chiến cơ và trang bị thêm phụ kiện vũ khí để phát huy tối đa sức mạnh của tay lái này.',
  };
}
