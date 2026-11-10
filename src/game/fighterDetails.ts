/**
 * Detailed Technical Specifications, Origin Lore, and Combat Dossiers
 * for all 24 Sky Vanguard starfighters.
 */

export interface FighterDossier {
  id: string;
  codename: string;
  role: string;
  manufacturer: string;
  originRealm: string;
  lore: string;
  mainWeaponName: string;
  mainWeaponDetails: string;
  skillMechanism: string;
  tacticalAdvantage: string;
  recommendedPlaystyle: string;
  counterplayTip: string;
  isLimited?: boolean;
}

export const FIGHTER_DOSSIERS: Record<string, FighterDossier> = {
  // --- TIER S FIGHTERS ---
  rts_88: {
    id: 'rts_88',
    codename: 'RTS-88 Tia Chớp',
    role: 'Tiêm Kích Siêu Tốc Bậc S · Tia Sét Giật Lan 70% Xuyên 40% Giáp & Khiên Sấm Sét 300 HP (+80% ST)',
    manufacturer: 'Tập Đoàn Năng Lượng Lôi Điện Vũ Trụ & Viện Động Cơ Siêu Quang Tốc',
    originRealm: 'Tinh Cầu Bão Từ Trường (Volt-Prime Galaxy)',
    lore:
      'RTS-88 Tia Chớp là cỗ máy chiến đấu lôi điện tối thượng bậc S, sở hữu động cơ gia tốc điện trường cho tốc độ bay cực nhanh (520 px/s). Mũi phi cơ tích hợp cuộn cảm phóng điện siêu cao áp, liên tục phóng ra tia sấm sét tẹt vào kẻ địch gây 22 sát thương mỗi 0.1 giây. Đặc biệt, luồng điện cao thế tự động giật lan sang các kẻ địch xung quanh gây 70% sát thương gốc và xuyên qua 40% giáp cùng phòng thủ đối phương. Khi kích hoạt tuyệt kỹ, RTS-88 kiến tạo Khiên Sấm Sét với 300 điểm máu duy trì 10 giây; trong suốt thời gian có khiên bảo vệ, toàn bộ sát thương của phi cơ được tăng cường 80%!',
    mainWeaponName: 'Tia Sấm Sét Tẹt Cao Áp & Phóng Điện Lan 70%',
    mainWeaponDetails:
      'Bắn ra 1 đường tia sấm sét tẹt vào kẻ địch gây 22 sát thương cho mỗi 0.1 giây. Nếu có kẻ địch xung quanh tia sét sẽ lan ra các mục tiêu lân cận gây sát thương bằng 70% sát thương gốc; sát thương xuyên qua 40% giáp và phòng thủ của đối thủ.',
    skillMechanism:
      'Khiên Sấm Sét Quá Tải: Tạo ra 1 tấm khiên sấm sét có hiệu ứng tia sét duy trì 10 giây với 300 điểm máu. Khi có khiên bảo vệ, sát thương gây ra của máy bay tăng 80% duy trì trong 10 giây cùng với khiên. Hồi chiêu: 18 giây.',
    tacticalAdvantage:
      'Vận tốc cực nhanh 520 px/s giúp lướt né đạn hoàn hảo; đòn bắn sấm sét giật lan dọn dẹp hàng loạt tốp địch trong chớp mắt; khiên 300 HP bảo đảm sống sót và đẩy sát thương lên đỉnh điểm +80%.',
    recommendedPlaystyle:
      'Lợi dụng tốc độ siêu nhanh để lượn qua các khe đạn, khóa tia sét vào các mục tiêu lớn để điện giật lan diệt sạch đàn đệ tử xung quanh. Kích hoạt khiên 300 HP khi đối đầu boss để nhận +80% sát thương cực hạn.',
    counterplayTip:
      'Dù có khiên 300 HP, lượng máu gốc là 38 nên hãy giữ khiên sấm sét luôn sẵn sàng trong các pha giao tranh nguy hiểm.',
  },
  arc_tempest: {
    id: 'arc_tempest',
    codename: 'LX-88 Arc Tempest',
    role: 'Tiêm Kích Bão Lôi Quang Tuyến · Pháo Laser Bắn Thẳng Đứng Tuyệt Đối (Không Nghiêng, Không Lắc) & Tê Liệt Chiến Trường',
    manufacturer: 'Viện Công Nghệ Điện Từ Hư Không & Bộ Chỉ Huy Sấm Sét',
    originRealm: 'Tinh Vân Sấm Sét Vô Cực (Omega Volt Nebula)',
    lore:
      'LX-88 Arc Tempest (Lôi Quang Tiên Phong) là phi cơ độc nhất vô nhị sở hữu hệ thống con quay hồi chuyển ổn định tuyệt đối (hoàn toàn không lắc qua lắc lại theo hướng bay). Mũi phi cơ được trang bị pháo nén hạt lôi quang bắn thẳng tắp theo trục tung và đi theo máy bay chứ không nghiêng theo góc rẽ, mỗi 0.1 giây gây 12 sát thương cực mạnh lên mục tiêu. Khi kích hoạt tuyệt kỹ, toàn bộ kẻ địch bị tê liệt trong 6 giây đồng thời LX-88 nhận tăng 80% sát thương, 60% xuyên giáp và +15 sát thương chuẩn.',
    mainWeaponName: 'Pháo Laser Lôi Quang Bắn Thẳng Bám Theo Máy Bay',
    mainWeaponDetails:
      'Phóng ra tia laser năng lượng cao bắn thẳng tắp hướng thẳng đứng theo thân máy bay (không nghiêng khi rẽ), mỗi 0.1 giây gây 12 sát thương lên mục tiêu (10 đợt sát thương mỗi giây). Thiêu đốt tức thì và xuyên phá thẳng mọi chướng ngại vật phía trước.',
    skillMechanism:
      'Lôi Đình Tê Liệt Toàn Cầu: Khi dùng skill kẻ địch bị tê liệt trong 6 giây đồng thời LX-88 nhận tăng 80% sát thương và 60% xuyên giáp +15 sát thương chuẩn trong 6 giây. Thời gian hồi: 16 giây.',
    tacticalAdvantage:
      'Thân máy bay luôn giữ thăng bằng tuyệt đối không bị lắc lư hay nghiêng lệch góc, giúp đường đạn laser bắn thẳng cực chuẩn theo tọa độ X của máy bay với tần suất gây sát thương 10 lần/giây, khóa cứng toàn bộ hạm đội địch trong 6 giây và bộc phát hỏa lực khủng khiếp với +80% sát thương, +60% xuyên giáp và +15 sát thương chuẩn.',
    recommendedPlaystyle:
      'Di chuyển ngang để luồng laser bắn thẳng quét sạch đội hình địch phía trước với độ chuẩn xác tuyệt đối mà không sợ bị lệch tia do lắc thân phi cơ.',
    counterplayTip:
      'Tận dụng vận tốc bay siêu tốc 490 px/s kết hợp 150 Giáp và 20% né tránh để né đạn chéo trong khi luồng laser bắn thẳng liên tục thiêu đốt mục tiêu.',
  },
  astraea: {
    id: 'astraea',
    codename: 'SX-77 Starfire',
    role: 'Tiêm Kích Tinh Cầu Giới Hạn · Sát Thương Diện Rộng Đa Tầng',
    manufacturer: 'Viện Công Nghệ Lượng Tử Tinh Vân & Thần Giới Orion',
    originRealm: 'Tinh Vân Khởi Nguyên (Alpha Core Nebula)',
    lore:
      'SX-77 Astraea Starfire (Máy bay Sao Tinh Tú) là kiệt tác chiến cơ tối tân nhất của lực lượng liên minh vũ trụ, sử dụng lõi năng lượng chiết xuất từ tàn tích của một siêu tinh cầu cổ đại. Thân vỏ được đúc bằng hợp kim sao chổi phản quang, có khả năng biến đổi năng lượng hư không thành các ngôi sao ánh sáng sắc bén. Đây là chiến cơ GIỚI HẠN đặc biệt chỉ xuất hiện trong sự kiện 10 ngày.',
    mainWeaponName: 'Pháo Ngôi Sao Quang Năng Ngũ Giác',
    mainWeaponDetails:
      'Bắn chùm đạn ngôi sao uy lực cao. Khi va chạm vào bất kỳ kẻ địch nào, ngôi sao mẹ lập tức phát nổ và phân tách thành 5 ngôi sao tầm nhiệt nhỏ tỏa đều 5 góc, dọn dẹp triệt để các tốp tiêm kích hộ tống xung quanh.',
    skillMechanism:
      'Siêu Tinh Cầu Hủy Diệt: Phóng một đại tinh cầu bay chậm về phía trước, càn quét toàn bộ màn chắn của địch gây 300 sát thương chuẩn, sau đó tiếp tục nổ chùm 5 ngôi sao tầm trung và 5 ngôi sao mini làm choáng toàn diện đối phương.',
    tacticalAdvantage:
      'Sát thương phân tách lan tỏa cực mạnh; khả năng làm tê liệt tàu trùm và xóa sạch mưa đạn trong các đợt wave đông đúc.',
    recommendedPlaystyle:
      'Giữ vị trí trung tâm màn hình để đạn phân tách tỏa đều ra hai biên. Kết hợp phụ kiện tăng Tốc Bắn và Xuyên Giáp.',
    counterplayTip:
      'Kích hoạt Tuyệt Kỹ ngay khi Trùm triệu hồi lớp hộ vệ hoặc khi màn hình ngập kín đạn lửa để vô hiệu hóa.',
    isLimited: true,
  },
  solaris: {
    id: 'solaris',
    codename: 'ZX-99 Solaris',
    role: 'Chiến Hạm Bức Xạ Mặt Trời · Quét Sạch Hàng Ngang & Thiêu Đốt',
    manufacturer: 'Tập Đoàn Công Nghiệp Nhiệt Hạch Helios',
    originRealm: 'Hệ Sao Kép Corona Australis',
    lore:
      'Được thiết kế để hoạt động ngay trong vành nhật hoa của các đại tinh cầu, ZX-99 Solaris sở hữu lò phản ứng nhiệt hạch mini mô phỏng phản ứng tổng hợp hydro của mặt trời, phóng thích những luồng sóng nhiệt thiêu rụi mọi vật chất.',
    mainWeaponName: 'Cầu Lửa Nhiệt Hạch & Sóng Lửa Kép',
    mainWeaponDetails:
      'Bắn các cầu plasma rực lửa nổ lan bán kính 45px kèm hai luồng sóng chém lửa quét hai mạn tàu, triệt hạ các kẻ địch đánh lén từ cánh.',
    skillMechanism:
      'Bộc Phá Thái Dương: Chiếu một cột trụ bức xạ mặt trời cực đại quét thẳng từ trên xuống, dọn sạch 100% mục tiêu trên màn hình và kích hoạt khiên bất tử 3 giây.',
    tacticalAdvantage:
      'Khả năng sống sót vô song nhờ khiên bất tử và sát thương nổ lan diện rộng.',
    recommendedPlaystyle:
      'Áp sát trung tâm để sóng lửa hai bên thiêu đốt kẻ địch. Rất thích hợp đối đầu với các boss có nhiều bộ phận lắp ghép.',
    counterplayTip:
      'Dành tuyệt kỹ cho các pha trùm tung chiêu mưa đạn dày đặc để vừa né đạn vừa gây sát thương cực lớn.',
  },
  chrono: {
    id: 'chrono',
    codename: 'TX-0 Chrono',
    role: 'Bộ Gia Tốc Thời Gian · Bạo Kích Lượng Tử Siêu Thanh',
    manufacturer: 'Phòng Thí Nghiệm Vật Lý Thời Không Kỷ Nguyên',
    originRealm: 'Vùng Đứt Gãy Nghịch Đảo Thời Gian',
    lore:
      'TX-0 Chrono là chiến cơ duy nhất tích hợp động cơ hạt Tachyon có thể di chuyển nhanh hơn vận tốc ánh sáng, tạo ra các xung sóng bẻ cong dòng chảy thời gian cục bộ quanh buồng lái.',
    mainWeaponName: 'Súng Hạt Tachyon Gia Tốc',
    mainWeaponDetails:
      'Bắn chùm đạn dịch chuyển tức thời với tốc độ không thể nhìn thấy bằng mắt thường, sở hữu chỉ số bạo kích bẩm sinh lên đến x2.5 sát thương.',
    skillMechanism:
      'Ngưng Đọng Thời Gian (Bullet-Time): Làm chậm toàn bộ kẻ địch và quỹ đạo đạn địch 85% trong 5 giây, cho phép phi công tự do di chuyển lách đạn.',
    tacticalAdvantage:
      'Khả năng né đạn số 1 thiên hà; tốc độ xả đạn cực nhanh đục thủng giáp boss trong tích tắc.',
    recommendedPlaystyle:
      'Tập trung nâng cấp phụ kiện Tỉ Lệ Bạo Kích và Sát Thương Bạo Kích để tối đa hóa lượng DPS bùng nổ.',
    counterplayTip:
      'Kích hoạt skill ngay khi trùm tung đòn laser xoay tròn để biến nguy hiểm thành cơ hội ngắm bắn chuẩn xác.',
  },
  apocalypse: {
    id: 'apocalypse',
    codename: 'EX-Omega Apocalypse',
    role: 'Chiến Thần Phản Vật Chất · Hỏa Lực Hạng Nặng Tối Thượng',
    manufacturer: 'Tổng Cục Vũ Khí Hủy Diệt Vành Đai Tối',
    originRealm: 'Hư Không Phản Vật Chất Vô Tận',
    lore:
      'Được bọc bởi các phiến giáp siêu titan dày đặc có khả năng chống chọi vụ nổ hạt nhân, EX-Omega Apocalypse mang theo đại bác hạt phản vật chất có thể làm sụp đổ kết cấu phân tử của bất kỳ chiến hạm nào.',
    mainWeaponName: 'Song Pháo Phản Hạt & Chùm Vi Tên Lửa',
    mainWeaponDetails:
      'Khai hỏa đồng thời 2 luồng pháo phản vật chất tạo sóng xung kích chấn động, đi kèm loạt vi tên lửa tự tìm mục tiêu.',
    skillMechanism:
      'Tận Thế Khởi Nguyên: Phóng liên tiếp 12 đầu đạn phản vật chất cỡ lớn truy kích toàn bộ mục tiêu kết hợp sóng hủy diệt xóa sạch màn hình.',
    tacticalAdvantage:
      'Chỉ số Máu và Giáp cao nhất hạm đội; sát thương chuẩn và xuyên giáp vượt trội.',
    recommendedPlaystyle:
      'Thích hợp lối đánh trực diện, không ngại đối đầu hỏa lực. Lắp phụ kiện tăng Giáp và Hồi Tuyệt Kỹ.',
    counterplayTip:
      'Sử dụng quả bom EMP kết hợp tuyệt kỹ để hạ gục các đợt tàu mẹ trong thời gian ngắn nhất.',
  },
  valkyrie: {
    id: 'valkyrie',
    codename: 'VX-1 Valkyrie',
    role: 'Chiến Cơ Thánh Quang Hộ Mệnh · Tự Phục Hồi & Tên Lửa Quang Tử',
    manufacturer: 'Đền Thờ Cơ Khí Tinh Tú Olympus',
    originRealm: 'Thiên Giới Radiant Aether',
    lore:
      'Mang biểu tượng của nữ thần chiến thắng, VX-1 Valkyrie được trang bị lăng kính tinh thể thiên giới, có khả năng chuyển đổi năng lượng tấn công thành hào quang chữa lành và cường hóa.',
    mainWeaponName: 'Ngọn Giáo Thánh Lăng & 8 Tên Lửa Tầm Nhiệt',
    mainWeaponDetails:
      'Phóng ngọn giáo ánh sáng xuyên thấu toàn bộ hàng dọc địch cùng 8 quả tên lửa thánh quang uốn lượn diệt mục tiêu cơ động.',
    skillMechanism:
      'Phán Quyết Thiên Giới: Giải phóng 20 tia thánh quang tự dẫn quét sạch không phận, đồng thời phục hồi ngay lập tức 25 HP cho phi thuyền.',
    tacticalAdvantage:
      'Hồi máu trực tiếp trong trận đấu, duy trì thế trận bền bỉ vượt qua các wave kéo dài.',
    recommendedPlaystyle:
      'Lối chơi an toàn, ổn định cao. Thích hợp đi sâu vào các wave cao trong chế độ Vô Tận.',
    counterplayTip:
      'Kích hoạt skill khi máu tụt xuống mức vàng để lấy lại lượng HP an toàn mà không cần chờ nhặt bình máu.',
  },
  nebula_sovereign: {
    id: 'nebula_sovereign',
    codename: 'SX-99 Nebula Sovereign',
    role: 'Soái Hạm Hạm Đội Thiên Hà · Hạt Pulsar & Hố Đen Hút Địch',
    manufacturer: 'Hạm Đội Đô Đốc Liên Minh Tinh Vân',
    originRealm: 'Trung Tâm Lỗ Đen Sagittarius A*',
    lore:
      'Soái hạm chỉ huy tối cao với khung thân đồ sộ mang công nghệ trọng lực âm, có khả năng bóp méo không gian và hút toàn bộ kẻ địch vào vùng chân không cực hạn.',
    mainWeaponName: 'Cầu Pulsar Xoáy Vũ Trụ',
    mainWeaponDetails:
      'Phóng cầu xoáy hạt Pulsar liên tục tỏa tia vũ trụ, hút kẻ địch yếu vào tâm nổ và giải phóng vụ nổ siêu tân tinh mini.',
    skillMechanism:
      'Sụp Đổ Thiên Hà: Khởi tạo hố đen siêu trọng lực tại trung tâm màn hình, nuốt chửng toàn bộ máy bay nhỏ và biến chúng thành đá quý thưởng.',
    tacticalAdvantage:
      'Khống chế diện rộng tuyệt đối; kiếm vàng và kim cương thưởng cực nhanh nhờ cơ chế biến địch thành tài nguyên.',
    recommendedPlaystyle:
      'Đứng gần trung tâm để hố đen kiểm soát toàn bộ các tốp lính cơ động xuất hiện từ hai góc trên.',
    counterplayTip:
      'Hố đen có thể khóa chặt các tàu tiểu boss, vô hiệu hóa việc chúng xả đạn trong thời gian hút.',
  },
  ouroboros: {
    id: 'ouroboros',
    codename: 'OX-88 Ouroboros Eclipse',
    role: 'Long Cơ Hư Không Tối Thượng · Long Hỏa Xuyên Giáp & Bất Tử',
    manufacturer: 'Hội Kín Luyện Kim Đan Long Không Gian',
    originRealm: 'Hư Không Vô Tận Vực Sâu',
    lore:
      'Lấy cảm hứng từ biểu tượng rồng nuốt đuôi vĩnh cửu, OX-88 Ouroboros được cấu thành từ hợp kim vảy rồng nano, có khả năng hấp thụ linh hồn cơ khí của kẻ bại trận để hồi phục khung thân.',
    mainWeaponName: 'Tia Long Hỏa Hư Không',
    mainWeaponDetails:
      'Tia lửa rồng uốn lượn xuyên 35% giáp. Khi diệt địch lập tức sinh ra Long Châu; thu thập Long Châu giúp hồi giáp và tăng 20% sát thương đạn.',
    skillMechanism:
      'Hắc Long Giáng Thế: Triệu hồi Rồng Hư Không khổng lồ bay lượn hình số 8 quét sạch màn hình, thiêu rụi toàn bộ đạn địch và ban trạng thái bất tử 4 giây.',
    tacticalAdvantage:
      'Vừa bất tử vừa dọn đạn toàn bản đồ; cơ chế Long Châu giúp gia tăng sức mạnh theo thời gian giao tranh.',
    recommendedPlaystyle:
      'Chủ động tiêu diệt lính nhỏ để nhặt Long Châu tích lũy tầng sức mạnh tối đa trước khi giáp mặt trùm.',
    counterplayTip:
      'Khi gặp làn đạn dày đặc không lối thoát, Hắc Long Giáng Thế là phương án giải vây hoàn hảo nhất.',
  },
  quasar_titan: {
    id: 'quasar_titan',
    codename: 'QX-99 Quasar Sovereign',
    role: 'Pháo Đài Bức Xạ Gamma · Vùng Phân Rã & Biến Đạn Thành Ngọc',
    manufacturer: 'Tổ Hợp Nghiên Cứu Chuẩn Tinh Viễn Cổ',
    originRealm: 'Vùng Sáng Chuẩn Tinh Quasar 3C 273',
    lore:
      'Sở hữu lõi phản ứng năng lượng chuẩn tinh sáng gấp hàng nghìn lần dải ngân hà, QX-99 Quasar Sovereign biến mọi khoảng không phía trước thành vùng đất chết bức xạ gamma.',
    mainWeaponName: 'Chùm Tia Gamma Cực Quang',
    mainWeaponDetails:
      'Bắn chùm tia gamma nén áp suất cực lớn, để lại vùng bức xạ hủy diệt duy trì 1.5 giây gây sát thương liên tục lên bất kỳ tàu địch nào bay ngang.',
    skillMechanism:
      'Bão Bức Xạ Gamma: Kích hoạt xung chấn cực quang toàn bản đồ, gây 400 sát thương chuẩn và biến 100% đạn địch trên màn hình thành ngọc thưởng.',
    tacticalAdvantage:
      'Biến đòn tấn công nguy hiểm nhất của boss thành tài nguyên ngọc quý dồi dào cho người chơi.',
    recommendedPlaystyle:
      'Căn thời điểm boss xả loạt đạn mưa dày đặc nhất để bấm skill, vừa né đòn vừa thu hoạch hàng chục viên ngọc.',
    counterplayTip:
      'Kết hợp với phi công tăng thời gian hồi chiêu để liên tục chuyển hóa đạn địch.',
  },
  chronos_phantom: {
    id: 'chronos_phantom',
    codename: 'ZX-00 Chronos Phantom',
    role: 'Ảo Ảnh Lượng Tử · Đạn Lỗ Giun Nhị Phân & 3 Phân Thân Đồng Hành',
    manufacturer: 'Cơ Quan Tình Báo Không-Thời Gian Tối Mật',
    originRealm: 'Chiều Không Gian Thứ 11',
    lore:
      'Sử dụng công nghệ gập cong không gian vi mô, ZX-00 Chronos Phantom có thể đồng thời hiện hữu ở nhiều mốc thời gian khác nhau, khiến mọi hệ thống radar khóa mục tiêu của địch hoàn toàn bị vô hiệu hóa.',
    mainWeaponName: 'Đạn Lỗ Giun Nhị Phân',
    mainWeaponDetails:
      'Cặp đạn năng lượng bẻ cong không gian bay thẳng vào buồng lái đối phương với 35% tỉ lệ bạo kích và hệ số sát thương bạo kích x2.8.',
    skillMechanism:
      'Nghịch Đảo Không Gian: Tức thời né mọi đòn đánh trong 4.5 giây, triệu hồi 3 bản sao thời gian cùng xả bão đạn lượng tử hủy diệt lên kẻ địch.',
    tacticalAdvantage:
      'Hỏa lực x4 trong suốt thời gian kích hoạt phân thân, kèm khả năng né đòn tuyệt đối.',
    recommendedPlaystyle:
      'Lối chơi tốc độ cao, dồn sát thương bùng nổ hạ gục nhanh trùm chỉ trong vài giây kích hoạt kỹ năng.',
    counterplayTip:
      'Tận dụng 4.5 giây phân thân để bay áp sát tâm boss, cho 4 chiếc máy bay cùng tập trung hỏa lực.',
  },

  // --- TIER A FIGHTERS ---
  aurora: {
    id: 'aurora',
    codename: 'RX-7 Aurora',
    role: 'Chiến Cơ Băng Hàn Cryo · Làm Chậm 40% & Đóng Băng Đạn',
    manufacturer: 'Tập Đoàn Hàn Băng Bắc Cực Không Gian',
    originRealm: 'Hành Tinh Băng Vĩnh Cửu Gliese 436b',
    lore:
      'Được bọc lớp giáp pha lê băng siêu cứng không truyền nhiệt, RX-7 Aurora sử dụng pháo bắn mảnh băng tuyết ở độ không tuyệt đối (-273.15°C) làm tê liệt mọi hệ thống động cơ cơ khí của đối thủ.',
    mainWeaponName: 'Mảnh Băng Tinh Thể Cryo',
    mainWeaponDetails:
      'Bắn mảnh băng sắc bén làm giảm 40% tốc độ di chuyển của địch và phát nổ băng đá khi mục tiêu bị phá hủy.',
    skillMechanism:
      'Bão Tuyết Tuyệt Đối: Đóng băng toàn bộ đạn địch trên màn hình thành các tinh thể băng vô hại và vỡ tan.',
    tacticalAdvantage:
      'Kiểm soát tốc độ chiến trường, giúp người chơi dễ dàng né tránh các toán tàu cảm tử bay nhanh.',
    recommendedPlaystyle:
      'Bắn chặn các mục tiêu bay nhanh ở tuyến trên, giữ khoảng cách an toàn.',
    counterplayTip:
      'Bão Tuyết là công cụ cứu sinh cực tốt khi bị ép vào góc chân tường.',
  },
  vortex: {
    id: 'vortex',
    codename: 'NX-12 Vortex',
    role: 'Hệ Thống Lực Trường Lượng Tử · Đạn Trọng Lực & Hố Đen Hút Đạn',
    manufacturer: 'Viện Hàn Lâm Trọng Lực Vi Mô',
    originRealm: 'Vành Đai Xoáy Hư Không',
    lore:
      'NX-12 Vortex tích hợp máy phát trường hấp dẫn nhân tạo, cho phép thao túng quán tính và trọng lực của đạn địch xung quanh.',
    mainWeaponName: 'Cầu Xoáy Trọng Lực',
    mainWeaponDetails:
      'Phóng cầu trọng lực mini xoáy tròn, hút các kẻ địch hạng nhẹ lại gần nhau trước khi phát nổ.',
    skillMechanism:
      'Hố Đen Hút Đạn: Mở lỗ sâu không gian hút sạch đạn địch phía trước và chuyển hóa thành điểm số tích lũy.',
    tacticalAdvantage:
      'Gom cụm kẻ địch để tiêu diệt hàng loạt bằng vũ khí diện rộng.',
    recommendedPlaystyle:
      'Tập trung bắn vào giữa đội hình địch để tối ưu lực hút gom mục tiêu.',
    counterplayTip:
      'Dùng hố đen hút đạn để xóa bỏ các đợt đạn chùm khó né của trùm.',
  },
  mirage: {
    id: 'mirage',
    codename: 'SX-3 Mirage',
    role: 'Công Nghệ Phân Thân Quang Học · Lưới Lửa Đan Chéo 30°',
    manufacturer: 'Tổ Hợp Quang Học Ảo Ảnh Cyber',
    originRealm: 'Trạm Vũ Trụ Gương Đa Chiều',
    lore:
      'SX-3 Mirage sở hữu lớp vỏ phủ nano tán sắc ánh sáng, liên tục tạo ra 2 tàn ảnh quang học song song khiến đối phương không thể phân biệt vị trí thực.',
    mainWeaponName: 'Lưới Đạn Đan Chéo 30°',
    mainWeaponDetails:
      'Hai bóng ảo ảnh bay kèm hai bên bắn đạn đan chéo góc 30 độ, bao phủ gần như toàn bộ góc bắn phía trước.',
    skillMechanism:
      'Tam Thân Phân Ảnh: Tạo 2 phân thân thật bay yểm trợ thu hút hỏa lực và xả đạn cùng lúc trong 5 giây.',
    tacticalAdvantage:
      'Tỉ lệ né đạn tự nhiên cao (25%); khả năng tiêu diệt địch ở các góc chéo hiểm hóc.',
    recommendedPlaystyle:
      'Di chuyển lượn sóng ngang để quét đạn đan chéo dọn sạch hai góc trên màn hình.',
    counterplayTip:
      'Kích hoạt phân ảnh để thu hút đạn dẫn đường của boss về phía bóng giả.',
  },
  thunderbolt: {
    id: 'thunderbolt',
    codename: 'LX-7 Thunderbolt',
    role: 'Súng Trường Hồ Quang Cao Thế · Sấm Sét Giật Lan 4 Mục Tiêu',
    manufacturer: 'Xưởng Điện Khí Năng Lượng Lôi Thần',
    originRealm: 'Tầng Khí Quyển Sấm Sét Sao Mộc',
    lore:
      'Thu nạp điện tích tĩnh từ các tầng mây bão khí quyển sao Mộc, LX-7 Thunderbolt phóng ra các tia sét plasma hàng triệu volt truyền dẫn qua kết cấu kim loại của kẻ thù.',
    mainWeaponName: 'Hồ Quang Điện Sét Chuỗi',
    mainWeaponDetails:
      'Bắn tia sét cao áp tự động giật chuyền qua tối đa 4 mục tiêu kế cận, không bao giờ lo bắn trượt.',
    skillMechanism:
      'Bão Điện Từ Bất Tận: Tạo trường điện từ 360 độ quanh thân tàu, liên tục phóng sét giật sập mọi mục tiêu áp sát trong 4 giây.',
    tacticalAdvantage:
      'Khả năng tiêu diệt bầy quái nhỏ đông đúc nhanh nhất mà không cần ngắm chuẩn.',
    recommendedPlaystyle:
      'Thích hợp với người chơi thích di chuyển né đòn liên tục vì đạn tự động giật lan trúng mục tiêu.',
    counterplayTip:
      'Bay thẳng vào giữa đám đông rồi bật bão điện từ để tận hưởng cảm giác quét sạch bản đồ.',
  },
  plasma_reaper: {
    id: 'plasma_reaper',
    codename: 'KX-5 Plasma Reaper',
    role: 'Lưỡi Hái Plasma Tầm Xa · Đĩa Cưa Năng Lượng Xuyên Giáp',
    manufacturer: 'Lò Rèn Vũ Khí Cận Chiến Không Gian',
    originRealm: 'Vành Đai Quặng Thép Đỏ',
    lore:
      'KX-5 Plasma Reaper là dòng tiêm kích đột kích trang bị máy cắt năng lượng phân tử, xé toạc các lớp vỏ thép kiên cố nhất của hạm đội phòng thủ.',
    mainWeaponName: 'Đĩa Cưa Năng Lượng Xuyên Thấu',
    mainWeaponDetails:
      'Bắn các đĩa cưa plasma quay với tốc độ 50.000 vòng/phút, xuyên qua nhiều kẻ địch trên một đường thẳng.',
    skillMechanism:
      'Vũ Điệu Lưỡi Hái: Xoay tròn 4 đĩa cưa khổng lồ quanh thân tàu chém nát mọi kẻ địch và đạn trong cự ly gần.',
    tacticalAdvantage:
      'Đạn xuyên hàng dọc cực mạnh; khả năng tự vệ cận chiến xuất sắc khi bị quái áp sát.',
    recommendedPlaystyle:
      'Canh thẳng hàng dọc với các tàu lớn của địch để một phát bắn xuyên từ đầu tới đuôi.',
    counterplayTip:
      'Dùng 4 đĩa cưa xoay quanh tàu như một chiếc khiên di động để đâm thẳng vào đàn quái nhỏ.',
  },
  tempest: {
    id: 'tempest',
    codename: 'WX-4 Tempest',
    role: 'Pháo Siêu Âm Dao Động · Sóng Chấn Động Hình Sin Quét Bản Đồ',
    manufacturer: 'Trung Tâm Thủy Động Lực Vũ Trụ',
    originRealm: 'Hành Tinh Khí Quyển Bão Tố Neptune',
    lore:
      'Sử dụng màng loa dao động siêu tần số, WX-4 Tempest phát ra các đợt sóng âm hình sin cộng hưởng có thể làm vỡ vụn các cấu trúc kim loại giòn.',
    mainWeaponName: 'Sóng Chấn Động Dao Động Tần Cao',
    mainWeaponDetails:
      'Bắn sóng xung kích hình sin uốn lượn nhịp nhàng, vừa gây sát thương vừa đẩy lùi đạn nhẹ của đối phương.',
    skillMechanism:
      'Lốc Xoáy Vũ Trụ: Tạo cơn lốc xoáy năng lượng khổng lồ tại trung tâm cuốn phăng toàn bộ máy bay nhỏ.',
    tacticalAdvantage:
      'Độ bao phủ màn hình cực rộng nhờ quỹ đạo đạn hình sin dao động.',
    recommendedPlaystyle:
      'Lắc nhẹ thân tàu qua lại để sóng âm lan tỏa bao trùm 100% diện tích màn hình.',
    counterplayTip:
      'Lốc xoáy vũ trụ có thể dùng để cầm chân lính nhỏ trong lúc tập trung hỏa lực bắn trùm.',
  },
  nanite_swarm: {
    id: 'nanite_swarm',
    codename: 'NX-66 Nanite Swarm',
    role: 'Công Nghệ Sinh Học Vi Mô · Bầy Bọ Gặm Nhấm & Tự Hồi Phục',
    manufacturer: 'Viện Công Nghệ Nano Sinh Học Hư Không',
    originRealm: 'Hành Tinh Cơ Khí Hóa Cybertron',
    lore:
      'Được cấu tạo từ hàng tỷ cá thể robot nanite tự sao chép, NX-66 có khả năng phân hủy xác tàu địch thành kim loại lỏng để tái tạo lớp vỏ cho chính mình.',
    mainWeaponName: 'Bầy Bọ Nanite Ăn Mòn',
    mainWeaponDetails:
      'Phóng bầy bọ bám chặt vào thân tàu địch, ăn mòn 30% giáp và tự nhân bản nhảy sang mục tiêu bên cạnh khi mục tiêu cũ nổ.',
    skillMechanism:
      'Bão Bọ Ăn Mòn: Kích nổ bầy Nanite cực đại, chuyển hóa 30% sát thương gây ra thành Máu và Giáp phục hồi chiến cơ.',
    tacticalAdvantage:
      'Sát thương theo thời gian liên tục và khả năng tự hồi phục giáp độc đáo.',
    recommendedPlaystyle:
      'Bắn đều vào nhiều mục tiêu để bầy bọ lây nhiễm sang toàn bộ hạm đội địch.',
    counterplayTip:
      'Kích hoạt skill ngay khi trên màn hình có nhiều kẻ địch đang bị bọ bám để hồi lượng giáp tối đa.',
  },
  plasma_hydra: {
    id: 'plasma_hydra',
    codename: 'HX-9 Hydra Cannon',
    role: 'Pháo Đa Nòng Thủy Lực · 9 Nòng Phủ Kín Nửa Màn Hình',
    manufacturer: 'Tổ Hợp Đóng Tàu Chiến Hạm Biển Sâu',
    originRealm: 'Đại Dương Vô Tận Europa',
    lore:
      'Mang sức mạnh của quái thú biển 9 đầu Hydra thần thoại, HX-9 được trang bị hệ thống pháo thủy lực phân nhánh xả hỏa lực không góc chết.',
    mainWeaponName: 'Pháo Plasma 9 Nòng Tán Xạ',
    mainWeaponDetails:
      'Bắn chùm 9 tia plasma đa góc độ bao phủ kín toàn bộ nửa trên màn hình, không một ngóc ngách nào có thể thoát.',
    skillMechanism:
      'Thủy Quái Cuồng Nộ: Xả đợt pháo kích 18 nòng liên hoàn trong 3.5 giây dọn sạch bầu trời.',
    tacticalAdvantage:
      'Góc bắn rộng nhất game, hoàn hảo để tiêu diệt các tàu cơ động bay vòng phía sau.',
    recommendedPlaystyle:
      'Đứng ở 1/3 phía dưới màn hình để chùm đạn 9 nòng có đủ không gian tỏa rộng nhất.',
    counterplayTip:
      'Khi gặp boss to, áp sát lại gần để toàn bộ 9 tia đạn cùng dồn vào một điểm gây sát thương cực đại.',
  },
  prism_aegis: {
    id: 'prism_aegis',
    codename: 'PX-7 Prism Refractor',
    role: 'Khúc Xạ Ánh Sáng Đa Phổ · Laser Dội Biên & Phản Hồi Đạn',
    manufacturer: 'Trung Tâm Nghiên Cứu Quang Phổ Pha Lê',
    originRealm: 'Hành Tinh Tinh Thể Lăng Kính Caelum',
    lore:
      'Sử dụng các thấu kính pha lê siêu tinh khiết, PX-7 Prism Refractor biến đổi tia laser thông thường thành mạng lưới ánh sáng dội biên tường độc đáo.',
    mainWeaponName: 'Laser Đa Sắc Dội Biên Màn Hình',
    mainWeaponDetails:
      'Bắn tia laser 7 màu dội 2 lần khi chạm mép màn hình, tạo ma trận ánh sáng đan chéo khóa chặt mục tiêu.',
    skillMechanism:
      'Lưới Ánh Sáng Phản Xạ: Bật trường quang học phản hồi 50% đạn địch bắn ngược lại chúng và tăng 30% né tránh trong 4 giây.',
    tacticalAdvantage:
      'Tận dụng mép màn hình để nhân đôi hiệu quả sát thương; khả năng phản đòn độc nhất vô nhị.',
    recommendedPlaystyle:
      'Bắn chéo góc vào mép tường để tia laser dội lại quét vào sườn của đội hình địch.',
    counterplayTip:
      'Bật phản hồi đạn khi boss bắn chùm đạn đặc để chính loạt đạn đó quay lại tiêu diệt boss.',
  },

  // --- TIER B FIGHTERS ---
  phoenix: {
    id: 'phoenix',
    codename: 'VX-9 Phoenix',
    role: 'Tiêm Kích Siêu Thanh Cơ Động Cao · Đạn Chùm Cánh Én',
    manufacturer: 'Bộ Tư Lệnh Phòng Không Tiên Phong Sky Vanguard',
    originRealm: 'Căn Cứ Mặt Đất Tân Trái Đất',
    lore:
      'VX-9 Phoenix (Phượng Hoàng) là chiến cơ xuất kích tiêu chuẩn của mọi phi công tinh nhuệ khi gia nhập Sky Vanguard. Khung thân sợi carbon siêu nhẹ kết hợp động cơ phản lực kép cho độ linh hoạt phi thường.',
    mainWeaponName: 'Pháo Đạn Chùm Cánh Én Đa Nòng',
    mainWeaponDetails:
      'Bắn chùm đạn hình cánh én xòe rộng với tốc độ ổn định, dễ dàng điều khiển và kiểm soát không vực.',
    skillMechanism:
      'Tăng Tốc Siêu Thanh: Tăng 60% tốc độ cơ động và nhân đôi tốc độ bắn liên thanh trong 4 giây.',
    tacticalAdvantage:
      'Cực kỳ cân bằng giữa công và thủ; là lựa chọn tin cậy cho tân thủ làm quen với nhịp độ trận đấu.',
    recommendedPlaystyle:
      'Giữ thế trận linh hoạt, di chuyển liên tục để né đạn và tận dụng góc xòe của đạn chùm.',
    counterplayTip:
      'Kích hoạt Tăng Tốc Siêu Thanh khi nhặt được hòm tăng cấp đạn [P] để tối đa hóa lượng đạn xả ra.',
  },
  titan: {
    id: 'titan',
    codename: 'TX-22 Titan',
    role: 'Thiết Giáp Hạm Hạng Nặng · Giáp Trụ Bất Hoại & Tên Lửa Tự Dẫn',
    manufacturer: 'Tập Đoàn Công Nghiệp Nặng Titan Forge',
    originRealm: 'Mặt Trăng Titan Sao Thổ',
    lore:
      'Được mệnh danh là pháo đài bay bọc thép, TX-22 Titan sở hữu lớp giáp dày gấp 3 lần tiêm kích thông thường, sẵn sàng đè bẹp mọi chướng ngại trên đường bay.',
    mainWeaponName: 'Pháo Plasma Hạng Nặng & Tên Lửa Tầm Nhiệt',
    mainWeaponDetails:
      'Bắn viên pháo plasma có khối lượng lớn phá hủy giáp địch kết hợp phóng tên lửa tầm nhiệt hỗ trợ.',
    skillMechanism:
      'Pháo Đài Bất Hoại: Kích hoạt khiên bọc thép hấp thụ hoàn toàn 100% sát thương nhận vào trong 3.5 giây.',
    tacticalAdvantage:
      'Lượng Máu và Giáp khởi điểm cực lớn; không sợ va chạm với các mảnh thiên thạch nhỏ.',
    recommendedPlaystyle:
      'Lối chơi phòng thủ phản công; tận dụng lượng giáp dày để trụ vững trước mưa đạn dày đặc.',
    counterplayTip:
      'Bật Pháo Đài Bất Hoại để vượt qua các khe đạn hẹp mà không phải tốn Bom EMP.',
  },
  ghost: {
    id: 'ghost',
    codename: 'QX-4 Ghost',
    role: 'Chiến Cơ Tàng Hình Đột Kích · Laser Xuyên Thấu Hàng Dọc',
    manufacturer: 'Cục Tình Báo Tác Chiến Đêm Phantom',
    originRealm: 'Khu Vực Bóng Tối Mặt Trăng',
    lore:
      'Trang bị hệ thống hấp thụ sóng radar tiên tiến, QX-4 Ghost lướt đi trong bóng đêm như một bóng ma vô hình trước khi tung ra tia laser hủy diệt.',
    mainWeaponName: 'Tia Laser Xuyên Thấu Không Gián Đoạn',
    mainWeaponDetails:
      'Chiếu tia laser thẳng tắp không gián đoạn, thiêu đốt liên tục toàn bộ mục tiêu nằm trên đường chiếu sáng.',
    skillMechanism:
      'Tàng Hình Hư Không: Tàng hình trước radar trong 4 giây, đồng thời tăng 100% sát thương bạo kích.',
    tacticalAdvantage:
      'Tia laser liên tục không gián đoạn giúp dọn lính thẳng hàng cực nhanh mà không bị cản bởi xác quái.',
    recommendedPlaystyle:
      'Căn chỉnh tọa độ thẳng hàng với các tàu có lượng máu trâu để tia laser đốt liên tục.',
    counterplayTip:
      'Bật tàng hình để thoát hiểm an toàn khi bị dồn vào chân tường, đồng thời tranh thủ bắn bạo kích x2.',
  },
  viper: {
    id: 'viper',
    codename: 'VX-2 Viper',
    role: 'Tiêm Kích Độc Tố Axit · Ăn Mòn Giảm Máu Liên Tục',
    manufacturer: 'Phòng Thí Nghiệm Độc Học Không Gian',
    originRealm: 'Đầm Lầy Độc Tinh Tú Venus',
    lore:
      'Được thiết kế lấy cảm hứng từ loài rắn lục săn mồi, VX-2 Viper sử dụng hợp chất axit fluorine hữu cơ cực độc có thể làm rữa nát mọi hợp kim titan.',
    mainWeaponName: 'Gai Độc Axit Ăn Mòn',
    mainWeaponDetails:
      'Bắn các phi tiêu axit bám vào vỏ tàu địch, gây sát thương ăn mòn tích lũy theo từng giây.',
    skillMechanism:
      'Nọc Độc Hư Không: Phun sương axit độc bao phủ toàn màn hình, khiến toàn bộ địch hiện diện lập tức mất 50% lượng máu hiện tại.',
    tacticalAdvantage:
      'Tuyệt kỹ giảm 50% máu toàn bộ địch là đòn khắc chế cực mạnh các đợt quái trâu ở wave cao.',
    recommendedPlaystyle:
      'Đợi màn hình xuất hiện nhiều tàu hạng nặng rồi kích hoạt skill để quét sạch nửa cây máu của toàn bộ chúng.',
    counterplayTip:
      'Kết hợp với phi công tăng sát thương chuẩn để kết liễu nốt 50% máu còn lại của địch.',
  },
  falcon: {
    id: 'falcon',
    codename: 'FX-8 Falcon',
    role: 'Hỏa Thần Súng Máy Minigun · Xả Đạn Dày Đặc Tốc Độ Cực Nhanh',
    manufacturer: 'Tổng Kho Vũ Khí Hỏa Lực Liên Lục Địa',
    originRealm: 'Trạm Tuần Tra Vành Đai Tiểu Hành Tinh',
    lore:
      'FX-8 Falcon trang bị cụm súng máy 6 nòng quay Minigun với tốc độ bắn lên tới 6.000 phát/phút, biến bầu trời thành một bức tường đạn kim loại vonfram dày đặc.',
    mainWeaponName: 'Cụm Súng Máy Minigun 6 Nòng',
    mainWeaponDetails:
      'Xả liên hoàn các phát đạn kim loại vonfram với mật độ dày đặc và tốc độ bay nhanh nhất trong các dòng tiêm kích.',
    skillMechanism:
      'Hỏa Lực Cuồng Bạo: Tăng 150% tốc độ xả đạn trong 4 giây, biến hỏa lực thành một luồng tia đạn liên tục.',
    tacticalAdvantage:
      'Tốc độ bắn cực cao giúp kích hoạt các hiệu ứng bạo kích và phụ kiện vũ khí với tần suất tối đa.',
    recommendedPlaystyle:
      'Khóa chặt mục tiêu trước mũi tàu và giữ nút bắn để dòng đạn cuốn phăng đối thủ.',
    counterplayTip:
      'Bật Hỏa Lực Cuồng Bạo ngay khi trùm vừa xuất hiện để giáng đòn phủ đầu uy lực.',
  },
  bastion: {
    id: 'bastion',
    codename: 'BX-3 Bastion',
    role: 'Tàu Tuần Tra Phòng Ngự · Đạn Sóng Phản Kích & Sóng Đẩy EMP',
    manufacturer: 'Lực Lượng Biên Phòng Không Gian Vành Đai Ngoài',
    originRealm: 'Căn Cứ Tiền Tiêu Trạm Vệ Tinh Titan',
    lore:
      'BX-3 Bastion được chế tạo nhằm mục đích bảo vệ các trạm nghiên cứu khoa học đơn độc trước các toán cướp vũ trụ, chuyên về các biện pháp xung kích đẩy lùi và triệt tiêu đạn đạo.',
    mainWeaponName: 'Vòng Sóng Chấn Động Va Đập',
    mainWeaponDetails:
      'Bắn các vòng tròn sóng xung chấn va đập, có khả năng làm tan biến các viên đạn nhỏ của kẻ địch trên đường bay.',
    skillMechanism:
      'Lá Chắn Đẩy Lùi: Kích nổ sóng EMP cục bộ đẩy lùi toàn bộ kẻ địch ra xa và xóa sạch mọi viên đạn xung quanh.',
    tacticalAdvantage:
      'Đạn chính có khả năng triệt tiêu đạn địch, biến nó thành chiếc khiên sống bảo vệ buồng lái.',
    recommendedPlaystyle:
      'Chủ động bắn chặn các luồng đạn của kẻ thù để mở đường bay an toàn cho phi cơ.',
    counterplayTip:
      'Khi bị nhiều tàu địch bao vây áp sát, Lá Chắn Đẩy Lùi sẽ dạt toàn bộ chúng ra xa và tạo khoảng trống an toàn.',
  },
  stellar_sentinel: {
    id: 'stellar_sentinel',
    codename: 'GX-14 Stellar Sentinel',
    role: 'Hộ Vệ Quỹ Đạo Sao Băng · Đạn Sóng Xoắn Helix & Pháo Đài Vệ Tinh 360°',
    manufacturer: 'Liên Bang Công Nghệ Vệ Tinh Trọng Lực Sirius',
    originRealm: 'Vành Đai Thiên Thể Sirius B',
    lore:
      'GX-14 Stellar Sentinel là chiến cơ hộ tống tối tân được phát triển nhằm bảo vệ các tuần dương hạm hạm đội. Thân tàu được neo bởi mạng lưới vệ tinh vi mô bay vòng quanh theo quỹ đạo lực từ, có khả năng vừa đánh chặn vừa phản pháo liên hoàn.',
    mainWeaponName: 'Súng Sóng Xoắn Helix Quỹ Đạo',
    mainWeaponDetails:
      'Phóng ra hai chùm sóng quang tử xoắn kép dạng DNA đan xen, liên tục bẻ gãy đạn đạo của đối phương và đục thủng giáp trước tàu địch.',
    skillMechanism:
      'Pháo Đài Vệ Tinh 360°: Kích hoạt từ trường mở rộng 6 vệ tinh quỹ đạo ra xa, miễn nhiễm sát thương trong 4.5 giây và phản xạ 12 tia laser vệ tinh quét sạch không phận.',
    tacticalAdvantage:
      'Phòng ngự vững chắc nhờ quỹ đạo vệ tinh chặn đạn phía trước; khả năng sống sót cao trong các màn bão đạn dày đặc.',
    recommendedPlaystyle:
      'Tiến sâu vào tuyến giữa để vệ tinh bảo vệ tối đa và xả luồng đạn xoắn thẳng vào trung tâm đội hình địch.',
    counterplayTip:
      'Bật kỹ năng khi các Boss phóng mưa đạn 360 độ để vừa bất tử vừa bắn trả 12 tia laser cực mạnh.',
  },
  void_rift: {
    id: 'void_rift',
    codename: 'VX-8 Void Riftwalker',
    role: 'Kẻ Xé Rách Không Gian · Đạn Lưỡi Dao Bẫy Nứt & Cổng Không Gian Tử Thần',
    manufacturer: 'Viện Nghiên Cứu Chiều Không Gian 4D Abyssal',
    originRealm: 'Vực Thẳm Không Gian Chiều Thứ 5',
    lore:
      'VX-8 Void Riftwalker không di chuyển theo quy luật vật lý thông thường. Mũi tàu gắn máy phát xung hạt lượng tử tạo ra các vết nứt chân không trong cấu trúc không thời gian, xé rách mọi vật chất tiếp xúc với nó.',
    mainWeaponName: 'Lưỡi Dao Xé Rách Chiều Không Gian',
    mainWeaponDetails:
      'Bắn các lưỡi dao hư không màu tím đậm bay đến vị trí chỉ định và neo lại tạo thành vết nứt không gian tồn tại 1.8 giây, thiêu đốt và xé toạc kẻ địch bước qua.',
    skillMechanism:
      'Sụp Đổ Chiều Không Gian: Cắt đôi không phận bằng một đường nứt chân không khổng lồ theo chiều dọc, tạo lực hút kéo kẻ thù vào tâm nứt và bộc phát 3 đợt nổ không gian xé toạc 50% giáp đối thủ.',
    tacticalAdvantage:
      'Sát thương theo vùng cực kỳ bá đạo; kẻ thù di chuyển vào vết nứt sẽ liên tục bị xé toạc giáp và máu.',
    recommendedPlaystyle:
      'Tạo mạng lưới vết nứt ở các luồng quái di chuyển để chúng tự bay vào cửa tử mà không cần đuổi theo.',
    counterplayTip:
      'Kích hoạt skill ngay khi wave quái mới xuất hiện để bẫy nứt xé toạc toàn bộ đội hình địch ngay tức khắc.',
  },
  sol_inferno: {
    id: 'sol_inferno',
    codename: 'FX-33 Sol Inferno',
    role: 'Hỏa Thần Viêm Đế · Bom Napalm Rơi Chậm & Biển Lửa Lan Tỏa',
    manufacturer: 'Tổ Hợp Hạt Nhân Lò Nhiệt Hạch Sao Hỏa',
    originRealm: 'Vùng Lõi Mặt Trời Đỏ Betelgeuse',
    lore:
      'FX-33 Sol Inferno sử dụng chất đốt plasma nhiệt hạch gốc hydro nặng cực kỳ nguy hiểm. Các quả bom Napalm do máy bay thả ra có thể thiêu rụi cả một tiểu hành tinh trong nháy mắt.',
    mainWeaponName: 'Bom Nhiệt Hạch Napalm Rơi Chậm',
    mainWeaponDetails:
      'Bắn ra các quả đạn pháo nhiệt hạch Napalm bùng nổ trên không và rải thảm tàn lửa bốc cháy dữ dội rơi chậm dần, tạo thành rèm lửa thiêu đốt liên tục.',
    skillMechanism:
      'Biển Lửa Siêu Tân Tinh: Giải phóng sóng nhiệt cuồng nộ biến toàn bộ nửa dưới màn hình thành biển lửa thiêu đốt 5 giây, hủy diệt 100% đạn địch và tăng 40% tốc bắn cho phi cơ.',
    tacticalAdvantage:
      'Vùng thiêu đốt Napalm ngăn chặn triệt để mọi đợt quái cảm tử lao xuống; biển lửa xóa sạch đạn địch phía trước.',
    recommendedPlaystyle:
      'Bắn rải thảm Napalm ở tầm trung để tàn lửa bao phủ bề mặt, giữ khoảng cách và thiêu rụi quái vật từ xa.',
    counterplayTip:
      'Tận dụng biển lửa của tuyệt kỹ để áp sát Boss và xả hỏa lực với tốc độ bắn tăng 40%.',
  },
  chrono_echo: {
    id: 'chrono_echo',
    codename: 'TX-19 Chrono Resonator',
    role: 'Bộ Cộng Hưởng Âm Vang · Đạn Âm Vang Tự Nhân Đôi & Đảo Ngược Thời Gian',
    manufacturer: 'Viện Đo Lường Thời Không Greenwich Galaxy',
    originRealm: 'Kỷ Nguyên Vòng Lặp Vô Tận',
    lore:
      'TX-19 Chrono Resonator sở hữu bộ dao động thạch anh thời gian có thể tạo ra âm vang vật chất. Đạn bắn ra có thể tự lặp lại chính nó trong dòng thời gian tiếp theo, nhân đôi mật độ hỏa lực một cách kỳ diệu.',
    mainWeaponName: 'Sóng Âm Vang Nhại Lại Thời Không',
    mainWeaponDetails:
      'Bắn chùm sóng âm vang màu xanh ngọc lam; sau 0.2 giây bay, viên đạn tự động nhân đôi một bản sao âm vang tách ra góc chéo, tạo thành chùm sóng âm kép gấp 2 lần sát thương.',
    skillMechanism:
      'Đảo Ngược Thời Gian: Kích hoạt nghịch dòng thời không, đẩy giật lùi toàn bộ quái vật và đạn địch về đỉnh màn hình 200px trong 1.5 giây, đồng thời lập tức hồi phục 100% Giáp bị mất gần đây.',
    tacticalAdvantage:
      'Mật độ đạn nở rộng về phía trước gấp đôi; khả năng hồi phục giáp tức thì cứu mạng phi công ở khoảnh khắc sinh tử.',
    recommendedPlaystyle:
      'Duy trì khoảng cách vừa phải để đạn kịp tách đôi âm vang trước khi chạm mục tiêu, tối đa hóa sát thương kép.',
    counterplayTip:
      'Khi giáp bị tụt sâu hoặc bị quái áp sát sát đáy màn hình, kích hoạt Đảo Ngược Thời Gian để giật lùi quái và hồi đầy bình giáp.',
  },
  graviton_lance: {
    id: 'graviton_lance',
    codename: 'GX-99 Graviton Piercer',
    role: 'Mũi Giáo Trọng Lực Siêu Thanh · Pháo Ray Xuyên Thấu Kèm Sóng Xung Kích Nén',
    manufacturer: 'Xưởng Đóng Tàu Không Gian Siêu Nặng Titan Heavy Forge',
    originRealm: 'Hành Tinh Lõi Sắt Cường Độ Cao',
    lore:
      'GX-99 Graviton Piercer mang trên mình nòng pháo ray từ trường dài bằng cả thân tàu, gia tốc đầu đạn trọng lực lên đến vận tốc 1400 px/s, có thể bắn xuyên qua một hạm đội tuần dương chỉ với một phát đạn.',
    mainWeaponName: 'Mũi Giáo Trọng Lực Siêu Thanh',
    mainWeaponDetails:
      'Bắn mũi giáo trọng lực xuyên thấu toàn bộ mục tiêu trên đường thẳng với vận tốc cực hạn; mỗi khi xuyên qua kẻ địch, nó phóng thích sóng xung lực nén gây sát thương sang hai bên sườn.',
    skillMechanism:
      'Đại Pháo Khải Huyền: Tích tụ điện từ và phóng luồng trọng lực hủy diệt khổng lồ rộng 80px từ mũi phi cơ, nghiền nát mọi tàu chiến và tạo lực đè bẹp các đòn tấn công của đối thủ trong 4 giây.',
    tacticalAdvantage:
      'Khả năng xuyên thấu vô hạn; một phát bắn có thể dọn sạch cả một hàng dọc kẻ địch từ đầu đến cuối màn hình.',
    recommendedPlaystyle:
      'Căn chỉnh trục dọc của phi cơ thẳng hàng với những con quái cứng đầu nhất phía sau đám quái nhỏ.',
    counterplayTip:
      'Kích hoạt Đại Pháo Khải Huyền thẳng vào tim Boss để bào sạch thanh máu trong 4 giây nén trọng lực.',
  },
  bio_spore: {
    id: 'bio_spore',
    codename: 'BX-7 Bio Vanguard',
    role: 'Chiến Cơ Sinh Học Độc Tinh · Nang Bào Tử Ký Sinh & Chuỗi Nổ Lây Nhiễm Dây Chuyền',
    manufacturer: 'Phòng Thí Nghiệm Đột Biến Sinh Học Rừng Sao Chổi Xanh',
    originRealm: 'Hệ Sinh Thái Ký Sinh Vực Sâu',
    lore:
      'BX-7 Bio Vanguard là sinh vật cơ khí lai hữu cơ độc nhất vô nhị. Bộ khung tàu phát triển từ tế bào thực vật ký sinh vũ trụ, bắn ra những nang bào tử sống có thể sinh sôi nảy nở trên thân tàu đối phương.',
    mainWeaponName: 'Nang Bào Tử Ký Sinh Nở Rộ',
    mainWeaponDetails:
      'Bắn các nang bào tử uốn lượn bám chặt vào kẻ địch; khi mục tiêu bị phá hủy hoặc sau 1.5 giây, bào tử nổ tung và phóng 4 hạt gai độc tầm nhiệt lây nhiễm sang các kẻ địch kế cận.',
    skillMechanism:
      'Đại Dịch Ký Sinh Tuyệt Diệt: Phóng thích đám mây bào tử độc lục bảo bao trùm toàn bộ trận địa, lập tức rút 25% máu của toàn bộ kẻ địch, làm câm lặng súng địch trong 3 giây và rơi ngọc hồi giáp.',
    tacticalAdvantage:
      'Hiệu ứng nổ dây chuyền lan truyền mạnh mẽ; diệt một con quái kéo theo cả bầy quái xung quanh phát nổ.',
    recommendedPlaystyle:
      'Bắn vào các mục tiêu yếu nhất trong tốp địch để kích hoạt chuỗi hạt gai độc lây sang các mục tiêu lớn hơn.',
    counterplayTip:
      'Gặp các wave quái dày đặc hoặc các boss có triệu hồi tàu con, Đại Dịch Ký Sinh Tuyệt Diệt sẽ dọn dẹp sạch sẽ trong tích tắc.',
  },
};

/**
 * Helper to get dossier for a fighter
 */
export function getFighterDossier(fighterId: string): FighterDossier {
  return (
    FIGHTER_DOSSIERS[fighterId] || {
      id: fighterId,
      codename: fighterId.toUpperCase(),
      role: 'Chiến Cơ Không Không Tiên Phong',
      manufacturer: 'Bộ Tư Lệnh Sky Vanguard',
      originRealm: 'Không Gian Sâu',
      lore: 'Chiến cơ vũ trụ hiện đại thuộc biên chế lực lượng Sky Vanguard.',
      mainWeaponName: 'Pháo Năng Lượng Vũ Trụ',
      mainWeaponDetails: 'Bắn chùm đạn năng lượng đa tia tiêu diệt kẻ thù.',
      skillMechanism: 'Giải phóng năng lượng bùng nổ càn quét màn hình.',
      tacticalAdvantage: 'Cân bằng giữa tấn công và phòng thủ.',
      recommendedPlaystyle: 'Duy trì khoảng cách chiến thuật hợp lý.',
      counterplayTip: 'Sử dụng kỹ năng đúng thời điểm then chốt.',
    }
  );
}
