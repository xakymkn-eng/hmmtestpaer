import test from 'node:test';
import assert from 'node:assert/strict';
import {
INITIAL_MAILS,
getUnclaimedMailCount,markMailAsRead,
claimMailReward,
claimAllMails,
deleteClaimedMails,
checkAndDispatchHourlyMails
} from './mail.ts';

test('INITIAL_MAILS contains starter welcome mail with exactly 5,000 gems', () => {
  const welcomeMail = INITIAL_MAILS.find((m) => m.id === 'mail_starter_welcome');
  assert.ok(welcomeMail, 'Starter welcome mail should exist');
  assert.equal(welcomeMail.isClaimed, false);
  assert.equal(welcomeMail.isRead, false);

  const gemReward = welcomeMail.rewards.find((r) => r.type === 'gems');
  assert.ok(gemReward, 'Must include gem reward');
  assert.equal(gemReward.amount, 5000, 'Starter mail must give 5,000 gems');
});

test('getUnclaimedMailCount correctly counts unclaimed mails with rewards', () => {
  const count = getUnclaimedMailCount(INITIAL_MAILS);
  assert.equal(count, 1, 'Only starter mail has unclaimed rewards');
});

test('markMailAsRead marks mail as read without altering claim status', () => {
  const updated = markMailAsRead(INITIAL_MAILS, 'mail_starter_welcome');
  const target = updated.find((m) => m.id === 'mail_starter_welcome');
  assert.equal(target?.isRead, true);
  assert.equal(target?.isClaimed, false);
});

test('claimMailReward claims 5,000 gems and marks mail as read and claimed', () => {
  const res = claimMailReward(INITIAL_MAILS, 'mail_starter_welcome');
  assert.equal(res.success, true);
  assert.equal(res.claimedGems, 5000);

  const claimed = res.updatedMails.find((m) => m.id === 'mail_starter_welcome');
  assert.equal(claimed?.isClaimed, true);
  assert.equal(claimed?.isRead, true);

  // Re-claiming fails
  const reClaim = claimMailReward(res.updatedMails, 'mail_starter_welcome');
  assert.equal(reClaim.success, false);
  assert.equal(reClaim.claimedGems, 0);
});

test('claimAllMails claims all eligible mails at once', () => {
  const res = claimAllMails(INITIAL_MAILS);
  assert.equal(res.totalClaimedGems, 5000);
  assert.equal(res.claimedCount, 1);
  assert.equal(getUnclaimedMailCount(res.updatedMails), 0);
});

test('deleteClaimedMails removes claimed and read mails', () => {
  const res = claimAllMails(INITIAL_MAILS);
  const remaining = deleteClaimedMails(res.updatedMails);
  // Starter mail was claimed and read, so it gets removed.
  // System intel mail was not read yet, so it remains.
  assert.equal(remaining.some((m) => m.id === 'mail_starter_welcome'), false);
});

test('checkAndDispatchHourlyMails dispatches new random mail when 1 hour has elapsed', () => {
  const baseTime = 1700000000000;
  const oneHourLater = baseTime + 3600000;

  // Under 1 hour -> no mail dispatched
  const underHour = checkAndDispatchHourlyMails(INITIAL_MAILS, baseTime, baseTime + 1800000);
  assert.equal(underHour.newMailsGenerated, 0);
  assert.equal(underHour.updatedMails.length, INITIAL_MAILS.length);

  // Exactly 1 hour later -> 1 new mail dispatched with Gold and Gems
  const atHour = checkAndDispatchHourlyMails(INITIAL_MAILS, baseTime, oneHourLater);
  assert.equal(atHour.newMailsGenerated, 1);
  assert.equal(atHour.updatedMails.length, INITIAL_MAILS.length + 1);

  const newMail = atHour.updatedMails[0];
  assert.equal(newMail.tag, 'hourly');
  assert.equal(newMail.isClaimed, false);
  assert.ok(newMail.rewards.length > 0);

  // Claiming the new hourly mail grants both Gold and Gems
  const claimRes = claimMailReward(atHour.updatedMails, newMail.id);
  assert.equal(claimRes.success, true);
  assert.ok(claimRes.claimedGold > 0 || claimRes.claimedGems > 0);
});

