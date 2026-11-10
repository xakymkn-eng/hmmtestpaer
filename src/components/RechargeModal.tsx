/**
 * Comprehensive Top-Up & VIP Privilege Center (Trung Tâm Nạp Thẻ & Đặc Quyền VIP)
 * Provides 6 gem packages with x2 first recharge bonus, First Recharge S-Tier Fighter gift,
 * Weekly and Monthly Passes, VIP 0-8 privilege progression, Giftcode redemption,
 * and realistic sandbox payment simulations (Fast 1-click, QR MoMo/VietQR, Scratch card).
 */

import React,{ useState } from 'react';
import {
X,
Sparkles,
Crown,
Gift,
CreditCard,Zap,
Check,CheckCircle2
} from 'lucide-react';
import {
TopUpPackage,
TOPUP_PACKAGES,
TopUpGoldPackage,
TOPUP_GOLD_PACKAGES,
calculateGoldPackageGold,
VIP_TIERS,RechargeSystemState,
getVipStatus,
calculatePackageGems,
PROMO_GIFT_CODES,
getTodayDateString,
RechargeTab
} from '../game/recharge';
import { sound } from '../game/audio';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  gems: number;
  gold?: number;
  rechargeState: RechargeSystemState;
  ownedFighterIds: string[];
  initialTab?: RechargeTab;
  onPurchasePackage: (packageId: string) => void;
  onPurchaseGoldPackage?: (packageId: string) => void;
  onPurchasePass: (passType: 'weekly' | 'monthly') => void;
  onClaimPassDaily: (passType: 'weekly' | 'monthly') => void;
  onClaimFirstRecharge: () => void;
  onClaimVipReward: (vipLevel: number) => void;
  onRedeemCode: (code: string) => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  gems,
  gold = 0,
  rechargeState,
  ownedFighterIds,
  initialTab = 'packs',
  onPurchasePackage,
  onPurchaseGoldPackage,
  onPurchasePass,
  onClaimPassDaily,
  onClaimFirstRecharge,
  onClaimVipReward,
  onRedeemCode,
}) => {
  const [activeTab, setActiveTab] = useState<RechargeTab>(initialTab);
  const [selectedPackForCheckout, setSelectedPackForCheckout] = useState<TopUpPackage | null>(null);
  const [selectedGoldPackForCheckout, setSelectedGoldPackForCheckout] = useState<TopUpGoldPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'fast' | 'qr' | 'card'>('fast');
  const [cardTelco, setCardTelco] = useState<'viettel' | 'vinaphone' | 'mobifone' | 'zing'>('viettel');
  const [cardPin, setCardPin] = useState<string>('9824 8192 4812');
  const [cardSerial, setCardSerial] = useState<string>('1000 4819 2831');
  const [giftCodeInput, setGiftCodeInput] = useState<string>('');
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSelectedPackForCheckout(null);
      setSelectedGoldPackForCheckout(null);
      setCheckoutSuccessMessage(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const vipStatus = getVipStatus(rechargeState.vipExp);
  const todayStr = getTodayDateString();

  const handleOpenCheckout = (pkg: TopUpPackage) => {
    setSelectedPackForCheckout(pkg);
    setSelectedGoldPackForCheckout(null);
    setCheckoutSuccessMessage(null);
  };

  const handleOpenGoldCheckout = (pkg: TopUpGoldPackage) => {
    setSelectedGoldPackForCheckout(pkg);
    setSelectedPackForCheckout(null);
    setCheckoutSuccessMessage(null);
  };

  const handleConfirmCheckout = () => {
    if (selectedGoldPackForCheckout) {
      const pkg = selectedGoldPackForCheckout;
      sound.playTopUpSuccess();
      if (onPurchaseGoldPackage) {
        onPurchaseGoldPackage(pkg.id);
      }
      const isAlready = rechargeState.purchasedPackIds.includes(pkg.id);
      const { totalGold } = calculateGoldPackageGold(pkg, isAlready);
      setCheckoutSuccessMessage(`Thanh toán thành công ${pkg.name}! Nhận +${totalGold.toLocaleString()} 🪙 Vàng và +${Math.floor(pkg.priceVnd / 1000)} EXP VIP!`);

      setTimeout(() => {
        setSelectedGoldPackForCheckout(null);
        setCheckoutSuccessMessage(null);
      }, 1500);
      return;
    }

    if (!selectedPackForCheckout) return;
    const pkg = selectedPackForCheckout;
    sound.playTopUpSuccess();
    onPurchasePackage(pkg.id);
    const isAlready = rechargeState.purchasedPackIds.includes(pkg.id);
    const { totalGems } = calculatePackageGems(pkg, isAlready);
    setCheckoutSuccessMessage(`Thanh toán thành công ${pkg.name}! Nhận ${totalGems.toLocaleString()} 💎 và +${Math.floor(pkg.priceVnd / 1000)} EXP VIP!`);

    setTimeout(() => {
      setSelectedPackForCheckout(null);
      setCheckoutSuccessMessage(null);
    }, 1500);
  };

  const handleAutofillCard = () => {
    const randomPin = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const randomSerial = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setCardPin(randomPin);
    setCardSerial(randomSerial);
  };

  const handleRedeemClick = (codeToUse?: string) => {
    const code = (codeToUse || giftCodeInput).trim().toUpperCase();
    if (!code) return;
    onRedeemCode(code);
    setGiftCodeInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-[#0b172a] via-[#050b14] to-[#03070f] border border-amber-400/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col p-4 sm:p-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-400/20 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Crown className="w-6 h-6 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-orbitron tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                  TRUNG TÂM NẠP & ĐẶC QUYỀN VIP
                </h2>
                <span className={`px-2 py-0.5 rounded text-[10px] font-orbitron font-bold border ${vipStatus.currentTier.badgeColor}`}>
                  VIP {vipStatus.currentTier.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Hệ thống nạp Kim Cương, Nạp Vàng, Quà nạp đầu tặng Chiến cơ S, Thẻ tháng & Mã Giftcode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Gold balance pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
              <span className="text-base">🪙</span>
              <span className="font-orbitron font-bold text-yellow-300 text-sm sm:text-base tabular-nums">
                {gold.toLocaleString()}
              </span>
              <span className="text-[10px] text-yellow-500 font-bold hidden sm:inline">VÀNG</span>
            </div>

            {/* Live Gems balance pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <span className="text-base">💎</span>
              <span className="font-orbitron font-bold text-amber-300 text-sm sm:text-base tabular-nums">
                {gems.toLocaleString()}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Đóng Trung Tâm Nạp"
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* VIP Progress Micro-Bar */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-amber-400/30 flex flex-wrap items-center justify-between gap-3 text-xs font-orbitron">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">CẤP ĐỘ VIP:</span>
            <span className="text-yellow-300 font-black">VIP {vipStatus.currentTier.level}</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">({vipStatus.currentTier.title})</span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-xs min-w-[140px]">
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-2 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                style={{ width: `${vipStatus.progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-300 tabular-nums whitespace-nowrap">
              {vipStatus.nextTier ? `${vipStatus.currentExp}/${vipStatus.expForNext} EXP` : 'MAX'}
            </span>
          </div>

          {vipStatus.nextTier && (
            <div className="text-[11px] text-slate-300">
              Cần thêm <strong className="text-amber-300 font-bold">{(vipStatus.expForNext - vipStatus.currentExp) * 1000} đ</strong> để lên VIP {vipStatus.nextTier.level}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 mt-3 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-orbitron font-bold">
          <button
            onClick={() => setActiveTab('packs')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'packs'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900/60'
            }`}
          >
            <span>💎</span>
            <span>GÓI GEMS</span>
          </button>

          <button
            onClick={() => setActiveTab('gold_packs')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'gold_packs'
                ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                : 'text-yellow-300 hover:text-yellow-200 hover:bg-slate-900/60'
            }`}
          >
            <span>🪙</span>
            <span>GÓI VÀNG</span>
          </button>

          <button
            onClick={() => setActiveTab('first_recharge')}
            className={`relative py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'first_recharge'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'text-rose-300 hover:text-rose-200 hover:bg-slate-900/60'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-rose-300" />
            <span>NẠP ĐẦU</span>
            {!rechargeState.firstRechargeClaimed && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('passes')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'passes'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-900/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>THẺ THÁNG</span>
          </button>

          <button
            onClick={() => setActiveTab('vip')}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'vip'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'text-slate-300 hover:text-purple-300 hover:bg-slate-900/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-purple-400" />
            <span>ĐẶC QUYỀN VIP</span>
          </button>

          <button
            onClick={() => setActiveTab('giftcode')}
            className={`col-span-2 sm:col-span-1 py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'giftcode'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'text-slate-300 hover:text-emerald-300 hover:bg-slate-900/60'
            }`}
          >
            <span>🎁</span>
            <span>GIFTCODE</span>
          </button>
        </div>

        {/* Tab 1: GEM TOP-UP PACKAGES */}
        {activeTab === 'packs' && (
          <div className="mt-4 flex flex-col gap-3">
            {/* Banner: x2 first buy */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/70 border border-amber-400/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
                <div className="text-xs font-rajdhani text-slate-200">
                  <span className="font-orbitron font-bold text-amber-300 uppercase">Ưu đãi nạp đầu mỗi gói:</span>{' '}
                  Nhân đôi 100% số lượng Kim Cương ở lượt nạp đầu tiên cho từng mệnh giá!
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-orbitron font-black text-xs shrink-0 shadow">
                X2 KIM CƯƠNG
              </span>
            </div>

            {/* Grid of 6 packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOPUP_PACKAGES.map((pkg) => {
                const isAlreadyPurchased = rechargeState.purchasedPackIds.includes(pkg.id);
                const { totalGems, isFirstBonus } = calculatePackageGems(pkg, isAlreadyPurchased);

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                      pkg.isHot
                        ? 'bg-gradient-to-b from-amber-950/40 to-slate-900/90 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                        : pkg.isBestValue
                        ? 'bg-gradient-to-b from-purple-950/40 to-slate-900/90 border-purple-400/70 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-900/80 border-slate-700/80 hover:border-amber-400/50'
                    }`}
                  >
                    {/* Badge top-right */}
                    {isFirstBonus ? (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-orbitron font-black text-[10px] shadow">
                        X2 LẦN ĐẦU
                      </div>
                    ) : pkg.badge ? (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-orbitron font-bold text-[10px] shadow">
                        {pkg.badge}
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{pkg.icon}</span>
                        <div>
                          <div className="font-orbitron font-bold text-white text-sm">{pkg.name}</div>
                          <div className="text-[11px] text-slate-400 font-rajdhani">
                            +{Math.floor(pkg.priceVnd / 1000)} EXP VIP
                          </div>
                        </div>
                      </div>

                      {/* Gems number */}
                      <div className="my-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                        <div className="text-2xl font-black font-orbitron text-amber-300 tabular-nums">
                          {totalGems.toLocaleString()} 💎
                        </div>
                        {isFirstBonus ? (
                          <div className="text-[11px] text-emerald-400 font-rajdhani font-semibold">
                            Gốc: {pkg.baseGems.toLocaleString()} + Thưởng: {pkg.firstBonusGems.toLocaleString()} 💎
                          </div>
                        ) : pkg.regularBonusGems > 0 ? (
                          <div className="text-[11px] text-cyan-400 font-rajdhani">
                            Tặng kèm +{pkg.regularBonusGems.toLocaleString()} 💎
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleOpenCheckout(pkg)}
                        className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 fill-current" />
                        <span>NẠP {pkg.priceFormatted}</span>
                      </button>

                      {/* Quick 1-click test button */}
                      <button
                        onClick={() => {
                          sound.playTopUpSuccess();
                          onPurchasePackage(pkg.id);
                        }}
                        title="Thanh toán thử nghiệm nhanh 1-chạm"
                        className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-amber-400/40 text-amber-300 font-orbitron text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all"
                      >
                        1-CHẠM
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 1.5: GOLD TOP-UP PACKAGES (GÓI NẠP MUA VÀNG) */}
        {activeTab === 'gold_packs' && (
          <div className="mt-4 flex flex-col gap-3">
            {/* Banner: x2 first buy for gold */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-950/70 via-slate-900 to-amber-950/70 border border-yellow-400/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 animate-pulse" />
                <div className="text-xs font-rajdhani text-slate-200">
                  <span className="font-orbitron font-bold text-yellow-300 uppercase">Ưu đãi nạp Vàng lần đầu:</span>{' '}
                  Nhân đôi 100% số lượng Vàng ở lượt nạp đầu tiên cho từng gói nạp Vàng!
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-yellow-400 text-slate-950 font-orbitron font-black text-xs shrink-0 shadow">
                X2 VÀNG NẠP ĐẦU
              </span>
            </div>

            {/* Grid of 7 gold packages */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOPUP_GOLD_PACKAGES.map((pkg) => {
                const isAlreadyPurchased = rechargeState.purchasedPackIds.includes(pkg.id);
                const { totalGold, isFirstBonus } = calculateGoldPackageGold(pkg, isAlreadyPurchased);

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                      pkg.isHot
                        ? 'bg-gradient-to-b from-yellow-950/40 to-slate-900/90 border-yellow-400/70 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
                        : pkg.isBestValue
                        ? 'bg-gradient-to-b from-amber-950/40 to-slate-900/90 border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : 'bg-slate-900/80 border-slate-700/80 hover:border-yellow-400/50'
                    }`}
                  >
                    {/* Badge top-right */}
                    {isFirstBonus ? (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-orbitron font-black text-[10px] shadow">
                        X2 LẦN ĐẦU
                      </div>
                    ) : pkg.badge ? (
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-orbitron font-bold text-[10px] shadow">
                        {pkg.badge}
                      </div>
                    ) : null}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{pkg.icon}</span>
                        <div>
                          <div className="font-orbitron font-bold text-white text-sm">{pkg.name}</div>
                          <div className="text-[11px] text-slate-400 font-rajdhani">
                            +{Math.floor(pkg.priceVnd / 1000)} EXP VIP
                          </div>
                        </div>
                      </div>

                      {/* Gold amount */}
                      <div className="my-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                        <div className="text-2xl font-black font-orbitron text-yellow-300 tabular-nums">
                          {totalGold.toLocaleString()} 🪙
                        </div>
                        {isFirstBonus ? (
                          <div className="text-[11px] text-emerald-400 font-rajdhani font-semibold">
                            Gốc: {pkg.baseGold.toLocaleString()} + Thưởng: {pkg.firstBonusGold.toLocaleString()} Vàng
                          </div>
                        ) : pkg.regularBonusGold > 0 ? (
                          <div className="text-[11px] text-cyan-400 font-rajdhani">
                            Tặng kèm +{pkg.regularBonusGold.toLocaleString()} Vàng
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleOpenGoldCheckout(pkg)}
                        className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5 fill-current" />
                        <span>NẠP {pkg.priceFormatted}</span>
                      </button>

                      {/* Quick 1-click test button */}
                      <button
                        onClick={() => {
                          sound.playTopUpSuccess();
                          if (onPurchaseGoldPackage) {
                            onPurchaseGoldPackage(pkg.id);
                          }
                        }}
                        title="Thanh toán thử nghiệm nhanh 1-chạm"
                        className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-yellow-400/40 text-yellow-300 font-orbitron text-[10px] font-bold cursor-pointer whitespace-nowrap transition-all"
                      >
                        1-CHẠM
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: FIRST RECHARGE REWARD */}
        {activeTab === 'first_recharge' && (
          <div className="mt-4 flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border border-amber-400/60 shadow-[0_0_35px_rgba(245,158,11,0.2)]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] mb-3 animate-pulse">
              <Gift className="w-8 h-8 text-slate-950 fill-current" />
            </div>

            <div className="text-xs font-orbitron font-bold tracking-widest text-amber-400 uppercase">
              QUÀ TẶNG TRI ÂN NẠP LẦN ĐẦU
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-orbitron text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-white mt-1">
              CHIẾN CƠ HUYỀN THOẠI BẬC S
            </h3>
            <p className="text-xs text-slate-300 font-rajdhani max-w-lg mt-1 mb-4">
              Nạp bất kỳ mệnh giá nào (từ 10.000 đ) nhận ngay Chiến cơ Huyền Thoại Bậc S cực hiếm, 10,000 Kim Cương và Huy hiệu VIP 1!
            </p>

            {/* Showcase Rewards Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-6">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-400/50 flex flex-col items-center">
                <div className="text-3xl mb-1">🚀</div>
                <div className="font-orbitron font-black text-amber-300 text-sm">CHIẾN CƠ BẬC S</div>
                <div className="text-[11px] text-slate-400 font-rajdhani">ZX-99 Thái Dương / TX-0 Kỷ Nguyên</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-400/50 flex flex-col items-center">
                <div className="text-3xl mb-1">💎</div>
                <div className="font-orbitron font-black text-amber-300 text-sm">10,000 KIM CƯƠNG</div>
                <div className="text-[11px] text-slate-400 font-rajdhani">Tương đương 50 lượt quay Gacha</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-400/50 flex flex-col items-center">
                <div className="text-3xl mb-1">👑</div>
                <div className="font-orbitron font-black text-amber-300 text-sm">ĐẶC QUYỀN VIP 1</div>
                <div className="text-[11px] text-slate-400 font-rajdhani">+5% Tốc độ bắn toàn bộ chiến cơ</div>
              </div>
            </div>

            {/* Claim Action */}
            {rechargeState.firstRechargeClaimed ? (
              <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-orbitron font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-400" />
                BẠN ĐÃ NHẬN THƯỞNG QUÀ NẠP ĐẦU THÀNH CÔNG!
              </div>
            ) : rechargeState.hasRecharged ? (
              <button
                onClick={() => {
                  sound.playTopUpSuccess();
                  onClaimFirstRecharge();
                }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-orbitron text-sm sm:text-base shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                NHẬN THƯỞNG NẠP ĐẦU NGAY!
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="text-xs text-rose-300 font-rajdhani">
                  (Bạn chưa nạp gói nào. Hãy nạp gói bất kỳ từ tab Gói Nạp để nhận quà này!)
                </div>
                <button
                  onClick={() => setActiveTab('packs')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  ĐẾN TAB NẠP NGAY
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: WEEKLY & MONTHLY PASSES */}
        {activeTab === 'passes' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Pass */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <h4 className="font-orbitron font-bold text-cyan-300 text-base">THẺ TUẦN CHIẾN BINH</h4>
                      <div className="text-xs text-slate-400 font-rajdhani">Thời hạn 7 ngày</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-orbitron font-bold">
                    26.000 đ
                  </span>
                </div>

                <div className="space-y-2 text-xs font-rajdhani text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Nhận ngay: <strong className="text-amber-300 font-orbitron">400 💎</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Mỗi ngày điểm danh nhận: <strong className="text-amber-300 font-orbitron">120 💎 x 7 ngày</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Tổng nhận: <strong className="text-amber-300 font-orbitron">1,240 💎</strong> (+26 EXP VIP)</span>
                  </div>
                </div>
              </div>

              {rechargeState.weeklyPass.active ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-orbitron text-cyan-300">
                    Đang kích hoạt: Còn <strong className="text-amber-300">{rechargeState.weeklyPass.daysRemaining}</strong> ngày
                  </div>
                  <button
                    onClick={() => {
                      sound.playTopUpSuccess();
                      onClaimPassDaily('weekly');
                    }}
                    disabled={rechargeState.weeklyPass.lastClaimDate === todayStr}
                    className={`py-2 px-3 rounded-xl font-orbitron font-bold text-xs transition-all ${
                      rechargeState.weeklyPass.lastClaimDate === todayStr
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer'
                    }`}
                  >
                    {rechargeState.weeklyPass.lastClaimDate === todayStr ? 'ĐÃ NHẬN HÔM NAY' : 'ĐIỂM DANH NHẬN 120 💎 HÔM NAY'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playTopUpSuccess();
                    onPurchasePass('weekly');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  KÍCH HOẠT THẺ TUẦN (26.000 đ)
                </button>
              )}
            </div>

            {/* Monthly Pass */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌌</span>
                    <div>
                      <h4 className="font-orbitron font-bold text-purple-300 text-base">THẺ THÁNG LƯỢNG TỬ</h4>
                      <div className="text-xs text-slate-400 font-rajdhani">Thời hạn 30 ngày (Siêu Hời x5)</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400 text-purple-300 text-[10px] font-orbitron font-bold">
                    128.000 đ
                  </span>
                </div>

                <div className="space-y-2 text-xs font-rajdhani text-slate-300 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Nhận ngay: <strong className="text-amber-300 font-orbitron">2,600 💎</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Mỗi ngày điểm danh nhận: <strong className="text-amber-300 font-orbitron">300 💎 x 30 ngày</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Tổng nhận: <strong className="text-amber-300 font-orbitron">11,600 💎</strong> (+128 EXP VIP)</span>
                  </div>
                </div>
              </div>

              {rechargeState.monthlyPass.active ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-orbitron text-purple-300">
                    Đang kích hoạt: Còn <strong className="text-amber-300">{rechargeState.monthlyPass.daysRemaining}</strong> ngày
                  </div>
                  <button
                    onClick={() => {
                      sound.playTopUpSuccess();
                      onClaimPassDaily('monthly');
                    }}
                    disabled={rechargeState.monthlyPass.lastClaimDate === todayStr}
                    className={`py-2 px-3 rounded-xl font-orbitron font-bold text-xs transition-all ${
                      rechargeState.monthlyPass.lastClaimDate === todayStr
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-purple-400 hover:bg-purple-300 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer'
                    }`}
                  >
                    {rechargeState.monthlyPass.lastClaimDate === todayStr ? 'ĐÃ NHẬN HÔM NAY' : 'ĐIỂM DANH NHẬN 300 💎 HÔM NAY'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    sound.playTopUpSuccess();
                    onPurchasePass('monthly');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  KÍCH HOẠT THẺ THÁNG (128.000 đ)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: VIP TIERS AND PRIVILEGES */}
        {activeTab === 'vip' && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="text-xs text-slate-300 font-rajdhani">
              Tích lũy điểm nạp (1.000 VNĐ = 1 EXP VIP) để thăng cấp và nhận Kim Cương cùng đặc quyền vĩnh viễn!
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {VIP_TIERS.filter((t) => t.level > 0).map((tier) => {
                const isReached = vipStatus.currentTier.level >= tier.level;
                const isClaimed = rechargeState.claimedVipTierLevels.includes(tier.level);

                return (
                  <div
                    key={tier.level}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isReached
                        ? 'bg-slate-900/90 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-orbitron font-black text-xs border ${tier.badgeColor}`}>
                            VIP {tier.level}
                          </span>
                          <span className="font-orbitron font-bold text-white text-xs">{tier.title}</span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-mono">
                          {tier.requiredExp} EXP ({(tier.requiredExp * 1000).toLocaleString()} đ)
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-rajdhani mb-2">
                        {tier.privilegeText}
                      </div>

                      <div className="text-xs font-orbitron text-amber-300">
                        Thưởng thăng cấp: <strong>+{tier.rewardGems.toLocaleString()} 💎</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800">
                      {isClaimed ? (
                        <div className="text-center text-[11px] text-emerald-400 font-orbitron font-bold flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          ĐÃ NHẬN THƯỞNG
                        </div>
                      ) : isReached ? (
                        <button
                          onClick={() => {
                            sound.playTopUpSuccess();
                            onClaimVipReward(tier.level);
                          }}
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          NHẬN THƯỞNG VIP {tier.level}
                        </button>
                      ) : (
                        <div className="text-center text-[10px] text-slate-500 font-orbitron">
                          Chưa đạt cấp (cần {tier.requiredExp - rechargeState.vipExp} EXP nữa)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: GIFTCODE REDEMPTION */}
        {activeTab === 'giftcode' && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col gap-3">
              <label htmlFor="giftcode-input" className="text-xs font-orbitron font-bold text-amber-300 uppercase">
                NHẬP MÃ QUÀ TẶNG (GIFTCODE)
              </label>
              <div className="flex gap-2">
                <input
                  id="giftcode-input"
                  type="text"
                  placeholder="Nhập mã (VD: SKYVANGUARD, VIP999...)"
                  value={giftCodeInput}
                  onChange={(e) => setGiftCodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRedeemClick();
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-orbitron uppercase text-sm focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => handleRedeemClick()}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-orbitron font-black text-xs shadow hover:scale-105 active:scale-95 cursor-pointer"
                >
                  ĐỔI MÃ
                </button>
              </div>
            </div>

            {/* List of sample valid gift codes for easy 1-click test */}
            <div>
              <div className="text-xs font-orbitron font-semibold text-slate-400 mb-2">
                MÃ GIFTCODE KHẢ DỤNG (BẤM VÀO ĐỂ NHẬN NGAY):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.values(PROMO_GIFT_CODES).map((promo) => {
                  const isClaimed = rechargeState.claimedGiftCodes.includes(promo.code);
                  return (
                    <button
                      key={promo.code}
                      onClick={() => !isClaimed && handleRedeemClick(promo.code)}
                      disabled={isClaimed}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isClaimed
                          ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                          : 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400 cursor-pointer hover:scale-[1.02]'
                      }`}
                    >
                      <div>
                        <div className="font-orbitron font-bold text-emerald-300 text-xs">
                          {promo.code}
                        </div>
                        <div className="text-[11px] text-slate-300 font-rajdhani">
                          {promo.description}
                        </div>
                      </div>
                      <span className="text-xs font-orbitron font-bold shrink-0 ml-2">
                        {isClaimed ? (
                          <span className="text-slate-500">ĐÃ DÙNG</span>
                        ) : (
                          <span className="text-emerald-400">NHẬN NGAY →</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT SHEET / CHECKOUT DIALOG MODAL */}
        {(selectedPackForCheckout || selectedGoldPackForCheckout) && (() => {
          const activePack = selectedPackForCheckout || selectedGoldPackForCheckout!;
          const isGold = !!selectedGoldPackForCheckout;
          const isAlready = rechargeState.purchasedPackIds.includes(activePack.id);

          return (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
              <div className="relative w-full max-w-md p-5 rounded-2xl bg-gradient-to-b from-[#0b172a] via-[#050b14] to-[#03070f] border border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <h3 className="font-orbitron font-bold text-white text-base">XÁC NHẬN THANH TOÁN</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPackForCheckout(null);
                      setSelectedGoldPackForCheckout(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Order Info */}
                <div className="my-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-orbitron font-bold text-white text-sm">
                      {activePack.name}
                    </div>
                    <div className="text-xs text-amber-300 font-rajdhani">
                      {isGold ? (
                        <span className="text-yellow-300 font-bold">
                          Nhận +{calculateGoldPackageGold(selectedGoldPackForCheckout!, isAlready).totalGold.toLocaleString()} 🪙 Vàng
                        </span>
                      ) : (
                        <span>
                          Nhận {calculatePackageGems(selectedPackForCheckout!, isAlready).totalGems.toLocaleString()} 💎
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-orbitron font-black text-amber-400">
                      {activePack.priceFormatted}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      +{Math.floor(activePack.priceVnd / 1000)} EXP VIP
                    </div>
                  </div>
                </div>

                {/* Payment Method Switcher */}
                <div className="grid grid-cols-3 gap-1.5 mb-3 p-1 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-orbitron font-bold">
                  <button
                    onClick={() => setPaymentMethod('fast')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === 'fast'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1-CHẠM TEST
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qr')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === 'qr'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    VIETQR / MOMO
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    THẺ CÀO
                  </button>
                </div>

                {/* Method Details */}
                {paymentMethod === 'fast' && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs font-rajdhani text-slate-300 mb-4">
                    Chế độ mô phỏng thanh toán nhanh một chạm. Nhấn xác nhận để cộng ngay {isGold ? 'Vàng' : 'Kim Cương'} và EXP VIP vào tài khoản mà không mất phí!
                  </div>
                )}

                {paymentMethod === 'qr' && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center mb-4">
                    {/* Generated QR Code Simulation Visual */}
                    <div className="w-32 h-32 bg-white p-2 rounded-xl shadow mb-2 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950 fill-current">
                        <rect width="30" height="30" x="5" y="5" />
                        <rect width="20" height="20" x="10" y="10" fill="#fff" />
                        <rect width="10" height="10" x="15" y="15" />
                        <rect width="30" height="30" x="65" y="5" />
                        <rect width="20" height="20" x="70" y="10" fill="#fff" />
                        <rect width="10" height="10" x="75" y="15" />
                        <rect width="30" height="30" x="5" y="65" />
                        <rect width="20" height="20" x="10" y="70" fill="#fff" />
                        <rect width="10" height="10" x="15" y="75" />
                        <rect width="10" height="10" x="45" y="45" />
                        <rect width="15" height="10" x="40" y="15" />
                        <rect width="10" height="15" x="15" y="40" />
                        <rect width="15" height="15" x="65" y="45" />
                        <rect width="15" height="15" x="45" y="65" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-orbitron text-amber-300">SKY VANGUARD CORP · VIETQR PRO</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Nội dung: SKY_{activePack.id.toUpperCase()}_PLAYER
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="flex flex-col gap-2 mb-4 text-xs font-rajdhani">
                    <div className="flex gap-1.5">
                      {(['viettel', 'vinaphone', 'mobifone', 'zing'] as const).map((telco) => (
                        <button
                          key={telco}
                          onClick={() => setCardTelco(telco)}
                          className={`flex-1 py-1 rounded text-[10px] font-orbitron uppercase border cursor-pointer ${
                            cardTelco === telco
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-700 text-slate-300'
                          }`}
                        >
                          {telco}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value)}
                      placeholder="Mã thẻ cào (PIN)"
                      className="p-2 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                    <input
                      type="text"
                      value={cardSerial}
                      onChange={(e) => setCardSerial(e.target.value)}
                      placeholder="Số Seri thẻ"
                      className="p-2 rounded bg-slate-950 border border-slate-700 text-white font-mono text-xs"
                    />
                    <button
                      onClick={handleAutofillCard}
                      className="text-[10px] text-amber-400 underline self-end hover:text-amber-300 cursor-pointer"
                    >
                      Tự động điền mã thẻ mẫu ngẫu nhiên
                    </button>
                  </div>
                )}

                {checkoutSuccessMessage && (
                  <div className="p-2 mb-3 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-orbitron text-center animate-bounce">
                    {checkoutSuccessMessage}
                  </div>
                )}

                {/* Submit Checkout */}
                <button
                  onClick={handleConfirmCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-orbitron font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>XÁC NHẬN THANH TOÁN ({activePack.priceFormatted})</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
