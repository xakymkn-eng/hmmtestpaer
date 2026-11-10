import test from 'node:test';
import assert from 'node:assert/strict';
import {
TOPUP_PACKAGES,
TOPUP_GOLD_PACKAGES,INITIAL_RECHARGE_STATE,
getVipStatus,
calculatePackageGems,
calculateGoldPackageGold,
executeRechargePurchase,
executeGoldRechargePurchase,
executePassPurchase,
claimPassDailyGems,
claimFirstRechargeReward,
claimVipLevelReward,
redeemGiftCode
} from './recharge.ts';

test('TOPUP_PACKAGES defines 7 balanced tiered gem packs with x2 first buy bonuses', () => {
  assert.equal(TOPUP_PACKAGES.length, 7);
  assert.equal(TOPUP_PACKAGES[0].priceVnd, 26000);
  assert.equal(TOPUP_PACKAGES[0].baseGems, 400);
  assert.equal(TOPUP_PACKAGES[0].firstBonusGems, 400); // 800 total on first buy

  const calc1st = calculatePackageGems(TOPUP_PACKAGES[0], false);
  assert.equal(calc1st.totalGems, 800);
  assert.equal(calc1st.isFirstBonus, true);

  const calc2nd = calculatePackageGems(TOPUP_PACKAGES[0], true);
  assert.equal(calc2nd.totalGems, 400);
  assert.equal(calc2nd.isFirstBonus, false);
});

test('getVipStatus calculates progressive VIP tiers from EXP', () => {
  // 0 EXP -> VIP 0
  const v0 = getVipStatus(0);
  assert.equal(v0.currentTier.level, 0);
  assert.equal(v0.nextTier?.level, 1);

  // 26 EXP (26,000 VND) -> VIP 1
  const v1 = getVipStatus(26);
  assert.equal(v1.currentTier.level, 1);
  assert.equal(v1.nextTier?.level, 2);

  // 260 EXP -> VIP 4 (>= 250 EXP)
  const v4 = getVipStatus(260);
  assert.equal(v4.currentTier.level, 4);
  assert.equal(v4.nextTier?.level, 5);

  // 5000 EXP -> VIP 8 (level 8 has next tier 9)
  const v8 = getVipStatus(5000);
  assert.equal(v8.currentTier.level, 8);
  assert.equal(v8.nextTier?.level, 9);

  // 350,000 EXP -> VIP 20 (max tier >= 300,000 EXP)
  const v20 = getVipStatus(350000);
  assert.equal(v20.currentTier.level, 20);
  assert.equal(v20.nextTier, null);
  assert.equal(v20.progressPercent, 100);
});

test('executeRechargePurchase awards gems, sets hasRecharged, and grants VIP EXP', () => {
  const initial = { ...INITIAL_RECHARGE_STATE };
  const res = executeRechargePurchase(initial, 500, 'pack_128k');

  assert.equal(res.success, true);
  // 128k pack base 2,600 + 2,600 first buy = 5,200 gems
  assert.equal(res.gemsGranted, 5200);
  assert.equal(res.newGems, 5700);
  assert.equal(res.vipExpGained, 128); // 128,000 / 1000 = 128 EXP -> reaches VIP 3!
  assert.equal(res.newState.hasRecharged, true);
  assert.ok(res.newState.purchasedPackIds.includes('pack_128k'));

  // Subsequent purchase of the same pack gives regular bonus
  const res2 = executeRechargePurchase(res.newState, res.newGems, 'pack_128k');
  assert.equal(res2.success, true);
  // 2,600 base + 150 regular bonus = 2,750 gems
  assert.equal(res2.gemsGranted, 2750);
  assert.equal(res2.newState.vipExp, 256); // 128 + 128 = 256 -> reaches VIP 4!
});

test('claimFirstRechargeReward requires topup first, gives S-Tier fighter and 10k gems once', () => {
  const initial = { ...INITIAL_RECHARGE_STATE };

  // Fail before recharging
  const failRes = claimFirstRechargeReward(initial, 1000, []);
  assert.equal(failRes.success, false);

  // Recharge first
  const rechargedState = { ...initial, hasRecharged: true };
  const successRes = claimFirstRechargeReward(rechargedState, 1000, []);
  assert.equal(successRes.success, true);
  assert.equal(successRes.rewardFighterId, 'solaris');
  assert.equal(successRes.gemsGranted, 10000);
  assert.equal(successRes.newGems, 11000);
  assert.equal(successRes.newState.firstRechargeClaimed, true);

  // Cannot claim again
  const doubleClaim = claimFirstRechargeReward(successRes.newState, 11000, ['solaris']);
  assert.equal(doubleClaim.success, false);
});

