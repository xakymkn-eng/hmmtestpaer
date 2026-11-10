/**
 * Rotating News & Events Carousel Widget (Tin Tức & Sự Kiện Luân Phiên)
 * Auto-cycles every 4.5 seconds introducing new features (Astraea Gacha, 80 Universes Map,
 * Boss Rush & Leaderboard, Mythic Accessories, Daily Login Rewards).
 * Interactive with manual slide controls, pause on hover, and direct feature navigation.
 */

import React,{ useState,useEffect,useRef } from 'react';
import {
Sparkles,
Globe2,Wrench,
Gift,
ChevronLeft,
ChevronRight,
ExternalLink,
Flame
} from 'lucide-react';
import { sound } from '../game/audio';

export interface NewsSlide {
  id: string;
  badge: string;
  title: string;
  highlightText: string;
  description: string;
  ctaText: string;
  gradientBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  icon: React.ReactNode;
  onAction: () => void;
}

interface NewsCarouselWidgetProps {
  onOpenGacha: (tab?: 'fighters' | 'pilots') => void;
  onOpenUniverseSelect?: () => void;
  onOpenBossRushLeaderboard?: () => void;
  onOpenAccessories: () => void;
  onOpenDailyBonus: () => void;
  onOpenModeSelect?: () => void;
}

