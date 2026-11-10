/**
 * Sci-Fi Arcade Mailbox Modal
 * Displays incoming military dispatches, hourly random notifications with Gold & Gems,
 * starter gifts, system notices, and allows claiming attached rewards.
 */

import React,{ useState,useEffect } from 'react';
import { MailItem,HOURLY_MAIL_INTERVAL_MS } from '../game/mail';
import {
Mail,
MailOpen,
Gift,
CheckCircle2,
Trash2,
X,
Sparkles,
Inbox,
AlertCircle,
Clock,
ShieldCheck,
Radio,
} from 'lucide-react';
import { sound } from '../game/audio';

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  mails: MailItem[];
  onReadMail: (mailId: string) => void;
  onClaimReward: (mailId: string) => void;
  onClaimAll: () => void;
  onDeleteClaimed: () => void;
  lastMailDispatch?: number;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({
  isOpen,
  onClose,
  mails,
  onReadMail,
  onClaimReward,
  onClaimAll,
  onDeleteClaimed,
  lastMailDispatch,
}) => {
  const [selectedMailId, setSelectedMailId] = useState<string>(() => {
    const unclaimed = mails.find((m) => !m.isClaimed && m.rewards && m.rewards.length > 0);
    return unclaimed ? unclaimed.id : mails[0]?.id || '';
  });

  // Calculate live countdown to next hourly mail
  const [nextMailCountdown, setNextMailCountdown] = useState<string>('60:00');

  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      const now = Date.now();
      const last = lastMailDispatch || now;
      const nextTime = last + HOURLY_MAIL_INTERVAL_MS;
      const diff = Math.max(0, nextTime - now);

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setNextMailCountdown(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen, lastMailDispatch]);

  if (!isOpen) return null;

  const currentMail = mails.find((m) => m.id === selectedMailId) || mails[0];
  const unclaimedCount = mails.filter((m) => !m.isClaimed && m.rewards && m.rewards.length > 0).length;

  const handleSelectMail = (mail: MailItem) => {
    setSelectedMailId(mail.id);
    if (!mail.isRead) {
      onReadMail(mail.id);
    }
  };

  const handleClaim = (mailId: string) => {
    sound.playClaimReward();
    onClaimReward(mailId);
  };

  const handleClaimAllAvailable = () => {
    sound.playClaimReward();
    onClaimAll();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden text-slate-100">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Modal Header */}
        <header className="relative flex items-center justify-between px-5 py-4 border-b border-cyan-500/30 bg-slate-900/90 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron font-black text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-cyan-200 to-white">
                  HỘP THƯ QUÂN SỰ
                </h2>
                {unclaimedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/90 text-white font-orbitron font-black text-[10px] tracking-wide animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                    {unclaimedCount} QUÀ MỚI
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-rajdhani text-xs text-slate-400">
                <span>Nhận thông báo quân sự ngẫu nhiên định kỳ cứ mỗi 1 giờ</span>
                <span>•</span>
                <span className="text-cyan-300 flex items-center gap-1 font-orbitron font-bold">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Tiếp theo sau: {nextMailCountdown}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition-all cursor-pointer shadow"
            aria-label="Đóng hộp thư"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Modal Body: Two column layout */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden z-10 min-h-[380px] sm:min-h-[460px]">
          {/* Left Column: Mails List */}
          <div className="w-full md:w-80 md:border-r border-cyan-500/20 bg-slate-950/70 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-orbitron">
              <span>DANH SÁCH THƯ ({mails.length})</span>
              <span className="text-[11px] text-amber-400 font-bold">
                {unclaimedCount > 0 ? `${unclaimedCount} chưa nhận` : 'Đã nhận hết'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
              {mails.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <Inbox className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm font-rajdhani">Hộp thư hiện đang trống</p>
                </div>
              ) : (
                mails.map((mail) => {
                  const isSelected = mail.id === currentMail?.id;
                  const hasRewards = mail.rewards && mail.rewards.length > 0;
                  const canClaim = hasRewards && !mail.isClaimed;

                  const totalGems = mail.rewards
                    ? mail.rewards.filter((r) => r.type === 'gems').reduce((sum, r) => sum + r.amount, 0)
                    : 0;
                  const totalGold = mail.rewards
                    ? mail.rewards.filter((r) => r.type === 'gold').reduce((sum, r) => sum + r.amount, 0)
                    : 0;

                  return (
                    <button
                      key={mail.id}
                      onClick={() => handleSelectMail(mail)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer relative flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-950/70 to-slate-900 border border-cyan-400/70 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : mail.isRead
                          ? 'bg-slate-900/40 hover:bg-slate-900/70 border border-transparent'
                          : 'bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {!mail.isRead && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                          )}
                          <span className="font-orbitron text-[11px] font-bold text-slate-300 truncate">
                            {mail.sender}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-rajdhani shrink-0">
                          {mail.date}
                        </span>
                      </div>

                      <div className="font-orbitron font-semibold text-xs text-white line-clamp-1">
                        {mail.title}
                      </div>

                      {/* Reward Tag / Claimed Tag */}
                      <div className="flex items-center justify-between gap-1 mt-1">
                        {canClaim ? (
                          <div className="flex items-center gap-1">
                            {totalGold > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-yellow-500/20 border border-yellow-400/40 text-[9px] font-orbitron font-bold text-yellow-300">
                                <span>🪙</span>
                                <span>+{totalGold.toLocaleString()}</span>
                              </span>
                            )}
                            {totalGems > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-400/50 text-[9px] font-orbitron font-bold text-amber-300">
                                <span>💎</span>
                                <span>+{totalGems.toLocaleString()}</span>
                              </span>
                            )}
                          </div>
                        ) : hasRewards && mail.isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-rajdhani text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã nhận quà</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-rajdhani text-slate-500">
                            Thông báo
                          </span>
                        )}

                        {mail.tag === 'hourly' ? (
                          <span className="text-[8px] uppercase tracking-wider font-orbitron px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            1 Giờ
                          </span>
                        ) : mail.tag === 'welcome' ? (
                          <span className="text-[8px] uppercase tracking-wider font-orbitron px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            Tân Thủ
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Mail Detail View */}
          <div className="flex-1 flex flex-col bg-slate-950/90 overflow-y-auto p-4 sm:p-6 justify-between">
            {currentMail ? (
              <div className="space-y-4">
                {/* Header Information */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-orbitron font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {currentMail.sender}
                    </span>
                    <span className="text-xs text-slate-400 font-rajdhani flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentMail.date}
                    </span>
                  </div>

                  <h3 className="font-orbitron font-bold text-base sm:text-lg text-white">
                    {currentMail.title}
                  </h3>
                </div>

                {/* Mail Body Text */}
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-sm leading-relaxed font-rajdhani text-slate-300 whitespace-pre-line">
                  {currentMail.content}
                </div>

                {/* Attached Rewards Section */}
                {currentMail.rewards && currentMail.rewards.length > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-cyan-500/10 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span className="font-orbitron font-bold text-xs uppercase tracking-wider text-amber-300">
                          VẬT PHẨM TIẾP TẾ ĐÍNH KÈM
                        </span>
                      </div>
                      {currentMail.isClaimed && (
                        <span className="flex items-center gap-1 text-xs font-orbitron font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ĐÃ NHẬN
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentMail.rewards.map((reward, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-amber-400/30 shadow-inner"
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(245,158,11,0.4)]">
                            {reward.type === 'gold' ? '🪙' : '💎'}
                          </div>
                          <div>
                            <div className="font-orbitron font-black text-amber-300 text-sm sm:text-base">
                              +{reward.amount.toLocaleString()} {reward.type === 'gold' ? 'Vàng' : 'Kim Cương'}
                            </div>
                            <div className="text-[11px] text-slate-400 font-rajdhani">
                              {reward.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Single Mail Claim CTA */}
                    <div className="pt-2">
                      {!currentMail.isClaimed ? (
                        <button
                          onClick={() => handleClaim(currentMail.id)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-orbitron font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>NHẬN PHẦN THƯỞNG ĐÍNH KÈM</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-500 font-orbitron font-bold text-xs uppercase cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
                          <span>ĐÃ NHẬN THÀNH CÔNG VÀO TÚI</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <MailOpen className="w-12 h-12 mb-3 opacity-40" />
                <p className="font-orbitron text-sm">Chọn một bức thư để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <footer className="relative flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-cyan-500/30 bg-slate-900/95 z-10">
          <div className="flex items-center gap-2 text-xs font-rajdhani text-slate-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Thông báo mới được gửi tự động mỗi 1 giờ kèm theo tiếp tế quân nhu</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onDeleteClaimed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs font-orbitron transition-all cursor-pointer"
              title="Dọn sạch những thư đã đọc và nhận quà"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>DỌN THƯ ĐÃ NHẬN</span>
            </button>

            <button
              onClick={handleClaimAllAvailable}
              disabled={unclaimedCount === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-orbitron font-black uppercase transition-all shadow cursor-pointer ${
                unclaimedCount > 0
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>NHẬN TẤT CẢ ({unclaimedCount})</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