test('Weekly and Monthly Passes grant instant gems and daily claims with cooldown', () => {
  const initial = { ...INITIAL_RECHARGE_STATE };
  const passRes = executePassPurchase(initial, 0, 'monthly');
  assert.equal(passRes.success, true);
  assert.equal(passRes.gemsGranted, 2600);
  assert.equal(passRes.newState.monthlyPass.active, true);
  assert.equal(passRes.newState.monthlyPass.daysRemaining, 30);

  // Daily claim today
  const claimRes = claimPassDailyGems(passRes.newState, passRes.newGems, 'monthly', '2026-10-23');
  assert.equal(claimRes.success, true);
  assert.equal(claimRes.gemsClaimed, 300);
  assert.equal(claimRes.newGems, 2900);
  assert.equal(claimRes.newState.monthlyPass.daysRemaining, 29);

  // Cannot claim twice on same date
  const failTwice = claimPassDailyGems(claimRes.newState, claimRes.newGems, 'monthly', '2026-10-23');
  assert.equal(failTwice.success, false);

  // Can claim next day
  const nextDay = claimPassDailyGems(claimRes.newState, claimRes.newGems, 'monthly', '2026-10-24');
  assert.equal(nextDay.success, true);
  assert.equal(nextDay.newState.monthlyPass.daysRemaining, 28);
});

test('claimVipLevelReward enforces VIP tier requirement and prevents duplicates', () => {
  const stateAtVip1 = { ...INITIAL_RECHARGE_STATE, vipExp: 30 }; // VIP 1 (req 26)
  const res1 = claimVipLevelReward(stateAtVip1, 0, 1);
  assert.equal(res1.success, true);
  assert.equal(res1.gemsGranted, 400);
  assert.ok(res1.newState.claimedVipTierLevels.includes(1));

  // Cannot claim again
  const doubleClaim = claimVipLevelReward(res1.newState, 400, 1);
  assert.equal(doubleClaim.success, false);

  // Cannot claim VIP 2 yet (needs 68 EXP)
  const premature = claimVipLevelReward(res1.newState, 400, 2);
  assert.equal(premature.success, false);
});

test('redeemGiftCode validates promo codes, grants gems & VIP EXP, rejects invalid/used codes', () => {
  const initial = { ...INITIAL_RECHARGE_STATE };

  // Invalid code
  const invalid = redeemGiftCode(initial, 100, 'INVALID123');
  assert.equal(invalid.success, false);

  // Valid code SKYVANGUARD
  const valid = redeemGiftCode(initial, 100, 'skyvanguard');
  assert.equal(valid.success, true);
  assert.equal(valid.gemsGranted, 5000);
  assert.equal(valid.newGems, 5100);
  assert.equal(valid.vipExpGranted, 10);
  assert.ok(valid.newState.claimedGiftCodes.includes('SKYVANGUARD'));

  // Cannot use same code again
  const duplicate = redeemGiftCode(valid.newState, 5100, 'SKYVANGUARD');
  assert.equal(duplicate.success, false);
});

test('TOPUP_GOLD_PACKAGES defines 7 tiered gold packs with x2 first buy bonuses and purchase execution', () => {
  assert.equal(TOPUP_GOLD_PACKAGES.length, 7);
  const pack1 = TOPUP_GOLD_PACKAGES[0];
  assert.equal(pack1.priceVnd, 26000);
  assert.equal(pack1.baseGold, 500000);
  assert.equal(pack1.firstBonusGold, 500000); // 1,000,000 total on first buy

  // First purchase calculation
  const calc1st = calculateGoldPackageGold(pack1, false);
  assert.equal(calc1st.totalGold, 1000000);
  assert.equal(calc1st.isFirstBonus, true);

  // Subsequent purchase calculation
  const calc2nd = calculateGoldPackageGold(pack1, true);
  assert.equal(calc2nd.totalGold, 550000); // 500k + 50k
  assert.equal(calc2nd.isFirstBonus, false);

  // Execution: awards gold and VIP EXP
  const buyRes = executeGoldRechargePurchase(INITIAL_RECHARGE_STATE, 200000, pack1.id);
  assert.equal(buyRes.success, true);
  assert.equal(buyRes.goldGranted, 1000000);
  assert.equal(buyRes.newGold, 1200000);
  assert.equal(buyRes.vipExpGained, 26);
  assert.equal(buyRes.newState.hasRecharged, true);
  assert.ok(buyRes.newState.purchasedPackIds.includes(pack1.id));
});
