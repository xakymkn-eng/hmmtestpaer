/**
 * Adventure Mode Galactic Map Modal:
 * Chicken Invaders 4 (CI4) Style 20-Stage Galactic Odyssey.
 * Overhauled with spacious full-width map UI, stage info in "!" button dialog,
 * and direct one-click "XUẤT CHIẾN" launch buttons on every stage card & sticky bottom bar.
 */

import React,{ useState,useEffect,useRef,useMemo } from 'react';
import {
X,
Star,
Lock,
Rocket,
Flame,
Info,AlertCircle
} from 'lucide-react';
import {
ADVENTURE_STAGES,
AdventureStage,
AdventureProgress,
getAdventureStageById,
} from '../game/adventure';
import { sound } from '../game/audio';

interface AdventureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: AdventureProgress;
  onLaunchStage: (stageId: number) => void;
}

export const AdventureMapModal: React.FC<AdventureMapModalProps> = ({
  isOpen,
  onClose,
  progress,
  onLaunchStage,
}) => {
  // Safe fallback for progress unlocked stages
  const unlockedList = useMemo(() => {
    return Array.isArray(progress.unlockedStages) && progress.unlockedStages.length > 0
      ? progress.unlockedStages
      : [1];
  }, [progress.unlockedStages]);

  const latestUnlockedId = useMemo(() => Math.max(...unlockedList), [unlockedList]);

  // Selected stage defaults to latest unlocked
  const [selectedStageId, setSelectedStageId] = useState<number>(latestUnlockedId);

  // Detailed stage intelligence info modal (triggered by clicking "!" button)
  const [inspectStageId, setInspectStageId] = useState<number | null>(null);

  // Temporary toast for user feedback (e.g. locked stage warnings)
  const [warningToast, setWarningToast] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);

  // Sync selected stage with latest unlocked when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStageId(latestUnlockedId);
      const timer = setTimeout(() => {
        if (activeCardRef.current && scrollContainerRef.current) {
          activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, latestUnlockedId]);

  if (!isOpen) return null;

  const selectedStage: AdventureStage = getAdventureStageById(selectedStageId);
  const isSelectedUnlocked = unlockedList.includes(selectedStageId);

  const inspectStage: AdventureStage | null = inspectStageId
    ? getAdventureStageById(inspectStageId)
    : null;
  const isInspectUnlocked = inspectStageId ? unlockedList.includes(inspectStageId) : false;

  const handleStageSelect = (stageId: number) => {
    sound.playClick();
    setSelectedStageId(stageId);
  };

  const handleOpenInfo = (stageId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setInspectStageId(stageId);
  };

  const handleLaunch = (stageIdToLaunch?: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetId = stageIdToLaunch ?? selectedStageId;
    const isUnlocked = unlockedList.includes(targetId);

    if (!isUnlocked) {
      sound.playClick();
      setWarningToast(`🔒 Màn ${targetId} chưa mở khóa! Hãy vượt Màn ${targetId - 1} để mở khóa màn này.`);
      setTimeout(() => setWarningToast(null), 3500);
      return;
    }

    sound.playReward();
    setInspectStageId(null);
    onLaunchStage(targetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-5xl h-[94vh] max-h-[920px] bg-gradient-to-b from-[#0a1424] via-[#050b14] to-[#02060c] border-2 border-cyan-400/60 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.35)] flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-rose-600 via-purple-700 to-slate-900 flex items-center justify-center shadow-[0_0_18px_rgba(225,29,72,0.6)] shrink-0 border border-rose-500/40">
              <span className="text-xl sm:text-2xl">👹</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-orange-400">
                  CHIẾN HẠM MA QUÁI · TRÙM KINH DỊ
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-[10px] font-orbitron font-bold text-rose-300">
                  ARMADA SPACE ODYSSEY
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-rajdhani">
                Hành trình 20 dải ngân hà · Bấm nút <strong className="text-cyan-300 font-bold">[ ! ]</strong> để soi hồ sơ Boss Quái Vật · Nhấn <strong className="text-amber-300 font-bold">[XUẤT CHIẾN]</strong> để vào chơi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Count Pill */}
            <div className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-orbitron font-black text-xs sm:text-sm text-amber-300">
                {progress.totalStars || 0} / 60 ⭐
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Đóng bản đồ phiêu lưu"
              className="min-h-[40px] min-w-[40px] p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer flex items-center justify-center touch-manipulation active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning Toast Ribbon */}
        {warningToast && (
          <div className="px-4 py-2 bg-rose-950/90 border-b border-rose-500/50 flex items-center justify-between text-xs font-orbitron text-rose-200 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{warningToast}</span>
            </div>
            <button
              onClick={() => handleLaunch(latestUnlockedId)}
              className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-orbitron text-[10px] uppercase cursor-pointer"
            >
              Chơi Màn {latestUnlockedId} Đã Mở
            </button>
          </div>
        )}

        {/* Spacious Map Grid: 20 Stages, Large Cards, Information on "!", Direct Launch Button */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 pb-24 relative scroll-smooth bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-950 to-slate-950"
        >
          {/* Header Roadmap Indicator */}
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
            <div className="flex items-center gap-2 text-xs font-orbitron text-slate-400">
              <span className="text-cyan-400 font-bold">20 DẢI NGÂN HÀ CHIẾN DỊCH VŨ TRỤ:</span>
              <span className="text-white font-bold">Màn 01 ➜ Màn 20 (Đại Thiết Hạm)</span>
            </div>
            <div className="text-[11px] font-orbitron text-amber-300">
              Đã mở khóa: <strong>{unlockedList.length} / 20</strong> màn
            </div>
          </div>

          {/* 2-Column Responsive Large Stage Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {ADVENTURE_STAGES.map((stage) => {
              const isUnlocked = unlockedList.includes(stage.id);
              const isCompleted = progress.completedStages?.includes(stage.id) ?? false;
              const stars = progress.stageStars?.[stage.id] || 0;
              const highScore = progress.stageHighScores?.[stage.id] || 0;
              const isSelected = selectedStageId === stage.id;
              const isFinal = stage.id === 20;

              return (
                <div
                  key={stage.id}
                  ref={isSelected ? activeCardRef : null}
                  onClick={() => handleStageSelect(stage.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col justify-between cursor-pointer active:scale-[0.99] group ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-950/80 via-slate-900/95 to-slate-950 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/50'
                      : isUnlocked
                      ? 'bg-slate-900/85 hover:bg-slate-850 border-slate-700/80 hover:border-slate-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Top Row: Number Badge, Galaxy Subheading, Stars, and "!" Info Button */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Big Stage Number Badge */}
                      <div
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black font-orbitron text-sm sm:text-base border-2 shadow-md shrink-0 transition-transform ${
                          isFinal
                            ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-rose-600 border-yellow-300 text-slate-950 animate-pulse'
                            : isSelected
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-300 text-slate-950 scale-105'
                            : isUnlocked
                            ? 'bg-slate-800 border-slate-600 text-cyan-300 group-hover:border-cyan-400'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        {isUnlocked ? (
                          stage.id < 10 ? `0${stage.id}` : stage.id
                        ) : (
                          <Lock className="w-5 h-5 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider truncate">
                            {stage.galaxyName}
                          </span>
                          {isFinal && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white font-orbitron font-black text-[9px]">
                              FINAL BOSS
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-orbitron font-bold text-[9px]">
                              ĐÃ QUA
                            </span>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-black font-orbitron text-white truncate">
                          Màn {stage.id}: {stage.name}
                        </h3>
                      </div>
                    </div>

                    {/* Right side of card header: Info "!" Button & Star rating */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Nút "!" ấn vào để xem thông tin chi tiết */}
                      <button
                        type="button"
                        onClick={(e) => handleOpenInfo(stage.id, e)}
                        title="Xem thông tin chi tiết Boss, đội hình & phần thưởng màn này"
                        aria-label={`Xem thông tin Màn ${stage.id}`}
                        className="w-8 h-8 rounded-full bg-cyan-950/80 hover:bg-cyan-800 border-2 border-cyan-400 text-cyan-200 hover:text-white font-black font-orbitron text-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all hover:scale-110 active:scale-90 cursor-pointer touch-manipulation ring-1 ring-cyan-300/40"
                      >
                        <span className="text-sm font-black">!</span>
                      </button>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                              starIdx <= stars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Boss preview & description */}
                  <div className="bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/80 mb-3">
                    <div className="flex items-center justify-between text-xs font-rajdhani">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold truncate">
                        <span>👹</span>
                        <span className="truncate">Boss: {stage.boss.name}</span>
                      </div>
                      <span className="text-amber-300 font-bold font-orbitron shrink-0">
                        +{stage.rewardGold.toLocaleString()} 🪙
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 font-rajdhani line-clamp-1 mt-0.5">
                      {stage.description}
                    </p>
                  </div>

                  {/* Card Bottom Row: Direct Launch Button & Quick Info Trigger */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => handleOpenInfo(stage.id, e)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-orbitron font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Chi tiết [ ! ]</span>
                    </button>

                    {/* Direct Launch Button */}
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={(e) => handleLaunch(stage.id, e)}
                        className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-orbitron font-black text-xs sm:text-sm tracking-wider shadow-[0_0_18px_rgba(245,158,11,0.55)] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 transition-all"
                      >
                        <Rocket className="w-4 h-4 fill-current" />
                        <span>XUẤT CHIẾN MÀN {stage.id}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleLaunch(stage.id, e)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-500 font-orbitron font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chưa mở (Vượt Màn {stage.id - 1})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Bottom Control Bar: Always Visible Regardless of Scroll */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-slate-950/95 border-t border-cyan-500/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.7)] z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-orbitron font-black text-xs">
                MÀN {selectedStage.id} / 20
              </span>
              <div>
                <h4 className="text-sm font-black font-orbitron text-white truncate max-w-[200px] sm:max-w-xs">
                  {selectedStage.name}
                </h4>
                <div className="text-[11px] text-cyan-400 font-rajdhani">
                  {selectedStage.galaxyName}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenInfo(selectedStage.id)}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-300 font-orbitron text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              title="Mở bảng thông tin chi tiết Boss & đội hình màn này"
            >
              <span className="w-4 h-4 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">!</span>
              <span className="hidden sm:inline">Xem Thông Tin</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {isSelectedUnlocked ? (
              <button
                type="button"
                onClick={() => handleLaunch(selectedStage.id)}
                className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 hover:from-amber-300 text-slate-950 font-orbitron font-black text-sm tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.7)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95 transition-all ring-2 ring-amber-300/60"
              >
                <Flame className="w-5 h-5 fill-current animate-pulse" />
                <span>XUẤT CHIẾN MÀN {selectedStage.id}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleLaunch(selectedStage.id)}
                className="w-full sm:w-auto min-h-[46px] px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 font-orbitron font-bold text-xs flex items-center justify-center gap-2 cursor-pointer hover:border-slate-500"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>CHƯA MỞ (HÃY VƯỢT MÀN {selectedStage.id - 1})</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* STAGE INTELLIGENCE MODAL: Triggered by clicking "!" */}
        {/* ============================================================== */}
        {inspectStage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150">
            <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-[#0a1220] to-slate-950 border-2 border-cyan-400 rounded-2xl p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col max-h-[90vh] overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black font-orbitron text-base shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                    !
                  </div>
                  <div>
                    <span className="text-[10px] font-orbitron text-cyan-400 uppercase tracking-wider font-bold">
                      HỒ SƠ TÁC CHIẾN · MÀN {inspectStage.id} / 20
                    </span>
                    <h3 className="text-base sm:text-lg font-black font-orbitron text-white">
                      {inspectStage.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setInspectStageId(null)}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Intelligence Details */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-left">
                
                {/* Galaxy & Context */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] font-orbitron text-cyan-400 font-bold uppercase mb-0.5">
                    ĐỊA BÀN KHÔNG GIAN
                  </div>
                  <div className="text-sm font-orbitron font-bold text-white mb-1">
                    {inspectStage.galaxyName} · {inspectStage.subLocation}
                  </div>
                  <p className="text-xs text-slate-300 font-rajdhani leading-relaxed">
                    {inspectStage.description}
                  </p>
                </div>

                {/* Boss Dossier */}
                <div className="p-3 rounded-xl bg-gradient-to-br from-rose-950/50 via-slate-900 to-amber-950/30 border border-rose-500/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">👹</span>
                      <div>
                        <div className="text-[10px] font-orbitron text-rose-400 uppercase font-bold">
                          TRÙM QUÁI VẬT SIÊU KINH DỊ
                        </div>
                        <div className="text-base font-black font-orbitron text-white">
                          {inspectStage.boss.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: inspectStage.boss.dangerRating }).map((_, i) => (
                        <span key={i} className="text-rose-400 text-sm">💀</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-amber-300 font-rajdhani font-medium mb-1.5 italic">
                    &ldquo;{inspectStage.boss.title}&rdquo;
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-orbitron mb-2">
                    <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">LƯỢNG MÁU: </span>
                      <strong className="text-rose-400">{inspectStage.boss.hp.toLocaleString()} HP</strong>
                    </div>
                    <div className="p-1.5 rounded bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 text-[10px]">GIÁP BẢO VỆ: </span>
                      <strong className="text-cyan-400">{inspectStage.boss.defense} DEF</strong>
                    </div>
                  </div>

                  <p className="text-xs text-rose-200/90 font-rajdhani leading-relaxed bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                    <strong className="text-rose-300 font-bold">Chiêu thức: </strong>
                    {inspectStage.boss.specialAttack}
                  </p>
                </div>

                {/* Wave Formation & Environment */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-orbitron">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <Flame className="w-4 h-4 text-cyan-400" />
                      <span>ĐỘI HÌNH: {inspectStage.formationName}</span>
                    </div>
                    <span className="text-purple-300 text-[11px]">
                      {inspectStage.backgroundTheme.hazardName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-rajdhani">
                    {inspectStage.formationDesc}
                  </p>
                </div>

                {/* Rewards */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs font-orbitron">
                  <span className="text-slate-300 font-bold">PHẦN THƯỞNG:</span>
                  <div className="flex items-center gap-3 text-xs font-black">
                    <span className="text-amber-300">+{inspectStage.rewardGold.toLocaleString()} 🪙</span>
                    <span className="text-cyan-300">+{inspectStage.rewardGems} 💎</span>
                    <span className="text-purple-300">+{inspectStage.rewardShards} 🧩</span>
                  </div>
                </div>

                {/* 3-Star Objectives */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-rajdhani text-slate-300 space-y-1">
                  <div className="text-[10px] font-orbitron text-amber-400 font-bold uppercase mb-1">
                    ĐIỀU KIỆN ĐẠT SAO
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>1 Sao: Tiêu diệt toàn bộ hạm đội quái vật và hạ gục Boss</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>2 Sao: Vượt ải với lượng Máu còn lại &ge; 50%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <span>3 Sao: Lượng Máu &ge; 80% và không dùng hồi sinh</span>
                  </div>
                </div>

              </div>

              {/* Modal Footer CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  onClick={() => setInspectStageId(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-orbitron text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Đóng
                </button>

                {isInspectUnlocked ? (
                  <button
                    onClick={() => handleLaunch(inspectStage.id)}
                    className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 hover:from-amber-300 text-slate-950 font-orbitron font-black text-sm tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 cursor-pointer touch-manipulation active:scale-95"
                  >
                    <Rocket className="w-4 h-4 fill-current" />
                    <span>XUẤT CHIẾN MÀN {inspectStage.id}</span>
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 font-orbitron font-bold text-xs text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>HÃY VƯỢT MÀN {inspectStage.id - 1} ĐỂ MỞ KHÓA</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