export const NewsCarouselWidget: React.FC<NewsCarouselWidgetProps> = ({
  onOpenGacha,
  onOpenUniverseSelect,
  onOpenBossRushLeaderboard,
  onOpenAccessories,
  onOpenDailyBonus,
  onOpenModeSelect,
}) => {
  const slides: NewsSlide[] = [
    {
      id: 'gacha_astraea',
      badge: '🌟 GACHA THẦN KHÍ MỚI',
      title: 'SX-77 ASTRAEA',
      highlightText: 'BÃO TINH TÚ CỰC HẠN',
      description: 'Chiến cơ Bậc S tối thượng! Đạn sao tỏa 5 hướng & Triệu hồi Bão Tinh Tú hủy diệt màn hình!',
      ctaText: 'QUAY GACHA',
      gradientBg: 'from-amber-950/80 via-slate-900/90 to-yellow-950/80',
      borderColor: 'border-amber-400/80',
      iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      iconColor: 'text-slate-950',
      textColor: 'text-amber-300',
      icon: <Sparkles className="w-5 h-5 animate-spin" />,
      onAction: () => onOpenGacha('fighters'),
    },
    {
      id: 'universe_80',
      badge: '🗺️ BẢN ĐỒ CHIẾN DỊCH MỚI',
      title: '80 MAP VŨ TRỤ',
      highlightText: 'SIÊU HỐ ĐEN TỬ THẦN',
      description: 'Khám phá 8 cụm thiên hà kỳ vĩ, bão từ trường, mưa thiên thạch & Hố Đen Sagittarius A*!',
      ctaText: 'MỞ BẢN ĐỒ',
      gradientBg: 'from-purple-950/80 via-slate-900/90 to-indigo-950/80',
      borderColor: 'border-purple-400/80',
      iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
      iconColor: 'text-white',
      textColor: 'text-purple-300',
      icon: <Globe2 className="w-5 h-5 animate-pulse" />,
      onAction: () => {
        if (onOpenUniverseSelect) onOpenUniverseSelect();
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'boss_rush',
      badge: '⚔️ ĐẠI CHIẾN HUYỀN THOẠI',
      title: 'ĐẠI CHIẾN BOSS',
      highlightText: 'BẢNG VÀNG VŨ TRỤ',
      description: 'Thách thức liên hoàn 20 Siêu Trùm Không Gian! Đua thời gian diệt trùm & vinh danh Bảng Xếp Hạng!',
      ctaText: 'XEM BXH',
      gradientBg: 'from-rose-950/80 via-slate-900/90 to-red-950/80',
      borderColor: 'border-rose-400/80',
      iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
      iconColor: 'text-white',
      textColor: 'text-rose-300',
      icon: <Flame className="w-5 h-5 text-rose-200 animate-bounce" />,
      onAction: () => {
        if (onOpenBossRushLeaderboard) onOpenBossRushLeaderboard();
        else if (onOpenModeSelect) onOpenModeSelect();
      },
    },
    {
      id: 'accessories_mythic',
      badge: '🛡️ VŨ KHÍ TỐI TÂN',
      title: '29 PHỤ KIỆN VÀNG',
      highlightText: 'XUYÊN GIÁP & BẠO KÍCH',
      description: 'Nâng cấp Nòng Phóng Hư Không, Lõi Bội Nhiễm tăng Xuyên Giáp, Bạo Kích & Sát Thương Chuẩn!',
      ctaText: 'TRANG BỊ',
      gradientBg: 'from-cyan-950/80 via-slate-900/90 to-sky-950/80',
      borderColor: 'border-cyan-400/80',
      iconBg: 'bg-gradient-to-br from-cyan-400 to-sky-500',
      iconColor: 'text-slate-950',
      textColor: 'text-cyan-300',
      icon: <Wrench className="w-5 h-5" />,
      onAction: onOpenAccessories,
    },
    {
      id: 'daily_rewards',
      badge: '🎁 PHÚC LỢI QUÂN ĐỘI',
      title: 'ĐIỂM DANH 7 NGÀY',
      highlightText: '+3,500 KIM CƯƠNG & THƯ',
      description: 'Nhận thưởng Kim Cương mỗi ngày, chuỗi 7 ngày liên tiếp & Hộp Thư tiếp tế Vàng hằng giờ!',
      ctaText: 'NHẬN QUÀ',
      gradientBg: 'from-emerald-950/80 via-slate-900/90 to-teal-950/80',
      borderColor: 'border-emerald-400/80',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      iconColor: 'text-slate-950',
      textColor: 'text-emerald-300',
      icon: <Gift className="w-5 h-5" />,
      onAction: onOpenDailyBonus,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentSlide = slides[currentIndex];

  const handleNext = () => {
    sound.playClick();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    sound.playClick();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSelectDot = (idx: number) => {
    sound.playClick();
    setCurrentIndex(idx);
  };

  // Auto rotate every 4.5s unless hovered or tapped
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, slides.length]);

  return (
    <div
      className="pointer-events-auto relative w-full max-w-4xl mx-auto my-1 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        onClick={currentSlide.onAction}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${currentSlide.gradientBg} border-2 ${currentSlide.borderColor} p-2.5 sm:p-3 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99]`}
      >
        {/* Subtle animated background radial flare */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2.5">
          {/* Left Icon Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${currentSlide.iconBg} ${currentSlide.iconColor} flex items-center justify-center shrink-0 shadow-lg`}
            >
              {currentSlide.icon}
            </div>

            {/* Middle Content */}
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-black/40 border border-white/20 text-[9px] font-orbitron font-extrabold text-white tracking-wider uppercase">
                  {currentSlide.badge}
                </span>
                <span className={`text-[10px] font-orbitron font-black ${currentSlide.textColor}`}>
                  {currentSlide.highlightText}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <h4 className="text-xs sm:text-sm font-black font-orbitron text-white truncate drop-shadow">
                  {currentSlide.title}:
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-200 font-rajdhani truncate max-w-[280px] sm:max-w-md">
                  {currentSlide.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action & Nav Buttons */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handlePrev}
              aria-label="Tiết mục trước"
              className="w-7 h-7 rounded-lg bg-black/40 hover:bg-black/70 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={currentSlide.onAction}
              className="hidden xs:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-orbitron font-black text-[11px] tracking-wider transition-all hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              <span>{currentSlide.ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              aria-label="Tiết mục tiếp theo"
              className="w-7 h-7 rounded-lg bg-black/40 hover:bg-black/70 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Progress & Page Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectDot(idx);
              }}
              aria-label={`Chuyển đến trang ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                  : 'w-2 bg-slate-700/80 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
