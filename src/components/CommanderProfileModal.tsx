/**
 * Commander Profile & Name Change Modal (Hồ Sơ & Cơ Chế Đổi Tên Chỉ Huy)
 * Allows player to:
 * - Rename Commander Name (Tên Chỉ Huy)
 * - Change Tactical Callsign (Mật Danh Phi Đội)
 * - Choose Commander Avatar Insignia
 * - Roll random sci-fi names with one click (Gợi ý ngẫu nhiên)
 * - Review combat achievements and stats
 */

import React,{ useState } from 'react';
import {
X,
User,
Shield,Dices,
Check,
AlertCircle,
Trophy,
Plane,
Globe2,Edit3
} from 'lucide-react';
import {
COMMANDER_AVATARS,
validatePlayerName,
validateCallsign,
getRandomProfileSuggestion,
PlayerProfile,
} from '../game/profile';
import { sound } from '../game/audio';

interface CommanderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onSaveProfile: (newProfile: { playerName: string; callsign: string; avatar: string }) => void;
  highScore?: number;
  ownedFighterCount?: number;
  universeConqueredCount?: number;
  vipLevel?: number;
}

export const CommanderProfileModal: React.FC<CommanderProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  highScore = 0,
  ownedFighterCount = 1,
  universeConqueredCount = 0,
  vipLevel = 0,
}) => {
  const [nameInput, setNameInput] = useState(profile.playerName);
  const [callsignInput, setCallsignInput] = useState(profile.callsign);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState(false);

  // Sync state if modal reopens
  React.useEffect(() => {
    if (isOpen) {
      setNameInput(profile.playerName);
      setCallsignInput(profile.callsign);
      setSelectedAvatar(profile.avatar);
      setErrorMessage(null);
      setSuccessNotice(false);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    sound.playClick();
    const suggestion = getRandomProfileSuggestion();
    setNameInput(suggestion.name);
    setCallsignInput(suggestion.callsign);
    setErrorMessage(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const nameVal = validatePlayerName(nameInput);
    if (!nameVal.valid) {
      setErrorMessage(nameVal.error || 'Tên không hợp lệ.');
      sound.playClick();
      return;
    }

    const callsignVal = validateCallsign(callsignInput);
    if (!callsignVal.valid) {
      setErrorMessage(callsignVal.error || 'Mật danh không hợp lệ.');
      sound.playClick();
      return;
    }

    sound.playReward();
    onSaveProfile({
      playerName: nameVal.cleanName,
      callsign: callsignVal.cleanCallsign,
      avatar: selectedAvatar,
    });

    setSuccessNotice(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/70 p-4 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.35)] flex flex-col gap-3 text-left max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-orbitron font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                <span>HỒ SƠ & ĐỔI TÊN CHỈ HUY</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-orbitron">
                  VIP {vipLevel}
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-rajdhani">
                Tùy chỉnh danh hiệu, tên gọi và mật danh hiển thị trên Bảng Xếp Hạng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng đổi tên"
            className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Identity Showcase Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/40 border border-cyan-500/40 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {selectedAvatar}
            </div>
            <div>
              <div className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-wider">
                CHỈ HUY TRƯỞNG
              </div>
              <div className="font-orbitron font-black text-sm sm:text-base text-white truncate max-w-[170px] sm:max-w-[240px]">
                {nameInput.trim() || 'Chưa đặt tên'}
              </div>
              <div className="text-[10px] text-purple-300 font-orbitron font-semibold">
                MẬT DANH: [{callsignInput.trim().toUpperCase() || 'VANGUARD'}]
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-[10px] font-orbitron font-bold transition-all cursor-pointer active:scale-95 shadow"
            title="Đổi tên ngẫu nhiên"
          >
            <Dices className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden xs:inline">GỢI Ý TÊN</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Commander Name Field */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-orbitron">
              <label htmlFor="commander-name-input" className="text-cyan-300 font-bold flex items-center gap-1">
                <Edit3 className="w-3 h-3" />
                <span>TÊN CHỈ HUY (2 - 20 KÝ TỰ):</span>
              </label>
              <span className={`text-[10px] tabular-nums ${nameInput.length > 20 ? 'text-rose-400' : 'text-slate-400'}`}>
                {nameInput.length}/20
              </span>
            </div>
            <div className="relative">
              <input
                id="commander-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setErrorMessage(null);
                }}
                maxLength={20}
                placeholder="Nhập tên Chỉ Huy của bạn..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white font-orbitron text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
              />
              {nameInput.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNameInput('')}
                  aria-label="Xóa tên"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tactical Callsign Field */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-orbitron">
              <label htmlFor="callsign-input" className="text-purple-300 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>MẬT DANH PHI ĐỘI (CALLSIGN):</span>
              </label>
              <span className={`text-[10px] tabular-nums ${callsignInput.length > 16 ? 'text-rose-400' : 'text-slate-400'}`}>
                {callsignInput.length}/16
              </span>
            </div>
            <input
              id="callsign-input"
              type="text"
              value={callsignInput}
              onChange={(e) => {
                setCallsignInput(e.target.value.toUpperCase());
                setErrorMessage(null);
              }}
              maxLength={16}
              placeholder="VD: PHOENIX-01, ASTRAEA-X..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-purple-400 text-purple-200 font-orbitron text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all uppercase shadow-inner"
            />
          </div>

          {/* Avatar Insignia Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-orbitron font-bold text-slate-300">
              CHỌN BIỂU TƯỢNG HUY HIỆU:
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {COMMANDER_AVATARS.map((av) => {
                const isSelected = selectedAvatar === av.emoji;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av.emoji);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-105'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={av.label}
                  >
                    <span className="text-xl sm:text-2xl">{av.emoji}</span>
                    <span className="text-[8px] font-rajdhani truncate max-w-full mt-0.5">
                      {av.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-rajdhani">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-rajdhani">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Đổi tên Chỉ Huy thành công! Dữ liệu đã được cập nhật.</span>
            </div>
          )}

          {/* Commander Achievements Summary */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
              <Trophy className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
              <span className="text-[8px] font-orbitron text-slate-400">KỶ LỤC ĐIỂM</span>
              <span className="text-[11px] font-orbitron font-bold text-amber-300 tabular-nums">
                {highScore.toLocaleString()}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
              <Plane className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
              <span className="text-[8px] font-orbitron text-slate-400">CHIẾN CƠ</span>
              <span className="text-[11px] font-orbitron font-bold text-cyan-300 tabular-nums">
                {ownedFighterCount}/31 Tàu
              </span>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
              <Globe2 className="w-3.5 h-3.5 text-purple-400 mb-0.5" />
              <span className="text-[8px] font-orbitron text-slate-400">VŨ TRỤ</span>
              <span className="text-[11px] font-orbitron font-bold text-purple-300 tabular-nums">
                {universeConqueredCount}/80 Map
              </span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="text-[9px] text-slate-400 font-rajdhani">
              {profile.renameCount === 0 ? (
                <span className="text-emerald-400 font-bold">✨ Đổi tên miễn phí không giới hạn</span>
              ) : (
                <span>Đã đổi tên {profile.renameCount} lần</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 font-orbitron text-xs transition-all cursor-pointer active:scale-95"
              >
                HỦY
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 text-slate-950 font-orbitron font-black text-xs transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>XÁC NHẬN ĐỔI TÊN</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
